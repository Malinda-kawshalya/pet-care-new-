import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const initialForm = { pet: "", provider: "", serviceType: "vet", scheduledAt: "", notes: "", location: "" };

export default function Appointments() {
  const [pets, setPets] = useState([]);
  const [providers, setProviders] = useState([]);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [petsResp, appointmentsResp] = await Promise.all([api.get("/pets"), api.get("/appointments")]);
      setPets(petsResp.data.items || petsResp.data || []);
      setAppointments(appointmentsResp.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async (serviceType) => {
    const resp = await api.get(`/appointments/providers?serviceType=${serviceType}`);
    setProviders(resp.data.items || []);
  };

  useEffect(() => {
    load();
    loadProviders(form.serviceType);
  }, []);

  useEffect(() => {
    loadProviders(form.serviceType);
  }, [form.serviceType]);

  useEffect(() => {
    if (!form.provider || !form.scheduledAt) return;
    const date = form.scheduledAt.slice(0, 10);
    api.get(`/appointments/slots?providerId=${form.provider}&date=${date}`).then((resp) => setSlots(resp.data.items || []));
  }, [form.provider, form.scheduledAt]);

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/appointments", form);
    setForm(initialForm);
    setSlots([]);
    load();
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/appointments/${id}`, { status });
    load();
  };

  if (loading) return <div className="section">Loading appointments...</div>;

  return (
    <div className="section">
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Appointments</p>
          <h1>Book services and manage visits</h1>
          <p>Book vet, grooming, or training visits, then keep the full booking history in one place.</p>
        </div>
        <Link to="/dashboard" className="secondary-link">Open dashboard</Link>
      </div>

      <div className="grid-two" style={{ alignItems: "start" }}>
        <form className="module-card" onSubmit={submit}>
          <h2 style={{ marginTop: 0 }}>Create booking</h2>
          <label>Pet</label>
          <select value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} required>
            <option value="">Select pet</option>
            {pets.map((pet) => <option key={pet._id} value={pet._id}>{pet.name}</option>)}
          </select>
          <label>Service</label>
          <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value, provider: "" })}>
            <option value="vet">Veterinarian</option>
            <option value="grooming">Groomer</option>
            <option value="training">Trainer</option>
          </select>
          <label>Provider</label>
          <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} required>
            <option value="">Select provider</option>
            {providers.map((provider) => <option key={provider._id} value={provider._id}>{provider.name} {provider.providerProfile?.businessName ? `(${provider.providerProfile.businessName})` : ""}</option>)}
          </select>
          <label>Time</label>
          <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
          <label>Location</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Clinic or address" />
          <label>Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="4" />
          <button className="primary-button" type="submit">Book appointment</button>
          {slots.length > 0 && <p style={{ marginTop: 12, color: "var(--muted)" }}>Available half-hour slots: {slots.join(", ")}</p>}
        </form>

        <div className="stack-gap">
          {appointments.map((appointment) => (
            <article key={appointment._id} className="module-card">
              <h3 style={{ marginTop: 0 }}>{appointment.pet?.name || "Pet"} with {appointment.provider?.name || "provider"}</h3>
              <p>{appointment.serviceType} • {new Date(appointment.scheduledAt).toLocaleString()}</p>
              <p>{appointment.status}</p>
              <div className="button-row">
                <button className="ghost-button" type="button" onClick={() => updateStatus(appointment._id, "confirmed")}>Confirm</button>
                <button className="danger-button" type="button" onClick={() => updateStatus(appointment._id, "cancelled")}>Cancel</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}