import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [view, setView] = useState('10h View');
  const [date, setDate] = useState('July 11');

  const appointments = [
    { id: 1, title: 'Eye Replacement', time: '9:00 AM - 11:00 AM', patient: 'dog', doctor: 'Dr. M' },
    { id: 2, title: 'Medical Haircut', time: '11:00 AM - 1:00 PM', patient: 'dog', doctor: 'Dr. M' },
    { id: 3, title: 'Eye Exam', time: '12:30 PM - 1:30 PM', patient: 'dog', doctor: 'Dr. M' },
    { id: 4, title: 'X-Ray', time: '4:00 PM - 5:15 PM', patient: 'cat', doctor: 'Dr. Gupta, Dr.M' },
  ];

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>PLACEHOLDER UI FOR DASHBOARD SCREEN</h1>
        <div className="header-actions">
          <button className="action-button">Clock In</button>
          <button className="action-button">View Hours</button>
        </div>
      </div>
      <section className="calendar-section">
        <div className="calendar-header">
          <div className="calendar-actions">
            <button className="action-button">+ Create Appointment</button>
            <button className="action-button">View Appointments</button>
          </div>
          <div className="calendar-nav">
            <button className="today-button">Today</button>
            <span>{date}</span>
            <button className="nav-button"><i className="fas fa-chevron-left"></i></button>
            <button className="nav-button"><i className="fas fa-chevron-right"></i></button>
            <select value={view} onChange={(e) => setView(e.target.value)}>
              <option>10h View</option>
              <option>Day View</option>
              <option>Week View</option>
            </select>
          </div>
        </div>
        <div className="appointments-grid">
          {appointments.map(app => (
            <div key={app.id} className="appointment-card">
              <h3>{app.title}</h3>
              <p><i className="far fa-clock"></i> {app.time}</p>
              <p>Patient: {app.patient}</p>
              <p>Veterinarian: {app.doctor}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;