/**
 * XP API
 * Functions for managing XP points in Supabase.
 * Uses local-first approach with server sync.
 *
 * Story 5.4: XP Points System
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@/lib/utils/sentry';

const XP_CACHE_KEY = '@safar/xp';
const XP_PENDING_KEY = '@safar/xp-pending';

export interface XpData {
  totalXp: number;
}

interface XpRow {
  total_xp: number;
}

function normalizeXpDelta(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new Error('XP amount must be a finite number');
  }
  if (!Number.isInteger(amount)) {
    throw new Error('XP amount must be an integer');
  }
  if (amount < 0) {
    throw new Error('XP amount must be non-negative');
  }
  return amount;
}

async function incrementXpAtomically(userId: string, delta: number): Promise<XpData> {
  const { data, error } = await supabase.rpc('increment_user_xp', {
    p_user_id: userId,
    p_delta: delta,
  });

  if (error) {
    throw error;
  }

  if (typeof data !== 'number') {
    throw new Error('Invalid XP increment response');
  }

  return { totalXp: data };
}

/**
 * Fetch current user's XP record, creating one if it does not exist.
 */
export async function fetchXp(userId: string): Promise<XpData> {
  try {
    let row = await getXpRow(userId);
    if (!row) {
      row = await createXpRow(userId);
    }

    if (!row) {
      return getCachedXp(userId);
    }

    const normalized: XpData = { totalXp: row.total_xp };
    await cacheXp(userId, normalized);
    return normalized;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'xp-api', action: 'fetch-xp' },
    });
    return getCachedXp(userId);
  }
}

/**
 * Award XP points to a user.
 * Uses an atomic database operation and falls back to local pending queue when offline.
 */
export async function awardXp(userId: string, amount: number): Promise<XpData> {
  const delta = normalizeXpDelta(amount);
  if (delta === 0) {
    return fetchXp(userId);
  }

  try {
    const result = await incrementXpAtomically(userId, delta);
    await cacheXp(userId, result);
    return result;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'xp-api', action: 'award-xp' },
    });

    await queuePendingDelta(userId, delta);

    // Optimistically reflect progress in UI/cache even when network write fails.
    const cached = await getCachedXp(userId);
    const optimistic: XpData = { totalXp: cached.totalXp + delta };
    await cacheXp(userId, optimistic);
    return optimistic;
  }
}

async function getXpRow(userId: string): Promise<XpRow | null> {
  const { data, error } = await supabase
    .from('user_xp')
    .select('total_xp')
    .eq('user_id', userId)
    .single();

  if (error?.code === 'PGRST116') {
    return null;
  }

  if (error || !data) {
    throw error ?? new Error('Missing XP row');
  }

  return data as XpRow;
}

async function createXpRow(userId: string): Promise<XpRow | null> {
  const { data, error } = await supabase
    .from('user_xp')
    .insert({ user_id: userId, total_xp: 0 })
    .select('total_xp')
    .single();

  if (error?.code === '23505') {
    return getXpRow(userId);
  }

  if (error || !data) {
    Sentry.captureException(error ?? new Error('Failed to create XP row'), {
      level: 'warning',
      tags: { component: 'xp-api', action: 'create-xp-row' },
    });
    return null;
  }

  return data as XpRow;
}

async function cacheXp(userId: string, data: XpData): Promise<void> {
  try {
    await AsyncStorage.setItem(`${XP_CACHE_KEY}/${userId}`, JSON.stringify(data));
  } catch {
    // Silent fail for cache
  }
}

async function getCachedXp(userId: string): Promise<XpData> {
  try {
    const raw = await AsyncStorage.getItem(`${XP_CACHE_KEY}/${userId}`);
    if (raw) {
      return JSON.parse(raw) as XpData;
    }
  } catch {
    // Ignore cache errors
  }

  return { totalXp: 0 };
}

async function queuePendingDelta(userId: string, delta: number): Promise<void> {
  if (delta <= 0) return;

  try {
    const existing = await AsyncStorage.getItem(`${XP_PENDING_KEY}/${userId}`);
    const existingDelta = existing ? parseInt(existing, 10) : 0;
    const accumulated = (Number.isNaN(existingDelta) ? 0 : existingDelta) + delta;
    await AsyncStorage.setItem(`${XP_PENDING_KEY}/${userId}`, String(accumulated));
  } catch {
    // Silent fail
  }
}

/**
 * Sync any pending XP deltas that were queued during offline operation.
 * Returns null if no pending delta or sync failed.
 */
export async function syncPendingXp(userId: string): Promise<XpData | null> {
  try {
    const raw = await AsyncStorage.getItem(`${XP_PENDING_KEY}/${userId}`);
    if (!raw) {
      return null;
    }

    const pendingDelta = parseInt(raw, 10);
    if (Number.isNaN(pendingDelta) || pendingDelta <= 0) {
      await AsyncStorage.removeItem(`${XP_PENDING_KEY}/${userId}`);
      return null;
    }

    const result = await incrementXpAtomically(userId, pendingDelta);

    // Success: clear pending queue and update cache.
    await AsyncStorage.removeItem(`${XP_PENDING_KEY}/${userId}`);
    await cacheXp(userId, result);
    return result;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'xp-api', action: 'sync-pending-xp' },
    });
    return null;
  }
}
