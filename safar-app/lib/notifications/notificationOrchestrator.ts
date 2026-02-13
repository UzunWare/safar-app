/**
 * Notification Orchestrator
 * Story 5.5: Push Notifications - Streak Reminders
 *
 * Coordinates notification scheduling, cancellation, and preferences.
 * This is the main entry point for managing streak notifications.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@/lib/utils/sentry';
import { useSettingsStore } from '@/lib/stores/useSettingsStore';
import { getNotificationPermissionStatus } from './notificationService';
import {
  scheduleStreakReminder,
  scheduleLastChanceReminder,
  scheduleStreakReminderForTomorrow,
  scheduleLastChanceReminderForTomorrow,
  cancelAllStreakNotifications,
} from './streakNotificationScheduler';

const LAST_NOTIFICATION_KEY = '@safar/last-notification-date';
const TYPICAL_LEARNING_HOUR_KEY = '@safar/typical-learning-hour';
const DEFAULT_REMINDER_HOUR = 18; // 6 PM

interface ScheduleParams {
  currentStreak: number;
  hasLearnedToday: boolean;
  reminderHour?: number;
  enabled?: boolean;
}

function getDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getTodayDateString(): string {
  return getDateString(new Date());
}

function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getDateString(tomorrow);
}

function normalizeHour(hour: number): number {
  return Math.min(23, Math.max(0, Math.floor(hour)));
}

async function getTypicalLearningHour(): Promise<number> {
  const raw = await AsyncStorage.getItem(TYPICAL_LEARNING_HOUR_KEY);
  if (!raw) return DEFAULT_REMINDER_HOUR;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_REMINDER_HOUR;
  return normalizeHour(parsed);
}

async function setTypicalLearningHour(hour: number): Promise<void> {
  await AsyncStorage.setItem(TYPICAL_LEARNING_HOUR_KEY, String(normalizeHour(hour)));
}

async function isStreakReminderEnabled(enabledOverride?: boolean): Promise<boolean> {
  const permissionStatus = await getNotificationPermissionStatus();
  if (permissionStatus !== 'granted') {
    return false;
  }

  if (typeof enabledOverride === 'boolean') {
    return enabledOverride;
  }

  return useSettingsStore.getState().streakReminders;
}

/**
 * Record the hour when learning activity happened, so reminders can follow user behavior.
 */
export async function recordTypicalLearningHour(at: Date = new Date()): Promise<void> {
  try {
    await setTypicalLearningHour(at.getHours());
  } catch {
    // Best effort only
  }
}

/**
 * Update the notification schedule based on current state.
 * Call on app launch, after settings changes, or after learning activity.
 *
 * - Respects user notification preferences (AC #4)
 * - Cancels if user already learned today (AC #1, #2)
 * - Limits to 1 notification scheduling per day (Task 8)
 */
export async function updateNotificationSchedule(params: ScheduleParams): Promise<void> {
  try {
    const enabled = await isStreakReminderEnabled(params.enabled);

    // Respect settings and permission state.
    if (!enabled) {
      await cancelAllStreakNotifications();
      return;
    }

    // Cancel if already learned today
    if (params.hasLearnedToday) {
      await cancelAllStreakNotifications();
      return;
    }

    if (params.currentStreak <= 0) {
      await cancelAllStreakNotifications();
      return;
    }

    // Task 8: Limit to 1 notification per day
    const today = getTodayDateString();
    const lastNotificationDate = await AsyncStorage.getItem(LAST_NOTIFICATION_KEY);
    if (lastNotificationDate === today) {
      return;
    }

    // Cancel existing before scheduling new
    await cancelAllStreakNotifications();

    const hour =
      typeof params.reminderHour === 'number'
        ? normalizeHour(params.reminderHour)
        : await getTypicalLearningHour();
    const streakReminderId = await scheduleStreakReminder(params.currentStreak, hour);
    const lastChanceReminderId = await scheduleLastChanceReminder(params.currentStreak);

    // Only mark as scheduled when at least one reminder was created.
    if (streakReminderId || lastChanceReminderId) {
      await AsyncStorage.setItem(LAST_NOTIFICATION_KEY, today);
    } else {
      await AsyncStorage.removeItem(LAST_NOTIFICATION_KEY);
    }
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'notification-orchestrator', action: 'update-schedule' },
    });
  }
}

/**
 * Call when user completes a learning activity.
 * Cancels all pending streak notifications for the day.
 */
export async function onLearningActivityCompleted(currentStreak?: number): Promise<void> {
  try {
    await recordTypicalLearningHour();

    const enabled = await isStreakReminderEnabled();
    await cancelAllStreakNotifications();

    if (!enabled) {
      await AsyncStorage.removeItem(LAST_NOTIFICATION_KEY);
      return;
    }

    const streakForTomorrow = Math.max(1, currentStreak ?? 1);
    const reminderHour = await getTypicalLearningHour();
    const tomorrowReminderId = await scheduleStreakReminderForTomorrow(
      streakForTomorrow,
      reminderHour
    );
    const tomorrowLastChanceId = await scheduleLastChanceReminderForTomorrow(streakForTomorrow);

    if (tomorrowReminderId || tomorrowLastChanceId) {
      await AsyncStorage.setItem(LAST_NOTIFICATION_KEY, getTomorrowDateString());
    } else {
      await AsyncStorage.removeItem(LAST_NOTIFICATION_KEY);
    }
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'notification-orchestrator', action: 'activity-completed' },
    });
  }
}
