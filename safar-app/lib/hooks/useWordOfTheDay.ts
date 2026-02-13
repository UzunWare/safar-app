/**
 * useWordOfTheDay Hook
 *
 * Fetches a daily-rotating word from the pathway's word catalog.
 * Uses a date-based deterministic index so the same word shows all day.
 * Only selects words that have audio pronunciation available.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import type { Word } from '@/types';

type WordOfTheDay = Pick<Word, 'id' | 'arabic' | 'transliteration' | 'meaning' | 'audio_url'>;

/** Compute a stable day-index from the current date (days since Unix epoch) */
function getDayIndex(): number {
  const now = new Date();
  return Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
}

export function useWordOfTheDay() {
  return useQuery<WordOfTheDay | null>({
    queryKey: ['word-of-the-day', getDayIndex()],
    queryFn: async () => {
      // Fetch all words that have audio (Quranic words from Units 1-3)
      const { data, error } = await supabase
        .from('words')
        .select('id, arabic, transliteration, meaning, audio_url')
        .not('audio_url', 'is', null)
        .order('id', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Deterministic daily rotation using modulo
      const index = getDayIndex() % data.length;
      return data[index] as WordOfTheDay;
    },
    staleTime: Infinity, // Static content — word won't change within the same day key
  });
}
