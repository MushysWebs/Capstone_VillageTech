import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Edit2, Clock, Calendar, Send } from 'lucide-react';
import './Contacts.css';

const Contacts = ({ globalSearchTerm }) => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchPatients(selectedContact.id);
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

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*');
      
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
              <img src={`/api/placeholder/80/80`} alt={`${contact.first_name} ${contact.last_name}`} className="contact-avatar" />
              <span className="contact-name">{`${contact.first_name} ${contact.last_name}`}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="contacts-main">
        {error && <div className="error-message">{error}</div>}
        {selectedContact ? (
          <>
            <div className="contact-header">
              <img src={`/api/placeholder/80/80`} alt={`${selectedContact.first_name} ${selectedContact.last_name}`} className="contact-header-avatar" />
              <div className="contact-header-info">
                <h2>{`${selectedContact.first_name} ${selectedContact.last_name}`}</h2>
                <p>Phone: {selectedContact.phone_number || 'N/A'}</p>
                <p>Secondary: {selectedContact.secondary_phone_number || 'N/A'}</p>
                <p>Email: {selectedContact.email}</p>
                <p>Fax: {selectedContact.fax || '124421412'}</p>
                <p>Landline: {selectedContact.landline || '532 523 325'}</p>
              </div>
              <button className="action-button">
                <Edit2 size={18} />
                Edit
              </button>
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
                {patients.map(patient => (
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
        ) : (
          <div className="no-contact-selected">
            <p>Select a contact to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;