/**
 * API Types
 *
 * Common API response and error types
 */

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ============================================================================
// HTTP METHOD TYPES
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// ============================================================================
// REQUEST CONFIG TYPES
// ============================================================================

export interface RequestConfig {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}
