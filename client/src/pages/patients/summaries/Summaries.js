import { useState, useEffect } from "react";
import { supabase } from "../../../components/routes/supabaseClient";
import { Link } from "react-router-dom";
import "./Summaries.css";

const Summaries = () => {
  const [pendingInvoices, setPendingInvoices] = useState([]);

  const fetchPendingInvoices = async () => {
    const { data, error } = await supabase
      .from("financial")
      .select("*")
      .eq("financial_status", "Pending"); // Fetch only pending invoices

    if (error) {
      console.error("Error fetching pending invoices:", error.message);
    } else {
      console.log("Fetched pending invoices:", data);
      setPendingInvoices(data);
    }
  };

  useEffect(() => {
    fetchPendingInvoices();
  }, []);

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
              <p>First Name:</p>
              <p>Last Name:</p>
              <p>Email:</p>
              <p>Phone:</p>
              <p>Address:</p>
              <p>Notes:</p>
            </div>
          </div>
        </div>

        <div className="estimate-section">
          <h2 className="financial-h2">Patient Details</h2>

          <div className="table-container">
            <div className="owner-header">
              <p>Species:</p>
              <p>Breed:</p>
              <p>Age:</p>
              <p>Date of Birth:</p>
              <p>Gender:</p>
              <p>Microchip Number:</p>
              <p>Weight:</p>
              <p>Rabies Number:</p>
              <p>Color:</p>
              <p>Notes:</p>
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
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map((invoice) => (
                  <tr key={invoice.financial_number}>
                    <td>{invoice.financial_number}</td>
                    <td>{invoice.financial_name}</td>
                    <td>{invoice.financial_patient}</td>
                    <td>{formatCurrency(invoice.financial_hightotal)}</td>
                    <td>
                      <button
                        className={`status-${invoice.financial_status.toLowerCase()}`}
                      >
                        {invoice.financial_status}
                      </button>
                    </td>
                    <td>
                      {new Date(invoice.financial_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add your other sections here... */}

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
              <tbody>{/* display information from database here */}</tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Summaries;
