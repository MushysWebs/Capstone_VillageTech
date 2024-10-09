import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Link } from "react-router-dom";
import PatientTabs from '../../../components/patientSideBar/PatientTabs'
import { usePatient } from "../../../context/PatientContext";
import "./HealthStatus.css";

const HealthStatus = () => {
  const { selectedPatient } = usePatient();
  const [error, setError] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchPatientData = async () => {
      if (selectedPatient) {
        try {
          const { data: vaccinations, error: vaccinationError } = await supabase
            .from("medications")
            .select("*")
            .eq("patient_id", selectedPatient.id)
            .eq("type", "Vaccine");

          if (vaccinationError) {
            console.error("Error fetching vaccinations:", vaccinationError);
            setError("Failed to fetch vaccination information.");
          } else {
            setVaccinations(vaccinations);
          }
        } catch (error) {
          console.error("Error fetching vaccination information:", error);
          setError(
            "An unexpected error occurred while fetching vaccination information."
          );
        }
      }
    };

    fetchPatientData();
  }, [selectedPatient, supabase]);

  return (
    <div className="patient-main">
      <header className="patient-header">
       <PatientTabs />
      </header>

      <div className="health-status-container">
        <div className="section-box">
          <section className="canine-info">
            <header className="section-header">PATIENT INFORMATION</header>
            <div className="info-grid">
              {error ? (
                <div className="info-item">{error}</div>
              ) : selectedPatient ? (
                <>
                  <div className="info-item">Name: {selectedPatient.name}</div>
                  <div className="info-item">
                    Breed: {selectedPatient.breed}
                  </div>
                  <div className="info-item">
                    Patient ID: {selectedPatient.id}
                  </div>
                  <div className="info-item">
                    Gender: {selectedPatient.gender}
                  </div>
                  <div className="info-item">
                    Colour: {selectedPatient.color}
                  </div>
                  <div className="info-item">
                    Weight: {selectedPatient.weight} kgs
                  </div>
                </>
              ) : (
                <div className="info-item">Loading...</div>
              )}
            </div>
          </section>
        </div>

        <div className="section-box">
          <section className="health-notes">
            <header className="section-header">Health Notes and Alerts</header>
            <div className="health-notes-grid">
              {error ? (
                <div className="info-item">{error}</div>
              ) : selectedPatient ? (
                <textarea
                  className="health-textarea"
                  placeholder="Health notes"
                  defaultValue={
                    selectedPatient.notes || "No health notes available"
                  } 
                />
              ) : (
                <div className="info-item">Loading...</div>
              )}
              <textarea
                className="health-textarea"
                placeholder="Alerts"
              ></textarea>
            </div>
          </section>
        </div>

        <div className="section-box">
          <section className="vaccination-info">
            <header className="section-header">Vaccinations</header>
            <div className="vaccination-grid">
              <div className="vaccination-column">Shot</div>
              <div className="vaccination-column">Date</div>
              <div className="vaccination-column">Next Due</div>

              {vaccinations.length > 0 ? (
                vaccinations.map((vaccination) => (
                  <React.Fragment key={vaccination.id}>
                    <div className="vaccination-item">{vaccination.name}</div>
                    <div className="vaccination-item">
                      {vaccination.date_prescribed || "N/A"}
                    </div>
                    <div className="vaccination-item">
                      {vaccination.next_due || "N/A"}
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <>
                  <div className="vaccination-item">
                    No vaccinations available
                  </div>
                  <div className="vaccination-item"></div>
                  <div className="vaccination-item"></div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HealthStatus;
