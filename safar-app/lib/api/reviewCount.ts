/**
 * Review Count API
 * Story 5.6: Push Notifications - Review Reminders
 *
 * Standalone function to get the count of due reviews from Supabase.
 * Used by notification scheduler (non-hook context).
 */

import { supabase } from '@/lib/api/supabase';
import * as Sentry from '@/lib/utils/sentry';

/**
 * Get the count of words due for review for the given user.
 * Queries user_word_progress WHERE next_review <= now.
 * Returns 0 on any error (fail-safe for notification context).
 */
export async function getDueReviewCount(userId: string): Promise<number> {
  if (!userId) return 0;

  try {
    const now = new Date().toISOString();

    const { count, error } = await supabase
      .from('user_word_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lte('next_review', now);

    if (error) {
      Sentry.captureException(error, {
        level: 'warning',
        tags: { component: 'review-count', action: 'get-due-count' },
      });
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'review-count', action: 'get-due-count' },
    });
    return 0;
  }
}
