/**
 * Tests for Review Notification Scheduler
 * Story 5.6: Push Notifications - Review Reminders
 * Task 1: Schedule daily review notification
 */

import * as Notifications from 'expo-notifications';
import {
  scheduleReviewReminder,
  cancelAllReviewNotifications,
  REVIEW_REMINDER_ID_PREFIX,
} from '@/lib/notifications/reviewNotificationScheduler';

describe('reviewNotificationScheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('scheduleReviewReminder', () => {
    it('schedules a notification with due count in message', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('review-1');

      await scheduleReviewReminder(5, 9);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            body: expect.stringContaining('5'),
            data: expect.objectContaining({ type: 'review_reminder' }),
          }),
        })
      );
    });

    it('defaults to 9 AM when no hour specified', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('review-1');

      await scheduleReviewReminder(3);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.trigger.type).toBe(Notifications.SchedulableTriggerInputTypes.DAILY);
      expect(call.trigger.hour).toBe(9);
      expect(call.trigger.minute).toBe(0);
    });

    it('schedules at the specified hour', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('review-1');

      await scheduleReviewReminder(3, 14);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.trigger.type).toBe(Notifications.SchedulableTriggerInputTypes.DAILY);
      expect(call.trigger.hour).toBe(14);
      expect(call.trigger.minute).toBe(0);
    });

    it('uses a recurring daily trigger', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('review-1');

      await scheduleReviewReminder(3, 9);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.trigger.type).toBe(Notifications.SchedulableTriggerInputTypes.DAILY);
      expect(call.trigger.hour).toBe(9);
      expect(call.trigger.minute).toBe(0);
    });

    it('uses review_reminder data type for deep linking', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('review-1');

      await scheduleReviewReminder(10, 9);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.content.data.type).toBe('review_reminder');
    });

    it('includes badge count in notification content', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('review-1');

      await scheduleReviewReminder(7, 9);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.content.badge).toBe(7);
    });

    it('returns the notification identifier', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('review-abc');

      const id = await scheduleReviewReminder(5, 9);

      expect(id).toBe('review-abc');
    });

    it('returns null on scheduling error', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Schedule failed')
      );

      const id = await scheduleReviewReminder(5, 9);

      expect(id).toBeNull();
    });
  });

  describe('cancelAllReviewNotifications', () => {
    it('cancels only review notifications', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        {
          identifier: 'review-1',
          content: { data: { type: 'review_reminder' } },
        },
        {
          identifier: 'streak-1',
          content: { data: { type: 'streak_reminder' } },
        },
      ]);

      await cancelAllReviewNotifications();

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('review-1');
    });

    it('does not throw on cancel error', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Cancel failed')
      );

      await expect(cancelAllReviewNotifications()).resolves.not.toThrow();
    });
  });

  describe('REVIEW_REMINDER_ID_PREFIX', () => {
    it('exports the correct prefix', () => {
      expect(REVIEW_REMINDER_ID_PREFIX).toBe('review-reminder');
    });
  });
});
