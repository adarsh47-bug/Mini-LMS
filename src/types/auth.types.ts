/**
 * Auth Types & Validation Schemas
 *
 * Centralized auth-related types and Zod schemas for validation
 */
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .trim(),
  email: z.email({ message: 'Enter a valid email address' })
    .transform(val => val.toLowerCase()),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.email({ message: 'Enter a valid email address' })
    .transform(val => val.toLowerCase()),
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ============================================================================
// API TYPES
// ============================================================================

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  loginType?: string;
  isEmailVerified: boolean;
  avatar?: {
    url: string;
    localPath?: string;
    localUri?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}
