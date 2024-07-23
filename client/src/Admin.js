import React from 'react';
import './Dashboard.css';

const Admin = () => {
  return (
    <div className="admin-content">
      <h1>Admin Dashboard</h1>
      <div className="admin-sections">
        <section className="admin-section">
          <h2>User Management</h2>
          <button className="action-button">Add New User</button>
          <button className="action-button">View All Users</button>
        </section>
        <section className="admin-section">
          <h2>Role Management</h2>
          <button className="action-button">Create New Role</button>
          <button className="action-button">View All Roles</button>
        </section>
        <section className="admin-section">
          <h2>System Settings</h2>
          <button className="action-button">General Settings</button>
          <button className="action-button">Security Settings</button>
        </section>
        <section className="admin-section">
          <h2>Reports</h2>
          <button className="action-button">Generate Reports</button>
          <button className="action-button">View Report History</button>
        </section>
      </div>
    </div>
  );
};

export default Admin;