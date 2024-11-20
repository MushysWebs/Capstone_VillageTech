import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { 
  Camera, Edit2, Save, X, Phone, Mail, MapPin, 
  Calendar, User, AlertCircle, Building
} from 'lucide-react';
import AuthGuard from '../../components/auth/AuthGuard';
import './Account.css';

const Account = () => {
  const [staffData, setStaffData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStaff, setEditedStaff] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchStaffData();
    }
  }, [session]);

  const fetchStaffData = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      
      setStaffData({
        ...data,
        full_name: `${data.first_name} ${data.last_name}`
      });
    } catch (error) {
      setError('Error fetching staff data. Please try again later.');
      console.error('Error fetching staff data:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedStaff({ ...staffData });
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedStaff(null);
    setProfilePicture(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      const { full_name, ...staffDataToUpdate } = editedStaff;

      const { data, error } = await supabase
        .from('staff')
        .update({
          ...staffDataToUpdate,
          photo_url: profilePicture || editedStaff.photo_url
        })
        .eq('id', editedStaff.id)
        .select();

      if (error) throw error;

      const updatedStaff = {
        ...data[0],
        full_name: `${data[0].first_name} ${data[0].last_name}`
      };

      setStaffData(updatedStaff);
      setIsEditing(false);
      setEditedStaff(null);
      setProfilePicture(null);
      setError(null);
    } catch (error) {
      setError('Error updating profile. Please try again.');
      console.error('Error updating staff member:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedStaff(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `staff_photos/${fileName}`;

        let { error: uploadError } = await supabase.storage
          .from('staff')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('staff')
          .getPublicUrl(filePath);

        if (urlError) throw urlError;

        setProfilePicture(publicUrl);
        setEditedStaff(prev => ({ ...prev, photo_url: publicUrl }));
      } catch (error) {
        setError('Error uploading profile picture. Please try again.');
        console.error('Error uploading file:', error);
      }
    }
  };

  if (!staffData) return null;

  const renderDetailItem = (icon, label, value, editField) => (
    <div className="acc-detail-item">
      {icon}
      <div className="acc-detail-content">
        <div className="acc-detail-label">{label}</div>
        {isEditing && editField ? editField : (
          <div className="acc-detail-value">{value || 'Not specified'}</div>
        )}
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="acc-container">
        <div className="acc-card">
          <div className="acc-header">
            <h1 className="acc-title">My Account</h1>
          </div>
          
          <div className="acc-content">
            <div className="acc-profile-section">
              <div className="acc-avatar-container" onClick={handleProfilePictureClick}>
                <img 
                  src={profilePicture || staffData.photo_url || "/floweronly.svg"} 
                  alt={staffData.full_name} 
                  className="acc-avatar" 
                />
                {isEditing && (
                  <div className="acc-avatar-overlay">
                    <Camera />
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  data-testid="profile-input"
                />
              </div>

              <div className="acc-profile-info">
                {isEditing ? (
                  <div className="acc-name-input-group">
                    <input
                      type="text"
                      name="first_name"
                      value={editedStaff.first_name || ''}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className="acc-input"
                    />
                    <input
                      type="text"
                      name="last_name"
                      value={editedStaff.last_name || ''}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className="acc-input"
                    />
                  </div>
                ) : (
                  <h2 className="acc-name">{staffData.full_name}</h2>
                )}
                
                <div className="acc-badge-container">
                  <span className="acc-role-badge">{staffData.role}</span>
                  <span className={`acc-status-badge ${staffData.status.toLowerCase()}`}>
                    {staffData.status}
                  </span>
                </div>
              </div>

              {!isEditing ? (
                <button className="acc-button acc-edit-button" onClick={handleEdit}>
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              ) : (
                <button className="acc-button acc-save-button" onClick={handleSave}>
                  <Save size={18} />
                  Save Changes
                </button>
              )}
            </div>

            <div className="acc-details-grid">
              {renderDetailItem(
                <Phone className="acc-detail-icon" />,
                "Primary Phone",
                staffData.phone,
                <input
                  type="tel"
                  name="phone"
                  value={editedStaff?.phone || ''}
                  onChange={handleInputChange}
                  placeholder="Primary Phone"
                  className="acc-input"
                />
              )}

              {renderDetailItem(
                <Phone className="acc-detail-icon" />,
                "Secondary Phone",
                staffData.secondary_phone,
                <input
                  type="tel"
                  name="secondary_phone"
                  value={editedStaff?.secondary_phone || ''}
                  onChange={handleInputChange}
                  placeholder="Secondary Phone"
                  className="acc-input"
                />
              )}

              {renderDetailItem(
                <Mail className="acc-detail-icon" />,
                "Email",
                staffData.email,
                <input
                  type="email"
                  name="email"
                  value={editedStaff?.email || ''}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="acc-input"
                />
              )}

              {renderDetailItem(
                <User className="acc-detail-icon" />,
                "Role",
                staffData.role,
                <select
                  name="role"
                  value={editedStaff?.role || ''}
                  onChange={handleInputChange}
                  className="acc-input"
                >
                  <option value="Veterinarian">Veterinarian</option>
                  <option value="Vet Tech">Vet Tech</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Other">Other</option>
                </select>
              )}

              {renderDetailItem(
                <Calendar className="acc-detail-icon" />,
                "Hire Date",
                staffData.hire_date,
                <input
                  type="date"
                  name="hire_date"
                  value={editedStaff?.hire_date || ''}
                  onChange={handleInputChange}
                  className="acc-input"
                />
              )}

              {renderDetailItem(
                <MapPin className="acc-detail-icon" />,
                "Address",
                staffData.address,
                <textarea
                  name="address"
                  value={editedStaff?.address || ''}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="acc-input"
                  rows="2"
                />
              )}

              {renderDetailItem(
                <AlertCircle className="acc-detail-icon" />,
                "Emergency Contact",
                staffData.emergency_contact,
                <textarea
                  name="emergency_contact"
                  value={editedStaff?.emergency_contact || ''}
                  onChange={handleInputChange}
                  placeholder="Emergency Contact"
                  className="acc-input"
                  rows="2"
                />
              )}

              {renderDetailItem(
                <Building className="acc-detail-icon" />,
                "Notes",
                staffData.notes,
                <textarea
                  name="notes"
                  value={editedStaff?.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Notes"
                  className="acc-input"
                  rows="2"
                />
              )}
            </div>

            {isEditing && (
              <div className="acc-actions">
                <button className="acc-button acc-cancel-button" onClick={handleCancel}>
                  <X size={18} />
                  Cancel
                </button>
              </div>
            )}

            {error && (
              <div className="acc-error">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Account;