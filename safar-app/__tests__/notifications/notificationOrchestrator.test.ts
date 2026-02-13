/**
 * Tests for Notification Orchestrator
 * Story 5.5: Push Notifications - Streak Reminders
 * Task 6: Cancel notifications after activity
 * Task 7: Respect notification preferences
 * Task 8: Limit to 1 notification per day
 *
 * Updated Story 7.2: Orchestrator now reads preferences from useSettingsStore
 * and checks permissions via notificationService instead of notificationPreferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  updateNotificationSchedule,
  onLearningActivityCompleted,
} from '@/lib/notifications/notificationOrchestrator';

// Mock dependencies used by the orchestrator
jest.mock('@/lib/notifications/notificationService', () => ({
  getNotificationPermissionStatus: jest.fn(() => Promise.resolve('granted')),
}));

jest.mock('@/lib/stores/useSettingsStore', () => ({
  useSettingsStore: {
    getState: jest.fn(() => ({ streakReminders: true })),
  },
}));

jest.mock('@/lib/notifications/streakNotificationScheduler', () => ({
  scheduleStreakReminder: jest.fn(() => Promise.resolve('notif-1')),
  scheduleLastChanceReminder: jest.fn(() => Promise.resolve('lc-1')),
  scheduleStreakReminderForTomorrow: jest.fn(() => Promise.resolve('tomorrow-1')),
  scheduleLastChanceReminderForTomorrow: jest.fn(() => Promise.resolve('tomorrow-lc-1')),
  cancelAllStreakNotifications: jest.fn(() => Promise.resolve()),
}));

const { getNotificationPermissionStatus } = require('@/lib/notifications/notificationService');
const { useSettingsStore } = require('@/lib/stores/useSettingsStore');
const {
  scheduleStreakReminder,
  scheduleLastChanceReminder,
  scheduleStreakReminderForTomorrow,
  scheduleLastChanceReminderForTomorrow,
  cancelAllStreakNotifications,
} = require('@/lib/notifications/streakNotificationScheduler');

const LAST_NOTIFICATION_KEY = '@safar/last-notification-date';
const DEFAULT_REMINDER_HOUR = 18; // 6 PM default

describe('notificationOrchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 1, 12, 14, 0, 0)); // 2 PM
    getNotificationPermissionStatus.mockResolvedValue('granted');
    useSettingsStore.getState.mockReturnValue({ streakReminders: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('updateNotificationSchedule', () => {
    it('cancels all notifications when preferences disabled', async () => {
      useSettingsStore.getState.mockReturnValue({ streakReminders: false });

      await updateNotificationSchedule({ currentStreak: 5, hasLearnedToday: false });

      expect(cancelAllStreakNotifications).toHaveBeenCalled();
      expect(scheduleStreakReminder).not.toHaveBeenCalled();
      expect(scheduleLastChanceReminder).not.toHaveBeenCalled();
    });

    it('does not schedule when user has already learned today', async () => {
      await updateNotificationSchedule({ currentStreak: 5, hasLearnedToday: true });

      expect(cancelAllStreakNotifications).toHaveBeenCalled();
      expect(scheduleStreakReminder).not.toHaveBeenCalled();
      expect(scheduleLastChanceReminder).not.toHaveBeenCalled();
    });

    it('schedules both reminders when enabled and not learned today', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null); // no last notification date

      await updateNotificationSchedule({ currentStreak: 7, hasLearnedToday: false });

      expect(cancelAllStreakNotifications).toHaveBeenCalled();
      expect(scheduleStreakReminder).toHaveBeenCalledWith(7, DEFAULT_REMINDER_HOUR);
      expect(scheduleLastChanceReminder).toHaveBeenCalledWith(7);
    });

    it('cancels existing before scheduling new', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      await updateNotificationSchedule({ currentStreak: 3, hasLearnedToday: false });

      // cancelAllStreakNotifications should be called before scheduling
      const cancelOrder = cancelAllStreakNotifications.mock.invocationCallOrder[0];
      const scheduleOrder = scheduleStreakReminder.mock.invocationCallOrder[0];
      expect(cancelOrder).toBeLessThan(scheduleOrder);
    });

    it('uses custom reminder hour if provided', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      await updateNotificationSchedule({
        currentStreak: 5,
        hasLearnedToday: false,
        reminderHour: 20,
      });

      expect(scheduleStreakReminder).toHaveBeenCalledWith(5, 20);
    });

    it('stores notification date after scheduling', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      await updateNotificationSchedule({ currentStreak: 5, hasLearnedToday: false });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(LAST_NOTIFICATION_KEY, '2026-02-12');
    });

    it('skips scheduling if already notified today (limit 1 per day)', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('2026-02-12'); // already notified today

      await updateNotificationSchedule({ currentStreak: 5, hasLearnedToday: false });

      expect(scheduleStreakReminder).not.toHaveBeenCalled();
      expect(scheduleLastChanceReminder).not.toHaveBeenCalled();
    });

    it('schedules if last notification was a different day', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('2026-02-11'); // yesterday

      await updateNotificationSchedule({ currentStreak: 5, hasLearnedToday: false });

      expect(scheduleStreakReminder).toHaveBeenCalled();
      expect(scheduleLastChanceReminder).toHaveBeenCalled();
    });

    it('does not throw on error', async () => {
      getNotificationPermissionStatus.mockRejectedValueOnce(new Error('Permission error'));

      await expect(
        updateNotificationSchedule({ currentStreak: 5, hasLearnedToday: false })
      ).resolves.not.toThrow();
    });
  });

  describe('onLearningActivityCompleted', () => {
    it('cancels today and schedules reminders for tomorrow', async () => {
      await onLearningActivityCompleted(8);

      expect(cancelAllStreakNotifications).toHaveBeenCalled();
      expect(scheduleStreakReminderForTomorrow).toHaveBeenCalledWith(8, DEFAULT_REMINDER_HOUR);
      expect(scheduleLastChanceReminderForTomorrow).toHaveBeenCalledWith(8);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(LAST_NOTIFICATION_KEY, '2026-02-13');
    });

    it('does not reschedule when preferences are disabled', async () => {
      useSettingsStore.getState.mockReturnValue({ streakReminders: false });

      await onLearningActivityCompleted(8);

      expect(cancelAllStreakNotifications).toHaveBeenCalled();
      expect(scheduleStreakReminderForTomorrow).not.toHaveBeenCalled();
      expect(scheduleLastChanceReminderForTomorrow).not.toHaveBeenCalled();
    });

    it('does not throw on cancel error', async () => {
      cancelAllStreakNotifications.mockRejectedValueOnce(new Error('Cancel error'));

      await expect(onLearningActivityCompleted()).resolves.not.toThrow();
    });
  });
});
