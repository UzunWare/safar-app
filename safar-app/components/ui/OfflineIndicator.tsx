/**
 * OfflineIndicator Component
 * Story 7.6: Offline Sync Queue
 *
 * Displays connectivity status: offline banner, syncing indicator, and sync success toast.
 * Uses Divine Geometry palette.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import { colors } from '@/constants/colors';

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount, showSyncSuccess } = useSyncStore();

  // Sync success toast
  if (isOnline && showSyncSuccess) {
    return (
      <View
        testID="sync-success-indicator"
        accessibilityRole="alert"
        accessibilityLabel="Progress synced successfully"
        className="py-2 px-4 flex-row items-center justify-center"
        style={{ backgroundColor: colors.gold }}
      >
        <Text
          style={{ fontFamily: 'Outfit', fontWeight: '500', color: colors.emeraldDeep }}
          className="text-sm"
        >
          Progress synced
        </Text>
      </View>
    );
  }

  // Syncing indicator
  if (isOnline && isSyncing) {
    return (
      <View
        testID="syncing-indicator"
        accessibilityRole="alert"
        accessibilityLabel={`Syncing ${pendingCount} pending items`}
        className="py-2 px-4 flex-row items-center justify-center"
        style={{ backgroundColor: colors.goldAlpha[20] }}
      >
        <RefreshCw size={14} color={colors.gold} />
        <Text
          style={{ fontFamily: 'Outfit', fontWeight: '500', color: colors.gold }}
          className="ml-2 text-sm"
        >
          Syncing...
        </Text>
      </View>
    );
  }

  // Offline indicator
  if (!isOnline) {
    return (
      <View
        testID="offline-indicator"
        accessibilityRole="alert"
        accessibilityLabel={`You are offline${pendingCount > 0 ? `. ${pendingCount} items pending sync` : ''}`}
        className="py-2 px-4 flex-row items-center justify-center"
        style={{ backgroundColor: colors.midnight, borderBottomWidth: 1, borderBottomColor: colors.goldAlpha[20] }}
      >
        <WifiOff size={14} color={colors.gold} />
        <Text
          style={{ fontFamily: 'Outfit', fontWeight: '500', color: colors.cream }}
          className="ml-2 text-sm"
        >
          Offline
        </Text>
        {pendingCount > 0 && (
          <Text
            style={{ fontFamily: 'Outfit', fontWeight: '400', color: colors.goldAlpha.solid }}
            className="ml-1 text-sm"
          >
            ({pendingCount} pending)
          </Text>
        )}
      </View>
    );
  }

  return null;
}
