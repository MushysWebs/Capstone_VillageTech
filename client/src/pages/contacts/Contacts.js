import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Edit2, X, Save, Clock, Calendar, Send, Camera, Trash2 } from 'lucide-react';
import AddAppointment from '../dashboard/calendarView/AddAppointment';
import CreateContactModal from './CreateContactModal';
import './Contacts.css';

const Contacts = ({ globalSearchTerm }) => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState(null);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const invoicesPerPage = 10;
  const fileInputRef = useRef(null);
  const supabase = useSupabaseClient();
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = invoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(invoices.length / invoicesPerPage);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchPatients(selectedContact.id);
      setIsEditing(false);
      setEditedContact(null);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (patients.length > 0) {
      fetchInvoices(patients.map(patient => patient.id));
    }
  }, [patients]);

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      (contact.first_name?.toLowerCase() || '').includes((globalSearchTerm || '').toLowerCase()) ||
      (contact.last_name?.toLowerCase() || '').includes((globalSearchTerm || '').toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [globalSearchTerm, contacts]);

  const sortedPatients = patients.sort((a, b) => a.id - b.id);

  const handleCreateContact = async (formData) => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .insert([formData])
        .select()
        .single();
  
      if (error) throw error;
  
      setContacts(prev => [...prev, data]);
      setFilteredContacts(prev => [...prev, data]);
      
      return data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
  
    if (window.confirm('Are you sure you want to delete this contact? Their patients and invoices will be preserved in the system.')) {
      try {
        const { error: contactError } = await supabase
          .from('owners')
          .delete()
          .eq('id', selectedContact.id);
  
        if (contactError) throw contactError;
  
        setContacts(contacts.filter(contact => contact.id !== selectedContact.id));
        setFilteredContacts(filteredContacts.filter(contact => contact.id !== selectedContact.id));
        setSelectedContact(null);
        setPatients([]);
        setInvoices([]);
        
        // success message via error state
        setError('Contact successfully deleted. Their patients and invoices have been preserved.');
        
        // clear error message after 3 seconds
        setTimeout(() => setError(null), 3000);
  
      } catch (error) {
        console.error('Error deleting contact:', error);
        setError('Failed to delete contact. Please try again.');
      }
    }
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .order('id');
      
      if (error) throw error;
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to fetch contacts. Please try again later.');
    }
  };

  const fetchPatients = async (ownerId) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('owner_id', ownerId);
      
      if (error) throw error;
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to fetch patients. Please refresh or try again later.');
    }
  };

  const fetchInvoices = async (patientIds) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .in('patient_id', patientIds);
      
      if (error) throw error;
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to fetch invoices. Please refresh or try again later.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContact({ ...selectedContact });
  };

  const handleProfilePictureClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `profile_pictures/${fileName}`;

        let { error: uploadError } = await supabase.storage
          .from('contacts')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('contacts')
          .getPublicUrl(filePath);

        if (urlError) {
          throw urlError;
        }

        setProfilePicture(publicUrl);
        setEditedContact(prev => ({ ...prev, profile_picture_url: publicUrl }));
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Failed to upload profile picture. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContact(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      if (!editedContact || !editedContact.id) {
        throw new Error('No contact selected for editing');
      }

      const { data, error } = await supabase
        .from('owners')
        .update({
          ...editedContact,
          profile_picture_url: profilePicture || editedContact.profile_picture_url
        })
        .eq('id', editedContact.id)
        .select()
        .single();

      if (error) throw error;

      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === data.id ? data : contact
        )
      );

      setSelectedContact(data);

      setFilteredContacts(prevFiltered =>
        prevFiltered.map(contact =>
          contact.id === data.id ? data : contact
        )
      );

      setIsEditing(false);
      setEditedContact(null);
      setError(null);
    } catch (error) {
      console.error('Error updating contact:', error);
      setError('Failed to update contact. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedContact(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); 
  };

  const handleAddAppointmentClick = (patient) => {
    setSelectedPatient(patient);
    setShowAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false);
    setSelectedPatient(null);
  };

  const handleAppointmentAdded = (newAppointment) => {
    console.log('New appointment added:', newAppointment);
    setShowAppointmentModal(false);
  };

  const defaultOPicUrl = supabase
  .storage
  .from('contacts')
  .getPublicUrl('profile_pictures/defaultOPic.png').data.publicUrl;

  const defaultProfilePicUrl = supabase
  .storage
  .from('contacts')
  .getPublicUrl('profile_pictures/defaultPPic.png').data.publicUrl;

  return (
    <div className="contacts-page">
      <div className="contacts-sidebar">
        <div className="contacts-list">
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
              onClick={() => setSelectedContact(contact)}
            >
              <img 
                src={contact.profile_picture_url || defaultOPicUrl} 
                alt={`${contact.first_name} ${contact.last_name}`} 
                className="contact-avatar" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultOPicUrl;
                }}
              />
              <span className="contact-name">{`${contact.first_name} ${contact.last_name}`}</span>
            </div>
          ))}
        </div>
        <div className="create-contact-wrapper">
          <button className="create-contact-button" onClick={() => setShowCreateModal(true)}>
            + New Contact
          </button>
        </div>
      </div>
  
      <div className="contacts-main">
        {error && <div className="error-message">{error}</div>}
        {selectedContact && (
          <>
            <div className={`contact-header ${isEditing ? 'editable' : ''}`}>
              <div className="profile-picture-container" onClick={handleProfilePictureClick}>
                <img
                  src={selectedContact.profile_picture_url || defaultProfilePicUrl}
                  alt={`${selectedContact.first_name} ${selectedContact.last_name}`}
                  className="contact-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultProfilePicUrl;
                  }}
                />
                {isEditing && (
                  <div className="profile-picture-overlay">
                    <Camera size={24} />
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                />
              </div>
              <div className="contact-header-info">
                <h2>{`${selectedContact.first_name} ${selectedContact.last_name}`}</h2>
                {isEditing ? (
                  <>
                    <p><span>Phone:</span><input name="phone_number" value={editedContact.phone_number || ''} onChange={handleInputChange} /></p>
                    <p><span>Secondary:</span><input name="secondary_phone_number" value={editedContact.secondary_phone_number || ''} onChange={handleInputChange} /></p>
                    <p><span>Email:</span><input name="email" value={editedContact.email || ''} onChange={handleInputChange} /></p>
                    <p><span>Address:</span><input name="address" value={editedContact.address || ''} onChange={handleInputChange} /></p>
                    <p><span>Notes:</span><textarea name="notes" value={editedContact.notes || ''} onChange={handleInputChange} /></p>
                  </>
                ) : (
                  <>
                    <p><span>Phone:</span>{selectedContact.phone_number || 'N/A'}</p>
                    <p><span>Secondary:</span>{selectedContact.secondary_phone_number || 'N/A'}</p>
                    <p><span>Email:</span>{selectedContact.email}</p>
                    <p><span>Address:</span>{selectedContact.address || 'N/A'}</p>
                    <p><span>Notes:</span>{selectedContact.notes || 'N/A'}</p>
                  </>
                )}
              </div>
              {isEditing ? (
                <>
                  <button className="action-button cancel-button" onClick={handleCancel}>
                    <X size={18} />
                    Cancel
                  </button>
                  <button className="action-button save-button" onClick={handleSave}>
                    <Save size={18} />
                    Save
                  </button>
                </>
              ) : (
                <button className="action-button edit-button" onClick={handleEdit}>
                  <Edit2 size={18} />
                  Edit
                </button>
              )}
            </div>
  
            <div className="contact-actions">
              <button className="action-button">
                <Clock size={18} />
                Set Up Reminders
              </button>
              <button className="action-button" onClick={() => handleAddAppointmentClick(selectedPatient)}>
                <Calendar size={18} />
                Create Appointment
              </button>
              <button className="action-button">
                <Send size={18} />
                Send Payment Request
              </button>
            </div>
  
            <div className="pets-section">
              <h3>PETS</h3>
              <div className="pets-grid">
                {sortedPatients.map(patient => (
                  <div key={patient.id} className="pet-card">
                    <img
                      src={patient.image_url || defaultProfilePicUrl}
                      alt={patient.name}
                      className="patient-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultProfilePicUrl;
                      }}
                    />
                    <h4>{patient.name} <Edit2 size={14} /></h4>
                    <p>Patient ID: {patient.id}</p>
                    <p>Date of Birth: {patient.date_of_birth}</p>
                    <p>{patient.species} - {patient.breed}</p>
                    <p>Weight: {patient.weight} kg</p>
                  </div>
                ))}
              </div>
            </div>
  
            <div className="invoices-section">
              <h3>INVOICES</h3>
              <div className="invoices-table-container">
                <table className="invoices-table">
                  <thead>
                    <tr>
                      <th>Number</th>
                      <th>Name</th>
                      <th>Patient</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoices.map((invoice) => {
                      const patient = patients.find(p => p.id === invoice.patient_id);
                      return (
                        <tr key={invoice.invoice_id}>
                          <td>{invoice.invoice_id}</td>
                          <td>{invoice.invoice_name}</td>
                          <td>{patient ? patient.name : 'Unknown'}</td>
                          <td>${invoice.invoice_total.toFixed(2)}</td>
                          <td>{formatDate(invoice.invoice_date)}</td>
                          <td>{invoice.invoice_status || 'Pending'}</td>
                          <td>{invoice.last_update ? formatDate(invoice.last_update) : 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {invoices.length > invoicesPerPage && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
  
            <div className="delete-contact-container">
              <button className="delete-contact-button" onClick={handleDeleteContact}>
                <Trash2 size={18} />
                Delete Contact
              </button>
            </div>
          </>
        )}
      </div>
  
      {showAppointmentModal && (
        <AddAppointment
          onClose={handleCloseAppointmentModal}
          onAppointmentAdded={handleAppointmentAdded}
          patientId={selectedPatient?.id}
          patientName={selectedPatient?.name}
          ownerId={selectedContact?.id}
        />
      )}
      {showCreateModal && (
        <CreateContactModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateContact={handleCreateContact}
        />
      )}
    </div>
  );
  
};

export default Contacts;
