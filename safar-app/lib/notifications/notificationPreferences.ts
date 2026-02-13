/**
 * Notification Preferences
 * Story 5.5: Push Notifications - Streak Reminders
 *
 * AsyncStorage-based notification preference management.
 * Follows the same pattern as useFeedbackPreferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@/lib/utils/sentry';
import {
  requestNotificationPermissions,
  getNotificationPermissionStatus,
} from './notificationService';

const NOTIFICATIONS_ENABLED_KEY = 'preferences.notificationsEnabled';

export interface NotificationPreferences {
  enabled: boolean;
}

/**
 * Get the stored notification preference.
 * Defaults to true (enabled) if no stored value.
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    const permissionStatus = await getNotificationPermissionStatus();
    if (permissionStatus !== 'granted') {
      return { enabled: false };
    }

    if (raw === null) return { enabled: true };
    return { enabled: raw === 'true' };
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'notification-preferences', action: 'get' },
    });
    return { enabled: false };
  }
}

/**
 * Store the notification enabled preference.
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(enabled));
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'notification-preferences', action: 'set' },
    });
  }
}

/**
 * Initialize notification preferences by requesting OS permissions.
 * Stores the result in AsyncStorage.
 * Returns true if permissions were granted.
 */
export async function initNotificationPreferences(): Promise<boolean> {
  try {
    const granted = await requestNotificationPermissions();
    await setNotificationsEnabled(granted);
    return granted;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'notification-preferences', action: 'init' },
    });
    await setNotificationsEnabled(false);
    return false;
  }
}
