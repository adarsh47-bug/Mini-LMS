/**
 * Notification Types
 * 
 * Type definitions for the unified notification system
 */

export type NotificationPosition = 'top' | 'bottom';

export type NotificationVariant = 'save' | 'archive' | 'delete' | 'custom' | 'success' | 'error' | 'info' | 'warning';

export interface NotificationAction {
  label: string;
  onPress?: () => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  variant?: NotificationVariant;
  duration?: number; // ms
  position?: NotificationPosition;
  actions?: NotificationAction[];
  /** Extra metadata to pass through */
  meta?: Record<string, unknown>;
}

export type NotificationPayload = Omit<Partial<NotificationItem>, 'id'> & { title: string };
