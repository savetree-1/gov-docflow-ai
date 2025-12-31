/**
 * Notifications Page
 * View system notifications and alerts
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/dashboardSidebar/Sidebar';
import { EmptyState } from '../components/dashboardShared/SharedComponents';
import { notificationAPI } from '../api/notificationAPI';
import './dashboards/SuperAdminDashboard.css';

const Notifications = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.authReducer.user.data);
  const role = user?.role || 'OFFICER';
  
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filter !== 'all') {
        params.read = filter === 'read' ? 'true' : 'false';
      }
      
      const response = await notificationAPI.getNotifications(params);
      
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'document_assigned': return 'assignment';
      case 'document_approved': return 'check_circle';
      case 'document_rejected': return 'cancel';
      case 'deadline_reminder': return 'alarm';
      case 'comment_added': return 'comment';
      default: return 'notifications';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'document_assigned': return '#0f5e59';
      case 'document_approved': return '#4caf50';
      case 'document_rejected': return '#f44336';
      case 'deadline_reminder': return '#ff9800';
      case 'comment_added': return '#2196f3';
      default: return '#666666';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diff = now - notifDate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>System <span className="dashboard-highlight">Notifications</span></h1>
            <p className="dashboard-subtitle">
              {unreadCount > 0 
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''} • Stay updated with important alerts`
                : 'Stay updated with important alerts and messages'
              }
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0f5e59',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '12px'
        }}>
          {['all', 'unread', 'read'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '8px 20px',
                backgroundColor: filter === tab ? '#0f5e59' : 'transparent',
                color: filter === tab ? '#ffffff' : '#666666',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease'
              }}
            >
              {tab}
              {tab === 'unread' && unreadCount > 0 && (
                <span style={{
                  marginLeft: '6px',
                  padding: '2px 6px',
                  backgroundColor: filter === tab ? '#ffffff' : '#0f5e59',
                  color: filter === tab ? '#0f5e59' : '#ffffff',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="dashboard-section">
          {loading ? (
            <div className="loading-message">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon="notifications"
              title="No notifications"
              message={filter === 'unread' 
                ? "You don't have any unread notifications" 
                : filter === 'read'
                ? "You don't have any read notifications"
                : "You don't have any notifications yet"
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => {
                    if (!notification.read) markAsRead(notification._id);
                    if (notification.documentId) {
                      navigate(`/document/${notification.documentId._id || notification.documentId}`);
                    } else if (notification.actionUrl) {
                      navigate(notification.actionUrl);
                    }
                  }}
                  style={{
                    backgroundColor: notification.read ? '#ffffff' : '#f0f9f8',
                    padding: '20px',
                    borderRadius: '8px',
                    border: `1px solid ${notification.read ? '#e0e0e0' : '#0f5e59'}`,
                    cursor: notification.documentId ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                  }}
                  onMouseEnter={(e) => {
                    if (notification.documentId) {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: `${getIconColor(notification.type)}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ 
                      fontSize: '14px',
                      color: getIconColor(notification.type),
                      fontWeight: '700',
                      fontFamily: 'monospace',
                      letterSpacing: '0.5px'
                    }}>
                      {getNotificationIcon(notification.type) === 'assignment' && 'DOC'}
                      {getNotificationIcon(notification.type) === 'check_circle' && 'OK'}
                      {getNotificationIcon(notification.type) === 'cancel' && 'NO'}
                      {getNotificationIcon(notification.type) === 'alarm' && 'DUE'}
                      {getNotificationIcon(notification.type) === 'comment' && 'MSG'}
                      {getNotificationIcon(notification.type) === 'notifications' && 'NEW'}
                    </span>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: notification.read ? '500' : '700',
                        color: '#2c3e50',
                        margin: 0
                      }}>
                        {notification.title}
                      </h3>
                      {notification.priority === 'high' && (
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: '#fee',
                          color: '#c00',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase'
                        }}>
                          High Priority
                        </span>
                      )}
                    </div>
                    
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#666666',
                      margin: '0 0 8px 0',
                      lineHeight: '1.5'
                    }}>
                      {notification.message}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#999999' }}>
                        {getTimeAgo(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <span style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#0f5e59',
                          borderRadius: '50%'
                        }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
