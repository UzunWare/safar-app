/**
 * Progress API Tests
 *
 * Tests onboarding completion save with offline fallback
 */
import {
  completeOnboarding,
  resetOnboarding,
  saveScriptAbility,
  getScriptAbility,
  markLessonComplete,
  fetchLessonProgress,
  syncOfflineProgress,
} from '@/lib/api/progress';
import { supabase } from '@/lib/api/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock supabase
jest.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Sentry
jest.mock('@/lib/utils/sentry', () => ({
  captureException: jest.fn(),
}));

describe('completeOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves onboarding completion to Supabase', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const result = await completeOnboarding('user-123');

    expect(result.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    expect(mockUpdate).toHaveBeenCalledWith({
      onboarding_completed: true,
      onboarding_completed_at: expect.any(String),
    });
    expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
  });

  it('clears offline cache on successful save', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await completeOnboarding('user-123');

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('onboarding_completed_user-123');
  });

  it('falls back to local storage on network error', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'fetch failed: network error' },
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const result = await completeOnboarding('user-123');

    expect(result.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('onboarding_completed_user-123', 'true');
  });

  it('falls back to local storage on exception', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockRejectedValue(new Error('Connection timeout'));

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const result = await completeOnboarding('user-123');

    expect(result.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('onboarding_completed_user-123', 'true');
  });

  it('returns error if both Supabase and local storage fail', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockRejectedValue(new Error('Connection error'));

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const result = await completeOnboarding('user-123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to save onboarding completion');
  });

  it('sets completion timestamp', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const before = new Date().toISOString();
    await completeOnboarding('user-123');
    const after = new Date().toISOString();

    const callArg = mockUpdate.mock.calls[0][0];
    expect(callArg.onboarding_completed_at).toBeDefined();
    expect(callArg.onboarding_completed_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(callArg.onboarding_completed_at >= before).toBe(true);
    expect(callArg.onboarding_completed_at <= after).toBe(true);
  });
});

describe('saveScriptAbility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves script ability to Supabase', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const result = await saveScriptAbility('user-123', 'fluent');

    expect(result.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    expect(mockUpdate).toHaveBeenCalledWith({ script_reading_ability: 'fluent' });
    expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
  });

  it('handles database errors gracefully', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'database error occurred' },
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const result = await saveScriptAbility('user-123', 'learning');

    expect(result.success).toBe(false);
    expect(result.error).toBe('database error occurred');
  });
});

describe('getScriptAbility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retrieves script ability from Supabase', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: { script_reading_ability: 'fluent' },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });

    const result = await getScriptAbility('user-123');

    expect(result).toBe('fluent');
    expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    expect(mockSelect).toHaveBeenCalledWith('script_reading_ability');
    expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
  });

  it('falls back to local storage if Supabase fails', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('learning');

    const result = await getScriptAbility('user-123');

    expect(result).toBe('learning');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('script_ability_user-123');
  });

  it('returns null if both sources fail', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockRejectedValue(new Error('Connection error'));

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });

    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const result = await getScriptAbility('user-123');

    expect(result).toBeNull();
  });
});

describe('resetOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resets onboarding status to false', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const result = await resetOnboarding('user-123');

    expect(result.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    expect(mockUpdate).toHaveBeenCalledWith({
      onboarding_completed: false,
      onboarding_completed_at: null,
    });
    expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
  });

  it('clears offline cache after successful reset', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await resetOnboarding('user-123');

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('onboarding_completed_user-123');
  });

  it('returns error if reset fails', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const result = await resetOnboarding('user-123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });

  it('handles exceptions gracefully', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockRejectedValue(new Error('Connection timeout'));

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const result = await resetOnboarding('user-123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection timeout');
  });
});

describe('markLessonComplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore AsyncStorage mocks (earlier tests may set mockRejectedValue)
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => Promise.resolve(null));
    (AsyncStorage.setItem as jest.Mock).mockImplementation(() => Promise.resolve());
  });

  it('upserts lesson completion to Supabase', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      upsert: mockUpsert,
    });

    const result = await markLessonComplete('user-123', 'lesson-1');

    expect(result.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('user_lesson_progress');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        lesson_id: 'lesson-1',
        is_synced: true,
      }),
      { onConflict: 'user_id,lesson_id' }
    );
  });

  it('sets completed_at timestamp', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      upsert: mockUpsert,
    });

    const before = new Date().toISOString();
    await markLessonComplete('user-123', 'lesson-1');
    const after = new Date().toISOString();

    const callArg = mockUpsert.mock.calls[0][0];
    expect(callArg.completed_at).toBeDefined();
    expect(callArg.completed_at >= before).toBe(true);
    expect(callArg.completed_at <= after).toBe(true);
  });

  it('is idempotent (upsert on conflict)', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      upsert: mockUpsert,
    });

    await markLessonComplete('user-123', 'lesson-1');
    await markLessonComplete('user-123', 'lesson-1');

    expect(mockUpsert).toHaveBeenCalledTimes(2);
    expect(mockUpsert).toHaveBeenCalledWith(expect.any(Object), {
      onConflict: 'user_id,lesson_id',
    });
  });

  it('saves locally and queues sync on network error', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'fetch failed: network error' },
    });

    (supabase.from as jest.Mock).mockReturnValue({
      upsert: mockUpsert,
    });

    const result = await markLessonComplete('user-123', 'lesson-1');

    expect(result.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('saves locally on exception', async () => {
    const mockUpsert = jest.fn().mockRejectedValue(new Error('Connection timeout'));

    (supabase.from as jest.Mock).mockReturnValue({
      upsert: mockUpsert,
    });

    const result = await markLessonComplete('user-123', 'lesson-1');

    expect(result.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
});

describe('fetchLessonProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches all lesson progress for a user', async () => {
    const mockData = [
      {
        id: 'p1',
        user_id: 'user-123',
        lesson_id: 'l1',
        completed_at: '2026-02-09T12:00:00Z',
        is_synced: true,
        updated_at: '2026-02-09T12:00:00Z',
      },
      {
        id: 'p2',
        user_id: 'user-123',
        lesson_id: 'l2',
        completed_at: '2026-02-09T12:30:00Z',
        is_synced: true,
        updated_at: '2026-02-09T12:30:00Z',
      },
    ];
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({ data: mockData, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });

    const result = await fetchLessonProgress('user-123');

    expect(result).toHaveLength(2);
    expect(supabase.from).toHaveBeenCalledWith('user_lesson_progress');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
  });

  it('returns empty array on error', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: { message: 'error' } });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });

    const result = await fetchLessonProgress('user-123');

    expect(result).toEqual([]);
  });
});

describe('syncOfflineProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => Promise.resolve(null));
    (AsyncStorage.setItem as jest.Mock).mockImplementation(() => Promise.resolve());
    (AsyncStorage.removeItem as jest.Mock).mockImplementation(() => Promise.resolve());
  });

  it('syncs queued completions to server', async () => {
    const queueData = JSON.stringify([
      {
        type: 'lesson_complete',
        payload: { lesson_id: 'l1', completed_at: '2026-02-09T12:00:00Z' },
        createdAt: '2026-02-09T12:00:00Z',
      },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(queueData);

    const mockUpsert = jest.fn().mockResolvedValue({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });

    const result = await syncOfflineProgress('user-123');

    expect(result.synced).toBe(1);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        lesson_id: 'l1',
        is_synced: true,
      }),
      { onConflict: 'user_id,lesson_id' }
    );
  });

  it('clears queue after successful sync', async () => {
    const queueData = JSON.stringify([
      {
        type: 'lesson_complete',
        payload: { lesson_id: 'l1', completed_at: '2026-02-09T12:00:00Z' },
        createdAt: '2026-02-09T12:00:00Z',
      },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(queueData);

    const mockUpsert = jest.fn().mockResolvedValue({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });

    await syncOfflineProgress('user-123');

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('sync_queue_user-123');
  });

  it('returns 0 synced when queue is empty', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const result = await syncOfflineProgress('user-123');

    expect(result.synced).toBe(0);
  });

  it('keeps failed items in queue', async () => {
    const queueData = JSON.stringify([
      {
        type: 'lesson_complete',
        payload: { lesson_id: 'l1', completed_at: '2026-02-09T12:00:00Z' },
        createdAt: '2026-02-09T12:00:00Z',
      },
      {
        type: 'lesson_complete',
        payload: { lesson_id: 'l2', completed_at: '2026-02-09T12:30:00Z' },
        createdAt: '2026-02-09T12:30:00Z',
      },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(queueData);

    // First upsert succeeds, second fails
    const mockUpsert = jest
      .fn()
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'server error' } });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });

    const result = await syncOfflineProgress('user-123');

    expect(result.synced).toBe(1);
    expect(result.failed).toBe(1);
    // Failed items should be saved back to queue
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('sync_queue_user-123', expect.any(String));
  });
});
