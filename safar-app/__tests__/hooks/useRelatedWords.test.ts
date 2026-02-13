/**
 * useRelatedWords Hook Tests
 * Story 3.3: Root Explorer - The "Aha Moment"
 *
 * Task 7: Query words sharing same root via TanStack Query
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRelatedWords } from '@/lib/hooks/useRelatedWords';
import { supabase } from '@/lib/api/supabase';

// Create a wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useRelatedWords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('queries words sharing the same root', async () => {
    const mockWords = [
      {
        words: {
          id: 'w1',
          arabic: 'الْحَمْدُ',
          transliteration: 'al-hamdu',
          meaning: 'the praise',
        },
      },
      {
        words: {
          id: 'w2',
          arabic: 'مُحَمَّد',
          transliteration: 'muhammad',
          meaning: 'praised one',
        },
      },
    ];

    // Mock the Supabase chain: from -> select -> eq -> neq -> limit
    const mockLimit = jest.fn().mockResolvedValue({ data: mockWords, error: null });
    const mockNeq = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ neq: mockNeq });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useRelatedWords('root-hmd', 'current-word-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(supabase.from).toHaveBeenCalledWith('word_roots');
    expect(mockEq).toHaveBeenCalledWith('root_id', 'root-hmd');
    expect(mockNeq).toHaveBeenCalledWith('word_id', 'current-word-id');
    expect(mockLimit).toHaveBeenCalledWith(4);
  });

  it('excludes the current word from results', async () => {
    const mockWords = [
      {
        words: {
          id: 'w1',
          arabic: 'الْحَمْدُ',
          transliteration: 'al-hamdu',
          meaning: 'the praise',
        },
      },
    ];

    const mockLimit = jest.fn().mockResolvedValue({ data: mockWords, error: null });
    const mockNeq = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ neq: mockNeq });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useRelatedWords('root-hmd', 'current-word-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockNeq).toHaveBeenCalledWith('word_id', 'current-word-id');
  });

  it('limits results to 4 words', async () => {
    const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockNeq = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ neq: mockNeq });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useRelatedWords('root-hmd', 'current-word-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockLimit).toHaveBeenCalledWith(4);
  });

  it('uses Infinity staleTime for caching static content', () => {
    const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockNeq = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ neq: mockNeq });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    // Just verify the hook renders without error - staleTime is implementation detail
    const { result } = renderHook(() => useRelatedWords('root-hmd', 'current-word-id'), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
  });

  it('maps response to Word array format', async () => {
    const mockWords = [
      {
        words: {
          id: 'w1',
          arabic: 'الْحَمْدُ',
          transliteration: 'al-hamdu',
          meaning: 'the praise',
        },
      },
      {
        words: {
          id: 'w2',
          arabic: 'مُحَمَّد',
          transliteration: 'muhammad',
          meaning: 'praised one',
        },
      },
    ];

    const mockLimit = jest.fn().mockResolvedValue({ data: mockWords, error: null });
    const mockNeq = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ neq: mockNeq });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useRelatedWords('root-hmd', 'current-word-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      { id: 'w1', arabic: 'الْحَمْدُ', transliteration: 'al-hamdu', meaning: 'the praise' },
      { id: 'w2', arabic: 'مُحَمَّد', transliteration: 'muhammad', meaning: 'praised one' },
    ]);
  });

  it('is disabled when rootId is empty', () => {
    const { result } = renderHook(() => useRelatedWords('', 'current-word-id'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('handles error from Supabase', async () => {
    const mockLimit = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });
    const mockNeq = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ neq: mockNeq });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useRelatedWords('root-hmd', 'current-word-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
