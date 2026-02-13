/**
 * useMasteredCount Hook
 *
 * Query hook for counting mastered words (North Star metric).
 * Mastered = interval >= 7 days per AC#2.
 *
 * Story 4.6: Word Learning States - Task 6 (AC#2)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { timeouts } from '@/constants/timeouts';

/**
 * AC#2: Count words with interval >= 7 days (mastered state).
 * This is the North Star metric for tracking user progress.
 */
export function useMasteredCount() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  return useQuery({
    queryKey: ['masteredCount', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_word_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId!)
        .gte('interval', 7);

      if (error) throw error;

      return count || 0;
    },
    staleTime: timeouts.query.masteredCount,
    enabled: !!userId,
  });
}
