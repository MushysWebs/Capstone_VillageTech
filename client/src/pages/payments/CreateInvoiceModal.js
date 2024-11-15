import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import './CreateInvoiceModal.css';

const CreateInvoiceModal = ({ isOpen, onClose, selectedPatientId, onInvoiceCreated }) => {
  const [invoiceName, setInvoiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!invoiceName || !amount) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const newInvoice = {
        invoice_name: invoiceName,
        invoice_total: parseFloat(amount),
        invoice_paid: 0,
        patient_id: selectedPatientId,
        invoice_status: 'Pending',
        invoice_date: new Date().toISOString(),
        last_update: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('invoices')
        .insert([newInvoice])
        .select()
        .single();

      if (insertError) throw insertError;

      onInvoiceCreated(data);
      onClose();
      setInvoiceName('');
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-invoice-modal-overlay">
      <div className="create-invoice-modal-content">
        <div className="create-invoice-modal-header">
          <h2>Create New Invoice</h2>
          <button onClick={onClose} className="create-invoice-close-button">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="create-invoice-form-group">
            <label>Invoice Name</label>
            <input
              type="text"
              value={invoiceName}
              onChange={(e) => setInvoiceName(e.target.value)}
              placeholder="Enter invoice name"
              className="create-invoice-form-input"
              required
            />
          </div>
          
          <div className="create-invoice-form-group">
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              className="create-invoice-form-input"
              required
            />
          </div>

          {error && (
            <div className="create-invoice-error-message">
              {error}
            </div>
          )}

          <div className="create-invoice-modal-footer">
            <button 
              type="button" 
              onClick={onClose}
              className="create-invoice-cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="create-invoice-submit-button"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;