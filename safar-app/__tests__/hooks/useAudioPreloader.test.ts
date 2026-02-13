/**
 * useAudioPreloader Hook Tests
 * Story 3.4: Audio Pronunciation Playback - Task 8
 */

import { renderHook, act } from '@testing-library/react-native';
import { Audio } from 'expo-av';

const mockCreateAsync = Audio.Sound.createAsync as jest.Mock;

describe('useAudioPreloader Hook', () => {
  let mockSound: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear shared audio cache between tests
    const { clearCache } = require('@/lib/hooks/audioCache');
    clearCache();

    mockSound = {
      unloadAsync: jest.fn(() => Promise.resolve()),
      getStatusAsync: jest.fn(() => Promise.resolve({ isLoaded: true })),
    };

    mockCreateAsync.mockResolvedValue({
      sound: mockSound,
      status: { isLoaded: true },
    });
  });

  describe('Task 8: Audio preloading', () => {
    it('preloads audio for words with audio URLs', async () => {
      const { useAudioPreloader } = require('@/lib/hooks/useAudioPreloader');
      const words = [
        { id: '1', audio_url: 'https://example.com/a.mp3' },
        { id: '2', audio_url: 'https://example.com/b.mp3' },
      ];

      renderHook(() => useAudioPreloader(words, 0));

      // Allow async preloading to run
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(mockCreateAsync).toHaveBeenCalledWith(
        { uri: 'https://example.com/a.mp3' },
        { shouldPlay: false }
      );
      expect(mockCreateAsync).toHaveBeenCalledWith(
        { uri: 'https://example.com/b.mp3' },
        { shouldPlay: false }
      );
    });

    it('preloads only upcoming words from current index', async () => {
      const { useAudioPreloader } = require('@/lib/hooks/useAudioPreloader');
      const words = [
        { id: '1', audio_url: 'https://example.com/a.mp3' },
        { id: '2', audio_url: 'https://example.com/b.mp3' },
        { id: '3', audio_url: 'https://example.com/c.mp3' },
        { id: '4', audio_url: 'https://example.com/d.mp3' },
        { id: '5', audio_url: 'https://example.com/e.mp3' },
      ];

      // Start at index 2, should preload indices 2, 3, 4 (3 ahead)
      renderHook(() => useAudioPreloader(words, 2));

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(mockCreateAsync).toHaveBeenCalledTimes(3);
      expect(mockCreateAsync).toHaveBeenCalledWith(
        { uri: 'https://example.com/c.mp3' },
        { shouldPlay: false }
      );
    });

    it('skips words without audio URLs', async () => {
      const { useAudioPreloader } = require('@/lib/hooks/useAudioPreloader');
      const words = [
        { id: '1', audio_url: 'https://example.com/a.mp3' },
        { id: '2', audio_url: null },
        { id: '3', audio_url: 'https://example.com/c.mp3' },
      ];

      renderHook(() => useAudioPreloader(words, 0));

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      // Only 2 words have audio URLs
      expect(mockCreateAsync).toHaveBeenCalledTimes(2);
    });

    it('handles empty words array', async () => {
      const { useAudioPreloader } = require('@/lib/hooks/useAudioPreloader');
      renderHook(() => useAudioPreloader([], 0));

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(mockCreateAsync).not.toHaveBeenCalled();
    });

    it('handles preload errors gracefully', async () => {
      mockCreateAsync.mockRejectedValueOnce(new Error('Network error'));

      const { useAudioPreloader } = require('@/lib/hooks/useAudioPreloader');
      const words = [{ id: '1', audio_url: 'https://example.com/a.mp3' }];

      // Should not throw
      renderHook(() => useAudioPreloader(words, 0));

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });
    });

    it('cleans up preloaded sounds on unmount', async () => {
      const { useAudioPreloader } = require('@/lib/hooks/useAudioPreloader');
      const words = [{ id: '1', audio_url: 'https://example.com/a.mp3' }];

      const { unmount } = renderHook(() => useAudioPreloader(words, 0));

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      unmount();

      expect(mockSound.unloadAsync).toHaveBeenCalled();
    });

    it('stores preloaded sounds in shared cache', async () => {
      const { useAudioPreloader } = require('@/lib/hooks/useAudioPreloader');
      const { getCachedSound } = require('@/lib/hooks/audioCache');
      const words = [{ id: '1', audio_url: 'https://example.com/a.mp3' }];

      renderHook(() => useAudioPreloader(words, 0));

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(getCachedSound('https://example.com/a.mp3')).toBeTruthy();
    });

    it('does not re-create sounds already in cache', async () => {
      const { useAudioPreloader } = require('@/lib/hooks/useAudioPreloader');
      const { setCachedSound } = require('@/lib/hooks/audioCache');

      // Pre-populate cache
      const existingSound = { unloadAsync: jest.fn() };
      setCachedSound('https://example.com/a.mp3', existingSound);

      const words = [{ id: '1', audio_url: 'https://example.com/a.mp3' }];

      renderHook(() => useAudioPreloader(words, 0));

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      // Should not have called createAsync since URL was already cached
      expect(mockCreateAsync).not.toHaveBeenCalled();
    });

    it('removes sounds from cache on cleanup', async () => {
      const { useAudioPreloader } = require('@/lib/hooks/useAudioPreloader');
      const { getCachedSound } = require('@/lib/hooks/audioCache');
      const words = [{ id: '1', audio_url: 'https://example.com/a.mp3' }];

      const { unmount } = renderHook(() => useAudioPreloader(words, 0));

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      // Sound should be in cache before unmount
      expect(getCachedSound('https://example.com/a.mp3')).toBeTruthy();

      unmount();

      // Sound should be removed from cache after unmount
      expect(getCachedSound('https://example.com/a.mp3')).toBeUndefined();
    });
  });
});
