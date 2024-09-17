import { useState, useEffect } from 'react';
import { supabase } from '../../../components/routes/supabaseClient';
import { Link } from "react-router-dom";
import './Financial.css';
import AddEstimateModal from '../../../components/addEstimateModal/AddEstimateModal';

const Financial = () => {
    const [financialData, setFinancialData] = useState([]);
    const [isModalOpen, setIsModalOpen, onAddEstimate] = useState(false);
    
    

    // Fetch financial data from Supabase
    useEffect(() => {
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

        fetchFinancialData();
    }, []);

    const openModal = () => {
        setIsModalOpen(true);
      };
    
      const closeModal = () => {
        setIsModalOpen(false);
      };

    return (
        <div className="patient-main">
            <header className="patient-header">
                <div className="patient-tabs">
                    <Link to="/patient/clinical" className="tab-button">Clinical</Link>
                    <Link to="/patient/soc" className="tab-button">S.O.C.</Link>
                    <Link to="/Financial" className="tab-button">Financial</Link>
                    <Link to="/patient/summaries" className="tab-button">Summaries</Link>
                    <Link to="/patient/healthStatus" className="tab-button">Health Status</Link>
                    <Link to="/patient/medication" className="tab-button">Medication</Link>
                    <Link to="/newPatient" className="tab-button">New Patient</Link>
                </div>
            </header>
            <div>
                <h1>Financial</h1>
            </div>

            <main>
                <div className='invoices-section'>
                    <div className='invoice-header-container'>
                        <button onClick={openModal}>+</button>
                        <h2>Estimates</h2>
                    </div>

                    <div>
                        <table className="invoices-table">
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
                                </tr>
                            </thead>
                            <tbody>
                                {financialData.map((item) => (
                                    <tr key={item.financial_number}>
                                        <td>{item.financial_number}</td>
                                        <td>{item.financial_name}</td>
                                        <td>{item.financial_patient}</td>
                                        <td>{item.financial_lowtotal}</td>
                                        <td>{item.financial_hightotal}</td>
                                        <td>{item.financial_deposit}</td>
                                        <td>{new Date(item.financial_date).toLocaleDateString()}</td>
                                        <td>{item.financial_status}</td>
                                        <td>{new Date(item.financial_lastupdate).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h2>Pending Invoices</h2>
                    <div>
                        Pending Invoices
                    </div>
                </div>
                <div>
                    <h2>Completed</h2>
                    <div>
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
                                {/* Render completed invoices here */}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Render the modal outside the main content */}
            <AddEstimateModal
  isOpen={isModalOpen}
  onClose={closeModal}
  onAddEstimate={(estimate) => {
    // Handle the new estimate here
    // For example, update state or refresh data
    setFinancialData(prevData => [...prevData, estimate]);
  }}
/>

        </div>
    );
};

export default Financial;
