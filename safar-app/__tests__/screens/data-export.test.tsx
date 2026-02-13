import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DataExportScreen from '@/app/data-export';
import { requestDataExport } from '@/lib/api/dataExport';
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

// Mock data export API
const mockGetExportRequestStatus = jest.fn().mockResolvedValue(null);
jest.mock('@/lib/api/dataExport', () => ({
  requestDataExport: jest.fn().mockResolvedValue({ success: true }),
  getExportRequestStatus: (...args: any[]) => mockGetExportRequestStatus(...args),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

describe('Data Export Screen (Story 7.7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requestDataExport as jest.Mock).mockResolvedValue({ success: true });
    mockGetExportRequestStatus.mockResolvedValue(null);
  });

  describe('Task 2: Export explanation screen content', () => {
    it('renders the screen title "Export Your Data"', () => {
      const { getByText } = render(<DataExportScreen />);
      expect(getByText('Export Your Data')).toBeTruthy();
    });

    it('explains what data is included', () => {
      const { getByText } = render(<DataExportScreen />);
      expect(getByText(/profile information/i)).toBeTruthy();
      expect(getByText(/learning progress/i)).toBeTruthy();
      expect(getByText(/settings and preferences/i)).toBeTruthy();
      expect(getByText(/streak and XP/i)).toBeTruthy();
    });

    it('explains delivery method (email within 30 days)', () => {
      const { getByText } = render(<DataExportScreen />);
      expect(getByText(/email/i)).toBeTruthy();
      expect(getByText(/30 days/i)).toBeTruthy();
    });

    it('shows the user email address', () => {
      const { getByText } = render(<DataExportScreen />);
      expect(getByText(/test@example.com/)).toBeTruthy();
    });

    it('renders the "Request Export" confirm button', () => {
      const { getByTestId } = render(<DataExportScreen />);
      expect(getByTestId('request-export-button')).toBeTruthy();
    });

    it('renders a back button', () => {
      const { getByLabelText } = render(<DataExportScreen />);
      expect(getByLabelText('Go back')).toBeTruthy();
    });
  });

  describe('Task 4: Export request submission', () => {
    it('calls requestDataExport (user from JWT) when button pressed', async () => {
      const { getByTestId } = render(<DataExportScreen />);
      fireEvent.press(getByTestId('request-export-button'));

      await waitFor(() => {
        expect(requestDataExport).toHaveBeenCalledWith();
      });
    });

    it('shows success alert with 30-day message on successful export', async () => {
      const { getByTestId } = render(<DataExportScreen />);
      fireEvent.press(getByTestId('request-export-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Export Requested',
          "We'll email your data within 30 days.",
          expect.any(Array)
        );
      });
    });

    it('shows "Export In Progress" alert when duplicate request detected', async () => {
      (requestDataExport as jest.Mock).mockResolvedValue({
        success: true,
        message: 'An export request is already being processed.',
      });

      const { getByTestId } = render(<DataExportScreen />);
      fireEvent.press(getByTestId('request-export-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Export In Progress',
          'An export request is already being processed.',
          expect.any(Array)
        );
      });
    });

    it('shows error alert when export fails with error message', async () => {
      (requestDataExport as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Server error',
      });

      const { getByTestId } = render(<DataExportScreen />);
      fireEvent.press(getByTestId('request-export-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Export Failed', 'Server error');
      });
    });

    it('shows generic error alert when export throws', async () => {
      (requestDataExport as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { getByTestId } = render(<DataExportScreen />);
      fireEvent.press(getByTestId('request-export-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Export Failed',
          'Failed to request export. Please try again.'
        );
      });
    });

    it('navigates back when tapping back button', () => {
      const { getByLabelText } = render(<DataExportScreen />);
      fireEvent.press(getByLabelText('Go back'));
      expect(router.back).toHaveBeenCalled();
    });
  });

  describe('Task 6: Export request status on revisit', () => {
    it('shows pending banner when existing request is pending', async () => {
      mockGetExportRequestStatus.mockResolvedValue({
        id: 'req-1',
        status: 'pending',
        requested_at: '2026-02-13T10:00:00Z',
        completed_at: null,
      });

      const { findByTestId, findByText } = render(<DataExportScreen />);

      expect(await findByTestId('pending-export-banner')).toBeTruthy();
      expect(await findByText(/already being processed/i)).toBeTruthy();
    });

    it('shows "Export In Progress" button text when request is pending', async () => {
      mockGetExportRequestStatus.mockResolvedValue({
        id: 'req-1',
        status: 'processing',
        requested_at: '2026-02-13T10:00:00Z',
        completed_at: null,
      });

      const { findByText } = render(<DataExportScreen />);

      expect(await findByText('Export In Progress')).toBeTruthy();
    });

    it('does not show banner when no existing request', () => {
      const { queryByTestId } = render(<DataExportScreen />);
      expect(queryByTestId('pending-export-banner')).toBeNull();
    });
  });
});
