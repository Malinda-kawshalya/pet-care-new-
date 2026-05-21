import { useMemo, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
  Syringe,
  UserRoundPlus,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  PawPrint,
  ArrowRight
} from 'lucide-react';
import DashboardSidebar from '../DashboardSidebar.jsx';
import { formatLKR } from '../../utils/currency.js';
import './Dashboard.css';

const todayAppointmentsSeed = [
  { id: 1, petName: 'Max', owner: 'John Doe', time: '10:00 AM', type: 'Checkup', status: 'completed', note: 'Annual wellness exam complete.', priority: 'normal' },
  { id: 2, petName: 'Bella', owner: 'Jane Smith', time: '11:30 AM', type: 'Vaccination', status: 'in-progress', note: 'Rabies booster and weight review.', priority: 'high' },
  { id: 3, petName: 'Charlie', owner: 'Bob Johnson', time: '2:00 PM', type: 'Surgery Follow-up', status: 'pending', note: 'Dental cleaning recovery check.', priority: 'high' }
];

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

const upcomingAppointments = [
  { date: 'May 20', pet: 'Rocky', type: 'Follow-up', time: '2:00 PM', owner: 'Mike' },
  { date: 'May 21', pet: 'Buddy', type: 'Vaccination', time: '10:30 AM', owner: 'Sarah' },
  { date: 'May 22', pet: 'Lucy', type: 'Checkup', time: '11:00 AM', owner: 'Emma' }
];

const services = [
  { label: 'Regular Checkup', price: formatLKR(50), icon: Stethoscope },
  { label: 'Vaccination', price: formatLKR(30), icon: Syringe },
  { label: 'Dental Cleaning', price: formatLKR(150), icon: ClipboardPlus }
];

const quickActions = [
  { label: 'New Record', detail: 'Add diagnosis or notes', icon: ClipboardPlus, to: '/dashboard/vet?section=records', color: 'blue' },
  { label: 'Prescription', detail: 'Create medicine plan', icon: Pill, to: '/dashboard/vet?section=records', color: 'amber' },
  { label: 'Reminder', detail: 'Send owner follow-up', icon: MailPlus, to: '/notifications', color: 'purple' },
  { label: 'Clinic Hours', detail: 'Update availability', icon: Clock3, to: '/account', color: 'cyan' },
  { label: 'Analytics', detail: 'Review care activity', icon: Activity, to: '/dashboard/vet', color: 'emerald' }
];

const VetDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [todayAppointments] = useState(todayAppointmentsSeed);
  const [patients] = useState(patientsSeed);
  const activeSection = searchParams.get('section') || 'overview';

  const handleSectionChange = useCallback((section) => {
    setSearchParams({ section }, { replace: true });
  }, [setSearchParams]);

  const summary = useMemo(() => {
    const pendingAppointments = todayAppointments.filter((item) => item.status !== 'completed').length;
    const criticalPatients = patients.filter((p) => p.risk !== 'Healthy').length;

    return [
      { 
        label: "Today's Appointments", 
        value: todayAppointments.length, 
        icon: CalendarClock, 
        tone: 'blue', 
        meta: `${pendingAppointments} pending`,
        subtext: 'Click to manage'
      },
      { 
        label: 'Active Patients', 
        value: 24, 
        icon: HeartPulse, 
        tone: 'teal', 
        meta: `${criticalPatients} need attention`,
        subtext: 'View details'
      },
      { 
        label: 'Medical Records', 
        value: records.length, 
        icon: ClipboardPlus, 
        tone: 'amber', 
        meta: 'Recent updates',
        subtext: 'Add new record'
      },
      { 
        label: 'Quality Rating', 
        value: '4.8★', 
        icon: ShieldCheck, 
        tone: 'rose', 
        meta: 'Trusted provider',
        subtext: 'View feedback'
      }
    ];
  }, [patients.length, todayAppointments]);

  const sections = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'appointments', label: 'Schedule', icon: CalendarClock },
    { id: 'records', label: 'Records', icon: ClipboardPlus },
    { id: 'patients', label: 'Patients', icon: PawPrint }
  ];

  const sectionCopy = {
    overview: {
      eyebrow: 'Welcome back',
      title: 'Your Clinic Dashboard',
      text: "Quick overview of today's schedule, patient care status, and important updates."
    },
    appointments: {
      eyebrow: 'Schedule Management',
      title: 'Today s Appointments',
      text: 'View and manage all appointments. Prepare notes before each patient arrives.'
    },
    records: {
      eyebrow: 'Medical Records',
      title: 'Patient Records',
      text: 'Access vaccination records, prescriptions, and clinical notes.'
    },
    patients: {
      eyebrow: 'Patient Management',
      title: 'Patient Directory',
      text: 'View all active patients, care plans, and health status.'
    }
  };

  const currentCopy = sectionCopy[activeSection] || sectionCopy.overview;
  const showOverview = activeSection === 'overview';
  const showAppointments = showOverview || activeSection === 'appointments';
  const showRecords = showOverview || activeSection === 'records';
  const showPatients = showOverview || activeSection === 'patients';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'in-progress':
        return <Clock size={16} className="text-blue-500" />;
      case 'pending':
        return <AlertCircle size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'in-progress':
        return 'in-progress';
      case 'pending':
        return 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar />
      <div className="dashboard-container vet-dashboard">
        {/* Hero Section */}
        <div className="dashboard-hero vet-hero">
          <div className="hero-content">
            <p className="eyebrow">{currentCopy.eyebrow}</p>
            <h1>{currentCopy.title}</h1>
            <p>{currentCopy.text}</p>
          </div>
          <div className="dashboard-actions">
            <button 
              className="btn-primary" 
              onClick={() => handleSectionChange('appointments')}
            >
              <Plus size={16} /> Schedule Appointment
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="section-tabs">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className={`tab-btn ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => handleSectionChange(section.id)}
              >
                <Icon size={18} />
                <span>{section.label}</span>
                {activeSection === section.id && <div className="tab-indicator" />}
              </button>
            );
          })}
        </div>

        {/* Stats Cards */}
        <div className="dashboard-grid">
          <div className="stats-section vet-stats">
            {summary.map(({ label, value, icon: Icon, tone, meta, subtext }) => (
              <article 
                key={label} 
                className={`stat-card vet-stat tone-${tone} hoverable`}
                onClick={() => {
                  if (label === "Today's Appointments") handleSectionChange('appointments');
                  else if (label === 'Active Patients') handleSectionChange('patients');
                  else if (label === 'Medical Records') handleSectionChange('records');
                }}
                role="button"
                tabIndex={0}
              >
                <div className="stat-icon-wrapper">
                  <Icon size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{value}</div>
                  <h3 className="stat-label">{label}</h3>
                  <p className="stat-meta">{meta}</p>
                  <small className="stat-action">{subtext} <ArrowRight size={12} /></small>
                </div>
              </article>
            ))}
          </div>

          {/* Today's Schedule Section */}
          {showAppointments && (
            <section className="widget vet-schedule-widget">
              <div className="widget-header">
                <div>
                  <h2><CalendarClock size={20} /> Today's Schedule</h2>
                  <p className="widget-subtitle">{todayAppointments.length} appointments scheduled</p>
                </div>
                <Link className="btn-text" to="/dashboard/vet?section=appointments">
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              <div className="schedule-list vet-timeline">
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((apt) => (
                    <article key={apt.id} className={`schedule-item vet-schedule-card priority-${apt.priority}`}>
                      <div className="time-badge">
                        <Clock size={14} />
                        {apt.time}
                      </div>
                      <div className="appointment-details">
                        <div className="appointment-header">
                          <h3>{apt.petName}</h3>
                          <span className={`status-badge ${getStatusColor(apt.status)}`}>
                            {getStatusIcon(apt.status)}
                            <span>{apt.status}</span>
                          </span>
                        </div>
                        <p className="appointment-type">{apt.type} • with {apt.owner}</p>
                        <small className="appointment-note">{apt.note}</small>
                      </div>
                      <button className="btn-icon" type="button" aria-label="Manage appointment">
                        <ChevronRight size={18} />
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">
                    <CalendarClock size={32} />
                    <p>No appointments today</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Patient Queue Section */}
          {showPatients && (
            <section className="widget vet-patient-widget">
              <div className="widget-header">
                <div>
                  <h2><PawPrint size={20} /> Patient Queue</h2>
                  <p className="widget-subtitle">{patients.length} active patients</p>
                </div>
                <button className="btn-text" onClick={() => navigate('/dashboard/vet?section=patients')}>
                  <UserRoundPlus size={15} /> Add patient
                </button>
              </div>
              <div className="patients-list vet-patient-list">
                {patients.map((patient) => (
                  <article key={patient.id} className={`patient-card vet-patient-card risk-${patient.risk.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="patient-avatar">
                      {patient.petName.charAt(0)}
                    </div>
                    <div className="patient-info">
                      <div className="patient-header">
                        <h3>{patient.petName}</h3>
                        <span className={`risk-badge ${patient.risk.toLowerCase().replace(/\s+/g, '-')}`}>
                          {patient.risk}
                        </span>
                      </div>
                      <p className="patient-details">{patient.breed} • Age: {patient.age}</p>
                      <p className="owner-info">Owner: {patient.owner}</p>
                      <small className="visit-dates">
                        Last visit: {patient.lastVisit} • Due: {patient.nextDue}
                      </small>
                    </div>
                    <div className="patient-actions">
                      <button className="btn-small" type="button">Records</button>
                      <button className="btn-small" type="button">History</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Quick Actions */}
          {showOverview && (
            <section className="widget quick-actions vet-quick-actions">
              <div className="widget-header">
                <div>
                  <h2><Stethoscope size={20} /> Quick Actions</h2>
                  <p className="widget-subtitle">Common tasks</p>
                </div>
              </div>
              <div className="actions-grid">
                {quickActions.map(({ label, detail, icon: Icon, to }) => (
                  <Link key={label} className={`action-btn action-btn-link color-${label.toLowerCase().replace(/\s+/g, '-')}`} to={to}>
                    <div className="action-icon">
                      <Icon size={20} />
                    </div>
                    <div className="action-text">
                      <strong>{label}</strong>
                      <span>{detail}</span>
                    </div>
                    <ChevronRight size={14} className="action-arrow" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Medical Records Section */}
          {showRecords && (
            <section className="widget">
              <div className="widget-header">
                <div>
                  <h2><ClipboardPlus size={20} /> Medical Records</h2>
                  <p className="widget-subtitle">Latest updates</p>
                </div>
                <Link className="btn-text" to="/dashboard/vet?section=records">
                  <Plus size={14} /> Add record
                </Link>
              </div>
              <div className="records-list vet-record-list">
                {records.map((record) => {
                  const RecordIcon = record.icon;
                  return (
                    <article className="record-item" key={`${record.pet}-${record.type}`}>
                      <div className="record-icon">
                        <RecordIcon size={18} />
                      </div>
                      <div className="record-content">
                        <h4>{record.type}</h4>
                        <p>{record.pet} • {record.detail}</p>
                      </div>
                      <span className="record-date">{record.date}</span>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Upcoming Appointments */}
          {showAppointments && (
            <section className="widget">
              <div className="widget-header">
                <div>
                  <h2><TrendingUp size={20} /> Next 7 Days</h2>
                  <p className="widget-subtitle">Preparation checklist</p>
                </div>
              </div>
              <div className="upcoming-list">
                {upcomingAppointments.map((appointment) => (
                  <article className="upcoming-item" key={`${appointment.date}-${appointment.pet}`}>
                    <div className="upcoming-date">{appointment.date}</div>
                    <div className="upcoming-info">
                      <span className="pet-name">{appointment.pet}</span>
                      <span className="appointment-type-badge">{appointment.type}</span>
                    </div>
                    <span className="upcoming-time">
                      <Clock size={14} />
                      {appointment.time}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Services & Pricing */}
          {showOverview && (
            <section className="widget vet-services-card">
              <div className="widget-header">
                <div>
                  <h2><Syringe size={20} /> Services & Pricing</h2>
                  <p className="widget-subtitle">Reference for clients</p>
                </div>
              </div>
              <div className="services-list">
                {services.map((service) => {
                  const ServiceIcon = service.icon;
                  return (
                    <div className="service-item" key={service.label}>
                      <div className="service-info">
                        <ServiceIcon size={18} />
                        <span>{service.label}</span>
                      </div>
                      <span className="price">{service.price}</span>
                    </div>
                  );
                })}
                <button className="btn-primary" type="button">Edit services</button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default VetDashboard;
