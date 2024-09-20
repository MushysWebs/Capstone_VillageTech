import React, { useState, useEffect } from 'react';
import './AddEstimateModal.css';
import { supabase } from '../routes/supabaseClient';

const AddEstimateModal = ({ isOpen, onClose, onAddEstimate, estimateToEdit }) => {
    const [formData, setFormData] = useState({
        financial_number: '',
        financial_name: '',
        financial_patient: '',
        financial_lowtotal: '',
        financial_hightotal: '',
        financial_deposit: '',
        financial_date: '',
        financial_status: 'Estimate', // Default status for new estimates
        financial_lastupdate: new Date().toISOString()
    });

    const [error, setError] = useState(null);

    useEffect(() => {
        if (estimateToEdit) {
            setFormData({
                financial_number: estimateToEdit.financial_number || '',
                financial_name: estimateToEdit.financial_name || '',
                financial_patient: estimateToEdit.financial_patient || '',
                financial_lowtotal: estimateToEdit.financial_lowtotal || '',
                financial_hightotal: estimateToEdit.financial_hightotal || '',
                financial_deposit: estimateToEdit.financial_deposit || '',
                financial_date: estimateToEdit.financial_date || '',
                financial_status: estimateToEdit.financial_status || 'Estimate', // Keep status if editing
                financial_lastupdate: new Date().toISOString(),
            });
        } else {
            setFormData({
                financial_number: '',
                financial_name: '',
                financial_patient: '',
                financial_lowtotal: '',
                financial_hightotal: '',
                financial_deposit: '',
                financial_date: '',
                financial_status: 'Estimate', // Default status for new estimates
                financial_lastupdate: new Date().toISOString()
            });
        }
    }, [estimateToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.financial_date) {
            const today = new Date().toISOString().split('T')[0];
            formData.financial_date = today;
        }

        try {
            let response;
            if (estimateToEdit) {
                response = await supabase
                    .from('financial')
                    .update(formData)
                    .eq('financial_number', formData.financial_number);
            } else {
                response = await supabase
                    .from('financial')
                    .insert([formData]);
            }

            if (response.error) {
                console.error('Error saving financial data:', response.error);
                throw response.error;
            }

            onAddEstimate(formData); // Update the parent component's state
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error saving estimate:', error);
            setError(`An error occurred while saving the estimate: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{estimateToEdit ? 'Edit Estimate' : 'Add Estimate'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Financial Number</label>
                        <input
                            type="text"
                            name="financial_number"
                            value={formData.financial_number}
                            onChange={handleChange}
                            required
                            readOnly={!!estimateToEdit}
                        />
                    </div>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="financial_name"
                            value={formData.financial_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Patient</label>
                        <input
                            type="text"
                            name="financial_patient"
                            value={formData.financial_patient}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Low Total</label>
                        <input
                            type="number"
                            step="0.01"
                            name="financial_lowtotal"
                            value={formData.financial_lowtotal}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>High Total</label>
                        <input
                            type="number"
                            step="0.01"
                            name="financial_hightotal"
                            value={formData.financial_hightotal}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Deposit</label>
                        <input
                            type="number"
                            step="0.01"
                            name="financial_deposit"
                            value={formData.financial_deposit}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="financial_date"
                            value={formData.financial_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select
                            name="financial_status"
                            value={formData.financial_status}
                            onChange={handleChange}
                        >
                            <option value="Estimate">Estimate</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Canceled</option>
                        </select>
                    </div>
                    {error && <p className="error-message">{error}</p>}
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
