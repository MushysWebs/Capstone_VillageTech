import React, { useState, useEffect } from 'react';
import './AddEstimateModal.css';
import { supabase } from '../routes/supabaseClient';

const AddEstimateModal = ({ selectedPatientId, isOpen, onClose, onAddEstimate, estimateToEdit }) => {
    const [patientId, setPatientId] = useState(selectedPatientId);
    const [formData, setFormData] = useState({
        invoice_name: '',
        invoice_total: '0',
        invoice_paid: '0',
        invoice_date: '',
        invoice_status: 'Estimate', // Default status set to "Estimate"
    });
    const [error, setError] = useState('');

    useEffect(() => {
        setPatientId(selectedPatientId);
        // Set status to "Estimate" when the modal opens for a new estimate
        setFormData((prevData) => ({
            ...prevData,
            invoice_status: 'Estimate', // Reset status to "Estimate" for new estimate
        }));
    }, [selectedPatientId, isOpen]); // Ensure effect runs when modal opens

    useEffect(() => {
        if (estimateToEdit) {
            setFormData({
                invoice_name: estimateToEdit.invoice_name,
                invoice_total: estimateToEdit.invoice_total,
                invoice_paid: estimateToEdit.invoice_paid,
                invoice_date: estimateToEdit.invoice_date,
                invoice_status: estimateToEdit.invoice_status,
            });
            setPatientId(estimateToEdit.patient_id);
        } else {
            setFormData({
                invoice_name: '',
                invoice_total: '',
                invoice_paid: '',
                invoice_date: '',
                invoice_status: 'Estimate', // Reset status to "Estimate" for new estimates
            });
        }
    }, [estimateToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.invoice_total || isNaN(Number(formData.invoice_total))) {
            setError('Invoice total must be a valid number.');
            return;
        }

        // Construct the data to send to Supabase
        const invoiceData = {
            invoice_name: formData.invoice_name,
            patient_id: patientId,
            invoice_total: Number(formData.invoice_total),
            invoice_paid: Number(formData.invoice_paid) || 0,
            invoice_date: formData.invoice_date,
            invoice_status: formData.invoice_status, // Use status set in the formData
            last_update: new Date().toISOString(),
        };

        try {
            const { data, error: insertError } = await supabase
                .from('invoices')
                .insert([invoiceData]);

            if (insertError) throw insertError;

            console.log('Invoice added:', data);
            onAddEstimate(data);
            onClose();
        } catch (error) {
            console.error('Error adding invoice:', error);
            setError('Failed to add estimate. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{estimateToEdit ? 'Edit Estimate' : 'Add Estimate'}</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    {/* Removed Invoice ID input field */}
                    <div className="form-group">
                        <label>Invoice Name</label>
                        <input
                            type="text"
                            name="invoice_name"
                            value={formData.invoice_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Patient ID</label>
                        <input
                            type="text"
                            name="patient_id"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            readOnly
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Invoice Total</label>
                        <input
                            type="number"
                            step="0.01"
                            name="invoice_total"
                            value={formData.invoice_total}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="invoice_date"
                            value={formData.invoice_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* Status is now fixed to "Estimate" */}
                    <div className="form-group">
                        <label>Status</label>
                        <input
                            type="text"
                            name="invoice_status"
                            value={formData.invoice_status} // Use the fixed value
                            readOnly
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        {estimateToEdit ? 'Save Changes' : 'Add Estimate'}
                    </button>
                    <button type="button" className="close-button" onClick={onClose}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEstimateModal;
