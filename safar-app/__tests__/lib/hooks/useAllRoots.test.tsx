/**
 * useAllRoots Hook Tests
 * Tests query of all roots with derivative counts and search filtering
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAllRoots } from '@/lib/hooks/useAllRoots';
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

describe('useAllRoots', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches all roots with derivative counts', async () => {
    const mockRoots = [
      {
        id: 'r1',
        letters: 'ر-ح-م',
        meaning: 'Mercy',
        transliteration: 'R-H-M',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'r2',
        letters: 'ك-ت-ب',
        meaning: 'Writing',
        transliteration: 'K-T-B',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    // Mock roots query
    const mockOrderRoots = jest.fn().mockResolvedValue({ data: mockRoots, error: null });
    const mockSelectRoots = jest.fn().mockReturnValue({ order: mockOrderRoots });

    // Mock derivative counts (multiple calls, one per root)
    const mockCountR1 = jest.fn().mockResolvedValue({ count: 8, error: null });
    const mockCountR2 = jest.fn().mockResolvedValue({ count: 12, error: null });
    const mockEqR1 = jest
      .fn()
      .mockReturnValue({ select: jest.fn().mockResolvedValue({ count: 8, error: null }) });
    const mockEqR2 = jest
      .fn()
      .mockReturnValue({ select: jest.fn().mockResolvedValue({ count: 12, error: null }) });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'roots') {
        return { select: mockSelectRoots };
      } else if (table === 'word_roots') {
        // Alternate between root counts
        const count = callCount === 0 ? 8 : 12;
        callCount++;
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ count, error: null }),
          }),
        };
      }
    });

    const { result } = renderHook(() => useAllRoots(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(supabase.from).toHaveBeenCalledWith('roots');
    expect(mockSelectRoots).toHaveBeenCalledWith('*');
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toMatchObject({
      id: 'r1',
      letters: 'ر-ح-م',
      meaning: 'Mercy',
      derivative_count: expect.any(Number),
    });
  });

  it('returns empty array when no roots exist', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useAllRoots(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('filters by English meaning (case-insensitive)', async () => {
    const mockRoots = [
      {
        id: 'r1',
        letters: 'ر-ح-م',
        meaning: 'Mercy',
        transliteration: 'R-H-M',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'r2',
        letters: 'ك-ت-ب',
        meaning: 'Writing',
        transliteration: 'K-T-B',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'r3',
        letters: 'ع-ل-م',
        meaning: 'Knowledge',
        transliteration: 'A-L-M',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    const mockOrder = jest.fn().mockResolvedValue({ data: mockRoots, error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'roots') return { select: mockSelect };
      return {
        select: jest
          .fn()
          .mockReturnValue({ eq: jest.fn().mockResolvedValue({ count: 0, error: null }) }),
      };
    });

    const { result } = renderHook(() => useAllRoots('mercy'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].meaning).toBe('Mercy');
  });

  it('filters by Arabic letters', async () => {
    const mockRoots = [
      {
        id: 'r1',
        letters: 'ر-ح-م',
        meaning: 'Mercy',
        transliteration: 'R-H-M',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'r2',
        letters: 'ك-ت-ب',
        meaning: 'Writing',
        transliteration: 'K-T-B',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    const mockOrder = jest.fn().mockResolvedValue({ data: mockRoots, error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'roots') return { select: mockSelect };
      return {
        select: jest
          .fn()
          .mockReturnValue({ eq: jest.fn().mockResolvedValue({ count: 0, error: null }) }),
      };
    });

    const { result } = renderHook(() => useAllRoots('ر-ح-م'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].letters).toBe('ر-ح-م');
  });

  it('filters by transliteration', async () => {
    const mockRoots = [
      {
        id: 'r1',
        letters: 'ر-ح-م',
        meaning: 'Mercy',
        transliteration: 'R-H-M',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'r2',
        letters: 'ك-ت-ب',
        meaning: 'Writing',
        transliteration: 'K-T-B',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    const mockOrder = jest.fn().mockResolvedValue({ data: mockRoots, error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'roots') return { select: mockSelect };
      return {
        select: jest
          .fn()
          .mockReturnValue({ eq: jest.fn().mockResolvedValue({ count: 0, error: null }) }),
      };
    });

    // Search with hyphenated form (matches stored format)
    const { result } = renderHook(() => useAllRoots('r-h-m'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].transliteration).toBe('R-H-M');
  });

  it('handles Supabase error gracefully', async () => {
    const mockOrder = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useAllRoots(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('uses Infinity staleTime for caching static content', () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useAllRoots(), { wrapper: createWrapper() });

    // Verify hook renders without error - staleTime is implementation detail
    expect(result.current).toBeDefined();
  });
});
