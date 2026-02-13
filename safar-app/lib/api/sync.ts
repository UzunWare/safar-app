/**
 * Sync Queue Utility
 * Story 7.6: Offline Sync Queue
 *
 * Local-first sync queue with FIFO processing,
 * retry logic, and failed queue isolation.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@/lib/utils/sentry';
import { supabase } from '@/lib/api/supabase';

export interface SyncQueueItem {
  id: string;
  type: 'lesson_complete' | 'review_rating' | 'settings_update';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}

export const QUEUE_KEY = 'sync_queue';
export const FAILED_QUEUE_KEY = 'sync_queue_failed';
export const MAX_RETRIES = 3;

function generateId(): string {
  const a = Math.random().toString(36).substring(2, 9);
  const b = Math.random().toString(36).substring(2, 9);
  return `${Date.now()}-${a}${b}`;
}

/**
 * Retrieve the current sync queue from AsyncStorage
 */
export async function getQueue(): Promise<SyncQueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Retrieve items that permanently failed after MAX_RETRIES
 */
export async function getFailedQueue(): Promise<SyncQueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(FAILED_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Add an item to the sync queue
 */
export async function addToSyncQueue(
  item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>
): Promise<void> {
  const queue = await getQueue();
  queue.push({
    ...item,
    id: generateId(),
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Clear the main sync queue
 */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

/**
 * Clear the failed sync queue
 */
export async function clearFailedQueue(): Promise<void> {
  await AsyncStorage.removeItem(FAILED_QUEUE_KEY);
}

/**
 * Move an item to the failed queue after exhausting retries
 */
async function moveToFailedQueue(item: SyncQueueItem): Promise<void> {
  const failedQueue = await getFailedQueue();
  failedQueue.push(item);
  await AsyncStorage.setItem(FAILED_QUEUE_KEY, JSON.stringify(failedQueue));
}

/**
 * Validate that required fields exist in a payload, throwing a clear
 * error for corrupted queue items rather than silently passing undefined.
 */
function requirePayloadFields(
  payload: Record<string, unknown>,
  fields: string[],
  itemType: string
): void {
  for (const field of fields) {
    if (payload[field] == null) {
      throw new Error(`Sync payload for '${itemType}' missing required field: ${field}`);
    }
  }
}

/**
 * Sync a single item to the server based on its type
 */
async function syncItem(item: SyncQueueItem): Promise<void> {
  switch (item.type) {
    case 'lesson_complete': {
      requirePayloadFields(item.payload, ['user_id', 'lesson_id', 'completed_at'], item.type);
      const { error } = await supabase.from('user_lesson_progress').upsert(
        {
          user_id: item.payload.user_id as string,
          lesson_id: item.payload.lesson_id as string,
          completed_at: item.payload.completed_at as string,
          is_synced: true,
        },
        { onConflict: 'user_id,lesson_id' }
      );
      if (error) throw new Error(error.message);
      break;
    }
    case 'review_rating': {
      requirePayloadFields(item.payload, ['user_id', 'word_id', 'rating', 'reviewed_at'], item.type);
      const { error } = await supabase.from('user_word_progress').upsert(
        {
          user_id: item.payload.user_id as string,
          word_id: item.payload.word_id as string,
          rating: item.payload.rating as number,
          reviewed_at: item.payload.reviewed_at as string,
          is_synced: true,
        },
        { onConflict: 'user_id,word_id' }
      );
      if (error) throw new Error(error.message);
      break;
    }
    case 'settings_update': {
      requirePayloadFields(item.payload, ['user_id'], item.type);
      const { user_id, ...settings } = item.payload;
      const { error } = await supabase
        .from('user_profiles')
        .update(settings)
        .eq('id', user_id as string);
      if (error) throw new Error(error.message);
      break;
    }
  }
}

interface SyncResult {
  synced: number;
  failed: number;
}

/**
 * Process the entire sync queue in FIFO order.
 * Successful items are removed. Failed items get retried
 * up to MAX_RETRIES before moving to the failed queue.
 */
export async function processSyncQueue(): Promise<SyncResult> {
  const queue = await getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  const remainingItems: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      await syncItem(item);
      synced++;
    } catch (error) {
      item.retryCount += 1;

      if (item.retryCount >= MAX_RETRIES) {
        await moveToFailedQueue(item);
        Sentry.captureException(
          error instanceof Error ? error : new Error('Sync item failed after max retries'),
          {
            level: 'warning',
            tags: { component: 'sync-queue', action: 'sync-failed', itemType: item.type },
          }
        );
      } else {
        remainingItems.push(item);
      }
    }
  }

  // Update the queue: keep only items still retrying
  if (remainingItems.length > 0) {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingItems));
  } else {
    await AsyncStorage.removeItem(QUEUE_KEY);
  }

  return { synced, failed: queue.length - synced };
}
