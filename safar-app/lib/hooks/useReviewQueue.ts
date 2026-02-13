import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { timeouts } from '@/constants/timeouts';

export interface ReviewQueueItem {
  id: string;
  user_id: string;
  word_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  status: string;
  word: {
    id: string;
    arabic: string;
    transliteration: string;
    meaning: string;
    audio_url: string | null;
  };
}

/**
 * Hook to fetch words due for review using spaced repetition schedule.
 * Queries user_word_progress WHERE next_review <= now, ordered oldest first.
 * Returns review items with joined word data for display.
 */
export function useReviewQueue() {
  const userId = useAuthStore((s) => s.user?.id);

  const query = useQuery<ReviewQueueItem[]>({
    queryKey: ['reviewQueue', userId],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('user_word_progress')
        .select(
          `
          *,
          word:words (
            id, arabic, transliteration, meaning, audio_url
          )
        `
        )
        .eq('user_id', userId!)
        .lte('next_review', now)
        .order('next_review', { ascending: true });

      if (error) throw error;
      return (data ?? []) as ReviewQueueItem[];
    },
    staleTime: timeouts.query.reviewQueue,
    enabled: !!userId,
  });

  // Query the next upcoming review time (when no items are currently due)
  const nextReviewQuery = useQuery<string | null>({
    queryKey: ['nextReviewTime', userId],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('user_word_progress')
        .select('next_review')
        .eq('user_id', userId!)
        .gt('next_review', now)
        .order('next_review', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data?.next_review ?? null;
    },
    staleTime: timeouts.query.lessonState,
    enabled: !!userId && (query.data?.length ?? 0) === 0,
  });

  return {
    ...query,
    dueCount: query.data?.length ?? 0,
    nextReviewTime: nextReviewQuery.data ?? null,
  };
}
