import { useState } from "react";
import "./AddMedicationModal.css"

const AddMedicationModal = ({ isOpen, onClose, onAddMedication }) => {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [stock, setStock] = useState("");

  const handleAddMedication = () => {
    const newMedication = {
      id: Date.now(),
      name,
      dosage,
      frequency,
      stock: parseInt(stock),
    };

    onAddMedication(newMedication);
    onClose();
    setName("");
    setDosage("");
    setFrequency("");
    setStock("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Medication</h2>
        <form>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Dosage:
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </label>
          <label>
            Frequency:
            <input
              type="text"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
          </label>
          <label>
            Stock:
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
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
