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

/**
 * Register a new user account
 * 
 * @param payload - User registration data including email, username, and password
 * @param payload.email - User's email address (must be valid format)
 * @param payload.username - Unique username (3-50 characters)
 * @param payload.password - Password (minimum 6 characters)
 * @returns Promise resolving to API response with user data
 * @throws {AxiosError} When registration fails (e.g., duplicate email/username)
 * 
 * @example
 * ```typescript
 * const response = await registerUser({
 *   email: 'user@example.com',
 *   username: 'johndoe',
 *   password: 'securePassword123'
 * });
 * console.log(response.data.user);
 * ```
 */
export async function registerUser(payload: RegisterPayload): Promise<ApiResponse<{ user: User }>> {
  const { data } = await apiClient.post<ApiResponse<{ user: User }>>('/users/register', payload);
  return data;
}

/**
 * Authenticate user and obtain access tokens
 * 
 * @param payload - Login credentials
 * @param payload.username - Username or email address
 * @param payload.password - User's password
 * @returns Promise resolving to API response with access token, refresh token, and user data
 * @throws {AxiosError} When credentials are invalid or account is locked
 * 
 * @example
 * ```typescript
 * const response = await loginUser({
 *   username: 'johndoe',
 *   password: 'securePassword123'
 * });
 * const { accessToken, refreshToken, user } = response.data;
 * ```
 */
export async function loginUser(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/users/login', payload);
  return data;
}

/**
 * Fetch currently authenticated user's profile
 * 
 * Requires valid access token in request headers (automatically injected by apiClient).
 * 
 * @returns Promise resolving to API response with current user's profile data
 * @throws {AxiosError} When user is not authenticated (401) or token is invalid
 * 
 * @example
 * ```typescript
 * const response = await getCurrentUser();
 * console.log(response.data); // { id, username, email, ... }
 * ```
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  const { data } = await apiClient.get<ApiResponse<User>>('/users/current-user');
  return data;
}

/**
 * Logout current user and invalidate session
 * 
 * Clears tokens on the server side. Client should also clear local tokens after calling this.
 * 
 * @returns Promise resolving to API response confirming logout
 * @throws {AxiosError} When logout request fails
 * 
 * @example
 * ```typescript
 * await logoutUser();
 * await clearTokens(); // Clear local tokens
 * ```
 */
export async function logoutUser(): Promise<ApiResponse> {
  const { data } = await apiClient.post<ApiResponse>('/users/logout');
  return data;
}

/**
 * Resend email verification link to user's email
 * 
 * Used when initial verification email was not received or expired.
 * 
 * @param email - Email address to send verification link to
 * @returns Promise resolving to API response confirming email sent
 * @throws {AxiosError} When email is invalid or already verified
 * 
 * @example
 * ```typescript
 * await resendEmailVerification('user@example.com');
 * // Email sent successfully
 * ```
 */
export async function resendEmailVerification(email: string): Promise<ApiResponse> {
  const { data } = await apiClient.post<ApiResponse>('/users/resend-email-verification', { email });
  return data;
}

/**
 * Change authenticated user's password
 * 
 * Requires user to provide current password for security verification.
 * 
 * @param currentPassword - User's current password for verification
 * @param newPassword - New password to set (minimum 6 characters)
 * @returns Promise resolving to API response confirming password change
 * @throws {AxiosError} When current password is incorrect or new password is invalid
 * 
 * @example
 * ```typescript
 * await changePassword('oldPassword', 'newSecurePassword123');
 * // Password changed successfully
 * ```
 */
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
