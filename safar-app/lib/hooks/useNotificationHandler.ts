/**
 * useNotificationHandler Hook
 * Story 5.5: Push Notifications - Streak Reminders
 * Story 5.6: Push Notifications - Review Reminders
 *
 * Handles notification taps and deep-links to the appropriate screen.
 * Mount this in the root layout to handle all notification interactions.
 */

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

const REVIEW_SCREEN_NOTIFICATION_TYPES = [
  'streak_reminder',
  'streak_last_chance',
  'review_reminder',
];

function handleNotificationResponse(
  response: Notifications.NotificationResponse | null | undefined
): void {
  if (!response) return;

  const data = response.notification.request.content.data;
  if (data?.type && REVIEW_SCREEN_NOTIFICATION_TYPES.includes(data.type as string)) {
    router.push('/(tabs)/review');
    return;
  }

  if (data?.type === 'learning_reminder') {
    router.push('/(tabs)/learn');
  }
}

/**
 * Hook that listens for notification taps and navigates accordingly.
 * AC #3: Tapping notification deep-links to the Continue/Review screen.
 */
export function useNotificationHandler(): void {
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        handleNotificationResponse(response);
      })
      .catch(() => {
        // Best effort only
      });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationResponse(response);
      }
    );

    const receivedSubscription = Notifications.addNotificationReceivedListener(() => {
      // Foreground notification handling - no action needed,
      // the notification handler config shows the alert
    });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, []);
}
