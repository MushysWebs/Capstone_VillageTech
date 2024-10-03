import React from "react";
import './SOC.css';
import PatientSidebar from "../../../components/patientSideBar/PatientSidebar";

const SOC = () => {
    return (
        <div className="SOC_container">
            <PatientSidebar />

            {/* Standard of Care Section */}
            <div className="standard-of-care">
                <h2>+ Standard Of Care</h2>

                <div className="soc-table">
                    {/* Row 1 */}
                    <div className="soc-row">
                        <div className="soc-item">Annual Health Check</div>
                        <div className="soc-importance required">Required</div>
                        <div className="soc-fulfilled">25-07-2024</div>
                        <div className="soc-next-due">01-04-2025</div>
                    </div>
                    
                    {/* Row 2 */}
                    <div className="soc-row">
                        <div className="soc-item">DA2PP</div>
                        <div className="soc-importance core">Core</div>
                        <div className="soc-fulfilled">15-04-2025</div>
                        <div className="soc-next-due">TBD</div>
                    </div>
                    
                    {/* Additional rows can be added similarly */}
                </div>
            </div>

            {/* Comments Section */}
            <div className="comments-section">
                <h2>+ Comments (1)</h2>
                <div className="comment">
                    <p>Annual Health Check next due date moved to 01-04-2025</p>
                    <div className="comment-meta">
                        <span>Public</span>
                        <span>28-05-2024</span>
                        <span>Edward Ling</span>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default SOC;