import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { usePatient } from "../../../context/PatientContext";
import PatientTabs from "../../../components/patientSidebar/PatientTabs";
import { Search, AlertCircle, Activity, FileText } from "lucide-react";
import PatientSidebar from "../../../components/patientSidebar/PatientSidebar";
import "./Medication.css";

const MedicationHistory = () => {
  const { selectedPatient } = usePatient();
  const supabase = useSupabaseClient();

  const [medications, setMedications] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData();
    }
  }, [selectedPatient]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [medicationData, allergyData, vitalData, noteData] =
        await Promise.all([
          supabase
            .from("medications")
            .select("*")
            .eq("patient_id", selectedPatient.id),
          supabase
            .from("patient_allergies")
            .select("*")
            .eq("patient_id", selectedPatient.id),
          supabase
            .from("patient_vitals")
            .select("*")
            .eq("patient_id", selectedPatient.id),
          supabase
            .from("patient_notes")
            .select("*")
            .eq("patient_id", selectedPatient.id),
        ]);

      setMedications(medicationData.data || []);
      setAllergies(allergyData.data || []);
      setVitals(vitalData.data || []);
      setNotes(noteData.data || []);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedications = medications.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTable = (data, columns) => (
    <table className="medication-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={col.key}>{item[col.key]}</td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="no-data-message">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="medication-main">
      <PatientSidebar />

      <div className="medication-page">
        <header className="medication-patient-header">
          <PatientTabs />
        </header>

        <div className="medication-section-box">
          <h2 className="medication-section-header">
            <Search size={24} style={{ marginRight: "10px" }} />
            Medication History
          </h2>
          <input
            type="text"
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-medication"
          />
          {loading ? (
            <p className="loading-message">Loading medications...</p>
          ) : (
            renderTable(filteredMedications, [
              { key: "name", label: "Name" },
              { key: "dosage", label: "Dosage" },
              { key: "frequency", label: "Frequency" },
              { key: "date_prescribed", label: "Date Prescribed" },
              { key: "end_date", label: "End Date" },
              { key: "reason", label: "Reason" },
              { key: "doctor", label: "Prescribing Doctor" },
              { key: "instructions", label: "Instructions" },
              { key: "refills", label: "Refills" },
              { key: "status", label: "Status" },
            ])
          )}
        </div>

        <div className="medication-section-box">
          <h2 className="medication-section-header">
            <AlertCircle size={24} style={{ marginRight: "10px" }} />
            Allergies
          </h2>
          {loading ? (
            <p className="loading-message">Loading allergies...</p>
          ) : (
            renderTable(allergies, [
              { key: "name", label: "Allergy" },
              { key: "reaction", label: "Reaction" },
            ])
          )}
        </div>

        <div className="medication-section-box">
          <h2 className="medication-section-header">
            <Activity size={24} style={{ marginRight: "10px" }} />
            Vitals
          </h2>
          {loading ? (
            <p className="loading-message">Loading vitals...</p>
          ) : (
            renderTable(vitals, [
              { key: "date", label: "Date" },
              { key: "weight", label: "Weight" },
              { key: "temperature", label: "Temperature" },
              { key: "heart_rate", label: "Heart Rate" },
            ])
          )}
        </div>

        <div className="medication-section-box">
          <h2 className="medication-section-header">
            <FileText size={24} style={{ marginRight: "10px" }} />
            Notes
          </h2>
          {loading ? (
            <p className="loading-message">Loading notes...</p>
          ) : (
            renderTable(notes, [
              { key: "date", label: "Date" },
              { key: "note", label: "Note" },
            ])
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicationHistory;
