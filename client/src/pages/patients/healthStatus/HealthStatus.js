import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import PatientTabs from "../../../components/PatientTabs";
import PatientSidebar from "../../../components/patientSidebar/PatientSidebar";
import { usePatient } from "../../../context/PatientContext";
import { Edit2, Save } from "lucide-react";
import VaccineModal from "./VaccineModal"; 
import "./HealthStatus.css";

const HealthStatus = () => {
  const { selectedPatient } = usePatient();
  const [error, setError] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [healthNotes, setHealthNotes] = useState("");
  const [alerts, setAlerts] = useState("");
  const [showModal, setShowModal] = useState(false); 
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchPatientData();
    if (selectedPatient) {
      setHealthNotes(selectedPatient.notes || "");
    }
  }, [selectedPatient]);

  const fetchPatientData = async () => {
    try {
      const { data: vaccinations, error: vaccinationError } = await supabase
        .from("vaccinations")
        .select("*")
        .eq("patient_id", selectedPatient?.id || 0); 

      if (vaccinationError) throw vaccinationError;
      setVaccinations(vaccinations || []);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setError("An error occurred while fetching patient data.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (selectedPatient) {
        const { error } = await supabase
          .from("patients")
          .update({ notes: healthNotes })
          .eq("id", selectedPatient.id);

        if (error) throw error;
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving health notes:", error);
      setError("Failed to save health notes.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="health-status-main">
      <PatientSidebar />

      <div className="health-status-content">
        <header className="health-status-header">
          <PatientTabs />
        </header>

        <div className="health-status-section-box">
          <h2 className="health-status-section-header">Patient Information</h2>
          <div className="health-status-info-grid">
            <div className="health-status-info-item">
              <div className="health-status-info-label">Name</div>
              <div className="health-status-info-value">{selectedPatient?.name || ""}</div>
            </div>
            <div className="health-status-info-item">
              <div className="health-status-info-label">Breed</div>
              <div className="health-status-info-value">{selectedPatient?.breed || ""}</div>
            </div>
            <div className="health-status-info-item">
              <div className="health-status-info-label">Patient ID</div>
              <div className="health-status-info-value">{selectedPatient?.id || ""}</div>
            </div>
            <div className="health-status-info-item">
              <div className="health-status-info-label">Gender</div>
              <div className="health-status-info-value">{selectedPatient?.gender || ""}</div>
            </div>
            <div className="health-status-info-item">
              <div className="health-status-info-label">Color</div>
              <div className="health-status-info-value">{selectedPatient?.color || ""}</div>
            </div>
            <div className="health-status-info-item">
              <div className="health-status-info-label">Weight</div>
              <div className="health-status-info-value">{selectedPatient?.weight || ""} kg</div>
            </div>
          </div>
        </div>

        <div className="health-status-section-box">
          <h2 className="health-status-section-header">Health Notes and Alerts</h2>
          <div className="health-status-notes-grid">
            <div>
              <h3>Health Notes</h3>
              <textarea
                className="health-status-textarea"
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder="Enter health notes..."
                disabled={!isEditing}
              />
            </div>
            <div>
              <h3>Alerts</h3>
              <textarea
                className="health-status-textarea"
                value={alerts}
                onChange={(e) => setAlerts(e.target.value)}
                placeholder="Enter alerts..."
                disabled={!isEditing}
              />
            </div>
          </div>
          {isEditing ? (
            <button className="health-status-action-button" onClick={handleSave}>
              <Save size={18} />
              Save
            </button>
          ) : (
            <button className="health-status-action-button" onClick={handleEdit}>
              <Edit2 size={18} />
              Edit
            </button>
          )}
        </div>

        <div className="health-status-section-box">
          <div className="health-status-vaccination-header-container">
            <div className="health-status-header-with-border">
              <button className="health-status-add-vaccine-button" onClick={() => setShowModal(true)}>
                +
              </button>
              <h2 className="health-status-section-header">Vaccinations</h2>
            </div>
          </div>
          <div className="health-status-table-container">
            <table className="health-status-vaccinations-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date Given</th>
                  <th>Next Due</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Doctor</th>
                </tr>
              </thead>
              <tbody>
                {vaccinations.length > 0 ? (
                  vaccinations.map((vaccination) => (
                    <tr key={vaccination.id}>
                      <td>{vaccination.name}</td>
                      <td>{formatDate(vaccination.date_given)}</td>
                      <td>{formatDate(vaccination.next_due)}</td>
                      <td>{vaccination.dosage}</td>
                      <td>{vaccination.frequency}</td>
                      <td>{vaccination.doctor}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="health-status-no-vaccinations">No vaccinations available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <VaccineModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        patientId={selectedPatient?.id || null}
        onAddVaccine={fetchPatientData}
      />
    </div>
  );
};

export default HealthStatus;
