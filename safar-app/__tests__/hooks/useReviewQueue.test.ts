import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReviewQueue } from '@/lib/hooks/useReviewQueue';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockReviewItems = [
  {
    id: 'uwp-1',
    user_id: 'user-1',
    word_id: 'w1',
    ease_factor: 2.5,
    interval: 1,
    repetitions: 1,
    next_review: '2026-02-09T00:00:00Z',
    status: 'learning',
    word: {
      id: 'w1',
      arabic: '\u0628\u0650\u0633\u0652\u0645\u0650',
      transliteration: 'bismi',
      meaning: 'In the name of',
      audio_url: null,
    },
  },
  {
    id: 'uwp-2',
    user_id: 'user-1',
    word_id: 'w2',
    ease_factor: 2.36,
    interval: 6,
    repetitions: 2,
    next_review: '2026-02-08T00:00:00Z',
    status: 'learning',
    word: {
      id: 'w2',
      arabic: '\u0627\u0644\u0644\u0651\u064e\u0647\u0650',
      transliteration: 'allahi',
      meaning: 'God',
      audio_url: null,
    },
  },
];

function setupReviewQueueMock(data: any = mockReviewItems, error: any = null) {
  const mockOrder = jest.fn().mockResolvedValue({ data, error });
  const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
  const mockEq = jest.fn().mockReturnValue({ lte: mockLte });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
  (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
  return { mockSelect, mockEq, mockLte, mockOrder };
}

describe('useReviewQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: { id: 'user-1' } as any });
  });

  it('fetches due reviews from user_word_progress', async () => {
    const { mockEq, mockLte } = setupReviewQueueMock();

    const { result } = renderHook(() => useReviewQueue(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(supabase.from).toHaveBeenCalledWith('user_word_progress');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mockLte).toHaveBeenCalledWith('next_review', expect.any(String));
  });

  it('returns review items with word data', async () => {
    setupReviewQueueMock();

    const { result } = renderHook(() => useReviewQueue(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].word.arabic).toBe('\u0628\u0650\u0633\u0652\u0645\u0650');
    expect(result.current.data![1].word.meaning).toBe('God');
  });

  it('returns dueCount convenience property', async () => {
    setupReviewQueueMock();

    const { result } = renderHook(() => useReviewQueue(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.dueCount).toBe(2);
  });

  it('returns dueCount of 0 when no reviews due', async () => {
    setupReviewQueueMock([]);

    const { result } = renderHook(() => useReviewQueue(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.dueCount).toBe(0);
  });

  it('does not fetch when user is not authenticated', async () => {
    useAuthStore.setState({ user: null });
    setupReviewQueueMock();

    const { result } = renderHook(() => useReviewQueue(), {
      wrapper: createWrapper(),
    });

    // Query should not be enabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('throws on Supabase error', async () => {
    setupReviewQueueMock(null, { message: 'Network error' });

    const { result } = renderHook(() => useReviewQueue(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('returns nextReviewTime when no items are due', async () => {
    // Queue returns empty (no due items)
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
    const mockEqQueue = jest.fn().mockReturnValue({ lte: mockLte });

    // Next review time query: select → eq → gt → order → limit → maybeSingle
    const futureDate = '2026-02-12T10:00:00Z';
    const mockMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: { next_review: futureDate }, error: null });
    const mockLimit = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockOrderNext = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockGt = jest.fn().mockReturnValue({ order: mockOrderNext });
    const mockEqNext = jest.fn().mockReturnValue({ gt: mockGt });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockImplementation((selectStr: string) => {
        if (selectStr && selectStr.includes('word:words')) {
          return { eq: mockEqQueue };
        }
        // nextReviewTime query
        return { eq: mockEqNext };
      }),
    });

    const { result } = renderHook(() => useReviewQueue(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.dueCount).toBe(0);
      expect(result.current.nextReviewTime).toBe(futureDate);
    });
  });

  it('returns null nextReviewTime when no progress records exist', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
    const mockEqQueue = jest.fn().mockReturnValue({ lte: mockLte });

    const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const mockLimit = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockOrderNext = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockGt = jest.fn().mockReturnValue({ order: mockOrderNext });
    const mockEqNext = jest.fn().mockReturnValue({ gt: mockGt });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockImplementation((selectStr: string) => {
        if (selectStr && selectStr.includes('word:words')) {
          return { eq: mockEqQueue };
        }
        return { eq: mockEqNext };
      }),
    });

    const { result } = renderHook(() => useReviewQueue(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.dueCount).toBe(0);
      expect(result.current.nextReviewTime).toBeNull();
    });
  });
});
