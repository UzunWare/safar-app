import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import type { Lesson } from '@/types/supabase.types';
import { timeouts } from '@/constants/timeouts';

export function useLessons(unitId: string) {
  return useQuery<Lesson[]>({
    queryKey: ['lessons', unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('unit_id', unitId)
        .order('order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as Lesson[];
    },
    staleTime: timeouts.query.staticContent,
    enabled: !!unitId,
  });
}
