import React, { useState } from 'react';
import './AddStaffModal.css';
import { supabase } from './supabaseClient';

const AddStaffModal = ({ isOpen, onClose, onAddStaff }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Veterinarian');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) throw signUpError;

      if (data && data.user) {
        const { error: insertError } = await supabase
          .from('staff')
          .insert([
            { username, name, email, phone, role, user_id: data.user.id }
          ]);

        if (insertError) throw insertError;

        onAddStaff({ username, name, email, phone, role, user_id: data.user.id });
        onClose();
      } else {
        throw new Error('User creation failed');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      setError('An error occurred while adding the staff member');
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
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="Veterinarian">Veterinarian</option>
              <option value="Vet Tech">Vet Tech</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button">Add</button>
          <button type="button" className="close-button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
