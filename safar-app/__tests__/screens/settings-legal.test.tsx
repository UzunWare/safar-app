import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking, Alert } from 'react-native';
import SettingsScreen from '@/app/settings';
import { config } from '@/constants/config';

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

// Mock DeleteAccountDialog to avoid deep dependency chain
jest.mock('@/components/ui/DeleteAccountDialog', () => ({
  DeleteAccountDialog: () => null,
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: { version: '1.0.0' },
}));

// Mock stores
const mockUpdateSetting = jest.fn();
const mockLoadSettings = jest.fn();

jest.mock('@/lib/stores/useSettingsStore', () => ({
  useSettingsStore: (selector: any) =>
    selector({
      streakReminders: true,
      reviewReminders: true,
      learningReminders: true,
      soundEnabled: true,
      isLoaded: true,
      updateSetting: mockUpdateSetting,
      loadSettings: mockLoadSettings,
    }),
}));

jest.mock('@/lib/stores/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { id: 'test-user-id' },
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

describe('Settings - Legal Section (Story 7.4)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
  });

  // AC#1: Legal section with Privacy Policy and Terms of Service links
  describe('AC#1: Legal section displays links', () => {
    it('renders the Legal section title', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Legal')).toBeTruthy();
    });

    it('renders Privacy Policy row', () => {
      const { getByText, getByTestId } = render(<SettingsScreen />);
      expect(getByText('Privacy Policy')).toBeTruthy();
      expect(getByTestId('settings-row-privacy-policy')).toBeTruthy();
    });

    it('renders Terms of Service row', () => {
      const { getByText, getByTestId } = render(<SettingsScreen />);
      expect(getByText('Terms of Service')).toBeTruthy();
      expect(getByTestId('settings-row-terms')).toBeTruthy();
    });
  });

  // AC#2: Privacy Policy navigation
  describe('AC#2: Privacy Policy opens correctly', () => {
    it('opens privacy policy URL when tapped', async () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-privacy-policy'));

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalledWith(config.privacyPolicyUrl);
        expect(Linking.openURL).toHaveBeenCalledWith(config.privacyPolicyUrl);
      });
    });

    it('shows alert when privacy policy URL cannot be opened', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-privacy-policy'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unable to Open Link',
          'Please try again later.'
        );
      });
    });

    it('shows alert when opening privacy policy throws an error', async () => {
      (Linking.canOpenURL as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-privacy-policy'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unable to Open Link',
          'Please try again later.'
        );
      });
    });

    it('shows alert when openURL throws after canOpenURL succeeds', async () => {
      (Linking.openURL as jest.Mock).mockRejectedValue(new Error('Failed to open'));

      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-privacy-policy'));

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalledWith(config.privacyPolicyUrl);
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unable to Open Link',
          'Please try again later.'
        );
      });
    });
  });

  // AC#3: Terms of Service navigation
  describe('AC#3: Terms of Service opens correctly', () => {
    it('opens terms of service URL when tapped', async () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-terms'));

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalledWith(config.termsOfServiceUrl);
        expect(Linking.openURL).toHaveBeenCalledWith(config.termsOfServiceUrl);
      });
    });

    it('shows alert when terms URL cannot be opened', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-terms'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unable to Open Link',
          'Please try again later.'
        );
      });
    });

    it('shows alert when opening terms throws an error', async () => {
      (Linking.canOpenURL as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-terms'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unable to Open Link',
          'Please try again later.'
        );
      });
    });

    it('shows alert when openURL throws after canOpenURL succeeds', async () => {
      (Linking.openURL as jest.Mock).mockRejectedValue(new Error('Failed to open'));

      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-terms'));

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalledWith(config.termsOfServiceUrl);
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unable to Open Link',
          'Please try again later.'
        );
      });
    });
  });
});
