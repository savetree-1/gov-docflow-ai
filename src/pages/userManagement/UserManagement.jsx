/**
 * User Management Page
 * Manage users, roles, and permissions
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { userAPI } from '../../api/backendAPI';
import { SuccessMsg, ErrorMsg } from '../../components/alerts';
import ConfirmDialog from '../../components/ConfirmDialog';
import './UserManagement.css';

import viewIcon from '../../img/image copy 4.png';
import editIcon from '../../img/edit.png';
import tickIcon from '../../img/tick.png';
import revokeIcon from '../../img/revoke copy.png';

const UserManagement = () => {
  const user = useSelector((state) => state.authReducer.user.data);
  const role = user?.role || 'SUPER_ADMIN';

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    role: 'OFFICER',
    department: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAll({});
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(u => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleAddUser = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      role: 'OFFICER',
      department: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.create(formData);
      setSuccess('User created successfully');
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      setError('Failed to create user');
    }
  };

  const handleApprove = async (id) => {
    await userAPI.approve(id);
    fetchUsers();
  };

  const handleDeactivate = async (id) => {
    await userAPI.delete(id);
    fetchUsers();
  };

  const handleReactivate = async (id) => {
    await userAPI.update(id, { isActive: true });
    fetchUsers();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>
              <span className="dashboard-highlight">User</span> Management
            </h1>
            <p className="dashboard-subtitle">
              Manage users, roles, and permissions across the system
            </p>
          </div>
          <button className="btn-primary" onClick={handleAddUser}>+ Add User</button>
        </div>

        {success && <SuccessMsg message={success} />}
        {error && <ErrorMsg message={error} />}

        <div className="dashboard-section">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '50px' }}>
                    <input 
                      type="checkbox" 
                      className="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th scope="col">Employee ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ width: '180px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" align="center">Loading...</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <input 
                          type="checkbox" 
                          className="checkbox"
                          checked={selectedUsers.includes(u._id)}
                          onChange={() => handleSelectUser(u._id)}
                        />
                      </td>
                      <td>{u.employeeId}</td>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>
                        {u.isActive
                          ? u.isApproved ? 'Active' : 'Pending'
                          : 'Inactive'}
                      </td>

                      {/* ✅ FIXED ACTIONS COLUMN */}
                      <td>
                        <div className="action-buttons">
                          {/* VIEW */}
                          <button className="btn-icon">
                            <img src={viewIcon} alt="View" className="action-icon" />
                          </button>

                          {/* EDIT */}
                          <button className="btn-icon">
                            <img src={editIcon} alt="Edit" className="action-icon" />
                          </button>

                          {/* APPROVE (always present) */}
                          <button
                            className={`btn-icon ${u.isApproved ? 'btn-disabled' : 'btn-success'}`}
                            disabled={u.isApproved}
                            onClick={() => handleApprove(u._id)}
                          >
                            <img src={tickIcon} alt="Approve" className="action-icon" />
                          </button>

                          {/* DEACTIVATE / REACTIVATE (same slot) */}
                          <button
                            className={`btn-icon ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                            onClick={() =>
                              u.isActive
                                ? handleDeactivate(u._id)
                                : handleReactivate(u._id)
                            }
                          >
                            <img
                              src={revokeIcon}
                              alt={u.isActive ? "Deactivate" : "Reactivate"}
                              className="action-icon"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New User</h2>
                <button className="btn-close" onClick={handleCloseModal}>×</button>
              </div>

              <form className="modal-form" onSubmit={handleSubmitUser}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-input"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-input"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Employee ID *</label>
                    <input
                      type="text"
                      name="employeeId"
                      className="form-input"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      name="role"
                      className="form-input"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="OFFICER">Officer</option>
                      <option value="DEPARTMENT_ADMIN">Department Admin</option>
                      <option value="AUDITOR">Auditor</option>
                      {role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department *</label>
                    <input
                      type="text"
                      name="department"
                      className="form-input"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog {...confirmDialog} />
      </div>
    </div>
  );
};

export default UserManagement;
