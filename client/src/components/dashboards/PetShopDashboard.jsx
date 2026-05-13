import React, { useState } from 'react';

const GroomerDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([
    { id: 1, petName: 'Max', owner: 'John Doe', time: '9:00 AM', service: 'Full Groom', duration: '2 hours' },
    { id: 2, petName: 'Bella', owner: 'Jane Smith', time: '11:30 AM', service: 'Bath & Trim', duration: '1.5 hours' },
    { id: 3, petName: 'Charlie', owner: 'Bob Johnson', time: '2:00 PM', service: 'Nail Trim', duration: '30 mins' }
  ]);

  const [services, setServices] = useState([
    { id: 1, name: 'Full Groom', price: '$60', description: 'Complete grooming with bath and trim' },
    { id: 2, name: 'Bath & Trim', price: '$40', description: 'Bath with partial trim' },
    { id: 3, name: 'Nail Trim', price: '$15', description: 'Nail trimming only' }
  ]);

  return (
    <div className="dashboard-container">
      <h1>Groomer Dashboard</h1>

      <div className="dashboard-grid">
        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>3</h3>
            <p>Today's Appointments</p>
          </div>
          <div className="stat-card">
            <h3>$115</h3>
            <p>Today's Earnings</p>
          </div>
          <div className="stat-card">
            <h3>42</h3>
            <p>Regular Customers</p>
          </div>
          <div className="stat-card">
            <h3>4.9★</h3>
            <p>Average Rating</p>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="widget">
          <div className="widget-header">
            <h2>Today's Schedule</h2>
            <button className="btn-primary">+ Add Appointment</button>
          </div>
          <div className="schedule-list">
            {todayAppointments.map(apt => (
              <div key={apt.id} className="schedule-item">
                <div className="time-badge">{apt.time}</div>
                <div className="appointment-details">
                  <h3>{apt.petName}</h3>
                  <p>Owner: {apt.owner}</p>
                  <p>Service: {apt.service} ({apt.duration})</p>
                </div>
                <div className="appointment-actions">
                  <button className="btn-small">Start</button>
                  <button className="btn-small">Reschedule</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Services */}
        <div className="widget">
          <div className="widget-header">
            <h2>My Services</h2>
            <button className="btn-primary">+ Add Service</button>
          </div>
          <div className="services-list">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-info">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <span className="price">{service.price}</span>
                </div>
                <div className="service-actions">
                  <button className="btn-small">Edit</button>
                  <button className="btn-small">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="widget quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">📅 Schedule</button>
            <button className="action-btn">📸 Upload Photos</button>
            <button className="action-btn">⭐ View Reviews</button>
            <button className="action-btn">💬 Messages</button>
            <button className="action-btn">🕐 Manage Hours</button>
            <button className="action-btn">📊 Analytics</button>
          </div>
        </div>

        {/* Upcoming Week */}
        <div className="widget">
          <h2>Upcoming Appointments</h2>
          <div className="upcoming-list">
            <div className="upcoming-item">
              <span className="date">May 20</span>
              <span>Max - Full Groom</span>
              <span>10:00 AM</span>
            </div>
            <div className="upcoming-item">
              <span className="date">May 21</span>
              <span>Bella - Bath & Trim</span>
              <span>2:00 PM</span>
            </div>
            <div className="upcoming-item">
              <span className="date">May 22</span>
              <span>Rocky - Full Groom</span>
              <span>9:00 AM</span>
            </div>
            <div className="upcoming-item">
              <span className="date">May 23</span>
              <span>Lucy - Nail Trim</span>
              <span>11:00 AM</span>
            </div>
          </div>
        </div>

        {/* Gallery / Portfolio */}
        <div className="widget">
          <h2>My Portfolio</h2>
          <div className="gallery-preview">
            <div className="gallery-item">
              <div className="gallery-placeholder">📸 Golden Retriever</div>
            </div>
            <div className="gallery-item">
              <div className="gallery-placeholder">📸 Poodle Mix</div>
            </div>
            <div className="gallery-item">
              <div className="gallery-placeholder">📸 Schnauzer</div>
            </div>
            <button className="btn-primary">View Full Gallery</button>
          </div>
        </div>

        {/* Availability */}
        <div className="widget">
          <h2>Availability Settings</h2>
          <div className="availability-list">
            <div className="availability-item">
              <span>Monday - Friday:</span>
              <span>9:00 AM - 6:00 PM</span>
              <button className="btn-small">Edit</button>
            </div>
            <div className="availability-item">
              <span>Saturday:</span>
              <span>10:00 AM - 4:00 PM</span>
              <button className="btn-small">Edit</button>
            </div>
            <div className="availability-item">
              <span>Sunday:</span>
              <span>Closed</span>
              <button className="btn-small">Edit</button>
            </div>
          </div>
        </div>

        {/* Customer Feedback */}
        <div className="widget">
          <h2>Recent Reviews</h2>
          <div className="reviews-list">
            <div className="review-item">
              <div className="rating">⭐⭐⭐⭐⭐</div>
              <p>"Perfect grooming! Max looks amazing!"</p>
              <span className="reviewer">- John D.</span>
            </div>
            <div className="review-item">
              <div className="rating">⭐⭐⭐⭐⭐</div>
              <p>"Very professional and caring with my Bella"</p>
              <span className="reviewer">- Jane S.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroomerDashboard;
