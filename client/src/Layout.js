import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import './Dashboard.css';
import AdminPage from './Admin';
import Dashboard from './Dashboard';
import AuthGuard from './components/auth/AuthGuard';
import MessagingPage from './MessagingPage';
import SignoutButton from './components/auth/SignOut';

const Layout = () => {
  const [theme, setTheme] = useState('light');
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [unreadMessages, setUnreadMessages] = useState([]);
  const location = useLocation();
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    const handleUpdateUnreadMessages = () => {
      checkUnreadMessages();
    };
  
    window.addEventListener('updateUnreadMessages', handleUpdateUnreadMessages);
  
    return () => {
      window.removeEventListener('updateUnreadMessages', handleUpdateUnreadMessages);
    };
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      checkUnreadMessages();
      const subscription = supabase
        .channel('public:messages')
        .on('INSERT', payload => {
          if (payload.new.recipient_id === session.user.id) {
            setUnreadMessages(prev => Array.isArray(prev) ? [...prev, payload.new] : [payload.new]);
          }
        })
        .subscribe();

      const handleUpdateUnreadMessages = (event) => {
        const senderId = event.detail?.senderId;
        if (senderId) {
          setUnreadMessages(prev => 
            Array.isArray(prev) ? prev.filter(msg => msg.sender_id !== senderId) : []
          );
        } else {
          checkUnreadMessages();
        }
      };

      window.addEventListener('updateUnreadMessages', handleUpdateUnreadMessages);

      return () => {
        supabase.removeChannel(subscription);
        window.removeEventListener('updateUnreadMessages', handleUpdateUnreadMessages);
      };
    }
  }, [session, supabase]);

  const checkUnreadMessages = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', session.user.id)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnreadMessages(data || []);
    } catch (error) {
      console.error('Error checking unread messages:', error);
      setUnreadMessages([]);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      checkUnreadMessages(); 
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };


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
    } else if (location.pathname === '/messages') {
      return <MessagingPage />;
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
            <button className="notification-button" onClick={handleNotificationClick}>
                <i className="fas fa-bell"></i>
                {Array.isArray(unreadMessages) && unreadMessages.length > 0 && (
                  <span className="notification-badge">{unreadMessages.length}</span>
                )}
              </button>
            <button className="user-button"><i className="fas fa-user"></i></button>
            <button className="settings-button" onClick={toggleTheme}><i className="fas fa-cog"></i></button>
            <span className="time-display">{currentTime.toLocaleTimeString()}</span>
            <SignoutButton/>
            </div>
        </header>
        {renderMainContent()}
      </main>
      {showNotifications && (
          <aside className="notifications-panel">
            <h2>Notifications</h2>
            {Array.isArray(unreadMessages) && unreadMessages.length === 0 ? (
              <p>No new notifications</p>
            ) : Array.isArray(unreadMessages) ? (
              unreadMessages.map((message) => (
                <div key={message.id} className="notification">
                  <h3>New message</h3>
                  <p>{message.content.substring(0, 50)}...</p>
                  <p><i className="far fa-clock"></i> {formatDate(message.created_at)}</p>
                </div>
              ))
            ) : (
              <p>Error loading notifications</p>
            )}
          </aside>
        )}
      </div>
    </AuthGuard>
  );
};

export default Layout;