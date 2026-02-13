import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useStreak } from '@/lib/hooks/useStreak';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { formatLocalDate } from '@/lib/utils/streak';

jest.mock('@/lib/stores/useAuthStore');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

function today(): string {
  return formatLocalDate(new Date());
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatLocalDate(d);
}

describe('useStreak', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: any) => any) =>
      selector({ user: { id: 'user-1' } })
    );
  });

  function setupStreakMock(
    data: {
      current_streak: number;
      longest_streak: number;
      last_activity_date: string | null;
      freeze_used_at?: string | null;
    } | null,
    error: any = null
  ) {
    const mockSingle = jest.fn().mockResolvedValue({ data, error });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

    (supabase.from as jest.Mock) = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    return { mockSelect, mockEq, mockSingle };
  }

  it('queries user_streaks table for current user', async () => {
    const mocks = setupStreakMock({
      current_streak: 5,
      longest_streak: 10,
      last_activity_date: today(),
    });
    const wrapper = createWrapper();

    renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('user_streaks');
    });

    expect(mocks.mockEq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('returns streak data with active status when activity today', async () => {
    setupStreakMock({
      current_streak: 5,
      longest_streak: 10,
      last_activity_date: today(),
    });
    const wrapper = createWrapper();

    const { result } = renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentStreak).toBe(5);
    });

    expect(result.current.longestStreak).toBe(10);
    expect(result.current.status).toBe('active');
  });

  it('returns at-risk status when last activity was yesterday', async () => {
    setupStreakMock({
      current_streak: 3,
      longest_streak: 7,
      last_activity_date: yesterday(),
    });
    const wrapper = createWrapper();

    const { result } = renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe('at-risk');
    });

    expect(result.current.currentStreak).toBe(3);
  });

  it('returns broken status when no activity date', async () => {
    setupStreakMock({
      current_streak: 0,
      longest_streak: 5,
      last_activity_date: null,
    });
    const wrapper = createWrapper();

    const { result } = renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe('broken');
    });

    expect(result.current.currentStreak).toBe(0);
  });

  it('returns currentStreak 0 for broken stale streak values', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 2);

    const mockSingle = jest.fn().mockResolvedValue({
      data: {
        current_streak: 8,
        longest_streak: 12,
        last_activity_date: formatLocalDate(oldDate),
        freeze_used_at: null,
      },
      error: null,
    });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq });

    (supabase.from as jest.Mock) = jest
      .fn()
      .mockReturnValueOnce({ select: mockSelect })
      .mockReturnValueOnce({ update: mockUpdate });

    const wrapper = createWrapper();

    const { result } = renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(result.current.longestStreak).toBe(12);
    });

    expect(result.current.status).toBe('broken');
    expect(result.current.currentStreak).toBe(0);
  });

  it('does not query when no user', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: any) => any) =>
      selector({ user: null })
    );
    setupStreakMock(null);
    const wrapper = createWrapper();

    const { result } = renderHook(() => useStreak(), { wrapper });

    expect(result.current.currentStreak).toBe(0);
    expect(result.current.status).toBe('broken');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns default values while loading', () => {
    setupStreakMock({
      current_streak: 5,
      longest_streak: 10,
      last_activity_date: today(),
    });
    const wrapper = createWrapper();

    const { result } = renderHook(() => useStreak(), { wrapper });

    // Before data loads, should have defaults
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.isLoading).toBe(true);
  });

  it('returns freezeAvailable true when no freeze used', async () => {
    setupStreakMock({
      current_streak: 5,
      longest_streak: 10,
      last_activity_date: today(),
      freeze_used_at: null,
    });
    const wrapper = createWrapper();

    const { result } = renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentStreak).toBe(5);
    });

    expect(result.current.freezeAvailable).toBe(true);
    expect(result.current.freezeUsedAt).toBeNull();
    expect(result.current.nextFreezeDate).toBeNull();
  });

  it('returns freezeAvailable false when freeze used this week', async () => {
    setupStreakMock({
      current_streak: 5,
      longest_streak: 10,
      last_activity_date: today(),
      freeze_used_at: today(),
    });
    const wrapper = createWrapper();

    const { result } = renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentStreak).toBe(5);
    });

    expect(result.current.freezeAvailable).toBe(false);
    expect(result.current.freezeUsedAt).toBe(today());
    expect(result.current.nextFreezeDate).toBeTruthy();
  });

  it('exposes useFreeze callback', async () => {
    setupStreakMock({
      current_streak: 3,
      longest_streak: 7,
      last_activity_date: yesterday(),
      freeze_used_at: null,
    });
    const wrapper = createWrapper();

    const { result } = renderHook(() => useStreak(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentStreak).toBe(3);
    });

    expect(typeof result.current.useFreeze).toBe('function');
  });
});
