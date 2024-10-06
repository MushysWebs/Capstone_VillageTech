import { useState, useEffect } from "react";
import { supabase } from "../../../components/routes/supabaseClient";
import { Link } from "react-router-dom";
import { usePatient } from "../../../context/PatientContext";
import "./Summaries.css";

const Summaries = () => {
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
    <div className="patient-main">
      <header className="patient-header">
        <div className="patient-tabs">
          <Link to="/patient/clinical" className="tab-button">
            Clinical
          </Link>
          <Link to="/patient/soc" className="tab-button">
            S.O.C.
          </Link>
          <Link to="/Financial" className="tab-button">
            Financial
          </Link>
          <Link to="/patient/summaries" className="tab-button">
            Summaries
          </Link>
          <Link to="/healthStatus" className="tab-button">
            Health Status
          </Link>
          <Link to="/medication" className="tab-button">
            Medication
          </Link>
          <Link to="/newPatient" className="tab-button">
            New Patient
          </Link>
        </div>
      </header>

      <div>
        <h2 className="summaries-h2">Overall Summary</h2>
      </div>

      <main>
        <div className="estimate-section">
          <div className="estimate-header-container">
            <h2 className="financial-h2">Owner Details</h2>
          </div>

          <div className="table-container">
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

        <div className="estimate-section">
          <h2 className="financial-h2">Patient Details</h2>

          <div className="table-container">
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

        <div className="estimate-section">
          <h2 className="financial-h2">Outstanding Invoices</h2>
          <div className="table-container">
            <table className="invoices-table">
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

        <div className="estimate-section">
          <h2 className="financial-h2">Summary Notes</h2>
          <div className="table-container">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Notes</th>
                  <th>Created By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Summaries;
