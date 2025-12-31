/**
 * Dashboard Sidebar Component
 * Adapts navigation based on user role
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSaveTokenAction, getLogoutAction } from '../../redux/actions';
import { notificationAPI } from '../../api/notificationAPI';
import './Sidebar.css';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer?.user?.data);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Poll for unread notifications every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh count when navigating away from notifications page
  useEffect(() => {
    if (location.pathname !== '/notifications') {
      fetchUnreadCount();
    }
  }, [location.pathname]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    
    // Clear Redux state
    dispatch(getLogoutAction());
    dispatch(getSaveTokenAction(null));
    
    // Redirect to login
    navigate('/login');
  };

  const getMenuItems = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { path: '/admin/dashboard', label: 'Dashboard' },
          { path: '/admin/registrations', label: 'Department Registrations' },
          { path: '/admin/users', label: 'User Management' },
          { path: '/admin/routing', label: 'Routing Configuration' },
          { path: '/admin/departments', label: 'Departments' },
          { path: '/admin/logs', label: 'System Logs' },
          { path: '/admin/settings', label: 'Settings' },
        ];
      
      case 'DEPARTMENT_ADMIN':
        return [
          { path: '/department/dashboard', label: 'Dashboard' },
          { path: '/department/documents', label: 'Documents' },
          { path: '/document/upload', label: 'Upload Document' },
          { path: '/department/users', label: 'User Management' },
          { path: '/department/routing', label: 'Routing Configuration' },
          { path: '/notifications', label: 'Notifications' },
          { path: '/department/settings', label: 'Settings' },
        ];
      
      case 'OFFICER':
        return [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/my-documents', label: 'My Documents' },
          { path: '/document/upload', label: 'Upload Document' },
          { path: '/notifications', label: 'Notifications' },
          { path: '/settings', label: 'Settings' },
        ];
      
      case 'AUDITOR':
        return [
          { path: '/audit/search', label: 'Search Documents' },
          { path: '/audit/logs', label: 'Audit Logs' },
          { path: '/settings', label: 'Settings' },
        ];
      
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <h2>Document Management</h2>
        <div className="user-info">
          <p className="user-name">{user?.firstName || 'User'} {user?.lastName || ''}</p>
          <p className="user-role">{role.replace('_', ' ')}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-label">{item.label}</span>
            {item.label === 'Notifications' && unreadCount > 0 && (
              <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
