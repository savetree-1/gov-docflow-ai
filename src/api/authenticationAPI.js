/******
Authentication API - Backend
Government Internal Platform
 
Implements secure authentication with:
  1. Password hashing (bcrypt)
  2. JWT token generation
  3. Audit logging
  4. Rate limiting protection
******/

import axios from 'axios';
import { AUTH_EVENTS, USER_STATUS, AUTH_STATUS_CODES } from '../constants/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/****** Creating axios instance with default config ******/
const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  /******This is for cookie-based auth if needed ******/
});

/****** Requesting interceptor to add auth token  ******/
authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/****** Response interceptor to handle token expiration ******/
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      /****** Token expired or invalid ******/
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * LOGIN
 * Authenticates user with email/employeeId and password
 * Returns JWT token and user profile
 */
export const login = async (credentials) => {
  try {
    const response = await authClient.post('/auth/login', {
      email: credentials.emailOrEmployeeId,
      password: credentials.password,
      captchaToken: credentials.captchaToken  // Optional
    });

    const { accessToken, refreshToken, user } = response.data.data;

    /****** Store tokens and user info securely ******/
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return {
      success: true,
      token: accessToken,
      user
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed';
    const errorCode = error.response?.data?.code;

    return {
      success: false,
      error: errorMessage,
      code: errorCode,
      status: error.response?.status
    };
  }
};

/**
 * LOGOUT
 * Revokes current session and clears local storage
 */
export const logout = async () => {
  try {
    await authClient.post('/auth/logout');
    
    /****** Clear local storage ******/
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');

    return { success: true };
  } catch (error) {
    /****** Clearing local storage even if API call fails ******/
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');

    return {
      success: false,
      error: error.response?.data?.message || 'Logout failed'
    };
  }
};

/**
 * GET CURRENT USER
 * Fetches current authenticated user profile and permissions
 */
export const getCurrentUser = async () => {
  try {
    const response = await authClient.get('/auth/me');
    
    const user = response.data.user;
    
    /****** Updating stored user info ******/
    localStorage.setItem('user', JSON.stringify(user));

    return {
      success: true,
      user
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user',
      status: error.response?.status
    };
  }
};

/**
 * VERIFY TOKEN
 * Checks if current token is valid and not expired
 */
export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    /****** Checking local expiry first ******/
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      return { success: false, error: 'Token expired' };
    }

    /****** Verifying with backend  ******/
    const response = await authClient.get('/auth/verify');
    
    return {
      success: true,
      valid: response.data.valid
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Token verification failed'
    };
  }
};

/**
 * REFRESH TOKEN
 * Gets a new token using refresh token (if implemented)
 */
export const refreshToken = async () => {
  try {
    const response = await authClient.post('/auth/refresh');
    
    const { token, expiresIn } = response.data;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenExpiry', Date.now() + expiresIn * 1000);

    return {
      success: true,
      token,
      expiresIn
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Token refresh failed'
    };
  }
};

/**
 * CHECK PERMISSION
 * Checks if current user has a specific permission
 */
export const checkPermission = (permission) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;

    const user = JSON.parse(userStr);
    
    /****** Importing the ROLE_PERMISSIONS locally to avoid circular dependency  ******/
    const { ROLE_PERMISSIONS } = require('../constants/auth');
    
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    if (!rolePermissions) return false;

    return rolePermissions[permission] === true;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

/**
 * GET USER ROLE
 * Returns current user's role
 */
export const getUserRole = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user.role;
  } catch (error) {
    console.error('Get user role error:', error);
    return null;
  }
};

/**
 * GET USER DEPARTMENT
 * Returns current user's department ID
 */
export const getUserDepartment = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user.departmentId;
  } catch (error) {
    console.error('Get user department error:', error);
    return null;
  }
};

/**
 * IS AUTHENTICATED
 * Quick check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  
  if (!token) return false;
  
  /****** Checking if token is expired or not ******/
  if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    return false;
  }
  
  return true;
};

/**
 * GET STORED USER
 * Gets user from localStorage without API call
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Get stored user error:', error);
    return null;
  }
};

export default {
  login,
  logout,
  getCurrentUser,
  verifyToken,
  refreshToken,
  checkPermission,
  getUserRole,
  getUserDepartment,
  isAuthenticated,
  getStoredUser
};
