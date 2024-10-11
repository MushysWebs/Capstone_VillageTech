import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import PatientTabs from "../../../components/patientSidebar/PatientTabs";
import PatientSidebar from "../../../components/patientSidebar/PatientSidebar";
import { usePatient } from "../../../context/PatientContext";
import { Edit2, Save } from "lucide-react";
import "./HealthStatus.css";

const HealthStatus = () => {
  const { selectedPatient } = usePatient();
  const [error, setError] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [healthNotes, setHealthNotes] = useState("");
  const [alerts, setAlerts] = useState("");
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData();
      setHealthNotes(selectedPatient.notes || "");
    }
  }, [selectedPatient]);

  const fetchPatientData = async () => {
    try {
      const { data: vaccinations, error: vaccinationError } = await supabase
        .from("medications")
        .select("*")
        .eq("patient_id", selectedPatient.id)
        .eq("type", "Vaccine");

      if (vaccinationError) throw vaccinationError;
      setVaccinations(vaccinations);
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
      const { error } = await supabase
        .from("patients")
        .update({ notes: healthNotes })
        .eq("id", selectedPatient.id);

      if (error) throw error;
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
    <div className="health-main">
      <PatientSidebar />

      <div className="health-status-page">
        <header className="patient-header">
          <PatientTabs />
        </header>

        <div className="section-box">
          <h2 className="section-header">Patient Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Name</div>
              <div className="info-value">{selectedPatient?.name}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Breed</div>
              <div className="info-value">{selectedPatient?.breed}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Patient ID</div>
              <div className="info-value">{selectedPatient?.id}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Gender</div>
              <div className="info-value">{selectedPatient?.gender}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Color</div>
              <div className="info-value">{selectedPatient?.color}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Weight</div>
              <div className="info-value">{selectedPatient?.weight} kg</div>
            </div>
          </div>
        </div>

        <div className="section-box">
          <h2 className="section-header">Health Notes and Alerts</h2>
          <div className="health-notes-grid">
            <div>
              <h3>Health Notes</h3>
              <textarea
                className="health-textarea"
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder="Enter health notes..."
                disabled={!isEditing}
              />
            </div>
            <div>
              <h3>Alerts</h3>
              <textarea
                className="health-textarea"
                value={alerts}
                onChange={(e) => setAlerts(e.target.value)}
                placeholder="Enter alerts..."
                disabled={!isEditing}
              />
            </div>
          </div>
          {isEditing ? (
            <button className="action-button" onClick={handleSave}>
              <Save size={18} />
              Save
            </button>
          ) : (
            <button className="action-button" onClick={handleEdit}>
              <Edit2 size={18} />
              Edit
            </button>
          )}
        </div>

        <div className="section-box">
          <h2 className="section-header">Vaccinations</h2>
          <div className="vaccination-grid">
            {vaccinations.length > 0 ? (
              vaccinations.map((vaccination) => (
                <div key={vaccination.id} className="vaccination-item">
                  <div className="vaccination-name">{vaccination.name}</div>
                  <div className="vaccination-date">
                    Date: {formatDate(vaccination.date_prescribed)}
                  </div>
                  <div className="vaccination-next-due">
                    Next Due: {formatDate(vaccination.next_due)}
                  </div>
                </div>
              ))
            ) : (
              <div className="vaccination-item">No vaccinations available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatus;
