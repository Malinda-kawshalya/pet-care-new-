import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useUserRole } from '../hooks/useAuth.js';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [petId, setPetId] = useState('');
  const [form, setForm] = useState({ pet: '', diagnosis: '', treatment: '', prescriptions: [], documents: [], vetNotes: '' });
  const [uploading, setUploading] = useState(false);
  const { isVet } = useUserRole();

  async function load() {
    try {
      const res = await api.get('/medical-records', { params: { petId: petId || undefined } });
      setRecords(res.data.items || []);
    } catch (err) { console.error(err); }
  }

  useEffect(() => { load(); }, [petId]);

  async function handleUpload(e) {
    const f = e.target.files[0]; if (!f) return;
    const fd = new FormData(); fd.append('file', f);
    try { setUploading(true); const { data } = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); setForm((s) => ({ ...s, documents: [...(s.documents || []), data.file.path || data.file.filename] })); } catch (e) { console.error(e); } finally { setUploading(false); }
  }

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post('/medical-records', form);
      setForm({ pet: '', diagnosis: '', treatment: '', prescriptions: [], documents: [], vetNotes: '' });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); }
  }

  return (
    <section className="section">
      <h1>Medical Records</h1>
      {isVet ? (
        <form onSubmit={submit} style={{ marginBottom: 12 }}>
          <label>Pet ID<input value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} /></label>
          <label>Diagnosis<textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></label>
          <label>Treatment<textarea value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} /></label>
          <label>Prescriptions (comma separated)<input value={(form.prescriptions||[]).join(',')} onChange={(e) => setForm({ ...form, prescriptions: e.target.value.split(',').map(s=>s.trim()) })} /></label>
          <label>Upload documents<input type="file" onChange={handleUpload} /></label>
          <button className="primary-button" type="submit">Save Record</button>
        </form>
      ) : null}

      <div>
        <label>Filter by Pet ID<input value={petId} onChange={(e) => setPetId(e.target.value)} /></label>
        <button onClick={() => setPetId('')}>Clear</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {records.map(r => (
          <div key={r._id} className="module-card">
            <h3>{r.diagnosis || 'Medical record'}</h3>
            <p><strong>Pet:</strong> {r.pet?.name || r.pet}</p>
            <p><strong>Vet notes:</strong> {r.vetNotes}</p>
            <p><strong>Prescriptions:</strong> {(r.prescriptions||[]).join(', ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
