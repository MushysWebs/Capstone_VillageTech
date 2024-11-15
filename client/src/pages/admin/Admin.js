import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../../components/routes/supabaseClient';
import './Admin.css';
import AddStaffModal from '../../components/addStaffModal/AddStaffModal';
import AuthGuard from '../../components/auth/AuthGuard';
import { Edit2, X, Save, Trash2, Phone, Mail, MapPin, Calendar, User, AlertCircle, Camera } from 'lucide-react';

const Admin = ({ globalSearchTerm }) => {
  const [staffList, setStaffList] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStaff, setEditedStaff] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);
  const fileInputRef = useRef(null);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*');

      if (error) throw error;
      setStaffList(data);
    } catch (error) {
      console.error('Error fetching staff data:', error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = useMemo(() => {
    const searchTerm = globalSearchTerm || '';
    return staffList.filter(staff =>
      ((staff.full_name ? staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (staff.email ? staff.email.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (staff.phone ? staff.phone.includes(searchTerm) : false)) &&
      (roleFilter === 'All' || staff.role === roleFilter)
    );
  }, [staffList, globalSearchTerm, roleFilter]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addNewStaff = (newStaff) => {
    fetchStaff();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedStaff({ ...selectedStaff });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedStaff(null);
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

      setStaffList(staffList.map(staff => staff.id === updatedStaff.id ? updatedStaff : staff));
      setSelectedStaff(updatedStaff);
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

  const handleCloseInfoBox = () => {
    setSelectedStaff(null);
    setIsEditing(false);
    setEditedStaff(null);
    setDeleteError(null);
    setIsDeleteConfirmOpen(false);  
    setIsDeletingStaff(false);    
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
  
        if (uploadError) {
          throw uploadError;
        }
  
        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('staff')
          .getPublicUrl(filePath);
  
        if (urlError) {
          throw urlError;
        }
  
        setProfilePicture(publicUrl);
        setEditedStaff(prev => ({ ...prev, photo_url: publicUrl }));
      } catch (error) {
        console.error('Error uploading file:', error);
        setDeleteError('Failed to upload profile picture. Please try again. Error: ' + error.message);
      }
    }
  };

  const handleSetInactive = async () => {
    if (!selectedStaff) return;
    setIsDeletingStaff(true);
    setDeleteError(null);
  
    try {
      const { error: updateError } = await supabase
        .from('staff')
        .update({ status: 'Inactive' })
        .eq('id', selectedStaff.id);
  
      if (updateError) throw updateError;
  
      setStaffList(staffList.map(staff => 
        staff.id === selectedStaff.id ? { ...staff, status: 'Inactive' } : staff
      ));
      setSelectedStaff(prev => ({ ...prev, status: 'Inactive' }));
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error setting staff to inactive:', error);
      setDeleteError(`Unable to set staff to inactive: ${error.message}`);
    } finally {
      setIsDeletingStaff(false);
    }
  };

  const handleDeleteConfirmOpen = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
    setDeleteError(null);
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;
    setIsDeletingStaff(true);
    setDeleteError(null);
  
    try {
      const { error: appointmentDeleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('staff_id', selectedStaff.id);
  
      if (appointmentDeleteError) throw appointmentDeleteError;
  
      const { error: staffDeleteError } = await supabase
        .from('staff')
        .delete()
        .eq('id', selectedStaff.id);
  
      if (staffDeleteError) throw staffDeleteError;
  
      setStaffList(staffList.filter(staff => staff.id !== selectedStaff.id));
      setSelectedStaff(null);
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting staff and appointments:', error);
      setDeleteError(
        `Unable to delete staff member and appointments: ${error.message}`
      );
    } finally {
      setIsDeletingStaff(false);
    }
  };
  

  return (
    <AuthGuard>
      <div className="a-admin-content">
        <div className="a-staff-list-card">
          <div className="a-card-header">
            <div>
              <h2 className="a-card-title">Staff List</h2>
              <button className="a-add-staff-button" onClick={openModal}>Add Staff</button>
            </div>
            <div className="a-results-count">
              Showing {filteredStaff.length} of {staffList.length} results
            </div>
          </div>
          <div className="a-card-content">
            <div className="a-search-filter-container">
              <div className="a-view-filter-buttons">
                <select
                  className="a-view-filter-button"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option value="Veterinarian">Veterinarian</option>
                  <option value="Vet Tech">Vet Tech</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <table className="a-staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <div className="a-staff-name">
                        <img src={staff.photo_url || "/floweronly.svg"} alt={staff.full_name} className="a-staff-avatar" />
                        {staff.full_name}
                      </div>
                    </td>
                    <td>{staff.email}</td>
                    <td>{staff.phone}</td>
                    <td><span className="a-role-badge">{staff.role}</span></td>
                    <td><span className={`a-status-badge ${staff.status.toLowerCase()}`}>{staff.status}</span></td>
                    <td>
                      <button className="a-view-filter-button" onClick={() => setSelectedStaff(staff)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedStaff && (
          <div className="a-staff-details-overlay">
            <div className="a-staff-details-content">
              <button className="a-close-button" onClick={handleCloseInfoBox}>
                <X size={24} />
              </button>
              {!isDeleteConfirmOpen ? (
                <>
              <div className="a-staff-details-header">
                <div className="a-staff-avatar-container" onClick={handleProfilePictureClick}>
                  <img 
                    src={profilePicture || selectedStaff.photo_url || "/floweronly.svg"} 
                    alt={selectedStaff.full_name} 
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
                    <>
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
                    </>
                  ) : (
                    <h2>{selectedStaff.full_name}</h2>
                  )}
                  <span className="a-role-badge">{selectedStaff.role}</span>
                  <span className={`a-status-badge ${selectedStaff.status.toLowerCase()}`}>{selectedStaff.status}</span>
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
                    <p>{selectedStaff.phone || 'N/A'}</p>
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
                    <p>Secondary: {selectedStaff.secondary_phone || 'N/A'}</p>
                  )}
                </div>
                <div className="a-staff-info-item">
                  <Mail size={18} />
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedStaff.email || ''}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="a-edit-input"
                    />
                  ) : (
                    <p>{selectedStaff.email}</p>
                  )}
                </div>
                <div className="a-staff-info-item">
                  <User size={18} />
                  {isEditing ? (
                    <select
                      name="role"
                      value={editedStaff.role || ''}
                      onChange={handleInputChange}
                      className="a-edit-input"
                    >
                      <option value="">Select Role</option>
                      <option value="Veterinarian">Veterinarian</option>
                      <option value="Vet Tech">Vet Tech</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p>Role: {selectedStaff.role || 'N/A'}</p>
                  )}
                </div>
                <div className="a-staff-info-item">
                  <Calendar size={18} />
                  {isEditing ? (
                    <input
                      type="date"
                      name="hire_date"
                      value={editedStaff.hire_date || ''}
                      onChange={handleInputChange}
                      className="a-edit-input"
                    />
                  ) : (
                    <p>Hire Date: {selectedStaff.hire_date || 'N/A'}</p>
                  )}
                </div>
                <div className="a-staff-info-item">
                  <User size={18} />
                  {isEditing ? (
                    <select
                      name="status"
                      value={editedStaff.status || ''}
                      onChange={handleInputChange}
                      className="a-edit-input"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  ) : (
                    <p>Status: {selectedStaff.status}</p>
                  )}
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
                    <p>{selectedStaff.address || 'N/A'}</p>
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
                    <p>Emergency Contact: {selectedStaff.emergency_contact || 'N/A'}</p>
                  )}
                </div>
                <div className="a-staff-info-item">
                  <User size={18} />
                  {isEditing ? (
                    <textarea
                      name="notes"
                      value={editedStaff.notes || ''}
                      onChange={handleInputChange}
                      placeholder="Notes"
                      className="a-edit-input"
                    />
                  ) : (
                    <p>Notes: {selectedStaff.notes || 'No notes available.'}</p>
                  )}
                </div>
              </div>
              <div className="a-staff-details-footer">
            {isEditing ? (
              <button className="a-cancel-button" onClick={handleCancel}>
                <X size={18} />
                Cancel
              </button>
            ) : (
              <button 
                className="a-delete-button" 
                onClick={handleDeleteConfirmOpen}
                disabled={isDeletingStaff}
              >
                <Trash2 size={18} />
                {isDeletingStaff ? 'Processing...' : 'Delete Staff Member'}
              </button>
            )}
          </div>
        </>
      ) : (

        <div className="a-delete-confirmation-container">
        <h3>Staff Member Action</h3>
        <p>Please select an action for {selectedStaff.full_name}:</p>
        
        <div className="a-action-options">
          <div className="a-action-option">
            <h4>Set to Inactive</h4>
            <p>Staff member will be marked as inactive but all records will be preserved.</p>
            <button 
              className="a-inactive-button" 
              onClick={handleSetInactive}
              disabled={isDeletingStaff}
            >
              Set to Inactive
            </button>
          </div>
    
          <div className="a-action-option">
            <h4>Delete Completely</h4>
            <p className="a-delete-warning">
              Warning: This will permanently delete the staff member and all associated appointments.
              This action cannot be undone.
            </p>
            <button 
              className="a-delete-button" 
              onClick={handleDeleteStaff}
              disabled={isDeletingStaff}
            >
              {isDeletingStaff ? 'Processing...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
    
        <div className="a-confirmation-footer">
          <button 
            className="a-cancel-button" 
            onClick={handleDeleteCancel}
            disabled={isDeletingStaff}
          >
            Cancel
          </button>
        </div>
    
        {deleteError && (
          <div className="a-error-message">
            <AlertCircle size={18} />
            {deleteError}
          </div>
        )}
      </div>
    )}
    </div>
  </div>
)}

<AddStaffModal
  isOpen={isModalOpen}
  onClose={closeModal}
  onAddStaff={addNewStaff}
/>
      </div>
    </AuthGuard>
  );
};

export default Admin;