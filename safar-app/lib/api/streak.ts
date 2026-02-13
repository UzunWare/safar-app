/**
 * Streak API
 * Functions for managing daily learning streaks in Supabase.
 * Uses local-first approach with server sync.
 *
 * Story 5.2: Streak Tracking
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@/lib/utils/sentry';
import {
  calculateStreakWithFreeze,
  getEffectiveCurrentStreak,
  getTodayLocalDateString,
  isFreezeAvailable,
  shouldIncrementStreak,
} from '@/lib/utils/streak';

const STREAK_CACHE_KEY = '@safar/streak';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  freezeUsedAt: string | null;
}

interface StreakRow {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  freeze_used_at: string | null;
}

/**
 * Fetch current user's streak record, creating one if it does not exist.
 */
export async function fetchStreak(userId: string): Promise<StreakData> {
  try {
    let row = await getStreakRow(userId);
    if (!row) {
      row = await createStreakRow(userId);
    }

    if (!row) {
      return getCachedStreak(userId);
    }

    const normalized = await normalizeBrokenStreak(userId, mapRowToStreakData(row));
    await cacheStreak(userId, normalized);
    return normalized;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'streak-api', action: 'fetch-streak' },
    });
    return getCachedStreak(userId);
  }
}

/**
 * Record activity and update streak.
 * Called when user completes a lesson or review.
 */
export async function recordStreakActivity(userId: string): Promise<StreakData> {
  try {
    // First fetch current streak state
    const current = await fetchStreak(userId);
    const today = getTodayLocalDateString();

    const { newStreak, shouldUpdate } = shouldIncrementStreak(
      current.lastActivityDate,
      current.currentStreak,
      current.freezeUsedAt
    );

    if (!shouldUpdate) {
      // Already recorded activity today
      return current;
    }

    const newLongest = Math.max(current.longestStreak, newStreak);

    const { error } = await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    const result: StreakData = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: today,
      freezeUsedAt: current.freezeUsedAt,
    };

    if (error) {
      // Cache locally for later sync
      Sentry.captureException(error, {
        level: 'warning',
        tags: { component: 'streak-api', action: 'record-activity' },
      });
    }

    await cacheStreak(userId, result);
    return result;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'streak-api', action: 'record-activity' },
    });
    // Return best-effort local state
    return getCachedStreak(userId);
  }
}

function mapRowToStreakData(row: StreakRow): StreakData {
  return {
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastActivityDate: row.last_activity_date,
    freezeUsedAt: row.freeze_used_at,
  };
}

async function getStreakRow(userId: string): Promise<StreakRow | null> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('current_streak, longest_streak, last_activity_date, freeze_used_at')
    .eq('user_id', userId)
    .single();

  if (error?.code === 'PGRST116') {
    return null;
  }

  if (error || !data) {
    throw error ?? new Error('Missing streak row');
  }

  return data as StreakRow;
}

async function createStreakRow(userId: string): Promise<StreakRow | null> {
  const { data, error } = await supabase
    .from('user_streaks')
    .insert({ user_id: userId, current_streak: 0, longest_streak: 0 })
    .select('current_streak, longest_streak, last_activity_date, freeze_used_at')
    .single();

  if (error?.code === '23505') {
    // Another request created the row concurrently.
    return getStreakRow(userId);
  }

  if (error || !data) {
    Sentry.captureException(error ?? new Error('Failed to create streak row'), {
      level: 'warning',
      tags: { component: 'streak-api', action: 'create-streak-row' },
    });
    return null;
  }

  return data as StreakRow;
}

async function normalizeBrokenStreak(userId: string, data: StreakData): Promise<StreakData> {
  const status = calculateStreakWithFreeze(
    data.lastActivityDate,
    data.freezeUsedAt,
    data.currentStreak
  );
  if (status !== 'broken' || data.currentStreak === 0) {
    return data;
  }

  const normalized: StreakData = {
    currentStreak: getEffectiveCurrentStreak(data.lastActivityDate, data.currentStreak),
    longestStreak: data.longestStreak,
    lastActivityDate: data.lastActivityDate,
    freezeUsedAt: data.freezeUsedAt,
  };

  const { error } = await supabase
    .from('user_streaks')
    .update({
      current_streak: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'streak-api', action: 'normalize-broken-streak' },
    });
  }

  return normalized;
}

async function cacheStreak(userId: string, data: StreakData): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STREAK_CACHE_KEY}/${userId}`, JSON.stringify(data));
  } catch {
    // Silent fail for cache
  }
}

async function getCachedStreak(userId: string): Promise<StreakData> {
  try {
    const raw = await AsyncStorage.getItem(`${STREAK_CACHE_KEY}/${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore cache errors
  }

  return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, freezeUsedAt: null };
}

/**
 * Use a streak freeze for today. Sets freeze_used_at = today.
 * Preserves the current streak by marking the freeze date.
 * Story 5.3: Streak Freeze — Task 3
 */
export async function useStreakFreeze(userId: string): Promise<StreakData> {
  try {
    const current = await fetchStreak(userId);
    const today = getTodayLocalDateString();

    // Enforce one freeze per calendar week at API layer as well as UI.
    if (!isFreezeAvailable(current.freezeUsedAt)) {
      await cacheStreak(userId, current);
      return current;
    }

    const { error } = await supabase
      .from('user_streaks')
      .update({
        freeze_used_at: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    const result: StreakData = {
      currentStreak: current.currentStreak,
      longestStreak: current.longestStreak,
      lastActivityDate: current.lastActivityDate,
      freezeUsedAt: today,
    };

    if (error) {
      Sentry.captureException(error, {
        level: 'warning',
        tags: { component: 'streak-api', action: 'use-streak-freeze' },
      });
    }

    await cacheStreak(userId, result);
    return result;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'streak-api', action: 'use-streak-freeze' },
    });
    return getCachedStreak(userId);
  }
}
