/**
 * Tests for Review Notification Orchestrator
 * Story 5.6: Push Notifications - Review Reminders
 * Task 3: Conditional notification sending (AC #3)
 * Task 5: Cancel/update after reviews complete (AC #4)
 * Task 6: Configure notification time (AC #1)
 * Task 7: Set badge count (AC #1)
 *
 * Updated Story 7.2: Orchestrator now reads preferences from useSettingsStore
 * and checks permissions via notificationService instead of notificationPreferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { getDueReviewCount } from '@/lib/api/reviewCount';
import {
  scheduleReviewReminder,
  cancelAllReviewNotifications,
} from '@/lib/notifications/reviewNotificationScheduler';
import {
  updateReviewNotificationSchedule,
  onReviewSessionCompleted,
  getReviewReminderHour,
  setReviewReminderHour,
  updateBadgeCount,
} from '@/lib/notifications/reviewNotificationOrchestrator';

jest.mock('@/lib/notifications/notificationService', () => ({
  getNotificationPermissionStatus: jest.fn(() => Promise.resolve('granted')),
}));

jest.mock('@/lib/stores/useSettingsStore', () => ({
  useSettingsStore: {
    getState: jest.fn(() => ({ reviewReminders: true })),
  },
}));

jest.mock('@/lib/api/reviewCount');
jest.mock('@/lib/notifications/reviewNotificationScheduler');

const { getNotificationPermissionStatus } = require('@/lib/notifications/notificationService');
const { useSettingsStore } = require('@/lib/stores/useSettingsStore');
const mockGetCount = getDueReviewCount as jest.MockedFunction<typeof getDueReviewCount>;
const mockSchedule = scheduleReviewReminder as jest.MockedFunction<typeof scheduleReviewReminder>;
const mockCancel = cancelAllReviewNotifications as jest.MockedFunction<
  typeof cancelAllReviewNotifications
>;

describe('reviewNotificationOrchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 1, 12, 14, 0, 0));
    // Reset AsyncStorage to default (clearAllMocks doesn't reset implementations)
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => Promise.resolve(null));
    (AsyncStorage.setItem as jest.Mock).mockImplementation(() => Promise.resolve());
    getNotificationPermissionStatus.mockResolvedValue('granted');
    useSettingsStore.getState.mockReturnValue({ reviewReminders: true });
    mockGetCount.mockResolvedValue(5);
    mockSchedule.mockResolvedValue('review-notif-1');
    mockCancel.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('updateReviewNotificationSchedule', () => {
    it('schedules notification when reviews are due and notifications enabled', async () => {
      await updateReviewNotificationSchedule('user-123');

      expect(mockGetCount).toHaveBeenCalledWith('user-123');
      expect(mockSchedule).toHaveBeenCalledWith(5, expect.any(Number));
    });

    it('cancels and does not schedule when notifications are disabled (AC #3)', async () => {
      useSettingsStore.getState.mockReturnValue({ reviewReminders: false });

      await updateReviewNotificationSchedule('user-123');

      expect(mockCancel).toHaveBeenCalled();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('does not schedule when no reviews are due (AC #3)', async () => {
      mockGetCount.mockResolvedValue(0);

      await updateReviewNotificationSchedule('user-123');

      expect(mockCancel).toHaveBeenCalled();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('cancels existing before scheduling new', async () => {
      await updateReviewNotificationSchedule('user-123');

      const cancelOrder = mockCancel.mock.invocationCallOrder[0];
      const scheduleOrder = mockSchedule.mock.invocationCallOrder[0];
      expect(cancelOrder).toBeLessThan(scheduleOrder);
    });

    it('uses custom reminder hour when set', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('7');

      await updateReviewNotificationSchedule('user-123');

      expect(mockSchedule).toHaveBeenCalledWith(5, 7);
    });

    it('uses default 9 AM when no custom hour is set', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await updateReviewNotificationSchedule('user-123');

      expect(mockSchedule).toHaveBeenCalledWith(5, 9);
    });

    it('accepts optional hour parameter override', async () => {
      await updateReviewNotificationSchedule('user-123', 11);

      expect(mockSchedule).toHaveBeenCalledWith(5, 11);
    });

    it('reschedules when hour override is provided even if already scheduled today', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('2026-02-12');

      await updateReviewNotificationSchedule('user-123', 10);

      expect(mockCancel).toHaveBeenCalled();
      expect(mockSchedule).toHaveBeenCalledWith(5, 10);
    });

    it('limits to 1 scheduling per day', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('2026-02-12');

      await updateReviewNotificationSchedule('user-123');

      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('stores today date after scheduling', async () => {
      await updateReviewNotificationSchedule('user-123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@safar/last-review-notification-date',
        '2026-02-12'
      );
    });

    it('does not throw on error', async () => {
      getNotificationPermissionStatus.mockRejectedValue(new Error('permission error'));

      await expect(updateReviewNotificationSchedule('user-123')).resolves.not.toThrow();
    });

    it('does not schedule when userId is empty', async () => {
      await updateReviewNotificationSchedule('');

      expect(mockSchedule).not.toHaveBeenCalled();
    });
  });

  describe('onReviewSessionCompleted (Task 5)', () => {
    it('cancels pending review notification after reviews complete', async () => {
      mockGetCount.mockResolvedValue(0);

      await onReviewSessionCompleted('user-123');

      expect(mockCancel).toHaveBeenCalled();
    });

    it('reschedules with updated count if some reviews remain', async () => {
      mockGetCount.mockResolvedValue(3);

      await onReviewSessionCompleted('user-123');

      expect(mockCancel).toHaveBeenCalled();
      expect(mockSchedule).toHaveBeenCalledWith(3, expect.any(Number));
    });

    it('does not reschedule when no reviews remain', async () => {
      mockGetCount.mockResolvedValue(0);

      await onReviewSessionCompleted('user-123');

      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('updates badge count after review session', async () => {
      mockGetCount.mockResolvedValue(2);

      await onReviewSessionCompleted('user-123');

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(2);
    });

    it('clears badge when all reviews done', async () => {
      mockGetCount.mockResolvedValue(0);

      await onReviewSessionCompleted('user-123');

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
    });

    it('does not throw on error', async () => {
      mockCancel.mockRejectedValue(new Error('cancel error'));

      await expect(onReviewSessionCompleted('user-123')).resolves.not.toThrow();
    });

    it('does not reschedule when notifications are disabled', async () => {
      useSettingsStore.getState.mockReturnValue({ reviewReminders: false });
      mockGetCount.mockResolvedValue(4);

      await onReviewSessionCompleted('user-123');

      expect(mockCancel).toHaveBeenCalled();
      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
      expect(mockSchedule).not.toHaveBeenCalled();
    });
  });

  describe('getReviewReminderHour / setReviewReminderHour (Task 6)', () => {
    it('returns default 9 when no value stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const hour = await getReviewReminderHour();

      expect(hour).toBe(9);
    });

    it('returns stored hour value', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('7');

      const hour = await getReviewReminderHour();

      expect(hour).toBe(7);
    });

    it('stores hour value to AsyncStorage', async () => {
      await setReviewReminderHour(8);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@safar/review-reminder-hour', '8');
    });

    it('clamps hour to valid range (0-23)', async () => {
      await setReviewReminderHour(25);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@safar/review-reminder-hour', '23');
    });
  });

  describe('updateBadgeCount (Task 7)', () => {
    it('sets badge count to due review count', async () => {
      mockGetCount.mockResolvedValue(12);

      await updateBadgeCount('user-123');

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(12);
    });

    it('sets badge to 0 when no reviews due', async () => {
      mockGetCount.mockResolvedValue(0);

      await updateBadgeCount('user-123');

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
    });

    it('does not throw on error', async () => {
      mockGetCount.mockRejectedValue(new Error('count error'));

      await expect(updateBadgeCount('user-123')).resolves.not.toThrow();
    });
  });
});
