import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLesson } from '@/lib/hooks/useLesson';
import { supabase } from '@/lib/api/supabase';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockWordsData = [
  {
    id: 'w1',
    lesson_id: 'l1',
    arabic: 'بِسْمِ',
    transliteration: 'bismi',
    meaning: 'In the name of',
    order: 1,
    audio_url: 'https://example.com/bismi.mp3',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'w2',
    lesson_id: 'l1',
    arabic: 'اللَّهِ',
    transliteration: 'allahi',
    meaning: 'God',
    order: 2,
    audio_url: 'https://example.com/allahi.mp3',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'w3',
    lesson_id: 'l1',
    arabic: 'الرَّحْمَنِ',
    transliteration: 'ar-rahmani',
    meaning: 'The Most Gracious',
    order: 3,
    audio_url: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

const mockLessonData = {
  id: 'l1',
  unit_id: 'u1',
  name: 'Bismillah',
  order: 1,
  word_count: 3,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  words: mockWordsData,
};

describe('useLesson', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches lesson with words for a given lesson ID', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockLessonData, error: null });
    const mockOrder = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLesson('l1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockLessonData);
    expect(supabase.from).toHaveBeenCalledWith('lessons');
    expect(mockSelect).toHaveBeenCalledWith('*, words(*)');
    expect(mockEq).toHaveBeenCalledWith('id', 'l1');
  });

  it('returns loading state initially', () => {
    const mockSingle = jest.fn().mockReturnValue(new Promise(() => {}));
    const mockOrder = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLesson('l1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('handles error state', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });
    const mockOrder = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLesson('l1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('does not fetch when lessonId is empty', () => {
    const { result } = renderHook(() => useLesson(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('orders words by order field ascending', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockLessonData, error: null });
    const mockOrder = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLesson('l1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockOrder).toHaveBeenCalledWith('order', { referencedTable: 'words', ascending: true });
  });

  it('uses Infinity staleTime for static content caching', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockLessonData, error: null });
    const mockOrder = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLesson('l1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isStale).toBe(false);
  });
});
