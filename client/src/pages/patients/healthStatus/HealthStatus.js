import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Link } from 'react-router-dom';
import './HealthStatus.css';

const HealthStatus = () => {
  const patientId = 10; // Hardcoded patient ID for now
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (error) {
          console.error('Supabase fetch error:', error);
          setError('Failed to fetch patient information.');
        } else {
          setPatient(data);
        }
      } catch (error) {
        console.error('Error fetching patient information:', error);
        setError('An unexpected error occurred while fetching patient information.');
      }
    };

    fetchPatient();
  }, [patientId, supabase]);

  return (
    <div className='patient-main'>
      <header className="patient-header">
        <div className="patient-tabs">
          <Link to="/patient/clinical" className="tab-button">Clinical</Link>
          <Link to="/patient/soc" className="tab-button">S.O.C.</Link>
          <Link to="/Financial" className="tab-button">Financial</Link>
          <Link to="/summaries" className="tab-button">Summaries</Link>
          <Link to="/healthStatus" className="tab-button">Health Status</Link>
          <Link to="/medication" className="tab-button">Medication</Link>
          <Link to="/newPatient" className="tab-button">New Patient</Link>
        </div>
      </header>

      <div className="health-status-container">
        <div className="section-box">
          <section className="canine-info">
            <header className="section-header">PATIENT INFORMATION</header>
            <div className="info-grid">
              {error ? (
                <div className="info-item">{error}</div>
              ) : patient ? (
                <>
                  <div className="info-item">Name: {patient.name}</div>
                  <div className="info-item">Breed: {patient.breed}</div>
                  <div className="info-item">Patient ID: {patient.id}</div>
                  <div className="info-item">Gender: {patient.gender}</div>
                  <div className="info-item">Colour: {patient.color}</div>
                  <div className="info-item">Birth weight: {patient.weight} lbs</div>
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
              {/* Display patient notes here */}
              {error ? (
                <div className="info-item">{error}</div>
              ) : patient ? (
                <textarea 
                  className="health-textarea" 
                  placeholder="Health notes"
                  defaultValue={patient.notes || 'No health notes available'} // Default value from patient notes
                />
              ) : (
                <div className="info-item">Loading...</div>
              )}
              {/* Alerts section */}
              <textarea className="health-textarea" placeholder="Alerts"></textarea>
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

              {/* Example Vaccinations */}
              <div className="vaccination-item">DA2PP</div>
              <div className="vaccination-item">TBD</div>
              <div className="vaccination-item">TBD</div>
              <div className="vaccination-item">Rabies</div>
              <div className="vaccination-item">TBD</div>
              <div className="vaccination-item">TBD</div>
              <div className="vaccination-item">Leptospirosis</div>
              <div className="vaccination-item">TBD</div>
              <div className="vaccination-item">TBD</div>
              <div className="vaccination-item">Lyme</div>
              <div className="vaccination-item">TBD</div>
              <div className="vaccination-item">TBD</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HealthStatus;
