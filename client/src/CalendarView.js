import React, { useState, useEffect , useRef} from 'react';
import './CalendarView.css';

const CalendarView = ({ searchTerm }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([
    { id: 1, title: 'Eye Replacement', start: new Date(2024, 6, 23, 9, 0), end: new Date(2024, 6, 23, 11, 0), patient: 'Ponzu', doctor: 'Dr. M' },
    { id: 2, title: 'Medical Haircut', start: new Date(2024, 6, 23, 11, 0), end: new Date(2024, 6, 23, 13, 0), patient: 'Simby', doctor: 'Dr. Oopie' },
    { id: 3, title: 'Eye Exam', start: new Date(2024, 6, 23, 12, 30), end: new Date(2024, 6, 23, 13, 30), patient: 'Ponzu', doctor: 'Dr. M' },
    { id: 4, title: 'X-Ray', start: new Date(2024, 6, 23, 16, 0), end: new Date(2024, 6, 23, 17, 15), patient: 'Dashawn', doctor: 'Dr. Oopie, Dr.M' },
  ]);

  useEffect(() => {
    if (searchTerm) {
      const filteredAppointments = appointments.filter(
        app => app.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
               app.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
               app.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredAppointments.length > 0) {
        const nextAppointment = filteredAppointments.find(app => app.start > new Date());
        if (nextAppointment) {
          const appointmentTop = (nextAppointment.start.getHours() * 60 + nextAppointment.start.getMinutes()) / 60 * 100;
        }
      }
    }
  }, [searchTerm, appointments]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filteredAppointments = appointments.filter(
        app => app.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
               app.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
               app.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log('Filtered appointments:', filteredAppointments);

      if (filteredAppointments.length > 0) {
        const nextAppointment = filteredAppointments.find(app => app.start > new Date());
        if (nextAppointment) {
          const appointmentTop = (nextAppointment.start.getHours() * 60 + nextAppointment.start.getMinutes()) / 60 * 100;
          console.log('Scrolling to appointment at position:', appointmentTop);
        } else {
          console.log('No future appointments found for the search term');
        }
      } else {
        console.log('No appointments found for the search term');
      }
    }
  }, [searchTerm, appointments]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAppointmentStyle = (start, end, column = 0) => {
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = endMinutes - startMinutes;
    
    return {
      top: `${startMinutes / 60 * 100}px`,
      height: `${duration / 60 * 100}px`,
      left: `${column * 200}px`,
    };
  };

  const renderAppointments = () => {
    const appointmentColumns = [];
    const renderedAppointments = [];

    appointments.forEach((app, index) => {
      let column = 0;
      while (appointmentColumns[column]?.some(existingApp => 
        (app.start < existingApp.end && app.end > existingApp.start)
      )) {
        column++;
      }

      if (!appointmentColumns[column]) {
        appointmentColumns[column] = [];
      }
      appointmentColumns[column].push(app);

      const isHighlighted = searchTerm && 
        (app.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.title.toLowerCase().includes(searchTerm.toLowerCase()));

        renderedAppointments.push(
        <div
          key={app.id}
          className={`appointment ${index % 2 === 0 ? 'even' : 'odd'} ${isHighlighted ? 'highlighted' : ''}`}
          style={getAppointmentStyle(app.start, app.end, column)}
        >
          <h3>{app.title}</h3>
          <p>{formatTime(app.start)} → {formatTime(app.end)}</p>
          <p>Patient: {app.patient}</p>
          <p>Doctor: {app.doctor}</p>
        </div>
      );
    });
    return renderedAppointments;
  };

  const renderTimeMarkers = () => {
    return Array.from({ length: 24 }, (_, i) => (
      <div key={i} className="time-marker">
        {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
      </div>
    ));
  };

  const getCurrentTimeLine = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return {
      top: `${minutes / 60 * 100}px`,
    };
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h1>Hello, Logan! This is a placeholder page for the dashboard with the calender concept.</h1>
        <div className="header-buttons">
          <button className="action-button">Clock In</button>
          <button className="action-button">View Hours</button>
        </div>
      </div>
      <div className="calendar-controls">
        <div className="left-controls">
          <button className="action-button">+ Create Appointment</button>
          <button className="action-button">View Appointments</button>
        </div>
        <div className="right-controls">
          <button className="control-button today-button">Today</button>
          <span className="date-display">{currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
          <button className="control-button nav-button">&#9664;</button>
          <button className="control-button nav-button">&#9654;</button>
          <select className="view-select">
            <option value="day">Day View</option>
            <option value="week">Week View</option>
          </select>
        </div>
      </div>
      <div className="main-content">
        <div className="calendar-grid">
          <div className="time-column">{renderTimeMarkers()}</div>
          <div className="events-column">
            {renderAppointments()}
            <div className="current-time-line" style={getCurrentTimeLine()}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;