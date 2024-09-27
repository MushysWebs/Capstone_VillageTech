import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const AddAppointment = ({ onClose, onAppointmentAdded }) => {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [pets, setPets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointmentData, setAppointmentData] = useState({
    patient_id: '',
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
    fetchOwners();
    fetchStaff();
  }, []);

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


  //TODO: UPDATE THIS TO VETS ONLY, BUT WE'RE USING ALL STAFF FOR NOW FOR CONVENIENCE
  const fetchStaff = async () => {
    const { data, error } = await supabase.from('staff').select('id, first_name, last_name');
    if (error) console.error('Error fetching staff:', error);
    else setStaff(data);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [name]: value }));
    if (name === 'patient_id') {
      const pet = pets.find(p => p.id === parseInt(value));
      setSelectedPet(pet);
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
    <div className="calendarView__modal">
      <div className="calendarView__modalContent">
        <div className="calendarView__modalHeader">
          <h2>Add New Appointment</h2>
          {selectedPet && (
            <img 
              src={selectedPet.image_url || `/api/placeholder/60/60`}
              alt={selectedPet.name}
              className="calendarView__petImage"
            />
          )}
        </div>
        <form onSubmit={handleSubmit} className="calendarView__form">
          <div className="calendarView__ownerSelect">
            <input
              type="text"
              placeholder="Search and select owner"
              value={ownerSearch}
              onChange={handleOwnerSearch}
              className="calendarView__input"
            />
            {filteredOwners.length > 0 && !selectedOwner && (
              <ul className="calendarView__ownerList">
                {filteredOwners.map(owner => (
                  <li key={owner.id} onClick={() => handleOwnerSelect(owner)}>
                    {`${owner.first_name} ${owner.last_name} - ${owner.phone_number}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <select
            name="patient_id"
            value={appointmentData.patient_id}
            onChange={handleInputChange}
            required
            className="calendarView__select"
            disabled={!selectedOwner}
          >
            <option value="">Select Pet</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>{pet.name}</option>
            ))}
          </select>

          <select
            name="staff_id"
            value={appointmentData.staff_id}
            onChange={handleInputChange}
            required
            className="calendarView__select"
          >
            <option value="">Select Staff</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{`${s.first_name} ${s.last_name}`}</option>
            ))}
          </select>

          <input
            type="text"
            name="title"
            value={appointmentData.title}
            onChange={handleInputChange}
            placeholder="Appointment Title"
            required
            className="calendarView__input"
          />
          <input
            type="datetime-local"
            name="start_time"
            value={appointmentData.start_time}
            onChange={handleInputChange}
            required
            className="calendarView__input"
          />
          <input
            type="datetime-local"
            name="end_time"
            value={appointmentData.end_time}
            onChange={handleInputChange}
            required
            className="calendarView__input"
          />
          <textarea
            name="description"
            value={appointmentData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="calendarView__textarea"
          />
          <button type="submit" className="calendarView__submitButton">Add Appointment</button>
          <button type="button" onClick={onClose} className="calendarView__cancelButton">Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default AddAppointment;