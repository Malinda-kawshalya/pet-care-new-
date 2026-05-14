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
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Medical records</p>
          <h1>Clinical notes and treatment history</h1>
          <p>Store diagnoses, prescriptions, and supporting files by pet profile.</p>
        </div>
      </div>

      {isVet ? (
        <form className="module-card panel-fields" onSubmit={submit}>
          <label>Pet ID<input value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} /></label>
          <label>Diagnosis<textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></label>
          <label>Treatment<textarea value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} /></label>
          <label>Prescriptions (comma separated)<input value={(form.prescriptions||[]).join(',')} onChange={(e) => setForm({ ...form, prescriptions: e.target.value.split(',').map(s=>s.trim()) })} /></label>
          <label>Upload documents<input type="file" onChange={handleUpload} /></label>
          {uploading && <small className="muted-text">Uploading document...</small>}
          <button className="primary-button" type="submit">Save Record</button>
        </form>
      ) : null}

      <div className="page-card panel-fields">
        <label>Filter by Pet ID<input value={petId} onChange={(e) => setPetId(e.target.value)} /></label>
        <div className="inline-actions">
          <button className="ghost-button" type="button" onClick={() => setPetId('')}>Clear</button>
        </div>
      </div>

      <div className="stack-gap top-gap-12">
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
