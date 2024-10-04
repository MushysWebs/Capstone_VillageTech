import React, { useState, useEffect } from "react";
import "./PatientSidebar.css";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { supabase } from "../routes/supabaseClient";

const PatientSidebar = ({ patientId }) => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [socEvents, setSocEvents] = useState([]);

    // Grabs Patient info from the database based on the patient ID
    const fetchPatientData = async (patientId) => {
        try {
            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('*')
                .eq('id', patientId)
                .single();

            if (patientError) throw patientError;
            setSelectedPatient(patientData);
        } catch (error) {
            console.error('Error fetching patient:', error);
        }
    };

    // Fetch appointments for the patient
    const fetchAppointments = async (patientId) => {
        // Example: Dummy data for now, replace with actual Supabase logic
        const dummyAppointments = [
            { nextAppointment: "2024-10-01", lastAppointment: "2024-08-15", recurring: "Monthly" }
        ];
        setAppointments(dummyAppointments);
    };

    // Fetch SOC events for the patient
    const fetchSocEvents = async (patientId) => {
        // Example: Dummy data for now
        const dummySocEvents = [
            { event: "Vaccination", nextDue: "2024-12-10" }
        ];
        setSocEvents(dummySocEvents);
    };

    // Effect to fetch patient data based on the patientId prop
    useEffect(() => {
        if (patientId) {
            fetchPatientData(patientId);
            fetchAppointments(patientId);
            fetchSocEvents(patientId);
        }
    }, [patientId]);

    // Placeholder patient data
    const ownerName = selectedPatient ? selectedPatient.owner_name : "Owner Name";
    const patientName = selectedPatient ? selectedPatient.name : "Ponzu";
    const dob = selectedPatient ? selectedPatient.dob : "2020-01-01";
    const breed = selectedPatient ? selectedPatient.breed : "Canine (Dog) - Ridgeback X"
    const weight = selectedPatient ? selectedPatient.weight : "5.5";
    const demeanor = selectedPatient ? selectedPatient.demeanor : "Playful";
    const phoneNumber = selectedPatient ? selectedPatient.owner_phone : "403123456789";

    return (
        <div className="PatientSidebar">
            {/* Patient Image */}
            <div className="patientImg">
                <img 
                    src="https://fuitfkjuphldahkcsogq.supabase.co/storage/v1/object/public/contacts/profile_pictures/0.38716950783300974.jpg" 
                    alt={patientName} 
                    className="contact-header-avatar" 
                />
            </div>

            {/* Patient Info */}
            <div className="patientInfo">
                <h2 className="patientName">{patientName}</h2>
                <dl className="patient-body">
                    <p>Patient ID: {patientId}</p>
                    <p>Date of Birth: {dob}</p>
                    <p>{breed}</p>
                    <p>Weight: {weight} kg</p>
                </dl>
            </div>

            {/* Patient Demeanor */}
            <div className="patientDemeanor">
                <h3 className="demeanor-header">Demeanor</h3>
                <div className="demeanor-container">
                    <p>{demeanor}</p>
                    <i className="fa-regular fa-pen-to-square"></i>
                </div>
            </div>

            {/* Owner Info */}
            <div className="patient-owner">
                <h3>Owner</h3>
                <p className="owner-name">{ownerName}</p>
                <p>{phoneNumber}</p>
            </div>

            {/* Appointments Section */}
            <div className="patientApp">
                <h3>Appointments</h3>
                {appointments.map((app, index) => (
                    <div key={index}>
                        <p>Next Appointment: {app.nextAppointment}</p>
                        <p>Last Appointment: {app.lastAppointment}</p>
                        <p>Recurring Appointments: {app.recurring}</p>
                    </div>
                ))}
            </div>

            {/* Standard of Care (SOC) Section */}
            <div className="patientSOC">
                <div className="event-section">
                    <h3 className="soc-event">SOC Event</h3>
                    <h3 className="next-due">Next Due</h3>
                </div>
                <div className="SOC-body">
                    <dl>
                        {socEvents.map((event, index) => (
                            <div key={index}>
                                <dt>{event.event}</dt>
                                <dd>{event.nextDue}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default PatientSidebar;