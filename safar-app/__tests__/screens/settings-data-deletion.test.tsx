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

describe('Settings - Data Deletion (Story 7.8)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task 1: Delete My Data row in Account section', () => {
    it('renders "Delete My Data" row in the Account section', () => {
      const { getByText, getByTestId } = render(<SettingsScreen />);
      expect(getByText('Delete My Data')).toBeTruthy();
      expect(getByTestId('settings-row-delete-data')).toBeTruthy();
    });

    it('navigates to data-deletion screen when tapped', () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-delete-data'));
      expect(router.push).toHaveBeenCalledWith('/data-deletion');
    });

    it('renders Delete My Data with destructive styling (distinct from Export)', () => {
      const { getByTestId } = render(<SettingsScreen />);
      const deleteDataRow = getByTestId('settings-row-delete-data');
      const exportDataRow = getByTestId('settings-row-export-data');

      // Destructive rows use garnet border; non-destructive rows use emerald border
      expect(deleteDataRow).toHaveStyle({ borderColor: 'rgba(168, 84, 84, 0.15)' });
      expect(exportDataRow).toHaveStyle({ borderColor: 'rgba(15, 46, 40, 0.05)' });
    });

    it('renders Delete My Data before Delete Account in Account section', () => {
      const tree = render(<SettingsScreen />);
      const json = JSON.stringify(tree.toJSON());

      // Verify rendered order: "Delete My Data" appears before "Delete Account"
      const deleteDataPos = json.indexOf('Delete My Data');
      const deleteAccountPos = json.indexOf('Delete Account');
      expect(deleteDataPos).toBeGreaterThan(-1);
      expect(deleteAccountPos).toBeGreaterThan(-1);
      expect(deleteDataPos).toBeLessThan(deleteAccountPos);
    });
  });
});
