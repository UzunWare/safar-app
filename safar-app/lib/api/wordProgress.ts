/**
 * Word Progress API
 * Initialize and manage word-level progress for spaced repetition
 *
 * NOTE: Architecture specifies Zustand + AsyncStorage for offline-first SM-2 storage.
 * Current implementation writes directly to Supabase (online-only).
 * Offline fallback via AsyncStorage sync queue is planned in Story 7-6.
 */

import { supabase } from './supabase';
import * as Sentry from '@/lib/utils/sentry';
import { deriveWordStatus } from '@/lib/utils/sm2';

interface WordProgressInit {
  user_id: string;
  word_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
}

interface WordProgressUpdate {
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  // 'mastered' transition logic is deferred to Story 4-6 (word-learning-states)
  status: 'new' | 'learning' | 'review' | 'mastered';
}

/**
 * Initialize word progress after quiz completion.
 * Words answered correctly get a 1-day interval; incorrect words are due immediately.
 * Uses upsert to avoid duplicates if the user retakes the quiz.
 */
export async function initializeWordProgress(
  userId: string,
  wordId: string,
  wasCorrect: boolean
): Promise<{ success: boolean; error?: string }> {
  const now = new Date();

  const nextReview = wasCorrect
    ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // 1 day
    : now.toISOString(); // Due immediately

  const progress: WordProgressInit = {
    user_id: userId,
    word_id: wordId,
    ease_factor: 2.5,
    interval: wasCorrect ? 1 : 0,
    repetitions: wasCorrect ? 1 : 0,
    next_review: nextReview,
    status: 'learning',
  };

  try {
    const { error } = await supabase
      .from('user_word_progress')
      .upsert(progress, { onConflict: 'user_id,word_id' });

    if (error) {
      Sentry.captureException(error, {
        level: 'warning',
        tags: { component: 'word-progress', action: 'initialize' },
      });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'word-progress', action: 'initialize' },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize word progress',
    };
  }
}

/**
 * Update word progress after a difficulty rating.
 * Saves the new SM-2 values and updates the next review date.
 */
export async function updateWordProgress(
  userId: string,
  wordId: string,
  sm2Result: { easeFactor: number; interval: number; repetitions: number; nextReview: string }
): Promise<{ success: boolean; error?: string }> {
  const status: WordProgressUpdate['status'] = deriveWordStatus(
    sm2Result.repetitions,
    sm2Result.interval
  );

  const update: WordProgressUpdate = {
    ease_factor: sm2Result.easeFactor,
    interval: sm2Result.interval,
    repetitions: sm2Result.repetitions,
    next_review: sm2Result.nextReview,
    status,
  };

  try {
    const { data, error } = await supabase
      .from('user_word_progress')
      .update(update)
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .select('id')
      .single();

    if (error) {
      Sentry.captureException(error, {
        level: 'warning',
        tags: { component: 'word-progress', action: 'update-rating' },
      });
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Word progress record not found' };
    }

    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'word-progress', action: 'update-rating' },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update word progress',
    };
  }
}
