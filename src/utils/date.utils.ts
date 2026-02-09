/**
 * Date Formatting Utilities
 *
 * Format dates in Indian locale (DD-MM-YYYY)
 */

/**
 * Format date to DD-MM-YYYY format (Indian standard)
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return '-';
  }
}

/**
 * Format date to DD-MM-YYYY HH:MM format
 * @param date - Date string or Date object
 * @returns Formatted date-time string
 */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch {
    return '-';
  }
}

/**
 * Get relative time string (e.g., "2 days ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 30) return formatDate(d);
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
  } catch {
    return '-';
  }
}
