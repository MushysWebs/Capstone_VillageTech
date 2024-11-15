import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Search, User, Calendar, Clock, FileText, Stethoscope, X } from 'lucide-react';
import './AddAppointment.css';

const AddAppointment = ({ onClose, onAppointmentAdded, patientId, patientName, ownerId }) => {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [pets, setPets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointmentData, setAppointmentData] = useState({
    patient_id: patientId || '',
    staff_id: '',
    title: '',
    start_time: '',
    end_time: '',
    description: '',
    status: 'Scheduled'
  });
  const [selectedPet, setSelectedPet] = useState(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchStaff();
    if (ownerId) {
      fetchOwnerDetails(ownerId);
    } else {
      fetchOwners();
    }
  }, [ownerId]);

  const fetchOwnerDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setSelectedOwner(data);
      setOwnerSearch(`${data.first_name} ${data.last_name} - ${data.phone_number}`);
      fetchPets(id);
    } catch (error) {
      console.error('Error fetching owner details:', error);
    }
  };

  useEffect(() => {
    if (owners.length > 0) {
      filterOwners(ownerSearch);
    }
  }, [ownerSearch, owners]);

  const fetchOwners = async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .order('id');
      
      if (error) throw error;
      setOwners(data);
      setFilteredOwners(data);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const fetchPets = async (ownerId) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('owner_id', ownerId);
      
      if (error) throw error;
      setPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  useEffect(() => {
    if (patientId && patientName) {
      setSelectedPet({ id: patientId, name: patientName });
    }
  }, [patientId, patientName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [name]: value }));
    if (name === 'patient_id' && !patientId) {
      const pet = pets.find(p => p.id === parseInt(value));
      setSelectedPet(pet);
    }
  };



  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, first_name, last_name')
        .eq('role', 'Veterinarian')
        .eq('status', 'Active')
        .order('last_name');
      
      if (error) throw error;
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const filterOwners = (search) => {
    const filtered = owners.filter(owner =>
      owner.first_name.toLowerCase().includes(search.toLowerCase()) ||
      owner.last_name.toLowerCase().includes(search.toLowerCase()) ||
      owner.phone_number.includes(search)
    );
    setFilteredOwners(filtered);
  };

  const handleOwnerSelect = (owner) => {
    setSelectedOwner(owner);
    setOwnerSearch(`${owner.first_name} ${owner.last_name} - ${owner.phone_number}`);
    fetchPets(owner.id);
    setAppointmentData(prev => ({ ...prev, patient_id: '' }));
    setFilteredOwners([]);
  };

  const handleOwnerSearch = (e) => {
    const search = e.target.value;
    setOwnerSearch(search);
    if (search === '') {
      setSelectedOwner(null);
      setPets([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();
  
      if (error) {
        console.error('Error adding appointment:', error);
      } else {
        const newAppointment = data[0];
        const selectedPet = pets.find(pet => pet.id === parseInt(appointmentData.patient_id));
        const selectedStaff = staff.find(s => s.id === parseInt(appointmentData.staff_id));
        
        newAppointment.patient_name = selectedPet ? selectedPet.name : 'Unknown';
        newAppointment.staff_name = selectedStaff ? `${selectedStaff.first_name} ${selectedStaff.last_name}` : 'Unknown';
        
        onAppointmentAdded(newAppointment);
        onClose();
      }
    } catch (error) {
      console.error('Exception when adding appointment:', error);
    }
  };

  return (
    <div className="addAppointment__overlay">
      <div className="addAppointment__container">
        <div className="addAppointment__header">
          <h2 className="addAppointment__title">Add New Appointment</h2>
          {selectedPet && (
            <img 
              src={selectedPet.image_url || `/api/placeholder/60/60`}
              alt={selectedPet.name}
              className="addAppointment__petImage"
            />
          )}
        </div>

        <form onSubmit={handleSubmit} className="addAppointment__form">
        <div className="addAppointment__searchContainer">
        <div className="addAppointment__section">
          <label className="addAppointment__label">
            <User size={16} />
            Owner Search
          </label>
          <div className="addAppointment__searchInputWrapper">
            <input
              type="text"
              placeholder="Search by name or phone number"
              value={ownerSearch}
              onChange={handleOwnerSearch}
              className="addAppointment__input addAppointment__input--withIcon"
              disabled={!!ownerId}
            />
            {filteredOwners.length > 0 && !selectedOwner && !ownerId && (
              <ul className="addAppointment__ownerList">
                {filteredOwners.map(owner => (
                  <li 
                    key={owner.id} 
                    onClick={() => handleOwnerSelect(owner)}
                    className="addAppointment__ownerItem"
                  >
                    <div className="addAppointment__ownerIcon">
                      <User size={20} />
                    </div>
                    <div className="addAppointment__ownerInfo">
                      <div className="addAppointment__ownerName">
                        {owner.first_name} {owner.last_name}
                      </div>
                      <div className="addAppointment__ownerDetails">
                        📞 {owner.phone_number}
                        {owner.email && ` • ✉️ ${owner.email}`}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedOwner && (
            <div className="addAppointment__selectedOwner">
              <div className="addAppointment__ownerIcon">
                <User size={20} />
              </div>
              <div className="addAppointment__ownerInfo">
                <div className="addAppointment__ownerName">
                  {selectedOwner.first_name} {selectedOwner.last_name}
                </div>
                <div className="addAppointment__ownerDetails">
                  📞 {selectedOwner.phone_number}
                  {selectedOwner.email && ` • ✉️ ${selectedOwner.email}`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

          <div className="addAppointment__section">
            <label className="addAppointment__label">
              <User size={16} />
              Patient
            </label>
            <select
              name="patient_id"
              value={appointmentData.patient_id}
              onChange={handleInputChange}
              required
              className="addAppointment__select"
              disabled={!!patientId || !selectedOwner}
            >
              <option value="">Select Patient</option>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.name}</option>
              ))}
            </select>
          </div>

          <div className="addAppointment__section">
            <label className="addAppointment__label">
              <Stethoscope size={16} />
              Doctor
            </label>
            <select
              name="staff_id"
              value={appointmentData.staff_id}
              onChange={handleInputChange}
              required
              className="addAppointment__select"
            >
              <option value="">Select Doctor</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>Dr. {`${s.first_name} ${s.last_name}`}</option>
              ))}
            </select>
          </div>

          <div className="addAppointment__section">
            <label className="addAppointment__label">
              <Calendar size={16} />
              Appointment Title
            </label>
            <input
              type="text"
              name="title"
              value={appointmentData.title}
              onChange={handleInputChange}
              placeholder="Enter appointment title"
              required
              className="addAppointment__input"
            />
          </div>

          <div className="addAppointment__section">
            <label className="addAppointment__label">
              <Clock size={16} />
              Start Time
            </label>
            <input
              type="datetime-local"
              name="start_time"
              value={appointmentData.start_time}
              onChange={handleInputChange}
              required
              className="addAppointment__input"
            />
          </div>

          <div className="addAppointment__section">
            <label className="addAppointment__label">
              <Clock size={16} />
              End Time
            </label>
            <input
              type="datetime-local"
              name="end_time"
              value={appointmentData.end_time}
              onChange={handleInputChange}
              required
              className="addAppointment__input"
            />
          </div>

          <div className="addAppointment__section">
            <label className="addAppointment__label">
              <FileText size={16} />
              Description
            </label>
            <textarea
              name="description"
              value={appointmentData.description}
              onChange={handleInputChange}
              placeholder="Enter appointment details"
              className="addAppointment__textarea"
            />
          </div>

          <div className="addAppointment__actions">
            <button 
              type="submit" 
              className="addAppointment__button addAppointment__button--primary"
            >
              Add Appointment
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="addAppointment__button addAppointment__button--secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointment;