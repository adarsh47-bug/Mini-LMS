/**
 * Notification Service
 *
 * Handles local push notifications using expo-notifications.
 * Manages permission requests, bookmark milestones, and inactivity reminders.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Configure how notifications appear when app is in foreground */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ============================================================================
// STORAGE KEYS
// ============================================================================

const NOTIFICATION_KEYS = {
  lastOpenTime: '@app_last_open_time',
  bookmarkMilestoneShown: '@bookmark_milestone_shown',
} as const;

// ============================================================================
// PERMISSION HANDLING
// ============================================================================

/** Request notification permissions. Returns true if granted. */
export async function requestNotificationPermissions(): Promise<boolean> {
  // Physical device check — notifications don't work on simulators
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();

  // Android requires notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  return status === 'granted';
}

// ============================================================================
// LOCAL NOTIFICATION TRIGGERS
// ============================================================================

/** Send a local notification immediately */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<string | undefined> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Immediate
    });
    return id;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return undefined;
  }
}

/**
 * Check bookmark count and send milestone notification when user
 * bookmarks 5+ courses (only triggers once).
 */
export async function checkBookmarkMilestone(bookmarkCount: number): Promise<void> {
  if (bookmarkCount < 5) return;

  try {
    const alreadyShown = await AsyncStorage.getItem(NOTIFICATION_KEYS.bookmarkMilestoneShown);
    if (alreadyShown) return;

    await sendLocalNotification(
      '🎉 Bookworm Achievement!',
      `You've bookmarked ${bookmarkCount} courses! Time to start learning — check out your bookmarks.`,
      { type: 'bookmark_milestone' },
    );

    await AsyncStorage.setItem(NOTIFICATION_KEYS.bookmarkMilestoneShown, 'true');
  } catch (error) {
    console.error('Failed to check bookmark milestone:', error);
  }
}

/** Reset the bookmark milestone (e.g., on logout) */
export async function resetBookmarkMilestone(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTIFICATION_KEYS.bookmarkMilestoneShown);
  } catch {
    // Non-critical
  }
}

// ============================================================================
// INACTIVITY REMINDER
// ============================================================================

/**
 * Record the current time as "last opened". Call on every app launch.
 */
export async function recordAppOpen(): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_KEYS.lastOpenTime, Date.now().toString());
  } catch {
    // Non-critical
  }
}

/**
 * Schedule a reminder notification for 24 hours from now.
 * Cancels any previously scheduled reminder first.
 */
export async function scheduleInactivityReminder(): Promise<void> {
  try {
    // Cancel existing reminders
    await cancelInactivityReminder();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Miss your courses?',
        body: "You haven't opened the app in a while. Your courses are waiting for you!",
        data: { type: 'inactivity_reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 24 * 60 * 60, // 24 hours
      },
    });
  } catch (error) {
    console.error('Failed to schedule inactivity reminder:', error);
  }
}

/** Cancel any scheduled inactivity reminders */
export async function cancelInactivityReminder(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === 'inactivity_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch {
    // Non-critical
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize notification system on app launch.
 * Requests permissions, records app open time, and schedules inactivity reminder.
 */
export async function initializeNotifications(): Promise<boolean> {
  const granted = await requestNotificationPermissions();

  if (granted) {
    await recordAppOpen();
    await scheduleInactivityReminder();
  }

  return granted;
}
