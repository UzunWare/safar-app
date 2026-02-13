/**
 * Tests for useNotificationPreferences Hook
 * Story 5.5: Push Notifications - Streak Reminders
 * Task 2: Request notification permissions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const NOTIFICATIONS_ENABLED_KEY = 'preferences.notificationsEnabled';

// Must import after mocks are set up
let getNotificationPreferences: typeof import('@/lib/notifications/notificationPreferences').getNotificationPreferences;
let setNotificationsEnabled: typeof import('@/lib/notifications/notificationPreferences').setNotificationsEnabled;
let initNotificationPreferences: typeof import('@/lib/notifications/notificationPreferences').initNotificationPreferences;

beforeAll(() => {
  const mod = require('@/lib/notifications/notificationPreferences');
  getNotificationPreferences = mod.getNotificationPreferences;
  setNotificationsEnabled = mod.setNotificationsEnabled;
  initNotificationPreferences = mod.initNotificationPreferences;
});

describe('notificationPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotificationPreferences', () => {
    it('returns enabled=true when AsyncStorage has true', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
      });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');

      const result = await getNotificationPreferences();

      expect(result.enabled).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(NOTIFICATIONS_ENABLED_KEY);
    });

    it('returns enabled=false when AsyncStorage has false', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
      });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('false');

      const result = await getNotificationPreferences();

      expect(result.enabled).toBe(false);
    });

    it('returns enabled=true by default when no stored value and permissions are granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
      });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await getNotificationPreferences();

      expect(result.enabled).toBe(true);
    });

    it('returns enabled=false when OS permissions are denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
        granted: false,
      });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');

      const result = await getNotificationPreferences();

      expect(result.enabled).toBe(false);
    });

    it('returns enabled=false on AsyncStorage error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await getNotificationPreferences();

      expect(result.enabled).toBe(false);
    });
  });

  describe('setNotificationsEnabled', () => {
    it('stores true in AsyncStorage', async () => {
      await setNotificationsEnabled(true);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(NOTIFICATIONS_ENABLED_KEY, 'true');
    });

    it('stores false in AsyncStorage', async () => {
      await setNotificationsEnabled(false);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(NOTIFICATIONS_ENABLED_KEY, 'false');
    });

    it('does not throw on AsyncStorage error', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Write error'));

      await expect(setNotificationsEnabled(true)).resolves.not.toThrow();
    });
  });

  describe('initNotificationPreferences', () => {
    it('requests permissions and stores granted status', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
      });

      const granted = await initNotificationPreferences();

      expect(granted).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(NOTIFICATIONS_ENABLED_KEY, 'true');
    });

    it('requests permissions when undetermined and stores result', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
        granted: false,
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
      });

      const granted = await initNotificationPreferences();

      expect(granted).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(NOTIFICATIONS_ENABLED_KEY, 'true');
    });

    it('stores false when permissions denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
        granted: false,
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
        granted: false,
      });

      const granted = await initNotificationPreferences();

      expect(granted).toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(NOTIFICATIONS_ENABLED_KEY, 'false');
    });

    it('stores false on error', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Permission error')
      );

      const granted = await initNotificationPreferences();

      expect(granted).toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(NOTIFICATIONS_ENABLED_KEY, 'false');
    });
  });
});
