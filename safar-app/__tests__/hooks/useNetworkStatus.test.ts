/**
 * Tests for useNetworkStatus hook
 * Story 7.6: Offline Sync Queue
 */

import { renderHook, act } from '@testing-library/react-native';
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';
import { useSyncStore } from '@/lib/stores/useSyncStore';

// Mock NetInfo
const mockAddEventListener = jest.fn();
const mockFetch = jest.fn();

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: (...args: unknown[]) => mockAddEventListener(...args),
    fetch: (...args: unknown[]) => mockFetch(...args),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock sync module
jest.mock('@/lib/api/sync', () => ({
  processSyncQueue: jest.fn(() => Promise.resolve({ synced: 0, failed: 0 })),
  getQueue: jest.fn(() => Promise.resolve([])),
}));

// Mock supabase
jest.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

describe('useNetworkStatus', () => {
  let listenerCallback: ((state: { isConnected: boolean | null }) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    listenerCallback = null;

    // Capture the event listener callback
    mockAddEventListener.mockImplementation((callback: (state: { isConnected: boolean | null }) => void) => {
      listenerCallback = callback;
      return jest.fn(); // unsubscribe function
    });

    mockFetch.mockResolvedValue({ isConnected: true });

    // Reset store
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

  it('should subscribe to NetInfo events on mount', () => {
    renderHook(() => useNetworkStatus());
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe on unmount', () => {
    const unsubscribe = jest.fn();
    mockAddEventListener.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useNetworkStatus());
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should update store when going offline', () => {
    renderHook(() => useNetworkStatus());

    act(() => {
      listenerCallback?.({ isConnected: false });
    });

    expect(useSyncStore.getState().isOnline).toBe(false);
  });

  it('should update store when coming back online', () => {
    // Start offline
    act(() => {
      useSyncStore.getState().setOnline(false);
    });

    renderHook(() => useNetworkStatus());

    act(() => {
      listenerCallback?.({ isConnected: true });
    });

    expect(useSyncStore.getState().isOnline).toBe(true);
  });

  it('should trigger sync when connectivity is restored', async () => {
    const { processSyncQueue, getQueue } = require('@/lib/api/sync');

    // Mock a non-empty queue so sync actually triggers
    getQueue.mockResolvedValue([
      { id: '1', type: 'lesson_complete', payload: {}, createdAt: '2026-02-13T00:00:00Z', retryCount: 0 },
    ]);

    // Start offline
    act(() => {
      useSyncStore.getState().setOnline(false);
    });

    renderHook(() => useNetworkStatus());

    await act(async () => {
      listenerCallback?.({ isConnected: true });
    });

    expect(processSyncQueue).toHaveBeenCalled();
  });

  it('should handle null connectivity gracefully', () => {
    renderHook(() => useNetworkStatus());

    act(() => {
      listenerCallback?.({ isConnected: null });
    });

    // null should be treated as offline
    expect(useSyncStore.getState().isOnline).toBe(false);
  });
});
