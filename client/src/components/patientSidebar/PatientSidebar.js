import React, { useState, useEffect } from "react";
import "./PatientSidebar.css"; // Keeping this import unchanged
import { usePatient } from "../../context/PatientContext";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const PatientSidebar = () => {
  const { selectedPatient } = usePatient();
  console.log("Selected Patient in Sidebar:", selectedPatient);
  const [appointments, setAppointments] = useState([]);
  const [socEvents, setSocEvents] = useState([]);
  const [staffMap, setStaffMap] = useState({});
  const [owner, setOwner] = useState(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (selectedPatient && selectedPatient.id) {
      fetchAppointments(selectedPatient.id);
      fetchSocEvents(selectedPatient.id);
      fetchStaff();
      fetchPatientData(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchAppointments = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patientId)
        .order("start_time", { ascending: false }) 
        .limit(1); 
  
      if (error) throw error;
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error.message);
    }
  };
  

  const fetchSocEvents = (patientId) => {
    const dummySocEvents = [{ event: "Vaccination", nextDue: "2024-12-10" }];
    setSocEvents(dummySocEvents);
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase.from("staff").select("id, name");
      if (error) throw error;

      const staffMapping = data.reduce((map, staffMember) => {
        map[staffMember.id] = staffMember.name;
        return map;
      }, {});
      setStaffMap(staffMapping);
    } catch (error) {
      console.error("Error fetching staff data:", error.message);
    }
  };

  const fetchPatientData = async (patientId) => {
    try {
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*, owner_id")
        .eq("id", patientId)
        .single();

      if (patientError) throw patientError;

      if (patientData && patientData.owner_id) {
        const { data: ownerData, error: ownerError } = await supabase
          .from("owners")
          .select("first_name, last_name, email, phone_number")
          .eq("id", patientData.owner_id)
          .single();

        if (ownerError) throw ownerError;

        setOwner({
          name: `${ownerData.first_name} ${ownerData.last_name}`,
          email: ownerData.email,
          phone: ownerData.phone_number,
        });
      }
    } catch (error) {
      console.error("Error fetching patient or owner data:", error);
    }
  };

  if (!selectedPatient) {
    console.log("No selected patient", selectedPatient);
    return <div>No patient selected</div>;
  }

  const {
    id: displayedPatientId = "",
    name: patientName = "",
    date_of_birth: dob = "",
    breed = "",
    weight = "",
    demeanor = "",
    image_url: imageUrl = "",
    preferred_doctor: preferredDoctor = "",
  } = selectedPatient;

  return (
    <div className="Sidebar">
      <div className="sidebarHeader">
        <div className="sidebarImg">
          <img
            src={imageUrl || `/api/placeholder/80/80`}
            alt={patientName}
            className="contact-header-avatar"
          />
        </div>
        <h2 className="sidebarName">{patientName}</h2>
      </div>

      <div className="sidebarInfo">
        <dl className="sidebar-body">
          <dt>
            <strong>Patient ID:</strong>
          </dt>
          <dd>{displayedPatientId}</dd>

          <dt>
            <strong>Date of Birth:</strong>
          </dt>
          <dd>{dob}</dd>

          <dt>
            <strong>Breed (dog):</strong>
          </dt>
          <dd>{breed}</dd>

          <dt>
            <strong>Weight:</strong>
          </dt>
          <dd>{weight} kg</dd>
        </dl>
      </div>

      <div className="sidebarDemeanor">
        <h3 className="demeanor-header">Demeanor</h3>
        <div className="demeanor-container">
          <p>{demeanor}</p>
        </div>
      </div>

      <div className="sidebar-owner">
        <h3>Owner</h3>
        <p className="owner-name">{owner?.name || "N/A"}</p>
        <p className="owner-email"> {owner?.email || "N/A"}</p>
        <p>{owner?.phone || "N/A"}</p>
      </div>

      <div className="sidebarApp">
        <h3>Appointments</h3>
        {appointments.length > 0 ? (
          appointments.map((app, index) => (
            <div key={index}>
              <p>
                <strong>Title:</strong> {app.title}
              </p>
              <p>
                <strong>Start Time:</strong>{" "}
                {new Date(app.start_time).toLocaleString()}
              </p>
              <p>
                <strong>End Time:</strong>{" "}
                {new Date(app.end_time).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {app.status}
              </p>
              <p>
                <strong>Staff:</strong> {staffMap[app.staff_id] || "N/A"}
              </p>
            </div>
          ))
        ) : (
          <p>No appointments available</p>
        )}
      </div>

      <div className="sidebarSOC">
        <div className="event-section">
          <h3 className="soc-event">SOC Event</h3>
          <h3 className="next-due">Next Due</h3>
        </div>
        <div className="SOC-body">
          {socEvents.length > 0 ? (
            socEvents.map((event, index) => (
              <div key={index} className="soc-event-row">
                <div className="soc-event-name">{event.event}</div>
                <div className="soc-event-next-due">{event.nextDue}</div>
              </div>
            ))
          ) : (
            <p>No SOC events available</p>
          )}
        </div>
      </div>

      <div className="sidebarPreferredDoctor">
        <h3>Preferred Doctor</h3>
        <p>{preferredDoctor || "N/A"}</p>
      </div>
    </div>
  );
};

export default PatientSidebar;
