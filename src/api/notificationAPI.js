import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

/****** Creating the axios instance with authentication token ******/
const api = axios.create({
  baseURL: API_URL,
});

/****** Adding the authentication token to requests ******/
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/****** Notification API ******/
export const notificationAPI = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    return api.get('/notifications', { params });
  },

  /****** Taking unread count ******/
  getUnreadCount: async () => {
    return api.get('/notifications/unread-count');
  },

  /****** Marking notification as read ******/
  markAsRead: async (id) => {
    return api.put(`/notifications/${id}/read`);
  },

  /****** Marking all as read *****/
  markAllAsRead: async () => {
    return api.put('/notifications/read-all');
  },

  /****** Deleting notification ******/
  deleteNotification: async (id) => {
    return api.delete(`/notifications/${id}`);
  },

  /****** Clearing all read notifications ******/
  clearAllRead: async () => {
    return api.delete('/notifications/clear-all');
  },
};

export default notificationAPI;
