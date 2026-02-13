/**
 * Tests for Notification Service
 * Story 5.5: Push Notifications - Streak Reminders
 * Task 1: Set up Expo Notifications
 */

import * as Notifications from 'expo-notifications';
import {
  configureNotificationHandler,
  requestNotificationPermissions,
  getNotificationPermissionStatus,
} from '@/lib/notifications/notificationService';

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('configureNotificationHandler', () => {
    it('calls setNotificationHandler with correct config', () => {
      configureNotificationHandler();

      expect(Notifications.setNotificationHandler).toHaveBeenCalledWith({
        handleNotification: expect.any(Function),
      });
    });

    it('handler enables alert, banner, list, sound, and badge', async () => {
      configureNotificationHandler();

      const call = (Notifications.setNotificationHandler as jest.Mock).mock.calls[0][0];
      const result = await call.handleNotification();

      expect(result).toEqual({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      });
    });
  });

  describe('requestNotificationPermissions', () => {
    it('returns true when permissions already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permissions when not already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
        granted: false,
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('returns false when permissions denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
        granted: false,
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
        granted: false,
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
    });

    it('returns false on error', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Permission error')
      );

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
    });
  });

  describe('getNotificationPermissionStatus', () => {
    it('returns the current permission status', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
      });

      const status = await getNotificationPermissionStatus();

      expect(status).toBe('granted');
    });

    it('returns undetermined when no permission decision made', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
        granted: false,
      });

      const status = await getNotificationPermissionStatus();

      expect(status).toBe('undetermined');
    });

    it('returns denied on error', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const status = await getNotificationPermissionStatus();

      expect(status).toBe('denied');
    });
  });
});
