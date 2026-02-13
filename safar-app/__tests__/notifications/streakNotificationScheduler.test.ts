/**
 * Tests for Streak Notification Scheduler
 * Story 5.5: Push Notifications - Streak Reminders
 * Task 3: Schedule streak reminder notification
 * Task 4: Schedule last-chance notification
 */

import * as Notifications from 'expo-notifications';
import {
  scheduleStreakReminder,
  scheduleLastChanceReminder,
  cancelAllStreakNotifications,
} from '@/lib/notifications/streakNotificationScheduler';

describe('streakNotificationScheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('scheduleStreakReminder', () => {
    it('schedules a notification with streak count in message', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('notif-1');

      await scheduleStreakReminder(5, 18);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: expect.stringContaining('streak'),
            body: expect.stringContaining('5'),
            data: expect.objectContaining({ type: 'streak_reminder' }),
          }),
        })
      );
    });

    it('schedules at the specified hour', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('notif-1');
      jest.setSystemTime(new Date(2026, 1, 12, 10, 0, 0));

      await scheduleStreakReminder(3, 14);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.trigger.type).toBe(Notifications.SchedulableTriggerInputTypes.DATE);
      expect(call.trigger.date).toBeInstanceOf(Date);
      expect(call.trigger.date.getHours()).toBe(14);
      expect(call.trigger.date.getMinutes()).toBe(0);
    });

    it('returns the notification identifier', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('notif-abc');

      const id = await scheduleStreakReminder(5, 18);

      expect(id).toBe('notif-abc');
    });

    it('uses streak_reminder data type for deep linking', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('notif-1');

      await scheduleStreakReminder(10, 20);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.content.data.type).toBe('streak_reminder');
    });

    it('returns null on scheduling error', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Schedule failed')
      );

      const id = await scheduleStreakReminder(5, 18);

      expect(id).toBeNull();
    });
  });

  describe('scheduleLastChanceReminder', () => {
    it('schedules notification for 11 PM (23:00)', async () => {
      // Set time to 8 PM - before 11 PM
      jest.setSystemTime(new Date(2026, 1, 12, 20, 0, 0));
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('lc-1');

      await scheduleLastChanceReminder(7);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: expect.stringContaining('1 hour'),
            body: expect.stringContaining('7'),
            data: expect.objectContaining({ type: 'streak_last_chance' }),
          }),
        })
      );
    });

    it('does NOT schedule if past 11 PM', async () => {
      // Set time to 11:30 PM - after 11 PM
      jest.setSystemTime(new Date(2026, 1, 12, 23, 30, 0));

      await scheduleLastChanceReminder(7);

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('returns the notification identifier', async () => {
      jest.setSystemTime(new Date(2026, 1, 12, 18, 0, 0));
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('lc-abc');

      const id = await scheduleLastChanceReminder(3);

      expect(id).toBe('lc-abc');
    });

    it('returns null when past 11 PM', async () => {
      jest.setSystemTime(new Date(2026, 1, 12, 23, 30, 0));

      const id = await scheduleLastChanceReminder(3);

      expect(id).toBeNull();
    });

    it('returns null on scheduling error', async () => {
      jest.setSystemTime(new Date(2026, 1, 12, 18, 0, 0));
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Schedule failed')
      );

      const id = await scheduleLastChanceReminder(5);

      expect(id).toBeNull();
    });

    it('includes streak count in notification body', async () => {
      jest.setSystemTime(new Date(2026, 1, 12, 18, 0, 0));
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('lc-1');

      await scheduleLastChanceReminder(42);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.content.body).toContain('42');
    });
  });

  describe('cancelAllStreakNotifications', () => {
    it('cancels only streak notifications', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        {
          identifier: 'streak-1',
          content: { data: { type: 'streak_reminder' } },
        },
        {
          identifier: 'review-1',
          content: { data: { type: 'review_reminder' } },
        },
      ]);

      await cancelAllStreakNotifications();

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('streak-1');
    });

    it('does not throw on cancel error', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Cancel failed')
      );

      await expect(cancelAllStreakNotifications()).resolves.not.toThrow();
    });
  });
});
