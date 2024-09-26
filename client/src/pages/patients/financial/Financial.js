import { useState, useEffect } from 'react';
import { supabase } from '../../../components/routes/supabaseClient';
import { Link } from "react-router-dom";
import './Financial.css';
import AddEstimateModal from '../../../components/addEstimateModal/AddEstimateModal';

const Financial = () => {
    const [financialData, setFinancialData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [estimateToEdit, setEstimateToEdit] = useState(null);

    const fetchFinancialData = async () => {
        const { data, error } = await supabase
            .from('financial')
            .select('*');

        if (error) {
            console.error('Error fetching financial data:', error.message);
        } else {
            console.log('Fetched data:', data);
            setFinancialData(data);
        }
    };

    useEffect(() => {
        fetchFinancialData();
    }, []);

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

    const handleSaveEstimate = async (newOrUpdatedEstimate) => {
        const { data, error } = await supabase
            .from('financial')
            .upsert(newOrUpdatedEstimate);

        if (error) {
            console.error('Error saving estimate:', error.message);
        } else {
            console.log('Estimate saved:', data);
            await fetchFinancialData();
        }
        closeModal();
    };

    const updateStatus = async (item, newStatus) => {
        const { data, error } = await supabase
            .from('financial')
            .update({ financial_status: newStatus })
            .eq('financial_number', item.financial_number);

        if (error) {
            console.error('Error updating status:', error.message);
        } else {
            await fetchFinancialData();
        }
    };

    // Format number as currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed':
                return 'status-completed';
            case 'Pending':
                return 'status-pending';
            case 'Cancelled':
                return 'status-cancelled';
            case 'Estimate':
                return 'status-estimate'; // Ensure this class is defined in your CSS
            default:
                return ''; // Return an empty string if no match is found
        }
    };

    return (
        <div className="patient-main">
            <header className="patient-header">
                <div className="patient-tabs">
                    <Link to="/patient/clinical" className="tab-button">Clinical</Link>
                    <Link to="/patient/soc" className="tab-button">S.O.C.</Link>
                    <Link to="/Financial" className="tab-button">Financial</Link>
                    <Link to="/summaries" className="tab-button">Summaries</Link>
                    <Link to="/healthStatus" className="tab-button">Health Status</Link>
                    <Link to="/patient/medication" className="tab-button">Medication</Link>
                    <Link to="/newPatient" className="tab-button">New Patient</Link>
                </div>
            </header>
            <div>
                <h1 className='financial-h1'>Financial</h1>
            </div>

            <main>
                <div className='estimate-section'>
                    <div className='estimate-header-container'>
                        <button onClick={openModal}>+</button>
                        <h2 className='financial-h2'>Estimates</h2>
                    </div>

                    <div className='table-container'>
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
                                    <th>Last Update</th>
                                    <th>Edit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financialData
                                    .filter(item => item.financial_status === "Estimate")
                                    .map((item) => (
                                        <tr key={item.financial_number}>
                                            <td>{item.financial_number}</td>
                                            <td>{item.financial_name}</td>
                                            <td>{item.financial_patient}</td>
                                            <td>{formatCurrency(item.financial_lowtotal)}</td>
                                            <td>{formatCurrency(item.financial_hightotal)}</td>
                                            <td>{formatCurrency(item.financial_deposit)}</td>
                                            <td>{new Date(item.financial_date).toLocaleDateString()}</td>
                                            <td>
                                                <button className={getStatusClass(item.financial_status)}>
                                                    {item.financial_status}
                                                </button>
                                            </td>
                                            <td>{new Date(item.financial_lastupdate).toLocaleString()}</td>
                                            <td>
                                                <button className='financial-edit-button' onClick={() => handleEditClick(item)}>Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className='estimate-section'>
                    <h2 className='financial-h2'>Pending Invoices</h2>
                    <div className='table-container'>
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
                                </tr>
                            </thead>
                            <tbody>
                                {financialData
                                    .filter(invoice => invoice.financial_status === "Pending")
                                    .map((item) => (
                                        <tr key={item.financial_number}>
                                            <td>{item.financial_number}</td>
                                            <td>{item.financial_name}</td>
                                            <td>{item.financial_patient}</td>
                                            <td>{formatCurrency(item.financial_hightotal)}</td>
                                            <td><button className={getStatusClass(item.financial_status)}>
                                                {item.financial_status}
                                            </button>
                                            </td>
                                            <td>{new Date(item.financial_date).toLocaleDateString()}</td>
                                            <td>
                                                <button className='financial-edit-button' onClick={() => handleEditClick(item)}>Edit</button>
                                            </td>
                                            <td>
                                                <button className='financial-complete' onClick={() => updateStatus(item, 'Completed')}>Complete</button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className='estimate-section'>
                    <h2 className='financial-h2'>Completed</h2>
                    <div className='table-container'>
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
                                {financialData
                                    .filter(invoice => invoice.financial_status === "Completed")
                                    .map((item) => (
                                        <tr key={item.financial_number}>
                                            <td>{item.financial_number}</td>
                                            <td>{item.financial_name}</td>
                                            <td>{item.financial_patient}</td>
                                            <td>{formatCurrency(item.financial_hightotal)}</td>
                                            <td><button className={getStatusClass(item.financial_status)}>
                                                {item.financial_status}
                                            </button>
                                            </td>
                                            <td>{new Date(item.financial_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className='estimate-section'>
                    <h2 className='financial-h2'>Cancelled</h2>
                    <div className='table-container'>
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
                                {financialData
                                    .filter(invoice => invoice.financial_status === "Cancelled")
                                    .map((item) => (
                                        <tr key={item.financial_number}>
                                            <td>{item.financial_number}</td>
                                            <td>{item.financial_name}</td>
                                            <td>{item.financial_patient}</td>
                                            <td>{formatCurrency(item.financial_hightotal)}</td>
                                            <td><button className={getStatusClass(item.financial_status)}>
                                                {item.financial_status}
                                            </button>
                                            </td>
                                            <td>{new Date(item.financial_date).toLocaleDateString()}</td>
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
                onAddEstimate={handleSaveEstimate}
                estimateToEdit={estimateToEdit}
            />
        </div>
    );
};

export default Financial;
