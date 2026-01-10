/****** Authentication API Tests Tests API calls, token management, and error handling ******/

import axios from 'axios';
import { authAPI } from './backendAPI';

jest.mock('axios');

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    test('successful login returns tokens and user data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: '1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              role: 'OFFICER',
            },
          },
        },
      };

      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await authAPI.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data.success).toBe(true);
      expect(result.data.data.accessToken).toBe('mock-access-token');
      expect(result.data.data.user.email).toBe('test@example.com');
    });

    test('failed login throws error with message', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Invalid credentials',
          },
        },
      };

      axios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      await expect(
        authAPI.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toMatchObject({
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      });
    });

    test('network error is handled properly', async () => {
      const mockError = new Error('Network Error');

      axios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      await expect(
        authAPI.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Network Error');
    });
  });

  describe('logout', () => {
    test('successful logout clears tokens', async () => {
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');

      const mockResponse = {
        data: {
          success: true,
          message: 'Logged out successfully',
        },
      };

      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      await authAPI.logout();

      // Tokens should be cleared in the actual implementation
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    test('returns current user data with valid token', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'OFFICER',
          },
        },
      };

      localStorage.setItem('accessToken', 'valid-token');

      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await authAPI.getCurrentUser();

      expect(result.data.data.email).toBe('test@example.com');
    });

    test('returns 401 with invalid token', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            message: 'Unauthorized',
          },
        },
      };

      localStorage.setItem('accessToken', 'invalid-token');

      axios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      await expect(authAPI.getCurrentUser()).rejects.toMatchObject({
        response: {
          status: 401,
        },
      });
    });
  });

  describe('updateProfile', () => {
    test('successfully updates user profile', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '1',
            firstName: 'Updated',
            lastName: 'Name',
            phone: '+91 1234567890',
          },
        },
      };

      axios.create.mockReturnValue({
        put: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await authAPI.updateProfile({
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+91 1234567890',
      });

      expect(result.data.data.firstName).toBe('Updated');
    });
  });

  describe('changePassword', () => {
    test('successfully changes password', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Password changed successfully',
        },
      };

      axios.create.mockReturnValue({
        put: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await authAPI.changePassword({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
      });

      expect(result.data.success).toBe(true);
    });

    test('fails with incorrect current password', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Current password is incorrect',
          },
        },
      };

      axios.create.mockReturnValue({
        put: jest.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      await expect(
        authAPI.changePassword({
          currentPassword: 'wrongpass',
          newPassword: 'newpass123',
        })
      ).rejects.toMatchObject({
        response: {
          data: {
            message: 'Current password is incorrect',
          },
        },
      });
    });
  });

  describe('Token Refresh', () => {
    test('automatically refreshes token on 401 error', async () => {
      const mockRefreshResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'new-access-token',
          },
        },
      };

      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      const axiosInstance = {
        get: jest.fn()
          .mockRejectedValueOnce({
            response: { status: 401 },
            config: { _retry: false },
          })
          .mockResolvedValueOnce({
            data: { success: true, data: { id: '1' } },
          }),
        post: jest.fn().mockResolvedValue(mockRefreshResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      };

      axios.create.mockReturnValue(axiosInstance);

      /****** This should trigger token refresh and retry and Implementation depends on your actual API interceptors ******/
      /****** Either Ankush or Priyanshu can fill this part based on actual implementation ******/
    });
  });
});
