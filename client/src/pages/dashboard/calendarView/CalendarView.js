import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  differenceInMinutes, 
  startOfDay, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  subDays,
  areIntervalsOverlapping
} from 'date-fns';
import './CalendarView.css';
import AddAppointment from './AddAppointment';

const CalendarView = ({ searchTerm, firstName }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const supabase = useSupabaseClient();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchAppointments();
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [currentDate, viewMode]);

  const fetchAppointments = async () => {
    try {
      const start = viewMode === 'week' ? startOfWeek(currentDate) : startOfDay(currentDate);
      const end = viewMode === 'week' ? endOfWeek(currentDate) : addDays(startOfDay(currentDate), 1);

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
        .gte('start_time', start.toISOString())
        .lt('start_time', end.toISOString())
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
    fetchAppointments();
  };

  const renderTimeColumn = () => {
    return Array.from({ length: 24 }, (_, i) => (
      <div key={i} className="calendarView__timeSlot">
        {format(new Date().setHours(i, 0, 0, 0), 'HH:mm')}
      </div>
    ));
  };

  const renderAppointments = (day) => {
    const dayAppointments = appointments.filter(app => isSameDay(app.start, day));
    
    // Sort appointments by start time
    dayAppointments.sort((a, b) => a.start.getTime() - b.start.getTime());
  
    // Function to check if two appointments overlap
    const doAppointmentsOverlap = (app1, app2) => 
      areIntervalsOverlapping(
        { start: app1.start, end: app1.end },
        { start: app2.start, end: app2.end }
      );
  
    // Group overlapping appointments
    const overlappingGroups = [];
    dayAppointments.forEach(app => {
      const overlappingGroup = overlappingGroups.find(group => 
        group.some(groupApp => doAppointmentsOverlap(groupApp, app))
      );
      
      if (overlappingGroup) {
        overlappingGroup.push(app);
      } else {
        overlappingGroups.push([app]);
      }
    });
  
    return overlappingGroups.flatMap(group => {
      const isOverlapping = group.length > 1;
      return group.map((app, index) => {
        const top = (differenceInMinutes(app.start, startOfDay(day)) / 60) * 50;
        const height = (differenceInMinutes(app.end, app.start) / 60) * 50;
        
        let left = '0%';
        let width = '100%';
        
        if (isOverlapping) {
          const columnWidth = 100 / group.length;
          left = `${index * columnWidth}%`;
          width = `${columnWidth}%`;
        }
  
        return (
          <div
            key={app.id}
            className="calendarView__appointment"
            style={{ top: `${top}px`, height: `${height}px`, left, width }}
          >
            <div className="calendarView__appointmentTime">
              {format(app.start, 'HH:mm')} - {format(app.end, 'HH:mm')}
            </div>
            <div className="calendarView__appointmentTitle">{app.title}</div>
            <div className="calendarView__appointmentPatient">{app.patient}</div>
          </div>
        );
      });
    });
  };

  const renderDayColumn = (day) => (
    <div className="calendarView__dayColumn">
      <div className="calendarView__dayHeader">
        {format(day, 'EEE dd')}
      </div>
      <div className="calendarView__dayContent">
        {renderAppointments(day)}
        {isSameDay(day, new Date()) && renderCurrentTimeBar(day)}
      </div>
    </div>
  );

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => renderDayColumn(addDays(weekStart, i)));
  };

  const renderDayView = () => {
    return renderDayColumn(currentDate);
  };

  const renderCurrentTimeBar = (day) => {
    const now = new Date();
    if (isSameDay(now, day)) {
      const minutesSinceMidnight = differenceInMinutes(now, startOfDay(day));
      const top = (minutesSinceMidnight / 60) * 50;
      return <div className="calendarView__currentTimeBar" style={{ top: `${top}px` }} />;
    }
    return null;
  };

  const navigateDate = (direction) => {
    if (viewMode === 'week') {
      setCurrentDate(prevDate => direction === 'next' ? addWeeks(prevDate, 1) : subWeeks(prevDate, 1));
    } else {
      setCurrentDate(prevDate => direction === 'next' ? addDays(prevDate, 1) : subDays(prevDate, 1));
    }
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
          <button className="calendarView__actionButton" onClick={() => setViewMode(viewMode === 'week' ? 'day' : 'week')}>
            {viewMode === 'week' ? 'Day View' : 'Week View'}
          </button>
        </div>
        <div className="calendarView__rightControls">
          <button className="calendarView__controlButton calendarView__todayButton" onClick={() => setCurrentDate(new Date())}>Today</button>
          <span className="calendarView__dateDisplay">
            {viewMode === 'week'
              ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
              : format(currentDate, 'MMMM d, yyyy')}
          </span>
          <button className="calendarView__controlButton calendarView__navButton" onClick={() => navigateDate('prev')}>&#9664;</button>
          <button className="calendarView__controlButton calendarView__navButton" onClick={() => navigateDate('next')}>&#9654;</button>
        </div>
      </div>
      <div className="calendarView__weekContainer">
        <div className="calendarView__scrollContainer" ref={scrollContainerRef}>
          <div className="calendarView__timeColumn">
            {renderTimeColumn()}
          </div>
          <div className="calendarView__daysContainer">
            {viewMode === 'week' ? renderWeekView() : renderDayView()}
          </div>
        </div>
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