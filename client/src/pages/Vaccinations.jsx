import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useUserRole } from '../hooks/useAuth.js';

export default function Vaccinations() {
  const [vaccs, setVaccs] = useState([]);
  const [petId, setPetId] = useState('');
  const [form, setForm] = useState({ pet: '', vaccineName: '', administeredDate: '', nextDueDate: '' });
  const { isVet } = useUserRole();

  async function load() {
    try { const res = await api.get('/vaccinations', { params: { petId: petId || undefined } }); setVaccs(res.data.items || []); } catch (e) { console.error(e); }
  }

  useEffect(() => { load(); }, [petId]);

  async function submit(e) {
    e.preventDefault();
    try { await api.post('/vaccinations', form); setForm({ pet: '', vaccineName: '', administeredDate: '', nextDueDate: '' }); load(); } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  }

  async function sendReminders() {
    try { const res = await api.post('/vaccinations/reminders'); alert(`Reminders sent: ${res.data.created.length}`); } catch (e) { alert('Failed to send reminders'); }
  }

  return (
    <section className="section">
      <h1>Vaccinations</h1>
      {isVet && (
        <form onSubmit={submit} style={{ marginBottom: 12 }}>
          <label>Pet ID<input value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} required /></label>
          <label>Vaccine Name<input value={form.vaccineName} onChange={(e) => setForm({ ...form, vaccineName: e.target.value })} required /></label>
          <label>Administered Date<input type="date" value={form.administeredDate} onChange={(e) => setForm({ ...form, administeredDate: e.target.value })} /></label>
          <label>Next Due Date<input type="date" value={form.nextDueDate} onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })} required /></label>
          <button className="primary-button" type="submit">Schedule</button>
        </form>
      )}

      <div>
        <label>Filter by Pet ID<input value={petId} onChange={(e) => setPetId(e.target.value)} /></label>
        <button onClick={() => setPetId('')}>Clear</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={load}>Refresh</button>
        <button onClick={sendReminders} style={{ marginLeft: 8 }}>Send Reminders</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {vaccs.map(v => (
          <div key={v._id} className="module-card">
            <h3>{v.vaccineName}</h3>
            <p>Pet: {v.pet?.name || v.pet}</p>
            <p>Next due: {new Date(v.nextDueDate).toLocaleDateString()}</p>
            <p>Status: {v.status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
