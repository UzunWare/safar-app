/**
 * useLearningStateSummary Hook
 *
 * Provides a breakdown of words across all learning states.
 * Returns counts for: new, learning, review, and mastered.
 *
 * Story 4.6: Word Learning States - Task 8 (AC#1, AC#2)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { getWordState } from '@/lib/utils/learningState';
import { timeouts } from '@/constants/timeouts';

export interface LearningStateSummary {
  new: number;
  learning: number;
  review: number;
  mastered: number;
}

/**
 * AC#1 & AC#2: Get breakdown of words by learning state.
 * Queries all word progress and categorizes into states.
 */
export function useLearningStateSummary() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  return useQuery({
    queryKey: ['learningStateSummary', userId],
    queryFn: async (): Promise<LearningStateSummary> => {
      const { data, error } = await supabase
        .from('user_word_progress')
        .select('repetitions, interval')
        .eq('user_id', userId!);

      if (error) throw error;

      // Count words by state
      const summary: LearningStateSummary = {
        new: 0,
        learning: 0,
        review: 0,
        mastered: 0,
      };

      if (!data) return summary;

      for (const progress of data) {
        const state = getWordState(progress);
        summary[state]++;
      }

      return summary;
    },
    staleTime: timeouts.query.lessonState,
    enabled: !!userId,
  });
}
