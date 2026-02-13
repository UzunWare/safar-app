import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import type { PathwayWithUnits } from '@/types/supabase.types';
import { timeouts } from '@/constants/timeouts';

export const SALAH_FIRST_PATHWAY_ID = 'salah-first';
export const HIGH_FREQUENCY_PATHWAY_ID = 'high-frequency';

export function usePathway(pathwayId: string = SALAH_FIRST_PATHWAY_ID) {
  return useQuery<PathwayWithUnits>({
    queryKey: ['pathway', pathwayId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pathways')
        .select(
          `
          *,
          units (
            id,
            pathway_id,
            name,
            order,
            word_count,
            description,
            created_at,
            updated_at
          )
        `
        )
        .eq('id', pathwayId)
        .single();

      if (error) throw error;
      const result = data as unknown as PathwayWithUnits;
      // Sort units by order column (Supabase embedded selects don't guarantee order)
      if (result.units) {
        result.units.sort((a, b) => a.order - b.order);
      }
      return result;
    },
    staleTime: timeouts.query.staticContent,
  });
}
