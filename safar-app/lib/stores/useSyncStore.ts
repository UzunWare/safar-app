/**
 * Sync Store
 * Story 7.6: Offline Sync Queue
 *
 * Tracks online/offline status, sync progress, and pending item count.
 */

import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  showSyncSuccess: boolean;

  setOnline: (value: boolean) => void;
  setSyncing: (value: boolean) => void;
  setPendingCount: (count: number) => void;
  setLastSyncedAt: (timestamp: string | null) => void;
  setShowSyncSuccess: (value: boolean) => void;
  incrementPending: () => void;
  decrementPending: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
  showSyncSuccess: false,

  setOnline: (value) => set({ isOnline: value }),
  setSyncing: (value) => set({ isSyncing: value }),
  setPendingCount: (count) => set({ pendingCount: count }),
  setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
  setShowSyncSuccess: (value) => set({ showSyncSuccess: value }),
  incrementPending: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),
  decrementPending: () =>
    set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),
}));
