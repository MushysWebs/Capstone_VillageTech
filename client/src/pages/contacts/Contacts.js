import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Edit2, X, Save, Clock, Calendar, Send, Camera} from 'lucide-react';
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
  const fileInputRef = useRef(null);
  const supabase = useSupabaseClient();

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
      setError('Failed to fetch contacts');
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
      setError('Failed to fetch patients');
    }
  };

  const fetchInvoices = async (patientIds) => {
    try {
      const { data, error } = await supabase
        .from('financial')
        .select('*')
        .in('pet_id', patientIds);
      
      if (error) throw error;
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to fetch invoices');
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
        setError('Failed to upload profile picture: ' + error.message);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContact(null);
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

      // Update the contacts list
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === data.id ? data : contact
        )
      );

      // Update the selected contact
      setSelectedContact(data);

      // Update filtered contacts
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
      setError('Failed to update contact: ' + error.message);
    }
  };

  /* If currently editing, ask for confirmation before switching. Uncomment and add into return() if you want, but I'm not a fan.
  const handleContactSelect = (contact) => {
    if (isEditing) {
      if (window.confirm("You have unsaved changes. Are you sure you want to switch contacts?")) {
        setSelectedContact(contact);
        setIsEditing(false);
        setEditedContact(null);
      }
    } else {
      setSelectedContact(contact);
    }
  }; */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedContact(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); 
  };

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
                src={contact.profile_picture_url || `/api/placeholder/80/80`} 
                alt={`${contact.first_name} ${contact.last_name}`} 
                className="contact-avatar" 
              />
              <span className="contact-name">{`${contact.first_name} ${contact.last_name}`}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="contacts-main">
        {error && <div className="error-message">{error}</div>}
        {selectedContact && (
          <>
            <div className={`contact-header ${isEditing ? 'editable' : ''}`}>
              <div className="profile-picture-container" onClick={handleProfilePictureClick}>
                <img 
                  src={profilePicture || selectedContact.profile_picture_url || `/api/placeholder/80/80`} 
                  alt={`${selectedContact.first_name} ${selectedContact.last_name}`} 
                  className="contact-header-avatar" 
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
              <button className="action-button">
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
                    <img src={`/api/placeholder/60/60`} alt={patient.name} />
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
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Name</th>
                    <th>Patient</th>
                    <th>Low Total</th>
                    <th>High Total</th>
                    <th>Deposit</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const patient = patients.find(p => p.id === invoice.pet_id);
                    return (
                      <tr key={invoice.financial_number}>
                        <td>{invoice.financial_number}</td>
                        <td>{invoice.financial_name}</td>
                        <td>{patient ? patient.name : 'Unknown'}</td>
                        <td>${invoice.financial_lowtotal.toFixed(2)}</td>
                        <td>${invoice.financial_hightotal.toFixed(2)}</td>
                        <td>${invoice.financial_deposit.toFixed(2)}</td>
                        <td>{formatDate(invoice.financial_date)}</td>
                        <td>{invoice.financial_status || 'Created'}</td>
                        <td>{formatDate(invoice.financial_lastupdate)} {invoice.financial_lastupdate ? 'Edwardo ling' : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Contacts;