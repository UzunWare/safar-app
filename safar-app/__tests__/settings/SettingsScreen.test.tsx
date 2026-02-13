/**
 * Settings Screen Tests
 *
 * Story 7.1: Settings Screen - Tasks 1-6
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: (...args: any[]) => mockPush(...args),
    replace: jest.fn(),
    back: (...args: any[]) => mockBack(...args),
  },
  useRouter: () => ({
    push: (...args: any[]) => mockPush(...args),
    replace: jest.fn(),
    back: (...args: any[]) => mockBack(...args),
  }),
}));

jest.mock('@/lib/stores/useSettingsStore');
jest.mock('@/lib/stores/useAuthStore');
jest.mock('@/lib/hooks/useSubscription');
jest.mock('@/lib/hooks/useStreak');
jest.mock('@/lib/notifications/notificationOrchestrator', () => ({
  updateNotificationSchedule: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/notifications/reviewNotificationOrchestrator', () => ({
  updateReviewNotificationSchedule: jest.fn().mockResolvedValue(undefined),
  updateBadgeCount: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/notifications/learningNotificationScheduler', () => ({
  scheduleLearningReminder: jest.fn().mockResolvedValue('learning-1'),
  cancelAllLearningNotifications: jest.fn().mockResolvedValue(undefined),
}));
const mockDeleteAccountDialog = jest.fn(() => null);
jest.mock('@/components/ui/DeleteAccountDialog', () => {
  return {
    DeleteAccountDialog: (props: any) => mockDeleteAccountDialog(props),
  };
});

import SettingsScreen from '@/app/settings';
import { useSettingsStore } from '@/lib/stores/useSettingsStore';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useStreak } from '@/lib/hooks/useStreak';

const mockUseSettingsStore = useSettingsStore as unknown as jest.Mock;
const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseSubscription = useSubscription as jest.MockedFunction<typeof useSubscription>;
const mockUseStreak = useStreak as jest.MockedFunction<typeof useStreak>;

let mockCanOpenURL: jest.SpyInstance;
let mockOpenURL: jest.SpyInstance;
let mockAlert: jest.SpyInstance;

function setupMocks({
  settingsOverrides = {},
  authOverrides = {},
}: {
  settingsOverrides?: Record<string, any>;
  authOverrides?: Record<string, any>;
} = {}) {
  const settingsState = {
    streakReminders: true,
    reviewReminders: true,
    learningReminders: true,
    soundEnabled: true,
    isLoaded: true,
    updateSetting: jest.fn(),
    loadSettings: jest.fn().mockResolvedValue(undefined),
    syncSettings: jest.fn(),
    ...settingsOverrides,
  };

  const authState = {
    user: { id: 'user-1' },
    deleteAccount: jest.fn().mockResolvedValue({ success: true }),
    isDeletingAccount: false,
    clearError: jest.fn(),
    error: null,
    ...authOverrides,
  };

  mockUseSettingsStore.mockImplementation((selector?: (state: any) => any) =>
    typeof selector === 'function' ? selector(settingsState) : settingsState
  );
  mockUseAuthStore.mockImplementation((selector?: (state: any) => any) =>
    typeof selector === 'function' ? selector(authState) : authState
  );

  mockUseSubscription.mockReturnValue({
    isPremium: false,
    currentPlan: null,
    packages: [],
    isLoading: false,
    entitlementStatus: null,
    expirationDate: null,
  } as any);

  mockUseStreak.mockReturnValue({
    currentStreak: 7,
    longestStreak: 12,
    status: 'at-risk',
    lastActivityDate: null,
    freezeUsedAt: null,
    freezeAvailable: true,
    nextFreezeDate: null,
    isLoading: false,
    recordActivity: jest.fn(),
    useFreeze: jest.fn(),
  });

  return { settingsState, authState };
}

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanOpenURL = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    mockOpenURL = jest.spyOn(Linking, 'openURL').mockResolvedValue();
    mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    setupMocks();
  });

  afterEach(() => {
    mockCanOpenURL.mockRestore();
    mockOpenURL.mockRestore();
    mockAlert.mockRestore();
  });

  // === Task 1: Create settings screen ===

  describe('Task 1: Screen creation and layout', () => {
    it('renders the settings screen with title', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Settings')).toBeTruthy();
    });

    it('has a back button that navigates back', () => {
      const { getByLabelText } = render(<SettingsScreen />);
      const backButton = getByLabelText('Go back');
      fireEvent.press(backButton);
      expect(mockBack).toHaveBeenCalled();
    });

    it('displays all section headers', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Notifications')).toBeTruthy();
      expect(getByText('Sound')).toBeTruthy();
      expect(getByText('Account')).toBeTruthy();
      expect(getByText('Legal')).toBeTruthy();
      expect(getByText('Support')).toBeTruthy();
    });

    it('renders app version in Support section', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText(/Version \d+/)).toBeTruthy();
    });

    it('loads settings from server on mount when store is not loaded', async () => {
      const loadSettings = jest.fn().mockResolvedValue(undefined);
      setupMocks({
        settingsOverrides: {
          isLoaded: false,
          loadSettings,
        },
      });
      render(<SettingsScreen />);
      await waitFor(() => {
        expect(loadSettings).toHaveBeenCalledTimes(1);
      });
    });
  });

  // === Task 2: Settings sections content ===

  describe('Task 2: Settings sections', () => {
    it('shows notification settings rows', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Streak Reminders')).toBeTruthy();
      expect(getByText('Review Reminders')).toBeTruthy();
    });

    it('shows sound settings row', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Sound Effects')).toBeTruthy();
    });

    it('shows account settings rows', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Subscription')).toBeTruthy();
      expect(getByText('Delete Account')).toBeTruthy();
    });

    it('shows legal settings rows', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Privacy Policy')).toBeTruthy();
      expect(getByText('Terms of Service')).toBeTruthy();
    });

    it('shows support settings rows', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Contact Support')).toBeTruthy();
      expect(getByText('App Version')).toBeTruthy();
    });
  });

  // === Task 3: SettingsRow interactions ===

  describe('Task 3: Toggle interactions', () => {
    it('toggles streak reminders', () => {
      const mockUpdate = jest.fn();
      setupMocks({
        settingsOverrides: {
          updateSetting: mockUpdate,
          streakReminders: true,
        },
      });
      const { getByTestId } = render(<SettingsScreen />);
      const toggle = getByTestId('toggle-streakReminders');
      fireEvent(toggle, 'valueChange', false);
      expect(mockUpdate).toHaveBeenCalledWith('streakReminders', false);
    });

    it('toggles review reminders', () => {
      const mockUpdate = jest.fn();
      setupMocks({
        settingsOverrides: {
          updateSetting: mockUpdate,
          reviewReminders: true,
        },
      });
      const { getByTestId } = render(<SettingsScreen />);
      const toggle = getByTestId('toggle-reviewReminders');
      fireEvent(toggle, 'valueChange', false);
      expect(mockUpdate).toHaveBeenCalledWith('reviewReminders', false);
    });

    it('toggles sound effects', () => {
      const mockUpdate = jest.fn();
      setupMocks({
        settingsOverrides: {
          updateSetting: mockUpdate,
          soundEnabled: true,
        },
      });
      const { getByTestId } = render(<SettingsScreen />);
      const toggle = getByTestId('toggle-soundEnabled');
      fireEvent(toggle, 'valueChange', false);
      expect(mockUpdate).toHaveBeenCalledWith('soundEnabled', false);
    });

    it('reflects current toggle values from store', () => {
      setupMocks({
        settingsOverrides: {
          streakReminders: false,
          reviewReminders: true,
          soundEnabled: false,
        },
      });
      const { getByTestId } = render(<SettingsScreen />);
      expect(getByTestId('toggle-streakReminders').props.value).toBe(false);
      expect(getByTestId('toggle-reviewReminders').props.value).toBe(true);
      expect(getByTestId('toggle-soundEnabled').props.value).toBe(false);
    });
  });

  // === Task 3: Navigation rows ===

  describe('Task 3: Navigation interactions', () => {
    it('navigates to subscription screen', () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-subscription'));
      expect(mockPush).toHaveBeenCalledWith('/subscription');
    });

    it('shows subscription status for premium users', () => {
      mockUseSubscription.mockReturnValue({
        isPremium: true,
        currentPlan: 'annual',
        packages: [],
        isLoading: false,
        entitlementStatus: 'active',
        expirationDate: null,
      } as any);
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Premium')).toBeTruthy();
    });

    it('shows Free for non-premium users', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Free')).toBeTruthy();
    });

    it('opens delete account dialog instead of navigating to a missing route', () => {
      const { authState } = setupMocks();
      const { getByTestId } = render(<SettingsScreen />);
      expect(mockDeleteAccountDialog.mock.calls.some(([props]) => props.visible === true)).toBe(
        false
      );
      fireEvent.press(getByTestId('settings-row-delete-account'));
      expect(authState.clearError).toHaveBeenCalledTimes(1);
      expect(mockDeleteAccountDialog.mock.calls.some(([props]) => props.visible === true)).toBe(
        true
      );
      expect(mockPush).not.toHaveBeenCalledWith('/settings/delete-account');
    });
  });

  describe('Task 5-6: External links and fallbacks', () => {
    it('opens legal links when URL is available', async () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('settings-row-privacy-policy'));
      fireEvent.press(getByTestId('settings-row-terms'));
      await waitFor(() => {
        expect(mockCanOpenURL).toHaveBeenCalledWith('https://safar.app/privacy');
        expect(mockCanOpenURL).toHaveBeenCalledWith('https://safar.app/terms');
        expect(mockOpenURL).toHaveBeenCalledWith('https://safar.app/privacy');
        expect(mockOpenURL).toHaveBeenCalledWith('https://safar.app/terms');
      });
    });
  });
});
