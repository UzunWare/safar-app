import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/api/supabase';
import {
  saveWordProgressLocally,
  getLocalWordProgress,
  syncWordProgress,
} from '@/lib/api/wordProgressLocal';

describe('saveWordProgressLocally', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  const sm2Result = {
    easeFactor: 2.5,
    interval: 6,
    repetitions: 2,
    nextReview: '2026-02-16T00:00:00.000Z',
  };

  it('saves progress to AsyncStorage with user:word key', async () => {
    await saveWordProgressLocally('user-1', 'word-1', sm2Result);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'word_progress:user-1:word-1',
      expect.any(String)
    );
  });

  it('saves all SM-2 fields', async () => {
    await saveWordProgressLocally('user-1', 'word-1', sm2Result);

    const savedJson = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const saved = JSON.parse(savedJson);
    expect(saved.easeFactor).toBe(2.5);
    expect(saved.interval).toBe(6);
    expect(saved.repetitions).toBe(2);
    expect(saved.nextReview).toBe('2026-02-16T00:00:00.000Z');
  });

  it('marks progress as not synced', async () => {
    await saveWordProgressLocally('user-1', 'word-1', sm2Result);

    const savedJson = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const saved = JSON.parse(savedJson);
    expect(saved.isSynced).toBe(false);
  });

  it('queues sync item in the sync queue', async () => {
    await saveWordProgressLocally('user-1', 'word-1', sm2Result);

    // Should also write to the sync queue
    const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
    const queueCall = calls.find((c: string[]) => c[0] === 'sync_queue_user-1');
    expect(queueCall).toBeTruthy();
    const queue = JSON.parse(queueCall![1]);
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe('word_progress');
    expect(queue[0].payload.word_id).toBe('word-1');
  });

  it('appends to existing sync queue', async () => {
    const existingQueue = JSON.stringify([
      { type: 'lesson_complete', payload: { lesson_id: 'l-1' }, createdAt: '2026-02-10T00:00:00Z' },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'sync_queue_user-1') return Promise.resolve(existingQueue);
      return Promise.resolve(null);
    });

    await saveWordProgressLocally('user-1', 'word-1', sm2Result);

    const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
    const queueCall = calls.find((c: string[]) => c[0] === 'sync_queue_user-1');
    const queue = JSON.parse(queueCall![1]);
    expect(queue).toHaveLength(2);
    expect(queue[0].type).toBe('lesson_complete');
    expect(queue[1].type).toBe('word_progress');
  });
});

describe('getLocalWordProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no local progress exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const result = await getLocalWordProgress('user-1', 'word-1');
    expect(result).toBeNull();
  });

  it('returns parsed progress when it exists', async () => {
    const stored = JSON.stringify({
      easeFactor: 2.5,
      interval: 6,
      repetitions: 2,
      nextReview: '2026-02-16T00:00:00.000Z',
      isSynced: false,
      updatedAt: '2026-02-10T00:00:00.000Z',
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(stored);

    const result = await getLocalWordProgress('user-1', 'word-1');
    expect(result).toEqual(
      expect.objectContaining({
        easeFactor: 2.5,
        interval: 6,
        repetitions: 2,
      })
    );
  });

  it('returns null for corrupted data', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('not-json');

    const result = await getLocalWordProgress('user-1', 'word-1');
    expect(result).toBeNull();
  });
});

describe('syncWordProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  function setupUpsertMock(error: any = null) {
    const mockUpsert = jest.fn().mockResolvedValue({ data: null, error });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });
    return mockUpsert;
  }

  it('returns 0 synced when queue is empty', async () => {
    const result = await syncWordProgress('user-1');
    expect(result).toEqual({ synced: 0, failed: 0 });
  });

  it('syncs word_progress items from queue to Supabase', async () => {
    const queue = JSON.stringify([
      {
        type: 'word_progress',
        payload: {
          word_id: 'word-1',
          ease_factor: 2.5,
          interval: 6,
          repetitions: 2,
          next_review: '2026-02-16T00:00:00.000Z',
          status: 'learning',
        },
        createdAt: '2026-02-10T00:00:00.000Z',
      },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(queue);
    const mockUpsert = setupUpsertMock(null);

    const result = await syncWordProgress('user-1');

    expect(mockUpsert).toHaveBeenCalled();
    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);
  });

  it('retains failed items in queue', async () => {
    const queue = JSON.stringify([
      {
        type: 'word_progress',
        payload: {
          word_id: 'word-1',
          ease_factor: 2.5,
          interval: 6,
          repetitions: 2,
          next_review: '2026-02-16T00:00:00.000Z',
          status: 'learning',
        },
        createdAt: '2026-02-10T00:00:00.000Z',
      },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(queue);
    setupUpsertMock({ message: 'Network error' });

    const result = await syncWordProgress('user-1');

    expect(result.synced).toBe(0);
    expect(result.failed).toBe(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('sync_queue_user-1', expect.any(String));
  });

  it('removes queue key when all items synced', async () => {
    const queue = JSON.stringify([
      {
        type: 'word_progress',
        payload: {
          word_id: 'word-1',
          ease_factor: 2.5,
          interval: 6,
          repetitions: 2,
          next_review: '2026-02-16T00:00:00.000Z',
          status: 'learning',
        },
        createdAt: '2026-02-10T00:00:00.000Z',
      },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(queue);
    setupUpsertMock(null);

    await syncWordProgress('user-1');

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('sync_queue_user-1');
  });

  it('skips non-word_progress items (leaves them in queue)', async () => {
    const queue = JSON.stringify([
      {
        type: 'lesson_complete',
        payload: { lesson_id: 'l-1' },
        createdAt: '2026-02-10T00:00:00.000Z',
      },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(queue);

    const result = await syncWordProgress('user-1');

    // lesson_complete items are not synced by this function
    expect(result.synced).toBe(0);
    expect(result.failed).toBe(0);
  });

  it('marks local progress as synced after successful sync', async () => {
    const queue = JSON.stringify([
      {
        type: 'word_progress',
        payload: {
          word_id: 'word-1',
          ease_factor: 2.5,
          interval: 6,
          repetitions: 2,
          next_review: '2026-02-16T00:00:00.000Z',
          status: 'learning',
        },
        createdAt: '2026-02-10T00:00:00.000Z',
      },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'sync_queue_user-1') return Promise.resolve(queue);
      if (key === 'word_progress:user-1:word-1') {
        return Promise.resolve(
          JSON.stringify({
            easeFactor: 2.5,
            interval: 6,
            repetitions: 2,
            nextReview: '2026-02-16T00:00:00.000Z',
            isSynced: false,
            updatedAt: '2026-02-10T00:00:00.000Z',
          })
        );
      }
      return Promise.resolve(null);
    });
    setupUpsertMock(null);

    await syncWordProgress('user-1');

    const progressCalls = (AsyncStorage.setItem as jest.Mock).mock.calls.filter(
      (c: string[]) => c[0] === 'word_progress:user-1:word-1'
    );
    expect(progressCalls.length).toBeGreaterThan(0);
    const updated = JSON.parse(progressCalls[progressCalls.length - 1][1]);
    expect(updated.isSynced).toBe(true);
  });
});
