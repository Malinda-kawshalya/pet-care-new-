import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarClock, Edit2, MessageCircle, PlusCircle, Save, Scissors, Sparkles, Trash2, X, LayoutGrid, Clock, Wrench, AlertCircle, Check, Clock4 } from "lucide-react";
import api from "../../services/api.js";
import DashboardSidebar from "../DashboardSidebar.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { formatLKR } from "../../utils/currency.js";

const emptyServiceForm = {
  name: "",
  category: "Grooming",
  description: "",
  price: "",
  durationMinutes: "60",
  isActive: true
};

function isToday(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export default function GroomerDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [threads, setThreads] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [editingServiceId, setEditingServiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState(() => searchParams.get("section") || "overview");

  const userId = user?._id || user?.id;

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [meRes, appointmentsRes, messagesRes, servicesRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/appointments"),
        api.get("/messages"),
        api.get("/groomer-services/mine")
      ]);
      const account = meRes.data.user || meRes.data;
      setProfile(account);
      setAppointments(appointmentsRes.data.items || []);
      setThreads(messagesRes.data.items || []);
      setServices(servicesRes.data.items || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load groomer dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const section = searchParams.get("section") || "overview";
    setActiveSection(section);
  }, [searchParams]);

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

  const summary = useMemo(() => ({
    today: todayAppointments.length,
    upcoming: upcomingAppointments.length,
    pending: appointments.filter((appointment) => appointment.status === "pending").length,
    unread: unreadMessages.length,
    activeServices: services.filter((service) => service.isActive).length
  }), [todayAppointments, upcomingAppointments, appointments, unreadMessages, services]);

  const updateAppointment = async (id, status) => {
    setError("");
    try {
      await api.patch(`/appointments/${id}`, { status });
      await loadDashboard();
    } catch (updateError) {
      setError(updateError.response?.data?.message || "Failed to update appointment.");
    }
  };

  const resetServiceForm = () => {
    setServiceForm(emptyServiceForm);
    setEditingServiceId("");
  };

  const submitService = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      ...serviceForm,
      price: serviceForm.price === "" ? 0 : Number(serviceForm.price),
      durationMinutes: serviceForm.durationMinutes === "" ? 60 : Number(serviceForm.durationMinutes)
    };

    try {
      if (editingServiceId) {
        await api.put(`/groomer-services/${editingServiceId}`, payload);
        setSuccess("Service updated.");
      } else {
        await api.post("/groomer-services", payload);
        setSuccess("Service added.");
      }
      resetServiceForm();
      await loadDashboard();
    } catch (serviceError) {
      setError(serviceError.response?.data?.message || "Failed to save service.");
    }
  };

  const startEditService = (service) => {
    setEditingServiceId(service._id);
    setServiceForm({
      name: service.name || "",
      category: service.category || "Grooming",
      description: service.description || "",
      price: service.price ?? "",
      durationMinutes: service.durationMinutes ?? "60",
      isActive: service.isActive !== false
    });
    document.getElementById("groomer-services")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const deleteService = async (service) => {
    if (!window.confirm(`Delete service "${service.name}"?`)) return;
    setError("");
    setSuccess("");

    try {
      await api.delete(`/groomer-services/${service._id}`);
      if (editingServiceId === service._id) resetServiceForm();
      setSuccess("Service deleted.");
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Failed to delete service.");
    }
  };

  const sections = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "appointments", label: "Appointments", icon: Clock },
    { id: "services", label: "Services", icon: Wrench }
  ];

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
            <Link className="btn-primary" to="/appointments"><CalendarClock size={16} /> Full Schedule</Link>
            <Link className="btn-small" to="/account">Update business profile</Link>
          </div>
        </div>

        {error && <div className="form-alert error">{error}</div>}
        {success && <div className="form-alert success">{success}</div>}

        {/* Section Navigation */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setSearchParams({ section: section.id })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  background: activeSection === section.id ? "#0066cc" : "transparent",
                  color: activeSection === section.id ? "white" : "#666",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: activeSection === section.id ? "600" : "500",
                  fontSize: "14px",
                  transition: "all 0.3s ease"
                }}
              >
                <Icon size={16} />
                {section.label}
              </button>
            );
          })}
        </div>

        <div className="dashboard-grid">
          {/* OVERVIEW SECTION */}
          {activeSection === "overview" && (
            <>
              {/* Stats Cards */}
              <div className="stats-section">
                <div className="stat-card" style={{ background: "#f8f9fa", border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <Clock size={20} style={{ color: "#0066cc" }} />
                    <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{loading ? "..." : summary.today}</h3>
                  </div>
                  <p style={{ margin: 0, color: "#666" }}>Appointments today</p>
                </div>
                <div className="stat-card" style={{ background: "#f8f9fa", border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <Sparkles size={20} style={{ color: "#10b981" }} />
                    <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{loading ? "..." : summary.upcoming}</h3>
                  </div>
                  <p style={{ margin: 0, color: "#666" }}>Upcoming bookings</p>
                </div>
                <div className="stat-card" style={{ background: "#f8f9fa", border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <AlertCircle size={20} style={{ color: "#f59e0b" }} />
                    <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{loading ? "..." : summary.pending}</h3>
                  </div>
                  <p style={{ margin: 0, color: "#666" }}>Pending confirmations</p>
                </div>
                <div className="stat-card" style={{ background: "#f8f9fa", border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <Check size={20} style={{ color: "#8b5cf6" }} />
                    <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{loading ? "..." : summary.activeServices}</h3>
                  </div>
                  <p style={{ margin: 0, color: "#666" }}>Active services</p>
                </div>
              </div>

              {/* Today Appointments */}
              <div className="widget" style={{ gridColumn: "span 2" }}>
                <div className="widget-header">
                  <h2>Today's Appointments</h2>
                  <button className="btn-small" type="button" onClick={loadDashboard}>Refresh</button>
                </div>
                <div className="appointments-list">
                  {!loading && todayAppointments.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>No appointments scheduled for today.</p>}
                  {todayAppointments.map((appointment) => (
                    <div key={appointment._id} className="appointment-item" style={{ display: "grid", gridTemplateColumns: "80px 1fr 200px", gap: "16px", alignItems: "center", padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
                      <div style={{ background: "#f0f4ff", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#0066cc" }}>{new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</h3>
                      </div>
                      <div>
                        <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "bold" }}>{appointment.pet?.name || "Pet"}</h3>
                        <p style={{ margin: "2px 0", fontSize: "14px", color: "#666" }}><strong>Owner:</strong> {appointment.owner?.name || "Owner"}</p>
                        <p style={{ margin: "2px 0", fontSize: "14px", color: "#666" }}><strong>Service:</strong> {appointment.serviceType}</p>
                        {appointment.location && <p style={{ margin: "2px 0", fontSize: "14px", color: "#666" }}><strong>Location:</strong> {appointment.location}</p>}
                      </div>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button className="btn-small" type="button" onClick={() => updateAppointment(appointment._id, "confirmed")} style={{ padding: "6px 12px", fontSize: "12px" }}>Confirm</button>
                        <button className="btn-small" type="button" onClick={() => updateAppointment(appointment._id, "completed")} style={{ padding: "6px 12px", fontSize: "12px" }}>Complete</button>
                        <button className="btn-small" type="button" onClick={() => updateAppointment(appointment._id, "cancelled")} style={{ padding: "6px 12px", fontSize: "12px", background: "#fee2e2", color: "#dc2626" }}>Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Messages & Quick Actions */}
              <div className="widget">
                <div className="widget-header">
                  <h2>Recent Messages</h2>
                  <Link className="btn-small" to="/messages">View All</Link>
                </div>
                <div className="reviews-list">
                  {!loading && recentCustomerMessages.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>No incoming customer messages yet.</p>}
                  {recentCustomerMessages.map((message) => (
                    <div key={message._id} className="review-item" style={{ paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <MessageCircle size={14} style={{ color: "#0066cc" }} />
                        <strong style={{ fontSize: "14px" }}>{message.sender?.name || "Customer"}</strong>
                      </div>
                      <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#333", lineHeight: "1.4" }}>{message.body}</p>
                      <span style={{ fontSize: "12px", color: "#999" }}>{new Date(message.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Queue */}
              <div className="widget">
                <div className="widget-header">
                  <h2>Upcoming Queue</h2>
                  <Sparkles size={18} />
                </div>
                <div className="upcoming-list">
                  {!loading && upcomingAppointments.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>No upcoming bookings.</p>}
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment._id} className="upcoming-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
                      <div>
                        <span style={{ fontSize: "12px", color: "#0066cc", fontWeight: "bold", marginRight: "8px" }}>{new Date(appointment.scheduledAt).toLocaleDateString()}</span>
                        <span style={{ fontSize: "14px", color: "#333" }}>{appointment.pet?.name || "Pet"} - {appointment.owner?.name || "Owner"}</span>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px", background: appointment.status === "confirmed" ? "#d1fae5" : "#fef3c7", color: appointment.status === "confirmed" ? "#065f46" : "#92400e" }}>{appointment.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* APPOINTMENTS SECTION */}
          {activeSection === "appointments" && (
            <>
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="widget">
                  <div className="widget-header">
                    <h2>All Appointments</h2>
                    <button className="btn-small" type="button" onClick={loadDashboard}>Refresh</button>
                  </div>
                  <div style={{ padding: "16px" }}>
                    {!loading && appointments.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: "40px" }}>No appointments found.</p>}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                      {appointments.map((appointment) => (
                        <div key={appointment._id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", background: "#fff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                            <div>
                              <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "bold" }}>{appointment.pet?.name || "Pet"}</h3>
                              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>{appointment.owner?.name || "Owner"}</p>
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px", background: appointment.status === "confirmed" ? "#d1fae5" : appointment.status === "completed" ? "#dbeafe" : "#fef3c7", color: appointment.status === "confirmed" ? "#065f46" : appointment.status === "completed" ? "#075985" : "#92400e" }}>
                              {appointment.status}
                            </span>
                          </div>
                          <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "6px", marginBottom: "12px", fontSize: "13px" }}>
                            <p style={{ margin: "4px 0", color: "#333" }}><strong>Service:</strong> {appointment.serviceType}</p>
                            <p style={{ margin: "4px 0", color: "#333" }}><strong>Time:</strong> {new Date(appointment.scheduledAt).toLocaleString()}</p>
                            {appointment.location && <p style={{ margin: "4px 0", color: "#333" }}><strong>Location:</strong> {appointment.location}</p>}
                          </div>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
                            <button className="btn-small" type="button" onClick={() => updateAppointment(appointment._id, "confirmed")} style={{ flex: 1, padding: "8px", fontSize: "12px" }}>Confirm</button>
                            <button className="btn-small" type="button" onClick={() => updateAppointment(appointment._id, "completed")} style={{ flex: 1, padding: "8px", fontSize: "12px" }}>Complete</button>
                            <button className="btn-small" type="button" onClick={() => updateAppointment(appointment._id, "cancelled")} style={{ flex: 1, padding: "8px", fontSize: "12px", background: "#fee2e2", color: "#dc2626" }}>Cancel</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SERVICES SECTION */}
          {activeSection === "services" && (
            <>
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="widget groomer-services-widget" id="groomer-services">
                  <div className="widget-header">
                    <h2>Manage Your Services</h2>
                    <Scissors size={18} />
                  </div>

                  <div className="groomer-business-strip" style={{ background: "#f0f4ff", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "14px", color: "#666", marginBottom: "4px" }}>Business Name</span>
                      <span style={{ display: "block", fontSize: "16px", fontWeight: "bold", color: "#0066cc" }}>{profile?.providerProfile?.businessName || profile?.name || "Grooming business"}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ display: "block", fontSize: "14px", color: "#666", marginBottom: "4px" }}>Service Area</span>
                      <span style={{ display: "block", fontSize: "16px", fontWeight: "bold", color: "#333" }}>{profile?.providerProfile?.serviceArea || "Not provided"}</span>
                    </div>
                  </div>

                  <form className="groomer-service-form" onSubmit={submitService} style={{ background: "#f9fafb", padding: "20px", borderRadius: "8px", marginBottom: "24px", border: "1px solid #e5e7eb" }}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "bold" }}>
                      {editingServiceId ? "✏️ Edit Service" : "➕ Add New Service"}
                    </h3>
                    <input
                      placeholder="Service name (e.g., Full Grooming, Bath & Dry)"
                      value={serviceForm.name}
                      onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })}
                      required
                      style={{ width: "100%", marginBottom: "12px", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                    />
                    <div className="split-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <input
                        placeholder="Category"
                        value={serviceForm.category}
                        onChange={(event) => setServiceForm({ ...serviceForm, category: event.target.value })}
                        style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Price (LKR)"
                        value={serviceForm.price}
                        onChange={(event) => setServiceForm({ ...serviceForm, price: event.target.value })}
                        style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                      />
                    </div>
                    <div className="split-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <input
                        type="number"
                        min="1"
                        placeholder="Duration (minutes)"
                        value={serviceForm.durationMinutes}
                        onChange={(event) => setServiceForm({ ...serviceForm, durationMinutes: event.target.value })}
                        style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                      />
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={serviceForm.isActive}
                          onChange={(event) => setServiceForm({ ...serviceForm, isActive: event.target.checked })}
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>Active service</span>
                      </label>
                    </div>
                    <textarea
                      placeholder="Describe what is included in this service"
                      rows="3"
                      value={serviceForm.description}
                      onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })}
                      style={{ width: "100%", marginBottom: "12px", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit" }}
                    />
                    <div className="service-actions" style={{ display: "flex", gap: "8px" }}>
                      <button className="btn-primary" type="submit" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        {editingServiceId ? <Save size={16} /> : <PlusCircle size={16} />}
                        {editingServiceId ? "Update service" : "Add service"}
                      </button>
                      {editingServiceId && (
                        <button className="btn-small" type="button" onClick={resetServiceForm} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <X size={15} /> Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  <div style={{ marginTop: "20px" }}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "bold" }}>Your Services ({services.length})</h3>
                    {!loading && services.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: "30px 0" }}>No services yet. Add your first service above.</p>}
                    <div className="groomer-service-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                      {services.map((service) => (
                        <article key={service._id} className="groomer-service-card" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", background: "#fff" }}>
                          <div style={{ marginBottom: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                              <span style={{ fontSize: "12px", fontWeight: "bold", padding: "6px 10px", borderRadius: "4px", background: service.isActive ? "#d1fae5" : "#fee2e2", color: service.isActive ? "#065f46" : "#991b1b" }}>
                                {service.isActive ? "✓ Active" : "✕ Inactive"}
                              </span>
                              <strong style={{ fontSize: "18px", color: "#0066cc" }}>{formatLKR(Number(service.price || 0))}</strong>
                            </div>
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold" }}>{service.name}</h3>
                            <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#666", lineHeight: "1.4" }}>{service.description || "No description provided."}</p>
                            <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#999" }}>
                              <span>📁 {service.category || "Grooming"}</span>
                              <span>⏱️ {service.durationMinutes || 60} min</span>
                            </div>
                          </div>
                          <div className="service-actions" style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
                            <button className="btn-small" type="button" onClick={() => startEditService(service)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "8px" }}>
                              <Edit2 size={14} /> Edit
                            </button>
                            <button className="danger-button compact" type="button" onClick={() => deleteService(service)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "8px" }}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
