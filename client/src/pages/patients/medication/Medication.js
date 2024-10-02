import { useState } from "react";
import { Link } from "react-router-dom";
import "./Medication.css";

const MedicationHistory = () => {
  const initialMedications = [
    {
      id: 1,
      name: "Amoxicillin",
      dosage: "10mg/kg",
      frequency: "Twice daily",
      datePrescribed: "2024-09-10",
      endDate: "2024-09-17",
      reason: "Bacterial infection",
      doctor: "Dr. Smith",
      instructions: "Take with food.",
      refills: 2,
      status: "Completed",
    },
    {
      id: 2,
      name: "Metacam",
      dosage: "0.2mg/kg",
      frequency: "Once daily",
      datePrescribed: "2024-08-15",
      endDate: "2024-08-22",
      reason: "Pain management",
      doctor: "Dr. Jones",
      instructions: "Administer in the morning.",
      refills: 1,
      status: "Completed",
    },
    {
      id: 3,
      name: "Frontline Plus",
      dosage: "1 pipette",
      frequency: "Monthly",
      datePrescribed: "2024-07-05",
      endDate: "2024-08-05",
      reason: "Flea prevention",
      doctor: "Dr. Brown",
      instructions: "Apply to the skin.",
      refills: 0,
      status: "Completed",
    },
  ];

  const initialAllergies = [
    { id: 1, name: "Penicillin", reaction: "Rash" },
    { id: 2, name: "Peanuts", reaction: "Anaphylaxis" },
  ];

  const initialVitals = [
    {
      id: 1,
      date: "2024-09-01",
      weight: "25 kg",
      temperature: "37°C",
      heartRate: "80 bpm",
    },
    {
      id: 2,
      date: "2024-08-15",
      weight: "24 kg",
      temperature: "38°C",
      heartRate: "82 bpm",
    },
  ];

  const initialNotes = [
    { id: 1, date: "2024-09-10", note: "Patient responds well to treatment." },
    { id: 2, date: "2024-08-20", note: "Follow-up needed in one week." },
  ];

  const [medications, setMedications] = useState(initialMedications);
  const [allergies] = useState(initialAllergies);
  const [vitals] = useState(initialVitals);
  const [notes] = useState(initialNotes);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMedications = medications.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patient-main">
      <header className="patient-header">
        <div className="patient-tabs">
          <Link to="/patient/clinical" className="tab-button">
            Clinical
          </Link>
          <Link to="/patient/soc" className="tab-button">
            S.O.C.
          </Link>
          <Link to="/Financial" className="tab-button">
            Financial
          </Link>
          <Link to="/summaries" className="tab-button">
            Summaries
          </Link>
          <Link to="/healthStatus" className="tab-button">
            Health Status
          </Link>
          <Link to="/patient/medication" className="tab-button">
            Medication
          </Link>
          <Link to="/newPatient" className="tab-button">
            New Patient
          </Link>
        </div>
      </header>

      <div className="medication-content">
        <div>
          <h1>Medication</h1>
        </div>

       
        <div className="estimate-section">
        <h2>Patient Medication History</h2>
        <input
          type="text"
          placeholder="Search medications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-medication"
        />
          <table className="estimate-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Date Prescribed</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Prescribing Doctor</th>
                <th>Instructions</th>
                <th>Refills</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedications.map((medication) => (
                <tr key={medication.id}>
                  <td>{medication.name}</td>
                  <td>{medication.dosage}</td>
                  <td>{medication.frequency}</td>
                  <td>{medication.datePrescribed}</td>
                  <td>{medication.endDate}</td>
                  <td>{medication.reason}</td>
                  <td>{medication.doctor}</td>
                  <td>{medication.instructions}</td>
                  <td>{medication.refills}</td>
                  <td>{medication.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="estimate-section">
          <h2>Allergies</h2>
          <table className="estimate-table">
            <thead>
              <tr>
                <th>Allergy</th>
                <th>Reaction</th>
              </tr>
            </thead>
            <tbody>
              {allergies.map((allergy) => (
                <tr key={allergy.id}>
                  <td>{allergy.name}</td>
                  <td>{allergy.reaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vitals Section */}
        <div className="estimate-section">
          <h2>Vitals</h2>
          <table className="estimate-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Temperature</th>
                <th>Heart Rate</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((vital) => (
                <tr key={vital.id}>
                  <td>{vital.date}</td>
                  <td>{vital.weight}</td>
                  <td>{vital.temperature}</td>
                  <td>{vital.heartRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes Section */}
        <section className="estimate-section">
          <h2>Notes</h2>
          <table className="estimate-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id}>
                  <td>{note.date}</td>
                  <td>{note.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default MedicationHistory;
