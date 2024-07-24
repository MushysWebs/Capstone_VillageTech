import React, { useState } from 'react';
import './Dashboard.css';
import CalendarView from './CalendarView';

const Dashboard = () => {
    return (
      <div className="dashboard-content">
        <CalendarView />
      </div>
    );
  };


export default Dashboard;