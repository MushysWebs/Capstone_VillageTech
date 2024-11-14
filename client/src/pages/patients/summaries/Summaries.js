import { useState, useEffect } from "react";
import { supabase } from "../../../components/routes/supabaseClient";
import { usePatient } from "../../../context/PatientContext";
import PatientLayout from "../../../components/patientLayout/PatientLayout";
import PatientTabs from '../../../components/PatientTabs';
import PatientSidebar from '../../../components/patientSidebar/PatientSidebar';
import "./Summaries.css";

const Summaries = ({ globalSearchTerm }) => {
  const { selectedPatient } = usePatient();
  const [ownerDetails, setOwnerDetails] = useState({});
  const [patientDetails, setPatientDetails] = useState({});
  const [pendingInvoices, setPendingInvoices] = useState([]);

  const fetchOwnerDetails = async () => {
    if (selectedPatient) {
      const { data, error } = await supabase
        .from("owners")
        .select("*")
        .eq("id", selectedPatient.owner_id);

      if (error) {
        console.error("Error fetching owner details:", error.message);
      } else {
        if (data.length > 0) {
          setOwnerDetails(data[0]);
        }
      }
    }
  };

  const fetchPatientDetails = async () => {
    if (selectedPatient) {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", selectedPatient.id);

      if (error) {
        console.error("Error fetching patient details:", error.message);
      } else {
        if (data.length > 0) {
          setPatientDetails(data[0]);
        }
      }
    }
  };

  const fetchPendingInvoices = async () => {
    if (selectedPatient) {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("patient_id", selectedPatient.id)
        .eq("invoice_status", "Pending");

      if (error) {
        console.error("Error fetching pending invoices:", error.message);
      } else {
        setPendingInvoices(data);
      }
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      fetchOwnerDetails();
      fetchPatientDetails();
      fetchPendingInvoices();
    }
  }, [selectedPatient]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <PatientLayout globalSearchTerm={globalSearchTerm}>
      <div className="summaries-page">
        <div className="summaries-section">
            <div className="summaries-header-container">
              <h2 className="financial-h2">Owner Details</h2>
            </div>
  
            <div className="summaries-table-container">
              <div className="owner-header">
                <p>First Name: {ownerDetails.first_name || "N/A"}</p>
                <p>Last Name: {ownerDetails.last_name || "N/A"}</p>
                <p>Email: {ownerDetails.email || "N/A"}</p>
                <p>Phone: {ownerDetails.phone || "N/A"}</p>
                <p>Address: {ownerDetails.address || "N/A"}</p>
                <p>Notes: {ownerDetails.notes || "N/A"}</p>
              </div>
            </div>
          </div>
  
          <div className="summaries-section">
            <h2 className="financial-h2">Patient Details</h2>
  
            <div className="summaries-table-container">
              <div className="owner-header">
                <p>Species: {patientDetails.species || "N/A"}</p>
                <p>Breed: {patientDetails.breed || "N/A"}</p>
                <p>Age: {patientDetails.age || "N/A"}</p>
                <p>
                  Date of Birth:{" "}
                  {new Date(patientDetails.date_of_birth).toLocaleDateString() ||
                    "N/A"}
                </p>
                <p>Gender: {patientDetails.gender || "N/A"}</p>
                <p>
                  Microchip Number: {patientDetails.microchip_number || "N/A"}
                </p>
                <p>Weight: {patientDetails.weight || "N/A"} KG</p>
                <p>Rabies Number: {patientDetails.rabies_number || "N/A"}</p>
                <p>Color: {patientDetails.color || "N/A"}</p>
                <p>Notes: {patientDetails.notes || "N/A"}</p>
              </div>
            </div>
          </div>
  
          <div className="summaries-section">
            <h2 className="financial-h2">Outstanding Invoices</h2>
            <div className="summaries-table-container">
              <table className="summaries-invoices-table">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvoices.map((invoice) => (
                    <tr key={invoice.invoice_id}>
                      <td>{invoice.invoice_id}</td>
                      <td>{invoice.invoice_name}</td>
                      <td>{formatCurrency(invoice.invoice_total)}</td>
                      <td>
                        <button
                          className={`status-${invoice.invoice_status.toLowerCase()}`}
                        >
                          {invoice.invoice_status}
                        </button>
                      </td>
                      <td>
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
  
          <div className="summaries-notes-section">
            <h2 className="summaries-notes-header">Summary Notes</h2>
            <table className="summaries-notes-table">
              <thead>
                <tr>
                  <th>Notes</th>
                  <th>Created By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Follow-up required next week</td>
                  <td>Dr. Smith</td>
                  <td>10/05/2024</td>
                </tr>
                <tr>
                  <td colSpan="3" className="summaries-notes-empty">
                    No summary notes available
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>
      </PatientLayout>
    );
  };

export default Summaries;
