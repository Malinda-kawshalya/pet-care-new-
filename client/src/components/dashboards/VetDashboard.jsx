import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarClock, ClipboardPlus, HeartPulse, MessageCircle, UserRound } from "lucide-react";
import api from "../../services/api.js";
import DashboardSidebar from "../DashboardSidebar.jsx";
import { useAuth } from "../../hooks/useAuth.js";

function toDate(value) {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
}

function isToday(value) {
  const date = toDate(value);
  if (!date) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function inNextSevenDays(value) {
  const date = toDate(value);
  if (!date) return false;
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  return date >= now && date <= nextWeek;
}

export default function VetDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = user?._id || user?.id;

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [appointmentsRes, recordsRes, messagesRes] = await Promise.all([
        api.get("/appointments"),
        api.get("/medical-records"),
        api.get("/messages")
      ]);
      setAppointments(appointmentsRes.data.items || []);
      setRecords(recordsRes.data.items || []);
      setThreads(messagesRes.data.items || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load veterinarian dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = useMemo(() => {
    const todayAppointments = appointments.filter((item) => isToday(item.scheduledAt));
    const patientIds = new Set(
      appointments.map((item) => item.pet?._id || item.pet).filter(Boolean).map((id) => String(id))
    );
    const unreadMessages = threads.filter(
      (item) => String(item.receiver?._id || item.receiver) === String(userId) && !item.readAt
    ).length;

    return {
      todayAppointments: todayAppointments.length,
      activePatients: patientIds.size,
      recordsCount: records.length,
      unreadMessages
    };
  }, [appointments, records, threads, userId]);

  const todaySchedule = useMemo(() => {
    return appointments
      .filter((item) => isToday(item.scheduledAt))
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((item) => inNextSevenDays(item.scheduledAt))
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
      .slice(0, 8);
  }, [appointments]);

  const patients = useMemo(() => {
    const map = new Map();
    appointments.forEach((appointment) => {
      const petId = String(appointment.pet?._id || appointment.pet || "");
      if (!petId) return;
      if (!map.has(petId)) {
        map.set(petId, {
          petId,
          petName: appointment.pet?.name || "Pet",
          species: appointment.pet?.species || "-",
          breed: appointment.pet?.breed || "Unknown",
          ownerName: appointment.owner?.name || "Owner"
        });
      }
    });
    return Array.from(map.values()).slice(0, 8);
  }, [appointments]);

  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.visitDate || b.createdAt) - new Date(a.visitDate || a.createdAt))
      .slice(0, 6);
  }, [records]);

  const inbox = useMemo(() => {
    return threads
      .filter((item) => String(item.receiver?._id || item.receiver) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }, [threads, userId]);

  const updateAppointment = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}`, { status });
      await loadDashboard();
    } catch (updateError) {
      setError(updateError.response?.data?.message || "Failed to update appointment.");
    }
  };

  return (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar />
      <div className="dashboard-container">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">Veterinarian workspace</p>
            <h1>Veterinarian Dashboard</h1>
            <p>Track provider appointments, patient context, records, and communication from one place.</p>
          </div>
          <div className="dashboard-actions">
            <button className="btn-primary" type="button" onClick={() => navigate("/appointments")}>
              <CalendarClock size={16} /> Open appointments
            </button>
            <Link className="btn-small" to="/medical-records">Medical records</Link>
          </div>
        </div>

        {error && <div className="form-alert error">{error}</div>}

        <div className="dashboard-grid">
          <div className="stats-section">
            <div className="stat-card">
              <h3>{loading ? "..." : summary.todayAppointments}</h3>
              <p>Appointments today</p>
            </div>
            <div className="stat-card">
              <h3>{loading ? "..." : summary.activePatients}</h3>
              <p>Active patients</p>
            </div>
            <div className="stat-card">
              <h3>{loading ? "..." : summary.recordsCount}</h3>
              <p>Total records</p>
            </div>
            <div className="stat-card">
              <h3>{loading ? "..." : summary.unreadMessages}</h3>
              <p>Unread messages</p>
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h2>Today schedule</h2>
              <button className="btn-small" type="button" onClick={loadDashboard}>Refresh</button>
            </div>
            <div className="schedule-list">
              {!loading && todaySchedule.length === 0 && <p>No appointments scheduled for today.</p>}
              {todaySchedule.map((appointment) => (
                <div key={appointment._id} className="schedule-item">
                  <div className="appointment-details">
                    <h3>{appointment.pet?.name || "Pet"}</h3>
                    <p>{new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    <p>{appointment.owner?.name || "Owner"} • {appointment.serviceType}</p>
                  </div>
                  <span className={`status ${appointment.status}`}>{appointment.status}</span>
                  <div className="appointment-actions">
                    <button className="btn-small" type="button" onClick={() => updateAppointment(appointment._id, "confirmed")}>Confirm</button>
                    <button className="btn-small" type="button" onClick={() => updateAppointment(appointment._id, "completed")}>Complete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h2>Patient list</h2>
              <Link className="link" to="/pets">Open pets</Link>
            </div>
            <div className="patients-list">
              {!loading && patients.length === 0 && <p>No patient records available yet.</p>}
              {patients.map((patient) => (
                <div key={patient.petId} className="patient-card">
                  <div className="patient-info">
                    <h3>{patient.petName}</h3>
                    <p>{patient.breed} • {patient.species}</p>
                    <p>Owner: {patient.ownerName}</p>
                  </div>
                  <div className="patient-actions">
                    <button className="btn-small" type="button" onClick={() => navigate("/medical-records")}>View records</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h2>Recent medical records</h2>
              <Link className="btn-small" to="/medical-records">Add record</Link>
            </div>
            <div className="records-list">
              {!loading && recentRecords.length === 0 && <p>No records available.</p>}
              {recentRecords.map((record) => (
                <div className="record-item" key={record._id}>
                  <span className="record-type">{record.pet?.name || "Pet"}</span>
                  <span>{record.diagnosis || "No diagnosis added"}</span>
                  <span className="date">{new Date(record.visitDate || record.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="widget quick-actions">
            <div className="widget-header">
              <h2>Communication</h2>
              <MessageCircle size={18} />
            </div>
            <div className="appointments-list">
              {!loading && inbox.length === 0 && <p>No inbound messages right now.</p>}
              {inbox.map((message) => (
                <div key={message._id} className="appointment-card">
                  <div className="appointment-info">
                    <h3><UserRound size={14} /> {message.sender?.name || "User"}</h3>
                    <p>{message.body}</p>
                    <p>{new Date(message.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`status ${message.readAt ? "completed" : "pending"}`}>{message.readAt ? "Read" : "Unread"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h2>Upcoming 7 days</h2>
              <HeartPulse size={18} />
            </div>
            <div className="upcoming-list">
              {!loading && upcomingAppointments.length === 0 && <p>No upcoming appointments in the next 7 days.</p>}
              {upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="upcoming-item">
                  <span className="date">{new Date(appointment.scheduledAt).toLocaleDateString()}</span>
                  <span>{appointment.pet?.name || "Pet"} - {appointment.owner?.name || "Owner"}</span>
                  <span>{new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h2>Clinical tools</h2>
              <ClipboardPlus size={18} />
            </div>
            <div className="actions-grid">
              <Link className="action-btn action-btn-link" to="/medical-records">Add medical note</Link>
              <Link className="action-btn action-btn-link" to="/appointments">Manage schedule</Link>
              <Link className="action-btn action-btn-link" to="/messages">Open messages</Link>
              <Link className="action-btn action-btn-link" to="/account">Provider profile</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
