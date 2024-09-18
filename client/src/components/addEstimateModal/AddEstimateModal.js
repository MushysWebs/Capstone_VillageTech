import React, { useState } from 'react';
import './AddEstimateModal.css';
import { supabase } from '../routes/supabaseClient';

const AddEstimateModal = ({ isOpen, onClose, onAddEstimate }) => {
    const [formData, setFormData] = useState({
        financial_number: '',
        financial_name: '',
        financial_patient: '',
        financial_lowtotal: '',
        financial_hightotal: '',
        financial_deposit: '',
        financial_date: '',
        financial_status: 'Pending', // Default status
        financial_lastupdate: new Date().toISOString()
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Insert financial data into Supabase
            const { data, error: insertError } = await supabase
                .from('financial')
                .insert([formData]);

            if (insertError) {
                console.error('Error inserting financial data:', insertError);
                throw insertError;
            }

            console.log('Financial data inserted successfully:', data);
            onAddEstimate(formData);
            onClose();
        } catch (error) {
            console.error('Error adding estimate:', error);
            setError(`An error occurred while adding the estimate: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add Estimate</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Financial Number</label>
                        <input type="text" name="financial_number" value={formData.financial_number} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="financial_name" value={formData.financial_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Patient</label>
                        <input type="text" name="financial_patient" value={formData.financial_patient} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Low Total</label>
                        <input type="number" step="0.01" name="financial_lowtotal" value={formData.financial_lowtotal} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>High Total</label>
                        <input type="number" step="0.01" name="financial_hightotal" value={formData.financial_hightotal} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Deposit</label>
                        <input type="number" step="0.01" name="financial_deposit" value={formData.financial_deposit} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" name="financial_date" value={formData.financial_date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select name="financial_status" value={formData.financial_status} onChange={handleChange}>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Canceled">Canceled</option>
                        </select>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-button">Add Estimate</button>
                    <button type="button" className="close-button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default AddEstimateModal;