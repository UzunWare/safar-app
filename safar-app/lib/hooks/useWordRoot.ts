import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import type { Root } from '@/types';
import { timeouts } from '@/constants/timeouts';

/**
 * Fetches the root for a given word via the word_roots junction table.
 * Returns null if the word has no root association.
 * Uses Infinity staleTime since root/word relationships are static content.
 */
export function useWordRoot(wordId: string | undefined) {
  return useQuery<Root | null>({
    queryKey: ['wordRoot', wordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('word_roots')
        .select('root_id, roots(*)')
        .eq('word_id', wordId!)
        .maybeSingle();

      if (error) throw error;
      return (data as any)?.roots ?? null;
    },
    staleTime: timeouts.query.staticContent,
    enabled: !!wordId,
  });
}
