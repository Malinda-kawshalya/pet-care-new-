import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import api from "../../services/api.js";
import DashboardSidebar from "../DashboardSidebar.jsx";
import { useAuth } from "../../hooks/useAuth.js";

const dashboardSections = {
  overview: {
    eyebrow: "Veterinarian workspace",
    title: "Veterinarian Dashboard",
    description: "Track provider appointments, patient context, records, and communication from one place."
  },
  appointments: {
    eyebrow: "Appointments",
    title: "Appointments",
    description: "Review today's schedule and upcoming visits without leaving the veterinarian dashboard."
  },
  patients: {
    eyebrow: "Patients",
    title: "Patients",
    description: "Browse owners, pets, vaccination status, and the latest care context."
  },
  records: {
    eyebrow: "Medical records",
    title: "Medical Records",
    description: "Review recent records and add new care notes for your patients."
  }
};

const sectionKeys = new Set(Object.keys(dashboardSections));

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
  const location = useLocation();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recordTarget, setRecordTarget] = useState(null);
  const [recordForm, setRecordForm] = useState({ pet: "", diagnosis: "", treatment: "", prescriptions: "", vetNotes: "" });
  const [recordSubmitting, setRecordSubmitting] = useState(false);

  const userId = user?._id || user?.id;
  const sectionParam = new URLSearchParams(location.search).get("section");
  const activeSection = sectionParam && sectionKeys.has(sectionParam) ? sectionParam : "overview";
  const pageCopy = dashboardSections[activeSection];
  const isOverview = activeSection === "overview";

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [appointmentsRes, recordsRes, messagesRes, petsRes] = await Promise.all([
        api.get("/appointments"),
        api.get("/medical-records"),
        api.get("/messages"),
        api.get("/pets")
      ]);
      setAppointments(appointmentsRes.data.items || []);
      setRecords(recordsRes.data.items || []);
      setThreads(messagesRes.data.items || []);
      setPets(petsRes.data.items || []);
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
    const patientIds = new Set(pets.map((item) => String(item._id)));
    const unreadMessages = threads.filter(
      (item) => String(item.receiver?._id || item.receiver) === String(userId) && !item.readAt
    ).length;

    return {
      todayAppointments: todayAppointments.length,
      activePatients: patientIds.size,
      recordsCount: records.length,
      unreadMessages
    };
  }, [appointments, records, threads, pets, userId]);

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
    const recordMap = new Map();
    records.forEach((record) => {
      const petId = String(record.pet?._id || record.pet || "");
      if (petId) recordMap.set(petId, record);
    });

    const ownerMap = new Map();
    pets.forEach((pet) => {
      const ownerId = String(pet.owner?._id || pet.owner?.id || pet.owner || "unknown");
      if (!ownerMap.has(ownerId)) {
        ownerMap.set(ownerId, {
          ownerId,
          ownerName: pet.owner?.name || pet.owner?.firstName || "Owner",
          ownerEmail: pet.owner?.email || "",
          pets: []
        });
      }

      ownerMap.get(ownerId).pets.push({
        petId: String(pet._id),
        petName: pet.name || "Pet",
        species: pet.species || "-",
        breed: pet.breed || "Unknown",
        vaccinationStatus: pet.vaccinationStatus || "unknown",
        latestRecord: recordMap.get(String(pet._id)) || null
      });
    });

    return Array.from(ownerMap.values()).sort((a, b) => a.ownerName.localeCompare(b.ownerName));
  }, [pets, records]);

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

  const openRecordComposer = (pet) => {
    setRecordTarget(pet);
    setRecordForm({ pet: pet.petId, diagnosis: "", treatment: "", prescriptions: "", vetNotes: "" });
  };

  const closeRecordComposer = () => {
    setRecordTarget(null);
  };

  const submitRecord = async (event) => {
    event.preventDefault();
    if (!recordForm.pet) return;

    setRecordSubmitting(true);
    setError("");

    try {
      await api.post("/medical-records", {
        pet: recordForm.pet,
        diagnosis: recordForm.diagnosis,
        treatment: recordForm.treatment,
        prescriptions: recordForm.prescriptions
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        vetNotes: recordForm.vetNotes
      });
      await loadDashboard();
      closeRecordComposer();
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Failed to save medical record.");
    } finally {
      setRecordSubmitting(false);
    }
  };

  const renderStats = () => (
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
  );

  const renderAppointments = () => (
    <>
      <div className="widget" id="appointments">
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
                <p>{appointment.owner?.name || "Owner"} - {appointment.serviceType}</p>
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

      <div className="widget" id="upcoming">
        <div className="widget-header">
          <h2>Upcoming appointments</h2>
          <button className="btn-small" type="button" onClick={loadDashboard}>Refresh</button>
        </div>
        <div className="upcoming-list">
          {!loading && upcomingAppointments.length === 0 && <p>No upcoming appointments in the next 7 days.</p>}
          {upcomingAppointments.map((appointment) => (
            <div key={appointment._id} className="upcoming-item">
              <div className="appointment-info">
                <h3>{appointment.pet?.name || "Pet"}</h3>
                <p>{new Date(appointment.scheduledAt).toLocaleDateString()} at {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                <p>{appointment.owner?.name || "Owner"}</p>
              </div>
              <span className={`status ${appointment.status}`}>{appointment.status}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderPatients = () => (
    <div className="widget" id="patients">
      <div className="widget-header">
        <h2>Patients</h2>
        <Link className="link" to="/pets">Open pets</Link>
      </div>
      <div className="patients-list" style={{ display: "grid", gap: 16 }}>
        {!loading && patients.length === 0 && <p>No patient records available yet.</p>}
        {patients.map((owner) => (
          <article key={owner.ownerId} className="patient-card" style={{ display: "grid", gap: 12, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0 }}>{owner.ownerName}</h3>
                <p style={{ margin: "4px 0 0", color: "var(--shell-muted)" }}>{owner.ownerEmail || "No email"}</p>
              </div>
              <span className="status approved">{owner.pets.length} pets</span>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {owner.pets.map((pet) => (
                <div
                  key={pet.petId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: 14,
                    background: "#f8fafc",
                    border: "1px solid rgba(148, 163, 184, 0.16)"
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0 }}>{pet.petName}</h4>
                    <p style={{ margin: "4px 0 0", color: "var(--shell-muted)" }}>{pet.breed} - {pet.species}</p>
                    <p style={{ margin: "4px 0 0", color: "var(--shell-muted)", fontSize: 13 }}>
                      Latest record: {pet.latestRecord?.diagnosis || pet.latestRecord?.type || "None yet"}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
                    <button className="btn-small" type="button" onClick={() => navigate(`/medical-records?petId=${pet.petId}`)}>
                      View records
                    </button>
                    <button className="btn-small" type="button" onClick={() => openRecordComposer(pet)}>
                      Add record
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="widget" id="records">
      <div className="widget-header">
        <h2>Recent medical records</h2>
        <Link className="btn-small" to="/medical-records">Add record</Link>
      </div>
      <div className="records-list">
        {!loading && recentRecords.length === 0 && <p>No records available.</p>}
        {recentRecords.map((record) => (
          <div key={record._id} className="record-item">
            <div className="record-info">
              <h3>{record.diagnosis || record.type || "Medical record"}</h3>
              <p>{record.pet?.name || "Pet"}</p>
              <p className="note">{record.vetNotes || record.notes || record.treatment || "No notes added."}</p>
            </div>
            <span className="date">{new Date(record.visitDate || record.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="widget" id="messages">
      <div className="widget-header">
        <h2>Messages inbox</h2>
        <Link className="link" to="/messages">Open all</Link>
      </div>
      <div className="inbox-list">
        {!loading && inbox.length === 0 && <p>No messages.</p>}
        {inbox.map((thread) => (
          <div key={thread._id} className="message-item">
            <div className="message-info">
              <h3>{thread.sender?.name || "Sender"}</h3>
              <p>{thread.lastMessage || "Click to view conversation."}</p>
            </div>
            <span className="timestamp">{new Date(thread.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDashboardContent = () => {
    if (activeSection === "appointments") return renderAppointments();
    if (activeSection === "patients") return renderPatients();
    if (activeSection === "records") return renderRecords();

    return (
      <>
        {renderStats()}
        {renderAppointments()}
        {renderPatients()}
        {renderRecords()}
        {renderMessages()}
      </>
    );
  };

  return (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar />
      <div className="dashboard-container">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">{pageCopy.eyebrow}</p>
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.description}</p>
          </div>
          {isOverview && (
            <div className="dashboard-actions">
              <button className="btn-primary" type="button" onClick={() => navigate("/dashboard/vet?section=appointments")}>
                <CalendarClock size={16} /> Open appointments
              </button>
              <Link className="btn-small" to="/dashboard/vet?section=records">Medical records</Link>
            </div>
          )}
        </div>

        {error && <div className="form-alert error">{error}</div>}

        <div className="dashboard-grid">
          {renderDashboardContent()}
        </div>

        {recordTarget && (
          <div className="request-modal-backdrop" onClick={closeRecordComposer} role="presentation">
            <div className="request-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="record-composer-title">
              <div className="request-modal-header">
                <div>
                  <p className="eyebrow">Medical record</p>
                  <h2 id="record-composer-title">Add record for {recordTarget.petName}</h2>
                </div>
                <button className="ghost-button compact" type="button" onClick={closeRecordComposer}>Close</button>
              </div>

              <form className="request-modal-form" onSubmit={submitRecord}>
                <input value={recordForm.pet} readOnly />
                <input
                  placeholder="Diagnosis"
                  value={recordForm.diagnosis}
                  onChange={(event) => setRecordForm({ ...recordForm, diagnosis: event.target.value })}
                  required
                />
                <textarea
                  rows={3}
                  placeholder="Treatment"
                  value={recordForm.treatment}
                  onChange={(event) => setRecordForm({ ...recordForm, treatment: event.target.value })}
                />
                <input
                  placeholder="Prescriptions, comma separated"
                  value={recordForm.prescriptions}
                  onChange={(event) => setRecordForm({ ...recordForm, prescriptions: event.target.value })}
                />
                <textarea
                  rows={4}
                  placeholder="Vet notes"
                  value={recordForm.vetNotes}
                  onChange={(event) => setRecordForm({ ...recordForm, vetNotes: event.target.value })}
                />
                <div className="request-modal-actions">
                  <button className="primary-button" type="submit" disabled={recordSubmitting}>
                    {recordSubmitting ? "Saving..." : "Save medical record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
