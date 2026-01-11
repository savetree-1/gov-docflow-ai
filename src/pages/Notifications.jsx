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
                    backgroundColor: '#ffffff',
                    padding: '16px',
                    borderRadius: '12px',
                    border: notification.read ? '1px solid #e5e5ea' : '1.5px solid #0f5e59',
                    cursor: notification.documentId ? 'pointer' : 'default',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: notification.read ? '0 1px 3px rgba(0,0,0,0.04)' : '0 2px 8px rgba(15,94,89,0.08)'
                  }}
                  onMouseEnter={(e) => {
                    if (notification.documentId) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = notification.read ? '0 1px 3px rgba(0,0,0,0.04)' : '0 2px 8px rgba(15,94,89,0.08)';
                  }}
                >
                  {/* Unread indicator bar */}
                  {!notification.read && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      backgroundColor: '#0f5e59',
                      borderRadius: '12px 0 0 12px'
                    }} />
                  )}

                  {/* Icon Circle */}
                  <div style={{ 
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: !notification.read ? '#0f5e5915' : '#f5f5f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: !notification.read ? '1px solid #0f5e5930' : '1px solid #e5e5ea',
                    transition: 'all 0.2s ease'
                  }}>
                    <span style={{ 
                      fontSize: '14px',
                      color: !notification.read ? '#0f5e59' : '#8e8e93',
                      fontWeight: '700',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                      letterSpacing: '-0.3px'
                    }}>
                      {getNotificationIcon(notification.type) === 'assignment' && 'DOC'}
                      {getNotificationIcon(notification.type) === 'check_circle' && '✓'}
                      {getNotificationIcon(notification.type) === 'cancel' && '✕'}
                      {getNotificationIcon(notification.type) === 'alarm' && '⏰'}
                      {getNotificationIcon(notification.type) === 'comment' && '💬'}
                      {getNotificationIcon(notification.type) === 'notifications' && 'NEW'}
                    </span>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {!notification.read && (
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            backgroundColor: '#0f5e59',
                            color: '#ffffff',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                          }}>
                            NEW
                          </span>
                        )}
                        <h3 style={{ 
                          fontSize: '16px', 
                          fontWeight: notification.read ? '600' : '700',
                          color: '#1c1c1e',
                          margin: 0,
                          lineHeight: '1.3',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                          letterSpacing: '-0.3px'
                        }}>
                          {notification.title}
                        </h3>
                      </div>
                      {notification.priority === 'high' && (
                        <span style={{
                          padding: '4px 10px',
                          backgroundColor: '#ff3b30',
                          color: '#ffffff',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          flexShrink: 0,
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                        }}>
                          HIGH PRIORITY
                        </span>
                      )}
                    </div>
                    
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#3c3c43',
                      margin: '0 0 12px 0',
                      lineHeight: '1.45',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontWeight: '400'
                    }}>
                      {notification.message}
                    </p>
                    
                    {/* Metadata Card */}
                    {notification.metadata && notification.type === 'document_routed' && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#f5f5f7',
                        borderRadius: '10px',
                        border: '1px solid #e5e5ea'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {notification.metadata.routedToDepartment && (
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#3c3c43',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              display: 'flex',
                              alignItems: 'baseline'
                            }}>
                              <strong style={{ fontWeight: '600', color: '#1c1c1e', minWidth: '100px' }}>Department:</strong>
                              <span style={{ marginLeft: '4px' }}>{notification.metadata.routedToDepartment}</span>
                            </div>
                          )}
                          {notification.metadata.officerName && notification.metadata.officerRole && (
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#3c3c43',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              display: 'flex',
                              alignItems: 'baseline'
                            }}>
                              <strong style={{ fontWeight: '600', color: '#1c1c1e', minWidth: '100px' }}>Assigned to:</strong>
                              <span style={{ marginLeft: '4px' }}>{notification.metadata.officerName} ({notification.metadata.officerRole.replace(/_/g, ' ')})</span>
                            </div>
                          )}
                          {notification.metadata.category && (
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#3c3c43',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              display: 'flex',
                              alignItems: 'baseline'
                            }}>
                              <strong style={{ fontWeight: '600', color: '#1c1c1e', minWidth: '100px' }}>Category:</strong>
                              <span style={{ marginLeft: '4px', textTransform: 'lowercase' }}>{notification.metadata.category}</span>
                            </div>
                          )}
                          {notification.metadata.urgency && (
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#3c3c43',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <strong style={{ fontWeight: '600', color: '#1c1c1e', minWidth: '100px' }}>Priority:</strong>
                              <span style={{
                                marginLeft: '4px',
                                padding: '3px 10px',
                                backgroundColor: notification.metadata.urgency === 'High' ? '#ff3b30' : notification.metadata.urgency === 'Medium' ? '#ff9500' : '#007aff',
                                color: '#ffffff',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                textTransform: 'capitalize',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                              }}>
                                {notification.metadata.urgency}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Footer Row */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      alignItems: 'center',
                      marginTop: '10px'
                    }}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#8e8e93',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontWeight: '500'
                      }}>
                        {getTimeAgo(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <span style={{
                          width: '6px',
                          height: '6px',
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
