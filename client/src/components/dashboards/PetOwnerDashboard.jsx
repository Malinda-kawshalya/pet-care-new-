import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarClock, ShieldCheck, PawPrint, UserRoundCog, RotateCcw, HeartPulse, ClipboardList } from 'lucide-react';
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
    const profileReady = user?.name && user?.email ? 'Ready' : 'Needs update';
    return {
      totalPets: pets.length,
      vaccinationDue,
      profileReady
    };
  }, [pets, user]);

  const actions = [
    { label: 'Manage Pets', icon: PawPrint, to: '/pets', detail: 'Add, edit, and delete pet profiles.' },
    { label: 'Update Profile', icon: UserRoundCog, to: '/account', detail: 'Edit contact and account details.' },
    { label: 'Change Password', icon: ShieldCheck, to: '/account', detail: 'Open your secure account panel.' },
    { label: 'Reset Password', icon: RotateCcw, to: '/login', detail: 'Open password reset from login.' },
    { label: 'Book Appointment', icon: CalendarClock, to: '/modules/appointments', detail: 'Schedule care for your pets.' }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero" style={{ marginBottom: '1.5rem' }}>
        <div>
          <p className="eyebrow">Pet owner workspace</p>
          <h1>Welcome{user?.name ? `, ${user.name}` : ''}</h1>
          <p>Use this dashboard to manage your pets, keep your profile current, and jump into account actions quickly.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-primary" onClick={() => navigate('/pets')} type="button"><PawPrint size={16} /> Go to pets</button>
          <Link className="btn-small" to="/account">Open profile</Link>
        </div>
      </div>

      {error && <div className="form-alert error">{error}</div>}

      <div className="dashboard-grid">
        <div className="stats-section">
          <div className="stat-card">
            <h3>{loading ? '...' : summary.totalPets}</h3>
            <p>Total pets</p>
          </div>
          <div className="stat-card">
            <h3>{loading ? '...' : summary.vaccinationDue}</h3>
            <p>Vaccinations due</p>
          </div>
          <div className="stat-card">
            <h3>{user?.approvalStatus || 'approved'}</h3>
            <p>Account status</p>
          </div>
          <div className="stat-card">
            <h3>{summary.profileReady}</h3>
            <p>Profile readiness</p>
          </div>
        </div>

        <div className="widget quick-actions">
          <div className="widget-header">
            <h2>Account options</h2>
            <span className="link">Fast access</span>
          </div>
          <div className="actions-grid">
            {actions.map(({ label, icon: Icon, to, detail }) => (
              <Link key={label} className="action-btn" to={to} style={{ textDecoration: 'none' }}>
                <Icon size={18} />
                <strong style={{ display: 'block', marginTop: 8 }}>{label}</strong>
                <span style={{ display: 'block', opacity: 0.9, fontSize: 12, marginTop: 4 }}>{detail}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="widget">
          <div className="widget-header">
            <h2>My pets</h2>
            <Link className="link" to="/pets">View all</Link>
          </div>
          <div className="pets-list">
            {pets.length === 0 && !loading && <p>No pets yet. Start by adding your first pet profile.</p>}
            {pets.map((pet) => (
              <div key={pet._id} className="pet-card">
                <div className="pet-info">
                  <h3>{pet.name}</h3>
                  <p>{pet.breed || 'Breed not set'} • {pet.age ?? 'Age not set'}</p>
                  <span className={`status ${pet.vaccinationStatus === 'upToDate' ? 'vaccinated' : 'pending'}`}>
                    {pet.vaccinationStatus === 'upToDate' ? 'Vaccinated' : 'Vaccination review needed'}
                  </span>
                </div>
                <div className="pet-actions">
                  <button className="btn-small" type="button" onClick={() => navigate('/pets')}>Open profile</button>
                  <button className="btn-small" type="button" onClick={() => navigate('/pets')}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="widget">
          <div className="widget-header">
            <h2>Next steps</h2>
            <ClipboardList size={18} />
          </div>
          <div className="alerts-list">
            <div className="alert alert-info">
              <span className="alert-icon"><HeartPulse size={22} /></span>
              <div className="alert-content">
                <h3>Keep pet records updated</h3>
                <p>Update vaccination status and medical history whenever your vet shares new information.</p>
              </div>
            </div>
            <div className="alert alert-warning">
              <span className="alert-icon"><ShieldCheck size={22} /></span>
              <div className="alert-content">
                <h3>Secure your account</h3>
                <p>Use the account page to update your password and keep profile details current.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;
