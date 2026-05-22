import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api.js';

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

export default function AppointmentBookingModal({ isOpen, onClose, pets, onSuccess }) {
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState({ petName: "", serviceType: "", provider: "", scheduledAt: "" });
  const [loading, setLoading] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      setProviders([]);
      setForm({ petName: "", serviceType: "", provider: "", scheduledAt: "" });
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !form.serviceType) return;
    loadProviders(form.serviceType);
  }, [isOpen, form.serviceType]);

  const loadProviders = async (serviceType) => {
    setProvidersLoading(true);
    try {
      const resp = await api.get(`/appointments/providers?serviceType=${serviceType}`);
      setProviders(resp.data.items || []);
    } catch (err) {
      console.error("Failed to load providers:", err);
      setProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  };

  const updateServiceType = (serviceType) => {
    setForm((current) => ({ ...current, serviceType, provider: "" }));
    setProviders([]);
  };

  const providerTypeLabel = form.serviceType === "grooming" ? "Groomer" : "Veterinarian";
  const providerPlaceholder = form.serviceType
    ? `Select a ${providerTypeLabel.toLowerCase()}`
    : "Select appointment type first";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const selectedPet = pets.find((pet) => pet.name?.toLowerCase() === form.petName.trim().toLowerCase());
      if (!selectedPet) {
        setError("Enter a pet name that already exists in your pet profiles.");
        setLoading(false);
        return;
      }

      await api.post("/appointments", {
        pet: selectedPet._id,
        provider: form.provider,
        serviceType: form.serviceType,
        scheduledAt: slotToDateTime(form.scheduledAt)
      });

      setSuccess("Appointment booked successfully!");
      setForm({ petName: "", serviceType: "", provider: "", scheduledAt: "" });
      setProviders([]);
      
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          maxWidth: '900px',
          width: '95%',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from {
              transform: translate(-50%, -48%);
              opacity: 0;
            }
            to {
              transform: translate(-50%, -50%);
              opacity: 1;
            }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)'
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Book Appointment</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>Select a veterinarian or groomer, then choose the provider name.</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#c00',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#efe',
              border: '1px solid #cfc',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#060',
              fontSize: '14px'
            }}>
              {success}
            </div>
          )}

          {/* Form Grid - 2 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Pet Name Field */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                Pet Name *
              </label>
              <input
                list="pet-name-options"
                value={form.petName}
                onChange={(e) => setForm({ ...form, petName: e.target.value })}
                placeholder="Type your pet's name"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
              <datalist id="pet-name-options">
                {pets.map((pet) => (
                  <option key={pet._id} value={pet.name} />
                ))}
              </datalist>
            </div>

            {/* Appointment Type Field */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                Appointment Type *
              </label>
              <select
                value={form.serviceType}
                onChange={(e) => updateServiceType(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="">Select veterinarian or groomer</option>
                <option value="vet">Veterinarian</option>
                <option value="grooming">Groomer</option>
              </select>
            </div>

            {/* Provider Field */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                {providerTypeLabel} Name *
              </label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                required
                disabled={!form.serviceType || providersLoading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="">{providersLoading ? "Loading providers..." : providerPlaceholder}</option>
                {providers.map((provider) => (
                  <option key={provider._id} value={provider._id}>
                    {provider.name}
                    {provider.providerProfile?.businessName ? ` (${provider.providerProfile.businessName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot Field - Full Width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                Time Slot *
              </label>
              <select
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                opacity: loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderRadius: '6px',
                background: '#0066cc',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
