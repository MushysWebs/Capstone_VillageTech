import { useState, useEffect } from "react";
import { supabase } from "../../../components/routes/supabaseClient";
import { Link } from "react-router-dom";
import { usePatient } from "../../../context/PatientContext";
import "./Financial.css";
import PatientTabs from "../../../components/PatientTabs";
import PatientSidebar from "../../../components/patientSidebar/PatientSidebar";
import AddEstimateModal from "../../../components/addEstimateModal/AddEstimateModal";

const Financial = () => {
  const { selectedPatient } = usePatient();
  const [estimateData, setEstimateData] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estimateToEdit, setEstimateToEdit] = useState(null);

  const fetchEstimateData = async () => {
    if (selectedPatient) {
      const { data, error } = await supabase
        .from("estimates")
        .select("*")
        .eq("patient_id", selectedPatient.id)
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching estimate data:", error.message);
      } else {
        setEstimateData(data);
      }
    }
  };

  const fetchInvoiceData = async () => {
    if (selectedPatient) {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("patient_id", selectedPatient.id);

      if (error) {
        console.error("Error fetching invoice data:", error.message);
      } else {
        setInvoiceData(data);
      }
    }
  };

  useEffect(() => {
    fetchEstimateData();
    fetchInvoiceData();
  }, [selectedPatient]);

  const openModal = () => {
    setEstimateToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (estimate) => {
    setEstimateToEdit(estimate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const convertEstimateToInvoice = async (estimate) => {
    const { error: insertError } = await supabase.from("invoices").insert({
      invoice_name: estimate.estimate_name,
      patient_id: selectedPatient.id,
      invoice_total: estimate.estimate_hightotal,
      invoice_paid: 0,
      invoice_date: new Date().toISOString(),
      invoice_status: "Pending",
      pet_id: estimate.pet_id,
    });

    if (insertError) {
      console.error(
        "Error converting estimate to invoice:",
        insertError.message
      );
      return;
    }

    const { error: updateError } = await supabase
      .from("estimates")
      .update({ is_active: false })
      .eq("estimate_id", estimate.estimate_id);

    if (updateError) {
      console.error("Error marking estimate as inactive:", updateError.message);
    } else {
      fetchEstimateData();
      fetchInvoiceData();
    }
  };

  const cancelEstimate = async (estimate) => {
    const { error } = await supabase
      .from("estimates")
      .update({ is_active: false })
      .eq("estimate_id", estimate.estimate_id);

    if (error) {
      console.error("Error canceling estimate:", error.message);
    } else {
      fetchEstimateData();
    }
  };

  const updateInvoiceStatus = async (invoice, newStatus) => {
    const { error } = await supabase
      .from("invoices")
      .update({ invoice_status: newStatus })
      .eq("invoice_id", invoice.invoice_id);

    if (error) {
      console.error("Error updating invoice status:", error.message);
    } else {
      fetchInvoiceData();
    }
  };

  const cancelInvoice = async (invoice) => {
    const { error } = await supabase
      .from("invoices")
      .update({ invoice_status: "Cancelled" })
      .eq("invoice_id", invoice.invoice_id);

    if (error) {
      console.error("Error canceling invoice:", error.message);
    } else {
      fetchInvoiceData();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "Pending":
        return "status-pending";
      case "Cancelled":
        return "status-cancelled";
      case "Estimate":
        return "status-estimate";
      default:
        return "";
    }
  };

  return (
    <div className="financial-main">
      <PatientSidebar />
      <div className="financial-page">
        <header className="patient-header">
          <PatientTabs />
        </header>

        <main>
          <div className="estimate-section">
            <div className="estimate-header-container">
              <button onClick={openModal}>+</button>
              <h2 className="financial-h2">Estimates</h2>
            </div>

            <div className="table-container">
              <table className="estimate-table">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Name</th>
                    <th>Patient</th>
                    <th>Low Total</th>
                    <th>High Total</th>
                    <th>Deposit</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Convert to Invoice</th>
                    <th>Cancel</th>
                    <th>Last Update</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {estimateData.map((item) => (
                    <tr key={item.estimate_id}>
                      <td>{item.estimate_id}</td>
                      <td>{item.estimate_name}</td>
                      <td>{selectedPatient.name}</td>
                      <td>{formatCurrency(item.estimate_lowtotal)}</td>
                      <td>{formatCurrency(item.estimate_hightotal)}</td>
                      <td>{formatCurrency(item.estimate_deposit)}</td>
                      <td>
                        {new Date(item.estimate_date).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className={getStatusClass(item.estimate_status)}
                        >
                          {item.estimate_status}
                        </button>
                      </td>
                      <td>
                        <button
                          className="convert-button"
                          onClick={() => convertEstimateToInvoice(item)}
                        >
                          Convert to Invoice
                        </button>
                      </td>
                      <td>
                        <button
                          className="financial-cancel-button"
                          onClick={() => cancelEstimate(item)}
                        >
                          Cancel
                        </button>
                      </td>
                      <td>{new Date(item.last_update).toLocaleString()}</td>
                      <td>
                        <button
                          className="financial-edit-button"
                          onClick={() => handleEditClick(item)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="estimate-section">
            <h2 className="financial-h2">Pending Invoices</h2>
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
                    <th>Edit</th>
                    <th>Update Status</th>
                    <th>Cancel</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData
                    .filter((invoice) => invoice.invoice_status === "Pending")
                    .map((item) => (
                      <tr key={item.invoice_id}>
                        <td>{item.invoice_id}</td>
                        <td>{item.invoice_name}</td>
                        <td>{selectedPatient.name}</td>
                        <td>{formatCurrency(item.invoice_total)}</td>
                        <td>
                          <button
                            className={getStatusClass(item.invoice_status)}
                          >
                            {item.invoice_status}
                          </button>
                        </td>
                        <td>
                          {new Date(item.invoice_date).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="financial-edit-button"
                            onClick={() => handleEditClick(item)}
                          >
                            Edit
                          </button>
                        </td>

                        <td>
                          <button
                            className="financial-complete"
                            onClick={() =>
                              updateInvoiceStatus(item, "Completed")
                            }
                          >
                            Complete
                          </button>
                        </td>
                        <td>
                          <button
                            className="financial-cancel-button"
                            onClick={() => cancelInvoice(item)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="estimate-section">
            <h2 className="financial-h2">Completed</h2>
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
                  {invoiceData
                    .filter((invoice) => invoice.invoice_status === "Completed")
                    .map((item) => (
                      <tr key={item.invoice_id}>
                        <td>{item.invoice_id}</td>
                        <td>{item.invoice_name}</td>
                        <td>{selectedPatient.name}</td>
                        <td>{formatCurrency(item.invoice_total)}</td>
                        <td>
                          <button
                            className={getStatusClass(item.invoice_status)}
                          >
                            {item.invoice_status}
                          </button>
                        </td>
                        <td>
                          {new Date(item.invoice_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="estimate-section">
            <h2 className="financial-h2">Cancelled</h2>
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
                  {invoiceData
                    .filter((invoice) => invoice.invoice_status === "Cancelled")
                    .map((item) => (
                      <tr key={item.invoice_id}>
                        <td>{item.invoice_id}</td>
                        <td>{item.invoice_name}</td>
                        <td>{selectedPatient.name}</td>
                        <td>{formatCurrency(item.invoice_total)}</td>
                        <td>
                          <button
                            className={getStatusClass(item.invoice_status)}
                          >
                            {item.invoice_status}
                          </button>
                        </td>
                        <td>
                          {new Date(item.invoice_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <AddEstimateModal
          isOpen={isModalOpen}
          onClose={closeModal}
          estimateToEdit={estimateToEdit}
        />
      </div>
    </div>
  );
};

export default Financial;
