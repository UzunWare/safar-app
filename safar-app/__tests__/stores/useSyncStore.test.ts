/**
 * Tests for useSyncStore
 * Story 7.6: Offline Sync Queue
 */

import { act } from '@testing-library/react-native';
import { useSyncStore } from '@/lib/stores/useSyncStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('useSyncStore', () => {
  beforeEach(() => {
    // Reset store to default state
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

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useSyncStore.getState();
      expect(state.isOnline).toBe(true);
      expect(state.isSyncing).toBe(false);
      expect(state.pendingCount).toBe(0);
      expect(state.lastSyncedAt).toBeNull();
      expect(state.showSyncSuccess).toBe(false);
    });
  });

  describe('setOnline', () => {
    it('should update online status to false', () => {
      act(() => {
        useSyncStore.getState().setOnline(false);
      });
      expect(useSyncStore.getState().isOnline).toBe(false);
    });

    it('should update online status to true', () => {
      act(() => {
        useSyncStore.getState().setOnline(false);
      });
      act(() => {
        useSyncStore.getState().setOnline(true);
      });
      expect(useSyncStore.getState().isOnline).toBe(true);
    });
  });

  describe('setSyncing', () => {
    it('should update syncing status', () => {
      act(() => {
        useSyncStore.getState().setSyncing(true);
      });
      expect(useSyncStore.getState().isSyncing).toBe(true);
    });
  });

  describe('setPendingCount', () => {
    it('should update pending count', () => {
      act(() => {
        useSyncStore.getState().setPendingCount(5);
      });
      expect(useSyncStore.getState().pendingCount).toBe(5);
    });

    it('should allow setting to zero', () => {
      act(() => {
        useSyncStore.getState().setPendingCount(3);
      });
      act(() => {
        useSyncStore.getState().setPendingCount(0);
      });
      expect(useSyncStore.getState().pendingCount).toBe(0);
    });
  });

  describe('setLastSyncedAt', () => {
    it('should update last synced timestamp', () => {
      const timestamp = '2026-02-13T00:00:00Z';
      act(() => {
        useSyncStore.getState().setLastSyncedAt(timestamp);
      });
      expect(useSyncStore.getState().lastSyncedAt).toBe(timestamp);
    });
  });

  describe('setShowSyncSuccess', () => {
    it('should update sync success visibility', () => {
      act(() => {
        useSyncStore.getState().setShowSyncSuccess(true);
      });
      expect(useSyncStore.getState().showSyncSuccess).toBe(true);
    });
  });

  describe('incrementPending', () => {
    it('should increment pending count by 1', () => {
      act(() => {
        useSyncStore.getState().incrementPending();
      });
      expect(useSyncStore.getState().pendingCount).toBe(1);
    });

    it('should increment multiple times', () => {
      act(() => {
        useSyncStore.getState().incrementPending();
        useSyncStore.getState().incrementPending();
        useSyncStore.getState().incrementPending();
      });
      expect(useSyncStore.getState().pendingCount).toBe(3);
    });
  });

  describe('decrementPending', () => {
    it('should decrement pending count by 1', () => {
      act(() => {
        useSyncStore.getState().setPendingCount(3);
      });
      act(() => {
        useSyncStore.getState().decrementPending();
      });
      expect(useSyncStore.getState().pendingCount).toBe(2);
    });

    it('should not go below zero', () => {
      act(() => {
        useSyncStore.getState().decrementPending();
      });
      expect(useSyncStore.getState().pendingCount).toBe(0);
    });
  });
});
