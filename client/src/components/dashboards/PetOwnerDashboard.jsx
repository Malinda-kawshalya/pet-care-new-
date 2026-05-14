import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, CalendarClock, ShieldCheck, PawPrint, UserRoundCog, RotateCcw, HeartPulse, ClipboardList } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import './Dashboard.css';

const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const [meResponse, petsResponse] = await Promise.all([
          api.get('/auth/me'),
          api.get('/pets')
        ]);

        if (!active) return;

        const currentUser = meResponse.data.user || meResponse.data;
        const allPets = petsResponse.data.items || petsResponse.data.pets || [];
        const myPets = allPets.filter((pet) => {
          const ownerId = pet.owner?._id || pet.owner?.id || pet.owner;
          return ownerId === currentUser.id || ownerId === currentUser._id;
        });

        setPets(myPets);
      } catch (dashboardError) {
        if (!active) return;
        setError(dashboardError.response?.data?.message || 'Unable to load your dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const vaccinationDue = pets.filter((pet) => ['dueSoon', 'overdue', 'unknown'].includes(pet.vaccinationStatus)).length;
    return {
      totalPets: pets.length,
      vaccinationDue,
      profileReady: user?.isEmailVerified ? 'Verified' : 'Pending verification'
    };
  }, [pets, user]);

  const actions = [
    { label: 'Manage Pets', icon: PawPrint, to: '/pets', detail: 'Add, edit, and delete pet profiles.' },
    { label: 'Update Profile', icon: UserRoundCog, to: '/login?mode=profile', detail: 'Edit contact and account details.' },
    { label: 'Change Password', icon: ShieldCheck, to: '/login?mode=profile', detail: 'Open your secure account panel.' },
    { label: 'Email Verification', icon: BadgeCheck, to: '/login?mode=profile', detail: 'Verify or resend your email token.' },
    { label: 'Reset Password', icon: RotateCcw, to: '/login?mode=forgot', detail: 'Request a password reset token.' },
    { label: 'Book Appointment', icon: CalendarClock, to: '/modules/appointments', detail: 'Schedule care for your pets.' }
  ];

  return (
    <div className="dashboard-container" style={{
      background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)",
      minHeight: "100vh"
    }}>
      <div className="dashboard-hero" style={{
        marginBottom: "2rem",
        padding: "2rem",
        borderRadius: "20px",
        background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)"
      }}>
        <div>
          <p className="eyebrow" style={{
            color: "#0ea5e9",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "0.75rem"
          }}>
            Pet Owner Workspace
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            color: "#0f0f1f",
            marginBottom: "1rem",
            letterSpacing: "-0.02em"
          }}>
            Welcome{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p style={{
            color: "#64748b",
            lineHeight: 1.75,
            fontSize: "1.05rem",
            marginBottom: "1.5rem"
          }}>
            Manage your pets, keep your profile current, and access all your account features from here.
          </p>
        </div>
        <div className="dashboard-actions" style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/pets')} 
            type="button"
            style={{
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
            }}
          >
            <PawPrint size={16} /> Manage Pets
          </button>
          <Link 
            className="btn-small" 
            to="/login?mode=profile"
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              color: "#0f0f1f",
              padding: "0.875rem 1.75rem",
              borderRadius: "12px",
              fontWeight: 700,
              border: "2px solid rgba(226, 232, 240, 0.8)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer"
            }}
          >
            Open Profile
          </Link>
        </div>
      </div>

      {error && <div className="form-alert error" style={{
        background: "rgba(239, 68, 68, 0.1)",
        color: "#ef4444",
        padding: "1rem",
        borderRadius: "12px",
        marginBottom: "1.5rem",
        border: "1px solid rgba(239, 68, 68, 0.2)"
      }}>{error}</div>}

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
            transition: "all 0.3s ease",
            borderTop: "4px solid #0ea5e9"
          }}>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#0ea5e9", margin: "0 0 0.5rem 0" }}>
              {loading ? '...' : summary.totalPets}
            </h3>
            <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>Total Pets</p>
          </div>
          <div className="stat-card" style={{
            borderRadius: "16px",
            padding: "1.5rem",
            background: "white",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)",
            transition: "all 0.3s ease",
            borderTop: "4px solid #f59e0b"
          }}>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b", margin: "0 0 0.5rem 0" }}>
              {loading ? '...' : summary.vaccinationDue}
            </h3>
            <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>Vaccinations Due</p>
          </div>
          <div className="stat-card" style={{
            borderRadius: "16px",
            padding: "1.5rem",
            background: "white",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)",
            transition: "all 0.3s ease",
            borderTop: "4px solid #10b981"
          }}>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", margin: "0 0 0.5rem 0" }}>
              {user?.approvalStatus || 'approved'}
            </h3>
            <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>Account Status</p>
          </div>
          <div className="stat-card" style={{
            borderRadius: "16px",
            padding: "1.5rem",
            background: "white",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)",
            transition: "all 0.3s ease",
            borderTop: "4px solid #8b5cf6"
          }}>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#8b5cf6", margin: "0 0 0.5rem 0" }}>
              {summary.profileReady}
            </h3>
            <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>Email Status</p>
          </div>
        </div>

        <div className="widget quick-actions" style={{
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
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f0f1f", margin: 0 }}>Account Options</h2>
            <span className="link" style={{ color: "#0ea5e9", fontWeight: 700 }}>Fast access</span>
          </div>
          <div className="actions-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px"
          }}>
            {actions.map(({ label, icon: Icon, to, detail }) => (
              <Link 
                key={label} 
                className="action-btn" 
                to={to} 
                style={{
                  textDecoration: 'none',
                  padding: "1rem",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                  border: "1px solid rgba(14, 165, 233, 0.2)",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(14, 165, 233, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Icon size={18} style={{ color: "#0ea5e9" }} />
                <strong style={{ display: 'block', marginTop: '8px', color: "#0f0f1f", fontSize: "0.9rem" }}>
                  {label}
                </strong>
                <span style={{ display: 'block', opacity: 0.7, fontSize: '0.75rem', marginTop: '4px', color: "#64748b" }}>
                  {detail}
                </span>
              </Link>
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
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f0f1f", margin: 0 }}>My Pets</h2>
            <Link className="link" to="/pets" style={{ color: "#0ea5e9", fontWeight: 700 }}>
              View all
            </Link>
          </div>
          <div className="pets-list" style={{ display: "grid", gap: "12px" }}>
            {pets.length === 0 && !loading && (
              <p style={{ color: "#64748b", textAlign: "center", padding: "2rem", fontSize: "0.95rem" }}>
                No pets yet. Start by adding your first pet profile.
              </p>
            )}
            {pets.map((pet) => (
              <div 
                key={pet._id} 
                className="pet-card"
                style={{
                  padding: "1rem",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                  border: "1px solid rgba(14, 165, 233, 0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.3s ease"
                }}
              >
                <div className="pet-info">
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f0f1f", margin: "0 0 0.25rem 0" }}>
                    {pet.name}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "0 0 0.5rem 0" }}>
                    {pet.breed || 'Breed not set'} • {pet.age ?? 'Age not set'}
                  </p>
                  <span style={{
                    display: "inline-flex",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    background: pet.vaccinationStatus === 'upToDate' ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                    color: pet.vaccinationStatus === 'upToDate' ? "#10b981" : "#f59e0b"
                  }}>
                    {pet.vaccinationStatus === 'upToDate' ? '✓ Vaccinated' : '⚠ Vaccination review needed'}
                  </span>
                </div>
                <div className="pet-actions" style={{ display: "flex", gap: "8px" }}>
                  <button 
                    className="btn-small" 
                    type="button" 
                    onClick={() => navigate('/pets')}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      background: "#0ea5e9",
                      color: "white",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}
                  >
                    View
                  </button>
                  <button 
                    className="btn-small" 
                    type="button" 
                    onClick={() => navigate('/pets')}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      background: "rgba(14, 165, 233, 0.1)",
                      color: "#0ea5e9",
                      border: "1px solid rgba(14, 165, 233, 0.2)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}
                  >
                    Edit
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
            gap: "0.75rem",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f0f1f", margin: 0 }}>Next Steps</h2>
            <ClipboardList size={18} style={{ color: "#0ea5e9" }} />
          </div>
          <div className="alerts-list" style={{ display: "grid", gap: "12px" }}>
            <div className="alert alert-info" style={{
              padding: "1rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)",
              border: "1px solid rgba(14, 165, 233, 0.2)",
              display: "flex",
              gap: "1rem"
            }}>
              <span className="alert-icon" style={{ color: "#0ea5e9" }}>
                <HeartPulse size={22} />
              </span>
              <div className="alert-content">
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f0f1f", margin: "0 0 0.25rem 0" }}>
                  Keep Pet Records Updated
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
                  Update vaccination status and medical history whenever your vet shares new information.
                </p>
              </div>
            </div>
            <div className="alert alert-warning" style={{
              padding: "1rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              display: "flex",
              gap: "1rem"
            }}>
              <span className="alert-icon" style={{ color: "#f59e0b" }}>
                <ShieldCheck size={22} />
              </span>
              <div className="alert-content">
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f0f1f", margin: "0 0 0.25rem 0" }}>
                  Secure Your Account
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
                  Use the profile panel to change your password or verify your email if needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;
