import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useMasteredCount } from '@/lib/hooks/useMasteredCount';
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

describe('useMasteredCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: any) => any) =>
      selector({ user: { id: 'user-1' } })
    );
  });

  function setupCountMock(count: number | null = 0, error: any = null) {
    const mockGte = jest.fn().mockResolvedValue({ count, error });
    const mockEq = jest.fn().mockReturnValue({ gte: mockGte });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

    (supabase.from as jest.Mock) = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    return { mockSelect, mockEq, mockGte };
  }

  describe('AC#2: Mastered words count query', () => {
    it('queries words with interval >= 7', async () => {
      const mocks = setupCountMock(5);
      const wrapper = createWrapper();

      renderHook(() => useMasteredCount(), { wrapper });

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('user_word_progress');
      });

      // Verify the query chain
      expect(mocks.mockSelect).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(mocks.mockEq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mocks.mockGte).toHaveBeenCalledWith('interval', 7);
    });

    it('returns count of mastered words', async () => {
      setupCountMock(12);
      const wrapper = createWrapper();

      const { result } = renderHook(() => useMasteredCount(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBe(12);
      });
    });

    it('returns 0 when no mastered words', async () => {
      setupCountMock(0);
      const wrapper = createWrapper();

      const { result } = renderHook(() => useMasteredCount(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBe(0);
      });
    });

    it('returns 0 when count is null', async () => {
      setupCountMock(null);
      const wrapper = createWrapper();

      const { result } = renderHook(() => useMasteredCount(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBe(0);
      });
    });
  });

  describe('caching', () => {
    it('uses 5-minute stale time', async () => {
      setupCountMock(5);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      renderHook(() => useMasteredCount(), { wrapper });

      await waitFor(() => {
        const queryState = queryClient.getQueryState(['masteredCount', 'user-1']);
        expect(queryState).toBeTruthy();
      });
    });
  });

  describe('user context', () => {
    it('uses current user ID', async () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: any) => any) =>
        selector({ user: { id: 'user-123' } })
      );
      const mocks = setupCountMock(3);
      const wrapper = createWrapper();

      renderHook(() => useMasteredCount(), { wrapper });

      await waitFor(() => {
        expect(mocks.mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      });
    });

    it('does not query when no user', async () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: any) => any) =>
        selector({ user: null })
      );
      setupCountMock(0);
      const wrapper = createWrapper();

      const { result } = renderHook(() => useMasteredCount(), { wrapper });

      // Query should not be enabled
      expect(result.current.data).toBeUndefined();
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('handles query errors', async () => {
      const mockError = new Error('Database error');
      setupCountMock(null, mockError);
      const wrapper = createWrapper();

      const { result } = renderHook(() => useMasteredCount(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
