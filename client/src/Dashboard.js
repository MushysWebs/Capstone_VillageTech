import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [theme, setTheme] = useState('light');
  const [view, setView] = useState('10h View');
  const [date, setDate] = useState('July 11');
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };


  //TEMP DATA UNTIL DATABASE CONNECTION
  const appointments = [
    { id: 1, title: 'Eye Replacement', time: '9:00 AM - 11:00 AM', patient: 'dog', doctor: 'Dr. M' },
    { id: 2, title: 'Medical Haircut', time: '11:00 AM - 1:00 PM', patient: 'dog', doctor: 'Dr. M' },
    { id: 3, title: 'Eye Exam', time: '12:30 PM - 1:30 PM', patient: 'dog', doctor: 'Dr. M' },
    { id: 4, title: 'X-Ray', time: '4:00 PM - 5:15 PM', patient: 'cat', doctor: 'Dr. Gupta, Dr.M' },
  ];

  return (
    <div className={`dashboard-container ${theme}`}>
      <aside className="sidebar">
        <nav>
          <ul>
            <li className="active"><i className="fas fa-home"></i> Dashboard</li>
            <li><i className="fas fa-address-book"></i> Contacts</li>
            <li><i className="fas fa-user"></i> Patients</li>
            <li><i className="fas fa-dollar-sign"></i> Financial</li>
            <li><i className="fas fa-chart-bar"></i> Reporting</li>
          </ul>
        </nav>
        </aside>
      <main className="main-content">
        <header className="top-nav">
          <div className="header-left">
            <button className="header-button blue-button nunito-regular">
              <i className="fas fa-envelope"></i> Messages
            </button>
            <button className="header-button blue-button nunito-regular">
              <i className="fas fa-user-shield"></i> Admin
            </button>
            <div className="search-container">
            <button className="header-button blue-button nunito-regular">
              <i className="fas fa-search search-icon"></i>
              <input type="text" placeholder="Search" className="search-input nunito-regular" />
              </button>
            </div>
          </div>
          <div className="header-right">
            <button className="header-button">Save</button>
            <button className="notification-button" onClick={() => setShowNotifications(!showNotifications)}>
              <i className="fas fa-bell"></i>
            </button>
            <button className="user-button"><i className="fas fa-user"></i></button>
            <button className="settings-button" onClick={toggleTheme}><i className="fas fa-cog"></i></button>
            <span className="time-display">{currentTime.toLocaleTimeString()}</span>
          </div>
        </header>
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
      </main>
      
      {showNotifications && (
        <aside className="notifications-panel">
          <h2>Notifications</h2>
          <div className="notification">
            <h3>temporary notifications</h3>
            <p>connect me to the database</p>
            <p><i className="far fa-clock"></i> Today | 10:45 AM</p>
          </div>
          <div className="notification">
            <h3>also..</h3>
            <p>"turn the callender to a scroller"</p>
            <p><i className="far fa-clock"></i> Yesterday | 04:34 PM</p>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Dashboard;