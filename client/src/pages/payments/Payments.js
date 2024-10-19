import React, { useState, useEffect } from "react";
import { useSupabaseClient } from '@supabase/auth-helpers-react'; 
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PatientSidebar from "../../components/patientSidebar/PatientSidebar";
import PatientTabs from "../../components/PatientTabs";
import { usePatient } from '../../context/PatientContext';
import './Payments.css';

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
    return value.toLocaleString('en-CA', {
      style: 'currency',
      currency: 'CAD',
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
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
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
        setSelectedInvoice(null);
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
      setError('Stripe has not loaded yet.');
      setLoading(false);
      return;
    }
  
    const cardElement = elements.getElement(CardElement);
  
    try {
      console.log("Creating payment intent...");

      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create_payment_intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: selectedInvoice.invoice_total * 100,
          currency: 'cad',
        }),
      });

      const paymentIntentData = await response.json();

      console.log("Payment intent response:", paymentIntentData);

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


      console.log("Stripe payment result:", paymentResult);
  
      if (paymentResult.error) {
        setError(paymentResult.error.message);
        setLoading(false);
      } else if (paymentResult.paymentIntent && paymentResult.paymentIntent.status === 'succeeded') {
        const { error: updateError } = await supabase
          .from("invoices")
          .update({ stripe_payment_intent: paymentIntentData.id })
          .eq("invoice_id", selectedInvoice.invoice_id);

        if (updateError) {
          setError(updateError.message);
        } else {
          setSuccess(true);
          markAsPaid();
        }
      } else {
        setError('Payment failed.');
      }
    } catch (error) {
      console.error("Error during payment processing:", error);
      setError('An error occurred during payment processing.');
    } finally {
      setLoading(false);
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
            <h2 className="payments-h2">Payment Options for Invoice #{selectedInvoice.invoice_id}</h2>
            <div className="payment-options">
              <button onClick={() => handlePaymentMethodChange("cash")}>
                Pay with Cash
              </button>
              <button onClick={() => handlePaymentMethodChange("card")}>
                Pay with Card
              </button>
            </div>
  
            {paymentMethod === "card" && (
              <form onSubmit={handleSubmit}>
                <CardElement options={{ hidePostalCode: true }} />
                <button type="submit" disabled={!stripe || loading}>
                  {loading ? 'Processing...' : `Pay ${formatCurrency(selectedInvoice.invoice_total)}`}
                </button>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Payment successful!</div>}
              </form>
            )}
  
            {paymentMethod === "cash" && (
              <div>
                <button onClick={markAsPaid}>Mark as Paid</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};  
export default Payments;
