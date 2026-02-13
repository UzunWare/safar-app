import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { calculateNextReview, getDefaultProgress, type DifficultyRating } from '@/lib/utils/sm2';
import { saveWordProgressLocally, getLocalWordProgress } from '@/lib/api/wordProgressLocal';
import { updateWordProgress } from '@/lib/api/wordProgress';
import { timeouts } from '@/constants/timeouts';

interface WordProgressRow {
  id: string;
  user_id: string;
  word_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch and manage word progress with local-first support.
 * Fetches from Supabase, falls back to AsyncStorage for offline access.
 * Provides rateWord mutation for optimistic difficulty rating updates.
 */
export function useWordProgress(wordId: string) {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const query = useQuery<
    | WordProgressRow
    | { easeFactor: number; interval: number; repetitions: number; nextReview: string }
    | null
  >({
    queryKey: ['wordProgress', userId, wordId],
    queryFn: async () => {
      // Try Supabase first
      const { data, error } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', userId!)
        .eq('word_id', wordId)
        .maybeSingle();

      if (error) throw error;

      // Fall back to local storage when no remote data
      if (!data) {
        const local = await getLocalWordProgress(userId!, wordId);
        return local;
      }

      return data as WordProgressRow;
    },
    staleTime: timeouts.query.wordProgress,
    enabled: !!userId && !!wordId,
  });

  const rateMutation = useMutation({
    mutationFn: async (rating: DifficultyRating) => {
      const current = query.data;
      const input = current
        ? {
            easeFactor: 'ease_factor' in current ? current.ease_factor : current.easeFactor,
            interval: current.interval,
            repetitions: current.repetitions,
          }
        : getDefaultProgress();

      const result = calculateNextReview(rating, input);

      // Save locally first (offline support)
      await saveWordProgressLocally(userId!, wordId, result);

      // Best-effort Supabase sync (fire-and-forget, don't block UI)
      updateWordProgress(userId!, wordId, result).catch((error) => {
        if (__DEV__) {
          console.warn('[useWordProgress] Background sync failed:', error);
        }
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wordProgress', userId, wordId] });
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      queryClient.invalidateQueries({ queryKey: ['nextReviewTime'] });
    },
  });

  return {
    ...query,
    rateWord: rateMutation.mutateAsync,
    isRating: rateMutation.isPending,
  };
}
