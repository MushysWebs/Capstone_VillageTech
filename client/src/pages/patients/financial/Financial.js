import { useState, useEffect, useMemo } from "react";
import React from "react";
import { supabase } from "../../../components/routes/supabaseClient";
import { Link } from "react-router-dom";
import { usePatient } from "../../../context/PatientContext";
import "./Financial.css";
import PatientLayout from "../../../components/patientLayout/PatientLayout";
import AddEstimateModal from "../../../components/addEstimateModal/AddEstimateModal";

const Financial = ({ globalSearchTerm }) => {
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
            console.log("Fetched estimates:", data); 
            setEstimateData(data); 
        }
    }
};

const filterInvoices = (invoices, status, searchTerm) => {
  if (!invoices) return [];

  let filtered = invoices.filter(invoice => invoice.invoice_status === status);

  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filtered = filtered.filter(invoice => 
      invoice.invoice_id.toString().includes(search) ||
      invoice.invoice_name.toLowerCase().includes(search) ||
      selectedPatient.name.toLowerCase().includes(search) ||
      invoice.invoice_total.toString().includes(search) ||
      new Date(invoice.invoice_date).toLocaleDateString().toLowerCase().includes(search)
    );
  }

  return filtered;
};

const renderNoResults = (section) => (
  <tr>
    <td colSpan="9" className="no-results-message">
      No {section} found matching "{globalSearchTerm}"
    </td>
  </tr>
);

const filteredEstimates = useMemo(() => 
  filterInvoices(invoiceData, "Estimate", globalSearchTerm),
  [invoiceData, globalSearchTerm]
);

const filteredPendingInvoices = useMemo(() => 
  filterInvoices(invoiceData, "Pending", globalSearchTerm),
  [invoiceData, globalSearchTerm]
);

const filteredCompletedInvoices = useMemo(() => 
  filterInvoices(invoiceData, "Completed", globalSearchTerm),
  [invoiceData, globalSearchTerm]
);

const filteredCancelledInvoices = useMemo(() => 
  filterInvoices(invoiceData, "Cancelled", globalSearchTerm),
  [invoiceData, globalSearchTerm]
);


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
    console.log("Selected Patient:", selectedPatient);
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


  const handleAddEstimate = async (newEstimate) => {
    try {
        if (newEstimate.invoice_id) {
            // Update existing invoice if invoice_id is present
            const { data, error } = await supabase
                .from("invoices")
                .update({
                    invoice_name: newEstimate.invoice_name,
                    invoice_total: newEstimate.invoice_total,
                    invoice_paid: newEstimate.invoice_paid,
                    invoice_date: newEstimate.invoice_date,
                    invoice_status: newEstimate.invoice_status,
                    last_update: newEstimate.last_update,
                })
                .eq("invoice_id", newEstimate.invoice_id);

            if (error) {
                console.error("Error updating invoice:", error.message);
            } else {
                fetchInvoiceData(); // Refetch data after successful update
            }
        } else {
            // Insert new invoice if no invoice_id is present
            const { data, error } = await supabase
                .from("invoices")
                .insert([newEstimate]);

            if (error) {
                console.error("Error adding new invoice:", error.message);
            } else {
                fetchInvoiceData(); // Refetch data after successful addition
            }
        }
    } catch (error) {
        console.error("Error saving estimate:", error.message);
    } finally {
        closeModal();
    }
};






  const closeModal = () => {
    setIsModalOpen(false);
  };

  const convertEstimateToInvoice = async (estimate) => {
    const { error: insertError } = await supabase.from("invoices").insert({
      invoice_name: estimate.estimate_name,
      patient_id: selectedPatient.id,
      invoice_total: estimate.estimate_total,
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
    <PatientLayout globalSearchTerm={globalSearchTerm}>
      <div className="financial-page">
        <div className="estimate-section">
          <div className="estimate-header-container">
            <button onClick={openModal}>+</button>
            <h2 className="financial-h2">Estimates</h2>
          </div>
  
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
                {filteredEstimates.length > 0 ? (
                  filteredEstimates.map((item) => (
                    <tr key={item.invoice_id}>
                      <td>{item.invoice_id}</td>
                      <td>{item.invoice_name}</td>
                      <td>{selectedPatient.name}</td>
                      <td>{formatCurrency(item.invoice_total)}</td>
                      <td>
                        <button className={getStatusClass(item.invoice_status)}>
                          {item.invoice_status}
                        </button>
                      </td>
                      <td>{new Date(item.invoice_date).toLocaleDateString()}</td>
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
                          className="financial-pending"
                          onClick={() => updateInvoiceStatus(item, "Pending")}
                        >
                          Convert to Invoice
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
                  ))
                ) : (
                  globalSearchTerm && renderNoResults("estimates")
                )}
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
                {filteredPendingInvoices.length > 0 ? (
                  filteredPendingInvoices.map((item) => (
                    <tr key={item.invoice_id}>
                      <td>{item.invoice_id}</td>
                      <td>{item.invoice_name}</td>
                      <td>{selectedPatient.name}</td>
                      <td>{formatCurrency(item.invoice_total)}</td>
                      <td>
                        <button className={getStatusClass(item.invoice_status)}>
                          {item.invoice_status}
                        </button>
                      </td>
                      <td>{new Date(item.invoice_date).toLocaleDateString()}</td>
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
                          onClick={() => updateInvoiceStatus(item, "Completed")}
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
                  ))
                ) : (
                  globalSearchTerm && renderNoResults("pending invoices")
                )}
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
                {filteredCompletedInvoices.length > 0 ? (
                  filteredCompletedInvoices.map((item) => (
                    <tr key={item.invoice_id}>
                      <td>{item.invoice_id}</td>
                      <td>{item.invoice_name}</td>
                      <td>{selectedPatient.name}</td>
                      <td>{formatCurrency(item.invoice_total)}</td>
                      <td>
                        <button className={getStatusClass(item.invoice_status)}>
                          {item.invoice_status}
                        </button>
                      </td>
                      <td>{new Date(item.invoice_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  globalSearchTerm && renderNoResults("completed invoices")
                )}
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
                {filteredCancelledInvoices.length > 0 ? (
                  filteredCancelledInvoices.map((item) => (
                    <tr key={item.invoice_id}>
                      <td>{item.invoice_id}</td>
                      <td>{item.invoice_name}</td>
                      <td>{selectedPatient.name}</td>
                      <td>{formatCurrency(item.invoice_total)}</td>
                      <td>
                        <button className={getStatusClass(item.invoice_status)}>
                          {item.invoice_status}
                        </button>
                      </td>
                      <td>{new Date(item.invoice_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  globalSearchTerm && renderNoResults("cancelled invoices")
                )}
              </tbody>
            </table>
          </div>
        </div>
  
        <AddEstimateModal
          selectedPatientId={selectedPatient?.id}
          isOpen={isModalOpen}
          onClose={closeModal}
          onAddEstimate={handleAddEstimate}
          estimateToEdit={estimateToEdit}
        />
      </div>
    </PatientLayout>
  );
}

export default Financial;
