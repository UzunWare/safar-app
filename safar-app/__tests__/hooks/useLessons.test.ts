import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLessons } from '@/lib/hooks/useLessons';
import { supabase } from '@/lib/api/supabase';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockLessonsData = [
  {
    id: 'l1',
    unit_id: 'u1',
    name: 'Bismillah',
    order: 1,
    word_count: 4,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'l2',
    unit_id: 'u1',
    name: 'Al-Hamd',
    order: 2,
    word_count: 6,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'l3',
    unit_id: 'u1',
    name: 'Rabb Al-Alamin',
    order: 3,
    word_count: 5,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

describe('useLessons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches lessons for a given unit', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: mockLessonsData, error: null });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLessons('u1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockLessonsData);
    expect(supabase.from).toHaveBeenCalledWith('lessons');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('unit_id', 'u1');
    expect(mockOrder).toHaveBeenCalledWith('order', { ascending: true });
  });

  it('returns loading state initially', () => {
    const mockOrder = jest.fn().mockReturnValue(new Promise(() => {}));
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLessons('u1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('handles error state', async () => {
    const mockOrder = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLessons('u1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('returns empty array when no lessons exist', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLessons('u1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('does not fetch when unitId is empty', () => {
    const { result } = renderHook(() => useLessons(''), {
      wrapper: createWrapper(),
    });

    // Should not be loading since enabled: false
    expect(result.current.fetchStatus).toBe('idle');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('uses Infinity staleTime for static content caching', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: mockLessonsData, error: null });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLessons('u1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // After fetching, data should be stale: false due to Infinity staleTime
    expect(result.current.isStale).toBe(false);
  });
});
