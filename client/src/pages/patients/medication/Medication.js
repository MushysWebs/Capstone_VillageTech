import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { usePatient } from "../../../context/PatientContext";
import PatientTabs from "../../../components/PatientTabs";
import { Search, AlertCircle, Activity, FileText } from "lucide-react";
import PatientSidebar from "../../../components/patientSidebar/PatientSidebar";
import AddMedicationModal from "../../../components/addMedicationModal/AddMedicationModal";
import AddAllergyModal from "../../../components/addAllergyModal/AddAllergyModal";
import AddVitalModal from "../../../components/addVitalModal/AddVitalModal";
import AddNoteModal from "../../../components/addNoteModal/AddNoteModal";
import "./Medication.css";

const MedicationHistory = () => {
    const { selectedPatient } = usePatient();
    const supabase = useSupabaseClient();

    const [medications, setMedications] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [vitals, setVitals] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isMedicationModalOpen, setMedicationModalOpen] = useState(false);
    const [isAllergyModalOpen, setAllergyModalOpen] = useState(false);
    const [isVitalModalOpen, setVitalModalOpen] = useState(false);
    const [isNoteModalOpen, setNoteModalOpen] = useState(false);

    useEffect(() => {
        if (selectedPatient) {
            fetchPatientData();
        }
    }, [selectedPatient]);

    const fetchPatientData = async () => {
        setLoading(true);
        try {
            const [medData, allergyData, vitalData, noteData] = await Promise.all([
                supabase.from("medications").select("*").eq("patient_id", selectedPatient.id),
                supabase.from("patient_allergies").select("*").eq("patient_id", selectedPatient.id),
                supabase.from("patient_vitals").select("*").eq("patient_id", selectedPatient.id),
                supabase.from("patient_notes").select("*").eq("patient_id", selectedPatient.id)
            ]);

            if (medData.error || allergyData.error || vitalData.error || noteData.error) {
                throw new Error("Error fetching patient data");
            }

            setMedications(medData.data || []);
            setAllergies(allergyData.data || []);
            setVitals(vitalData.data || []);
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
                .insert([{ patient_id: selectedPatient.id, type: "Medication", ...newMedication }]);

            if (error) throw error;

            if (data && data.length > 0) {
                setMedications((prev) => [...prev, { ...newMedication, id: data[0].id }]);
            } else {
                await fetchPatientData(); // Fallback to re-fetching
            }
            setMedicationModalOpen(false);
        } catch (error) {
            console.error("Error adding medication:", error);
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
                await fetchPatientData(); // Fallback to re-fetching
            }
            setAllergyModalOpen(false);
        } catch (error) {
            console.error("Error adding allergy:", error);
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
                await fetchPatientData(); // Fallback to re-fetching
            }
            setVitalModalOpen(false);
        } catch (error) {
            console.error("Error adding vital:", error);
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
                    <button className="medication-buttons" onClick={() => setMedicationModalOpen(true)}>Add Medication</button>
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
                    <h2 className="medication-section-header">
                        <AlertCircle size={24} style={{ marginRight: "10px" }} />
                        Allergies
                    </h2>
                    <button className="medication-buttons" onClick={() => setAllergyModalOpen(true)}>Add Allergy</button>
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
                    <button className="medication-buttons" onClick={() => setVitalModalOpen(true)}>Add Vital</button>
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
                    <button className="medication-buttons" onClick={() => setNoteModalOpen(true)}>Add Note</button>
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
            <AddAllergyModal
                isOpen={isAllergyModalOpen}
                onClose={() => setAllergyModalOpen(false)}
                onAddAllergy={handleAddAllergy}
            />
            <AddVitalModal
                isOpen={isVitalModalOpen}
                onClose={() => setVitalModalOpen(false)}
                onAddVital={handleAddVital}
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
