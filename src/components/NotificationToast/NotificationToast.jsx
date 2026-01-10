/**
 * Real-Time Notification Toast Component
 * Displays WebSocket notifications as toast messages
 */

import React, { useEffect, useState } from 'react';
import './NotificationToast.css';

const NotificationToast = ({ notification, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setVisible(true), 10);

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setRemoving(true);
    setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 200);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#3b82f6';
    }
  };

  const getIcon = (type) => {
    const icons = {
      DOCUMENT_APPROVED: '✅',
      DOCUMENT_REJECTED: '❌',
      DOCUMENT_FORWARDED: '📄',
      AI_ANALYSIS_COMPLETE: '🤖',
      BLOCKCHAIN_VERIFIED: '🔗',
      COMMENT_ADDED: '💬',
      DEFAULT: '🔔'
    };
    return notification.icon || icons[type] || icons.DEFAULT;
  };

  return (
    <div
      className={`notification-toast ${visible ? 'visible' : ''} ${removing ? 'removing' : ''}`}
      style={{ borderLeftColor: getPriorityColor(notification.priority) }}
    >
      <div className="toast-icon">{getIcon(notification.type)}</div>
      
      <div className="toast-content">
        <div className="toast-title">{notification.title}</div>
        <div className="toast-message">{notification.message}</div>
        
        {notification.documentTitle && (
          <div className="toast-document">📄 {notification.documentTitle}</div>
        )}
      </div>

      <button className="toast-close" onClick={handleClose}>
        ✕
      </button>
    </div>
  );
};

export default NotificationToast;
