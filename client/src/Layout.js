import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Dashboard.css';
import AdminPage from './Admin';
import Dashboard from './Dashboard';
import AuthGuard from './components/auth/AuthGuard';

const Layout = () => {
  const [theme, setTheme] = useState('light');
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const searchContainerStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#363D3F' : 'transparent',
  };

  const searchInputStyles = {
    padding: '8px 15px 8px 35px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '20px',
    marginLeft: '10px',
    backgroundColor: theme === 'dark' ? '#363D3F' : 'transparent',
    color: theme === 'dark' ? 'white' : '#09ACE0',
    outline: 'none',
    boxShadow: 'none',
  };

  const searchIconStyles = {
    color: theme === 'dark' ? 'white' : '#09ACE0',
    position: 'absolute',
    left: '10px',
    transition: 'all 0.3s ease',
  };
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleGlobalSearch = (e) => {
    setGlobalSearchTerm(e.target.value);
  };

  const renderMainContent = () => {
    if (location.pathname === '/admin') {
      return <AdminPage globalSearchTerm={globalSearchTerm} />;
    } else if (location.pathname === '/dashboard') {
      return <Dashboard globalSearchTerm={globalSearchTerm} />;
    }
    return null;
  };

  return (
    <AuthGuard>
    <div className={`dashboard-container ${theme}`}>
      <aside className="sidebar nunito-light">
        <nav>
          <ul>
            <li className= {location.pathname === '/dashboard' ? 'active' : ''}>
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
            <Link 
              to="/messages" 
              className={`header-button blue-button nunito-regular ${location.pathname === '/messages' ? 'active' : ''}`}
            >
              <i className="fas fa-envelope"></i> Messages
            </Link>
            <Link 
              to="/admin" 
              className={`header-button blue-button nunito-regular ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              <i className="fas fa-user-shield"></i> Admin
            </Link>
            <div className="search-container" style={searchContainerStyles}>
              <i className="fas fa-search search-icon" style={searchIconStyles}></i>
              <input 
                type="text" 
                placeholder="Search" 
                className="search-input nunito-regular" 
                value={globalSearchTerm}
                onChange={handleGlobalSearch}
                style={searchInputStyles}
              />
            </div>
          </div>
          <div className="header-right">
            <button className="header-button blue-button">Save</button>
            <button className="notification-button" onClick={() => setShowNotifications(!showNotifications)}>
              <i className="fas fa-bell"></i>
            </button>
            <button className="user-button"><i className="fas fa-user"></i></button>
            <button className="settings-button" onClick={toggleTheme}><i className="fas fa-cog"></i></button>
            <span className="time-display">{currentTime.toLocaleTimeString()}</span>
            </div>
        </header>
        {renderMainContent()}
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
    </AuthGuard>
  );
};

export default Layout;