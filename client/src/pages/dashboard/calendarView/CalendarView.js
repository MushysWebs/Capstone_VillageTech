import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { 
  format, 
  startOfDay,
  addDays,
  subDays,
  isSameDay,
  differenceInMinutes,
  areIntervalsOverlapping
} from 'date-fns';
import AddAppointment from './AddAppointment';
import ClockInOut from '../../../components/clockInOut/ClockInOut';
import './CalendarView.css';

const CalendarView = ({ searchTerm, firstName }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const supabase = useSupabaseClient();
  const scrollWrapperRef = useRef(null);

  useEffect(() => {
    fetchAppointments();
    // initial scroll to current time
    scrollToCurrentTime();
    
  }, [currentDate]);

  const scrollToCurrentTime = () => {
    if (scrollWrapperRef.current && isSameDay(currentDate, new Date())) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const scrollPosition = (hours * 120) + ((minutes / 60) * 120) - (scrollWrapperRef.current.clientWidth / 2);
      scrollWrapperRef.current.scrollLeft = Math.max(0, scrollPosition);
    }
  };

  const fetchAppointments = async () => {
    try {
      const start = startOfDay(currentDate);
      const end = addDays(startOfDay(currentDate), 1);

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

  const renderTimeSlots = () => {
    // create fixed 24-hour time slots
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const displayHour = i.toString().padStart(2, '0');
      slots.push(
        <div key={i} className="calendarView__timeSlot">
          {`${(displayHour)}:00`}
        </div>
      );
    }
    return slots;
  };
  

  const renderAppointments = () => {
    const dayAppointments = appointments.filter(app => isSameDay(app.start, currentDate));
    dayAppointments.sort((a, b) => a.start.getTime() - b.start.getTime());
    
    const doAppointmentsOverlap = (app1, app2) => 
      areIntervalsOverlapping(
        { start: app1.start, end: app1.end },
        { start: app2.start, end: app2.end }
      );
    
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
        const start = new Date(app.start);
        const end = new Date(app.end);
  
        const startHour = start.getHours();
        const startMinute = start.getMinutes();
        const endHour = end.getHours();
        const endMinute = end.getMinutes();
  
        // calculate position directly from hours (120px per hour)
        const left = (startHour * 142) + (startMinute / 60 * 120);
        const width = ((endHour - startHour) * 120) + ((endMinute - startMinute) / 60 * 120);
        
        let top = '0%';
        let height = '100%';
        
        if (isOverlapping) {
          const rowHeight = 100 / group.length;
          top = `${index * rowHeight}%`;
          height = `${rowHeight}%`;
        }
  
        // format display time in 24-hour format
        const displayStart = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
        const displayEnd = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
  
        return (
          <div
            key={app.id}
            className="calendarView__appointment"
            style={{ 
              left: `${left}px`, 
              width: `${width}px`,
              top,
              height,
              maxHeight: '120px'
            }}
          >
            <div className="calendarView__appointmentTime">
              {`${displayStart} - ${displayEnd}`}
            </div>
            <div className="calendarView__appointmentTitle">{app.title}</div>
            <div className="calendarView__appointmentPatient">{app.patient}</div>
          </div>
        );
      });
    });
  };
  

  const renderCurrentTimeLine = () => {
    const now = new Date();
    if (isSameDay(now, currentDate)) {
      const hour = now.getHours();
      const minute = now.getMinutes();
      const left = (hour * 142) + (minute / 60 * 120);
      return <div className="calendarView__currentTimeLine" style={{ left: `${left}px` }} />;
    }
    return null;
  };

  return (
    <div className="calendarView">
      <div className="calendarView__header">
        <h1>Hello, {firstName}!</h1>
        <div className="calendarView__headerButtons">
          <ClockInOut />
          <button className="calendarView__actionButton">View Hours</button>
        </div>
      </div>
      
      <div className="calendarView__controls">
        <div className="calendarView__leftControls">
          <button 
            className="calendarView__actionButton" 
            onClick={() => setIsAddModalOpen(true)}
          >
            + Create Appointment
          </button>
          <button className="calendarView__actionButton">View Appointments</button>
        </div>
        <div className="calendarView__rightControls">
          <button 
            className="calendarView__controlButton calendarView__todayButton" 
            onClick={() => {
              setCurrentDate(new Date());
              setTimeout(scrollToCurrentTime, 0);
            }}
          >
            Today
          </button>
          <span className="calendarView__dateDisplay">
            {format(currentDate, 'MMMM d, yyyy')}
          </span>
          <button 
            className="calendarView__controlButton" 
            onClick={() => setCurrentDate(prev => subDays(prev, 1))}
          >
            &#9664;
          </button>
          <button 
            className="calendarView__controlButton" 
            onClick={() => setCurrentDate(prev => addDays(prev, 1))}
          >
            &#9654;
          </button>
        </div>
      </div>

      <div className="calendarView__timeline">
        <div className="calendarView__scrollWrapper" ref={scrollWrapperRef}>
          <div className="calendarView__contentWrapper">
            <div className="calendarView__timeHeader">
              {renderTimeSlots()}
            </div>
            <div className="calendarView__appointmentsContainer">
              {renderAppointments()}
              {renderCurrentTimeLine()}
            </div>
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