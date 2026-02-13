/**
 * Sync Queue Integration Helpers
 * Story 7.6: Offline Sync Queue
 *
 * Convenience functions that add items to the sync queue,
 * update the sync store's pending count, and orchestrate
 * sync cycles shared across hooks.
 */

import { addToSyncQueue, processSyncQueue, getQueue } from '@/lib/api/sync';
import { useSyncStore } from '@/lib/stores/useSyncStore';

const SYNC_SUCCESS_DISPLAY_MS = 2000;

/** Tracks the success toast auto-hide timer so it can be cancelled. */
let successTimeoutId: ReturnType<typeof setTimeout> | null = null;

/**
 * Queue a lesson completion for offline sync.
 */
export async function queueLessonComplete(userId: string, lessonId: string): Promise<void> {
  await addToSyncQueue({
    type: 'lesson_complete',
    payload: {
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    },
  });
  useSyncStore.getState().incrementPending();
}

/**
 * Queue a review rating for offline sync.
 */
export async function queueReviewRating(
  userId: string,
  wordId: string,
  rating: number
): Promise<void> {
  await addToSyncQueue({
    type: 'review_rating',
    payload: {
      user_id: userId,
      word_id: wordId,
      rating,
      reviewed_at: new Date().toISOString(),
    },
  });
  useSyncStore.getState().incrementPending();
}

/**
 * Queue a settings update for offline sync.
 */
export async function queueSettingsUpdate(
  userId: string,
  settings: Record<string, unknown>
): Promise<void> {
  await addToSyncQueue({
    type: 'settings_update',
    payload: {
      user_id: userId,
      ...settings,
    },
  });
  useSyncStore.getState().incrementPending();
}

/**
 * Read the queue from AsyncStorage and set pendingCount in the store.
 * Call once at app start so the OfflineIndicator shows the real count
 * even before a sync cycle triggers.
 */
export async function hydratePendingCount(): Promise<void> {
  const queue = await getQueue();
  useSyncStore.getState().setPendingCount(queue.length);
}

/**
 * Shared sync orchestration used by both useNetworkStatus (reconnection)
 * and useSyncOnForeground (app foreground). Processes the queue, updates
 * store state, and shows/hides the success toast with proper cleanup.
 */
export async function executeSyncCycle(): Promise<void> {
  const store = useSyncStore.getState();
  const queue = await getQueue();

  if (queue.length === 0) return;

  store.setSyncing(true);
  store.setPendingCount(queue.length);

  try {
    const result = await processSyncQueue();

    if (result.synced > 0) {
      store.setLastSyncedAt(new Date().toISOString());
      store.setShowSyncSuccess(true);

      // Cancel any previously scheduled hide so overlapping cycles don't clash
      if (successTimeoutId) clearTimeout(successTimeoutId);
      successTimeoutId = setTimeout(() => {
        useSyncStore.getState().setShowSyncSuccess(false);
        successTimeoutId = null;
      }, SYNC_SUCCESS_DISPLAY_MS);
    }

    const remaining = await getQueue();
    useSyncStore.getState().setPendingCount(remaining.length);
  } finally {
    useSyncStore.getState().setSyncing(false);
  }
}
