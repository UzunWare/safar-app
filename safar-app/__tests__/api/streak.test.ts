import { fetchStreak, recordStreakActivity, useStreakFreeze } from '@/lib/api/streak';
import { supabase } from '@/lib/api/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as streakUtils from '@/lib/utils/streak';

function localDate(date: Date): string {
  return streakUtils.formatLocalDate(date);
}

function today(): string {
  return streakUtils.getTodayLocalDateString();
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDate(d);
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDate(d);
}

describe('fetchStreak', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('returns streak data from Supabase including freezeUsedAt', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: {
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: today(),
        freeze_used_at: '2026-02-10',
      },
      error: null,
    });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock) = jest.fn().mockReturnValue({ select: mockSelect });

    const result = await fetchStreak('user-1');

    expect(supabase.from).toHaveBeenCalledWith('user_streaks');
    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(10);
    expect(result.lastActivityDate).toBe(today());
    expect(result.freezeUsedAt).toBe('2026-02-10');
  });

  it('returns null freezeUsedAt when no freeze has been used', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: {
        current_streak: 3,
        longest_streak: 7,
        last_activity_date: today(),
        freeze_used_at: null,
      },
      error: null,
    });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock) = jest.fn().mockReturnValue({ select: mockSelect });

    const result = await fetchStreak('user-1');
    expect(result.freezeUsedAt).toBeNull();
  });

  it('creates streak record if not found (PGRST116)', async () => {
    const mockMissingSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    });
    const mockMissingEq = jest.fn().mockReturnValue({ single: mockMissingSingle });
    const mockMissingSelect = jest.fn().mockReturnValue({ eq: mockMissingEq });

    const mockInsertSingle = jest.fn().mockResolvedValue({
      data: { current_streak: 0, longest_streak: 0, last_activity_date: null },
      error: null,
    });
    const mockInsertSelect = jest.fn().mockReturnValue({ single: mockInsertSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockInsertSelect });

    (supabase.from as jest.Mock) = jest
      .fn()
      .mockReturnValueOnce({ select: mockMissingSelect })
      .mockReturnValueOnce({ insert: mockInsert });

    const result = await fetchStreak('user-1');

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.lastActivityDate).toBeNull();
  });

  it('handles insert race by re-reading when unique conflict occurs', async () => {
    const mockMissingSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    });
    const mockMissingEq = jest.fn().mockReturnValue({ single: mockMissingSingle });
    const mockMissingSelect = jest.fn().mockReturnValue({ eq: mockMissingEq });

    const mockInsertSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });
    const mockInsertSelect = jest.fn().mockReturnValue({ single: mockInsertSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockInsertSelect });

    const mockRefetchSingle = jest.fn().mockResolvedValue({
      data: { current_streak: 3, longest_streak: 8, last_activity_date: yesterday() },
      error: null,
    });
    const mockRefetchEq = jest.fn().mockReturnValue({ single: mockRefetchSingle });
    const mockRefetchSelect = jest.fn().mockReturnValue({ eq: mockRefetchEq });

    (supabase.from as jest.Mock) = jest
      .fn()
      .mockReturnValueOnce({ select: mockMissingSelect })
      .mockReturnValueOnce({ insert: mockInsert })
      .mockReturnValueOnce({ select: mockRefetchSelect });

    const result = await fetchStreak('user-1');

    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(8);
    expect(result.lastActivityDate).toBe(yesterday());
  });

  it('normalizes stale broken streak to 0 and persists reset', async () => {
    const mockSelectSingle = jest.fn().mockResolvedValue({
      data: { current_streak: 6, longest_streak: 12, last_activity_date: daysAgo(2) },
      error: null,
    });
    const mockSelectEq = jest.fn().mockReturnValue({ single: mockSelectSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockSelectEq });

    const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq });

    (supabase.from as jest.Mock) = jest
      .fn()
      .mockReturnValueOnce({ select: mockSelect })
      .mockReturnValueOnce({ update: mockUpdate });

    const result = await fetchStreak('user-1');

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(12);
    expect(result.lastActivityDate).toBe(daysAgo(2));
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ current_streak: 0 }));
  });

  it('returns cached data on network error', async () => {
    const cached = JSON.stringify({
      currentStreak: 3,
      longestStreak: 8,
      lastActivityDate: yesterday(),
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(cached);

    (supabase.from as jest.Mock) = jest.fn().mockImplementation(() => {
      throw new Error('Network error');
    });

    const result = await fetchStreak('user-1');

    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(8);
  });
});

describe('recordStreakActivity', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('writes last_activity_date using local date helper', async () => {
    jest.spyOn(streakUtils, 'getTodayLocalDateString').mockReturnValue('2026-02-14');

    const mockFetchSingle = jest.fn().mockResolvedValue({
      data: { current_streak: 0, longest_streak: 0, last_activity_date: null },
      error: null,
    });
    const mockFetchEq = jest.fn().mockReturnValue({ single: mockFetchSingle });
    const mockFetchSelect = jest.fn().mockReturnValue({ eq: mockFetchEq });

    const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq });

    (supabase.from as jest.Mock) = jest
      .fn()
      .mockReturnValueOnce({ select: mockFetchSelect })
      .mockReturnValueOnce({ update: mockUpdate });

    const result = await recordStreakActivity('user-1');

    expect(result.lastActivityDate).toBe('2026-02-14');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ last_activity_date: '2026-02-14' })
    );
  });

  it('increments streak when continuing from yesterday', async () => {
    const mockFetchSingle = jest.fn().mockResolvedValue({
      data: { current_streak: 3, longest_streak: 5, last_activity_date: yesterday() },
      error: null,
    });
    const mockFetchEq = jest.fn().mockReturnValue({ single: mockFetchSingle });
    const mockFetchSelect = jest.fn().mockReturnValue({ eq: mockFetchEq });

    const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq });

    (supabase.from as jest.Mock) = jest
      .fn()
      .mockReturnValueOnce({ select: mockFetchSelect })
      .mockReturnValueOnce({ update: mockUpdate });

    const result = await recordStreakActivity('user-1');

    expect(result.currentStreak).toBe(4);
    expect(result.longestStreak).toBe(5);
  });

  it('does not update when already active today', async () => {
    const mockFetchSingle = jest.fn().mockResolvedValue({
      data: { current_streak: 5, longest_streak: 10, last_activity_date: today() },
      error: null,
    });
    const mockFetchEq = jest.fn().mockReturnValue({ single: mockFetchSingle });
    const mockFetchSelect = jest.fn().mockReturnValue({ eq: mockFetchEq });

    (supabase.from as jest.Mock) = jest.fn().mockReturnValue({ select: mockFetchSelect });

    const result = await recordStreakActivity('user-1');

    expect(result.currentStreak).toBe(5);
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it('resets to new streak 1 when previously broken', async () => {
    const mockFetchSingle = jest.fn().mockResolvedValue({
      data: { current_streak: 0, longest_streak: 15, last_activity_date: daysAgo(2) },
      error: null,
    });
    const mockFetchEq = jest.fn().mockReturnValue({ single: mockFetchSingle });
    const mockFetchSelect = jest.fn().mockReturnValue({ eq: mockFetchEq });

    const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq });

    (supabase.from as jest.Mock) = jest
      .fn()
      .mockReturnValueOnce({ select: mockFetchSelect })
      .mockReturnValueOnce({ update: mockUpdate });

    const result = await recordStreakActivity('user-1');

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(15);
  });
});

describe('useStreakFreeze', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('updates freeze_used_at to today in database', async () => {
    const mockFetchSingle = jest.fn().mockResolvedValue({
      data: {
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: yesterday(),
        freeze_used_at: null,
      },
      error: null,
    });
    const mockFetchEq = jest.fn().mockReturnValue({ single: mockFetchSingle });
    const mockFetchSelect = jest.fn().mockReturnValue({ eq: mockFetchEq });

    const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq });

    (supabase.from as jest.Mock) = jest
      .fn()
      .mockReturnValueOnce({ select: mockFetchSelect })
      .mockReturnValueOnce({ update: mockUpdate });

    const result = await useStreakFreeze('user-1');

    expect(mockUpdate).toHaveBeenCalled();
    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg).toHaveProperty('freeze_used_at');
    expect(result.freezeUsedAt).toBe(today());
  });

  it('does not update when freeze was already used this week', async () => {
    const mockFetchSingle = jest.fn().mockResolvedValue({
      data: {
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: yesterday(),
        freeze_used_at: today(),
      },
      error: null,
    });
    const mockFetchEq = jest.fn().mockReturnValue({ single: mockFetchSingle });
    const mockFetchSelect = jest.fn().mockReturnValue({ eq: mockFetchEq });

    (supabase.from as jest.Mock) = jest.fn().mockReturnValue({ select: mockFetchSelect });

    const result = await useStreakFreeze('user-1');

    expect(supabase.from).toHaveBeenCalledTimes(1);
    expect(result.freezeUsedAt).toBe(today());
    expect(result.currentStreak).toBe(5);
  });

  it('returns updated streak data preserving current streak', async () => {
    const mockFetchSingle = jest.fn().mockResolvedValue({
      data: {
        current_streak: 7,
        longest_streak: 12,
        last_activity_date: yesterday(),
        freeze_used_at: null,
      },
      error: null,
    });
    const mockFetchEq = jest.fn().mockReturnValue({ single: mockFetchSingle });
    const mockFetchSelect = jest.fn().mockReturnValue({ eq: mockFetchEq });

    const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq });

    (supabase.from as jest.Mock) = jest
      .fn()
      .mockReturnValueOnce({ select: mockFetchSelect })
      .mockReturnValueOnce({ update: mockUpdate });

    const result = await useStreakFreeze('user-1');

    expect(result.currentStreak).toBe(7);
    expect(result.longestStreak).toBe(12);
  });

  it('caches result after successful freeze', async () => {
    const mockFetchSingle = jest.fn().mockResolvedValue({
      data: {
        current_streak: 3,
        longest_streak: 8,
        last_activity_date: yesterday(),
        freeze_used_at: null,
      },
      error: null,
    });
    const mockFetchEq = jest.fn().mockReturnValue({ single: mockFetchSingle });
    const mockFetchSelect = jest.fn().mockReturnValue({ eq: mockFetchEq });

    const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq });

    (supabase.from as jest.Mock) = jest
      .fn()
      .mockReturnValueOnce({ select: mockFetchSelect })
      .mockReturnValueOnce({ update: mockUpdate });

    await useStreakFreeze('user-1');

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
});
