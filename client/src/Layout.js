
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import './pages/dashboard/Dashboard.css';
import AdminPage from './pages/admin/Admin';
import Account from './pages/admin/Account';
import Dashboard from './pages/dashboard/Dashboard';
import Contacts from './pages/contacts/Contacts';
import AuthGuard from './components/auth/AuthGuard';
import MessagingPage from './pages/message/MessagingPage';
import SignoutButton from './components/auth/SignOut';
import NewPatient from './pages/patients/newPatient/NewPatient';
import PatientMain from './pages/patients/patientMain/PatientMain';
import Financial from './pages/patients/financial/Financial';
import HealthStatus from './pages/patients/healthStatus/HealthStatus';
import SOC from './pages/patients/soc/SOC';
import Summaries from './pages/patients/summaries/Summaries';
import Medication from './pages/patients/medication/Medication';
import Clinical from './pages/patients/clinical/Clinical'; 
import Payments from './pages/payments/Payments';
import FinancialReports from "./pages/reporting/financialReports/FinancialReports";
import ReportHistory from "./pages/reporting/reportHistory/ReportHistory";

const Layout = () => {
  const [theme, setTheme] = useState("light");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [currentUserStaff, setCurrentUserStaff] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchCurrentUserStaff();
    }
  }, [session]);

  const fetchCurrentUserStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setCurrentUserStaff(data);
    } catch (error) {
      console.error('Error fetching current user staff:', error);
    }
  };

  useEffect(() => {
    if (!currentUserStaff) return;

    const channel = supabase.channel(`chat:${currentUserStaff.user_id}`, {
      config: {
        broadcast: { self: true }
      }
    });

    channel
      .on('broadcast', { event: 'new-message' }, ({ payload }) => {
        //increment counter if message is received when not on the messages page
        if (payload.recipient_id === currentUserStaff.user_id && location.pathname !== '/messages') {
          setUnreadMessageCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserStaff, location.pathname]);

  useEffect(() => {
    if (location.pathname === '/messages') {
      setUnreadMessageCount(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const searchContainerStyles = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    backgroundColor: theme === "dark" ? "#363D3F" : "transparent",
  };
  const searchInputStyles = {
    padding: "8px 15px 8px 35px",
    borderRadius: "20px",
    border: "none",
    fontSize: "20px",
    marginLeft: "10px",
    backgroundColor: theme === "dark" ? "#363D3F" : "transparent",
    color: theme === "dark" ? "white" : "#09ACE0",
    outline: "none",
    boxShadow: "none",
  };

  const searchIconStyles = {
    color: theme === "dark" ? "white" : "#09ACE0",
    position: "absolute",
    left: "10px",
    transition: "all 0.3s ease",
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleGlobalSearch = (e) => {
    setGlobalSearchTerm(e.target.value);
  };

  const renderMainContent = () => {
    if (location.pathname === "/admin") {
      return <AdminPage globalSearchTerm={globalSearchTerm} />;
    } else if (location.pathname === "/account") {
      return <Account />;
    } else if (location.pathname === "/dashboard") {
      return <Dashboard globalSearchTerm={globalSearchTerm} />;
    } else if (location.pathname === "/messages") {
      return <MessagingPage />;
    } else if (location.pathname === "/contacts") {
      return <Contacts globalSearchTerm={globalSearchTerm} />;
    } else if (location.pathname === "/newPatient") {
      return <NewPatient globalSearchTerm={globalSearchTerm} />;
    } else if (location.pathname === "/patient") {
      return <PatientMain globalSearchTerm={globalSearchTerm} />;
    } else if (location.pathname === "/Financial") {
      return <Financial />;
    } else if (location.pathname === "/healthStatus") {
      return <HealthStatus />;
    } else if (location.pathname === "/SOC") {
      return <SOC />;
    } else if (location.pathname === "/summaries") {
      return <Summaries />;
    } else if (location.pathname === "/medication") {
      return <Medication globalSearchTerm={globalSearchTerm} />;
    } else if (location.pathname === "/clinical") {
      return <Clinical />;
    } else if (location.pathname === "/reporting") {
      return <FinancialReports globalSearchTerm={globalSearchTerm} />;
    } else if (location.pathname === "/reporting/history") {
      return <ReportHistory />;
    } else if (location.pathname === "/payments") {
      return <Payments />;  
    }
  };

  const renderSidebarLink = (to, icon, text) => {
    const isActive = () => {
      if (to === "/patient") {
        return [
          "/patient",
          "/SOC",
          "/Financial",
          "/summaries",
          "/healthStatus",
          "/medication",
          "/newPatient",
          "/clinical",
        ].includes(location.pathname);
      }
      if (to === "/reporting") {
        return location.pathname.startsWith("/reporting");
      }
      return location.pathname === to;
    };
    

    return (
      <li className={isActive() ? "active" : ""} draggable="false">
        <Link to={to} draggable="false">
          <i className={`fas ${icon}`} draggable="false"></i>{" "}
          <span draggable="true">{text}</span>
        </Link>
      </li>
    );
  };
  return (
    <AuthGuard>
      <div className={`dashboard-container ${theme}`}>
        <aside className="sidebar nunito-light">
          <nav>
            <ul className='dashboard-button'>
              {renderSidebarLink("/dashboard", "fa-home", "Dashboard")}
            </ul>
            <ul>
              {renderSidebarLink("/contacts", "fa-address-book", "Contacts")}
              {renderSidebarLink("/patient", "fa-user", "Patients")}
              {renderSidebarLink('/payments', 'fa-dollar-sign', 'Payments')}
              {renderSidebarLink("/reporting", "fa-chart-bar", "Reporting")}
            </ul>
          </nav>
        </aside>
        <main className="main-content">
          <header className="top-nav">
            <div className="header-left">
              <Link
                to="/messages"
                className={`header-button blue-button nunito-regular ${
                  location.pathname === "/messages" ? "active" : ""
                }`}
                draggable="false"
              >
                <div className="message-button-container">
                  <i className="fas fa-envelope" draggable="false"></i>
                  {unreadMessageCount > 0 && (
                    <span className="message-notification-badge" draggable="false">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                  <span draggable="false">Messages</span>
                </div>
              </Link>
              {currentUserStaff?.role === 'Veterinarian' ? (
                <Link
                  to="/admin"
                  className={`header-button blue-button nunito-regular ${
                    location.pathname === "/admin" ? "active" : ""
                  }`}
                  draggable="false"
                >
                  <i className="fas fa-user-shield" draggable="false"></i>{" "}
                  <span draggable="false">Admin</span>
                </Link>
              ) : (
                <Link
                  to="/account"
                  className={`header-button blue-button nunito-regular ${
                    location.pathname === "/account" ? "active" : ""
                  }`}
                  draggable="false"
                >
                  <i className="fas fa-user" draggable="false"></i>{" "}
                  <span draggable="false">Account</span>
                </Link>
              )}
              <div className="search-container" style={searchContainerStyles}>
                <i
                  className="fas fa-search search-icon"
                  style={searchIconStyles}
                ></i>
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
              <span className="time-display" draggable="false">
                {currentTime.toLocaleTimeString()}
              </span>
              <SignoutButton />
            </div>
          </header>
          {renderMainContent()}
        </main>
      </div>
    </AuthGuard>
  );
};
export default Layout;
