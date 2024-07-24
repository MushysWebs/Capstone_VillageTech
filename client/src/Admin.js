import React, { useState, useMemo } from 'react';
import './Admin.css';
import AddStaffModal from './AddStaffModal'; // Import the modal component

const AdminPage = ({ globalSearchTerm }) => {
  const [staffList, setStaffList] = useState([
    { id: 1, name: 'Leonardo DiCaprio', email: 'leonardo@di.cap', phone: '(404) 314-9696', role: 'Veterinarian' },
    { id: 2, name: 'Mark Wahlberg', email: 'wahl@berger.commm', phone: '(404) 555-1234', role: 'Vet Tech' },
    { id: 3, name: 'Poo Pee', email: 'poo@pee.pee', phone: '(404) 555-5678', role: 'Receptionist' },
    { id: 4, name: 'Hillary Clinton', email: 'hill@clint.cim', phone: '(404) 555-9012', role: 'Other' },
  ]);

  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff =>
      (staff.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        staff.phone.includes(globalSearchTerm)) &&
      (roleFilter === 'All' || staff.role === roleFilter)
    );
  }, [staffList, globalSearchTerm, roleFilter]);

  const handleStaffClick = (staff) => {
    setSelectedStaff(staff);
  };

  const closeStaffDetails = () => {
    setSelectedStaff(null);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addNewStaff = (newStaff) => {
    setStaffList([...staffList, newStaff]);
  };

  return (
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
                    <button className="view-filter-button" onClick={() => handleStaffClick(staff)}>
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
            <button className="close-button" onClick={closeStaffDetails}>← Back</button>
            <h2>Temporary placeholder design</h2>
            <div className="staff-details-grid">
              <div className="personal-details">
                <h3>Personal Details <button className="edit-button">Edit</button></h3>
                <img src="/floweronly.svg" alt={selectedStaff.name} className="staff-large-avatar" />
                <p><strong>Name:</strong> {selectedStaff.name}</p>
                <p><strong>Gender:</strong> {selectedStaff.gender}</p>
                <p><strong>Date of Birth:</strong> {selectedStaff.dob}</p>
                <p><strong>Role:</strong> {selectedStaff.role}</p>
              </div>
              <div className="upcoming-shifts">
                <h3>Upcoming Shifts <button className="edit-button">Edit</button></h3>
                <p>Thu, Jul 25</p>
                <p>6:00 AM - 6:00 PM</p>
                <p>Thu, Jul 25</p>
                <p>6:00 AM - 6:00 PM</p>
                <p>Thu, Jul 25</p>
                <p>6:00 AM - 6:00 PM</p>
                <p>Thu, Jul 25</p>
                <p>6:00 AM - 6:00 PM</p>
              </div>
              <div className="address">
                <h3>Address</h3>
                <p><strong>Address Line:</strong> {selectedStaff.address}</p>
                <p><strong>City:</strong> {selectedStaff.city}</p>
                <p><strong>State:</strong> {selectedStaff.state}</p>
                <p><strong>Country:</strong> {selectedStaff.country}</p>
              </div>
              <div className="contact-details">
                <h3>Contact Details</h3>
                <p><strong>Phone Number:</strong> {selectedStaff.phone}</p>
                <p><strong>Email:</strong> {selectedStaff.email}</p>
              </div>
            </div>
            <button className="delete-button">Delete</button>
          </div>
        </div>
      )}

      <AddStaffModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddStaff={addNewStaff}
      />
    </div>
  );
};

export default AdminPage;
