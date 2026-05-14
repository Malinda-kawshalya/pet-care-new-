import { useEffect, useState } from 'react';
import api from '../services/api.js';
import PetForm from '../components/PetForm.jsx';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarClock, PawPrint, Sparkles } from 'lucide-react';

const heroImage = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1400&q=85';

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

  if (loading) return <div>Loading pets...</div>;

  return (
    <div className="section pet-profile-page">
      <section className="module-detail-hero pet-profile-hero">
        <div>
          <p className="eyebrow">Pet management</p>
          <h1>My Pets</h1>
          <p>Keep every pet profile organized with photos, notes, vaccination status, and quick edit actions.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={handleCreate} type="button">
              <PawPrint size={17} /> Add Pet
            </button>
            <button className="ghost-button" onClick={() => navigate('/modules/health')} type="button">
              <Sparkles size={16} /> Open Health Module
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 12, maxWidth: 420, width: '100%' }}>
          <img
            src={heroImage}
            alt="Happy dog wearing a collar"
            style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 24, boxShadow: 'var(--shadow)' }}
          />
          <div className="hero-strip" style={{ gridColumn: 'auto', minHeight: 'auto' }}>
            <span>Photo-ready</span>
            <strong>Upload images, store notes, and keep pet records clean and presentation-ready.</strong>
            <span className="mini-badge"><ArrowRight size={16} /> Fast updates</span>
          </div>
        </div>
      </section>

      {creating && (
        <div style={{ maxWidth: 840, marginTop: 24 }}>
          <PetForm onSaved={handleSaved} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div style={{ maxWidth: 840, marginTop: 24 }}>
          <PetForm initial={editing} onSaved={handleSaved} onCancel={() => setEditing(null)} />
        </div>
      )}

      <div className="pet-profile-grid" style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        {pets.length === 0 && <div>No pets yet. Add your first pet.</div>}
        {pets.map((pet) => (
          <div key={pet._id} className="module-card pet-profile-card">
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 96, height: 96, borderRadius: 20, overflow: 'hidden', background: 'rgba(16,183,166,0.08)', flexShrink: 0 }}>
                {pet.images && pet.images[0] ? (
                  <img src={pet.images[0].startsWith('uploads') ? `/${pet.images[0]}` : pet.images[0]} alt="pet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ padding: 12, display: 'grid', placeItems: 'center', height: '100%', color: 'var(--muted)', fontWeight: 800 }}>{pet.species}</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>{pet.species}</p>
                <h3 style={{ margin: 0, fontSize: '1.45rem' }}>{pet.name}</h3>
                <div style={{ color: 'var(--muted)', marginTop: 6 }}>{pet.breed || 'Breed not set'} • {pet.age != null ? `${pet.age} yrs` : 'Age unknown'}</div>
                <div className="tag-list" style={{ marginTop: 12 }}>
                  <span><CalendarClock size={13} /> {pet.vaccinationStatus || 'unknown'}</span>
                  <span>{pet.gender || 'unknown'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="ghost-button" onClick={() => handleEdit(pet)}>Edit</button>
                <button className="danger-button" onClick={() => handleDelete(pet._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
