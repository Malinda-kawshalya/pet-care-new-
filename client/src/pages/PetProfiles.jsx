import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { getUploadUrl } from '../utils/media.js';
import PetForm from '../components/PetForm.jsx';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarClock, PawPrint, Sparkles, Edit, Trash2, Plus } from 'lucide-react';

const heroImage = 'https://images.unsplash.com/photo-1633722715463-d30628519b5f?auto=format&fit=crop&w=1400&q=85';
const emptyStateImage = 'https://images.unsplash.com/photo-1611003228941-98852ba62227?auto=format&fit=crop&w=600&q=85';

export default function PetProfiles() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const me = await api.get('/auth/me');
      const userId = me.data.user?._id || me.data._id;
      const resp = await api.get('/pets');
      const items = resp.data.items || resp.data;
      const myPets = (items || []).filter((p) => p.owner === userId || (p.owner && p.owner._id === userId));
      setPets(myPets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = () => {
    setCreating(true);
  };

  const handleSaved = (item) => {
    setCreating(false);
    setEditing(null);
    load();
  };

  const handleEdit = (pet) => {
    setEditing(pet);
  };

  const handleDelete = async (petId) => {
    if (!confirm('Delete this pet?')) return;
    try {
      await api.delete(`/pets/${petId}`);
      setPets((p) => p.filter((x) => x._id !== petId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      fontSize: "1.1rem",
      color: "#64748b"
    }}>
      Loading your pets...
    </div>
  );

  return (
    <div className="section pet-profile-page">
      <section className="module-detail-hero pet-profile-hero" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.1fr",
        gap: "2rem",
        alignItems: "center",
        padding: "3rem 2rem",
        borderRadius: "20px",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        border: "1px solid rgba(14, 165, 233, 0.2)",
        marginBottom: "2rem"
      }}>
        <div>
          <p className="eyebrow" style={{ 
            color: "#0ea5e9", 
            fontSize: "0.85rem", 
            fontWeight: 700,
            marginBottom: "0.75rem"
          }}>
            Pet Management
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            color: "#0f0f1f",
            marginBottom: "1rem",
            letterSpacing: "-0.02em"
          }}>
            My Pets
          </h1>
          <p style={{
            color: "#64748b",
            lineHeight: 1.75,
            fontSize: "1.05rem",
            marginBottom: "2rem"
          }}>
            Keep every pet profile organized with photos, vaccination status, health notes, and quick edit actions. All your pets in one beautiful dashboard.
          </p>
          <div className="hero-actions" style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <button 
              className="primary-button" 
              onClick={handleCreate} 
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
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              <Plus size={18} /> Add Pet
            </button>
            <button 
              className="ghost-button" 
              onClick={() => navigate('/modules/health')} 
              type="button"
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
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              <Sparkles size={16} /> Health Module
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <img
            src={heroImage}
            alt="Happy pets"
            style={{ 
              width: '100%', 
              aspectRatio: '4 / 3', 
              objectFit: 'cover', 
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(15, 15, 31, 0.15)'
            }}
          />
        </div>
      </section>

      {creating && (
        <div style={{ 
          maxWidth: "900px",
          marginTop: "2rem",
          padding: "2rem",
          borderRadius: "16px",
          background: "white",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f0f1f", margin: 0 }}>
              Add New Pet
            </h2>
            <button 
              onClick={() => setCreating(false)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#64748b"
              }}
            >
              ×
            </button>
          </div>
          <PetForm onSaved={handleSaved} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div style={{ 
          maxWidth: "900px",
          marginTop: "2rem",
          padding: "2rem",
          borderRadius: "16px",
          background: "white",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f0f1f", margin: 0 }}>
              Edit {editing.name}
            </h2>
            <button 
              onClick={() => setEditing(null)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#64748b"
              }}
            >
              ×
            </button>
          </div>
          <PetForm initial={editing} onSaved={handleSaved} onCancel={() => setEditing(null)} />
        </div>
      )}

      <div className="pet-profile-grid" style={{
        display: pets.length === 0 ? "none" : "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "20px",
        marginTop: "2rem"
      }}>
        {pets.map((pet) => (
          <div 
            key={pet._id} 
            className="pet-card"
            style={{
              borderRadius: "16px",
              background: "white",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 20px 50px rgba(15, 15, 31, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 15, 31, 0.08)";
            }}
          >
            <div style={{
              width: "100%",
              height: "200px",
              background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)",
              overflow: "hidden",
              position: "relative"
            }}>
              {pet.images && pet.images[0] ? (
                <img 
                  src={getUploadUrl(pet.images[0])} 
                  alt={pet.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "#0ea5e9"
                }}>
                  <PawPrint size={48} />
                  <p style={{ marginTop: "0.5rem", fontWeight: 700 }}>No photo</p>
                </div>
              )}
              <div style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "20px",
                background: "rgba(14, 165, 233, 0.9)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.8rem"
              }}>
                <PawPrint size={14} /> {pet.species}
              </div>
            </div>
            
            <div style={{ padding: "1.5rem" }}>
              <h3 style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                color: "#0f0f1f",
                margin: "0 0 0.5rem 0"
              }}>
                {pet.name}
              </h3>
              
              <div style={{
                display: "grid",
                gap: "0.75rem",
                marginBottom: "1.5rem",
                color: "#64748b",
                fontSize: "0.95rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
                  <span style={{ fontWeight: 700, color: "#0ea5e9" }}>Breed:</span> {pet.breed || "Not set"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
                  <span style={{ fontWeight: 700, color: "#0ea5e9" }}>Age:</span> {pet.age != null ? `${pet.age} years` : "Unknown"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
                  <span style={{ fontWeight: 700, color: "#0ea5e9" }}>Gender:</span> {pet.gender || "Unknown"}
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem",
                borderRadius: "12px",
                background: pet.vaccinationStatus === "up-to-date" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                marginBottom: "1.5rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: pet.vaccinationStatus === "up-to-date" ? "#10b981" : "#f59e0b"
              }}>
                <CalendarClock size={16} />
                Vaccination: {pet.vaccinationStatus || "Unknown"}
              </div>

              <div style={{
                display: "flex",
                gap: "0.75rem"
              }}>
                <button 
                  onClick={() => handleEdit(pet)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.3s ease"
                  }}
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(pet._id)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "12px",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.3s ease"
                  }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pets.length === 0 && !creating && !editing && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "center",
          padding: "3rem 2rem",
          marginTop: "2rem"
        }}>
          <img 
            src={emptyStateImage}
            alt="Add your first pet"
            style={{
              width: "100%",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(15, 15, 31, 0.12)",
              aspectRatio: "1"
            }}
          />
          <div>
            <h2 style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "#0f0f1f",
              marginBottom: "1rem"
            }}>
              No Pets Yet
            </h2>
            <p style={{
              color: "#64748b",
              fontSize: "1.05rem",
              lineHeight: 1.75,
              marginBottom: "2rem"
            }}>
              Start managing your pets today. Add their photos, health information, vaccination records, and more. Keep all your pet data organized in one beautiful dashboard.
            </p>
            <button 
              onClick={handleCreate}
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                color: "white",
                padding: "1rem 2rem",
                borderRadius: "12px",
                fontWeight: 700,
                border: "none",
                fontSize: "1rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                boxShadow: "0 8px 20px rgba(14, 165, 233, 0.3)",
                transition: "all 0.3s ease"
              }}
            >
              <Plus size={20} /> Add Your First Pet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
