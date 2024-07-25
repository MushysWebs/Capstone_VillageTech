import React from 'react';
import './Dashboard.css';
import CalendarView from './CalendarView';

const Dashboard = ({ globalSearchTerm }) => {
  return (
    <div className="dashboard-content">
      <CalendarView searchTerm={globalSearchTerm} />
    </div>
  );
};

export default Dashboard;