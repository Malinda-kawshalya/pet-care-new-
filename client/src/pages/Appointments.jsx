import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const initialForm = { petName: "", provider: "", scheduledAt: "" };

const timeSlots = [
  { label: "Today, 10:00 AM", value: "10:00" },
  { label: "Today, 11:30 AM", value: "11:30" },
  { label: "Today, 2:00 PM", value: "14:00" },
  { label: "Tomorrow, 9:30 AM", value: "tomorrow-09:30" },
  { label: "Tomorrow, 3:00 PM", value: "tomorrow-15:00" }
];

function slotToDateTime(slotValue) {
  const date = new Date();
  let time = slotValue;

  if (slotValue.startsWith("tomorrow-")) {
    date.setDate(date.getDate() + 1);
    time = slotValue.replace("tomorrow-", "");
  }

  const [hours, minutes] = time.split(":");
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toISOString();
}

export default function Appointments() {
  const [pets, setPets] = useState([]);
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [petsResp, appointmentsResp] = await Promise.all([api.get("/pets"), api.get("/appointments")]);
      setPets(petsResp.data.items || petsResp.data || []);
      setAppointments(appointmentsResp.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    const resp = await api.get("/appointments/providers?serviceType=vet");
    setProviders(resp.data.items || []);
  };

  useEffect(() => {
    load();
    loadProviders();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const selectedPet = pets.find((pet) => pet.name?.toLowerCase() === form.petName.trim().toLowerCase());
    if (!selectedPet) {
      setError("Enter a pet name that already exists in your pet profiles.");
      return;
    }

    await api.post("/appointments", {
      pet: selectedPet._id,
      provider: form.provider,
      serviceType: "vet",
      scheduledAt: slotToDateTime(form.scheduledAt)
    });
    setForm(initialForm);
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

      <div className="grid-two content-start">
        <form className="module-card appointment-form-card" onSubmit={submit}>
          <div className="appointment-form-heading">
            <p className="eyebrow">Quick booking</p>
            <h2>Create appointment</h2>
            <p>Choose the pet, veterinarian, and a preferred visit time.</p>
          </div>

          {error && <div className="form-alert error">{error}</div>}

          <label className="appointment-field">
            <span>Pet name</span>
            <input
              list="pet-name-options"
              value={form.petName}
              onChange={(e) => setForm({ ...form, petName: e.target.value })}
              placeholder="Type pet name"
              required
            />
            <datalist id="pet-name-options">
              {pets.map((pet) => <option key={pet._id} value={pet.name} />)}
            </datalist>
          </label>

          <label className="appointment-field">
            <span>Veterinarian</span>
            <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} required>
              <option value="">Select veterinarian</option>
              {providers.map((provider) => (
                <option key={provider._id} value={provider._id}>
                  {provider.name}
                  {provider.providerProfile?.businessName ? ` (${provider.providerProfile.businessName})` : ""}
                  {provider.approvalStatus && provider.approvalStatus !== "approved" ? ` - ${provider.approvalStatus}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="appointment-field">
            <span>Time slot</span>
            <select value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required>
              <option value="">Select time slot</option>
              {timeSlots.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
            </select>
          </label>

          <button className="primary-button appointment-submit" type="submit">Book appointment</button>
        </form>

        <div className="stack-gap">
          {appointments.map((appointment) => (
            <article key={appointment._id} className="module-card">
              <h3>{appointment.pet?.name || "Pet"} with {appointment.provider?.name || "provider"}</h3>
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
