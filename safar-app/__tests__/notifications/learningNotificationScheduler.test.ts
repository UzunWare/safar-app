/**
 * Tests for Learning Notification Scheduler
 * Story 7.2: Notification Preferences - Learning reminders
 *
 * Tests scheduling, cancellation, hour clamping, type filtering,
 * and error handling for daily learning reminder notifications.
 */

import * as Notifications from 'expo-notifications';
import {
  scheduleLearningReminder,
  cancelAllLearningNotifications,
} from '@/lib/notifications/learningNotificationScheduler';

describe('learningNotificationScheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scheduleLearningReminder', () => {
    it('schedules a daily learning reminder notification', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('learning-1');

      await scheduleLearningReminder();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: expect.any(String),
            body: expect.any(String),
            data: expect.objectContaining({ type: 'learning_reminder' }),
          }),
          trigger: expect.objectContaining({
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
          }),
        })
      );
    });

    it('uses default hour of 19 (7 PM) when no hour provided', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('learning-1');

      await scheduleLearningReminder();

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.trigger.hour).toBe(19);
      expect(call.trigger.minute).toBe(0);
    });

    it('uses the specified hour when provided', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('learning-1');

      await scheduleLearningReminder(8);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.trigger.hour).toBe(8);
    });

    it('clamps hour to 0-23 range (over 23)', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('learning-1');

      await scheduleLearningReminder(25);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.trigger.hour).toBe(23);
    });

    it('clamps hour to 0-23 range (negative)', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('learning-1');

      await scheduleLearningReminder(-5);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.trigger.hour).toBe(0);
    });

    it('floors fractional hours', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('learning-1');

      await scheduleLearningReminder(14.7);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.trigger.hour).toBe(14);
    });

    it('returns the notification identifier', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('learning-abc');

      const id = await scheduleLearningReminder();

      expect(id).toBe('learning-abc');
    });

    it('returns null on scheduling error', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Schedule failed')
      );

      const id = await scheduleLearningReminder();

      expect(id).toBeNull();
    });

    it('uses learning_reminder data type for deep linking', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('learning-1');

      await scheduleLearningReminder();

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.content.data.type).toBe('learning_reminder');
    });
  });

  describe('cancelAllLearningNotifications', () => {
    it('cancels only learning notifications', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        {
          identifier: 'learning-1',
          content: { data: { type: 'learning_reminder' } },
        },
        {
          identifier: 'streak-1',
          content: { data: { type: 'streak_reminder' } },
        },
        {
          identifier: 'review-1',
          content: { data: { type: 'review_reminder' } },
        },
      ]);

      await cancelAllLearningNotifications();

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('learning-1');
    });

    it('cancels multiple learning notifications', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        {
          identifier: 'learning-1',
          content: { data: { type: 'learning_reminder' } },
        },
        {
          identifier: 'learning-2',
          content: { data: { type: 'learning_reminder' } },
        },
      ]);

      await cancelAllLearningNotifications();

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('learning-1');
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('learning-2');
    });

    it('does nothing when no learning notifications exist', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        {
          identifier: 'streak-1',
          content: { data: { type: 'streak_reminder' } },
        },
      ]);

      await cancelAllLearningNotifications();

      expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    });

    it('handles notifications without data gracefully', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        {
          identifier: 'unknown-1',
          content: {},
        },
        {
          identifier: 'learning-1',
          content: { data: { type: 'learning_reminder' } },
        },
      ]);

      await cancelAllLearningNotifications();

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('learning-1');
    });

    it('does not throw on error', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Cancel failed')
      );

      await expect(cancelAllLearningNotifications()).resolves.not.toThrow();
    });
  });
});
