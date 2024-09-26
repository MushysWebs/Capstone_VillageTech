import { Link } from "react-router-dom";

const Summaries = () => {
    

    return (
        <div className="patient-main">
            <header className="patient-header">
                <div className="patient-tabs">
                    <Link to="/patient/clinical" className="tab-button">Clinical</Link>
                    <Link to="/patient/soc" className="tab-button">S.O.C.</Link>
                    <Link to="/Financial" className="tab-button">Financial</Link>
                    <Link to="/patient/summaries" className="tab-button">Summaries</Link>
                    <Link to="/healthStatus" className="tab-button">Health Status</Link>
                    <Link to="/Medication" className="tab-button">Medication</Link>
                    <Link to="/newPatient" className="tab-button">New Patient</Link>
                </div>
            </header>
        </div>

        
    )
};

export default Summaries;