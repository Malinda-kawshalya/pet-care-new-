import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { getUploadUrl } from '../utils/media.js';
import PetForm from '../components/PetForm.jsx';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, PawPrint, Sparkles, Edit, Trash2, Plus } from 'lucide-react';

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
      const meRole = me.data.user?.role || me.data?.role;
      // Admins should see all pets; otherwise show only owner's pets
      if (meRole === 'admin') {
        setPets(items);
      } else {
        const myPets = (items || []).filter((p) => p.owner === userId || (p.owner && p.owner._id === userId));
        setPets(myPets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaved = () => {
    setCreating(false);
    setEditing(null);
    load();
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

  if (loading) {
    return (
      <section className="section">
        <div className="page-card centered-panel">Loading your pets...</div>
      </section>
    );
  }

  return (
    <div className="section pet-profile-page">
      <section className="module-detail-hero pet-profile-hero">
        <div>
          <p className="eyebrow">Pet management</p>
          <h1>My pets</h1>
          <p>
            Keep pet profiles organized with photos, vaccination status, health notes, and quick edit actions.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setCreating(true)} type="button">
              <Plus size={18} /> Add pet
            </button>
            <button className="ghost-button" onClick={() => navigate('/modules/health')} type="button">
              <Sparkles size={16} /> Health module
            </button>
          </div>
        </div>

        <div className="pet-hero-media">
          <img src={heroImage} alt="Happy pets" className="pet-hero-image" />
        </div>
      </section>

      {creating && (
        <div className="page-card pet-form-shell">
          <div className="pet-form-head">
            <h2>Add new pet</h2>
            <button className="ghost-button compact" type="button" onClick={() => setCreating(false)}>Close</button>
          </div>
          <PetForm onSaved={handleSaved} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="page-card pet-form-shell">
          <div className="pet-form-head">
            <h2>Edit {editing.name}</h2>
            <button className="ghost-button compact" type="button" onClick={() => setEditing(null)}>Close</button>
          </div>
          <PetForm initial={editing} onSaved={handleSaved} onCancel={() => setEditing(null)} />
        </div>
      )}

      {pets.length > 0 && (
        <div className="pet-profile-grid">
          {pets.map((pet) => (
            <article key={pet._id} className="pet-profile-card">
              <div className="pet-card-media">
                {pet.images && pet.images[0] ? (
                  <img src={getUploadUrl(pet.images[0])} alt={pet.name} className="pet-photo" />
                ) : (
                  <div className="pet-photo-fallback">
                    <PawPrint size={42} />
                    <p>No photo</p>
                  </div>
                )}
                <span className="pet-species-badge"><PawPrint size={14} /> {pet.species}</span>
              </div>

              <div className="pet-card-body">
                <h3>{pet.name}</h3>
                <div className="pet-meta-grid">
                  <div><strong>Breed:</strong> {pet.breed || 'Not set'}</div>
                  <div><strong>Age:</strong> {pet.age != null ? `${pet.age} years` : 'Unknown'}</div>
                  <div><strong>Gender:</strong> {pet.gender || 'Unknown'}</div>
                </div>

                <div className={`pet-vaccination-status ${pet.vaccinationStatus === 'up-to-date' ? 'ok' : 'warn'}`}>
                  <CalendarClock size={16} /> Vaccination: {pet.vaccinationStatus || 'Unknown'}
                </div>

                <div className="pet-card-actions">
                  <button onClick={() => setEditing(pet)} className="primary-button compact" type="button">
                    <Edit size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(pet._id)} className="danger-button" type="button">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {pets.length === 0 && !creating && !editing && (
        <section className="pet-empty-state page-card">
          <img src={emptyStateImage} alt="Add your first pet" className="pet-empty-image" />
          <div>
            <h2>No pets yet</h2>
            <p>
              Start managing your pets today. Add photos, health information, vaccination records, and more.
            </p>
            <button onClick={() => setCreating(true)} className="primary-button" type="button">
              <Plus size={20} /> Add your first pet
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
