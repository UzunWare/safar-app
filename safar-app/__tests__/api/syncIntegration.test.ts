/**
 * Tests for sync queue integration helpers
 * Story 7.6: Offline Sync Queue - Task 5
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import {
  queueLessonComplete,
  queueReviewRating,
  queueSettingsUpdate,
} from '@/lib/api/syncHelpers';
import { QUEUE_KEY } from '@/lib/api/sync';
import { act } from '@testing-library/react-native';

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
    })),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Sync Queue Integration Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);

    act(() => {
      useSyncStore.setState({
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncedAt: null,
        showSyncSuccess: false,
      });
    });
  });

  describe('queueLessonComplete', () => {
    it('should add lesson completion to the sync queue', async () => {
      await queueLessonComplete('user-1', 'lesson-1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        QUEUE_KEY,
        expect.any(String)
      );

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].type).toBe('lesson_complete');
      expect(savedData[0].payload.user_id).toBe('user-1');
      expect(savedData[0].payload.lesson_id).toBe('lesson-1');
      expect(savedData[0].payload.completed_at).toBeDefined();
    });

    it('should increment the pending count in the store', async () => {
      await queueLessonComplete('user-1', 'lesson-1');
      expect(useSyncStore.getState().pendingCount).toBe(1);
    });
  });

  describe('queueReviewRating', () => {
    it('should add review rating to the sync queue', async () => {
      await queueReviewRating('user-1', 'word-1', 3);

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].type).toBe('review_rating');
      expect(savedData[0].payload.user_id).toBe('user-1');
      expect(savedData[0].payload.word_id).toBe('word-1');
      expect(savedData[0].payload.rating).toBe(3);
    });

    it('should increment the pending count in the store', async () => {
      await queueReviewRating('user-1', 'word-1', 3);
      expect(useSyncStore.getState().pendingCount).toBe(1);
    });
  });

  describe('queueSettingsUpdate', () => {
    it('should add settings update to the sync queue', async () => {
      await queueSettingsUpdate('user-1', { sound_enabled: false });

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].type).toBe('settings_update');
      expect(savedData[0].payload.user_id).toBe('user-1');
      expect(savedData[0].payload.sound_enabled).toBe(false);
    });

    it('should increment the pending count in the store', async () => {
      await queueSettingsUpdate('user-1', { sound_enabled: false });
      expect(useSyncStore.getState().pendingCount).toBe(1);
    });
  });

  describe('multiple queued items', () => {
    it('should accumulate pending count across different operations', async () => {
      await queueLessonComplete('user-1', 'lesson-1');

      // Mock getItem to return the first item for the second call
      const firstSave = mockAsyncStorage.setItem.mock.calls[0][1];
      mockAsyncStorage.getItem.mockResolvedValue(firstSave);

      await queueReviewRating('user-1', 'word-1', 3);

      expect(useSyncStore.getState().pendingCount).toBe(2);
    });
  });
});
