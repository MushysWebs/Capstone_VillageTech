import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import { X, ChevronLeft, Calendar, User, Stethoscope, Phone, Clock } from 'lucide-react';
import './AppointmentDetails.css';

const AppointmentDetails = ({ isOpen, onClose, appointmentId: initialAppointmentId, mode: initialMode = 'detail' }) => {
  const [appointment, setAppointment] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(initialAppointmentId);
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (currentMode === 'list') {
      fetchAllAppointments();
    } else if (currentAppointmentId) {
      fetchAppointmentDetails();
    }
  }, [currentAppointmentId, currentMode]);

  const fetchAppointmentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients:patient_id (
            id,
            name,
            species,
            breed,
            date_of_birth
          ),
          staff:staff_id (
            id,
            first_name,
            last_name
          ),
          owners:patients(
            owners(
              id,
              first_name,
              last_name,
              phone_number,
              email
            )
          )
        `)
        .eq('id', currentAppointmentId)
        .single();

      if (error) throw error;
      setAppointment(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      setLoading(false);
    }
  };

  const fetchAllAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
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
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAllAppointments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const handleAppointmentClick = (apt) => {
    setCurrentAppointmentId(apt.id);
    setCurrentMode('detail');
    setAppointment(apt);
  };

  const handleBackToList = () => {
    setCurrentMode('list');
    setCurrentAppointmentId(null);
    setAppointment(null);
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'In Progress': 'bg-yellow-100 text-yellow-800'
    };
    return `appointmentDetails__status ${styles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'In Progress': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="appointmentDetails__overlay">
      <div className="appointmentDetails__container">
        <header className="appointmentDetails__header">
          <div className="appointmentDetails__headerLeft">
            {currentMode === 'detail' && initialMode === 'list' && (
              <button
                onClick={handleBackToList}
                className="appointmentDetails__backButton"
              >
                <ChevronLeft size={20} />
                Back to List
              </button>
            )}
            <h2 className="text-2xl font-semibold text-gray-800">
              {currentMode === 'list' ? 'All Appointments' : 'Appointment Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="appointmentDetails__closeButton"
          >
            <X size={20} />
          </button>
        </header>

        <div className="appointmentDetails__content">
          {loading ? (
            <div className="appointmentDetails__loader">
              <div className="appointmentDetails__spinner" />
            </div>
          ) : currentMode === 'list' ? (
            <div className="appointmentDetails__list">
              {allAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="appointmentDetails__listItem"
                  onClick={() => handleAppointmentClick(apt)}
                >
                  <div className="appointmentDetails__listItemHeader">
                    <div>
                      <h3 className="appointmentDetails__listItemTitle">{apt.title}</h3>
                      <div className="appointmentDetails__listItemInfo">
                        <p>
                          <User size={16} className="inline mr-2" />
                          Patient: {apt.patients?.name}
                        </p>
                        <p>
                          <Stethoscope size={16} className="inline mr-2" />
                          Dr. {apt.staff?.first_name} {apt.staff?.last_name}
                        </p>
                        <p>
                          <Clock size={16} className="inline mr-2" />
                          {formatDateTime(apt.start_time)}
                        </p>
                      </div>
                    </div>
                    <span className={getStatusStyle(apt.status)}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : appointment ? (
            <>
              <div className="appointmentDetails__grid">
                <div className="appointmentDetails__section">
                  <h3 className="appointmentDetails__sectionTitle">
                    <Calendar size={20} />
                    Appointment Info
                  </h3>
                  <div className="appointmentDetails__infoGrid">
                    <span className="appointmentDetails__label">Title</span>
                    <span className="appointmentDetails__value">{appointment.title}</span>
                    <span className="appointmentDetails__label">Status</span>
                    <span className={getStatusStyle(appointment.status)}>
                      {appointment.status}
                    </span>
                    <span className="appointmentDetails__label">Start Time</span>
                    <span className="appointmentDetails__value">
                      {formatDateTime(appointment.start_time)}
                    </span>
                    <span className="appointmentDetails__label">End Time</span>
                    <span className="appointmentDetails__value">
                      {formatDateTime(appointment.end_time)}
                    </span>
                  </div>
                </div>

                <div className="appointmentDetails__section">
                  <h3 className="appointmentDetails__sectionTitle">
                    <User size={20} />
                    Patient Info
                  </h3>
                  <div className="appointmentDetails__infoGrid">
                    <span className="appointmentDetails__label">Name</span>
                    <span className="appointmentDetails__value">
                      {appointment.patients?.name}
                    </span>
                    <span className="appointmentDetails__label">Species</span>
                    <span className="appointmentDetails__value">
                      {appointment.patients?.species}
                    </span>
                    <span className="appointmentDetails__label">Breed</span>
                    <span className="appointmentDetails__value">
                      {appointment.patients?.breed}
                    </span>
                  </div>
                </div>

                <div className="appointmentDetails__section">
                  <h3 className="appointmentDetails__sectionTitle">
                    <Stethoscope size={20} />
                    Staff Info
                  </h3>
                  <div className="appointmentDetails__infoGrid">
                    <span className="appointmentDetails__label">Doctor</span>
                    <span className="appointmentDetails__value">
                      Dr. {appointment.staff?.first_name} {appointment.staff?.last_name}
                    </span>
                  </div>
                </div>

                <div className="appointmentDetails__section">
                  <h3 className="appointmentDetails__sectionTitle">
                    <Phone size={20} />
                    Owner Info
                  </h3>
                  <div className="appointmentDetails__infoGrid">
                    <span className="appointmentDetails__label">Name</span>
                    <span className="appointmentDetails__value">
                      {appointment.owners?.owners?.first_name} {appointment.owners?.owners?.last_name}
                    </span>
                    <span className="appointmentDetails__label">Phone</span>
                    <span className="appointmentDetails__value">
                      {appointment.owners?.owners?.phone_number}
                    </span>
                    <span className="appointmentDetails__label">Email</span>
                    <span className="appointmentDetails__value">
                      {appointment.owners?.owners?.email}
                    </span>
                  </div>
                </div>
              </div>

              {appointment.description && (
                <div className="appointmentDetails__description">
                  <h3 className="appointmentDetails__sectionTitle">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {appointment.description}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              No appointment details available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;