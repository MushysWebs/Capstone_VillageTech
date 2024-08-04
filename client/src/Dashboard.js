// Dashboard.js
import React from 'react';
import './Dashboard.css';
import CalendarView from './CalendarView';
import AuthGuard from './components/auth/AuthGuard';

const Dashboard = ({ globalSearchTerm }) => {
  return (
    <AuthGuard>
      <div className="dashboard-content">
        <CalendarView searchTerm={globalSearchTerm} />
      </div>
    </AuthGuard>
  );
};

export default Dashboard;