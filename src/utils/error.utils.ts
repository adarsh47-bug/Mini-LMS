/**
 * Error Utilities
 *
 * Shared error extraction and formatting for API errors.
 */

/**
 * Extract a user-friendly error message from an unknown error.
 * Handles Axios errors, standard Error objects, and unknown types.
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message || fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}
