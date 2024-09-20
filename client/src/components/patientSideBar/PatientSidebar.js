import React, {useEffect, useState} from "react"
import "./PatientSidebar.css"
import { supabase } from "../routes/supabaseClient"


const PatientSidebar = ({patientID}) => {

    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                setLoading(true);

                const {data, error} = await supabase
                .from("patients")
                .select("*")
                .eq("id", patientId)
                .single();
            }
        }
    })

}

return
(
    <div className="patientSidebar">
        <div className="patientPhoto">
            <image></image>
        </div>
        
        <div className="patientInfo">
            <label className="patientName"></label>
            <h2></h2>

        </div>
       
        <div className="demeanor">

        </div>

        <div className="ownerInfo">

        </div>

        <div className="userAppointments">

        </div>

        <div className="socEvents">

        </div>


    </div>
)