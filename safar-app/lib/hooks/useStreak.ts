/**
 * useStreak Hook
 *
 * Query hook for daily learning streak data.
 * Returns current streak count, status, and longest streak.
 *
 * Story 5.2: Streak Tracking - Task 3
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import {
  fetchStreak,
  recordStreakActivity,
  useStreakFreeze as applyStreakFreeze,
} from '@/lib/api/streak';
import {
  calculateStreakWithFreeze,
  getEffectiveCurrentStreak,
  getNextFreezeDate,
  isFreezeAvailable,
  type FreezeStreakStatus,
} from '@/lib/utils/streak';
import { timeouts } from '@/constants/timeouts';

export interface UseStreakResult {
  currentStreak: number;
  longestStreak: number;
  status: FreezeStreakStatus;
  lastActivityDate: string | null;
  freezeUsedAt: string | null;
  freezeAvailable: boolean;
  nextFreezeDate: string | null;
  isLoading: boolean;
  recordActivity: () => Promise<void>;
  useFreeze: () => Promise<void>;
}

export function useStreak(): UseStreakResult {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['streak', userId],
    queryFn: () => fetchStreak(userId!),
    staleTime: timeouts.query.streak,
    enabled: !!userId,
  });

  const rawCurrentStreak = data?.currentStreak ?? 0;
  const longestStreak = data?.longestStreak ?? 0;
  const lastActivityDate = data?.lastActivityDate ?? null;
  const freezeUsedAt = data?.freezeUsedAt ?? null;
  const status = calculateStreakWithFreeze(lastActivityDate, freezeUsedAt, rawCurrentStreak);
  // Frozen streaks should preserve their count, not reset to 0
  const currentStreak =
    status === 'frozen'
      ? rawCurrentStreak
      : getEffectiveCurrentStreak(lastActivityDate, rawCurrentStreak);
  const freezeAvailable = isFreezeAvailable(freezeUsedAt);
  const nextFreezeDate = freezeUsedAt && !freezeAvailable ? getNextFreezeDate(freezeUsedAt) : null;

  const recordActivity = useCallback(async () => {
    if (!userId) return;
    const updated = await recordStreakActivity(userId);
    queryClient.setQueryData(['streak', userId], updated);
  }, [userId, queryClient]);

  const useFreeze = useCallback(async () => {
    if (!userId) return;
    const updated = await applyStreakFreeze(userId);
    queryClient.setQueryData(['streak', userId], updated);
  }, [userId, queryClient]);

  return {
    currentStreak,
    longestStreak,
    status,
    lastActivityDate,
    freezeUsedAt,
    freezeAvailable,
    nextFreezeDate,
    isLoading,
    recordActivity,
    useFreeze,
  };
}
