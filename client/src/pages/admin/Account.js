import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Edit2, X, Save, Phone, Mail, MapPin, Calendar, User, AlertCircle, Camera } from 'lucide-react';
import AuthGuard from '../../components/auth/AuthGuard';
import './Admin.css';

const Account = () => {
  const [staffData, setStaffData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStaff, setEditedStaff] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = React.useRef(null);
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    fetchStaffData();
  }, [session]);

  const fetchStaffData = async () => {
    if (!session?.user?.id) return;

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
      console.error('Error fetching staff data:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedStaff({ ...staffData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedStaff(null);
    setProfilePicture(null);
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
    } catch (error) {
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
        console.error('Error uploading file:', error);
      }
    }
  };

  if (!staffData) return null;

  return (
    <AuthGuard>
      <div className="a-admin-content">
        <div className="a-staff-list-card">
          <div className="a-card-header">
            <h2 className="a-card-title">My Account</h2>
          </div>
          <div className="a-card-content">
            <div className="a-staff-details-content" style={{ boxShadow: 'none' }}>
              <div className="a-staff-details-header">
                <div className="a-staff-avatar-container" onClick={handleProfilePictureClick}>
                  <img 
                    src={profilePicture || staffData.photo_url || "/floweronly.svg"} 
                    alt={staffData.full_name} 
                    className="a-staff-large-avatar" 
                  />
                  {isEditing && (
                    <div className="a-profile-picture-overlay">
                      <Camera size={24} />
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                  />
                </div>
                <div className="a-staff-header-info">
                  {isEditing ? (
                    <div className="a-name-input-container">
                      <input
                        name="first_name"
                        value={editedStaff.first_name || ''}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        className="a-edit-input a-name-input"
                      />
                      <input
                        name="last_name"
                        value={editedStaff.last_name || ''}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        className="a-edit-input a-name-input"
                      />
                    </div>
                  ) : (
                    <h2>{staffData.full_name}</h2>
                  )}
                  <span className="a-role-badge">{staffData.role}</span>
                  <span className={`a-status-badge ${staffData.status.toLowerCase()}`}>
                    {staffData.status}
                  </span>
                </div>
                {isEditing ? (
                  <button className="a-save-button" onClick={handleSave}>
                    <Save size={18} />
                    Save
                  </button>
                ) : (
                  <button className="a-edit-button" onClick={handleEdit}>
                    <Edit2 size={18} />
                    Edit
                  </button>
                )}
              </div>
              <div className="a-staff-details-body">
                <div className="a-staff-info-item">
                  <Phone size={18} />
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editedStaff.phone || ''}
                      onChange={handleInputChange}
                      placeholder="Phone"
                      className="a-edit-input"
                    />
                  ) : (
                    <p>{staffData.phone || 'N/A'}</p>
                  )}
                </div>
                <div className="a-staff-info-item">
                  <Phone size={18} />
                  {isEditing ? (
                    <input
                      type="tel"
                      name="secondary_phone"
                      value={editedStaff.secondary_phone || ''}
                      onChange={handleInputChange}
                      placeholder="Secondary Phone"
                      className="a-edit-input"
                    />
                  ) : (
                    <p>Secondary: {staffData.secondary_phone || 'N/A'}</p>
                  )}
                </div>
                <div className="a-staff-info-item">
                  <Mail size={18} />
                  <p>{staffData.email}</p>
                </div>
                <div className="a-staff-info-item">
                  <User size={18} />
                  <p>Role: {staffData.role}</p>
                </div>
                <div className="a-staff-info-item">
                  <Calendar size={18} />
                  <p>Hire Date: {staffData.hire_date || 'N/A'}</p>
                </div>
                <div className="a-staff-info-item">
                  <MapPin size={18} />
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={editedStaff.address || ''}
                      onChange={handleInputChange}
                      placeholder="Address"
                      className="a-edit-input"
                    />
                  ) : (
                    <p>{staffData.address || 'N/A'}</p>
                  )}
                </div>
                <div className="a-staff-info-item">
                  <AlertCircle size={18} />
                  {isEditing ? (
                    <textarea
                      name="emergency_contact"
                      value={editedStaff.emergency_contact || ''}
                      onChange={handleInputChange}
                      placeholder="Emergency Contact"
                      className="a-edit-input"
                    />
                  ) : (
                    <p>Emergency Contact: {staffData.emergency_contact || 'N/A'}</p>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="a-staff-details-footer">
                  <button className="a-cancel-button" onClick={handleCancel}>
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Account;