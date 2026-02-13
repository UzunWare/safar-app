import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { usePathway, SALAH_FIRST_PATHWAY_ID } from '@/lib/hooks/usePathway';
import { supabase } from '@/lib/api/supabase';

// Create a wrapper with QueryClientProvider for each test
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockPathwayData = {
  id: 'salah-first',
  name: 'Salah First',
  slug: 'salah-first',
  description: 'Learn the words of your daily prayers',
  promise: 'Understand your daily prayers in 6 weeks',
  total_words: 120,
  total_units: 6,
  preview_items: ['Al-Fatiha (complete)', 'Common prayer phrases', "Essential du'as"],
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  units: [
    {
      id: 'u1',
      pathway_id: 'salah-first',
      name: 'Al-Fatiha',
      order: 1,
      word_count: 20,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'u2',
      pathway_id: 'salah-first',
      name: "Ruku' & Sujud",
      order: 2,
      word_count: 18,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'u3',
      pathway_id: 'salah-first',
      name: 'Tashahhud',
      order: 3,
      word_count: 22,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'u4',
      pathway_id: 'salah-first',
      name: 'Salawat & Closing',
      order: 4,
      word_count: 20,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'u5',
      pathway_id: 'salah-first',
      name: "Common Du'as",
      order: 5,
      word_count: 20,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'u6',
      pathway_id: 'salah-first',
      name: 'Review & Mastery',
      order: 6,
      word_count: 20,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ],
};

describe('usePathway', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports SALAH_FIRST_PATHWAY_ID constant', () => {
    expect(SALAH_FIRST_PATHWAY_ID).toBe('salah-first');
  });

  it('fetches pathway data with units', async () => {
    // Mock supabase chain: from().select().eq().single()
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => usePathway(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPathwayData);
    expect(supabase.from).toHaveBeenCalledWith('pathways');
    expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('units'));
  });

  it('returns loading state initially', () => {
    const mockSingle = jest.fn().mockReturnValue(new Promise(() => {})); // never resolves
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => usePathway(), {
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
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => usePathway(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('accepts a custom pathway ID', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    renderHook(() => usePathway('custom-id'), {
      wrapper: createWrapper(),
    });

    expect(mockEq).toHaveBeenCalledWith('id', 'custom-id');
  });
});
