/**
 * Review Notification Orchestrator
 * Story 5.6: Push Notifications - Review Reminders
 *
 * Coordinates review notification scheduling, cancellation, badge count,
 * and preferences. Main entry point for managing review notifications.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Sentry from '@/lib/utils/sentry';
import { useSettingsStore } from '@/lib/stores/useSettingsStore';
import { getNotificationPermissionStatus } from './notificationService';
import { getDueReviewCount } from '../api/reviewCount';
import {
  scheduleReviewReminder,
  cancelAllReviewNotifications,
} from './reviewNotificationScheduler';

const LAST_REVIEW_NOTIFICATION_KEY = '@safar/last-review-notification-date';
const REVIEW_REMINDER_HOUR_KEY = '@safar/review-reminder-hour';
const DEFAULT_REVIEW_REMINDER_HOUR = 9;

function getDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getTodayDateString(): string {
  return getDateString(new Date());
}

function normalizeHour(hour: number): number {
  return Math.min(23, Math.max(0, Math.floor(hour)));
}

async function isReviewReminderEnabled(enabledOverride?: boolean): Promise<boolean> {
  const permissionStatus = await getNotificationPermissionStatus();
  if (permissionStatus !== 'granted') {
    return false;
  }

  if (typeof enabledOverride === 'boolean') {
    return enabledOverride;
  }

  return useSettingsStore.getState().reviewReminders;
}

/**
 * Get the configured review reminder hour.
 * Default: 9 AM.
 */
export async function getReviewReminderHour(): Promise<number> {
  const raw = await AsyncStorage.getItem(REVIEW_REMINDER_HOUR_KEY);
  if (!raw) return DEFAULT_REVIEW_REMINDER_HOUR;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_REVIEW_REMINDER_HOUR;
  return normalizeHour(parsed);
}

/**
 * Set the review reminder hour.
 */
export async function setReviewReminderHour(hour: number): Promise<void> {
  await AsyncStorage.setItem(REVIEW_REMINDER_HOUR_KEY, String(normalizeHour(hour)));
}

/**
 * Update the review notification schedule.
 * Call on app launch, after settings changes, or periodically.
 *
 * - Checks notification preferences
 * - Gets due review count from Supabase
 * - Skips if count is 0 (AC #3)
 * - Schedules if reviews are due (AC #1)
 * - Limits to 1 scheduling per day
 */
export async function updateReviewNotificationSchedule(
  userId: string,
  reminderHour?: number,
  enabledOverride?: boolean
): Promise<void> {
  try {
    if (!userId) return;

    const enabled = await isReviewReminderEnabled(enabledOverride);

    if (!enabled) {
      await cancelAllReviewNotifications();
      await AsyncStorage.removeItem(LAST_REVIEW_NOTIFICATION_KEY);
      return;
    }

    const dueCount = await getDueReviewCount(userId);

    // AC #3: No notification if no reviews due
    if (dueCount === 0) {
      await cancelAllReviewNotifications();
      await AsyncStorage.removeItem(LAST_REVIEW_NOTIFICATION_KEY);
      return;
    }

    // Limit to 1 scheduling per day
    const today = getTodayDateString();
    const lastDate = await AsyncStorage.getItem(LAST_REVIEW_NOTIFICATION_KEY);
    const forceReschedule = typeof reminderHour === 'number';
    if (!forceReschedule && lastDate === today) {
      return;
    }

    // Cancel existing before scheduling new
    await cancelAllReviewNotifications();

    const hour =
      typeof reminderHour === 'number'
        ? normalizeHour(reminderHour)
        : await getReviewReminderHour();

    const id = await scheduleReviewReminder(dueCount, hour);

    if (id) {
      await AsyncStorage.setItem(LAST_REVIEW_NOTIFICATION_KEY, today);
    }
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'review-notification-orchestrator', action: 'update-schedule' },
    });
  }
}

/**
 * Call when user completes a review session.
 * Cancels pending notification and reschedules if reviews remain (AC #4).
 * Updates badge count.
 */
export async function onReviewSessionCompleted(
  userId: string,
  enabledOverride?: boolean
): Promise<void> {
  try {
    if (!userId) return;

    await cancelAllReviewNotifications();

    const remaining = await getDueReviewCount(userId);
    const enabled = await isReviewReminderEnabled(enabledOverride);

    if (!enabled) {
      await Notifications.setBadgeCountAsync(0);
      await AsyncStorage.removeItem(LAST_REVIEW_NOTIFICATION_KEY);
      return;
    }

    if (remaining > 0) {
      const hour = await getReviewReminderHour();
      const id = await scheduleReviewReminder(remaining, hour);
      if (id) {
        await AsyncStorage.setItem(LAST_REVIEW_NOTIFICATION_KEY, getTodayDateString());
      } else {
        await AsyncStorage.removeItem(LAST_REVIEW_NOTIFICATION_KEY);
      }
    } else {
      await AsyncStorage.removeItem(LAST_REVIEW_NOTIFICATION_KEY);
    }

    // Update badge count
    await Notifications.setBadgeCountAsync(remaining);
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'review-notification-orchestrator', action: 'review-completed' },
    });
  }
}

/**
 * Update the app badge count with current due review count.
 * Call on app foreground, after review sessions, etc.
 */
export async function updateBadgeCount(userId: string): Promise<void> {
  try {
    const count = await getDueReviewCount(userId);
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'review-notification-orchestrator', action: 'update-badge' },
    });
  }
}
