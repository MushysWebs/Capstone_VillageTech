import React from "react";
import "./PatientSidebar.css"
//import { useSupabaseClient } from '@supabase/auth-helpers-react';

const PatientSidebar = () => {




    
    return (
        <div className="PatientSidebar">
            <div className="patientImg">
             <img src="https://fuitfkjuphldahkcsogq.supabase.co/storage/v1/object/public/contacts/profile_pictures/0.38716950783300974.jpg" alt="Taylor Swift" class="contact-header-avatar"></img>
             {/* This is Rickys code for his contacts page anime taylor swift something, ill dissect later */}
            </div> 

            <div className="patientInfo">
                
                <h2 className="patientName">Ponzu</h2>
                <dl class='patient-body'>
                    <p>Patient ID: </p>
                    <p>Date of Birth: </p>
                    <p>Weight:  kg</p>
                </dl>
                </div>
         
            <div className="patientDemeanor">
                <h3 class="demeanor-header">Demeanor</h3>
                <div class='demeanor-container'>
                    <p>Evil</p>
                    <i class="fa-regular fa-pen-to-square"></i>
                </div>

            </div>
            <div className="patient-owner">
                <h3>Owner</h3>
                <p class='owner-name'>Grady</p>
                <p>403123456789</p>

            </div>

            <div className="patientApp">
                    <h3>Appointments</h3>
                

                <p>Next Appointment: </p>
                <link></link>
                <p>Last Appointment: </p>
                <link></link>
                <p>Recourring Appointments: </p>
                <link></link>

            </div>
            <div className="patientSOC">
                <div className="event-section">
                    <h3 class='soc-event'>SOC Event</h3>
                    <h3 class='next-due'>Next Due</h3>
                </div>
                <dl class='SOC-body'>
                    <link></link>
                    <link></link>
                </dl>
            </div>
        </div>
    );

};
export default PatientSidebar;