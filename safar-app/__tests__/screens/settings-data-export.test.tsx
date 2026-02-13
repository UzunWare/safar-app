import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking, Alert } from 'react-native';
import SettingsScreen from '@/app/settings';
import { router } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Path: View,
    Circle: View,
    G: View,
    Rect: View,
    Defs: View,
    LinearGradient: View,
    Stop: View,
  };
});

// Mock DeleteAccountDialog
jest.mock('@/components/ui/DeleteAccountDialog', () => ({
  DeleteAccountDialog: () => null,
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: { version: '1.0.0' },
}));

// Mock stores
jest.mock('@/lib/stores/useSettingsStore', () => ({
  useSettingsStore: (selector: any) =>
    selector({
      streakReminders: true,
      reviewReminders: true,
      learningReminders: true,
      soundEnabled: true,
      isLoaded: true,
      updateSetting: jest.fn(),
      loadSettings: jest.fn(),
    }),
}));

jest.mock('@/lib/stores/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { id: 'test-user-id', email: 'test@example.com' },
      deleteAccount: jest.fn(),
      isDeletingAccount: false,
      clearError: jest.fn(),
    }),
}));

jest.mock('@/lib/hooks/useSubscription', () => ({
  useSubscription: () => ({ isPremium: false }),
}));

jest.mock('@/lib/hooks/useStreak', () => ({
  useStreak: () => ({ currentStreak: 5, status: 'active' }),
}));

// Mock notification services
jest.mock('@/lib/notifications/notificationService', () => ({
  getNotificationPermissionStatus: jest.fn(),
  requestNotificationPermissions: jest.fn(),
}));
jest.mock('@/lib/notifications/streakNotificationScheduler', () => ({
  cancelAllStreakNotifications: jest.fn(),
}));
jest.mock('@/lib/notifications/reviewNotificationScheduler', () => ({
  cancelAllReviewNotifications: jest.fn(),
}));
jest.mock('@/lib/notifications/learningNotificationScheduler', () => ({
  scheduleLearningReminder: jest.fn(),
  cancelAllLearningNotifications: jest.fn(),
}));
jest.mock('@/lib/notifications/notificationOrchestrator', () => ({
  updateNotificationSchedule: jest.fn(),
}));
jest.mock('@/lib/notifications/reviewNotificationOrchestrator', () => ({
  updateReviewNotificationSchedule: jest.fn(),
  updateBadgeCount: jest.fn(),
}));

// Mock Linking
jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as any);
jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined as any);
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

describe('Settings - Data Export (Story 7.7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task 1: Export My Data row in Account section', () => {
    it('renders "Export My Data" row in the Account section', () => {
      const { getByText, getByTestId } = render(<SettingsScreen />);
      expect(getByText('Export My Data')).toBeTruthy();
      expect(getByTestId('settings-row-export-data')).toBeTruthy();
    });

    it('navigates to data-export screen when tapped', () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-export-data'));
      expect(router.push).toHaveBeenCalledWith('/data-export');
    });
  });
});
