import React, { useState, useEffect } from "react";
import PatientSidebar from "../../../components/patientSideBar/PatientSidebar"; // Import PatientSidebar component
import SOCModal from "./SOCModal";  // Import SOCModal component (Assuming it's in the same folder as SOC.js)
import CommentsModal from "./CommentsModal";  // Import CommentsModal component (Assuming it's in the same folder as SOC.js)
import './SOC.css';

const SOC = () => {
    const [socData, setSocData] = useState([
      { treatment: "Annual Health Check", importance: "Required", fulfilledAt: "25-07-2024", nextDue: "25-07-2025" },
      { treatment: "DA2PP", importance: "Core", fulfilledAt: "15-04-2024", nextDue: "15-04-2025" }
    ]);
  

  // Functions to open modals
  const [isSOCModalOpen, setIsSOCModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  const openSOCModal = () => setIsSOCModalOpen(true);
  const openCommentsModal = () => setIsCommentsModalOpen(true);
  const closeSOCModal = () => setIsSOCModalOpen(false);
  const closeCommentsModal = () => setIsCommentsModalOpen(false);

  // Simulate fetch for SOC data (replace with actual API call)
  useEffect(() => {
    // Here you can add a fetch call to your database
  }, []);

  return (
    <div className="SOC-main">
      <PatientSidebar />

      <div className="SOC-page">
        {/* Standard of Care Section */}
        <div className="standard-of-care">
          <div className="title">
            <button onClick={openSOCModal}>+</button> 
            <h2>Standard Of Care</h2>
          </div>

          <div className="soc-header">
            <div className="soc-treatment"> <p>Treatment</p></div>
            <div className="soc-importance"> <p>Importance</p></div>
            <div className="soc-fulfilled-at"> <p>Fulfilled At</p></div>
            <div className="soc-next-due"> <p>Next Due</p></div>
          </div>

          <div className="soc-table">
            {socData.map((item, index) => (
              <div className="soc-column" key={index}>
                <div>{item.treatment}</div>
                <div>{item.importance}</div>
                <div>{item.fulfilledAt}</div>
                <div>{item.nextDue}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <div className="title">
            <button onClick={openCommentsModal}>+</button> 
            <h2>Comments</h2>
          </div>

          <div className="comments-header">
            <div className="comment-title"> <p>Comment</p></div>
            <div className="comment-public"> <p>Public</p></div>
            <div className="comment-created"> <p>Date Created</p></div>
            <div className="comment-modified"> <p>Modified</p></div>
          </div>

          <div className="comments-table">
            {/* This will be similar to the SOC table, with a mapped list */}
          </div>
        </div>
      </div>

      {/* SOC Modal */}
      <SOCModal isOpen={isSOCModalOpen} onClose={closeSOCModal} />
      {/* Comments Modal */}
      <CommentsModal isOpen={isCommentsModalOpen} onClose={closeCommentsModal} />
    </div>
  );
};

export default SOC;
