import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import type { Root } from '@/types/supabase.types';
import { timeouts } from '@/constants/timeouts';

/**
 * Root with derivative count for browse view
 */
export interface RootWithCount extends Root {
  derivative_count: number;
}

/**
 * Fetches all roots with derivative counts and supports search filtering.
 * Filters client-side for English meaning, Arabic letters, or transliteration.
 * Uses Infinity staleTime since roots are static content.
 *
 * PERFORMANCE: Optimized to avoid N+1 query - fetches all counts in batch.
 */
export function useAllRoots(searchQuery?: string) {
  return useQuery<RootWithCount[]>({
    queryKey: ['roots', 'all'],
    queryFn: async () => {
      // Fetch all roots and all word_roots in parallel (2 queries instead of N+1)
      const [rootsResponse, wordRootsResponse] = await Promise.all([
        supabase.from('roots').select('*').order('letters', { ascending: true }),
        supabase.from('word_roots').select('root_id'),
      ]);

      if (rootsResponse.error) throw rootsResponse.error;
      if (wordRootsResponse.error) throw wordRootsResponse.error;

      const roots = rootsResponse.data ?? [];
      const wordRoots = wordRootsResponse.data ?? [];

      // Count derivatives per root (client-side aggregation)
      const derivativeCounts = wordRoots.reduce<Record<string, number>>((acc, wr) => {
        acc[wr.root_id] = (acc[wr.root_id] || 0) + 1;
        return acc;
      }, {});

      // Merge counts with roots
      const rootsWithCounts = roots.map((root) => ({
        ...root,
        derivative_count: derivativeCounts[root.id] || 0,
      }));

      return rootsWithCounts;
    },
    staleTime: timeouts.query.staticContent,
    select: (data) => {
      if (!searchQuery || !searchQuery.trim()) return data;

      const query = searchQuery.toLowerCase().trim();
      return data.filter(
        (root) =>
          // Search by English meaning
          root.meaning.toLowerCase().includes(query) ||
          // Search by Arabic letters
          root.letters.includes(query) ||
          // Search by transliteration (if exists)
          root.transliteration?.toLowerCase().includes(query)
      );
    },
  });
}
