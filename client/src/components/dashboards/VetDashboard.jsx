import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity,
  CalendarClock,
  ClipboardPlus,
  Clock3,
  HeartPulse,
  MailPlus,
  Pill,
  Plus,
  ShieldCheck,
  Stethoscope,
  Syringe
} from 'lucide-react';
import api from '../../services/api.js';
import DashboardSidebar from '../DashboardSidebar.jsx';
import './Dashboard.css';

const patientsSeed = [
  { id: 1, petName: 'Max', owner: 'John Doe', breed: 'Golden Retriever', lastVisit: '2025-05-10', nextDue: '2025-06-10', risk: 'Healthy', age: '5 years' },
  { id: 2, petName: 'Bella', owner: 'Jane Smith', breed: 'Labrador', lastVisit: '2025-05-15', nextDue: '2025-06-15', risk: 'Vaccine due', age: '3 years' },
  { id: 3, petName: 'Charlie', owner: 'Bob Johnson', breed: 'Beagle', lastVisit: '2025-05-13', nextDue: '2025-05-27', risk: 'Follow-up', age: '7 years' }
];

const records = [
  { type: 'Vaccination', pet: 'Max', detail: 'Rabies Vaccine', date: '2025-05-15', icon: Syringe },
  { type: 'Prescription', pet: 'Bella', detail: 'Antibiotics', date: '2025-05-14', icon: Pill },
  { type: 'Surgery Notes', pet: 'Charlie', detail: 'Dental Cleaning', date: '2025-05-13', icon: ClipboardPlus }
];

const services = [
  { label: 'Regular Checkup', price: '$50', icon: Stethoscope },
  { label: 'Vaccination', price: '$30', icon: Syringe },
  { label: 'Dental Cleaning', price: '$150', icon: ClipboardPlus }
];

const quickActions = [
  { label: 'New Record', detail: 'Add diagnosis or notes', icon: ClipboardPlus, to: '/dashboard/vet?section=records', color: 'blue' },
  { label: 'Prescription', detail: 'Create medicine plan', icon: Pill, to: '/dashboard/vet?section=records', color: 'amber' },
  { label: 'Reminder', detail: 'Send owner follow-up', icon: MailPlus, to: '/notifications', color: 'purple' },
  { label: 'Clinic Hours', detail: 'Update availability', icon: Clock3, to: '/account', color: 'cyan' },
  { label: 'Analytics', detail: 'Review care activity', icon: Activity, to: '/dashboard/vet', color: 'emerald' }
];

function isSameDay(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear()
    && dateA.getMonth() === dateB.getMonth()
    && dateA.getDate() === dateB.getDate();
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
}

function normalizeAppointment(appointment) {
  return {
    id: appointment._id,
    petName: appointment.pet?.name || 'Pet',
    owner: appointment.owner?.name || 'Pet owner',
    time: formatTime(appointment.scheduledAt),
    date: formatDate(appointment.scheduledAt),
    type: appointment.serviceType === 'vet' ? 'Veterinary visit' : appointment.serviceType,
    status: appointment.status || 'pending',
    note: appointment.notes || 'No notes added by the pet owner.',
    scheduledAt: appointment.scheduledAt
  };
}

const VetDashboard = () => {
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [patients] = useState(patientsSeed);
  const activeSection = searchParams.get('section') || 'overview';

  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      setAppointmentsLoading(true);
      setAppointmentsError('');
      try {
        const { data } = await api.get('/appointments');
        if (!active) return;
        setAppointments(data.items || []);
      } catch (error) {
        if (!active) return;
        setAppointmentsError(error.response?.data?.message || 'Unable to load veterinarian appointments.');
      } finally {
        if (active) setAppointmentsLoading(false);
      }
    }

    loadAppointments();
    return () => {
      active = false;
    };
  }, []);

  const normalizedAppointments = useMemo(
    () => appointments.map(normalizeAppointment),
    [appointments]
  );

  const todayAppointments = useMemo(() => {
    const today = new Date();
    return normalizedAppointments
      .filter((appointment) => isSameDay(new Date(appointment.scheduledAt), today))
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  }, [normalizedAppointments]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    return normalizedAppointments
      .filter((appointment) => {
        const scheduledAt = new Date(appointment.scheduledAt);
        return scheduledAt >= now && scheduledAt <= nextWeek;
      })
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
      .slice(0, 6);
  }, [normalizedAppointments]);

  const summary = useMemo(() => {
    const pendingAppointments = normalizedAppointments.filter((item) => ['pending', 'confirmed'].includes(item.status)).length;
    const pendingRecords = records.length;

    return [
      { label: "Today's Appointments", value: todayAppointments.length, icon: CalendarClock, tone: 'blue', meta: `${pendingAppointments} active bookings` },
      { label: 'Active Patients', value: 24, icon: HeartPulse, tone: 'teal', meta: `${patients.length} recently reviewed` },
      { label: 'Pending Records', value: pendingRecords, icon: ClipboardPlus, tone: 'amber', meta: 'Need clinical notes' },
      { label: 'Average Rating', value: '4.8', icon: ShieldCheck, tone: 'rose', meta: 'Trusted provider' }
    ];
  }, [normalizedAppointments, patients.length, todayAppointments.length]);

  const sectionCopy = {
    overview: {
      eyebrow: 'Veterinarian workspace',
      title: 'Good afternoon, Doctor',
      text: "Review today's visits, manage patient records, and keep owner follow-ups moving from one calm clinical dashboard."
    },
    appointments: {
      eyebrow: 'Appointments',
      title: 'Appointments workspace',
      text: 'Track today’s visits, see what is coming next, and prepare notes before each patient arrives.'
    },
    records: {
      eyebrow: 'Medical records',
      title: 'Medical reports workspace',
      text: 'Review recent vaccinations, prescriptions, and surgery notes before adding the next clinical update.'
    },
    patients: {
      eyebrow: 'Patients',
      title: 'Patient management',
      text: 'Scan active patients, owner details, care risk, and upcoming due dates from one organized list.'
    }
  };

  const currentCopy = sectionCopy[activeSection] || sectionCopy.overview;
  const showOverview = activeSection === 'overview';
  const showAppointments = showOverview || activeSection === 'appointments';
  const showRecords = showOverview || activeSection === 'records';
  const showPatients = showOverview || activeSection === 'patients';

  return (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar />
      <div className="dashboard-container vet-dashboard">
        <div className="dashboard-hero vet-hero">
          <div>
            <p className="eyebrow">{currentCopy.eyebrow}</p>
            <h1>{currentCopy.title}</h1>
            <p>{currentCopy.text}</p>
          </div>
        </div>

        <div className={`dashboard-grid vet-dashboard-grid ${showOverview ? '' : 'vet-section-grid'}`}>
          <div className="stats-section vet-stats">
            {summary.map(({ label, value, icon: Icon, tone, meta }) => (
              <article className={`stat-card vet-stat tone-${tone}`} key={label}>
                <span className="vet-stat-icon"><Icon size={20} /></span>
                <div>
                  <h3>{value}</h3>
                  <p>{label}</p>
                  <small>{meta}</small>
                </div>
              </article>
            ))}
          </div>

          {showAppointments && <section className="widget vet-schedule-widget">
            <div className="widget-header">
              <div>
                <h2>Today's Schedule</h2>
                <p className="widget-subtitle">Live appointments booked by pet owners for your clinic.</p>
              </div>
              <Link className="btn-small" to="/dashboard/vet?section=appointments">View calendar</Link>
            </div>
            {appointmentsError && <div className="form-alert error">{appointmentsError}</div>}
            <div className="schedule-list vet-timeline">
              {appointmentsLoading && <p className="muted-text">Loading appointments...</p>}
              {!appointmentsLoading && todayAppointments.length === 0 && (
                <div className="alert alert-info">
                  <span className="alert-icon"><CalendarClock size={22} /></span>
                  <div className="alert-content">
                    <h3>No appointments today</h3>
                    <p>New pet owner bookings for today will appear here automatically.</p>
                  </div>
                </div>
              )}
              {!appointmentsLoading && todayAppointments.map((apt) => (
                <article key={apt.id} className="schedule-item vet-schedule-card">
                  <div className="time-badge">{apt.time}</div>
                  <div className="appointment-details">
                    <div className="vet-card-title-row">
                      <h3>{apt.petName}</h3>
                      <span className={`status ${apt.status.toLowerCase().replace(/\s+/g, '-')}`}>{apt.status}</span>
                    </div>
                    <p>{apt.type} with {apt.owner}</p>
                    <small>{apt.note}</small>
                  </div>
                  <button className="btn-small" type="button">Manage</button>
                </article>
              ))}
            </div>
          </section>}

          {showPatients && <section className="widget vet-patient-widget">
            <div className="widget-header">
              <div>
                <h2>Patient Queue</h2>
                <p className="widget-subtitle">Recent patients and next care due dates.</p>
              </div>
            </div>
            <div className="patients-list vet-patient-list">
              {patients.map((patient) => (
                <article key={patient.id} className="patient-card vet-patient-card">
                  <div className="patient-avatar" aria-hidden="true">
                    {patient.petName.charAt(0)}
                  </div>
                  <div className="patient-info">
                    <div className="vet-card-title-row">
                      <h3>{patient.petName}</h3>
                      <span className="status healthy">{patient.risk}</span>
                    </div>
                    <p>{patient.breed} - Owner: {patient.owner}</p>
                    <small>Last visit {patient.lastVisit} - Next due {patient.nextDue}</small>
                  </div>
                  <div className="patient-actions">
                    <button className="btn-small" type="button">Records</button>
                    <button className="btn-small" type="button">History</button>
                  </div>
                </article>
              ))}
            </div>
          </section>}

          {showOverview && <section className="widget quick-actions vet-quick-actions">
            <div className="widget-header">
              <div>
                <h2>Quick Actions</h2>
                <p className="widget-subtitle">Common clinical tasks in one tap.</p>
              </div>
              <Stethoscope size={20} />
            </div>
            <div className="actions-grid">
              {quickActions.map(({ label, detail, icon: Icon, to }) => (
                <Link key={label} className="action-btn action-btn-link" to={to}>
                  <Icon size={18} />
                  <strong className="action-btn-title">{label}</strong>
                  <span className="action-btn-detail">{detail}</span>
                </Link>
              ))}
            </div>
          </section>}

          {showRecords && <section className="widget">
            <div className="widget-header">
              <div>
                <h2>Recent Medical Records</h2>
                <p className="widget-subtitle">Latest care updates added to patient files.</p>
              </div>
              <Link className="btn-primary" to="/dashboard/vet?section=records"><Plus size={15} /> Report add</Link>
            </div>
            <div className="records-list vet-record-list">
              {records.map((record) => (
                <article className="record-item" key={`${record.pet}-${record.type}`}>
                  <span className="record-type">{record.type}</span>
                  <span>{record.pet} - {record.detail}</span>
                  <span className="date">{record.date}</span>
                </article>
              ))}
            </div>
          </section>}

          {showAppointments && <section className="widget">
            <div className="widget-header">
              <div>
                <h2>Next 7 Days</h2>
                <p className="widget-subtitle">Appointments that need preparation.</p>
              </div>
              <CalendarClock size={19} />
            </div>
            <div className="upcoming-list">
              {appointmentsLoading && <p className="muted-text">Loading upcoming appointments...</p>}
              {!appointmentsLoading && upcomingAppointments.length === 0 && (
                <div className="alert alert-info">
                  <span className="alert-icon"><CalendarClock size={22} /></span>
                  <div className="alert-content">
                    <h3>No upcoming appointments</h3>
                    <p>Appointments booked for the next seven days will show here.</p>
                  </div>
                </div>
              )}
              {!appointmentsLoading && upcomingAppointments.map((appointment) => (
                <article className="upcoming-item" key={appointment.id}>
                  <span className="date">{appointment.date}</span>
                  <span>{appointment.petName} - {appointment.type}</span>
                  <strong>{appointment.time}</strong>
                </article>
              ))}
            </div>
          </section>}

          {showOverview && <section className="widget vet-services-card">
            <div className="widget-header">
              <div>
                <h2>Services & Pricing</h2>
                <p className="widget-subtitle">Visible prices for pet owners.</p>
              </div>
              <Syringe size={19} />
            </div>
            <div className="services-list">
              {services.map((service) => (
                <div className="service-item" key={service.label}>
                  <span>{service.label}</span>
                  <span className="price">{service.price}</span>
                </div>
              ))}
              <button className="btn-primary" type="button">Edit services</button>
            </div>
          </section>}
        </div>
      </div>
    </div>
  );
};

export default VetDashboard;
