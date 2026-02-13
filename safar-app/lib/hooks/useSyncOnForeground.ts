/**
 * useSyncOnForeground Hook
 * Story 7.6: Offline Sync Queue
 *
 * Triggers sync queue processing when the app returns to foreground,
 * if the device is online and not already syncing.
 */

import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import { executeSyncCycle } from '@/lib/api/syncHelpers';

export function useSyncOnForeground() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);
}

async function handleAppStateChange(nextState: AppStateStatus) {
  if (nextState !== 'active') return;

  const { isOnline, isSyncing } = useSyncStore.getState();
  if (!isOnline || isSyncing) return;

  await executeSyncCycle();
}
