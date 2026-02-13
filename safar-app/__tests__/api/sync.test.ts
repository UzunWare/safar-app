/**
 * Tests for sync queue utility
 * Story 7.6: Offline Sync Queue
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addToSyncQueue,
  processSyncQueue,
  getQueue,
  getFailedQueue,
  clearQueue,
  clearFailedQueue,
  QUEUE_KEY,
  FAILED_QUEUE_KEY,
  MAX_RETRIES,
  type SyncQueueItem,
} from '@/lib/api/sync';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Sentry
jest.mock('@/lib/utils/sentry', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock supabase
jest.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: jest.fn(() => Promise.resolve({ error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Sync Queue Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  describe('SyncQueueItem interface', () => {
    it('should define the correct shape for queue items', () => {
      const item: SyncQueueItem = {
        id: 'test-id',
        type: 'lesson_complete',
        payload: { lesson_id: 'lesson-1', completed_at: '2026-02-13T00:00:00Z' },
        createdAt: '2026-02-13T00:00:00Z',
        retryCount: 0,
      };

      expect(item.id).toBe('test-id');
      expect(item.type).toBe('lesson_complete');
      expect(item.retryCount).toBe(0);
    });
  });

  describe('addToSyncQueue', () => {
    it('should add an item to an empty queue', async () => {
      await addToSyncQueue({
        type: 'lesson_complete',
        payload: { lesson_id: 'lesson-1', completed_at: '2026-02-13T00:00:00Z' },
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        QUEUE_KEY,
        expect.any(String)
      );

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].type).toBe('lesson_complete');
      expect(savedData[0].retryCount).toBe(0);
      expect(savedData[0].id).toBeDefined();
      expect(savedData[0].createdAt).toBeDefined();
    });

    it('should append to an existing queue', async () => {
      const existingQueue: SyncQueueItem[] = [
        {
          id: 'existing-1',
          type: 'lesson_complete',
          payload: { lesson_id: 'lesson-1' },
          createdAt: '2026-02-13T00:00:00Z',
          retryCount: 0,
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingQueue));

      await addToSyncQueue({
        type: 'review_rating',
        payload: { word_id: 'word-1', rating: 3 },
      });

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(2);
      expect(savedData[0].type).toBe('lesson_complete');
      expect(savedData[1].type).toBe('review_rating');
    });

    it('should generate unique IDs for each item', async () => {
      await addToSyncQueue({
        type: 'lesson_complete',
        payload: { lesson_id: 'lesson-1' },
      });

      const firstSave = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(firstSave));

      await addToSyncQueue({
        type: 'lesson_complete',
        payload: { lesson_id: 'lesson-2' },
      });

      const secondSave = JSON.parse(mockAsyncStorage.setItem.mock.calls[1][1]);
      expect(secondSave[0].id).not.toBe(secondSave[1].id);
    });

    it('should handle corrupted queue data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid-json');

      await addToSyncQueue({
        type: 'lesson_complete',
        payload: { lesson_id: 'lesson-1' },
      });

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
    });
  });

  describe('getQueue', () => {
    it('should return an empty array when no queue exists', async () => {
      const queue = await getQueue();
      expect(queue).toEqual([]);
    });

    it('should return parsed queue items', async () => {
      const items: SyncQueueItem[] = [
        {
          id: 'item-1',
          type: 'lesson_complete',
          payload: { lesson_id: 'lesson-1' },
          createdAt: '2026-02-13T00:00:00Z',
          retryCount: 0,
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(items));

      const queue = await getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe('item-1');
    });

    it('should return empty array for corrupted data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('not-json');

      const queue = await getQueue();
      expect(queue).toEqual([]);
    });
  });

  describe('getFailedQueue', () => {
    it('should return an empty array when no failed queue exists', async () => {
      const queue = await getFailedQueue();
      expect(queue).toEqual([]);
    });

    it('should return parsed failed queue items', async () => {
      const items: SyncQueueItem[] = [
        {
          id: 'failed-1',
          type: 'review_rating',
          payload: { word_id: 'word-1', rating: 2 },
          createdAt: '2026-02-13T00:00:00Z',
          retryCount: 3,
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(items));

      const queue = await getFailedQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].retryCount).toBe(3);
    });
  });

  describe('clearQueue', () => {
    it('should remove the queue from storage', async () => {
      await clearQueue();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(QUEUE_KEY);
    });
  });

  describe('clearFailedQueue', () => {
    it('should remove the failed queue from storage', async () => {
      await clearFailedQueue();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(FAILED_QUEUE_KEY);
    });
  });

  describe('processSyncQueue', () => {
    it('should return zero counts for empty queue', async () => {
      const result = await processSyncQueue();
      expect(result).toEqual({ synced: 0, failed: 0 });
    });

    it('should process items and remove successful ones', async () => {
      const items: SyncQueueItem[] = [
        {
          id: 'item-1',
          type: 'lesson_complete',
          payload: { user_id: 'user-1', lesson_id: 'lesson-1', completed_at: '2026-02-13T00:00:00Z' },
          createdAt: '2026-02-13T00:00:00Z',
          retryCount: 0,
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(items));

      const result = await processSyncQueue();
      expect(result.synced).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(QUEUE_KEY);
    });

    it('should increment retry count on failure', async () => {
      const { supabase } = require('@/lib/api/supabase');
      supabase.from.mockReturnValue({
        upsert: jest.fn(() => Promise.resolve({ error: { message: 'Server error' } })),
      });

      const items: SyncQueueItem[] = [
        {
          id: 'item-1',
          type: 'lesson_complete',
          payload: { lesson_id: 'lesson-1', completed_at: '2026-02-13T00:00:00Z' },
          createdAt: '2026-02-13T00:00:00Z',
          retryCount: 0,
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(items));

      const result = await processSyncQueue();
      expect(result.failed).toBe(1);

      // Item should remain in queue with incremented retry count
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].retryCount).toBe(1);
    });

    it('should move to failed queue after MAX_RETRIES', async () => {
      const { supabase } = require('@/lib/api/supabase');
      supabase.from.mockReturnValue({
        upsert: jest.fn(() => Promise.resolve({ error: { message: 'Server error' } })),
      });

      const items: SyncQueueItem[] = [
        {
          id: 'item-1',
          type: 'lesson_complete',
          payload: { lesson_id: 'lesson-1', completed_at: '2026-02-13T00:00:00Z' },
          createdAt: '2026-02-13T00:00:00Z',
          retryCount: MAX_RETRIES - 1,
        },
      ];
      mockAsyncStorage.getItem.mockImplementation((key: string) => {
        if (key === QUEUE_KEY) return Promise.resolve(JSON.stringify(items));
        if (key === FAILED_QUEUE_KEY) return Promise.resolve(null);
        return Promise.resolve(null);
      });

      await processSyncQueue();

      // Should have saved to failed queue
      const failedQueueCall = mockAsyncStorage.setItem.mock.calls.find(
        (call: string[]) => call[0] === FAILED_QUEUE_KEY
      );
      expect(failedQueueCall).toBeDefined();
      const failedData = JSON.parse(failedQueueCall![1]);
      expect(failedData[0].retryCount).toBe(MAX_RETRIES);
    });

    it('should log to Sentry when item moves to failed queue', async () => {
      const Sentry = require('@/lib/utils/sentry');
      const { supabase } = require('@/lib/api/supabase');
      supabase.from.mockReturnValue({
        upsert: jest.fn(() => Promise.resolve({ error: { message: 'Server error' } })),
      });

      const items: SyncQueueItem[] = [
        {
          id: 'item-1',
          type: 'lesson_complete',
          payload: { lesson_id: 'lesson-1' },
          createdAt: '2026-02-13T00:00:00Z',
          retryCount: MAX_RETRIES - 1,
        },
      ];
      mockAsyncStorage.getItem.mockImplementation((key: string) => {
        if (key === QUEUE_KEY) return Promise.resolve(JSON.stringify(items));
        return Promise.resolve(null);
      });

      await processSyncQueue();

      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({ component: 'sync-queue' }),
        })
      );
    });

    it('should process review_rating items', async () => {
      const { supabase } = require('@/lib/api/supabase');
      supabase.from.mockReturnValue({
        upsert: jest.fn(() => Promise.resolve({ error: null })),
      });

      const items: SyncQueueItem[] = [
        {
          id: 'item-1',
          type: 'review_rating',
          payload: { user_id: 'user-1', word_id: 'word-1', rating: 3, reviewed_at: '2026-02-13T00:00:00Z' },
          createdAt: '2026-02-13T00:00:00Z',
          retryCount: 0,
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(items));

      const result = await processSyncQueue();
      expect(result.synced).toBe(1);
    });

    it('should process settings_update items', async () => {
      const { supabase } = require('@/lib/api/supabase');
      supabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      });

      const items: SyncQueueItem[] = [
        {
          id: 'item-1',
          type: 'settings_update',
          payload: { sound_enabled: false, user_id: 'user-1' },
          createdAt: '2026-02-13T00:00:00Z',
          retryCount: 0,
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(items));

      const result = await processSyncQueue();
      expect(result.synced).toBe(1);
    });
  });

  describe('Constants', () => {
    it('should export correct constants', () => {
      expect(QUEUE_KEY).toBe('sync_queue');
      expect(FAILED_QUEUE_KEY).toBe('sync_queue_failed');
      expect(MAX_RETRIES).toBe(3);
    });
  });
});
