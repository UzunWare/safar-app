/**
 * useNetworkStatus Hook
 * Story 7.6: Offline Sync Queue
 *
 * Monitors network connectivity via NetInfo and updates the sync store.
 * Hydrates pending count on mount and triggers sync on reconnection.
 */

import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import { executeSyncCycle, hydratePendingCount } from '@/lib/api/syncHelpers';

export function useNetworkStatus() {
  useEffect(() => {
    // Hydrate pending count from persisted queue on app start
    hydratePendingCount();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = !useSyncStore.getState().isOnline;
      const isNowOnline = state.isConnected === true;

      useSyncStore.getState().setOnline(isNowOnline);

      if (wasOffline && isNowOnline) {
        executeSyncCycle();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
