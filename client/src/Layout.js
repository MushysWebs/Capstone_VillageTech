import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './Dashboard.css';

const Layout = () => {
  const [theme, setTheme] = useState('light');
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`dashboard-container ${theme}`}>
      <aside className="sidebar">
        <nav>
          <ul>
            <li className={location.pathname === '/dashboard' ? 'active' : ''}>
              <Link to="/dashboard"><i className="fas fa-home"></i> Dashboard</Link>
            </li>
            <li className={location.pathname === '/contacts' ? 'active' : ''}>
              <Link to="/contacts"><i className="fas fa-address-book"></i> Contacts</Link>
            </li>
            <li className={location.pathname === '/patients' ? 'active' : ''}>
              <Link to="/patients"><i className="fas fa-user"></i> Patients</Link>
            </li>
            <li className={location.pathname === '/financial' ? 'active' : ''}>
              <Link to="/financial"><i className="fas fa-dollar-sign"></i> Financial</Link>
            </li>
            <li className={location.pathname === '/reporting' ? 'active' : ''}>
              <Link to="/reporting"><i className="fas fa-chart-bar"></i> Reporting</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <header className="top-nav">
          <div className="header-left">
          <Link to="/messages" className="header-button blue-button nunito-regular">
    <i className="fas fa-envelope"></i> Messages
  </Link>
  <Link to="/admin" className="header-button blue-button nunito-regular">
    <i className="fas fa-user-shield"></i> Admin
  </Link>
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input type="text" placeholder="Search" className="search-input nunito-regular" />
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
        <Outlet />
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
            <p>"turn the calendar to a scroller"</p>
            <p><i className="far fa-clock"></i> Yesterday | 04:34 PM</p>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Layout;