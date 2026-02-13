import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DataDeletionScreen from '@/app/data-deletion';
import { requestDataDeletion } from '@/lib/api/dataDeletion';
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

// Mock auth store
jest.mock('@/lib/stores/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { id: 'test-user-id', email: 'test@example.com' },
    }),
}));

// Mock data deletion API
const mockGetDeletionRequestStatus = jest.fn().mockResolvedValue(null);
jest.mock('@/lib/api/dataDeletion', () => ({
  requestDataDeletion: jest.fn().mockResolvedValue({ success: true }),
  getDeletionRequestStatus: (...args: any[]) => mockGetDeletionRequestStatus(...args),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

describe('Data Deletion Screen (Story 7.8)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requestDataDeletion as jest.Mock).mockResolvedValue({ success: true });
    mockGetDeletionRequestStatus.mockResolvedValue(null);
  });

  describe('Task 2: Deletion explanation screen content', () => {
    it('renders the screen title "Delete Your Data"', () => {
      const { getByText } = render(<DataDeletionScreen />);
      expect(getByText('Delete Your Data')).toBeTruthy();
    });

    it('explains what data will be deleted', () => {
      const { getByText } = render(<DataDeletionScreen />);
      expect(getByText(/learning progress/i)).toBeTruthy();
      expect(getByText(/streak.*XP/i)).toBeTruthy();
      expect(getByText(/review schedules/i)).toBeTruthy();
      expect(getByText(/preferences/i)).toBeTruthy();
    });

    it('clarifies account remains active', () => {
      const { getByText } = render(<DataDeletionScreen />);
      expect(getByText(/account will remain active/i)).toBeTruthy();
    });

    it('shows warning that this cannot be undone', () => {
      const { getByText } = render(<DataDeletionScreen />);
      expect(getByText(/cannot be undone/i)).toBeTruthy();
    });

    it('renders confirm button "Delete My Data"', () => {
      const { getByTestId } = render(<DataDeletionScreen />);
      expect(getByTestId('request-deletion-button')).toBeTruthy();
    });

    it('renders a back button', () => {
      const { getByLabelText } = render(<DataDeletionScreen />);
      expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('navigates back when tapping back button', () => {
      const { getByLabelText } = render(<DataDeletionScreen />);
      fireEvent.press(getByLabelText('Go back'));
      expect(router.back).toHaveBeenCalled();
    });

    it('mentions account deletion as alternative', () => {
      const { getByText } = render(<DataDeletionScreen />);
      expect(getByText(/delete account instead/i)).toBeTruthy();
    });
  });

  describe('Task 4: Deletion request submission', () => {
    it('shows confirmation alert before submitting deletion request', () => {
      const { getByTestId } = render(<DataDeletionScreen />);
      fireEvent.press(getByTestId('request-deletion-button'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Confirm Data Deletion',
        expect.stringContaining('permanently delete'),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'Delete', style: 'destructive' }),
        ])
      );
    });

    it('calls requestDataDeletion when confirmed', async () => {
      (Alert.alert as jest.Mock).mockImplementation(
        (_title: string, _msg: string, buttons: any[]) => {
          const deleteBtn = buttons.find((b: any) => b.text === 'Delete');
          deleteBtn?.onPress?.();
        }
      );

      const { getByTestId } = render(<DataDeletionScreen />);
      fireEvent.press(getByTestId('request-deletion-button'));

      await waitFor(() => {
        expect(requestDataDeletion).toHaveBeenCalled();
      });
    });

    it('shows success alert with 30-day message on successful request', async () => {
      (Alert.alert as jest.Mock)
        .mockImplementationOnce((_title: string, _msg: string, buttons: any[]) => {
          const deleteBtn = buttons.find((b: any) => b.text === 'Delete');
          deleteBtn?.onPress?.();
        })
        .mockImplementationOnce(jest.fn());

      const { getByTestId } = render(<DataDeletionScreen />);
      fireEvent.press(getByTestId('request-deletion-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Deletion Requested',
          expect.stringContaining('30 days'),
          expect.any(Array)
        );
      });
    });

    it('shows error alert when deletion request fails', async () => {
      (requestDataDeletion as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Server error',
      });

      (Alert.alert as jest.Mock)
        .mockImplementationOnce((_title: string, _msg: string, buttons: any[]) => {
          const deleteBtn = buttons.find((b: any) => b.text === 'Delete');
          deleteBtn?.onPress?.();
        })
        .mockImplementationOnce(jest.fn());

      const { getByTestId } = render(<DataDeletionScreen />);
      fireEvent.press(getByTestId('request-deletion-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Deletion Failed',
          'Server error'
        );
      });
    });

    it('shows generic error alert when deletion throws', async () => {
      (requestDataDeletion as jest.Mock).mockRejectedValue(new Error('Network error'));

      (Alert.alert as jest.Mock)
        .mockImplementationOnce((_title: string, _msg: string, buttons: any[]) => {
          const deleteBtn = buttons.find((b: any) => b.text === 'Delete');
          deleteBtn?.onPress?.();
        })
        .mockImplementationOnce(jest.fn());

      const { getByTestId } = render(<DataDeletionScreen />);
      fireEvent.press(getByTestId('request-deletion-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Deletion Failed',
          'Failed to request data deletion. Please try again.'
        );
      });
    });

    it('shows duplicate detection message when request already pending', async () => {
      (requestDataDeletion as jest.Mock).mockResolvedValue({
        success: true,
        message: 'A deletion request is already being processed.',
      });

      (Alert.alert as jest.Mock)
        .mockImplementationOnce((_title: string, _msg: string, buttons: any[]) => {
          const deleteBtn = buttons.find((b: any) => b.text === 'Delete');
          deleteBtn?.onPress?.();
        })
        .mockImplementationOnce(jest.fn());

      const { getByTestId } = render(<DataDeletionScreen />);
      fireEvent.press(getByTestId('request-deletion-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Deletion In Progress',
          'A deletion request is already being processed.',
          expect.any(Array)
        );
      });
    });
  });

  describe('Task 7: Existing deletion request status', () => {
    it('shows pending banner when existing request is pending', async () => {
      mockGetDeletionRequestStatus.mockResolvedValue({
        id: 'req-1',
        status: 'pending',
        requested_at: '2026-02-13T10:00:00Z',
        completed_at: null,
      });

      const { findByTestId, findByText } = render(<DataDeletionScreen />);

      expect(await findByTestId('pending-deletion-banner')).toBeTruthy();
      expect(await findByText(/already being processed/i)).toBeTruthy();
    });

    it('shows "Deletion In Progress" button text when request is pending', async () => {
      mockGetDeletionRequestStatus.mockResolvedValue({
        id: 'req-1',
        status: 'processing',
        requested_at: '2026-02-13T10:00:00Z',
        completed_at: null,
      });

      const { findByText } = render(<DataDeletionScreen />);

      expect(await findByText('Deletion In Progress')).toBeTruthy();
    });

    it('does not show banner when no existing request', () => {
      const { queryByTestId } = render(<DataDeletionScreen />);
      expect(queryByTestId('pending-deletion-banner')).toBeNull();
    });
  });
});
