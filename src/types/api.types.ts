/**
 * API Types
 *
 * Common API response types used across services.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
}
