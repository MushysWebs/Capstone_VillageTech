import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import './Admin.css';
import AddStaffModal from './AddStaffModal';
import AuthGuard from './components/auth/AuthGuard';

const AdminPage = ({ globalSearchTerm }) => {
  const [staffList, setStaffList] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      ((staff.name ? staff.name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
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
    fetchStaff(); // Refresh staff list after adding new staff
  };

  return (
    <AuthGuard>
      <div className="admin-content">
        <div className="staff-list-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Staff List</h2>
              <button className="add-staff-button" onClick={openModal}>Add Staff</button>
            </div>
            <div className="results-count">
              Showing {filteredStaff.length} of {staffList.length} results
            </div>
          </div>
          <div className="card-content">
            <div className="search-filter-container">
              <div className="view-filter-buttons">
                <select
                  className="view-filter-button"
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
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <div className="staff-name">
                        <img src="/floweronly.svg" alt={staff.name} className="staff-avatar" />
                        {staff.name}
                      </div>
                    </td>
                    <td>{staff.email}</td>
                    <td>{staff.phone}</td>
                    <td><span className="role-badge">{staff.role}</span></td>
                    <td>
                      <button className="view-filter-button" onClick={() => setSelectedStaff(staff)}>
                        <i className="fas fa-window-restore"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <button className="manage-schedule-button">Manage Schedule</button>

        {selectedStaff && (
          <div className="staff-details-overlay">
            <div className="staff-details-content">
              <button className="close-button" onClick={() => setSelectedStaff(null)}>X</button>
              <h2>{selectedStaff.name}</h2>
              <p>Email: {selectedStaff.email}</p>
              <p>Phone: {selectedStaff.phone}</p>
              <p>Role: {selectedStaff.role}</p>
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

export default AdminPage;
