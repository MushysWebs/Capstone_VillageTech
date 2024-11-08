import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { format, isAfter, isBefore, startOfDay, endOfDay, addDays, differenceInMinutes } from 'date-fns';
import { 
  X, 
  ChevronLeft, 
  Calendar, 
  User, 
  Stethoscope, 
  Phone, 
  Clock, 
  Filter, 
  Search, 
  SortAsc,
  FileText,
  Edit,
  MessageCircle,
  Trash2 
} from 'lucide-react';
import './AppointmentDetails.css';

const AppointmentDetails = ({ isOpen, onClose, appointmentId: initialAppointmentId, mode: initialMode = 'detail' }) => {
  const [appointment, setAppointment] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(initialAppointmentId);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(addDays(new Date(), 7), 'yyyy-MM-dd')
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'start_time',
    direction: 'asc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (currentMode === 'list') {
      fetchAllAppointments();
    } else if (currentAppointmentId) {
      fetchAppointmentDetails();
    }
  }, [currentAppointmentId, currentMode]);

  useEffect(() => {
    if (allAppointments.length > 0) {
      filterAndSortAppointments();
    }
  }, [allAppointments, dateRange, sortConfig, searchTerm, filterStatus]);

  const formatDuration = (start, end) => {
    const diffMinutes = differenceInMinutes(end, start);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
    }
  };

  const filterAndSortAppointments = () => {
    let filtered = [...allAppointments];

    filtered = filtered.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return isAfter(aptDate, startOfDay(new Date(dateRange.start))) &&
             isBefore(aptDate, endOfDay(new Date(dateRange.end)));
    });

    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${apt.staff?.first_name} ${apt.staff?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.key) {
        case 'start_time':
          comparison = new Date(a.start_time) - new Date(b.start_time);
          break;
        case 'patient':
          comparison = a.patients?.name.localeCompare(b.patients?.name);
          break;
        case 'doctor':
          comparison = `${a.staff?.last_name}`.localeCompare(`${b.staff?.last_name}`);
          break;
        default:
          comparison = 0;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    setFilteredAppointments(filtered);
  };

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

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
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

  const renderListView = () => (
    <div className="appointmentDetails__listContainer">
      <div className="appointmentDetails__listControls">
        <div className="appointmentDetails__searchBar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="appointmentDetails__searchInput"
          />
        </div>
        
        <div className="appointmentDetails__filters">
          <div className="appointmentDetails__dateFilters">
            <label className="appointmentDetails__filterLabel">
              <Calendar size={16} />
              From:
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="appointmentDetails__dateInput"
              />
            </label>
            <label className="appointmentDetails__filterLabel">
              To:
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="appointmentDetails__dateInput"
              />
            </label>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appointmentDetails__statusFilter"
          >
            <option value="all">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="appointmentDetails__sortButtons">
          <button 
            onClick={() => handleSort('start_time')}
            className={`appointmentDetails__sortButton ${sortConfig.key === 'start_time' ? 'active' : ''}`}
          >
            <Clock size={16} />
            Date/Time
            <SortAsc size={16} className={sortConfig.direction === 'desc' ? 'rotate-180' : ''} />
          </button>
          <button 
            onClick={() => handleSort('patient')}
            className={`appointmentDetails__sortButton ${sortConfig.key === 'patient' ? 'active' : ''}`}
          >
            <User size={16} />
            Patient
            <SortAsc size={16} className={sortConfig.direction === 'desc' ? 'rotate-180' : ''} />
          </button>
          <button 
            onClick={() => handleSort('doctor')}
            className={`appointmentDetails__sortButton ${sortConfig.key === 'doctor' ? 'active' : ''}`}
          >
            <Stethoscope size={16} />
            Doctor
            <SortAsc size={16} className={sortConfig.direction === 'desc' ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>

      <div className="appointmentDetails__list">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="appointmentDetails__listItem"
              onClick={() => handleAppointmentClick(apt)}
            >
              <div className="appointmentDetails__listItemHeader">
                <div className="appointmentDetails__listItemMain">
                  <h3 className="appointmentDetails__listItemTitle">{apt.title}</h3>
                  <span className={getStatusStyle(apt.status)}>
                    {apt.status}
                  </span>
                </div>
                <div className="appointmentDetails__listItemTime">
                  <Clock size={16} />
                  {formatDateTime(apt.start_time)}
                </div>
              </div>
              
              <div className="appointmentDetails__listItemDetails">
                <div className="appointmentDetails__listItemInfo">
                  <div className="appointmentDetails__infoColumn">
                    <p className="appointmentDetails__infoLabel">
                      <User size={16} />
                      Patient
                    </p>
                    <p className="appointmentDetails__infoValue">
                      {apt.patients?.name}
                    </p>
                  </div>
                  <div className="appointmentDetails__infoColumn">
                    <p className="appointmentDetails__infoLabel">
                      <Stethoscope size={16} />
                      Doctor
                    </p>
                    <p className="appointmentDetails__infoValue">
                      Dr. {apt.staff?.first_name} {apt.staff?.last_name}
                    </p>
                  </div>
                  <div className="appointmentDetails__infoColumn">
                    <p className="appointmentDetails__infoLabel">
                      <Phone size={16} />
                      Duration
                    </p>
                    <p className="appointmentDetails__infoValue">
                      {format(new Date(apt.start_time), 'h:mm a')} - {format(new Date(apt.end_time), 'h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="appointmentDetails__noResults">
            <Calendar size={48} className="text-gray-300" />
            <p>No appointments found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );

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
            <div className="appointmentDetails__listContainer">
              <div className="appointmentDetails__listControls">
                <div className="appointmentDetails__searchBar">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="appointmentDetails__searchInput"
                  />
                </div>
                
                <div className="appointmentDetails__filters">
                  <div className="appointmentDetails__dateFilters">
                    <label className="appointmentDetails__filterLabel">
                      <Calendar size={16} />
                      From:
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="appointmentDetails__dateInput"
                      />
                    </label>
                    <label className="appointmentDetails__filterLabel">
                      To:
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="appointmentDetails__dateInput"
                      />
                    </label>
                  </div>
  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appointmentDetails__statusFilter"
                  >
                    <option value="all">All Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
  
                <div className="appointmentDetails__sortButtons">
                  <button 
                    onClick={() => handleSort('start_time')}
                    className={`appointmentDetails__sortButton ${sortConfig.key === 'start_time' ? 'active' : ''}`}
                  >
                    <Clock size={16} />
                    Date/Time
                    <SortAsc size={16} className={sortConfig.direction === 'desc' ? 'rotate-180' : ''} />
                  </button>
                  <button 
                    onClick={() => handleSort('patient')}
                    className={`appointmentDetails__sortButton ${sortConfig.key === 'patient' ? 'active' : ''}`}
                  >
                    <User size={16} />
                    Patient
                    <SortAsc size={16} className={sortConfig.direction === 'desc' ? 'rotate-180' : ''} />
                  </button>
                  <button 
                    onClick={() => handleSort('doctor')}
                    className={`appointmentDetails__sortButton ${sortConfig.key === 'doctor' ? 'active' : ''}`}
                  >
                    <Stethoscope size={16} />
                    Doctor
                    <SortAsc size={16} className={sortConfig.direction === 'desc' ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>
  
              <div className="appointmentDetails__list">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="appointmentDetails__listItem"
                      onClick={() => handleAppointmentClick(apt)}
                    >
                      <div className="appointmentDetails__listItemHeader">
                        <div className="appointmentDetails__listItemMain">
                          <h3 className="appointmentDetails__listItemTitle">{apt.title}</h3>
                          <span className={getStatusStyle(apt.status)}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="appointmentDetails__listItemTime">
                          <Clock size={16} />
                          {formatDateTime(apt.start_time)}
                        </div>
                      </div>
                      
                      <div className="appointmentDetails__listItemDetails">
                        <div className="appointmentDetails__listItemInfo">
                          <div className="appointmentDetails__infoColumn">
                            <p className="appointmentDetails__infoLabel">
                              <User size={16} />
                              Patient
                            </p>
                            <p className="appointmentDetails__infoValue">
                              {apt.patients?.name}
                            </p>
                          </div>
                          <div className="appointmentDetails__infoColumn">
                            <p className="appointmentDetails__infoLabel">
                              <Stethoscope size={16} />
                              Doctor
                            </p>
                            <p className="appointmentDetails__infoValue">
                              Dr. {apt.staff?.first_name} {apt.staff?.last_name}
                            </p>
                          </div>
                          <div className="appointmentDetails__infoColumn">
                            <p className="appointmentDetails__infoLabel">
                              <Clock size={16} />
                              Duration
                            </p>
                            <p className="appointmentDetails__infoValue">
                              {format(new Date(apt.start_time), 'h:mm a')} - {format(new Date(apt.end_time), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="appointmentDetails__noResults">
                    <Calendar size={48} className="text-gray-300" />
                    <p>No appointments found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>
          ) : appointment ? (
            <div className="appointmentDetails__detailView">
              <div className="appointmentDetails__headerBar">
                <div className="appointmentDetails__headerMain">
                  <h1 className="appointmentDetails__headerTitle">{appointment.title}</h1>
                  <div className="appointmentDetails__headerTime">
                    <Clock size={20} />
                    {formatDateTime(appointment.start_time)}
                  </div>
                </div>
                <span className={`appointmentDetails__headerStatus appointmentDetails__status--${appointment.status.toLowerCase()}`}>
                  {appointment.status}
                </span>
              </div>
          
              <div className="appointmentDetails__grid">
                <div className="appointmentDetails__section">
                  <h3 className="appointmentDetails__sectionTitle">
                    <span className="appointmentDetails__sectionIcon">
                      <Calendar size={20} />
                    </span>
                    Appointment Details
                  </h3>
                  <div className="appointmentDetails__infoGrid">
                    <span className="appointmentDetails__label">
                      <Clock size={16} />
                      Start Time
                    </span>
                    <span className="appointmentDetails__value">
                      {format(new Date(appointment.start_time), 'MMM d, yyyy h:mm a')}
                    </span>
                    <span className="appointmentDetails__label">
                      <Clock size={16} />
                      End Time
                    </span>
                    <span className="appointmentDetails__value">
                      {format(new Date(appointment.end_time), 'MMM d, yyyy h:mm a')}
                    </span>
                    <span className="appointmentDetails__label">
                      <Clock size={16} />
                      Duration
                    </span>
                    <span className="appointmentDetails__value">
                      {formatDuration(new Date(appointment.start_time), new Date(appointment.end_time))}
                    </span>
                  </div>
                </div>
          
                <div className="appointmentDetails__section">
                  <h3 className="appointmentDetails__sectionTitle">
                    <span className="appointmentDetails__sectionIcon">
                      <User size={20} />
                    </span>
                    Patient Information
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
                    <span className="appointmentDetails__label">Birth Date</span>
                    <span className="appointmentDetails__value">
                      {appointment.patients?.date_of_birth ? 
                        format(new Date(appointment.patients.date_of_birth), 'MMM d, yyyy') : 
                        'Not provided'}
                    </span>
                  </div>
                </div>
          
                <div className="appointmentDetails__section">
                  <h3 className="appointmentDetails__sectionTitle">
                    <span className="appointmentDetails__sectionIcon">
                      <Stethoscope size={20} />
                    </span>
                    Staff Information
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
                    <span className="appointmentDetails__sectionIcon">
                      <Phone size={20} />
                    </span>
                    Owner Information
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
                  <h3 className="appointmentDetails__sectionTitle">
                    <span className="appointmentDetails__sectionIcon">
                      <FileText size={20} />
                    </span>
                    Description
                  </h3>
                  <p className="appointmentDetails__descriptionContent">
                    {appointment.description}
                  </p>
                </div>
              )}
          
              <div className="appointmentDetails__actions">
                <button className="appointmentDetails__actionButton appointmentDetails__actionButton--primary">
                  <Edit size={18} />
                  Edit Appointment
                </button>
                <button className="appointmentDetails__actionButton appointmentDetails__actionButton--secondary">
                  <MessageCircle size={18} />
                  Contact Owner
                </button>
                <button className="appointmentDetails__actionButton appointmentDetails__actionButton--danger">
                  <Trash2 size={18} />
                  Cancel Appointment
                </button>
              </div>
            </div>
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