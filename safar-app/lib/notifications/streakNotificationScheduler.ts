/**
 * Streak Notification Scheduler
 * Story 5.5: Push Notifications - Streak Reminders
 *
 * Handles scheduling and cancelling streak reminder notifications.
 */

import * as Notifications from 'expo-notifications';
import * as Sentry from '@/lib/utils/sentry';

export const STREAK_REMINDER_ID_PREFIX = 'streak-reminder';
export const LAST_CHANCE_REMINDER_ID_PREFIX = 'streak-last-chance';
const STREAK_NOTIFICATION_TYPES = new Set(['streak_reminder', 'streak_last_chance']);

function resolveNextTriggerDate(hour: number, minute: number): Date {
  const now = new Date();
  const trigger = new Date(now);
  trigger.setHours(hour, minute, 0, 0);
  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }
  return trigger;
}

function resolveTomorrowTriggerDate(hour: number, minute: number): Date {
  const trigger = new Date();
  trigger.setDate(trigger.getDate() + 1);
  trigger.setHours(hour, minute, 0, 0);
  return trigger;
}

function isStreakNotification(notification: Notifications.NotificationRequest): boolean {
  const type = (notification.content.data as { type?: unknown } | undefined)?.type;
  return typeof type === 'string' && STREAK_NOTIFICATION_TYPES.has(type);
}

/**
 * Schedule a daily streak reminder notification at the given hour.
 * AC #1: "Don't lose your X-day streak!"
 */
export async function scheduleStreakReminder(
  streakCount: number,
  hour: number
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't lose your streak!",
        body: `Keep your ${streakCount}-day streak going!`,
        data: { type: 'streak_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: resolveNextTriggerDate(hour, 0),
      },
    });
    return id;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'streak-scheduler', action: 'schedule-reminder' },
    });
    return null;
  }
}

/**
 * Schedule a last-chance notification for 11 PM (1 hour before midnight).
 * AC #2: "Your streak ends in 1 hour!"
 * Only schedules if current time is before 11 PM.
 */
export async function scheduleLastChanceReminder(streakCount: number): Promise<string | null> {
  const now = new Date();
  const elevenPm = new Date(now);
  elevenPm.setHours(23, 0, 0, 0);

  if (now >= elevenPm) {
    return null;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your streak ends in 1 hour!',
        body: `Quick! Complete a lesson to save your ${streakCount}-day streak.`,
        data: { type: 'streak_last_chance' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: elevenPm,
      },
    });
    return id;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'streak-scheduler', action: 'schedule-last-chance' },
    });
    return null;
  }
}

/**
 * Schedule tomorrow's streak reminder.
 * Used after the user completes activity and today's reminders are canceled.
 */
export async function scheduleStreakReminderForTomorrow(
  streakCount: number,
  hour: number
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't lose your streak!",
        body: `Keep your ${streakCount}-day streak going!`,
        data: { type: 'streak_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: resolveTomorrowTriggerDate(hour, 0),
      },
    });
    return id;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'streak-scheduler', action: 'schedule-tomorrow-reminder' },
    });
    return null;
  }
}

/**
 * Schedule tomorrow's last-chance reminder.
 * Used after the user completes activity and today's reminders are canceled.
 */
export async function scheduleLastChanceReminderForTomorrow(
  streakCount: number
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your streak ends in 1 hour!',
        body: `Quick! Complete a lesson to save your ${streakCount}-day streak.`,
        data: { type: 'streak_last_chance' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: resolveTomorrowTriggerDate(23, 0),
      },
    });
    return id;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'streak-scheduler', action: 'schedule-tomorrow-last-chance' },
    });
    return null;
  }
}

/**
 * Cancel all scheduled streak notifications.
 */
export async function cancelAllStreakNotifications(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const streakNotifications = scheduled.filter(isStreakNotification);

    await Promise.all(
      streakNotifications.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
    );
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'streak-scheduler', action: 'cancel-all' },
    });
  }
}
