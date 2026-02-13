import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLearningStateSummary } from '@/lib/hooks/useLearningStateSummary';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';

jest.mock('@/lib/stores/useAuthStore');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useLearningStateSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: any) => any) =>
      selector({ user: { id: 'user-1' } })
    );
  });

  function setupProgressMock(progressData: any[] = [], error: any = null) {
    const mockEq = jest.fn().mockResolvedValue({ data: progressData, error });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

    (supabase.from as jest.Mock) = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    return { mockSelect, mockEq };
  }

  describe('AC#1 & AC#2: State breakdown summary', () => {
    it('returns summary with all state counts', async () => {
      setupProgressMock([
        { repetitions: 0, interval: 1 }, // new
        { repetitions: 1, interval: 1 }, // learning
        { repetitions: 2, interval: 6 }, // learning
        { repetitions: 3, interval: 5 }, // review
        { repetitions: 4, interval: 6 }, // review
        { repetitions: 3, interval: 7 }, // mastered
        { repetitions: 5, interval: 30 }, // mastered
      ]);
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLearningStateSummary(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          new: 1,
          learning: 2,
          review: 2,
          mastered: 2,
        });
      });
    });

    it('returns zero counts when no progress data', async () => {
      setupProgressMock([]);
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLearningStateSummary(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          new: 0,
          learning: 0,
          review: 0,
          mastered: 0,
        });
      });
    });

    it('counts only new state words correctly', async () => {
      setupProgressMock([
        { repetitions: 0, interval: 1 },
        { repetitions: 0, interval: 1 },
        { repetitions: 0, interval: 1 },
      ]);
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLearningStateSummary(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          new: 3,
          learning: 0,
          review: 0,
          mastered: 0,
        });
      });
    });

    it('correctly categorizes edge cases', async () => {
      setupProgressMock([
        { repetitions: 1, interval: 1 }, // learning (rep 1)
        { repetitions: 2, interval: 6 }, // learning (rep 2, interval < 7)
        { repetitions: 3, interval: 6 }, // review (rep 3, interval < 7)
        { repetitions: 1, interval: 7 }, // mastered (interval = 7 has priority)
      ]);
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLearningStateSummary(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          new: 0,
          learning: 2,
          review: 1,
          mastered: 1,
        });
      });
    });
  });

  describe('query behavior', () => {
    it('queries user_word_progress for current user', async () => {
      const mocks = setupProgressMock([]);
      const wrapper = createWrapper();

      renderHook(() => useLearningStateSummary(), { wrapper });

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('user_word_progress');
        expect(mocks.mockEq).toHaveBeenCalledWith('user_id', 'user-1');
      });
    });

    it('selects only repetitions and interval fields', async () => {
      const mocks = setupProgressMock([]);
      const wrapper = createWrapper();

      renderHook(() => useLearningStateSummary(), { wrapper });

      await waitFor(() => {
        expect(mocks.mockSelect).toHaveBeenCalledWith('repetitions, interval');
      });
    });

    it('does not query when no user', async () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: any) => any) =>
        selector({ user: null })
      );
      setupProgressMock([]);
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLearningStateSummary(), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('handles query errors', async () => {
      const mockError = new Error('Database error');
      setupProgressMock([], mockError);
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLearningStateSummary(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
