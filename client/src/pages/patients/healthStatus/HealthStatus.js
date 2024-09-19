import React from 'react';
import './HealthStatus.css';

const HealthStatus = () => {
    return (
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
    );
};

export default HealthStatus;
