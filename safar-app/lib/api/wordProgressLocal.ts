/**
 * Local-first word progress storage for offline SM-2 support.
 * Saves progress to AsyncStorage immediately and queues sync to Supabase.
 * Uses the same sync_queue pattern as progress.ts (lesson completion).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import * as Sentry from '@/lib/utils/sentry';
import { deriveWordStatus } from '@/lib/utils/sm2';

interface LocalWordProgress {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  isSynced: boolean;
  updatedAt: string;
}

interface SyncQueueItem {
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

function progressKey(userId: string, wordId: string): string {
  return `word_progress:${userId}:${wordId}`;
}

function queueKey(userId: string): string {
  return `sync_queue_${userId}`;
}

/**
 * Save word progress locally and queue for sync.
 * Calculates happen on-device; results stored in AsyncStorage immediately.
 */
export async function saveWordProgressLocally(
  userId: string,
  wordId: string,
  sm2Result: { easeFactor: number; interval: number; repetitions: number; nextReview: string }
): Promise<void> {
  const now = new Date().toISOString();
  const status = deriveWordStatus(sm2Result.repetitions, sm2Result.interval);

  // Save progress to local storage
  const progress: LocalWordProgress = {
    easeFactor: sm2Result.easeFactor,
    interval: sm2Result.interval,
    repetitions: sm2Result.repetitions,
    nextReview: sm2Result.nextReview,
    isSynced: false,
    updatedAt: now,
  };
  await AsyncStorage.setItem(progressKey(userId, wordId), JSON.stringify(progress));

  // Queue for sync (same pattern as progress.ts)
  const key = queueKey(userId);
  const existing = await AsyncStorage.getItem(key);
  let queue: SyncQueueItem[] = [];
  try {
    queue = existing ? JSON.parse(existing) : [];
  } catch {
    queue = [];
  }
  queue.push({
    type: 'word_progress',
    payload: {
      word_id: wordId,
      ease_factor: sm2Result.easeFactor,
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
      next_review: sm2Result.nextReview,
      status,
    },
    createdAt: now,
  });
  await AsyncStorage.setItem(key, JSON.stringify(queue));
}

/**
 * Get locally stored word progress.
 * Returns null if no local data exists or data is corrupted.
 */
export async function getLocalWordProgress(
  userId: string,
  wordId: string
): Promise<LocalWordProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(progressKey(userId, wordId));
    if (!raw) return null;
    return JSON.parse(raw) as LocalWordProgress;
  } catch {
    return null;
  }
}

interface SyncResult {
  synced: number;
  failed: number;
}

/**
 * Sync locally queued word progress items to Supabase.
 * Processes only word_progress type items; leaves other types untouched.
 */
export async function syncWordProgress(userId: string): Promise<SyncResult> {
  const key = queueKey(userId);
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return { synced: 0, failed: 0 };

  let queue: SyncQueueItem[];
  try {
    queue = JSON.parse(raw);
  } catch {
    await AsyncStorage.removeItem(key);
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  const remainingItems: SyncQueueItem[] = [];

  for (const item of queue) {
    if (item.type !== 'word_progress') {
      // Keep non-word_progress items in the queue for other sync functions
      remainingItems.push(item);
      continue;
    }

    const payload = item.payload as {
      word_id: string;
      ease_factor: number;
      interval: number;
      repetitions: number;
      next_review: string;
      status: string;
    };

    const { error } = await supabase.from('user_word_progress').upsert(
      {
        user_id: userId,
        word_id: payload.word_id,
        ease_factor: payload.ease_factor,
        interval: payload.interval,
        repetitions: payload.repetitions,
        next_review: payload.next_review,
        status: payload.status,
      },
      { onConflict: 'user_id,word_id' }
    );

    if (error) {
      Sentry.captureException(error, {
        level: 'warning',
        tags: { component: 'word-progress-sync', action: 'sync' },
      });
      remainingItems.push(item);
    } else {
      synced++;

      // Mark local progress as synced
      try {
        const localRaw = await AsyncStorage.getItem(progressKey(userId, payload.word_id));
        if (localRaw) {
          const local = JSON.parse(localRaw);
          local.isSynced = true;
          await AsyncStorage.setItem(progressKey(userId, payload.word_id), JSON.stringify(local));
        }
      } catch {
        // Non-critical: local flag update failure doesn't affect sync
      }
    }
  }

  if (remainingItems.length > 0) {
    await AsyncStorage.setItem(key, JSON.stringify(remainingItems));
  } else {
    await AsyncStorage.removeItem(key);
  }

  return { synced, failed: remainingItems.filter((i) => i.type === 'word_progress').length };
}
