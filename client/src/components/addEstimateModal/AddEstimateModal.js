import React, { useState, useEffect } from 'react';
import './AddEstimateModal.css';
import { supabase } from '../routes/supabaseClient';

const AddEstimateModal = ({ selectedPatientId, isOpen, onClose, onAddEstimate, estimateToEdit }) => {
    const [patientId, setPatientId] = useState(selectedPatientId);
    const [formData, setFormData] = useState({
        invoice_id: '',          // Adding invoice_id to the formData
        invoice_name: '',
        invoice_total: '0',
        invoice_paid: '0',
        invoice_date: '',
        invoice_status: 'Estimate', // Default status set to "Estimate"
    });
    const [error, setError] = useState('');

    useEffect(() => {
        setPatientId(selectedPatientId);
        setFormData((prevData) => ({
            ...prevData,
            invoice_status: 'Estimate',
        }));
    }, [selectedPatientId, isOpen]);

    useEffect(() => {
        if (estimateToEdit) {
            setFormData({
                invoice_id: estimateToEdit.invoice_id,  // Set invoice_id if editing
                invoice_name: estimateToEdit.invoice_name,
                invoice_total: estimateToEdit.invoice_total,
                invoice_paid: estimateToEdit.invoice_paid,
                invoice_date: estimateToEdit.invoice_date,
                invoice_status: estimateToEdit.invoice_status,
            });
            setPatientId(estimateToEdit.patient_id);
        } else {
            setFormData({
                invoice_id: '',  // Clear invoice_id for new estimates
                invoice_name: '',
                invoice_total: '',
                invoice_paid: '',
                invoice_date: '',
                invoice_status: 'Estimate',
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
            invoice_status: formData.invoice_status,
            last_update: new Date().toISOString(),
        };
    
        // If editing, include invoice_id
        if (formData.invoice_id) {
            invoiceData.invoice_id = formData.invoice_id; // Include only if editing
        }
    
        // Call onAddEstimate and wait for it to finish
        await onAddEstimate(invoiceData); // Ensure this returns a promise if you're using async/await
    
        // Reset form data after submission
        setFormData({
            invoice_id: '', // Reset for new estimate
            invoice_name: '',
            invoice_total: '0',
            invoice_paid: '0',
            invoice_date: '',
            invoice_status: 'Estimate', // Reset status to default
        });
        setPatientId(selectedPatientId); // Reset patientId if needed
        onClose(); // Close the modal
    };
    

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{estimateToEdit ? 'Edit Estimate' : 'Add Estimate'}</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    {/* Display Invoice ID if editing an existing invoice */}
                    {formData.invoice_id && (
                        <div className="form-group">
                            <label>Invoice ID</label>
                            <input
                                className="read-only-estimate"
                                type="text"
                                name="invoice_id"
                                value={formData.invoice_id}
                                readOnly
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Invoice Name*</label>
                        <input
                            type="text"
                            name="invoice_name"
                            value={formData.invoice_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Patient ID*</label>
                        <input
                            className="read-only-estimate"
                            type="text"
                            name="patient_id"
                            value={patientId}
                            readOnly
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Invoice Total*</label>
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
                        <label>Date*</label>
                        <input
                            type="date"
                            name="invoice_date"
                            value={formData.invoice_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group" >
                        <label>Status*</label>
                        <input
                            className="read-only-estimate"
                            type="text"
                            name="invoice_status"
                            value={formData.invoice_status}
                            readOnly
                        />
                    </div>
                    <div className='estimate-modal-button'>
                    <button type="submit" className="submit-button">
                        {estimateToEdit ? 'Save Changes' : 'Add Estimate'}
                    </button>
                    <button type="button" className="close-button" onClick={onClose}>
                        Cancel
                    </button>
                    </div>
                    
                </form>
            </div>
        </div>
    );
};

export default AddEstimateModal;
