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
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validatePhone = (phone) => {
    if (!phone) return true; 
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const validateName = (name) => {
    return /^[a-zA-Z\s-]{1,50}$/.test(name);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8 
  };

  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
      case 'last_name':
        return validateName(value) ? '' : `${name === 'first_name' ? 'First' : 'Last'} name can only contain letters, spaces, and hyphens`;
      
      case 'email':
        return validateEmail(value) ? '' : 'Please enter a valid email address';
      
      case 'phone':
        return validatePhone(value) ? '' : 'Please enter a valid 10-digit phone number';
      
      case 'secondary_phone':
        return !value || validatePhone(value) ? '' : 'Please enter a valid 10-digit phone number';
      
      case 'password':
        return validatePassword(value) ? '' : 'Password must be at least 8 characters';
      
      case 'confirmPassword':
        return value === formData.password ? '' : 'Passwords do not match';
      
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'phone' || name === 'secondary_phone') {
      processedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    if (touched[name]) {
      const error = validateField(name, processedValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;

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

        const { error: insertError } = await supabase
          .from('staff')
          .insert([staffData]);

        if (insertError) throw insertError;

        onAddStaff(staffData);
        onClose();
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message }));
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
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              maxLength={50}
              className={errors.first_name && touched.first_name ? 'error' : ''}
            />
            {touched.first_name && errors.first_name && 
              <div className="field-error">{errors.first_name}</div>}
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              maxLength={50}
              className={errors.last_name && touched.last_name ? 'error' : ''}
            />
            {touched.last_name && errors.last_name && 
              <div className="field-error">{errors.last_name}</div>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={errors.email && touched.email ? 'error' : ''}
            />
            {touched.email && errors.email && 
              <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              minLength={8}
              className={errors.password && touched.password ? 'error' : ''}
            />
            {touched.password && errors.password && 
              <div className="field-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={errors.confirmPassword && touched.confirmPassword ? 'error' : ''}
            />
            {touched.confirmPassword && errors.confirmPassword && 
              <div className="field-error">{errors.confirmPassword}</div>}
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              maxLength={12}
              placeholder="XXX-XXX-XXXX"
              className={errors.phone && touched.phone ? 'error' : ''}
            />
            {touched.phone && errors.phone && 
              <div className="field-error">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label>Secondary Phone (Optional)</label>
            <input
              type="tel"
              name="secondary_phone"
              value={formData.secondary_phone}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={12}
              placeholder="XXX-XXX-XXXX"
              className={errors.secondary_phone && touched.secondary_phone ? 'error' : ''}
            />
            {touched.secondary_phone && errors.secondary_phone && 
              <div className="field-error">{errors.secondary_phone}</div>}
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Veterinarian">Veterinarian</option>
              <option value="Vet Tech">Vet Tech</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Hire Date</label>
            <input
              type="date"
              name="hire_date"
              value={formData.hire_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              placeholder="Enter staff member's address"
            />
          </div>

          <div className="form-group">
            <label>Emergency Contact</label>
            <textarea
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              placeholder="Enter emergency contact details"
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              placeholder="Enter any additional notes"
            />
          </div>

          <div className="error-submit-cancel">
            {errors.submit && <p className="error-message">{errors.submit}</p>}
            <div className="button-container">
              <button type="submit" className="submit-button">
                Add Staff Member
              </button>
              <button type="button" className="close-button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;