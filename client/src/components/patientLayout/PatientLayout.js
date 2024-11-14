import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { usePatient } from "../../context/PatientContext";
import PatientSidebar from "../patientSidebar/PatientSidebar";
import PatientTabs from "../PatientTabs";
import { ArrowLeft } from 'lucide-react';
import "./PatientLayout.css";

const PatientLayout = ({ children, globalSearchTerm }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const { selectedPatient, setSelectedPatient } = usePatient();
  const [showSelector, setShowSelector] = useState(!selectedPatient);
  const supabase = useSupabaseClient();
  const defaultProfilePicUrl = supabase.storage
    .from("contacts")
    .getPublicUrl("profile_pictures/defaultPPic.png").data.publicUrl;

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        (patient.name?.toLowerCase() || "").includes(
          (globalSearchTerm || "").toLowerCase()
        ) ||
        (patient.breed?.toLowerCase() || "").includes(
          (globalSearchTerm || "").toLowerCase()
        )
    );
    setFilteredPatients(filtered);
  }, [globalSearchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("id");
      if (error) throw error;
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setShowSelector(false);
  };

  return (
    <div className="patient-main">
      <header className="patient-header">
        <PatientTabs />
      </header>

      <div className="patientMain-section">
        <div className="sidebar-container">
        {showSelector ? (
          <div className="patientMain-list">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className={`patientMain-item ${
                  selectedPatient?.id === patient.id ? "active" : ""
                }`}
                onClick={() => handlePatientSelect(patient)}
              >
                <img
                  src={patient.image_url || defaultProfilePicUrl}
                  className="patientMain-avatar"
                  alt={patient.name}
                />
                <span className="patientMain-name">{patient.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="patient-sidebar-container">
            <PatientSidebar onSwitchToList={() => setShowSelector(true)} />
          </div>
        )}
        </div>
        
        <div className="patient-page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PatientLayout;