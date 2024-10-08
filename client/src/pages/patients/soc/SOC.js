import React, { useState } from "react";
import './SOC.css';
import PatientSidebar from "../../../components/patientSideBar/PatientSidebar";

// Modal Component for Standard of Care
const SOCModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Standard of Care Data</h2>
        {/* Add your form inputs for SOC data */}
        <form>
          <label>
            Treatment:
            <input type="text" name="treatment" />
          </label>
          <label>
            Importance:
            <input type="text" name="importance" />
          </label>
          <label>
            Fulfilled At:
            <input type="text" name="fulfilledAt" />
          </label>
          <label>
            Next Due:
            <input type="date" name="nextDue" />
          </label>
          <div className="modal-actions">
            <button type="submit">Add SOC Data</button>
            <button onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Component for Comments
const CommentsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Comment</h2>
        {/* Add your form inputs for Comments */}
        <form>
          <label>
            Comment:
            <textarea name="comment" />
          </label>
          <label>
            Public:
            <input type="checkbox" name="public" />
          </label>
          <label>
            Date Created:
            <input type="date" name="dateCreated" />
          </label>
          <div className="modal-actions">
            <button type="submit">Add Comment</button>
            <button onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SOC = () => {
  // Modal visibility states
  const [isSOCModalOpen, setIsSOCModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  // Functions to open modals
  const openSOCModal = () => setIsSOCModalOpen(true);
  const openCommentsModal = () => setIsCommentsModalOpen(true);

  // Functions to close modals
  const closeSOCModal = () => setIsSOCModalOpen(false);
  const closeCommentsModal = () => setIsCommentsModalOpen(false);

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
            <div className="soc-column">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
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
            <div className="comments-column">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
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
