import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PatientTabs = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Clinical', path: '/patient/clinical' },
    { name: 'S.O.C.', path: '/SOC' },
    { name: 'Financial', path: '/Financial' },
    { name: 'Summaries', path: '/summaries' },
    { name: 'Health Status', path: '/healthStatus' },
    { name: 'Medication', path: '/medication' },
    { name: 'New Patient', path: '/newPatient' },
  ];

  return (
    <div className="patient-tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          to={tab.path}
          className={`tab-button ${location.pathname === tab.path ? 'active' : ''}`}
        >
          {tab.name}
        </Link>
      ))}
    </div>
  );
};

export default PatientTabs;