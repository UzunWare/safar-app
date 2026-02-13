import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import type { Lesson, Word, FrequencyWordExample } from '@/types/supabase.types';
import { timeouts } from '@/constants/timeouts';

export type FrequencyWord = Word & {
  frequency_word_examples: FrequencyWordExample[];
};

export type FrequencyLessonData = Lesson & {
  words: FrequencyWord[];
};

/**
 * Fetches a frequency lesson with its word and nested examples.
 * Each frequency lesson has one word with frequency count, description,
 * and multiple example phrases showing the word in Quranic context.
 * Uses Infinity staleTime since frequency content is static.
 */
export function useFrequencyLesson(lessonId: string) {
  return useQuery<FrequencyLessonData>({
    queryKey: ['frequency-lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select(
          `
          *,
          words (
            *,
            frequency_word_examples (*)
          )
        `
        )
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      const result = data as unknown as FrequencyLessonData;
      // Sort examples by order
      if (result.words?.[0]?.frequency_word_examples) {
        result.words[0].frequency_word_examples.sort((a, b) => a.order - b.order);
      }
      return result;
    },
    staleTime: timeouts.query.staticContent,
    enabled: !!lessonId,
  });
}
