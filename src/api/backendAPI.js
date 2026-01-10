import axios from 'axios';

/****** Base API configuration ******/
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/****** Creating axios instance ******/
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

/****** Requesting interceptor - Adding authentication token to all requests to endpoints ******/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/****** Response interceptor - Handles token refresh ******/
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    /****** If token expired, try to refresh ******/
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        /****** Refresh failed, logout user ******/
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/****** Authentication for APIs ******/
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  uploadProfilePhoto: (formData) => api.post('/auth/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

/****** Document APIs ******/
export const documentAPI = {
  upload: (formData, config = {}) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  performAction: (id, data) => api.put(`/documents/${id}/action`, data),
  confirmRouting: (id, data) => api.post(`/documents/${id}/confirm-routing`, data),
  verifyBlockchain: (id) => api.get(`/documents/${id}/verify`),
  delete: (id, reason) => api.delete(`/documents/${id}`, { data: { reason } }),
  restore: (id) => api.post(`/documents/${id}/restore`),
  permanentDelete: (id) => api.delete(`/documents/${id}/permanent`),
  getStats: () => api.get('/documents/stats/overview')
};

/****** User APIs ******/
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  approve: (id) => api.put(`/users/${id}/approve`),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats/overview')
};

/****** Department APIs ******/
export const departmentAPI = {
  register: (data) => api.post('/departments/register', data),
  getAll: (params) => api.get('/departments', { params }),
  getById: (id) => api.get(`/departments/${id}`),
  approve: (id) => api.put(`/departments/${id}/approve`),
  reject: (id, data) => api.put(`/departments/${id}/reject`, data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  getStats: () => api.get('/departments/stats/overview')
};

/****** Routing APIs ******/
export const routingAPI = {
  create: (data) => api.post('/routing', data),
  getAll: (params) => api.get('/routing', { params }),
  getById: (id) => api.get(`/routing/${id}`),
  update: (id, data) => api.put(`/routing/${id}`, data),
  delete: (id) => api.delete(`/routing/${id}`),
  test: (data) => api.post('/routing/test', data)
};

/****** Audit APIs ******/
export const auditAPI = {
  getAll: (params) => api.get('/audit', { params }),
  getById: (id) => api.get(`/audit/${id}`),
  getByDocument: (documentId) => api.get(`/audit/document/${documentId}`),
  getByUser: (userId) => api.get(`/audit/user/${userId}`),
  getStats: (params) => api.get('/audit/stats/overview', { params }),
  exportCSV: (params) => api.get('/audit/export/csv', { 
    params,
    responseType: 'blob'
  })
};

export default api;
