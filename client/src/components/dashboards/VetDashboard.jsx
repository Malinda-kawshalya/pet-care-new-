import React, { useState } from 'react';
import { Calendar, Users, Clipboard, Star, Plus } from 'lucide-react';

const VetDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([
    { id: 1, petName: 'Max', owner: 'John Doe', time: '10:00 AM', type: 'Checkup', status: 'Completed' },
    { id: 2, petName: 'Bella', owner: 'Jane Smith', time: '11:30 AM', type: 'Vaccination', status: 'In Progress' },
    { id: 3, petName: 'Charlie', owner: 'Bob Johnson', time: '2:00 PM', type: 'Surgery Follow-up', status: 'Pending' }
  ]);

  const [patients, setPatients] = useState([
    { id: 1, petName: 'Max', owner: 'John Doe', breed: 'Golden Retriever', lastVisit: '2025-05-10', nextDue: '2025-06-10' },
    { id: 2, petName: 'Bella', owner: 'Jane Smith', breed: 'Labrador', lastVisit: '2025-05-15', nextDue: '2025-06-15' }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'In Progress': return { bg: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' };
      case 'Pending': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b' };
    }
  };

  return (
    <div className="dashboard-container" style={{
      background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)",
      minHeight: "100vh"
    }}>
      <div className="dashboard-hero" style={{
        padding: "2rem",
        borderRadius: "20px",
        background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)",
        marginBottom: "2rem"
      }}>
        <div>
          <p className="eyebrow" style={{
            color: "#0ea5e9",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "0.75rem"
          }}>
            Veterinarian Workspace
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            color: "#0f0f1f",
            marginBottom: "1rem",
            letterSpacing: "-0.02em"
          }}>
            Veterinary Practice Dashboard
          </h1>
          <p style={{
            color: "#64748b",
            lineHeight: 1.75,
            fontSize: "1.05rem",
            marginBottom: "1.5rem"
          }}>
            Manage appointments, track patients, maintain medical records, and grow your veterinary practice.
          </p>
        </div>
        <div className="dashboard-actions" style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <button style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
            color: "white",
            padding: "0.875rem 1.75rem",
            borderRadius: "12px",
            fontWeight: 700,
            border: "none",
            boxShadow: "0 8px 20px rgba(14, 165, 233, 0.3)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer"
          }}>
            <Plus size={16} /> Add Appointment
          </button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gap: "20px" }}>
        <div className="stats-section" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px"
        }}>
          <div className="stat-card" style={{
            borderRadius: "16px",
            padding: "1.5rem",
            background: "white",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)",
            borderTop: "4px solid #0ea5e9"
          }}>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#0ea5e9", margin: "0 0 0.5rem 0" }}>3</h3>
            <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>Today's Appointments</p>
          </div>
          <div className="stat-card" style={{
            borderRadius: "16px",
            padding: "1.5rem",
            background: "white",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)",
            borderTop: "4px solid #10b981"
          }}>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", margin: "0 0 0.5rem 0" }}>24</h3>
            <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>Active Patients</p>
          </div>
          <div className="stat-card" style={{
            borderRadius: "16px",
            padding: "1.5rem",
            background: "white",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)",
            borderTop: "4px solid #f59e0b"
          }}>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b", margin: "0 0 0.5rem 0" }}>12</h3>
            <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>Pending Records</p>
          </div>
          <div className="stat-card" style={{
            borderRadius: "16px",
            padding: "1.5rem",
            background: "white",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)",
            borderTop: "4px solid #8b5cf6"
          }}>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#8b5cf6", margin: "0 0 0.5rem 0" }}>4.8<span style={{ fontSize: "1.2rem" }}>★</span></h3>
            <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>Average Rating</p>
          </div>
        </div>

        <div className="widget" style={{
          borderRadius: "16px",
          padding: "2rem",
          background: "white",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)"
        }}>
          <div className="widget-header" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f0f1f", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={24} style={{ color: "#0ea5e9" }} />
              Today's Schedule
            </h2>
          </div>
          <div className="schedule-list" style={{ display: "grid", gap: "12px" }}>
            {todayAppointments.map(apt => {
              const statusStyle = getStatusColor(apt.status);
              return (
                <div key={apt.id} className="schedule-item" style={{
                  padding: "1rem",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                  border: "1px solid rgba(14, 165, 233, 0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(14, 165, 233, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#0ea5e9", fontWeight: 700, marginBottom: "0.25rem" }}>
                      {apt.time}
                    </div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f0f1f", margin: "0 0 0.25rem 0" }}>
                      {apt.petName}
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "0 0 0.25rem 0" }}>
                      Owner: {apt.owner}
                    </p>
                    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      {apt.type}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{
                      padding: "0.4rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      background: statusStyle.bg,
                      color: statusStyle.color
                    }}>
                      {apt.status}
                    </span>
                    <button style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      background: "#0ea5e9",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}>
                      Manage
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="widget" style={{
          borderRadius: "16px",
          padding: "2rem",
          background: "white",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)"
        }}>
          <div className="widget-header" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f0f1f", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Users size={24} style={{ color: "#10b981" }} />
              My Patients
            </h2>
            <button style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem"
            }}>
              + Add Patient
            </button>
          </div>
          <div className="patients-list" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px"
          }}>
            {patients.map(patient => (
              <div key={patient.id} className="patient-card" style={{
                padding: "1.5rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                border: "1px solid rgba(14, 165, 233, 0.2)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(14, 165, 233, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 15, 31, 0.08)";
              }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f0f1f", margin: "0 0 0.5rem 0" }}>
                  {patient.petName}
                </h3>
                <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
                  <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
                    <strong style={{ color: "#0ea5e9" }}>Owner:</strong> {patient.owner}
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
                    <strong style={{ color: "#0ea5e9" }}>Breed:</strong> {patient.breed}
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
                    <strong style={{ color: "#0ea5e9" }}>Last Visit:</strong> {patient.lastVisit}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "8px",
                    background: "#0ea5e9",
                    color: "white",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}>
                    View Records
                  </button>
                  <button style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "8px",
                    background: "rgba(14, 165, 233, 0.1)",
                    color: "#0ea5e9",
                    border: "1px solid rgba(14, 165, 233, 0.2)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}>
                    History
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="widget" style={{
          borderRadius: "16px",
          padding: "2rem",
          background: "white",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)"
        }}>
          <div className="widget-header" style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f0f1f", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clipboard size={24} style={{ color: "#8b5cf6" }} />
              Recent Medical Records
            </h2>
          </div>
          <div className="records-list" style={{ display: "grid", gap: "12px" }}>
            <div className="record-item" style={{
              padding: "1rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #f3e8ff 0%, #f0e6ff 100%)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <span style={{
                  display: "inline-flex",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "20px",
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#8b5cf6",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  marginRight: "0.75rem"
                }}>
                  Vaccination
                </span>
                <span style={{ fontWeight: 600, color: "#0f0f1f" }}>Max - Rabies Vaccine</span>
              </div>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>2025-05-15</span>
            </div>
            <div className="record-item" style={{
              padding: "1rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <span style={{
                  display: "inline-flex",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "20px",
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#f59e0b",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  marginRight: "0.75rem"
                }}>
                  Prescription
                </span>
                <span style={{ fontWeight: 600, color: "#0f0f1f" }}>Bella - Antibiotics</span>
              </div>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>2025-05-14</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetDashboard;
String.raw`
            <button className="action-btn">📋 New Record</button>
            <button className="action-btn">💊 Add Prescription</button>
            <button className="action-btn">📧 Send Reminder</button>
            <button className="action-btn">💬 Messages</button>
            <button className="action-btn">⏰ Manage Hours</button>
            <button className="action-btn">📊 Analytics</button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="widget">
          <h2>Upcoming Appointments (Next 7 Days)</h2>
          <div className="upcoming-list">
            <div className="upcoming-item">
              <span className="date">May 20</span>
              <span>Rocky - Follow-up</span>
              <span>2:00 PM</span>
            </div>
            <div className="upcoming-item">
              <span className="date">May 21</span>
              <span>Buddy - Vaccination</span>
              <span>10:30 AM</span>
            </div>
            <div className="upcoming-item">
              <span className="date">May 22</span>
              <span>Lucy - Checkup</span>
              <span>11:00 AM</span>
            </div>
          </div>
        </div>

        {/* Services & Pricing */}
        <div className="widget">
          <h2>Services & Pricing</h2>
          <div className="services-list">
            <div className="service-item">
              <span>Regular Checkup</span>
              <span>$50</span>
            </div>
            <div className="service-item">
              <span>Vaccination</span>
              <span>$30</span>
            </div>
            <div className="service-item">
              <span>Dental Cleaning</span>
              <span>$150</span>
            </div>
            <button className="btn-primary">Edit Services</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetDashboard;
`;
