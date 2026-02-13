/**
 * Review Notification Scheduler
 * Story 5.6: Push Notifications - Review Reminders
 *
 * Handles scheduling and cancelling review reminder notifications.
 */

import * as Notifications from 'expo-notifications';
import * as Sentry from '@/lib/utils/sentry';

export const REVIEW_REMINDER_ID_PREFIX = 'review-reminder';
const REVIEW_NOTIFICATION_TYPES = new Set(['review_reminder']);

function isReviewNotification(notification: Notifications.NotificationRequest): boolean {
  const type = (notification.content.data as { type?: unknown } | undefined)?.type;
  return typeof type === 'string' && REVIEW_NOTIFICATION_TYPES.has(type);
}

/**
 * Schedule a review reminder notification at the given hour.
 * AC #1: "X words ready for review"
 * Default hour: 9 AM
 */
export async function scheduleReviewReminder(
  dueCount: number,
  hour: number = 9
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reviews ready!',
        body: `${dueCount} words are waiting for review`,
        data: { type: 'review_reminder' },
        badge: dueCount,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });
    return id;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'review-scheduler', action: 'schedule-reminder' },
    });
    return null;
  }
}

/**
 * Cancel all scheduled review notifications.
 */
export async function cancelAllReviewNotifications(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const reviewNotifications = scheduled.filter(isReviewNotification);

    await Promise.all(
      reviewNotifications.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
    );
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'review-scheduler', action: 'cancel-all' },
    });
  }
}
