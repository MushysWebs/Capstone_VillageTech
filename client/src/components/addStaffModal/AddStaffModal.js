import React, { useState } from 'react';
import './AddStaffModal.css';
import { supabase } from '../routes/supabaseClient';

const AddStaffModal = ({ isOpen, onClose, onAddStaff }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    secondary_phone: '',
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
  
    if (name === 'first_name' || name === 'last_name') {
      const namePattern = /^[a-zA-Z\s-]+$/;
      if (!namePattern.test(value)) {
        setError(`${name === 'first_name' ? 'First' : 'Last'} name can only contain letters, spaces, and hyphens.`);
        return;
      } else {
        setError(null);
      }
    }
  
    if (name === 'phone' || name === 'secondary_phone') {
      // Remove any non-numeric characters
      const cleaned = value.replace(/\D/g, '');
  
      // Format the number as ###-###-####
      const formatted = cleaned
        .slice(0, 10) // Limit to 10 digits
        .replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  
      setFormData(prevData => ({ ...prevData, [name]: formatted }));
  
      // Validate formatted phone number
      if (cleaned.length === 10) {
        setError(null);
      } else {
        setError('Phone number must be in the format ###-###-####.');
      }
      return;
    }
  
    // Set other fields without validation changes
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        console.error('User signup error:', signUpError);
        setError(`An error occurred: ${signUpError.message}`);
        return;
      }

      if (authData && authData.user) {
        const staffData = {
          user_id: authData.user.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          secondary_phone: formData.secondary_phone,
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
          setError(`An error occurred: ${insertError.message}`);
          return;
        }

        console.log('Staff data inserted successfully:', insertData);
        onAddStaff(staffData);
        onClose();
        await supabase.auth.signOut();
      } else {
        setError('User creation succeeded but user data is missing.');
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
          <div className='error-submit-cancel'>
            {error && <p className="error-message">{error}</p>}
            <div className='button-container'>
              <button type="submit" className="submit-button">Add Staff</button>
              <button type="button" className="close-button" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
