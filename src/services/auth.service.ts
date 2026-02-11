/**
 * Authentication API Service
 *
 * All auth-related API calls mapped to FreeAPI endpoints.
 * Returns typed responses for type-safe consumption.
 */

import type { ApiResponse, LoginPayload, LoginResponse, RegisterPayload, User } from '@/src/types';
import { apiClient } from './api';

// ============================================================================
// API CALLS
// ============================================================================

/** Register a new user */
export async function registerUser(payload: RegisterPayload): Promise<ApiResponse<{ user: User }>> {
  const { data } = await apiClient.post<ApiResponse<{ user: User }>>('/users/register', payload);
  return data;
}

/** Login user and receive tokens */
export async function loginUser(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/users/login', payload);
  return data;
}

/** Get current logged-in user profile */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  const { data } = await apiClient.get<ApiResponse<User>>('/users/current-user');
  return data;
}

/** Logout user */
export async function logoutUser(): Promise<ApiResponse> {
  const { data } = await apiClient.post<ApiResponse>('/users/logout');
  return data;
}

/** Resend email verification */
export async function resendEmailVerification(email: string): Promise<ApiResponse> {
  const { data } = await apiClient.post<ApiResponse>('/users/resend-email-verification', { email });
  return data;
}

/** Change password (authenticated) */
export async function changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
  const { data } = await apiClient.post<ApiResponse>('/users/change-password', {
    currentPassword,
    newPassword,
  });
  return data;
}

/** Forgot password — sends reset email */
export async function forgotPassword(email: string): Promise<ApiResponse> {
  const { data } = await apiClient.post<ApiResponse>('/users/forgot-password', { email });
  return data;
}

/** Update avatar (multipart) */
export async function updateAvatar(imageUri: string): Promise<ApiResponse<{ avatar: string }>> {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('avatar', {
    uri: imageUri,
    name: filename,
    type,
  } as unknown as Blob);

  const { data } = await apiClient.patch<ApiResponse<{ avatar: string }>>('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
