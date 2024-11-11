import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import PatientTabs from "../../../components/PatientTabs";
import PatientSidebar from "../../../components/patientSidebar/PatientSidebar";
import { usePatient } from "../../../context/PatientContext";
import { Edit2, Save, Activity, AlertCircle } from "lucide-react";
import AddVitalModal from "../../../components/addVitalModal/AddVitalModal";
import AddAllergyModal from "../../../components/addAllergyModal/AddAllergyModal";
import "./HealthStatus.css";

const HealthStatus = () => {
  const { selectedPatient } = usePatient();
  const [error, setError] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [healthNotes, setHealthNotes] = useState("");
  const [alerts, setAlerts] = useState("");
  const [isVitalModalOpen, setVitalModalOpen] = useState(false);
  const [isAllergyModalOpen, setAllergyModalOpen] = useState(false);
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (selectedPatient) {
      fetchHealthStatusData();
      setHealthNotes(selectedPatient.notes || "");
    }
  }, [selectedPatient]);

  const fetchHealthStatusData = async () => {
    try {
      const [vitalData, allergyData] = await Promise.all([
        supabase
          .from("patient_vitals")
          .select("*")
          .eq("patient_id", selectedPatient?.id || 0),
        supabase
          .from("patient_allergies")
          .select("*")
          .eq("patient_id", selectedPatient?.id || 0),
      ]);

      if (vitalData.error || allergyData.error) {
        throw new Error("Error fetching health status data");
      }

      setVitals(vitalData.data || []);
      setAllergies(allergyData.data || []);
    } catch (error) {
      console.error("Error fetching health status data:", error);
      setError("Failed to fetch health status data.");
    }
  };

  const handleAddVital = async (newVital) => {
    try {
      const { data, error } = await supabase
        .from("patient_vitals")
        .insert([{ patient_id: selectedPatient.id, ...newVital }]);

      if (error) throw error;

      if (data && data.length > 0) {
        setVitals((prev) => [...prev, { ...newVital, id: data[0].id }]);
      } else {
        await fetchHealthStatusData(); 
      }
      setVitalModalOpen(false);
    } catch (error) {
      console.error("Error adding vital:", error);
    }
  };

  const handleAddAllergy = async (newAllergy) => {
    try {
      const { data, error } = await supabase
        .from("patient_allergies")
        .insert([{ patient_id: selectedPatient.id, ...newAllergy }]);

      if (error) throw error;

      if (data && data.length > 0) {
        setAllergies((prev) => [...prev, { ...newAllergy, id: data[0].id }]);
      } else {
        await fetchHealthStatusData(); 
      }
      setAllergyModalOpen(false);
    } catch (error) {
      console.error("Error adding allergy:", error);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleSave = async () => {
    try {
      if (selectedPatient) {
        const { error } = await supabase
          .from("patients")
          .update({ notes: healthNotes })
          .eq("id", selectedPatient.id);

        if (error) throw error;
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving health notes:", error);
      setError("Failed to save health notes.");
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

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
              <div className="health-status-info-value">
                {selectedPatient?.name || ""}
              </div>
            </div>
            <div className="health-status-info-item">
              <div className="health-status-info-label">Breed</div>
              <div className="health-status-info-value">
                {selectedPatient?.breed || ""}
              </div>
            </div>
            <div className="health-status-info-item">
              <div className="health-status-info-label">Patient ID</div>
              <div className="health-status-info-value">
                {selectedPatient?.id || ""}
              </div>
            </div>
            <div className="health-status-info-item">
              <div className="health-status-info-label">Gender</div>
              <div className="health-status-info-value">
                {selectedPatient?.gender || ""}
              </div>
            </div>
            <div className="health-status-info-item">
              <div className="health-status-info-label">Color</div>
              <div className="health-status-info-value">
                {selectedPatient?.color || ""}
              </div>
            </div>
            <div className="health-status-info-item">
              <div className="health-status-info-label">Weight</div>
              <div className="health-status-info-value">
                {selectedPatient?.weight || ""} kg
              </div>
            </div>
          </div>
        </div>

        <div className="health-status-section-box">
          <h2 className="health-status-section-header">
            Health Notes and Alerts
          </h2>
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
            <button
              className="health-status-action-button"
              onClick={handleSave}
            >
              <Save size={18} />
              Save
            </button>
          ) : (
            <button
              className="health-status-action-button"
              onClick={handleEdit}
            >
              <Edit2 size={18} />
              Edit
            </button>
          )}
        </div>

        <div className="health-status-section-box">
          <h2 className="health-status-section-header">
            <Activity size={24} style={{ marginRight: "10px" }} />
            Vitals
          </h2>
          <button
            className="health-status-action-button"
            onClick={() => setVitalModalOpen(true)}
          >
            Add Vital
          </button>
          <table className="health-status-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Temperature</th>
                <th>Heart Rate</th>
              </tr>
            </thead>
            <tbody>
              {vitals.length > 0 ? (
                vitals.map((vital) => (
                  <tr key={vital.id}>
                    <td>{formatDate(vital.date)}</td>
                    <td>{`${vital.weight} lb`}</td>
                    <td>{`${vital.temperature} °F`}</td>
                    <td>{`${vital.heart_rate} BPM`}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="health-status-no-data">
                    No vitals available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="health-status-section-box">
          <h2 className="health-status-section-header">
            <AlertCircle size={24} style={{ marginRight: "10px" }} />
            Allergies
          </h2>
          <button
            className="health-status-action-button"
            onClick={() => setAllergyModalOpen(true)}
          >
            Add Allergy
          </button>
          <table className="health-status-table">
            <thead>
              <tr>
                <th>Allergy</th>
                <th>Reaction</th>
              </tr>
            </thead>
            <tbody>
              {allergies.length > 0 ? (
                allergies.map((allergy) => (
                  <tr key={allergy.id}>
                    <td>{allergy.name}</td>
                    <td>{allergy.reaction}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="health-status-no-data">
                    No allergies available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddVitalModal
        isOpen={isVitalModalOpen}
        onClose={() => setVitalModalOpen(false)}
        onAddVital={handleAddVital}
      />
      <AddAllergyModal
        isOpen={isAllergyModalOpen}
        onClose={() => setAllergyModalOpen(false)}
        onAddAllergy={handleAddAllergy}
      />
    </div>
  );
};

export default HealthStatus;
