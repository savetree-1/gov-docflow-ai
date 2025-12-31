/**
 * User Management Page
 * Manage users, roles, and permissions
 * Access: Super Admin and Department Admin
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { userAPI } from '../../api/backendAPI';
import { SuccessMsg, ErrorMsg } from '../../components/alerts';
import ConfirmDialog from '../../components/ConfirmDialog';
import './UserManagement.css';

// Import action icons
import viewIcon from '../../img/view';
import editIcon from '../../img/edit.png';
import tickIcon from '../../img/tick.png';
import revokeIcon from '../../img/revoke.png';

const UserManagement = () => {
  const user = useSelector((state) => state.authReducer.user.data);
  const role = user?.role || 'SUPER_ADMIN';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmStyle: 'primary'
  });
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    isApproved: '',
    search: ''
  });
  const [passwordResetData, setPasswordResetData] = useState({
    userId: null,
    newPassword: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    role: 'OFFICER',
    departmentId: ''
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching users with filters:', filters);
      console.log('🔑 Current user:', user);
      console.log('🔑 User role:', user?.role);
      const response = await userAPI.getAll(filters);
      console.log('📊 Full API Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log('✅ Users received:', response.data.data.length);
        console.log('📋 Users array:', response.data.data);
        setUsers(response.data.data);
      } else {
        console.log('❌ API returned success: false');
      }
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      employeeId: '',
      role: 'OFFICER',
      departmentId: ''
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      phone: user.phone || '',
      employeeId: user.employeeId,
      role: user.role,
      departmentId: user.department?._id || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      
      if (editingUser) {
        // Update existing user
        const response = await userAPI.update(editingUser._id, formData);
        if (response.data.success) {
          setSuccess('User updated successfully');
          setShowModal(false);
          fetchUsers();
        }
      } else {
        // Create new user
        const response = await userAPI.create(formData);
        if (response.data.success) {
          setSuccess('User created successfully');
          setShowModal(false);
          fetchUsers();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve User',
      message: 'Are you sure you want to approve this user? They will gain access to the system.',
      confirmStyle: 'primary',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          const response = await userAPI.approve(userId);
          if (response.data.success) {
            setSuccess('User approved successfully');
            fetchUsers();
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to approve user');
        }
      }
    });
  };

  const handleDeactivate = async (userId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Deactivate User',
      message: 'Are you sure you want to deactivate this user? This action can be reversed later.',
      confirmStyle: 'warning',
      icon: '⚠️',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          const response = await userAPI.delete(userId);
          if (response.data.success) {
            setSuccess('User deactivated successfully');
            fetchUsers();
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to deactivate user');
        }
      }
    });
  };

  const handleReactivate = async (userId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reactivate User',
      message: 'Are you sure you want to reactivate this user?',
      confirmStyle: 'primary',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          const response = await userAPI.update(userId, { isActive: true });
          if (response.data.success) {
            setSuccess('User reactivated successfully');
            fetchUsers();
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to reactivate user');
        }
      }
    });
  };

  const handleViewDetails = async (user) => {
    setEditingUser(user);
    setShowDetailsModal(true);
  };

  const handlePasswordReset = (userId) => {
    setPasswordResetData({
      userId,
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordResetModal(true);
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordResetData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await userAPI.update(passwordResetData.userId, {
        password: passwordResetData.newPassword
      });

      if (response.data.success) {
        setSuccess('Password reset successfully');
        setShowPasswordResetModal(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Bulk Approve Users',
      message: `Are you sure you want to approve ${selectedUsers.length} user(s)?`,
      confirmStyle: 'primary',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await Promise.all(selectedUsers.map(id => userAPI.approve(id)));
          setSuccess(`${selectedUsers.length} user(s) approved successfully`);
          setSelectedUsers([]);
          fetchUsers();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to approve users');
        }
      }
    });
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Bulk Deactivate Users',
      message: `Are you sure you want to deactivate ${selectedUsers.length} user(s)?`,
      confirmStyle: 'danger',
      icon: '⚠️',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await Promise.all(selectedUsers.map(id => userAPI.delete(id)));
          setSuccess(`${selectedUsers.length} user(s) deactivated successfully`);
          setSelectedUsers([]);
          fetchUsers();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to deactivate users');
        }
      }
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      SUPER_ADMIN: 'role-badge super-admin',
      DEPARTMENT_ADMIN: 'role-badge dept-admin',
      OFFICER: 'role-badge officer',
      AUDITOR: 'role-badge auditor'
    };
    return badges[role] || 'role-badge';
  };

  const getRoleLabel = (role) => {
    const labels = {
      SUPER_ADMIN: 'Super Admin',
      DEPARTMENT_ADMIN: 'Dept Admin',
      OFFICER: 'Officer',
      AUDITOR: 'Auditor'
    };
    return labels[role] || role;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>User <span className="dashboard-highlight">Management</span></h1>
            <p className="dashboard-subtitle">Manage system users and permissions</p>
          </div>
          <button onClick={handleCreate} className="btn-primary">
            + Add User
          </button>
        </div>

        {success && <SuccessMsg message={success} />}
        {error && <ErrorMsg message={error} />}

        {/* Filters */}
        <div className="dashboard-section">
          <div className="filters-row">
            <input
              type="search"
              placeholder="Search by name, email, or employee ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="form-input search-input"
              aria-label="Search users by name, email, or employee ID"
            />
            
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="form-select"
              aria-label="Filter by user role"
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="DEPARTMENT_ADMIN">Dept Admin</option>
              <option value="OFFICER">Officer</option>
              <option value="AUDITOR">Auditor</option>
            </select>

            <select
              value={filters.isApproved}
              onChange={(e) => setFilters({ ...filters, isApproved: e.target.value })}
              className="form-select"
              aria-label="Filter by approval status"
            >
              <option value="">All Status</option>
              <option value="true">Approved</option>
              <option value="false">Pending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && role === 'SUPER_ADMIN' && (
          <div className="bulk-actions-bar">
            <span className="selected-count">{selectedUsers.length} user(s) selected</span>
            <div className="bulk-actions">
              <button onClick={handleBulkApprove} className="btn-sm btn-primary">
                Approve Selected
              </button>
              <button onClick={handleBulkDeactivate} className="btn-sm btn-danger">
                Deactivate Selected
              </button>
              <button onClick={() => setSelectedUsers([])} className="btn-sm btn-secondary">
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="dashboard-section">
          <div className="table-container">
            <table className="data-table" role="table" aria-label="Users list">
              <thead>
                <tr>
                  {role === 'SUPER_ADMIN' && (
                    <th style={{ width: '40px' }} scope="col">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={handleSelectAll}
                        className="checkbox"
                        aria-label="Select all users"
                      />
                    </th>
                  )}
                  <th scope="col">Employee ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Department</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className={selectedUsers.includes(user._id) ? 'row-selected' : ''}>
                    {role === 'SUPER_ADMIN' && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="checkbox"
                        />
                      </td>
                    )}
                    <td>{user.employeeId}</td>
                    <td>
                      <span 
                        className="user-name-link" 
                        onClick={() => handleViewDetails(user)}
                        title="Click to view details"
                      >
                        {user.firstName} {user.lastName}
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={getRoleBadge(user.role)}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td>{user.department?.name || '-'}</td>
                    <td>
                      {user.isActive ? (
                        user.isApproved ? (
                          <span className="status-badge approved">Active</span>
                        ) : (
                          <span className="status-badge pending">Pending</span>
                        )
                      ) : (
                        <span className="status-badge rejected">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="btn-icon"
                          title="View Details"
                        >
                          <img src={viewIcon} alt="View" className="action-icon" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn-icon"
                          title="Edit"
                        >
                          <img src={editIcon} alt="Edit" className="action-icon" />
                        </button>
                        {!user.isApproved && role === 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="btn-icon"
                            title="Approve"
                          >
                            <img src={tickIcon} alt="Approve" className="action-icon" />
                          </button>
                        )}
                        {user.isActive ? (
                          <button
                            onClick={() => handleDeactivate(user._id)}
                            className="btn-icon btn-danger"
                            title="Deactivate"
                          >
                            <img src={revokeIcon} alt="Deactivate" className="action-icon" />
                          </button>
                        ) : (
                          role === 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleReactivate(user._id)}
                              className="btn-icon btn-success"
                              title="Reactivate"
                            >
                              <img src={tickIcon} alt="Reactivate" className="action-icon" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div 
            className="modal-overlay" 
            onClick={() => setShowModal(false)}
            role="presentation"
          >
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-modal-title"
            >
              <div className="modal-header">
                <h2 id="user-modal-title">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="btn-close"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      required
                      disabled={editingUser}
                    />
                  </div>
                  <div className="form-group">
                    <label>Employee ID *</label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="form-input"
                      required
                      disabled={editingUser}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="form-select"
                      required
                      disabled={role !== 'SUPER_ADMIN'}
                    >
                      <option value="OFFICER">Officer</option>
                      {role === 'SUPER_ADMIN' && (
                        <>
                          <option value="DEPARTMENT_ADMIN">Department Admin</option>
                          <option value="AUDITOR">Auditor</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {!editingUser && (
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-input"
                      required
                      minLength="6"
                    />
                  </div>
                )}

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {showPasswordResetModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordResetModal(false)}>
            <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reset Password</h2>
                <button onClick={() => setShowPasswordResetModal(false)} className="btn-close">×</button>
              </div>
              
              <form onSubmit={handlePasswordResetSubmit} className="modal-form">
                <div className="form-group">
                  <label>New Password *</label>
                  <input
                    type="password"
                    value={passwordResetData.newPassword}
                    onChange={(e) => setPasswordResetData({ ...passwordResetData, newPassword: e.target.value })}
                    className="form-input"
                    required
                    minLength="6"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    value={passwordResetData.confirmPassword}
                    onChange={(e) => setPasswordResetData({ ...passwordResetData, confirmPassword: e.target.value })}
                    className="form-input"
                    required
                    minLength="6"
                    placeholder="Confirm new password"
                  />
                </div>

                {passwordResetData.newPassword && passwordResetData.confirmPassword && 
                 passwordResetData.newPassword !== passwordResetData.confirmPassword && (
                  <div className="error-hint">Passwords do not match</div>
                )}

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowPasswordResetModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showDetailsModal && editingUser && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className="btn-close">×</button>
              </div>
              
              <div className="user-details">
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">{editingUser.firstName} {editingUser.lastName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Employee ID</span>
                      <span className="detail-value">{editingUser.employeeId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{editingUser.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{editingUser.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Role & Department</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Role</span>
                      <span className="detail-value">
                        <span className={getRoleBadge(editingUser.role)}>
                          {getRoleLabel(editingUser.role)}
                        </span>
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Department</span>
                      <span className="detail-value">{editingUser.department?.name || 'Not assigned'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className="detail-value">
                        {editingUser.isActive ? (
                          editingUser.isApproved ? (
                            <span className="status-badge approved">Active</span>
                          ) : (
                            <span className="status-badge pending">Pending Approval</span>
                          )
                        ) : (
                          <span className="status-badge rejected">Inactive</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Account Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Created At</span>
                      <span className="detail-value">
                        {new Date(editingUser.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Last Updated</span>
                      <span className="detail-value">
                        {new Date(editingUser.updatedAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Created By</span>
                      <span className="detail-value">
                        {editingUser.createdBy 
                          ? `${editingUser.createdBy.firstName} ${editingUser.createdBy.lastName}`
                          : 'System'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowDetailsModal(false)} className="btn-secondary">
                  Close
                </button>
                <button onClick={() => {
                  setShowDetailsModal(false);
                  handleEdit(editingUser);
                }} className="btn-primary">
                  Edit User
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmStyle={confirmDialog.confirmStyle}
          icon={confirmDialog.icon}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />
      </div>
    </div>
  );
};

export default UserManagement;
