import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { format, startOfWeek, addDays, isSameDay, differenceInMinutes, startOfDay } from 'date-fns';
import './CalendarView.css';
import AddAppointment from './AddAppointment';

const CalendarView = ({ searchTerm, firstName }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchAppointments();
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          title,
          start_time,
          end_time,
          description,
          status,
          patients:patient_id (
            id,
            name
          ),
          staff:staff_id (
            id,
            first_name,
            last_name
          )
        `)
        .gte('start_time', startOfWeek(currentDate).toISOString())
        .lte('start_time', addDays(startOfWeek(currentDate), 7).toISOString())
        .order('start_time', { ascending: true });
  
      if (error) throw error;
  
      const formattedAppointments = data.map(app => ({
        id: app.id,
        title: app.title,
        start: new Date(app.start_time),
        end: new Date(app.end_time),
        patient: app.patients?.name || 'Unknown',  
        doctor: app.staff ? `${app.staff.first_name} ${app.staff.last_name}` : 'Unknown',
        description: app.description,
        status: app.status
      }));
  
      console.log('Fetched appointments:', formattedAppointments);
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleAddAppointment = (newAppointment) => {
    const formattedAppointment = {
      id: newAppointment.id,
      title: newAppointment.title,
      start: new Date(newAppointment.start_time),
      end: new Date(newAppointment.end_time),
      patient: newAppointment.patient_name, 
      doctor: newAppointment.staff_name, 
      description: newAppointment.description,
      status: newAppointment.status
    };
    setAppointments(prevAppointments => [...prevAppointments, formattedAppointment]);
    setIsAddModalOpen(false);
    fetchAppointments(); // refresh
  };

  const renderWeekDays = () => {
    const weekStart = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      return (
        <div key={i} className="calendarView__dayColumn">
          <div className="calendarView__dayHeader">
            {format(day, 'EEE dd')}
          </div>
          {renderAppointmentsForDay(day)}
          {isSameDay(day, currentDate) && renderCurrentTimeBar(day)}
        </div>
      );
    });
  };


    //TODO: ADD STATES FOR APPOINTMENT TYPES (COMPLETED, ONGOING/ ETC.) CLICK APPOINTMENT TO DISPLAY APPOINTMENT INFO.
  const renderAppointmentsForDay = (day) => {
    return appointments
      .filter(app => isSameDay(app.start, day))
      .map(app => (
        <div
          key={app.id}
          className="calendarView__appointment"
          style={{
            top: `${(differenceInMinutes(app.start, startOfDay(day)) / 60) * 50}px`,
            height: `${(differenceInMinutes(app.end, app.start) / 60) * 50}px`
          }}
        >
          <div className="calendarView__appointmentTime">
            {format(app.start, 'HH:mm')} - {format(app.end, 'HH:mm')}
          </div>
          <div className="calendarView__appointmentTitle">{app.title}</div>
          <div className="calendarView__appointmentPatient">{app.patient}</div>
        </div>
      ));
  };

  const renderCurrentTimeBar = (day) => {
    const now = new Date();
    const minutesSinceMidnight = differenceInMinutes(now, startOfDay(day));
    const top = (minutesSinceMidnight / 60) * 50; // per hour

    return (
      <div
        className="calendarView__currentTimeBar"
        style={{ top: `${top}px` }}
      />
    );
  };

  return (
    <div className="calendarView">
      <div className="calendarView__header">
        <h1>Hello, {firstName}!</h1>
        <div className="calendarView__headerButtons">
          <button className="calendarView__actionButton">Clock In</button>
          <button className="calendarView__actionButton">View Hours</button>
        </div>
      </div>
      <div className="calendarView__controls">
        <div className="calendarView__leftControls">
          <button className="calendarView__actionButton" onClick={() => setIsAddModalOpen(true)}>+ Create Appointment</button>
          <button className="calendarView__actionButton">View Appointments</button>
        </div>
        <div className="calendarView__rightControls">
          <button className="calendarView__controlButton calendarView__todayButton">Today</button>
          <span className="calendarView__dateDisplay">{format(currentDate, 'MMMM yyyy')}</span>
          <button className="calendarView__controlButton calendarView__navButton">&#9664;</button>
          <button className="calendarView__controlButton calendarView__navButton">&#9654;</button>
        </div>
      </div>
      <div className="calendarView__weekContainer">
        <div className="calendarView__timeColumn">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="calendarView__timeSlot">
              {format(new Date().setHours(i, 0, 0, 0), 'HH:mm')}
            </div>
          ))}
        </div>
        {renderWeekDays()}
      </div>
      
      {isAddModalOpen && (
        <AddAppointment
          onClose={() => setIsAddModalOpen(false)}
          onAppointmentAdded={handleAddAppointment}
        />
      )}
    </div>
  );
};

export default CalendarView;