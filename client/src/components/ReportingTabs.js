import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ReportingTabs.css';

const ReportingTabs = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Financial Reports', path: '/reporting/financial' },
    { name: 'Employee Records', path: '/reporting/employees' },
  ];

  const isActive = (path) => {
    return location.pathname === path || 
           (location.pathname === '/reporting' && path === '/reporting/financial');
  };

  return (
    <div className="reporting-tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          to={tab.path}
          className={`tab-button ${isActive(tab.path) ? 'active' : ''}`}
        >
          {tab.name}
        </Link>
      ))}
      <button className="tab-button end-of-day-button">Run End of Day Wizard</button>
    </div>
  );
};

export default ReportingTabs;