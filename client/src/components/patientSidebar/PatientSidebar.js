import React from "react";
import "./PatientSidebar.css"
//import { useSupabaseClient } from '@supabase/auth-helpers-react';

const PatientSidebar = () => {


    
    return (
        <div className="PatientSidebar">
            <div className="patientPhoto">
             {/* <img src="https://fuitfkjuphldahkcsogq.supabase.co/storage/v1/object/public/contacts/profile_pictures/0.38716950783300974.jpg" alt="Taylor Swift" class="contact-header-avatar"> */}
             {/* This is Rickys code for his contacts page anime taylor swift something, ill dissect later */}
            </div> 
            <div className="patientName">
                
                <h2 className="patientName">Ponzu</h2>
                <dl>
                <p>Patient ID: </p>
                    <p>Date of Birth: </p>
                    <p></p>
                    <p>Weight:  kg</p>
                </dl>
                {/* <Link> </Link> */}
                </div>
         
            <div className="demeanor">

                <h3>demeanor</h3>
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