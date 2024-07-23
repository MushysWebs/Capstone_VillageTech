import React, { useState, useMemo } from 'react';
import './Admin.css';

const AdminPage = ({ globalSearchTerm }) => {
  const [staffList, setStaffList] = useState([
    { id: 1, name: 'Leonardo DiCaprio', email: 'leonardo@di.cap', phone: '(404) 314-9696', role: 'Veterinarian' },
    { id: 2, name: 'Emma Stone', email: 'emma@stone.com', phone: '(404) 555-1234', role: 'Vet Tech' },
    { id: 3, name: 'Brad Pitt', email: 'brad@pitt.com', phone: '(404) 555-5678', role: 'Receptionist' },
    { id: 4, name: 'Meryl Streep', email: 'meryl@streep.com', phone: '(404) 555-9012', role: 'Other' },
  ]);

  const [roleFilter, setRoleFilter] = useState('All');

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => 
      (staff.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
       staff.email.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
       staff.phone.includes(globalSearchTerm)) &&
      (roleFilter === 'All' || staff.role === roleFilter)
    );
  }, [staffList, globalSearchTerm, roleFilter]);

  return (
    <div className="admin-content">
      <div className="staff-list-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Staff List</h2>
            <button className="add-staff-button">Add Staff</button>
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
                    <button className="view-filter-button"><i className="fas fa-check-square"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button className="manage-schedule-button">Manage Schedule</button>
    </div>
  );
};

export default AdminPage;