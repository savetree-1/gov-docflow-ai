import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Notification API
 */
export const notificationAPI = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    return api.get('/notifications', { params });
  },

  // Get unread count
  getUnreadCount: async () => {
    return api.get('/notifications/unread-count');
  },

  // Mark notification as read
  markAsRead: async (id) => {
    return api.put(`/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: async () => {
    return api.put('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id) => {
    return api.delete(`/notifications/${id}`);
  },

  // Clear all read notifications
  clearAllRead: async () => {
    return api.delete('/notifications/clear-all');
  },
};

export default notificationAPI;
