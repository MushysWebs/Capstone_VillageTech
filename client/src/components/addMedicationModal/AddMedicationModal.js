import { useState } from "react";
import "./AddMedicationModal.css";

const AddMedicationModal = ({ isOpen, onClose, onAddMedication }) => {
    const [name, setName] = useState("");
    const [dosage, setDosage] = useState("");
    const [frequency, setFrequency] = useState("");
    const [datePrescribed, setDatePrescribed] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [doctor, setDoctor] = useState("");
    const [instructions, setInstructions] = useState("");
    const [refills, setRefills] = useState("");
    const [status, setStatus] = useState("Ongoing"); // Default status can be "Ongoing" or another value as needed

    const handleAddMedication = () => {
        const newMedication = {
            name,
            dosage,
            frequency,
            date_prescribed: datePrescribed,
            end_date: endDate,
            reason,
            doctor,
            instructions,
            refills: refills ? parseInt(refills) : null,
            status,
        };

        onAddMedication(newMedication);
        onClose();
        // Resetting the state fields
        resetForm();
    };

    const resetForm = () => {
        setName("");
        setDosage("");
        setFrequency("");
        setDatePrescribed("");
        setEndDate("");
        setReason("");
        setDoctor("");
        setInstructions("");
        setRefills("");
        setStatus("Ongoing");
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add Medication</h2>
                <form>
                    <label>
                        Medication: 
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Dosage: 
                        <input
                            type="text"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Frequency: 
                        <input
                            type="text"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Date Prescribed: 
                        <input
                            type="date"
                            value={datePrescribed}
                            onChange={(e) => setDatePrescribed(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        End Date: 
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </label>
                    <label>
                        Reason: 
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Prescribing Doctor: 
                        <input
                            type="text"
                            value={doctor}
                            onChange={(e) => setDoctor(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Instructions: 
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Refills: 
                        <input
                            type="number"
                            value={refills}
                            onChange={(e) => setRefills(e.target.value)}
                            min="0"
                            required
                        />
                    </label>
                    <label>
                        Status: 
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </label>
                    <div className="modal-actions">
                        <button type="button" onClick={handleAddMedication}>
                            Add
                        </button>
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMedicationModal;
