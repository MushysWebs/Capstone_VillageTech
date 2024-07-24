import React, { useState } from 'react';
import axios from 'axios';
import './AddStaffModal.css';

const AddStaffModal = ({ isOpen, onClose, onAddStaff }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // State for messages

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked");
    console.log("Username:", username);
    console.log("Password:", password);

    try {
      const response = await axios.post('http://localhost:3007/api/v1/register', {
        username,
        password
      });

      if (response.data.status === 'success') {
        setMessage('Staff added successfully');
        console.log("Staff added successfully:", response.data.data);
        onAddStaff(response.data.data); // Notify parent component of the new staff
        setUsername('');
        setPassword('');
        setTimeout(() => onClose(), 2000); // Close the modal after a short delay
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setMessage(error.response.data.message); // Show error message from server
      } else {
        setMessage('An error occurred. Please try again.'); // Fallback error message
      }
      console.error('Error adding staff:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Staff Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">Add</button>
          <button type="button" className="close-button" onClick={onClose}>Cancel</button>
        </form>
        {message && <p className="message">{message}</p>} {/* Display the message */}
      </div>
    </div>
  );
};

export default AddStaffModal;
