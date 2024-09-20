import React from "react";
import "./PatientSidebar.css"
//import { useSupabaseClient } from '@supabase/auth-helpers-react';

const PatientSidebar = () => {


    
    return (
        <div className="PatientSidebar">
            <div className="patientPhoto">
                    <img></img>
            </div>
            
            <div className="patientInfo">
                <div>
                    <img></img>
                </div>
                
                <h2 className="patientName">Ponzu</h2>
                {/* <dl>
                <p>Patient ID: {patient.id}</p>
                    <p>Date of Birth: {patient.date_of_birth}</p>
                    <p>{patient.species} - {patient.breed}</p>
                    <p>Weight: {patient.weight} kg</p>
                </dl> */}
            </div>
         
            <div className="demeanor">
                
                <p><span>Evil</span></p><img></img>

            </div>
            <div className="appointments">
                <p>Upcoming Appointment</p>

                <p>Last Appointment</p>

                <p>Recourring Appointments</p>
                

            </div>
            <div className="SOCEvent">
                <p>SOC Event</p><p>Next Due</p>
                

            </div>
        </div>
    );

};
export default PatientSidebar;