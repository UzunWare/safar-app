/**
 * Tests for useSyncOnForeground hook
 * Story 7.6: Offline Sync Queue - Task 6
 */

import { renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { useSyncOnForeground } from '@/lib/hooks/useSyncOnForeground';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import { act } from '@testing-library/react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock sync module
const mockProcessSyncQueue = jest.fn(() => Promise.resolve({ synced: 0, failed: 0 }));
const mockGetQueue = jest.fn(() => Promise.resolve([]));

jest.mock('@/lib/api/sync', () => ({
  processSyncQueue: (...args: unknown[]) => mockProcessSyncQueue(...args),
  getQueue: (...args: unknown[]) => mockGetQueue(...args),
}));

// Mock supabase
jest.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

// Mock AppState.addEventListener
const mockAppStateAddEventListener = jest.fn();
jest.spyOn(AppState, 'addEventListener').mockImplementation(mockAppStateAddEventListener);

describe('useSyncOnForeground', () => {
  let appStateCallback: ((state: AppStateStatus) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    appStateCallback = null;

    mockAppStateAddEventListener.mockImplementation(
      (_event: string, callback: (state: AppStateStatus) => void) => {
        appStateCallback = callback;
        return { remove: jest.fn() };
      }
    );

    mockGetQueue.mockResolvedValue([]);
    mockProcessSyncQueue.mockResolvedValue({ synced: 0, failed: 0 });

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

  it('should subscribe to AppState changes on mount', () => {
    renderHook(() => useSyncOnForeground());
    expect(mockAppStateAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should unsubscribe on unmount', () => {
    const mockRemove = jest.fn();
    mockAppStateAddEventListener.mockReturnValue({ remove: mockRemove });

    const { unmount } = renderHook(() => useSyncOnForeground());
    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it('should trigger sync when app comes to foreground with pending items', async () => {
    mockGetQueue.mockResolvedValue([
      { id: '1', type: 'lesson_complete', payload: {}, createdAt: '2026-02-13T00:00:00Z', retryCount: 0 },
    ]);

    renderHook(() => useSyncOnForeground());

    await act(async () => {
      appStateCallback?.('active');
    });

    expect(mockProcessSyncQueue).toHaveBeenCalled();
  });

  it('should not trigger sync when going to background', async () => {
    renderHook(() => useSyncOnForeground());

    await act(async () => {
      appStateCallback?.('background');
    });

    expect(mockProcessSyncQueue).not.toHaveBeenCalled();
  });

  it('should not trigger sync when offline', async () => {
    act(() => {
      useSyncStore.getState().setOnline(false);
    });

    mockGetQueue.mockResolvedValue([
      { id: '1', type: 'lesson_complete', payload: {}, createdAt: '2026-02-13T00:00:00Z', retryCount: 0 },
    ]);

    renderHook(() => useSyncOnForeground());

    await act(async () => {
      appStateCallback?.('active');
    });

    expect(mockProcessSyncQueue).not.toHaveBeenCalled();
  });

  it('should not trigger sync when already syncing', async () => {
    act(() => {
      useSyncStore.getState().setSyncing(true);
    });

    mockGetQueue.mockResolvedValue([
      { id: '1', type: 'lesson_complete', payload: {}, createdAt: '2026-02-13T00:00:00Z', retryCount: 0 },
    ]);

    renderHook(() => useSyncOnForeground());

    await act(async () => {
      appStateCallback?.('active');
    });

    expect(mockProcessSyncQueue).not.toHaveBeenCalled();
  });
});
