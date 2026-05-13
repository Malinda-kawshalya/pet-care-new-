import React, { useState } from 'react';
import './Dashboard.css';

const PetOwnerDashboard = () => {
  const [pets, setPets] = useState([
    { id: 1, name: 'Max', breed: 'Golden Retriever', age: '3 years', vaccinated: true },
    { id: 2, name: 'Bella', breed: 'Labrador', age: '2 years', vaccinated: true }
  ]);

  const [appointments, setAppointments] = useState([
    { id: 1, service: 'Veterinary Checkup', date: '2025-05-20', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, service: 'Grooming', date: '2025-05-22', time: '2:00 PM', status: 'Pending' }
  ]);

  return (
    <div className="dashboard-container">
      <h1>Pet Owner Dashboard</h1>

      <div className="dashboard-grid">
        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>4</h3>
            <p>Total Pets</p>
          </div>
          <div className="stat-card">
            <h3>2</h3>
            <p>Upcoming Appointments</p>
          </div>
          <div className="stat-card">
            <h3>3</h3>
            <p>Vaccinations Due</p>
          </div>
          <div className="stat-card">
            <h3>$245</h3>
            <p>Total Spent</p>
          </div>
        </div>

        {/* My Pets Widget */}
        <div className="widget">
          <div className="widget-header">
            <h2>My Pets</h2>
            <button className="btn-primary">+ Add Pet</button>
          </div>
          <div className="pets-list">
            {pets.map(pet => (
              <div key={pet.id} className="pet-card">
                <div className="pet-info">
                  <h3>{pet.name}</h3>
                  <p>{pet.breed} • {pet.age}</p>
                  <span className={`status ${pet.vaccinated ? 'vaccinated' : 'not-vaccinated'}`}>
                    {pet.vaccinated ? '✓ Vaccinated' : 'Vaccination Pending'}
                  </span>
                </div>
                <div className="pet-actions">
                  <button className="btn-small">View Profile</button>
                  <button className="btn-small">Medical Records</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments Widget */}
        <div className="widget">
          <div className="widget-header">
            <h2>Upcoming Appointments</h2>
            <button className="btn-primary">+ Book Appointment</button>
          </div>
          <div className="appointments-list">
            {appointments.map(apt => (
              <div key={apt.id} className="appointment-card">
                <div className="appointment-info">
                  <h3>{apt.service}</h3>
                  <p>📅 {apt.date} at {apt.time}</p>
                  <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                </div>
                <div className="appointment-actions">
                  <button className="btn-small">Details</button>
                  <button className="btn-small">Reschedule</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="widget quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">📝 Medical Records</button>
            <button className="action-btn">🛒 Browse Store</button>
            <button className="action-btn">💑 Find a Mate</button>
            <button className="action-btn">🏠 Adoption Center</button>
            <button className="action-btn">💬 Messages</button>
            <button className="action-btn">📚 Community</button>
          </div>
        </div>

        {/* Health Alerts */}
        <div className="widget">
          <h2>Health Alerts</h2>
          <div className="alerts-list">
            <div className="alert alert-warning">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <h3>Vaccination Due</h3>
                <p>Max needs rabies vaccination by May 25, 2025</p>
              </div>
            </div>
            <div className="alert alert-info">
              <span className="alert-icon">ℹ️</span>
              <div className="alert-content">
                <h3>Appointment Reminder</h3>
                <p>Bella's grooming appointment tomorrow at 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="widget">
          <div className="widget-header">
            <h2>Recent Orders</h2>
            <a href="#" className="link">View All</a>
          </div>
          <div className="orders-list">
            <div className="order-item">
              <span>Pet Food Bundle</span>
              <span className="price">$49.99</span>
              <span className="status">Delivered</span>
            </div>
            <div className="order-item">
              <span>Dog Toys Set</span>
              <span className="price">$25.50</span>
              <span className="status">Shipped</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;
