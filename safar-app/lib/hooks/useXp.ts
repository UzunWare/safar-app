/**
 * useXp Hook
 *
 * Query hook for XP points data.
 * Returns total XP and a function to award XP.
 *
 * Story 5.4: XP Points System
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { fetchXp, awardXp as awardXpApi, syncPendingXp } from '@/lib/api/xp';
import { timeouts } from '@/constants/timeouts';

export interface UseXpResult {
  totalXp: number;
  isLoading: boolean;
  awardXp: (amount: number) => Promise<void>;
}

export function useXp(): UseXpResult {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['xp', userId],
    queryFn: () => fetchXp(userId!),
    staleTime: timeouts.query.xp,
    enabled: !!userId,
  });

  const syncPending = useCallback(async () => {
    if (!userId) return;
    const synced = await syncPendingXp(userId);
    if (synced) {
      queryClient.setQueryData(['xp', userId], synced);
    }
  }, [queryClient, userId]);

  useEffect(() => {
    if (!userId) return;

    void syncPending();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void syncPending();
      }
    });

    return () => subscription.remove();
  }, [syncPending, userId]);

  const awardXp = useCallback(
    async (amount: number) => {
      if (!userId) return;
      const updated = await awardXpApi(userId, amount);
      queryClient.setQueryData(['xp', userId], updated);
    },
    [userId, queryClient]
  );

  return {
    totalXp: data?.totalXp ?? 0,
    isLoading,
    awardXp,
  };
}
