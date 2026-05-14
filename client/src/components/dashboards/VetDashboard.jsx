import React, { useState } from 'react';
import DashboardSidebar from '../DashboardSidebar.jsx';

const VetDashboard = () => {
  const [todayAppointments] = useState([
    { id: 1, petName: 'Max', owner: 'John Doe', time: '10:00 AM', type: 'Checkup', status: 'Completed' },
    { id: 2, petName: 'Bella', owner: 'Jane Smith', time: '11:30 AM', type: 'Vaccination', status: 'In Progress' },
    { id: 3, petName: 'Charlie', owner: 'Bob Johnson', time: '2:00 PM', type: 'Surgery Follow-up', status: 'Pending' }
  ]);

  const [patients] = useState([
    { id: 1, petName: 'Max', owner: 'John Doe', breed: 'Golden Retriever', lastVisit: '2025-05-10', nextDue: '2025-06-10' },
    { id: 2, petName: 'Bella', owner: 'Jane Smith', breed: 'Labrador', lastVisit: '2025-05-15', nextDue: '2025-06-15' }
  ]);

  return (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar />
      <div className="dashboard-container">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Veterinarian workspace</p>
          <h1>Veterinarian Dashboard</h1>
          <p>Manage schedules, patients, records, and services from a single clinical view.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>3</h3>
            <p>Today's Appointments</p>
          </div>
          <div className="stat-card">
            <h3>24</h3>
            <p>Active Patients</p>
          </div>
          <div className="stat-card">
            <h3>12</h3>
            <p>Pending Records</p>
          </div>
          <div className="stat-card">
            <h3>4.8★</h3>
            <p>Average Rating</p>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="widget">
          <div className="widget-header">
            <h2>Today's Schedule</h2>
            <button className="btn-primary" type="button">+ Add Appointment</button>
          </div>
          <div className="schedule-list">
            {todayAppointments.map(apt => (
              <div key={apt.id} className="schedule-item">
                <div className="time-badge">{apt.time}</div>
                <div className="appointment-details">
                  <h3>{apt.petName}</h3>
                  <p>Owner: {apt.owner}</p>
                  <p>Type: {apt.type}</p>
                </div>
                <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                <button className="btn-small">Manage</button>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Management */}
        <div className="widget">
          <div className="widget-header">
            <h2>My Patients</h2>
            <button className="btn-primary" type="button">+ Add Patient</button>
          </div>
          <div className="patients-list">
            {patients.map(patient => (
              <div key={patient.id} className="patient-card">
                <div className="patient-info">
                  <h3>{patient.petName}</h3>
                  <p>Owner: {patient.owner}</p>
                  <p>Breed: {patient.breed}</p>
                  <p>Last Visit: {patient.lastVisit}</p>
                </div>
                <div className="patient-actions">
                  <button className="btn-small">View Records</button>
                  <button className="btn-small">Medical History</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Records */}
        <div className="widget">
          <div className="widget-header">
            <h2>Recent Medical Records</h2>
            <button className="btn-primary" type="button">+ Add Record</button>
          </div>
          <div className="records-list">
            <div className="record-item">
              <span className="record-type">Vaccination</span>
              <span>Max - Rabies Vaccine</span>
              <span className="date">2025-05-15</span>
            </div>
            <div className="record-item">
              <span className="record-type">Prescription</span>
              <span>Bella - Antibiotics</span>
              <span className="date">2025-05-14</span>
            </div>
            <div className="record-item">
              <span className="record-type">Surgery Notes</span>
              <span>Charlie - Dental Cleaning</span>
              <span className="date">2025-05-13</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="widget quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">📋 New Record</button>
            <button className="action-btn">💊 Add Prescription</button>
            <button className="action-btn">📧 Send Reminder</button>
            <button className="action-btn">💬 Messages</button>
            <button className="action-btn">⏰ Manage Hours</button>
            <button className="action-btn">📊 Analytics</button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="widget">
          <h2>Upcoming Appointments (Next 7 Days)</h2>
          <div className="upcoming-list">
            <div className="upcoming-item">
              <span className="date">May 20</span>
              <span>Rocky - Follow-up</span>
              <span>2:00 PM</span>
            </div>
            <div className="upcoming-item">
              <span className="date">May 21</span>
              <span>Buddy - Vaccination</span>
              <span>10:30 AM</span>
            </div>
            <div className="upcoming-item">
              <span className="date">May 22</span>
              <span>Lucy - Checkup</span>
              <span>11:00 AM</span>
            </div>
          </div>
        </div>

        {/* Services & Pricing */}
        <div className="widget">
          <h2>Services & Pricing</h2>
          <div className="services-list">
            <div className="service-item">
              <span>Regular Checkup</span>
              <span>$50</span>
            </div>
            <div className="service-item">
              <span>Vaccination</span>
              <span>$30</span>
            </div>
            <div className="service-item">
              <span>Dental Cleaning</span>
              <span>$150</span>
            </div>
            <button className="btn-primary" type="button">Edit Services</button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default VetDashboard;
