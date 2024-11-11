import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { usePatient } from "../../../context/PatientContext";
import PatientTabs from "../../../components/PatientTabs";
import { Search, FileText } from "lucide-react";
import PatientSidebar from "../../../components/patientSidebar/PatientSidebar";
import AddMedicationModal from "../../../components/addMedicationModal/AddMedicationModal";
import AddNoteModal from "../../../components/addNoteModal/AddNoteModal";
import VaccineModal from "./VaccineModal";
import "./Medication.css";

const MedicationHistory = () => {
  const { selectedPatient } = usePatient();
  const supabase = useSupabaseClient();

  const [medications, setMedications] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMedicationModalOpen, setMedicationModalOpen] = useState(false);
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);
  const [isVaccineModalOpen, setVaccineModalOpen] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData();
    }
  }, [selectedPatient]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [medData, vaccineData, noteData] = await Promise.all([
        supabase
          .from("medications")
          .select("*")
          .eq("patient_id", selectedPatient.id),
        supabase
          .from("vaccinations")
          .select("*")
          .eq("patient_id", selectedPatient.id),
        supabase
          .from("patient_notes")
          .select("*")
          .eq("patient_id", selectedPatient.id),
      ]);

      if (medData.error || vaccineData.error || noteData.error) {
        throw new Error("Error fetching patient data");
      }

      setMedications(medData.data || []);
      setVaccines(vaccineData.data || []);
      setNotes(noteData.data || []);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async (newMedication) => {
    try {
      const { data, error } = await supabase
        .from("medications")
        .insert([
          {
            patient_id: selectedPatient.id,
            type: "Medication",
            ...newMedication,
          },
        ]);

      if (error) throw error;

      if (data && data.length > 0) {
        setMedications((prev) => [
          ...prev,
          { ...newMedication, id: data[0].id },
        ]);
      } else {
        await fetchPatientData(); // Fallback to re-fetching
      }
      setMedicationModalOpen(false);
    } catch (error) {
      console.error("Error adding medication:", error);
    }
  };

  const handleAddVaccine = async (newVaccine) => {
    try {
      const { data, error } = await supabase
        .from("vaccinations")
        .insert([{ patient_id: selectedPatient.id, ...newVaccine }])
        .select("*"); // Ensure Supabase returns the inserted row

      if (error) throw error;

      if (data && data.length > 0) {
        setVaccines((prev) => [...prev, data[0]]); // Update state with the new vaccine
      } else {
        await fetchPatientData(); // Fallback to fetching all data
      }
      setVaccineModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error adding vaccine:", error);
    }
  };

  const handleAddNote = async (newNote) => {
    try {
      const { data, error } = await supabase
        .from("patient_notes")
        .insert([{ patient_id: selectedPatient.id, ...newNote }]);

      if (error) throw error;

      if (data && data.length > 0) {
        setNotes((prev) => [...prev, { ...newNote, id: data[0].id }]);
      } else {
        await fetchPatientData(); // Fallback to re-fetching
      }
      setNoteModalOpen(false);
    } catch (error) {
      console.error("Error adding note:", error);
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
          <button
            className="medication-buttons"
            onClick={() => setMedicationModalOpen(true)}
          >
            Add Medication
          </button>
          {loading ? (
            <p className="loading-message">Loading medications...</p>
          ) : (
            renderTable(filteredMedications, [
              { key: "name", label: "Medication" },
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
          <h2 className="medication-section-header">Vaccines</h2>
          <button
            className="medication-buttons"
            onClick={() => setVaccineModalOpen(true)}
          >
            Add Vaccine
          </button>
          {loading ? (
            <p className="loading-message">Loading vaccines...</p>
          ) : (
            renderTable(vaccines, [
              { key: "name", label: "Name" },
              { key: "date_given", label: "Date Given" },
              { key: "next_due", label: "Next Due" },
              { key: "dosage", label: "Dosage" },
              { key: "frequency", label: "Frequency" },
              { key: "doctor", label: "Doctor" },
            ])
          )}
        </div>

        <div className="medication-section-box">
          <h2 className="medication-section-header">
            <FileText size={24} style={{ marginRight: "10px" }} />
            Notes
          </h2>
          <button
            className="medication-buttons"
            onClick={() => setNoteModalOpen(true)}
          >
            Add Note
          </button>
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

      <AddMedicationModal
        isOpen={isMedicationModalOpen}
        onClose={() => setMedicationModalOpen(false)}
        onAddMedication={handleAddMedication}
      />
      <VaccineModal
        isOpen={isVaccineModalOpen}
        onClose={() => setVaccineModalOpen(false)}
        onAddVaccine={fetchPatientData}
        patientId={selectedPatient?.id}
      />
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onAddNote={handleAddNote}
      />
    </div>
  );
};

export default MedicationHistory;
