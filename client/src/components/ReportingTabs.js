import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import EndOfDayWizard from '../pages/reporting/endOfDayWizard/EndOfDayWizard';
import './ReportingTabs.css';

const ReportingTabs = () => {
  const location = useLocation();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const tabs = [
    { name: 'Financial Reports', path: '/reporting' },
    { name: 'End of Day Reports', path: '/reporting/history' },
  ];

  const isActive = (path) => {
    return location.pathname === path || 
           (location.pathname === '/reporting' && path === '/reporting');
  };

  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
  };

  return (
    <>
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
        <button className="tab-button end-of-day-button" onClick={handleOpenWizard}>
          Run End of Day Wizard
        </button>
      </div>
      <EndOfDayWizard open={isWizardOpen} onClose={handleCloseWizard} />
    </>
  );
};

export default ReportingTabs;