
import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import PatientSidebar from "../../components/patientSidebar/PatientSidebar";
import Receipt from "./Receipt";
import { usePatient } from "../../context/PatientContext";
import "./Payments.css";

const Payments = () => {
  const { selectedPatient } = usePatient();
  const [invoiceData, setInvoiceData] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const supabase = useSupabaseClient();
  const stripe = useStripe();
  const elements = useElements();

  const formatCurrency = (value) => {
    return value.toLocaleString("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    });
  };

  const fetchInvoiceData = async () => {
    if (selectedPatient) {
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("patient_id", selectedPatient.id)
          .eq("invoice_status", "Pending");

        if (error) throw error;
        setInvoiceData(data);
      } catch (err) {
        console.error("Error fetching invoice data:", err.message);
      }
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [selectedPatient, supabase]);

  const handleInvoiceSelect = (invoice) => {
    setSelectedInvoice(invoice);
    setSuccess(false);
    setPaymentMethod("");
  };

  const markAsPaid = async () => {
    if (selectedInvoice) {
      try {
        const { error } = await supabase
          .from("invoices")
          .update({ invoice_status: "Completed" })
          .eq("invoice_id", selectedInvoice.invoice_id);

        if (error) throw error;
        fetchInvoiceData();
      } catch (err) {
        console.error("Error marking invoice as paid:", err.message);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create_payment_intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount: selectedInvoice.invoice_total * 100,
            currency: "cad",
          }),
        }
      );

      const paymentIntentData = await response.json();

      if (paymentIntentData.error) {
        setError(paymentIntentData.error.message);
        setLoading(false);
        return;
      }

      const { client_secret } = paymentIntentData;

      const paymentResult = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message);
        setLoading(false);
      } else if (
        paymentResult.paymentIntent &&
        paymentResult.paymentIntent.status === "succeeded"
      ) {
        await markAsPaid();
        await generateAndSendReceipt();
        setSuccess(true);
      } else {
        setError("Payment failed.");
      }
    } catch (error) {
      console.error("Error during payment processing:", error);
      setError("An error occurred during payment processing.");
    } finally {
      setLoading(false);
    }
  };

 // Generate and Send Receipt (Upload PDF to Storage and Email Receipt)
const generateAndSendReceipt = async () => {
  try {
    // Generate PDF blob
    const pdfBlob = await pdf(
      <Receipt invoice={selectedInvoice} patient={selectedPatient} />
    ).toBlob();

    // Upload to Supabase (ensure Authorization header is included)
    const { data: pdfData, error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(`receipts/receipt_${selectedInvoice.invoice_id}.pdf`, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });
      console.log("Uploaded file path:", pdfData.path);

    if (uploadError) throw uploadError;

    const pdfUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/receipts/receipts/receipt_${selectedInvoice.invoice_id}.pdf`;


    await saveReceiptToDatabase(pdfUrl);
    await sendEmailReceipt(pdfUrl);
  } catch (err) {
    console.error("Error generating and sending receipt:", err.message);
  }
};


  const saveReceiptToDatabase = async (pdfUrl) => {
    try {
      const { data, error } = await supabase.from("receipts").insert({
        invoice_id: selectedInvoice?.invoice_id,
        patient_id: selectedPatient.id,
        receipt_total: selectedInvoice.invoice_total,
        receipt_pdf_url: pdfUrl,
      });

      if (error) throw error;
    } catch (err) {
      console.error("Error saving receipt to database:", err.message);
    }
  };

  const sendEmailReceipt = async (pdfUrl) => {
    try {
      
      const { data: ownerData, error: ownerError } = await supabase
        .from("owners")
        .select("email")
        .eq("id", selectedPatient.owner_id)
        .single();
  
      if (ownerError || !ownerData || !ownerData.email) {
        console.error("Owner email not found");
        return;
      }
      console.log("Constructed PDF URL:", pdfUrl);

      const ownerEmail = ownerData.email;
  
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-receipt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: ownerEmail,
            receiptData: { pdfUrl },
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to send email");
      }
  
      console.log("Receipt email sent successfully to:", ownerEmail);
    } catch (error) {
      console.error("Error sending email receipt:", error);
    }
  };
  
  
  

  return (
    <div className="payments-main">
      <PatientSidebar />
      <div className="payments-page">
        <div className="invoice-section">
          <h2 className="payments-h2">Pending Invoices</h2>
          <div className="table-container">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.map((item) => (
                  <tr key={item.invoice_id}>
                    <td>{item.invoice_id}</td>
                    <td>{item.invoice_name}</td>
                    <td>{formatCurrency(item.invoice_total)}</td>
                    <td>{new Date(item.invoice_date).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="select-button"
                        onClick={() => handleInvoiceSelect(item)}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedInvoice && (
          <div className="payment-method-section">
            {!success && (
              <>
                <h2 className="payments-h2">
                  Payment Options for Invoice #{selectedInvoice.invoice_id}
                </h2>
                <div className="payment-options">
                  <button onClick={() => setPaymentMethod("cash")}>
                    Pay with Cash
                  </button>
                  <button onClick={() => setPaymentMethod("card")}>
                    Pay with Card
                  </button>
                </div>

                {paymentMethod === "card" && (
                  <form onSubmit={handleSubmit}>
                    <CardElement options={{ hidePostalCode: true }} />
                    <button type="submit" disabled={!stripe || loading}>
                      {loading
                        ? "Processing..."
                        : `Pay ${formatCurrency(
                            selectedInvoice.invoice_total
                          )}`}
                    </button>
                    {error && <div className="error-message">{error}</div>}
                  </form>
                )}

                {paymentMethod === "cash" && (
                  <div>
                    <button onClick={markAsPaid}>Mark as Paid</button>
                  </div>
                )}
              </>
            )}

            {success && (
              <div className="payment-success">
                <h2 className="success-message" style={{ color: "green" }}>
                  Payment Successful!
                </h2>
                <div className="checkmark">✔️</div>

                {selectedInvoice && selectedPatient ? (
                  <PDFDownloadLink
                    document={
                      <Receipt invoice={selectedInvoice} patient={selectedPatient} />
                    }
                    fileName={`Receipt_Invoice_${selectedInvoice?.invoice_id}.pdf`}
                  >
                    {({ loading }) =>
                      loading ? "Generating receipt..." : "Download Receipt"
                    }
                  </PDFDownloadLink>
                ) : (
                  <p>Loading receipt...</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;



