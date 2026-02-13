/**
 * Learning Notification Scheduler
 * Story 7.2: Notification Preferences - Learning reminders
 *
 * Handles scheduling and cancelling generic daily learning reminders.
 */

import * as Notifications from 'expo-notifications';
import * as Sentry from '@/lib/utils/sentry';

export const LEARNING_REMINDER_ID_PREFIX = 'learning-reminder';
const LEARNING_NOTIFICATION_TYPES = new Set(['learning_reminder']);
const DEFAULT_LEARNING_REMINDER_HOUR = 19; // 7 PM

function isLearningNotification(notification: Notifications.NotificationRequest): boolean {
  const type = (notification.content.data as { type?: unknown } | undefined)?.type;
  return typeof type === 'string' && LEARNING_NOTIFICATION_TYPES.has(type);
}

/**
 * Schedule a generic daily learning reminder notification.
 */
export async function scheduleLearningReminder(
  hour: number = DEFAULT_LEARNING_REMINDER_HOUR
): Promise<string | null> {
  try {
    const clampedHour = Math.min(23, Math.max(0, Math.floor(hour)));
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Learning time!',
        body: "Your daily session is waiting. Let's keep your momentum.",
        data: { type: 'learning_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: clampedHour,
        minute: 0,
      },
    });
    return id;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'learning-scheduler', action: 'schedule-reminder' },
    });
    return null;
  }
}

/**
 * Cancel all scheduled learning reminder notifications.
 */
export async function cancelAllLearningNotifications(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const learningNotifications = scheduled.filter(isLearningNotification);

    await Promise.all(
      learningNotifications.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
    );
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'learning-scheduler', action: 'cancel-all' },
    });
  }
}
