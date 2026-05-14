import React, { useState } from 'react';
import DashboardSidebar from '../DashboardSidebar.jsx';

const GroomerDashboard = () => {
  const [todayAppointments] = useState([
    { id: 1, petName: 'Max', owner: 'John Doe', time: '9:00 AM', service: 'Full Groom', duration: '2 hours' },
    { id: 2, petName: 'Bella', owner: 'Jane Smith', time: '11:30 AM', service: 'Bath & Trim', duration: '1.5 hours' },
    { id: 3, petName: 'Charlie', owner: 'Bob Johnson', time: '2:00 PM', service: 'Nail Trim', duration: '30 mins' }
  ]);

  const [services] = useState([
    { id: 1, name: 'Full Groom', duration: '2 hours', price: '$80', description: 'Complete grooming package' },
    { id: 2, name: 'Bath & Trim', duration: '1.5 hours', price: '$60', description: 'Bath and haircut' },
    { id: 3, name: 'Nail Trim', duration: '30 mins', price: '$25', description: 'Nail trimming only' }
  ]);

  const [reviews] = useState([
    { id: 1, petName: 'Max', owner: 'John Doe', rating: 5, comment: 'Excellent groomer! Max looks amazing!' },
    { id: 2, petName: 'Bella', owner: 'Jane Smith', rating: 5, comment: 'Very professional and gentle with my pet' }
  ]);

  return (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar />
      <section className="groomer-shell-modern">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">Groomer workspace</p>
            <h1>Groomer Dashboard</h1>
            <p>Track appointments, service offerings, and customer feedback in one streamlined view.</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Today's Stats */}
          <div className="stats-section">
            <div className="stat-card">
              <h3>{todayAppointments.length}</h3>
              <p>Today's Appointments</p>
            </div>
            <div className="stat-card">
              <h3>{services.length}</h3>
              <p>Active Services</p>
            </div>
            <div className="stat-card">
              <h3>{reviews.length}</h3>
              <p>Total Reviews</p>
            </div>
            <div className="stat-card">
              <h3>⭐ 5.0</h3>
              <p>Average Rating</p>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="widget">
            <div className="widget-header">
              <h2>Today's Appointments</h2>
              <button className="btn-primary" type="button">+ New Appointment</button>
            </div>
            <div className="appointments-list">
              {todayAppointments.map(appointment => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-time">
                    <h3>{appointment.time}</h3>
                  </div>
                  <div className="appointment-info">
                    <h3>{appointment.petName}</h3>
                    <p>Owner: {appointment.owner}</p>
                    <p>Service: {appointment.service}</p>
                    <p>Duration: {appointment.duration}</p>
                  </div>
                  <div className="appointment-actions">
                    <button className="btn-small">Edit</button>
                    <button className="btn-small">Complete</button>
                    <button className="btn-small">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services Offered */}
          <div className="widget">
            <div className="widget-header">
              <h2>Services Offered</h2>
              <button className="btn-primary" type="button">+ Add Service</button>
            </div>
            <div className="services-list">
              {services.map(service => (
                <div key={service.id} className="service-item">
                  <div className="service-info">
                    <h3>{service.name}</h3>
                    <p>Duration: {service.duration} • Price: {service.price}</p>
                    <p>{service.description}</p>
                  </div>
                  <div className="service-actions">
                    <button className="btn-small">Edit</button>
                    <button className="btn-small">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="widget">
            <div className="widget-header">
              <h2>Recent Reviews</h2>
              <button className="btn-small" type="button">View all</button>
            </div>
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="rating">
                    {'⭐'.repeat(review.rating)}
                  </div>
                  <p>"{review.comment}"</p>
                  <p><strong>{review.petName}</strong> - {review.owner}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="widget quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn">📅 Schedule</button>
              <button className="action-btn">👥 My Customers</button>
              <button className="action-btn">💬 Messages</button>
              <button className="action-btn">📊 Earnings</button>
              <button className="action-btn">⭐ Reviews</button>
              <button className="action-btn">⚙️ Settings</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GroomerDashboard;
