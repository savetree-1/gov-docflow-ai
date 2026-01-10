/**
 * Custom Hook for WebSocket Real-Time Notifications
 * Usage: const { notifications, connected } = useWebSocket(userId);
 */

import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

export const useWebSocket = (userId) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    console.log('🔌 Connecting to WebSocket...', SOCKET_URL);
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
      setConnected(true);
      
      // Register user
      newSocket.emit('register', userId);
    });

    newSocket.on('registered', (data) => {
      console.log('✅ Registered with server:', data.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      setConnected(false);
    });

    // Notification events
    newSocket.on('notification', (notification) => {
      console.log('📨 New notification:', notification);
      
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}-${Math.random()}`,
          ...notification,
          read: false,
          receivedAt: new Date()
        },
        ...prev
      ]);

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title || 'New Update', {
          body: notification.message,
          icon: '/logo.png',
          tag: notification.documentId || 'general'
        });
      }

      // Play notification sound (optional)
      playNotificationSound();
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      newSocket.disconnect();
    };
  }, [userId]);

  // Subscribe to document updates
  const subscribeToDocument = useCallback((documentId) => {
    if (socket && connected) {
      socket.emit('subscribe:document', documentId);
      console.log(`📄 Subscribed to document: ${documentId}`);
    }
  }, [socket, connected]);

  // Subscribe to department updates
  const subscribeToDepartment = useCallback((departmentId) => {
    if (socket && connected) {
      socket.emit('subscribe:department', departmentId);
      console.log(`🏢 Subscribed to department: ${departmentId}`);
    }
  }, [socket, connected]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    socket,
    connected,
    notifications,
    unreadCount,
    subscribeToDocument,
    subscribeToDepartment,
    markAsRead,
    clearAll
  };
};

// Notification sound helper
const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3'); // Add notification sound file
    audio.volume = 0.3;
    audio.play().catch((err) => {
      // Silent fail if autoplay blocked
      console.log('Audio autoplay blocked:', err.message);
    });
  } catch (error) {
    // Silent fail
  }
};

// Request browser notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  return Notification.permission === 'granted';
};

export default useWebSocket;
