import React, { useState, useEffect } from "react";
import { usePatient } from "../../../context/PatientContext";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Edit2, X, Save, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import "./PatientMain.css";
import AddAppointment from "../../dashboard/calendarView/AddAppointment";

const PatientMain = ({ globalSearchTerm }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const { selectedPatient, setSelectedPatient } = usePatient();
  const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] =
    useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState(null);
  const [owner, setOwner] = useState(null); // New state to store owner information
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();

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

  // New useEffect to fetch owner when selectedPatient changes
  useEffect(() => {
    if (selectedPatient?.owner_id) {
      fetchOwner(selectedPatient.owner_id); // Fetch owner only if a patient is selected
    }
  }, [selectedPatient]); // This useEffect only runs when selectedPatient changes

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
      console.log("Fetching owner with ID:", ownerId); // Log owner_id for debugging

      const { data: ownerData, error } = await supabase
        .from("owners")
        .select("*")
        .eq("id", ownerId)
        .single();

      if (error) {
        throw error;
      }

      console.log("Fetched owner data:", ownerData); // Log the fetched owner data

      setOwner(ownerData); // Store owner data in state
    } catch (error) {
      console.error("Error fetching owner:", error);
      setError("Failed to fetch owner data");
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
        })
        .eq("id", editedPatient.id)
        .select()
        .single();

      if (error) throw error;

      setPatients((prevPatients) =>
        prevPatients.map((patient) => (patient.id === data.id ? data : patient))
      );

      setSelectedPatient(data);

      setIsEditing(false);
      setEditedPatient(null);
      setError(null);
    } catch (error) {
      console.error("Error updating patient:", error);
      setError("Failed to update patient: " + error.message);
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
    <div className="patientMain-page">
      <header className="patientMain-tabs-header">
        <div className="patientMain-tabs">
          <Link to="/patient/clinical" className="tab-button">
            Clinical
          </Link>
          <Link to="/SOC" className="tab-button">
            S.O.C.
          </Link>
          <Link to="/Financial" className="tab-button">
            Financial
          </Link>
          <Link to="/summaries" className="tab-button">
            Summaries
          </Link>
          <Link to="/healthStatus" className="tab-button">
            Health Status
          </Link>
          <Link to="/medication" className="tab-button">
            Medication
          </Link>
          <Link to="/newPatient" className="tab-button">
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
                setSelectedPatient(patient); // Update context's selectedPatient
                fetchOwner(patient.owner_id); // Fetch owner based on patient selection
                console.log("Selected Patient in PatientMain:", patient);
              }}
            >
              <img
                src={patient.image_url || "/api/placeholder/80/80"}
                alt={patient.name}
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
                <img
                  src={selectedPatient.image_url || "/api/placeholder/80/80"}
                  alt={selectedPatient.name}
                  className="patientMain-avatar-large"
                />
                <div className="patientMain-header-info">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="name"
                        value={editedPatient.name || ""}
                        onChange={handleInputChange}
                      />
                      <p>
                        <span>Owner:</span>
                        <input
                          type="text"
                          name="owner"
                          value={owner?.name || ""}
                          readOnly // Owner name is not editable
                        />
                      </p>
                      <p>
                        <span>Species:</span>
                        <input
                          type="text"
                          name="species"
                          value={editedPatient.species || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Breed:</span>
                        <input
                          type="text"
                          name="breed"
                          value={editedPatient.breed || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Age:</span>
                        <input
                          type="number"
                          name="age"
                          value={editedPatient.age || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Weight (kg):</span>
                        <input
                          type="number"
                          name="weight"
                          value={editedPatient.weight || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <span>Gender:</span>
                        <select
                          name="gender"
                          value={editedPatient.gender || ""}
                          onChange={handleInputChange}
                        >
                          <option value="Male/Neutered">Male/Neutered</option>
                          <option value="Male/Unneutered">
                            Male/Unneutered
                          </option>
                          <option value="Female/Spayed">Female/Spayed</option>
                          <option value="Female/Unspayed">
                            Female/Unspayed
                          </option>
                        </select>
                      </p>
                    </>
                  ) : (
                    <>
                      <h2>{selectedPatient.name}</h2>
                      <p>
                        <strong>Owner:</strong>{" "}
                        {owner
                          ? `${owner.first_name} ${owner.last_name}`
                          : "N/A"}
                      </p>
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
                        <strong>Weight:</strong> {selectedPatient.weight} Kg
                      </p>
                      <p>
                        <strong>Gender:</strong> {selectedPatient.gender}
                      </p>
                      <p>
                        <strong>Date of Birth:</strong>{" "}
                        {formatDate(selectedPatient.date_of_birth)}
                      </p>
                    </>
                  )}
                </div>
                <div className="patientMain-action-buttons">
                  <button
                    className="action-button add-appointment-button"
                    onClick={handleAddAppointment}
                  >
                    <Calendar size={18} />
                    Add Appointment
                  </button>
                  {!isEditing && (
                    <button
                      className="action-button edit-button"
                      onClick={handleEdit}
                    >
                      <Edit2 size={18} />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="patientMain-edit-actions">
                  <button
                    className="action-button cancel-button"
                    onClick={handleCancel}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    className="action-button save-button"
                    onClick={handleSave}
                  >
                    <Save size={18} />
                    Save
                  </button>
                </div>
              )}

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
              </div>
            </div>
          )}
        </div>
      </div>
      {isAddAppointmentModalOpen && selectedPatient && (
        <AddAppointment
          onClose={handleCloseAppointmentModal}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          ownerId={selectedPatient.owner_id}
          onAppointmentAdded={(newAppointment) => {
            setIsAddAppointmentModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default PatientMain;
