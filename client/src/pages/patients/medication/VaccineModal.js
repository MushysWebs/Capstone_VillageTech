import React, { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import "./VaccineModal.css";

const VaccineModal = ({ isOpen, onClose, patientId, onAddVaccine }) => {
  const supabase = useSupabaseClient();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [dateGiven, setDateGiven] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [doctor, setDoctor] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("vaccinations")
        .insert([
          {
            patient_id: patientId,
            name,
            dosage,
            frequency,
            date_given: dateGiven,
            next_due: nextDue,
            doctor,
          },
        ]);

      if (error) throw error;
      onAddVaccine();
      onClose();
    } catch (error) {
      console.error("Error adding vaccine:", error);
      setError("Failed to add vaccine.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vaccine-modal-overlay">
      <div className="vaccine-modal-content">
        <h2>Add Vaccine</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name:
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
            Date Given:
            <input
              type="date"
              value={dateGiven}
              onChange={(e) => setDateGiven(e.target.value)}
              required
            />
          </label>
          <label>
            Next Due:
            <input
              type="date"
              value={nextDue}
              onChange={(e) => setNextDue(e.target.value)}
            />
          </label>
          <label>
            Doctor:
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
            />
          </label>
          {error && <p className="vaccine-modal-error">{error}</p>}
          <button type="submit" className="vaccine-modal-submit">Add Vaccine</button>
          <button type="button" onClick={onClose} className="vaccine-modal-cancel">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default VaccineModal;
