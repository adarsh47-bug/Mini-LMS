/**
 * Auth Service Tests
 */

import type { ApiResponse, LoginPayload, LoginResponse, RegisterPayload } from '@/src/types';
import { apiClient } from '../api';
import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../auth.service';

// Mock the API client
jest.mock('../api');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const payload: RegisterPayload = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
          },
        },
        message: 'Registration successful',
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await registerUser(payload);

      expect(result.success).toBe(true);
      expect(result.data?.user.username).toBe('testuser');
      expect(mockApiClient.post).toHaveBeenCalledWith('/users/register', payload);
    });

    it('should handle registration error', async () => {
      const payload: RegisterPayload = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockApiClient.post.mockRejectedValueOnce(new Error('Registration failed'));

      await expect(registerUser(payload)).rejects.toThrow('Registration failed');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const payload: LoginPayload = {
        username: 'testuser',
        password: 'Password123!',
      };

      const mockResponse: ApiResponse<LoginResponse> = {
        success: true,
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: {
            _id: '1',
            username: 'testuser',
            email: 'test@example.com',
            avatar: {
              url: 'https://example.com/avatar.jpg',
            },
            role: 'user',
            isEmailVerified: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        },
        message: 'Login successful',
        statusCode: 200,
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await loginUser(payload);

      expect(result.success).toBe(true);
      expect(result.data?.accessToken).toBe('access-token');
      expect(mockApiClient.post).toHaveBeenCalledWith('/users/login', payload);
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('testuser');
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/current-user');
    });
  });

  describe('logoutUser', () => {
    it('should logout user successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Logged out successfully',
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await logoutUser();

      expect(result.success).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledWith('/users/logout');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Password changed successfully',
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await changePassword('OldPass123!', 'NewPass123!');

      expect(result.success).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledWith('/users/change-password', {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset email sent',
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await forgotPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledWith('/users/forgot-password', {
        email: 'test@example.com',
      });
    });
  });
});
