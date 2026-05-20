import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CalendarClock, ShieldCheck, PawPrint, UserRoundCog, RotateCcw, HeartPulse, ClipboardList, Heart, Clock, Users, ShoppingBag, RefreshCcw, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import DashboardSidebar from '../DashboardSidebar.jsx';
import AppointmentBookingModal from '../AppointmentBookingModal.jsx';
import HealthRecordModal from '../HealthRecordModal.jsx';
import CommunityBlogSection from '../CommunityBlogSection.jsx';
import AdoptionForm from '../../pages/AdoptionForm.jsx';
import '../../styles/admin.css';
import './Dashboard.css';

const sections = [
  { key: "pets", label: "My Pets", icon: PawPrint },
  { key: "health-records", label: "Health Records", icon: Heart },
  { key: "appointments", label: "Appointments", icon: Clock },
  { key: "community", label: "Community", icon: Users },
  { key: "matchmaking", label: "Matchmaking", icon: Heart },
  { key: "adoption", label: "Adoption", icon: ShoppingBag }
];

const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  
  const [active, setActive] = useState("pets");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  
  const [selectedPet, setSelectedPet] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    const section = new URLSearchParams(location.search).get("section");
    if (section && sections.some((item) => item.key === section)) {
      setActive(section);
    }
  }, [location.search]);

  useEffect(() => {
    if (active === "pets") loadPets();
    if (active === "health-records") {
      loadMedicalRecords();
      loadPets();
    }
    if (active === "appointments") loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  async function run(action) {
    setLoading(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  }

  function flash(message) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), 2500);
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
  }

  function getRecordTone(status) {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'active' || normalized === 'ok' || normalized === 'completed') return 'ok';
    if (normalized === 'due' || normalized === 'due-soon' || normalized === 'pending' || normalized === 'upcoming') return 'warn';
    return 'neutral';
  }

  async function loadPets() {
    await run(async () => {
      const res = await api.get("/pets");
      setPets(res.data.items || res.data.pets || []);
    });
  }

  async function loadAppointments() {
    await run(async () => {
      const res = await api.get("/appointments");
      setAppointments(res.data.items || res.data || []);
    });
  }

  async function loadMedicalRecords() {
    await run(async () => {
      const res = await api.get("/medical-records");
      setMedicalRecords(res.data.items || res.data || []);
    });
  }

  // Section renderers
  const renderPetsSection = () => (
    <div className="admin-main-modern">
      <div className="admin-main-header">
        <div>
          <h1>My Pets</h1>
          <p>Manage and view all your pet profiles</p>
        </div>
        <div className="admin-main-actions">
          <button className="admin-btn primary" onClick={() => navigate('/pets')} type="button">
            <PawPrint size={16} /> Add New Pet
          </button>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      {pets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <PawPrint size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>No pets yet. Start by adding your first pet profile.</p>
          <button className="admin-btn primary" onClick={() => navigate('/pets')} type="button" style={{ marginTop: '16px' }}>
            <PawPrint size={16} /> Add Your First Pet
          </button>
        </div>
      ) : (
        <div className="pet-profile-grid">
          {pets.map((pet) => (
            <article key={pet._id} className="pet-profile-card">
              <div className="pet-card-media">
                {pet.images && pet.images.length > 0 ? (
                  <img src={pet.images[0]} alt={pet.name} className="pet-photo" />
                ) : (
                  <div className="pet-photo-fallback">
                    <PawPrint size={42} />
                    <p>No photo</p>
                  </div>
                )}
                {pet.species && (
                  <span className="pet-species-badge">
                    <PawPrint size={14} /> {pet.species}
                  </span>
                )}
              </div>

              <div className="pet-card-body">
                <h3>{pet.name}</h3>
                <div className="pet-meta-grid">
                  <div><strong>Breed:</strong> {pet.breed || 'Not set'}</div>
                  <div><strong>Age:</strong> {pet.age != null ? `${pet.age} years` : 'Unknown'}</div>
                  <div><strong>Gender:</strong> {pet.gender || 'Unknown'}</div>
                </div>

                <div className={`pet-vaccination-status ${pet.vaccinationStatus === 'up-to-date' || pet.vaccinationStatus === 'upToDate' ? 'ok' : pet.vaccinationStatus ? 'warn' : ''}`}>
                  <CalendarClock size={16} /> Vaccination: {pet.vaccinationStatus || 'Unknown'}
                </div>

                <div className="pet-card-actions">
                  <button 
                    onClick={() => navigate('/pets')} 
                    className="primary-button compact" 
                    type="button"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedPet(pet);
                      setShowDetailModal(true);
                    }} 
                    className="danger-button" 
                    type="button"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showDetailModal && selectedPet && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPet.name}</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)} type="button">×</button>
            </div>
            
            <div className="modal-body">
              {selectedPet.images && selectedPet.images.length > 0 && (
                <img src={selectedPet.images[0]} alt={selectedPet.name} style={{ width: '100%', borderRadius: '8px', marginBottom: '20px', maxHeight: '300px', objectFit: 'cover' }} />
              )}
              
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-key">Breed:</span>
                  <span className="detail-val">{selectedPet.breed || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Age:</span>
                  <span className="detail-val">{selectedPet.age ? `${selectedPet.age} years` : '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Type:</span>
                  <span className="detail-val">{selectedPet.type || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Color:</span>
                  <span className="detail-val">{selectedPet.color || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Microchip:</span>
                  <span className="detail-val">{selectedPet.microchip || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Vaccination:</span>
                  <span className="detail-val">{selectedPet.vaccinationStatus || '-'}</span>
                </div>
                {selectedPet.notes && (
                  <div className="detail-row full-width">
                    <span className="detail-key">Notes:</span>
                    <span className="detail-val">{selectedPet.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setShowDetailModal(false)} type="button">Close</button>
              <button className="admin-btn primary" onClick={() => { navigate('/pets'); setShowDetailModal(false); }} type="button">
                ✏️ Edit Pet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHealthRecordsSection = () => (
    <div className="admin-main-modern">
      <div className="admin-main-header">
        <div>
          <h1>Health Records</h1>
          <p>Manage medical and vaccination records for your pets</p>
        </div>
        <div className="admin-main-actions">
          <button className="admin-btn primary" type="button" onClick={() => setShowAddRecordModal(true)}>
            <Heart size={16} /> Add Record
          </button>
        </div>
      </div>

      <div className="health-records-summary">
        <div className="report-stat">
          <span>Total Records</span>
          <strong>{medicalRecords.length}</strong>
        </div>
        <div className="report-stat">
          <span>Active</span>
          <strong>{medicalRecords.filter((record) => getRecordTone(record.status) === 'ok').length}</strong>
        </div>
        <div className="report-stat">
          <span>Due Soon</span>
          <strong>{medicalRecords.filter((record) => getRecordTone(record.status) === 'warn').length}</strong>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      {medicalRecords.length === 0 ? (
        <div className="report-note" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <HeartPulse size={36} style={{ marginBottom: 10 }} />
          <p style={{ margin: 0 }}>No health records yet. Add your first medical or vaccination record.</p>
        </div>
      ) : (
        <div className="health-records-grid">
          {medicalRecords
            .slice()
            .sort((left, right) => new Date(right.recordDate || 0) - new Date(left.recordDate || 0))
            .map((record) => {
              const tone = getRecordTone(record.status);
              return (
                <article className="health-record-card" key={record._id}>
                  <div className="health-record-card-top">
                    <div>
                      <p className="health-record-label">Pet</p>
                      <h3>{record.pet?.name || 'Unknown pet'}</h3>
                    </div>
                    <span className={`health-record-status ${tone}`}>{record.status || 'active'}</span>
                  </div>

                  <div className="health-record-meta">
                    <div><strong>Record Type</strong><span>{record.recordType || '-'}</span></div>
                    <div><strong>Date</strong><span>{formatDate(record.recordDate)}</span></div>
                    <div><strong>Provider</strong><span>{record.provider || '-'}</span></div>
                  </div>

                  {record.notes && <p className="health-record-notes">{record.notes}</p>}
                </article>
              );
            })}
        </div>
      )}
    </div>
  );

  const renderAppointmentsSection = () => (
    <div className="admin-main-modern">
      <div className="admin-main-header">
        <div>
          <h1>Appointments</h1>
          <p>View and manage your pet care appointments</p>
        </div>
        <div className="admin-main-actions">
          <button className="admin-btn primary" type="button" onClick={() => setShowAppointmentModal(true)}>
            <Clock size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      {appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p>No appointments scheduled. Book your first appointment now.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Service</th>
                <th>Provider</th>
                <th>Scheduled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt._id}>
                  <td>{apt.pet?.name || '-'}</td>
                  <td>{apt.serviceType || '-'}</td>
                  <td>{apt.provider?.name || '-'}</td>
                  <td>{new Date(apt.scheduledAt).toLocaleDateString() || '-'}</td>
                  <td>{apt.status || 'pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCommunitySection = () => (
    <CommunityBlogSection />
  );

  const renderMatchmakingSection = () => (
    <div className="admin-main-modern">
      <div className="admin-main-header">
        <div>
          <h1>Matchmaking</h1>
          <p>Find potential matches for your pets</p>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p>Matchmaking features coming soon. Discover compatible pets for breeding or companionship.</p>
      </div>
    </div>
  );

  const renderAdoptionSection = () => (
    <AdoptionForm embedded />
  );

  const renderSection = () => {
    switch (active) {
      case "pets":
        return renderPetsSection();
      case "health-records":
        return renderHealthRecordsSection();
      case "appointments":
        return renderAppointmentsSection();
      case "community":
        return renderCommunitySection();
      case "matchmaking":
        return renderMatchmakingSection();
      case "adoption":
        return renderAdoptionSection();
      default:
        return renderPetsSection();
    }
  };

  const summary = {
    totalPets: pets.length,
    upcomingAppointments: appointments.filter((a) => a.status === "pending").length
  };

  return (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar />
      <main className="admin-shell-modern">
        {success && <div className="admin-alert success">{success}</div>}
        {renderSection()}
      </main>
      <AppointmentBookingModal 
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        pets={pets}
        onSuccess={loadAppointments}
      />
      <HealthRecordModal 
        isOpen={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
        pets={pets}
        onSuccess={loadMedicalRecords}
      />
    </div>
  );
};

export default PetOwnerDashboard;
