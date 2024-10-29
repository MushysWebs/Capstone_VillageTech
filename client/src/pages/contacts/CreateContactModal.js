import React, { useState, useRef } from 'react';
import { X, Camera, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import './CreateContactModal.css';

const CreateContactModal = ({ isOpen, onClose, onCreateContact }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    secondary_phone_number: '',
    address: '',
    notes: '',
    profile_picture_url: null
  });
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);
  const supabase = useSupabaseClient();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `profile_pictures/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('contacts')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('contacts')
          .getPublicUrl(filePath);

        if (urlError) throw urlError;

        setProfilePicture(publicUrl);
        setFormData(prev => ({ ...prev, profile_picture_url: publicUrl }));
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Failed to upload profile picture. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('First name, last name, and email are required.');
      return;
    }

    try {
      await onCreateContact(formData);
      onClose();
    } catch (error) {
      setError('Failed to create contact. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="contacts-modal-overlay">
      <div className="contacts-modal-content new-contact-modal">
        <button className="modal-close-button" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <div className="profile-upload-container" onClick={() => fileInputRef.current.click()}>
            <img 
              src={profilePicture}
              alt="" 
              className="profile-preview"
            />
            <div className="profile-upload-overlay">
              <Camera size={24} />
              <span>Upload Photo</span>
            </div>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <div className="modal-title-section">
            <h2>Create New Contact</h2>
          </div>
        </div>
        
        {error && <div className="modal-error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="new-contact-form">
          <div className="form-grid">
            <div className="form-section">
              <div className="input-group">
                <User size={18} />
                <div className="name-inputs">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First Name *"
                    className="contact-input"
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last Name *"
                    className="contact-input"
                  />
                </div>
              </div>

              <div className="input-group">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email *"
                  className="contact-input"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="input-group">
                <Phone size={18} />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Primary Phone"
                  className="contact-input"
                />
              </div>

              <div className="input-group">
                <Phone size={18} />
                <input
                  type="tel"
                  name="secondary_phone_number"
                  value={formData.secondary_phone_number}
                  onChange={handleChange}
                  placeholder="Secondary Phone"
                  className="contact-input"
                />
              </div>
            </div>
          </div>

          <div className="full-width-inputs">
            <div className="input-group">
              <MapPin size={18} />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="contact-input"
              />
            </div>

            <div className="input-group">
              <FileText size={18} />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes"
                className="contact-input contact-textarea"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              <X size={18} />
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContactModal;