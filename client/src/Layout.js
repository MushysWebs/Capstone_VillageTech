import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import './pages/dashboard/Dashboard.css';
import AdminPage from './pages/admin/Admin';
import Dashboard from './pages/dashboard/Dashboard';
import Contacts from './pages/contacts/Contacts';
import AuthGuard from './components/auth/AuthGuard';
import MessagingPage from './pages/message/MessagingPage';
import SignoutButton from './components/auth/SignOut';
import NewPatient from './pages/patients/newPatient/NewPatient';
import PatientMain from './pages/patients/patientMain/PatientMain';
import Financial from './pages/patients/financial/Financial';
import SOC from './pages/patients/soc/SOC'


const Layout = () => {
  const [theme, setTheme] = useState('light');
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [unreadMessages, setUnreadMessages] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    if (session?.user?.id) {
      checkUnreadMessages();
      const subscription = supabase
        .channel('public:messages')
        .on('INSERT', payload => {
          if (payload.new.recipient_id === session.user.id) {
            setUnreadMessages(prev => [...prev, payload.new]);
          }
        })
        .on('UPDATE', payload => {
          if (payload.new.recipient_id === session.user.id && payload.new.read) {
            setUnreadMessages(prev => prev.filter(msg => msg.id !== payload.new.id));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [session, supabase]);

  const checkUnreadMessages = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:staff!sender_id(full_name)')
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

  const handleMessageClick = (senderId) => {
    navigate('/messages', { state: { selectedStaffId: senderId } });
    setShowNotifications(false);
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
    } else if (location.pathname === '/contacts') {
      return <Contacts globalSearchTerm={globalSearchTerm} />;
    } else if (location.pathname === '/newPatient') {
      return <NewPatient />;
    } else if (location.pathname === '/patient') {
      return <PatientMain />;
    } else if (location.pathname === '/Financial') {
      return <Financial />;
    } else if (location.pathname === '/SOC') {
      return <SOC />;
    }
    return null;
  };

  const renderSidebarLink = (to, icon, text) => {
    const isActive = location.pathname === to;
    return (
      <li className={isActive ? 'active' : ''} draggable="false">
        <Link to={to} draggable="false">
          <i className={`fas ${icon}`} draggable="false"></i>{' '}
          <span draggable="false">{text}</span>
        </Link>
      </li>
    );
  };

  return (
    <AuthGuard>
      <div className={`dashboard-container ${theme}`}>
        <aside className="sidebar nunito-light">
          <nav>
            <ul>
              {renderSidebarLink('/dashboard', 'fa-home', 'Dashboard')}
              {renderSidebarLink('/contacts', 'fa-address-book', 'Contacts')}
              {renderSidebarLink('/patient', 'fa-user', 'Patients')}
              {renderSidebarLink('/financial', 'fa-dollar-sign', 'Financial')}
              {renderSidebarLink('/reporting', 'fa-chart-bar', 'Reporting')}
            </ul>
          </nav>
        </aside>
        <main className="main-content">
          <header className="top-nav">
            <div className="header-left">
              <Link
                to="/messages"
                className={`header-button blue-button nunito-regular ${location.pathname === '/messages' ? 'active' : ''}`}
                draggable="false"
              >
                <i className="fas fa-envelope" draggable="false"></i> <span draggable="false">Messages</span>
              </Link>
              <Link
                to="/admin"
                className={`header-button blue-button nunito-regular ${location.pathname === '/admin' ? 'active' : ''}`}
                draggable="false"
              >
                <i className="fas fa-user-shield" draggable="false"></i> <span draggable="false">Admin</span>
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
              <button className="header-button blue-button" draggable="false">
                <span draggable="false">Save</span>
              </button>
              <button className="notification-button" onClick={handleNotificationClick} draggable="false">
                <i className="fas fa-bell" draggable="false"></i>
                {unreadMessages.length > 0 && (
                  <span className="notification-badge" draggable="false">{unreadMessages.length}</span>
                )}
              </button>
              <button className="user-button" draggable="false">
                <i className="fas fa-user" draggable="false"></i>
              </button>
              <button className="settings-button" onClick={toggleTheme} draggable="false">
                <i className="fas fa-cog" draggable="false"></i>
              </button>
              <span className="time-display" draggable="false">{currentTime.toLocaleTimeString()}</span>
              <SignoutButton />
            </div>
          </header>
          {renderMainContent()}
        </main>
        {showNotifications && (
          <aside className="notifications-panel">
            <h2>Notifications</h2>
            {unreadMessages.length === 0 ? (
              <p>No new notifications</p>
            ) : (
              unreadMessages.map((message) => (
                <div key={message.id} className="notification" onClick={() => handleMessageClick(message.sender_id)} draggable="false">
                  <h3 draggable="false">New message from {message.sender.full_name}</h3>
                  <p draggable="false">{message.content.substring(0, 50)}...</p>
                  <p draggable="false"><i className="far fa-clock" draggable="false"></i> {formatDate(message.created_at)}</p>
                </div>
              ))
            )}
          </aside>
        )}
      </div>
    </AuthGuard>
  );
};

export default Layout;