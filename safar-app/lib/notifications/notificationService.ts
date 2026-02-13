/**
 * Notification Service
 * Story 5.5: Push Notifications - Streak Reminders
 *
 * Configures expo-notifications handlers and permission management.
 */

import * as Notifications from 'expo-notifications';
import * as Sentry from '@/lib/utils/sentry';

/**
 * Configure the global notification handler.
 * Call this once at app startup (e.g., in _layout.tsx).
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Request notification permissions from the user.
 * Returns true if granted, false otherwise.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'notification-service', action: 'request-permissions' },
    });
    return false;
  }
}

/**
 * Get the current notification permission status.
 */
export async function getNotificationPermissionStatus(): Promise<string> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'notification-service', action: 'get-permission-status' },
    });
    return 'denied';
  }
}
