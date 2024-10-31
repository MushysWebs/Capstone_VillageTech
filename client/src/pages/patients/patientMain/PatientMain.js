import React, { useState, useEffect, useRef } from "react";
import { usePatient } from "../../../context/PatientContext";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Edit2, X, Save, Calendar, Camera, Trash2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "./PatientMain.css";
import AddAppointment from "../../dashboard/calendarView/AddAppointment";

const PatientMain = ({ globalSearchTerm }) => {
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const { selectedPatient, setSelectedPatient } = usePatient();
  const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] =
    useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState(null);
  const [owner, setOwner] = useState(null);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);
  const supabase = useSupabaseClient();
  const defaultProfilePicUrl = supabase
  .storage
  .from('contacts')
  .getPublicUrl('profile_pictures/defaultPPic.png').data.publicUrl;
  
  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        (patient.name?.toLowerCase() || "").includes(
          (globalSearchTerm || "").toLowerCase()
        ) ||
        (patient.breed?.toLowerCase() || "").includes(
          (globalSearchTerm || "").toLowerCase()
        )
    );
    setFilteredPatients(filtered);
  }, [globalSearchTerm, patients]);

  useEffect(() => {
    if (selectedPatient?.owner_id) {
      fetchOwner(selectedPatient.owner_id);
    }
  }, [selectedPatient]);

  const handleAddAppointment = () => {
    setIsAddAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAddAppointmentModalOpen(false);
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("id");
      if (error) throw error;
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to fetch patients");
    }
  };

  const fetchOwner = async (ownerId) => {
    try {
      console.log("Fetching owner with ID:", ownerId);

      const { data: ownerData, error } = await supabase
        .from("owners")
        .select("*")
        .eq("id", ownerId)
        .single();

      if (error) {
        throw error;
      }

      console.log("Fetched owner data:", ownerData);

      setOwner(ownerData);
    } catch (error) {
      console.error("Error fetching owner:", error);
      setError("Failed to fetch owner data");
    }
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
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `patient/patient_pictures/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('patient')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('patient')
          .getPublicUrl(filePath);

        if (urlError) throw urlError;

        setProfilePicture(publicUrl);
        setEditedPatient(prev => ({ ...prev, image_url: publicUrl }));
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Failed to upload profile picture. Please try again.');
      }
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
        throw new Error("No patient selected for editing");
      }

      const { data, error } = await supabase
        .from("patients")
        .update({
          ...editedPatient,
          image_url: profilePicture || editedPatient.image_url
        })
        .eq("id", editedPatient.id)
        .select()
        .single();

      if (error) throw error;

      setPatients(prevPatients =>
        prevPatients.map(patient =>
          patient.id === data.id ? data : patient
        )
      );

      setSelectedPatient(data);
      setIsEditing(false);
      setEditedPatient(null);
      setProfilePicture(null);
      setError(null);
    } catch (error) {
      console.error("Error updating patient:", error);
      setError("Failed to update patient: " + error.message);
    }
  };

  const handleDeletePatient = async () => {
    if (window.confirm('Are you sure you want to delete this patient? This will also delete all their appointments and clinical records. This action cannot be undone.')) {
      try {
        // delete all appointments associated with this patient
        const { error: appointmentsError } = await supabase
          .from("appointments")
          .delete()
          .eq("patient_id", selectedPatient.id);
  
        if (appointmentsError) throw appointmentsError;
  
        // delete all clinical records associated with this patient
        const { error: clinicalRecordsError } = await supabase
          .from("clinical_records")
          .delete()
          .eq("patient_id", selectedPatient.id);
  
        if (clinicalRecordsError) throw clinicalRecordsError;
  
        // then delete the patient
        const { error: patientError } = await supabase
          .from("patients")
          .delete()
          .eq("id", selectedPatient.id);
  
        if (patientError) throw patientError;
  
        setPatients(patients.filter(patient => patient.id !== selectedPatient.id));
        setSelectedPatient(null);
      } catch (error) {
        console.error("Error deleting patient:", error);
        setError("Failed to delete patient: " + error.message);
      }
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div className="patient-main">
      <header className="patient-header">
        <div className="patientMain-tabs">
          <Link
            to="/clinical"
            className={`tab-button ${
              location.pathname === "/clinical" ? "active" : ""
            }`}
          >
            Clinical
          </Link>
          <Link
            to="/SOC"
            className={`tab-button ${
              location.pathname === "/SOC" ? "active" : ""
            }`}
          >
            S.O.C.
          </Link>
          <Link
            to="/Financial"
            className={`tab-button ${
              location.pathname === "/Financial" ? "active" : ""
            }`}
          >
            Financial
          </Link>
          <Link
            to="/summaries"
            className={`tab-button ${
              location.pathname === "/summaries" ? "active" : ""
            }`}
          >
            Summaries
          </Link>
          <Link
            to="/healthStatus"
            className={`tab-button ${
              location.pathname === "/healthStatus" ? "active" : ""
            }`}
          >
            Health Status
          </Link>
          <Link
            to="/medication"
            className={`tab-button ${
              location.pathname === "/medication" ? "active" : ""
            }`}
          >
            Medication
          </Link>
          <Link
            to="/newPatient"
            className={`tab-button ${
              location.pathname === "/newPatient" ? "active" : ""
            }`}
          >
            New Patient
          </Link>
        </div>
      </header>

      <div className="patientMain-section">
        <div className="patientMain-list">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className={`patientMain-item ${
                selectedPatient?.id === patient.id ? "active" : ""
              }`}
              onClick={() => {
                setSelectedPatient(patient);
                fetchOwner(patient.owner_id);
                console.log("Selected Patient in PatientMain:", patient);
              }}
            >
              <img
                src={patient.image_url || defaultProfilePicUrl}
                className="patientMain-avatar"
              />
              <span className="patientMain-name">{patient.name}</span>
            </div>
          ))}
        </div>

        <div className="patientMain-main">
          {error && <div className="error-message">{error}</div>}
          {selectedPatient && (
            <div className="patientMain-details">
              <div className="patientMain-details-header">
  <div className="p-profile-picture-container" onClick={handleProfilePictureClick}>
    <img
      src={profilePicture || selectedPatient.image_url || "/api/placeholder/300/300"}
      alt={selectedPatient.name}
      className="patientMain-avatar-large"
    />
    {isEditing && (
      <div className="p-profile-picture-overlay">
        <Camera size={24} />
        <span>Change Photo</span>
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

  <div className="patientMain-header-info">
    {isEditing ? (
      <input
        type="text"
        name="name"
        value={editedPatient.name || ""}
        onChange={handleInputChange}
        className="patient-name-input"
      />
    ) : (
      <h2>{selectedPatient.name}</h2>
    )}
    
    <div className="patient-details-grid">
      <div className="detail-item">
        <strong>Owner:</strong>
        {isEditing ? (
          <input
            type="text"
            name="owner"
            value={owner ? `${owner.first_name} ${owner.last_name}` : ""}
            readOnly
          />
        ) : (
          <span>{owner ? `${owner.first_name} ${owner.last_name}` : "N/A"}</span>
        )}
      </div>

      <div className="detail-item">
        <strong>Species:</strong>
        {isEditing ? (
          <input
            type="text"
            name="species"
            value={editedPatient.species || ""}
            onChange={handleInputChange}
          />
        ) : (
          <span>{selectedPatient.species}</span>
        )}
      </div>

      <div className="detail-item">
        <strong>Breed:</strong>
        {isEditing ? (
          <input
            type="text"
            name="breed"
            value={editedPatient.breed || ""}
            onChange={handleInputChange}
          />
        ) : (
          <span>{selectedPatient.breed}</span>
        )}
      </div>

      <div className="detail-item">
        <strong>Age:</strong>
        {isEditing ? (
          <input
            type="number"
            name="age"
            value={editedPatient.age || ""}
            onChange={handleInputChange}
          />
        ) : (
          <span>{selectedPatient.age} years</span>
        )}
      </div>

      <div className="detail-item">
        <strong>Weight:</strong>
        {isEditing ? (
          <input
            type="number"
            name="weight"
            value={editedPatient.weight || ""}
            onChange={handleInputChange}
          />
        ) : (
          <span>{selectedPatient.weight} Kg</span>
        )}
      </div>

      <div className="detail-item">
        <strong>Gender:</strong>
        {isEditing ? (
          <select
            name="gender"
            value={editedPatient.gender || ""}
            onChange={handleInputChange}
          >
            <option value="Male/Neutered">Male/Neutered</option>
            <option value="Male/Unneutered">Male/Unneutered</option>
            <option value="Female/Spayed">Female/Spayed</option>
            <option value="Female/Unspayed">Female/Unspayed</option>
          </select>
        ) : (
          <span>{selectedPatient.gender}</span>
        )}
      </div>

      <div className="detail-item">
        <strong>Date of Birth:</strong>
        <span>{formatDate(selectedPatient.date_of_birth)}</span>
      </div>
    </div>
  </div>
  <div className="patientMain-action-buttons">
    {isEditing ? (
      <>
        <button className="add-appointment-button" onClick={handleSave}>
          <Save size={18} />
          Save
        </button>
        <button className="patient-cancel-button" onClick={handleCancel}>
          <X size={18} />
          Cancel
        </button>
      </>
    ) : (
      <>
        <button className="add-appointment-button" onClick={handleAddAppointment}>
          <Calendar size={18} />
          Add Appointment
        </button>
        <button className="patient-edit-button" onClick={handleEdit}>
          <Edit2 size={18} />
          Edit
        </button>
      </>
    )}
  </div>
</div>

              <div className="patientMain-info-section">
                <div className="patientMain-additional-info">
                  <h3>Additional Information</h3>
                  {isEditing ? (
                    <>
                      <p>
                        <span>Current Medications:</span>
                        <input
                          type="text"
                          name="current_medications"
                          value={editedPatient.current_medications || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Allergies or Conditions:</span>
                        <input
                          type="text"
                          name="allergies_or_conditions"
                          value={editedPatient.allergies_or_conditions || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Demeanor:</span>
                        <input
                          type="text"
                          name="demeanor"
                          value={editedPatient.demeanor || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Current Medications:</strong>{" "}
                        {selectedPatient.current_medications}
                      </p>
                      <p>
                        <strong>Allergies or Conditions:</strong>{" "}
                        {selectedPatient.allergies_or_conditions}
                      </p>
                      <p>
                        <strong>Demeanor:</strong> {selectedPatient.demeanor}
                      </p>
                    </>
                  )}
                </div>

                <div className="patientMain-clinical-info">
                  <h3>Clinical Details</h3>
                  {isEditing ? (
                    <>
                      <p>
                        <span>Insurance Supplier:</span>
                        <input
                          type="text"
                          name="insurance_supplier"
                          value={editedPatient.insurance_supplier || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Insurance Number:</span>
                        <input
                          type="text"
                          name="insurance_number"
                          value={editedPatient.insurance_number || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Referring Vet/Clinic:</span>
                        <input
                          type="text"
                          name="referring_vet_clinic"
                          value={editedPatient.referring_vet_clinic || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Preferred Doctor:</span>
                        <input
                          type="text"
                          name="preferred_doctor"
                          value={editedPatient.preferred_doctor || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Insurance Supplier:</strong>{" "}
                        {selectedPatient.insurance_supplier}
                      </p>
                      <p>
                        <strong>Insurance Number:</strong>{" "}
                        {selectedPatient.insurance_number}
                      </p>
                      <p>
                        <strong>Referring Vet/Clinic:</strong>{" "}
                        {selectedPatient.referring_vet_clinic}
                      </p>
                      <p>
                        <strong>Preferred Doctor:</strong>{" "}
                        {selectedPatient.preferred_doctor}
                      </p>
                    </>
                  )}
                </div>

                <div className="patientMain-tags">
                  <h3>Tags</h3>
                  {isEditing ? (
                    <>
                      <p>
                        <span>General Tag:</span>
                        <input
                          type="text"
                          name="general_tag"
                          value={editedPatient.general_tag || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Reminder Tag:</span>
                        <input
                          type="text"
                          name="reminder_tag"
                          value={editedPatient.reminder_tag || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>General Tag:</strong>{" "}
                        {selectedPatient.general_tag}
                      </p>
                      <p>
                        <strong>Reminder Tag:</strong>{" "}
                        {selectedPatient.reminder_tag}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="patientMain-notes">
                <h3>Animal Notes</h3>
                {isEditing ? (
                  <textarea
                    name="notes"
                    value={editedPatient?.notes || ""}
                    onChange={handleInputChange}
                    className="notes-textarea"
                  />
                ) : (
                  <p>{selectedPatient.notes || "No notes available"}</p>
                )}
              </div>
              <div className="delete-patient-container">
                <button 
                  className="delete-patient-button" 
                  onClick={handleDeletePatient}
                >
                  <Trash2 size={18} />
                  Delete Patient
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isAddAppointmentModalOpen && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddAppointment
              onClose={handleCloseAppointmentModal}
              patientId={selectedPatient?.id || ""}
              patientName={selectedPatient?.name || ""}
              ownerId={selectedPatient?.owner_id || ""}
              onAppointmentAdded={(newAppointment) => {
                setIsAddAppointmentModalOpen(false);
                // Additional logic here if needed, e.g., refreshing appointment list
              }}
            />
            <button
              onClick={handleCloseAppointmentModal}
              className="SOC-close-modal"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientMain;