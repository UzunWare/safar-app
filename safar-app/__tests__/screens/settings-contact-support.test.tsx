import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking, Alert, Platform } from 'react-native';
import SettingsScreen from '@/app/settings';
import { config } from '@/constants/config';
import * as Clipboard from 'expo-clipboard';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock DeleteAccountDialog
jest.mock('@/components/ui/DeleteAccountDialog', () => ({
  DeleteAccountDialog: () => null,
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: { version: '2.1.0' },
}));

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
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
      user: { id: 'abcdef12-3456-7890-abcd-ef1234567890' },
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

describe('Settings - Contact Support (Story 7.5)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
  });

  // Task 1 / AC#1: Support section renders
  describe('AC#1 - Task 1: Support section renders', () => {
    it('renders the Support section title', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Support')).toBeTruthy();
    });

    it('renders Contact Support row', () => {
      const { getByText, getByTestId } = render(<SettingsScreen />);
      expect(getByText('Contact Support')).toBeTruthy();
      expect(getByTestId('settings-row-contact-support')).toBeTruthy();
    });

    it('renders App Version row with version string', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('App Version')).toBeTruthy();
      expect(getByText('Version 2.1.0')).toBeTruthy();
    });
  });

  // Task 2-4 / AC#1: Email composition with pre-filled subject and diagnostic body
  describe('AC#1 - Tasks 2-4: Email composition with diagnostic info', () => {
    it('opens mailto: URL with correct recipient when Contact Support is tapped', async () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalled();
        const calledUrl = (Linking.openURL as jest.Mock).mock.calls[0][0] as string;
        expect(calledUrl).toContain(`mailto:${config.supportEmail}`);
      });
    });

    it('includes pre-filled subject "Safar App Support" in mailto URL', async () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        const calledUrl = (Linking.openURL as jest.Mock).mock.calls[0][0] as string;
        expect(calledUrl).toContain('subject=');
        expect(decodeURIComponent(calledUrl)).toContain('Safar App Support');
      });
    });

    it('includes app version in email body', async () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        const calledUrl = (Linking.openURL as jest.Mock).mock.calls[0][0] as string;
        const decoded = decodeURIComponent(calledUrl);
        expect(decoded).toContain('App Version: 2.1.0');
      });
    });

    it('includes platform info in email body', async () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        const calledUrl = (Linking.openURL as jest.Mock).mock.calls[0][0] as string;
        const decoded = decodeURIComponent(calledUrl);
        expect(decoded).toContain(`Platform: ${Platform.OS}`);
      });
    });

    it('includes anonymized user ID (first 8 chars) in email body', async () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        const calledUrl = (Linking.openURL as jest.Mock).mock.calls[0][0] as string;
        const decoded = decodeURIComponent(calledUrl);
        // User ID starts with 'abcdef12', first 8 chars
        expect(decoded).toContain('User ID: abcdef12');
      });
    });

    it('does not include full user ID in email body', async () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        const calledUrl = (Linking.openURL as jest.Mock).mock.calls[0][0] as string;
        const decoded = decodeURIComponent(calledUrl);
        // Full UUID should not appear
        expect(decoded).not.toContain('abcdef12-3456-7890-abcd-ef1234567890');
      });
    });
  });

  // Task 5 / AC#2: No email client fallback
  describe('AC#2 - Task 5: No email client fallback', () => {
    it('shows fallback modal when email client is not available', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      const { getByTestId, getByText } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        // Modal shows the support email address
        expect(getByText(config.supportEmail)).toBeTruthy();
        expect(getByText(/no email app/i)).toBeTruthy();
      });
    });

    it('shows fallback modal when mailto: URL throws an error', async () => {
      (Linking.canOpenURL as jest.Mock).mockRejectedValue(new Error('Failed'));

      const { getByTestId, getByText } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        expect(getByText(config.supportEmail)).toBeTruthy();
      });
    });

    it('displays guidance to email manually in fallback modal', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      const { getByTestId, getByText } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        expect(getByText(/no email app/i)).toBeTruthy();
        expect(getByText(/include your app version/i)).toBeTruthy();
      });
    });

    it('copies email address to clipboard when copy button is pressed', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      const { getByTestId, getByText } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        expect(getByText(config.supportEmail)).toBeTruthy();
      });

      fireEvent.press(getByTestId('copy-support-email'));

      await waitFor(() => {
        expect(Clipboard.setStringAsync).toHaveBeenCalledWith(config.supportEmail);
      });
    });

    it('shows confirmation alert after copying email', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      const { getByTestId, getByText } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        expect(getByText(config.supportEmail)).toBeTruthy();
      });

      fireEvent.press(getByTestId('copy-support-email'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Copied', 'Email address copied to clipboard.');
      });
    });

    it('shows fallback alert when clipboard copy fails', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);
      (Clipboard.setStringAsync as jest.Mock).mockRejectedValueOnce(new Error('Clipboard denied'));

      const { getByTestId, getByText } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        expect(getByText(config.supportEmail)).toBeTruthy();
      });

      fireEvent.press(getByTestId('copy-support-email'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Copy Failed',
          `Please copy manually: ${config.supportEmail}`
        );
      });
    });

    it('closes fallback modal when Done is pressed', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      const { getByTestId, getByText, queryByText } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-contact-support'));

      await waitFor(() => {
        expect(getByText(config.supportEmail)).toBeTruthy();
      });

      fireEvent.press(getByTestId('close-email-fallback'));

      await waitFor(() => {
        // Modal content should no longer be visible after closing
        expect(queryByText(/no email app/i)).toBeNull();
      });
    });
  });
});
