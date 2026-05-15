import { useState } from 'react';
import api from '../services/api.js';
import { getUploadUrl } from '../utils/media.js';

export default function PetForm({ initial = null, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    gender: 'unknown',
    vaccinationStatus: 'unknown',
    medicalHistory: '',
    images: []
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    try {
      setUploading(true);
      const { data: res } = await api.post('/uploads', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      const path = res.file?.path || res.file?.filename || '';
      // store relative path
      setForm((f) => ({ ...f, images: [...(f.images || []), path] }));
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (initial && initial._id) {
        const { data } = await api.put(`/pets/${initial._id}`, form);
        onSaved && onSaved(data.item || data);
      } else {
        const { data } = await api.post('/pets', form);
        onSaved && onSaved(data.item || data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  return (
    <form className="auth-form account-form" onSubmit={submit}>
      {error && <div className="form-alert error">{error}</div>}
      <div className="split-fields">
        <label>Name<input required name="name" value={form.name} onChange={handleChange} /></label>
        <label>Species
          <select name="species" value={form.species} onChange={handleChange}>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="fish">Fish</option>
            <option value="rabbit">Rabbit</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <div className="split-fields">
        <label>Breed<input name="breed" value={form.breed} onChange={handleChange} /></label>
        <label>Age<input type="number" min="0" name="age" value={form.age} onChange={handleChange} /></label>
      </div>

      <div className="split-fields">
        <label>Gender
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label>Vaccination Status
          <select name="vaccinationStatus" value={form.vaccinationStatus} onChange={handleChange}>
            <option value="upToDate">Up to date</option>
            <option value="dueSoon">Due soon</option>
            <option value="overdue">Overdue</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
      </div>

      <label>Medical history<textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange} /></label>

      <label>Images
        <input type="file" accept="image/*" onChange={handleFile} />
      </label>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {(form.images || []).map((img, idx) => (
          <div key={idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line)' }}>
            <img src={getUploadUrl(img)} alt="pet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px' }}>x</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="primary-button" type="submit">Save</button>
        <button className="ghost-button" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
