import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useWordProgress } from '@/lib/hooks/useWordProgress';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { saveWordProgressLocally, getLocalWordProgress } from '@/lib/api/wordProgressLocal';
import { updateWordProgress } from '@/lib/api/wordProgress';

jest.mock('@/lib/stores/useAuthStore');
jest.mock('@/lib/api/wordProgressLocal');
jest.mock('@/lib/api/wordProgress');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockProgressData = {
  id: 'progress-1',
  user_id: 'user-1',
  word_id: 'word-1',
  ease_factor: 2.5,
  interval: 6,
  repetitions: 2,
  next_review: '2026-02-16T00:00:00.000Z',
  status: 'learning',
  created_at: '2026-02-10T00:00:00.000Z',
  updated_at: '2026-02-10T00:00:00.000Z',
};

describe('useWordProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: any) => any) =>
      selector({ user: { id: 'user-1' } })
    );
    (getLocalWordProgress as jest.Mock).mockResolvedValue(null);
    (saveWordProgressLocally as jest.Mock).mockResolvedValue(undefined);
    (updateWordProgress as jest.Mock).mockResolvedValue({ success: true });
  });

  function setupSelectMock(data: any = mockProgressData, error: any = null) {
    const mockMaybeSingle = jest.fn().mockResolvedValue({ data, error });
    const mockEq2 = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
    return { mockSelect, mockEq1, mockEq2, mockMaybeSingle };
  }

  it('fetches word progress from Supabase', async () => {
    const { mockSelect, mockEq1, mockEq2 } = setupSelectMock();

    const { result } = renderHook(() => useWordProgress('word-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(supabase.from).toHaveBeenCalledWith('user_word_progress');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq1).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mockEq2).toHaveBeenCalledWith('word_id', 'word-1');
  });

  it('returns progress data on success', async () => {
    setupSelectMock();

    const { result } = renderHook(() => useWordProgress('word-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProgressData);
  });

  it('does not fetch when user is not authenticated', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: any) => any) =>
      selector({ user: null })
    );

    const { result } = renderHook(() => useWordProgress('word-1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('does not fetch when wordId is empty', () => {
    setupSelectMock();

    const { result } = renderHook(() => useWordProgress(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('handles Supabase error gracefully', async () => {
    setupSelectMock(null, { message: 'Database error' });

    const { result } = renderHook(() => useWordProgress('word-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('falls back to local storage when Supabase returns no data', async () => {
    setupSelectMock(null, null);
    (getLocalWordProgress as jest.Mock).mockResolvedValue({
      easeFactor: 2.5,
      interval: 6,
      repetitions: 2,
      nextReview: '2026-02-16T00:00:00.000Z',
      isSynced: false,
      updatedAt: '2026-02-10T00:00:00.000Z',
    });

    const { result } = renderHook(() => useWordProgress('word-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expect.objectContaining({ easeFactor: 2.5, interval: 6 }));
  });

  it('provides rateWord mutation function', async () => {
    setupSelectMock();

    const { result } = renderHook(() => useWordProgress('word-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(typeof result.current.rateWord).toBe('function');
  });

  describe('rateWord mutation', () => {
    it('saves progress locally after rating', async () => {
      setupSelectMock();

      const { result } = renderHook(() => useWordProgress('word-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      await act(async () => {
        await result.current.rateWord(2); // Good rating
      });

      expect(saveWordProgressLocally).toHaveBeenCalledWith(
        'user-1',
        'word-1',
        expect.objectContaining({
          easeFactor: expect.any(Number),
          interval: expect.any(Number),
          repetitions: expect.any(Number),
          nextReview: expect.any(String),
        })
      );
    });

    it('attempts Supabase sync after local save', async () => {
      setupSelectMock();

      const { result } = renderHook(() => useWordProgress('word-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      await act(async () => {
        await result.current.rateWord(2);
      });

      expect(updateWordProgress).toHaveBeenCalledWith(
        'user-1',
        'word-1',
        expect.objectContaining({
          easeFactor: expect.any(Number),
          interval: expect.any(Number),
        })
      );
    });

    it('uses default progress when no current data exists', async () => {
      setupSelectMock(null, null);
      (getLocalWordProgress as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useWordProgress('word-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      await act(async () => {
        await result.current.rateWord(0); // Again rating with defaults
      });

      expect(saveWordProgressLocally).toHaveBeenCalledWith(
        'user-1',
        'word-1',
        expect.objectContaining({
          interval: 1,
          repetitions: 0,
        })
      );
    });
  });
});
