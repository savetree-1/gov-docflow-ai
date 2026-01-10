/**
 * Notification Container - Manages Multiple Toast Notifications
 */

import React from 'react';
import NotificationToast from './NotificationToast';
import './NotificationContainer.css';

const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="notification-container">
      {notifications.slice(0, 3).map((notification, index) => (
        <div
          key={notification.id}
          style={{
            transform: `translateY(${index * 10}px)`,
            opacity: 1 - index * 0.15,
            zIndex: 10000 - index
          }}
        >
          <NotificationToast
            notification={notification}
            onClose={() => onRemove(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
