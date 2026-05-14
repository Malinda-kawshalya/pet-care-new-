import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, MessageCircle, Scissors, Sparkles } from "lucide-react";
import api from "../../services/api.js";
import DashboardSidebar from "../DashboardSidebar.jsx";
import { useAuth } from "../../hooks/useAuth.js";

function isToday(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export default function GroomerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = user?._id || user?.id;

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [meRes, appointmentsRes, messagesRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/appointments"),
        api.get("/messages")
      ]);
      const account = meRes.data.user || meRes.data;
      setProfile(account);
      setAppointments(appointmentsRes.data.items || []);
      setThreads(messagesRes.data.items || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load groomer dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const todayAppointments = useMemo(
    () => appointments.filter((appointment) => isToday(appointment.scheduledAt)),
    [appointments]
  );

  const upcomingAppointments = useMemo(
    () => [...appointments]
      .filter((appointment) => new Date(appointment.scheduledAt) >= new Date())
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
      .slice(0, 10),
    [appointments]
  );

  const unreadMessages = useMemo(
    () => threads.filter((message) => String(message.receiver?._id || message.receiver) === String(userId) && !message.readAt),
    [threads, userId]
  );

  const recentCustomerMessages = useMemo(
    () => threads
      .filter((message) => String(message.receiver?._id || message.receiver) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6),
    [threads, userId]
  );

  const serviceList = useMemo(() => {
    const specialties = profile?.providerProfile?.specialties || [];
    return specialties.map((specialty, index) => ({ id: `${specialty}-${index}`, name: specialty }));
  }, [profile]);

  const summary = useMemo(() => ({
    today: todayAppointments.length,
    upcoming: upcomingAppointments.length,
    pending: appointments.filter((appointment) => appointment.status === "pending").length,
    unread: unreadMessages.length
  }), [todayAppointments, upcomingAppointments, appointments, unreadMessages]);

  const updateAppointment = async (id, status) => {
    setError("");
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
      <section className="groomer-shell-modern">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">Groomer workspace</p>
            <h1>Groomer Dashboard</h1>
            <p>Manage service bookings, stay on top of client messages, and keep your service profile updated.</p>
          </div>
          <div className="dashboard-actions">
            <Link className="btn-primary" to="/appointments"><CalendarClock size={16} /> Open appointments</Link>
            <Link className="btn-small" to="/account">Update business profile</Link>
          </div>
        </div>

        {error && <div className="form-alert error">{error}</div>}

        <div className="dashboard-grid">
          <div className="stats-section">
            <div className="stat-card">
              <h3>{loading ? "..." : summary.today}</h3>
              <p>Appointments today</p>
            </div>
            <div className="stat-card">
              <h3>{loading ? "..." : summary.upcoming}</h3>
              <p>Upcoming bookings</p>
            </div>
            <div className="stat-card">
              <h3>{loading ? "..." : summary.pending}</h3>
              <p>Pending confirmations</p>
            </div>
            <div className="stat-card">
              <h3>{loading ? "..." : summary.unread}</h3>
              <p>Unread messages</p>
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h2>Today appointments</h2>
              <button className="btn-small" type="button" onClick={loadDashboard}>Refresh</button>
            </div>
            <div className="appointments-list">
              {!loading && todayAppointments.length === 0 && <p>No appointments scheduled for today.</p>}
              {todayAppointments.map((appointment) => (
                <div key={appointment._id} className="appointment-item">
                  <div className="appointment-time">
                    <h3>{new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</h3>
                  </div>
                  <div className="appointment-info">
                    <h3>{appointment.pet?.name || "Pet"}</h3>
                    <p>{appointment.owner?.name || "Owner"}</p>
                    <p>{appointment.serviceType}</p>
                    <p>{appointment.location || "Location not set"}</p>
                  </div>
                  <div className="appointment-actions">
                    <button className="btn-small" type="button" onClick={() => updateAppointment(appointment._id, "confirmed")}>Confirm</button>
                    <button className="btn-small" type="button" onClick={() => updateAppointment(appointment._id, "completed")}>Complete</button>
                    <button className="btn-small" type="button" onClick={() => updateAppointment(appointment._id, "cancelled")}>Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h2>Service profile</h2>
              <Scissors size={18} />
            </div>
            <div className="services-list">
              <div className="service-item">
                <span>Business name</span>
                <span>{profile?.providerProfile?.businessName || "Not provided"}</span>
              </div>
              <div className="service-item">
                <span>Service area</span>
                <span>{profile?.providerProfile?.serviceArea || "Not provided"}</span>
              </div>
              {serviceList.length === 0 && <p>No specialties listed. Add specialties in your account profile.</p>}
              {serviceList.map((service) => (
                <div key={service.id} className="service-item">
                  <span>{service.name}</span>
                  <span className="price">Active</span>
                </div>
              ))}
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h2>Recent customer messages</h2>
              <Link className="btn-small" to="/messages">Open inbox</Link>
            </div>
            <div className="reviews-list">
              {!loading && recentCustomerMessages.length === 0 && <p>No incoming customer messages yet.</p>}
              {recentCustomerMessages.map((message) => (
                <div key={message._id} className="review-item">
                  <div className="rating">
                    <MessageCircle size={16} /> {message.sender?.name || "Customer"}
                  </div>
                  <p>{message.body}</p>
                  <span className="reviewer">{new Date(message.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="widget quick-actions">
            <h2>Quick actions</h2>
            <div className="actions-grid">
              <Link className="action-btn action-btn-link" to="/appointments">Manage schedule</Link>
              <Link className="action-btn action-btn-link" to="/messages">Reply to customers</Link>
              <Link className="action-btn action-btn-link" to="/account">Update specialties</Link>
              <Link className="action-btn action-btn-link" to="/community">Share grooming tips</Link>
              <Link className="action-btn action-btn-link" to="/notifications">Check alerts</Link>
              <Link className="action-btn action-btn-link" to="/dashboard">Refresh workspace</Link>
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h2>Upcoming queue</h2>
              <Sparkles size={18} />
            </div>
            <div className="upcoming-list">
              {!loading && upcomingAppointments.length === 0 && <p>No upcoming bookings.</p>}
              {upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="upcoming-item">
                  <span className="date">{new Date(appointment.scheduledAt).toLocaleDateString()}</span>
                  <span>{appointment.pet?.name || "Pet"} - {appointment.owner?.name || "Owner"}</span>
                  <span className={`status ${appointment.status}`}>{appointment.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
