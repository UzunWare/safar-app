/**
 * Notification Preferences Tests
 *
 * Story 7.2: Notification Preferences - Tasks 1-6
 * Tests for notification toggles, permission handling, scheduling integration,
 * and permission denied guidance.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Linking } from 'react-native';

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
jest.mock('@/components/ui/DeleteAccountDialog', () => ({
  DeleteAccountDialog: () => null,
}));

const mockGetPermissionStatus = jest.fn();
const mockRequestPermissions = jest.fn();
jest.mock('@/lib/notifications/notificationService', () => ({
  getNotificationPermissionStatus: (...args: any[]) => mockGetPermissionStatus(...args),
  requestNotificationPermissions: (...args: any[]) => mockRequestPermissions(...args),
}));

const mockCancelAllStreakNotifications = jest.fn();
jest.mock('@/lib/notifications/streakNotificationScheduler', () => ({
  cancelAllStreakNotifications: (...args: any[]) => mockCancelAllStreakNotifications(...args),
}));

const mockCancelAllReviewNotifications = jest.fn();
jest.mock('@/lib/notifications/reviewNotificationScheduler', () => ({
  cancelAllReviewNotifications: (...args: any[]) => mockCancelAllReviewNotifications(...args),
}));

const mockScheduleLearningReminder = jest.fn();
const mockCancelAllLearningNotifications = jest.fn();
jest.mock('@/lib/notifications/learningNotificationScheduler', () => ({
  scheduleLearningReminder: (...args: any[]) => mockScheduleLearningReminder(...args),
  cancelAllLearningNotifications: (...args: any[]) => mockCancelAllLearningNotifications(...args),
}));

const mockUpdateNotificationSchedule = jest.fn();
jest.mock('@/lib/notifications/notificationOrchestrator', () => ({
  updateNotificationSchedule: (...args: any[]) => mockUpdateNotificationSchedule(...args),
}));

const mockUpdateReviewNotificationSchedule = jest.fn();
const mockUpdateBadgeCount = jest.fn();
jest.mock('@/lib/notifications/reviewNotificationOrchestrator', () => ({
  updateReviewNotificationSchedule: (...args: any[]) => mockUpdateReviewNotificationSchedule(...args),
  updateBadgeCount: (...args: any[]) => mockUpdateBadgeCount(...args),
}));

jest.mock('expo-linking', () => ({
  openSettings: jest.fn(),
}));

import SettingsScreen from '@/app/settings';
import { useSettingsStore } from '@/lib/stores/useSettingsStore';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useStreak } from '@/lib/hooks/useStreak';

const mockUseSettingsStore = useSettingsStore as unknown as jest.Mock;
const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseSubscription = useSubscription as jest.MockedFunction<typeof useSubscription>;
const mockUseStreak = useStreak as jest.MockedFunction<typeof useStreak>;

function setupMocks(overrides: {
  settingsOverrides?: Record<string, any>;
  permissionStatus?: string;
} = {}) {
  const mockUpdateSetting = jest.fn().mockResolvedValue(undefined);
  const settingsState = {
    streakReminders: true,
    reviewReminders: true,
    learningReminders: true,
    soundEnabled: true,
    isLoaded: true,
    updateSetting: mockUpdateSetting,
    loadSettings: jest.fn().mockResolvedValue(undefined),
    syncSettings: jest.fn(),
    ...overrides.settingsOverrides,
  };

  mockUseSettingsStore.mockImplementation((selector?: (state: any) => any) =>
    typeof selector === 'function' ? selector(settingsState) : settingsState
  );

  mockUseAuthStore.mockImplementation((selector?: (state: any) => any) => {
    const authState = {
      user: { id: 'user-1' },
      deleteAccount: jest.fn().mockResolvedValue({ success: true }),
      isDeletingAccount: false,
      clearError: jest.fn(),
      error: null,
    };
    return typeof selector === 'function' ? selector(authState) : authState;
  });

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

  mockGetPermissionStatus.mockResolvedValue(overrides.permissionStatus ?? 'granted');
  mockRequestPermissions.mockResolvedValue(true);
  mockCancelAllStreakNotifications.mockResolvedValue(undefined);
  mockCancelAllReviewNotifications.mockResolvedValue(undefined);
  mockScheduleLearningReminder.mockResolvedValue('learning-1');
  mockCancelAllLearningNotifications.mockResolvedValue(undefined);
  mockUpdateNotificationSchedule.mockResolvedValue(undefined);
  mockUpdateReviewNotificationSchedule.mockResolvedValue(undefined);
  mockUpdateBadgeCount.mockResolvedValue(undefined);

  return { settingsState, mockUpdateSetting };
}

describe('NotificationPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // === Task 1: Notification settings UI (AC #1) ===

  describe('Task 1: Notification settings UI', () => {
    it('shows toggles for streak reminders, review reminders, and learning reminders', () => {
      setupMocks();
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Streak Reminders')).toBeTruthy();
      expect(getByText('Review Reminders')).toBeTruthy();
      expect(getByText('Learning Reminders')).toBeTruthy();
    });

    it('shows current states for all notification toggles', () => {
      setupMocks({
        settingsOverrides: {
          streakReminders: false,
          reviewReminders: true,
          learningReminders: false,
        },
      });
      const { getByTestId } = render(<SettingsScreen />);
      expect(getByTestId('toggle-streakReminders').props.value).toBe(false);
      expect(getByTestId('toggle-reviewReminders').props.value).toBe(true);
      expect(getByTestId('toggle-learningReminders').props.value).toBe(false);
    });

    it('displays learning reminders toggle with correct testID', () => {
      setupMocks();
      const { getByTestId } = render(<SettingsScreen />);
      expect(getByTestId('toggle-learningReminders')).toBeTruthy();
    });
  });

  // === Task 2: Toggle handlers (AC #2) ===

  describe('Task 2: Toggle handlers', () => {
    it('calls updateSetting when toggling streak reminders off (no permission check needed)', async () => {
      const { mockUpdateSetting } = setupMocks({ permissionStatus: 'granted' });
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-streakReminders'), 'valueChange', false);
      });
      expect(mockUpdateSetting).toHaveBeenCalledWith('streakReminders', false);
    });

    it('calls updateSetting when toggling review reminders off', async () => {
      const { mockUpdateSetting } = setupMocks({ permissionStatus: 'granted' });
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-reviewReminders'), 'valueChange', false);
      });
      expect(mockUpdateSetting).toHaveBeenCalledWith('reviewReminders', false);
    });

    it('calls updateSetting when toggling learning reminders off', async () => {
      const { mockUpdateSetting } = setupMocks({ permissionStatus: 'granted' });
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-learningReminders'), 'valueChange', false);
      });
      expect(mockUpdateSetting).toHaveBeenCalledWith('learningReminders', false);
    });
  });

  // === Task 3: Notification scheduling (AC #2) ===

  describe('Task 3: Notification scheduling', () => {
    it('cancels streak notifications when streak reminders toggled off', async () => {
      setupMocks({ permissionStatus: 'granted' });
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-streakReminders'), 'valueChange', false);
      });
      await waitFor(() => {
        expect(mockCancelAllStreakNotifications).toHaveBeenCalled();
      });
    });

    it('cancels review notifications when review reminders toggled off', async () => {
      setupMocks({ permissionStatus: 'granted' });
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-reviewReminders'), 'valueChange', false);
      });
      await waitFor(() => {
        expect(mockCancelAllReviewNotifications).toHaveBeenCalled();
      });
    });

    it('cancels learning notifications when learning reminders toggled off', async () => {
      setupMocks({
        permissionStatus: 'granted'
      });
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-learningReminders'), 'valueChange', false);
      });
      expect(mockCancelAllLearningNotifications).toHaveBeenCalled();
    });

    it('reschedules streak reminders when toggled on', async () => {
      setupMocks({
        permissionStatus: 'granted',
        settingsOverrides: { streakReminders: false },
      });
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-streakReminders'), 'valueChange', true);
      });
      expect(mockUpdateNotificationSchedule).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      );
      expect(mockCancelAllStreakNotifications).not.toHaveBeenCalled();
    });

    it('reschedules review reminders when toggled on', async () => {
      setupMocks({
        permissionStatus: 'granted',
        settingsOverrides: { reviewReminders: false },
      });
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-reviewReminders'), 'valueChange', true);
      });
      expect(mockUpdateReviewNotificationSchedule).toHaveBeenCalledWith('user-1', undefined, true);
      expect(mockUpdateBadgeCount).toHaveBeenCalledWith('user-1');
    });

    it('schedules learning reminders when toggled on', async () => {
      setupMocks({
        permissionStatus: 'granted',
        settingsOverrides: { learningReminders: false },
      });
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-learningReminders'), 'valueChange', true);
      });
      expect(mockScheduleLearningReminder).toHaveBeenCalled();
    });
  });

  // === Task 4: Permission checking (AC #3) ===

  describe('Task 4: Permission checking', () => {
    it('checks permission status when enabling a notification toggle', async () => {
      setupMocks({
        permissionStatus: 'granted',
        settingsOverrides: { streakReminders: false },
      });
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-streakReminders'), 'valueChange', true);
      });
      expect(mockGetPermissionStatus).toHaveBeenCalled();
    });

    it('does not check permission when disabling a toggle', async () => {
      setupMocks({ permissionStatus: 'granted' });
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-streakReminders'), 'valueChange', false);
      });
      expect(mockGetPermissionStatus).not.toHaveBeenCalled();
    });
  });

  // === Task 5: Permission request (AC #3) ===

  describe('Task 5: Permission request', () => {
    it('requests permission when status is not granted and user enables toggle', async () => {
      const { mockUpdateSetting } = setupMocks({
        permissionStatus: 'denied',
        settingsOverrides: { streakReminders: false },
      });
      mockRequestPermissions.mockResolvedValue(true);
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-streakReminders'), 'valueChange', true);
      });
      expect(mockRequestPermissions).toHaveBeenCalled();
      expect(mockUpdateSetting).toHaveBeenCalledWith('streakReminders', true);
    });

    it('does not enable toggle if permission request is denied', async () => {
      const { mockUpdateSetting } = setupMocks({
        permissionStatus: 'denied',
        settingsOverrides: { streakReminders: false },
      });
      mockRequestPermissions.mockResolvedValue(false);
      const { getByTestId } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-streakReminders'), 'valueChange', true);
      });
      expect(mockRequestPermissions).toHaveBeenCalled();
      expect(mockUpdateSetting).not.toHaveBeenCalledWith('streakReminders', true);
      expect(mockUpdateNotificationSchedule).not.toHaveBeenCalled();
      expect(mockUpdateReviewNotificationSchedule).not.toHaveBeenCalled();
      expect(mockScheduleLearningReminder).not.toHaveBeenCalled();
    });
  });

  // === Task 6: Guide to system settings (AC #3) ===

  describe('Task 6: Permission denied guidance', () => {
    it('shows permission denied modal when permission is denied', async () => {
      setupMocks({
        permissionStatus: 'denied',
        settingsOverrides: { streakReminders: false },
      });
      mockRequestPermissions.mockResolvedValue(false);
      const { getByTestId, getByText } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-streakReminders'), 'valueChange', true);
      });
      await waitFor(() => {
        expect(getByText('Notifications Disabled')).toBeTruthy();
      });
    });

    it('shows guidance message in permission denied modal', async () => {
      setupMocks({
        permissionStatus: 'denied',
        settingsOverrides: { reviewReminders: false },
      });
      mockRequestPermissions.mockResolvedValue(false);
      const { getByTestId, getByText } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-reviewReminders'), 'valueChange', true);
      });
      await waitFor(() => {
        expect(getByText(/enable notifications in your device settings/i)).toBeTruthy();
      });
    });

    it('provides Open Settings button that opens system settings', async () => {
      const mockOpenSettings = jest.fn();
      jest.spyOn(Linking, 'openSettings').mockImplementation(mockOpenSettings);

      setupMocks({
        permissionStatus: 'denied',
        settingsOverrides: { streakReminders: false },
      });
      mockRequestPermissions.mockResolvedValue(false);
      const { getByTestId, getByText } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-streakReminders'), 'valueChange', true);
      });
      await waitFor(() => {
        expect(getByText('Open Settings')).toBeTruthy();
      });
      fireEvent.press(getByText('Open Settings'));
      expect(mockOpenSettings).toHaveBeenCalled();
    });

    it('provides Not Now button that dismisses modal', async () => {
      setupMocks({
        permissionStatus: 'denied',
        settingsOverrides: { streakReminders: false },
      });
      mockRequestPermissions.mockResolvedValue(false);
      const { getByTestId, getByText, queryByText } = render(<SettingsScreen />);
      await act(async () => {
        fireEvent(getByTestId('toggle-streakReminders'), 'valueChange', true);
      });
      await waitFor(() => {
        expect(getByText('Not Now')).toBeTruthy();
      });
      await act(async () => {
        fireEvent.press(getByText('Not Now'));
      });
      expect(queryByText('Notifications Disabled')).toBeNull();
    });
  });
});
