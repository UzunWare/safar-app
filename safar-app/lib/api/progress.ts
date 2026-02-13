/**
 * Progress API
 * Functions for saving and retrieving user progress
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@/lib/utils/sentry';

import type { UserLessonProgress } from '@/types/supabase.types';

export type ScriptReadingAbility = 'fluent' | 'learning';

interface SaveResult {
  success: boolean;
  error?: string;
}

/**
 * Save user's script reading ability preference
 * Falls back to local storage if network is unavailable
 */
export async function saveScriptAbility(
  userId: string,
  ability: ScriptReadingAbility
): Promise<SaveResult> {
  try {
    // Attempt to save to Supabase
    const { error } = await supabase
      .from('user_profiles')
      .update({ script_reading_ability: ability })
      .eq('id', userId);

    if (error) {
      // Check if it's a missing column error (migration not applied)
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        if (__DEV__) {
          console.error(
            'Database schema error: user_profiles.script_reading_ability column missing'
          );
        }
        Sentry.captureException(
          new Error('Database migration not applied: user_profiles missing script_reading_ability'),
          {
            level: 'error',
            tags: { component: 'progress-api', issue: 'missing-column' },
          }
        );
        return {
          success: false,
          error: 'Database configuration error. Please contact support.',
        };
      }

      // Check if it's a network error
      if (error.message.includes('fetch') || error.message.includes('network')) {
        // Save locally for later sync (using AsyncStorage, not SecureStore)
        await AsyncStorage.setItem(`script_ability_${userId}`, ability);
        if (__DEV__) {
          console.log('Script ability saved offline, will sync later');
        }
        return { success: true };
      }

      if (__DEV__) {
        console.error('Error saving script ability:', error);
      }
      Sentry.captureException(error, {
        level: 'warning',
        tags: { component: 'progress-api', action: 'save-script-ability' },
      });
      return { success: false, error: error.message };
    }

    // Clear offline cache on successful save
    await AsyncStorage.removeItem(`script_ability_${userId}`);
    return { success: true };
  } catch (error) {
    // Network or unexpected error - save locally
    try {
      await AsyncStorage.setItem(`script_ability_${userId}`, ability);
      if (__DEV__) {
        console.log('Script ability saved offline due to error, will sync later');
      }

      // Report to Sentry but don't block user
      Sentry.captureException(error, {
        level: 'warning',
        tags: { component: 'progress-api', fallback: 'async-storage' },
      });

      return { success: true };
    } catch (storageError) {
      if (__DEV__) {
        console.error('Failed to save script ability locally:', storageError);
      }
      Sentry.captureException(storageError, {
        level: 'error',
        tags: { component: 'progress-api', issue: 'storage-failed' },
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save preference',
      };
    }
  }
}

/**
 * Get user's script reading ability preference
 * Checks local storage first if Supabase fails
 */
export async function getScriptAbility(userId: string): Promise<ScriptReadingAbility | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('script_reading_ability')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // Try local storage fallback (AsyncStorage, not SecureStore)
      const local = await AsyncStorage.getItem(`script_ability_${userId}`);
      return (local as ScriptReadingAbility) || null;
    }

    return (data as any).script_reading_ability as ScriptReadingAbility;
  } catch {
    // Try local storage fallback
    try {
      const local = await AsyncStorage.getItem(`script_ability_${userId}`);
      return (local as ScriptReadingAbility) || null;
    } catch {
      return null;
    }
  }
}

/**
 * Mark onboarding as completed for user
 */
export async function completeOnboarding(userId: string): Promise<SaveResult> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      // Check if it's a schema/permission error (hard fail, don't cache bad state)
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        if (__DEV__) {
          console.error('Database schema error: onboarding columns missing');
        }
        Sentry.captureException(new Error('Database migration not applied: onboarding columns'), {
          level: 'error',
          tags: { component: 'progress-api', issue: 'missing-column' },
        });
        return { success: false, error: 'Database configuration error. Please contact support.' };
      }

      if (__DEV__) {
        console.error('Error completing onboarding:', error);
      }
      Sentry.captureException(error, {
        level: 'warning',
        tags: { component: 'progress-api', action: 'complete-onboarding' },
      });

      // Network or transient error - save locally for later sync
      await AsyncStorage.setItem(`onboarding_completed_${userId}`, 'true');
      return { success: true };
    }

    // Clear offline cache on successful save
    await AsyncStorage.removeItem(`onboarding_completed_${userId}`);
    return { success: true };
  } catch (error) {
    if (__DEV__) {
      console.error('Error completing onboarding:', error);
    }
    Sentry.captureException(error, {
      level: 'error',
      tags: { component: 'progress-api', issue: 'onboarding-failed' },
    });

    // Save locally as fallback
    try {
      await AsyncStorage.setItem(`onboarding_completed_${userId}`, 'true');
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to save onboarding completion' };
    }
  }
}

/**
 * Reset onboarding status (for dev/testing purposes)
 */
export async function resetOnboarding(userId: string): Promise<SaveResult> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        onboarding_completed: false,
        onboarding_completed_at: null,
      })
      .eq('id', userId);

    if (error) {
      if (__DEV__) {
        console.error('Error resetting onboarding:', error);
      }
      Sentry.captureException(error, {
        level: 'warning',
        tags: { component: 'progress-api', action: 'reset-onboarding' },
      });
      return { success: false, error: error.message };
    }

    // Clear offline cache
    await AsyncStorage.removeItem(`onboarding_completed_${userId}`);
    return { success: true };
  } catch (error) {
    if (__DEV__) {
      console.error('Error resetting onboarding:', error);
    }
    Sentry.captureException(error, {
      level: 'error',
      tags: { component: 'progress-api', issue: 'reset-onboarding-failed' },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset onboarding',
    };
  }
}

/**
 * Mark a lesson as complete for a user
 * Uses upsert for idempotency (safe to call multiple times)
 * Falls back to local storage if network is unavailable
 */
export async function markLessonComplete(userId: string, lessonId: string): Promise<SaveResult> {
  const completedAt = new Date().toISOString();

  try {
    const { error } = await supabase.from('user_lesson_progress').upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed_at: completedAt,
        is_synced: true,
      },
      { onConflict: 'user_id,lesson_id' }
    );

    if (error) {
      // Queue for later sync on any error
      await saveCompletionLocally(userId, lessonId, completedAt);
      return { success: true };
    }

    return { success: true };
  } catch (error) {
    // Network or unexpected error — save locally
    try {
      await saveCompletionLocally(userId, lessonId, completedAt);
      return { success: true };
    } catch (storageError) {
      Sentry.captureException(storageError, {
        level: 'error',
        tags: { component: 'progress-api', issue: 'lesson-complete-failed' },
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save lesson completion',
      };
    }
  }
}

/**
 * Save lesson completion locally for offline sync
 */
async function saveCompletionLocally(
  userId: string,
  lessonId: string,
  completedAt: string
): Promise<void> {
  const key = `sync_queue_${userId}`;
  const existing = await AsyncStorage.getItem(key);
  let queue: {
    type: string;
    payload: { lesson_id: string; completed_at: string };
    createdAt: string;
  }[] = [];
  try {
    queue = existing ? JSON.parse(existing) : [];
  } catch {
    queue = [];
  }
  queue.push({
    type: 'lesson_complete',
    payload: { lesson_id: lessonId, completed_at: completedAt },
    createdAt: new Date().toISOString(),
  });
  await AsyncStorage.setItem(key, JSON.stringify(queue));
}

/**
 * Fetch all lesson progress records for a user
 */
export async function fetchLessonProgress(userId: string): Promise<UserLessonProgress[]> {
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data as UserLessonProgress[];
  } catch {
    return [];
  }
}

interface SyncResult {
  synced: number;
  failed: number;
}

/**
 * Sync offline lesson completions to the server
 * Processes each queued item, retaining failed items for later retry
 */
export async function syncOfflineProgress(userId: string): Promise<SyncResult> {
  const key = `sync_queue_${userId}`;
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return { synced: 0, failed: 0 };

  let queue: {
    type: string;
    payload: { lesson_id: string; completed_at: string };
    createdAt: string;
  }[];
  try {
    queue = JSON.parse(raw);
  } catch {
    await AsyncStorage.removeItem(key);
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  const failedItems: typeof queue = [];

  for (const item of queue) {
    if (item.type !== 'lesson_complete') {
      failedItems.push(item);
      continue;
    }

    const { error } = await supabase.from('user_lesson_progress').upsert(
      {
        user_id: userId,
        lesson_id: item.payload.lesson_id,
        completed_at: item.payload.completed_at,
        is_synced: true,
      },
      { onConflict: 'user_id,lesson_id' }
    );

    if (error) {
      failedItems.push(item);
    } else {
      synced++;
    }
  }

  if (failedItems.length > 0) {
    await AsyncStorage.setItem(key, JSON.stringify(failedItems));
  } else {
    await AsyncStorage.removeItem(key);
  }

  return { synced, failed: failedItems.length };
}
