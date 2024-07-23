import React from 'react';

const AppointmentCard = ({ title, time, patient, doctor }) => {
  return (
    <div className="appointment-card">
      <h3>{title}</h3>
      <p>{time}</p>
      <p>Patient: {patient}</p>
      <p>Doctor: {doctor}</p>
    </div>
  );
};

export default AppointmentCard;