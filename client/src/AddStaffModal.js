import React, { useState } from 'react';
import './AddStaffModal.css';
import { supabase } from './supabaseClient';

const AddStaffModal = ({ isOpen, onClose, onAddStaff }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    secondary_phone: '',
    fax: '',
    landline: '',
    role: 'Veterinarian',
    hire_date: '',
    status: 'Active',
    specialty: '',
    address: '',
    emergency_contact: '',
    notes: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session. Please log in again.');
      }

      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          email_confirm: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to create user');
      }

      const userData = await response.json();

      if (userData && userData.id) {
        const staffData = {
          user_id: userData.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          secondary_phone: formData.secondary_phone,
          fax: formData.fax,
          landline: formData.landline,
          role: formData.role,
          hire_date: formData.hire_date,
          status: formData.status,
          address: formData.address,
          emergency_contact: formData.emergency_contact,
          notes: formData.notes
        };
  
        const { data: insertData, error: insertError } = await supabase
          .from('staff')
          .insert([staffData]);
  
        if (insertError) {
          console.error('Staff data insertion error:', insertError);
          throw insertError;
        }
  
        console.log('Staff data inserted successfully:', insertData);
        onAddStaff(staffData);
        onClose();
      } else {
        throw new Error('User creation succeeded but user data is missing');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      setError(`An error occurred while adding the staff member: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Staff Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Secondary Phone</label>
            <input type="tel" name="secondary_phone" value={formData.secondary_phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Fax</label>
            <input type="tel" name="fax" value={formData.fax} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Landline</label>
            <input type="tel" name="landline" value={formData.landline} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="Veterinarian">Veterinarian</option>
              <option value="Vet Tech">Vet Tech</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Hire Date</label>
            <input type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange}></textarea>
          </div>
          <div className="form-group">
            <label>Emergency Contact</label>
            <textarea name="emergency_contact" value={formData.emergency_contact} onChange={handleChange}></textarea>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange}></textarea>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button">Add Staff</button>
          <button type="button" className="close-button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;