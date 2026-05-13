import { useEffect, useState } from 'react';
import api from '../services/api.js';
import PetForm from '../components/PetForm.jsx';
import { useNavigate } from 'react-router-dom';

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
    <div className="page">
      <div className="section-header">
        <h2>My Pets</h2>
        <div>
          <button className="primary-button" onClick={handleCreate}>Add Pet</button>
        </div>
      </div>

      {creating && (
        <div style={{ maxWidth: 720 }}>
          <PetForm onSaved={handleSaved} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div style={{ maxWidth: 720 }}>
          <PetForm initial={editing} onSaved={handleSaved} onCancel={() => setEditing(null)} />
        </div>
      )}

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {pets.length === 0 && <div>No pets yet. Add your first pet.</div>}
        {pets.map((pet) => (
          <div key={pet._id} className="module-card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', background: '#eee' }}>
                {pet.images && pet.images[0] ? (
                  <img src={pet.images[0].startsWith('uploads') ? `/${pet.images[0]}` : pet.images[0]} alt="pet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ padding: 12 }}>{pet.species}</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{pet.name}</h3>
                <div style={{ color: 'var(--muted)' }}>{pet.breed || '—'} • {pet.age != null ? `${pet.age} yrs` : 'Age unknown'}</div>
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
