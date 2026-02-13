/**
 * useProgress Hook Tests
 * Story 3.6: Progress tracking for lessons, units, and pathway
 */
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProgress } from '@/lib/hooks/useProgress';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';

jest.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockLessons = [
  {
    id: 'l1',
    unit_id: 'u1',
    name: 'Lesson 1',
    order: 1,
    word_count: 5,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'l2',
    unit_id: 'u1',
    name: 'Lesson 2',
    order: 2,
    word_count: 3,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'l3',
    unit_id: 'u2',
    name: 'Lesson 3',
    order: 1,
    word_count: 4,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'l4',
    unit_id: 'u2',
    name: 'Lesson 4',
    order: 2,
    word_count: 6,
    created_at: '',
    updated_at: '',
  },
];

const mockUnits = [
  {
    id: 'u1',
    pathway_id: 'p1',
    name: 'Unit 1',
    order: 1,
    word_count: 8,
    description: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'u2',
    pathway_id: 'p1',
    name: 'Unit 2',
    order: 2,
    word_count: 10,
    description: null,
    created_at: '',
    updated_at: '',
  },
];

function setupMocks(progressData: any[] = []) {
  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'user_lesson_progress') {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: progressData, error: null }),
        }),
      };
    }
    if (table === 'lessons') {
      return {
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ data: mockLessons, error: null }),
        }),
      };
    }
    return {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    };
  });
}

describe('useProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: { id: 'user-123' } as any });
  });

  it('returns zero progress when no lessons completed', async () => {
    setupMocks([]);

    const { result } = renderHook(() => useProgress(mockUnits), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.completedLessons).toBe(0);
    expect(result.current.totalLessons).toBe(4);
    expect(result.current.pathwayPercent).toBe(0);
  });

  it('calculates correct percentage when some lessons completed', async () => {
    setupMocks([
      {
        id: 'p1',
        user_id: 'user-123',
        lesson_id: 'l1',
        completed_at: '2026-02-09T12:00:00Z',
        is_synced: true,
        updated_at: '',
      },
      {
        id: 'p2',
        user_id: 'user-123',
        lesson_id: 'l2',
        completed_at: '2026-02-09T12:30:00Z',
        is_synced: true,
        updated_at: '',
      },
    ]);

    const { result } = renderHook(() => useProgress(mockUnits), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.completedLessons).toBe(2);
    expect(result.current.totalLessons).toBe(4);
    expect(result.current.pathwayPercent).toBe(50);
  });

  it('detects unit completion when all lessons in unit are done', async () => {
    setupMocks([
      {
        id: 'p1',
        user_id: 'user-123',
        lesson_id: 'l1',
        completed_at: '2026-02-09T12:00:00Z',
        is_synced: true,
        updated_at: '',
      },
      {
        id: 'p2',
        user_id: 'user-123',
        lesson_id: 'l2',
        completed_at: '2026-02-09T12:30:00Z',
        is_synced: true,
        updated_at: '',
      },
    ]);

    const { result } = renderHook(() => useProgress(mockUnits), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isUnitComplete('u1')).toBe(true);
    expect(result.current.isUnitComplete('u2')).toBe(false);
  });

  it('detects lesson completion', async () => {
    setupMocks([
      {
        id: 'p1',
        user_id: 'user-123',
        lesson_id: 'l1',
        completed_at: '2026-02-09T12:00:00Z',
        is_synced: true,
        updated_at: '',
      },
    ]);

    const { result } = renderHook(() => useProgress(mockUnits), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isLessonComplete('l1')).toBe(true);
    expect(result.current.isLessonComplete('l2')).toBe(false);
  });

  it('calculates unit progress percentage', async () => {
    setupMocks([
      {
        id: 'p1',
        user_id: 'user-123',
        lesson_id: 'l3',
        completed_at: '2026-02-09T12:00:00Z',
        is_synced: true,
        updated_at: '',
      },
    ]);

    const { result } = renderHook(() => useProgress(mockUnits), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.unitPercent('u1')).toBe(0);
    expect(result.current.unitPercent('u2')).toBe(50);
  });

  it('returns 100% when all lessons completed', async () => {
    setupMocks([
      {
        id: 'p1',
        user_id: 'user-123',
        lesson_id: 'l1',
        completed_at: '2026-02-09T12:00:00Z',
        is_synced: true,
        updated_at: '',
      },
      {
        id: 'p2',
        user_id: 'user-123',
        lesson_id: 'l2',
        completed_at: '2026-02-09T12:30:00Z',
        is_synced: true,
        updated_at: '',
      },
      {
        id: 'p3',
        user_id: 'user-123',
        lesson_id: 'l3',
        completed_at: '2026-02-09T13:00:00Z',
        is_synced: true,
        updated_at: '',
      },
      {
        id: 'p4',
        user_id: 'user-123',
        lesson_id: 'l4',
        completed_at: '2026-02-09T13:30:00Z',
        is_synced: true,
        updated_at: '',
      },
    ]);

    const { result } = renderHook(() => useProgress(mockUnits), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pathwayPercent).toBe(100);
    expect(result.current.isUnitComplete('u1')).toBe(true);
    expect(result.current.isUnitComplete('u2')).toBe(true);
  });

  it('returns nextLessonId as first incomplete lesson', async () => {
    setupMocks([
      {
        id: 'p1',
        user_id: 'user-123',
        lesson_id: 'l1',
        completed_at: '2026-02-09T12:00:00Z',
        is_synced: true,
        updated_at: '',
      },
    ]);

    const { result } = renderHook(() => useProgress(mockUnits), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // l1 is completed, l2 is next incomplete in u1
    expect(result.current.nextLessonId).toBe('l2');
  });

  it('returns first lesson of next unit when current unit is complete', async () => {
    setupMocks([
      {
        id: 'p1',
        user_id: 'user-123',
        lesson_id: 'l1',
        completed_at: '2026-02-09T12:00:00Z',
        is_synced: true,
        updated_at: '',
      },
      {
        id: 'p2',
        user_id: 'user-123',
        lesson_id: 'l2',
        completed_at: '2026-02-09T12:30:00Z',
        is_synced: true,
        updated_at: '',
      },
    ]);

    const { result } = renderHook(() => useProgress(mockUnits), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // u1 is complete (l1, l2), next is l3 in u2
    expect(result.current.nextLessonId).toBe('l3');
  });

  it('returns first lesson when all complete (for review)', async () => {
    setupMocks([
      {
        id: 'p1',
        user_id: 'user-123',
        lesson_id: 'l1',
        completed_at: '2026-02-09T12:00:00Z',
        is_synced: true,
        updated_at: '',
      },
      {
        id: 'p2',
        user_id: 'user-123',
        lesson_id: 'l2',
        completed_at: '2026-02-09T12:30:00Z',
        is_synced: true,
        updated_at: '',
      },
      {
        id: 'p3',
        user_id: 'user-123',
        lesson_id: 'l3',
        completed_at: '2026-02-09T13:00:00Z',
        is_synced: true,
        updated_at: '',
      },
      {
        id: 'p4',
        user_id: 'user-123',
        lesson_id: 'l4',
        completed_at: '2026-02-09T13:30:00Z',
        is_synced: true,
        updated_at: '',
      },
    ]);

    const { result } = renderHook(() => useProgress(mockUnits), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // All complete — returns first lesson of first unit for review
    expect(result.current.nextLessonId).toBe('l1');
  });

  it('does not fetch when user is not authenticated', async () => {
    useAuthStore.setState({ user: null });
    setupMocks();

    const { result } = renderHook(() => useProgress(mockUnits), { wrapper: createWrapper() });

    // Should not make API calls
    expect(result.current.completedLessons).toBe(0);
    expect(result.current.pathwayPercent).toBe(0);
  });
});
