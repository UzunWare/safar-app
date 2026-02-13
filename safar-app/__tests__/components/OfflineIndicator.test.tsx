/**
 * Tests for OfflineIndicator component
 * Story 7.6: Offline Sync Queue
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import { act } from '@testing-library/react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  WifiOff: () => 'WifiOff',
  RefreshCw: () => 'RefreshCw',
}));

// Mock react-native-svg (needed by lucide)
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Path: 'Path',
  Circle: 'Circle',
  Rect: 'Rect',
  Line: 'Line',
  G: 'G',
}));

describe('OfflineIndicator', () => {
  beforeEach(() => {
    act(() => {
      useSyncStore.setState({
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncedAt: null,
        showSyncSuccess: false,
      });
    });
  });

  it('should not render when online', () => {
    const { queryByTestId } = render(<OfflineIndicator />);
    expect(queryByTestId('offline-indicator')).toBeNull();
  });

  it('should render when offline', () => {
    act(() => {
      useSyncStore.getState().setOnline(false);
    });

    const { getByTestId } = render(<OfflineIndicator />);
    expect(getByTestId('offline-indicator')).toBeTruthy();
  });

  it('should show "Offline" text', () => {
    act(() => {
      useSyncStore.getState().setOnline(false);
    });

    const { getByText } = render(<OfflineIndicator />);
    expect(getByText('Offline')).toBeTruthy();
  });

  it('should show pending count when items are queued', () => {
    act(() => {
      useSyncStore.setState({ isOnline: false, pendingCount: 3 });
    });

    const { getByText } = render(<OfflineIndicator />);
    expect(getByText('(3 pending)')).toBeTruthy();
  });

  it('should not show pending count when zero', () => {
    act(() => {
      useSyncStore.setState({ isOnline: false, pendingCount: 0 });
    });

    const { queryByText } = render(<OfflineIndicator />);
    expect(queryByText(/pending/)).toBeNull();
  });

  it('should have accessibility attributes', () => {
    act(() => {
      useSyncStore.getState().setOnline(false);
    });

    const { getByTestId } = render(<OfflineIndicator />);
    const indicator = getByTestId('offline-indicator');
    expect(indicator.props.accessibilityRole).toBe('alert');
    expect(indicator.props.accessibilityLabel).toBeDefined();
  });

  it('should show syncing state', () => {
    act(() => {
      useSyncStore.setState({ isOnline: true, isSyncing: true, pendingCount: 2 });
    });

    const { getByTestId } = render(<OfflineIndicator />);
    expect(getByTestId('syncing-indicator')).toBeTruthy();
  });

  it('should show sync success message', () => {
    act(() => {
      useSyncStore.setState({ isOnline: true, showSyncSuccess: true });
    });

    const { getByText } = render(<OfflineIndicator />);
    expect(getByText('Progress synced')).toBeTruthy();
  });

  it('should not render anything when online and not syncing and no success', () => {
    act(() => {
      useSyncStore.setState({ isOnline: true, isSyncing: false, showSyncSuccess: false });
    });

    const { queryByTestId } = render(<OfflineIndicator />);
    expect(queryByTestId('offline-indicator')).toBeNull();
    expect(queryByTestId('syncing-indicator')).toBeNull();
    expect(queryByTestId('sync-success-indicator')).toBeNull();
  });
});
