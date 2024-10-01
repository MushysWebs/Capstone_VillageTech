import { useState } from "react";
import { Link } from "react-router-dom";

const Medication = () => {
  const initialMedications = [
    { id: 1, name: "Amoxicillin", dosage: "10mg/kg", frequency: "Twice daily", stock: 100 },
    { id: 2, name: "Metacam", dosage: "0.2mg/kg", frequency: "Once daily", stock: 50 },
    { id: 3, name: "Frontline Plus", dosage: "1 pipette", frequency: "Monthly", stock: 75 },
  ];

  const [medications, setMedications] = useState(initialMedications);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMedications = medications.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteMedication = (id) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

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
          <Link to="/patient/summaries" className="tab-button">
            Summaries
          </Link>
          <Link to="/healthStatus" className="tab-button">
            Health Status
          </Link>
          <Link to="/Medication" className="tab-button">
            Medication
          </Link>
          <Link to="/newPatient" className="tab-button">
            New Patient
          </Link>
        </div>
      </header>

      <div>
        <h2>Medication Management</h2>

        <input
          type="text"
          placeholder="Search medications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedications.map((medication) => (
              <tr key={medication.id}>
                <td>{medication.name}</td>
                <td>{medication.dosage}</td>
                <td>{medication.frequency}</td>
                <td>{medication.stock}</td>
                <td>
                  <button onClick={() => handleDeleteMedication(medication.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Medication;
