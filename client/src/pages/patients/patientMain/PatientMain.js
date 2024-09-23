import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Edit2, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PatientMain.css';

const PatientMain = ({ globalSearchTerm }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState(null);
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      (patient.name?.toLowerCase() || '').includes((globalSearchTerm || '').toLowerCase()) ||
      (patient.breed?.toLowerCase() || '').includes((globalSearchTerm || '').toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [globalSearchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase.from('patients').select('*').order('id');
      if (error) throw error;
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to fetch patients');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedPatient({ ...selectedPatient });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedPatient(null);
  };

  const handleSave = async () => {
    try {
      if (!editedPatient || !editedPatient.id) {
        throw new Error('No patient selected for editing');
      }

      const { data, error } = await supabase
        .from('patients')
        .update({
          ...editedPatient,
        })
        .eq('id', editedPatient.id)
        .select()
        .single();

      if (error) throw error;

      setPatients(prevPatients =>
        prevPatients.map(patient => (patient.id === data.id ? data : patient))
      );

      setSelectedPatient(data);

      setIsEditing(false);
      setEditedPatient(null);
      setError(null);
    } catch (error) {
      console.error('Error updating patient:', error);
      setError('Failed to update patient: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className="patientMain-page">
      {/* Patient Tabs Navigation */}
      <header className="patientMain-tabs-header">
        <div className="patientMain-tabs">
          <Link to="/patient/clinical" className="tab-button">Clinical</Link>
          <Link to="/patient/soc" className="tab-button">S.O.C.</Link>
          <Link to="/Financial" className="tab-button">Financial</Link>
          <Link to="/patient/summaries" className="tab-button">Summaries</Link>
          <Link to="/healthStatus" className="tab-button">Health Status</Link>
          <Link to="/patient/medication" className="tab-button">Medication</Link>
          <Link to="/newPatient" className="tab-button">New Patient</Link>
        </div>
      </header>

      <div className="patientMain-section">
        {/* Patients List */}
        <div className="patientMain-list">
          {filteredPatients.map(patient => (
            <div
              key={patient.id}
              className={`patientMain-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
              onClick={() => setSelectedPatient(patient)}
            >
              <img
                src={patient.image_url || `/api/placeholder/80/80`}
                alt={patient.name}
                className="patientMain-avatar"
              />
              <span className="patientMain-name">{patient.name}</span>
            </div>
          ))}
        </div>

        {/* Patient Details */}
        <div className="patientMain-main">
          {error && <div className="error-message">{error}</div>}
          {selectedPatient && (
            <div className="patientMain-details">
              <div className="patientMain-details-header">
                <img
                  src={selectedPatient.image_url || `/api/placeholder/80/80`}
                  alt={selectedPatient.name}
                  className="patientMain-avatar-large"
                />
                <div className="patientMain-header-info">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="name"
                        value={editedPatient.name || ''}
                        onChange={handleInputChange}
                      />
                      <p>
                        <span>Species:</span>
                        <input
                          type="text"
                          name="species"
                          value={editedPatient.species || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Breed:</span>
                        <input
                          type="text"
                          name="breed"
                          value={editedPatient.breed || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Age:</span>
                        <input
                          type="number"
                          name="age"
                          value={editedPatient.age || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Weight:</span>
                        <input
                          type="number"
                          name="weight"
                          value={editedPatient.weight || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                    </>
                  ) : (
                    <>
                      <h2>{selectedPatient.name}</h2>
                      <p>
                        <strong>Species:</strong> {selectedPatient.species}
                      </p>
                      <p>
                        <strong>Breed:</strong> {selectedPatient.breed}
                      </p>
                      <p>
                        <strong>Age:</strong> {selectedPatient.age} years
                      </p>
                      <p>
                        <strong>Weight:</strong> {selectedPatient.weight} lbs
                      </p>
                      <p>
                        <strong>Date of Birth:</strong> {formatDate(selectedPatient.date_of_birth)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="patientMain-info-section">
                {/* Additional Information */}
                <div className="patientMain-additional-info">
                  <h3>Additional Information</h3>
                  {isEditing ? (
                    <>
                      <p>
                        <span>Current Medications:</span>
                        <input
                          type="text"
                          name="current_medications"
                          value={editedPatient.current_medications || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Allergies or Conditions:</span>
                        <input
                          type="text"
                          name="allergies_or_conditions"
                          value={editedPatient.allergies_or_conditions || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Spay/Neuter Status:</span>
                        <input
                          type="text"
                          name="spay_neuter_status"
                          value={editedPatient.spay_neuter_status || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                    </>
                  ) : (
                    <>
                      <p><strong>Current Medications:</strong> {selectedPatient.current_medications}</p>
                      <p><strong>Allergies or Conditions:</strong> {selectedPatient.allergies_or_conditions}</p>
                      <p><strong>Spay/Neuter Status:</strong> {selectedPatient.spay_neuter_status}</p>
                    </>
                  )}
                </div>

                {/* Clinical Details */}
                <div className="patientMain-clinical-info">
                  <h3>Clinical Details</h3>
                  {isEditing ? (
                    <>
                      <p>
                        <span>Insurance Supplier:</span>
                        <input
                          type="text"
                          name="insurance_supplier"
                          value={editedPatient.insurance_supplier || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Insurance Number:</span>
                        <input
                          type="text"
                          name="insurance_number"
                          value={editedPatient.insurance_number || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Referring Vet/Clinic:</span>
                        <input
                          type="text"
                          name="referring_vet_clinic"
                          value={editedPatient.referring_vet_clinic || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Preferred Doctor:</span>
                        <input
                          type="text"
                          name="preferred_doctor"
                          value={editedPatient.preferred_doctor || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                    </>
                  ) : (
                    <>
                      <p><strong>Insurance Supplier:</strong> {selectedPatient.insurance_supplier}</p>
                      <p><strong>Insurance Number:</strong> {selectedPatient.insurance_number}</p>
                      <p><strong>Referring Vet/Clinic:</strong> {selectedPatient.referring_vet_clinic}</p>
                      <p><strong>Preferred Doctor:</strong> {selectedPatient.preferred_doctor}</p>
                    </>
                  )}
                </div>



                {/* Tags */}
                <div className="patientMain-tags">
                  <h3>Tags</h3>
                  {isEditing ? (
                    <>
                      <p>
                        <span>General Tag:</span>
                        <input
                          type="text"
                          name="general_tag"
                          value={editedPatient.general_tag || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Reminder Tag:</span>
                        <input
                          type="text"
                          name="reminder_tag"
                          value={editedPatient.reminder_tag || ''}
                          onChange={handleInputChange}
                        />
                      </p>
                    </>
                  ) : (
                    <>
                      <p><strong>General Tag:</strong> {selectedPatient.general_tag}</p>
                      <p><strong>Reminder Tag:</strong> {selectedPatient.reminder_tag}</p>
                    </>
                  )}
                </div>
                {/* Animal Notes */}
                <div className="patientMain-notes">
                  <h3>Animal Notes</h3>
                  {isEditing ? (
                    <textarea
                      name="notes"
                      value={editedPatient?.notes || ''}
                      onChange={handleInputChange}
                      className="notes-textarea"
                    />
                  ) : (
                    <p>{selectedPatient.notes || 'No notes available'}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMain;
