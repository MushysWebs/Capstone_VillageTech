import { useState } from "react";
// import "./AddVitalModal.css";

const AddVitalModal = ({ isOpen, onClose, onAddVital }) => {
  const [date, setDate] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");

  const handleAddVital = () => {
    const newVital = {
      date,
      weight,
      temperature,
      heart_rate: heartRate,
    };

    onAddVital(newVital);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setDate("");
    setWeight("");
    setTemperature("");
    setHeartRate("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Vital</h2>
        <form>
          <label>
            Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label>
            Weight (lbs):
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </label>
          <label>
            Temperature (Celsius):   
            <input
              type="text"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              required
            />
          </label>
          <label>
            Heart Rate:
            <input
              type="text"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              required
            />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={handleAddVital}>
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

export default AddVitalModal;
