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
import AppointmentDetails from './AppointmentDetails';
import ClockInOut from '../../../components/clockInOut/ClockInOut';
import './CalendarView.css';

const HOUR_WIDTH = 140;
const TIME_SLOT_PADDING = 10; 

const CalendarView = ({ searchTerm, firstName }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); 
  const supabase = useSupabaseClient();
  const scrollWrapperRef = useRef(null);

  useEffect(() => {
    fetchAppointments();
    // initial scroll to current time
    scrollToCurrentTime();
    
  }, [currentDate]);

  const handleAppointmentClick = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setIsAppointmentDetailsOpen(true);
  };

  const scrollToCurrentTime = () => {
    if (scrollWrapperRef.current && isSameDay(currentDate, new Date())) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const scrollPosition = (hours * HOUR_WIDTH) + ((minutes / 60) * HOUR_WIDTH) - (scrollWrapperRef.current.clientWidth / 2);
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
            name,
            owners (
              first_name,
              last_name
            )
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
        owner: app.patients?.owners ? `${app.patients.owners.first_name} ${app.patients.owners.last_name}` : 'Unknown',
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
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const displayHour = i.toString().padStart(2, '0');
      slots.push(
        <div 
          key={i} 
          className="calendarView__timeSlot"
          style={{ 
            width: `${HOUR_WIDTH}px`,
            boxSizing: 'border-box'
          }}
        >
          {`${displayHour}:00`}
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
        
        // position and width based on time
        const startMinutes = (start.getHours() * 60) + start.getMinutes();
        const endMinutes = (end.getHours() * 60) + end.getMinutes();
        const durationMinutes = endMinutes - startMinutes;
        
        // left position align with time slots
        const left = (startMinutes / 60) * HOUR_WIDTH;
        // width based on duration
        const width = (durationMinutes / 60) * HOUR_WIDTH - 2; // -2px for borders
        
        let top = '0%';
        let height = '100%';
        
        if (isOverlapping) {
          const rowHeight = 100 / group.length;
          top = `${index * rowHeight}%`;
          height = `${rowHeight}%`;
        }
        
        const displayStart = format(start, 'HH:mm');
        const displayEnd = format(end, 'HH:mm');

        return (
          <div
            key={app.id}
            className="calendarView__appointment"
            onClick={() => handleAppointmentClick(app.id)}
            style={{ 
              left: `${left}px`, 
              width: `${width}px`,
              top,
              height,
              maxHeight: '120px',
              boxSizing: 'border-box'
            }}
          >
            <div className="calendarView__appointmentTime">
              {`${displayStart} - ${displayEnd}`}
            </div>
            <div className="calendarView__appointmentTitle">
              {app.title}
            </div>
            <div className="calendarView__appointmentDetails">
              <div className="calendarView__appointmentInfo">
                <i className="fas fa-paw calendarView__appointmentIcon"></i>
                <span className="calendarView__appointmentLabel">Patient:</span>
                {app.patient}
              </div>
              <div className="calendarView__appointmentInfo">
                <i className="fas fa-user calendarView__appointmentIcon"></i>
                <span className="calendarView__appointmentLabel">Owner:</span>
                {app.owner}
              </div>
              <div className="calendarView__appointmentInfo">
                <i className="fas fa-user-md calendarView__appointmentIcon"></i>
                <span className="calendarView__appointmentLabel">Dr.</span>
                {app.doctor.split(' ')[1]}
              </div>
            </div>
            <div className="calendarView__appointmentStatus">
              {app.status}
            </div>
          </div>
        );
      });
    });
  };
  

  const renderCurrentTimeLine = () => {
    const now = new Date();
    if (isSameDay(now, currentDate)) {
      const minutes = (now.getHours() * 60) + now.getMinutes();
      const left = (minutes / 60) * HOUR_WIDTH;
      return <div className="calendarView__currentTimeLine" style={{ left: `${left}px` }} />;
    }
    return null;
  };

  return (
    <div className="calendarView">
      <div className="calendarView__header">
        <h1>Hello, {firstName}!</h1>
      </div>
      
      <div className="calendarView__controls">
        <div className="calendarView__leftControls">
          <button 
            className="calendarView__actionButton" 
            onClick={() => setIsAddModalOpen(true)}
          >
            + Create Appointment
          </button>
          <button 
            className="calendarView__actionButton" 
            onClick={() => {
              setViewMode('list');
              setIsAppointmentDetailsOpen(true);
            }}
          >
            View Appointments
          </button>
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

      {isAppointmentDetailsOpen && (
        <AppointmentDetails
          isOpen={isAppointmentDetailsOpen}
          onClose={() => {
            setIsAppointmentDetailsOpen(false);
            setSelectedAppointmentId(null);
            setViewMode('calendar');
          }}
          appointmentId={selectedAppointmentId}
          mode={viewMode === 'list' ? 'list' : 'detail'}
          onAppointmentUpdated={() => fetchAppointments()} 
          onAppointmentDeleted={() => {
            fetchAppointments();
            setIsAppointmentDetailsOpen(false);
            setSelectedAppointmentId(null);
          }}
        />
      )}

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