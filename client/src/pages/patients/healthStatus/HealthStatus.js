import React from 'react';
import './HealthStatus.css';
import { Link } from 'react-router-dom';

const HealthStatus = () => {
    return (
        <div className='patient-main'>
         <header className="patient-header">
                <div className="patient-tabs">
                    <Link to="/patient/clinical" className="tab-button">Clinical</Link>
                    <Link to="/patient/soc" className="tab-button">S.O.C.</Link>
                    <Link to="/Financial" className="tab-button">Financial</Link>
                    <Link to="/patient/summaries" className="tab-button">Summaries</Link>
                    <Link to="/healthStatus" className="tab-button">Health Status</Link>
                    <Link to="/patient/medication" className="tab-button">Medication</Link>
                    <Link to="/newPatient" className="tab-button">New Patient</Link>
                </div>
            </header>
        <div className="health-status-container">
            
            <div className="section-box">
                <section className="canine-info">
                    <header className="section-header">CANINE INFORMATION</header>
                    <div className="info-grid">
                        <div className="info-item">Name:</div>
                        <div className="info-item">Breed:</div>
                        <div className="info-item">Patient ID:</div>
                        <div className="info-item">Sex:</div>
                        <div className="info-item">Colour:</div>
                        <div className="info-item">Birth weight:</div>
                    </div>
                </section>
            </div>

           
            <div className="section-box">
                <section className="health-notes">
                    <header className="section-header">Health Notes and Alerts</header>
                    <div className="health-notes-grid">
                        <textarea className="health-textarea" placeholder="Health notes"></textarea>
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
