import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import type { Word } from '@/types/supabase.types';
import { timeouts } from '@/constants/timeouts';

/**
 * Fetches words that share the same Arabic root.
 * Excludes the current word and limits to 4 results.
 * Uses Infinity staleTime since root/word relationships are static content.
 */
export function useRelatedWords(rootId: string, excludeWordId: string) {
  return useQuery<Word[]>({
    queryKey: ['relatedWords', rootId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('word_roots')
        .select(
          `
          words (
            id,
            arabic,
            transliteration,
            meaning
          )
        `
        )
        .eq('root_id', rootId)
        .neq('word_id', excludeWordId)
        .limit(4);

      if (error) throw error;
      return data?.map((wr: any) => wr.words) ?? [];
    },
    staleTime: timeouts.query.staticContent,
    enabled: !!rootId,
  });
}
