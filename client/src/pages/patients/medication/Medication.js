import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react"; // Supabase client to fetch data
import { usePatient } from "../../../context/PatientContext"; // Import Patient Context
import "./Medication.css";

const MedicationHistory = () => {
  const { selectedPatient } = usePatient(); // Get the selected patient from context
  const supabase = useSupabaseClient();

  const [medications, setMedications] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPatientData = async () => {
      if (selectedPatient) {
        setLoading(true);

        try {
          const { data: medicationData, error: medicationError } =
            await supabase
              .from("medications")
              .select("*")
              .eq("patient_id", selectedPatient.id);

          const { data: allergyData, error: allergyError } = await supabase
            .from("patient_allergies")
            .select("*")
            .eq("patient_id", selectedPatient.id);

          const { data: vitalData, error: vitalError } = await supabase
            .from("patient_vitals")
            .select("*")
            .eq("patient_id", selectedPatient.id);

          const { data: noteData, error: noteError } = await supabase
            .from("patient_notes")
            .select("*")
            .eq("patient_id", selectedPatient.id);

          if (medicationError || allergyError || vitalError || noteError) {
            console.error("Error fetching patient data:", {
              medicationError,
              allergyError,
              vitalError,
              noteError,
            });
          } else {
            setMedications(medicationData || []);
            setAllergies(allergyData || []);
            setVitals(vitalData || []);
            setNotes(noteData || []);
          }
        } catch (error) {
          console.error("Error fetching patient information:", error);
        }

        setLoading(false);
      }
    };

    fetchPatientData();
  }, [selectedPatient, supabase]);

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

          {loading ? (
            <p>Loading medications...</p>
          ) : (
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
                {filteredMedications.length > 0 ? (
                  filteredMedications.map((medication) => (
                    <tr key={medication.id}>
                      <td>{medication.name}</td>
                      <td>{medication.dosage}</td>
                      <td>{medication.frequency}</td>
                      <td>{medication.date_prescribed}</td>
                      <td>{medication.end_date}</td>
                      <td>{medication.reason}</td>
                      <td>{medication.doctor}</td>
                      <td>{medication.instructions}</td>
                      <td>{medication.refills}</td>
                      <td>{medication.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10">No medications found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="estimate-section">
          <h2>Allergies</h2>
          {loading ? (
            <p>Loading allergies...</p>
          ) : (
            <table className="estimate-table">
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
                    <td colSpan="2">No allergies found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="estimate-section">
          <h2>Vitals</h2>
          {loading ? (
            <p>Loading vitals...</p>
          ) : (
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
                {vitals.length > 0 ? (
                  vitals.map((vital) => (
                    <tr key={vital.id}>
                      <td>{vital.date}</td>
                      <td>{vital.weight}</td>
                      <td>{vital.temperature}</td>
                      <td>{vital.heart_rate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No vitals found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <section className="estimate-section">
          <h2>Notes</h2>
          {loading ? (
            <p>Loading notes...</p>
          ) : (
            <table className="estimate-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <tr key={note.id}>
                      <td>{note.date}</td>
                      <td>{note.note}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No notes found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default MedicationHistory;
