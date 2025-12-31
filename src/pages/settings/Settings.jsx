/**
 * Settings Page for All Roles
 * Role-specific configurations and preferences
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { authAPI } from '../../api/backendAPI';
import { SuccessMsg, ErrorMsg } from '../../components/alerts';
import { getSaveProfileAction } from '../../redux/actions';
import './Settings.css';
import routingIcon from '../../img/routing.png';
import usersIcon from '../../img/users.png';
import auditIcon from '../../img/audit.png';
import supportIcon from '../../img/support.png';

const Settings = () => {
  const user = useSelector((state) => state.authReducer.user.data);
  const role = user?.role || 'OFFICER';
  const dispatch = useDispatch();

  const [profile, setProfile] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    employeeId: user?.employee_id || '',
    department: user?.department || ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    dashboardLayout: 'default',
    theme: 'light'
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || null);
  const [systemSettings, setSystemSettings] = useState({
    maxFileSize: 10,
    allowedFileTypes: 'pdf,doc,docx,jpg,jpeg,png',
    autoArchiveDays: 90,
    requireApproval: true
  });

  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data.success) {
        const userData = response.data.data;
        setProfile({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          employeeId: userData.employeeId || '',
          department: userData.department?.name || ''
        });
        setPhotoPreview(userData.profilePhoto || null);
        setPreferences({
          emailNotifications: userData.preferences?.emailNotifications ?? true,
          smsNotifications: userData.preferences?.smsNotifications ?? false,
          dashboardLayout: userData.preferences?.dashboardLayout || 'default',
          theme: userData.preferences?.theme || 'light'
        });
        // Update Redux store with latest user data including profile photo
        dispatch(getSaveProfileAction(userData));
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, JPEG, or PNG)');
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setUploadingPhoto(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      console.log('Uploading photo...');
      const response = await authAPI.uploadProfilePhoto(formData);
      
      console.log('Upload response:', response.data);
      
      if (response.data.success) {
        setPhotoPreview(response.data.data.profilePhoto);
        setSuccess('Profile photo updated successfully');
        setTimeout(() => setSuccess(''), 3000);
        // Reload user profile to update header avatar
        loadUserProfile();
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to upload photo';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await authAPI.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        preferences: preferences
      });
      
      if (response.data.success) {
        setSuccess('Profile updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await authAPI.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        preferences: preferences
      });
      
      if (response.data.success) {
        setSuccess('Preferences updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update preferences');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (security.newPassword !== security.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (security.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authAPI.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword
      });
      
      if (response.data.success) {
        setSuccess('Password changed successfully');
        setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // For now, store in localStorage - can be moved to backend API later
      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
      setSuccess('System settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update system settings');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>System <span className="dashboard-highlight">Settings</span></h1>
            <p className="dashboard-subtitle">Manage system preferences and configurations</p>
          </div>
        </div>

        {success && <SuccessMsg message={success} />}
        {error && <ErrorMsg message={error} />}

        {/* Profile Settings */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Profile Information</h2>
          </div>
          
          {/* Profile Photo Upload */}
          <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e0e0e0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
              Profile Photo
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #e0e0e0',
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#999">
                      <path d="M12 12C14.21 12 16 10.21 16 8S14.21 4 12 4 8 5.79 8 8 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <input
                  type="file"
                  id="profile-photo-upload"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingPhoto}
                />
                <label
                  htmlFor="profile-photo-upload"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: uploadingPhoto ? '#ccc' : '#0f5e59',
                    color: '#fff',
                    borderRadius: '4px',
                    cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}
                >
                  {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                </label>
                <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
                  JPG, JPEG or PNG. Max size 2MB
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="form-input"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  value={profile.employeeId}
                  className="form-input"
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={profile.department}
                  className="form-input"
                  disabled
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Notification Preferences</h2>
          </div>
          
          <form onSubmit={handlePreferencesUpdate} className="settings-form">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                />
                <span>Email Notifications</span>
              </label>
              <p className="form-help">Receive email updates for document actions</p>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications}
                  onChange={(e) => setPreferences({...preferences, smsNotifications: e.target.checked})}
                />
                <span>SMS Notifications</span>
              </label>
              <p className="form-help">Receive SMS alerts for urgent documents</p>
            </div>

            <div className="form-group">
              <label>Dashboard Layout</label>
              <select
                value={preferences.dashboardLayout}
                onChange={(e) => setPreferences({...preferences, dashboardLayout: e.target.value})}
                className="form-select"
              >
                <option value="default">Default Layout</option>
                <option value="compact">Compact View</option>
                <option value="detailed">Detailed View</option>
              </select>
              <p className="form-help">Choose your preferred dashboard layout</p>
            </div>

            <div className="form-group">
              <label>Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                className="form-select"
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="auto">Auto (System)</option>
              </select>
              <p className="form-help">Choose your preferred color theme</p>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Security</h2>
          </div>
          
          <form onSubmit={handlePasswordChange} className="settings-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={security.currentPassword}
                onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={security.newPassword}
                onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                className="form-input"
                required
                minLength="8"
              />
              <p className="form-help">Minimum 8 characters</p>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={security.confirmPassword}
                onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* System Settings - Super Admin Only */}
        {role === 'SUPER_ADMIN' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>System Settings</h2>
              <p className="section-subtitle">Configure system-wide parameters</p>
            </div>
            
            <form onSubmit={handleSystemSettingsUpdate} className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Max File Size (MB)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={systemSettings.maxFileSize}
                    onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: parseInt(e.target.value)})}
                    className="form-input"
                  />
                  <p className="form-help">Maximum file upload size in megabytes</p>
                </div>
                <div className="form-group">
                  <label>Auto-Archive Days</label>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={systemSettings.autoArchiveDays}
                    onChange={(e) => setSystemSettings({...systemSettings, autoArchiveDays: parseInt(e.target.value)})}
                    className="form-input"
                  />
                  <p className="form-help">Days before completed documents are archived</p>
                </div>
              </div>

              <div className="form-group">
                <label>Allowed File Types</label>
                <input
                  type="text"
                  value={systemSettings.allowedFileTypes}
                  onChange={(e) => setSystemSettings({...systemSettings, allowedFileTypes: e.target.value})}
                  className="form-input"
                  placeholder="pdf,doc,docx,jpg,jpeg,png"
                />
                <p className="form-help">Comma-separated list of allowed file extensions</p>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={systemSettings.requireApproval}
                    onChange={(e) => setSystemSettings({...systemSettings, requireApproval: e.target.checked})}
                  />
                  <span>Require Admin Approval for New Users</span>
                </label>
                <p className="form-help">New user registrations will require admin approval before activation</p>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Update System Settings'}
              </button>
            </form>
          </div>
        )}

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions-grid">
            {(role === 'SUPER_ADMIN' || role === 'DEPARTMENT_ADMIN') && (
              <div className="action-card">
                <img src={routingIcon} alt="Routing" className="action-icon" />
                <h3>Routing Configuration</h3>
                <p>Manage document routing rules and workflows</p>
                <button 
                  className="btn-secondary"
                  onClick={() => window.location.href = '/routing-configuration'}
                >
                  Configure Routing
                </button>
              </div>
            )}
            
            {role === 'SUPER_ADMIN' && (
              <div className="action-card">
                <img src={usersIcon} alt="Users" className="action-icon" />
                <h3>User Management</h3>
                <p>Manage users, roles, and permissions</p>
                <button 
                  className="btn-secondary"
                  onClick={() => window.location.href = '/user-management'}
                >
                  Manage Users
                </button>
              </div>
            )}
            
            <div className="action-card">
              <img src={auditIcon} alt="Audit" className="action-icon" />
              <h3>Audit Logs</h3>
              <p>View system activity and audit trail</p>
              <button 
                className="btn-secondary"
                onClick={() => window.location.href = '/audit-trail'}
              >
                View Audit Logs
              </button>
            </div>
            
            <div className="action-card">
              <img src={supportIcon} alt="Support" className="action-icon" />
              <h3>Support</h3>
              <p>Get help and submit feedback</p>
              <button 
                className="btn-secondary"
                onClick={() => window.location.href = '/help'}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
