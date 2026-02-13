/**
 * useProgressStats Hook
 *
 * Aggregates data from multiple sources for the dashboard:
 * - Pathway completion percentage
 * - Words learned count (all words with any progress)
 * - Mastered words count (interval >= 7 days)
 * - Current streak (daily learning streak from Story 5.2)
 * - Offline caching with "last synced" indicator (AC#3)
 *
 * Story 5.1 - Tasks 5, 7 | Story 5.2 - Task 5
 */

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLearningStateSummary } from '@/lib/hooks/useLearningStateSummary';
import { useMasteredCount } from '@/lib/hooks/useMasteredCount';
import { useStreak } from '@/lib/hooks/useStreak';
import { useAuthStore } from '@/lib/stores/useAuthStore';

const CACHE_KEY_PREFIX = '@safar/progress_stats';

interface CachedStats {
  wordsLearned: number;
  wordsMastered: number;
  currentStreak: number;
  pathwayPercentage: number;
  lastSynced: string;
}

export interface ProgressStats {
  wordsLearned: number;
  wordsMastered: number;
  currentStreak: number;
  pathwayPercentage: number;
  isLoading: boolean;
  lastSynced: string | null;
}

export function useProgressStats(pathwayPercentage = 0, pathwayLoading = false): ProgressStats {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const { data: learningState, isLoading: stateLoading } = useLearningStateSummary();
  const { data: masteredCount, isLoading: masteredLoading } = useMasteredCount();
  const { currentStreak, isLoading: streakLoading } = useStreak();
  const [cachedStats, setCachedStats] = useState<CachedStats | null>(null);
  const cacheKey = userId ? `${CACHE_KEY_PREFIX}/${userId}` : null;

  // Load cached stats for the active user
  useEffect(() => {
    let isMounted = true;
    if (!cacheKey) {
      setCachedStats(null);
      return;
    }

    AsyncStorage.getItem(cacheKey).then((raw) => {
      if (!isMounted) return;
      if (!raw) {
        setCachedStats(null);
        return;
      }

      try {
        setCachedStats(JSON.parse(raw));
      } catch {
        // Ignore corrupt cache
        if (isMounted) {
          setCachedStats(null);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [cacheKey]);

  const isLoading = stateLoading || masteredLoading || streakLoading || pathwayLoading;
  const hasFreshData = !!learningState || masteredCount != null || pathwayPercentage > 0;

  const wordsLearned = learningState
    ? learningState.learning + learningState.review + learningState.mastered
    : 0;

  const wordsMastered = masteredCount ?? 0;

  // Cache stats whenever fresh values change
  useEffect(() => {
    if (!cacheKey || isLoading || !hasFreshData) {
      return;
    }

    const toCache: CachedStats = {
      wordsLearned,
      wordsMastered,
      currentStreak,
      pathwayPercentage,
      lastSynced: new Date().toISOString(),
    };

    AsyncStorage.setItem(cacheKey, JSON.stringify(toCache));
    setCachedStats(toCache);
  }, [
    cacheKey,
    currentStreak,
    hasFreshData,
    isLoading,
    pathwayPercentage,
    wordsLearned,
    wordsMastered,
  ]);

  // Use cached data when loading
  if (isLoading && cachedStats) {
    return {
      wordsLearned: cachedStats.wordsLearned,
      wordsMastered: cachedStats.wordsMastered,
      currentStreak: cachedStats.currentStreak,
      pathwayPercentage: cachedStats.pathwayPercentage,
      isLoading: true,
      lastSynced: cachedStats.lastSynced,
    };
  }

  return {
    wordsLearned,
    wordsMastered,
    currentStreak,
    pathwayPercentage,
    isLoading,
    lastSynced: cachedStats?.lastSynced ?? null,
  };
}
