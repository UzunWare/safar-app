/**
 * useAudio Hook Tests
 * Story 3.4: Audio Pronunciation Playback
 */

import { renderHook, act } from '@testing-library/react-native';
import { Audio } from 'expo-av';

// Get mock references
const mockSetAudioModeAsync = Audio.setAudioModeAsync as jest.Mock;
const mockCreateAsync = Audio.Sound.createAsync as jest.Mock;

describe('useAudio Hook', () => {
  let mockSound: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Clear shared audio cache between tests
    const { clearCache } = require('@/lib/hooks/audioCache');
    clearCache();

    mockSound = {
      playAsync: jest.fn(() => Promise.resolve()),
      stopAsync: jest.fn(() => Promise.resolve()),
      unloadAsync: jest.fn(() => Promise.resolve()),
      setOnPlaybackStatusUpdate: jest.fn(),
      getStatusAsync: jest.fn(() => Promise.resolve({ isLoaded: true, isPlaying: false })),
      setPositionAsync: jest.fn(() => Promise.resolve()),
    };

    mockCreateAsync.mockResolvedValue({
      sound: mockSound,
      status: { isLoaded: true },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Task 1: Audio mode configuration
  describe('Task 1: Audio mode setup', () => {
    it('configures audio mode with playsInSilentModeIOS on mount', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      renderHook(() => useAudio('https://example.com/audio.mp3'));

      expect(mockSetAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          playsInSilentModeIOS: true,
        })
      );
    });

    it('configures staysActiveInBackground to false', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      renderHook(() => useAudio('https://example.com/audio.mp3'));

      expect(mockSetAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          staysActiveInBackground: false,
        })
      );
    });

    it('configures shouldDuckAndroid to true', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      renderHook(() => useAudio('https://example.com/audio.mp3'));

      expect(mockSetAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          shouldDuckAndroid: true,
        })
      );
    });
  });

  // Task 2: Play/stop/replay management
  describe('Task 2: Sound instance management', () => {
    it('returns initial state as idle', () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('creates and plays sound when play is called', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      expect(mockCreateAsync).toHaveBeenCalledWith(
        { uri: 'https://example.com/audio.mp3' },
        { shouldPlay: true }
      );
    });

    it('sets isPlaying to true during playback', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);
    });

    it('stops sound when stop is called', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      await act(async () => {
        await result.current.stop();
      });

      expect(mockSound.stopAsync).toHaveBeenCalled();
      expect(result.current.isPlaying).toBe(false);
    });

    it('does nothing when play is called with null URL', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio(null));

      await act(async () => {
        await result.current.play();
      });

      expect(mockCreateAsync).not.toHaveBeenCalled();
    });

    it('registers playback status callback', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      expect(mockSound.setOnPlaybackStatusUpdate).toHaveBeenCalledWith(expect.any(Function));
    });

    it('sets isPlaying to false when playback finishes', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      // Simulate playback completion
      const statusCallback = mockSound.setOnPlaybackStatusUpdate.mock.calls[0][0];
      await act(async () => {
        statusCallback({ isLoaded: true, didJustFinish: true });
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  // Task 5: Replay behavior
  describe('Task 5: Replay behavior', () => {
    it('stops and unloads existing sound before replaying', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      // First play
      await act(async () => {
        await result.current.play();
      });

      // Second play (replay)
      await act(async () => {
        await result.current.play();
      });

      expect(mockSound.stopAsync).toHaveBeenCalled();
      expect(mockSound.unloadAsync).toHaveBeenCalled();
      expect(mockCreateAsync).toHaveBeenCalledTimes(2);
    });
  });

  // Task 7: Error handling
  describe('Task 7: Error handling', () => {
    it('sets isError on network failure', async () => {
      mockCreateAsync.mockRejectedValueOnce(new Error('Network error'));

      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('clears error state after 2 seconds', async () => {
      mockCreateAsync.mockRejectedValueOnce(new Error('Network error'));

      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      expect(result.current.isError).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.isError).toBe(false);
    });

    it('does not crash on missing audio file', async () => {
      mockCreateAsync.mockRejectedValueOnce(new Error('File not found'));

      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/missing.mp3'));

      await act(async () => {
        await result.current.play();
      });

      expect(result.current.isError).toBe(true);
      // Should not throw
    });

    it('sends sanitized error to Sentry (no PII)', async () => {
      mockCreateAsync.mockRejectedValueOnce(new Error('Network error'));
      const Sentry = require('@/lib/utils/sentry');

      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Audio playback failed' })
      );
    });

    it('stop handles errors gracefully when sound is unloaded', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      // Make stopAsync throw (simulating already-unloaded sound)
      mockSound.stopAsync.mockRejectedValueOnce(new Error('Already unloaded'));

      // Should not throw
      await act(async () => {
        await result.current.stop();
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  // Cache integration
  describe('Cache integration', () => {
    it('reuses preloaded sound from cache instead of creating new', async () => {
      const { setCachedSound } = require('@/lib/hooks/audioCache');
      const cachedSound = {
        playAsync: jest.fn(() => Promise.resolve()),
        stopAsync: jest.fn(() => Promise.resolve()),
        unloadAsync: jest.fn(() => Promise.resolve()),
        setOnPlaybackStatusUpdate: jest.fn(),
        setPositionAsync: jest.fn(() => Promise.resolve()),
      };
      setCachedSound('https://example.com/audio.mp3', cachedSound);

      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      // Should NOT create new sound
      expect(mockCreateAsync).not.toHaveBeenCalled();
      // Should reuse cached sound
      expect(cachedSound.setPositionAsync).toHaveBeenCalledWith(0);
      expect(cachedSound.playAsync).toHaveBeenCalled();
    });

    it('falls back to createAsync when cache is empty', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      expect(mockCreateAsync).toHaveBeenCalledWith(
        { uri: 'https://example.com/audio.mp3' },
        { shouldPlay: true }
      );
    });
  });

  // Cleanup
  describe('Cleanup', () => {
    it('unloads sound on unmount', async () => {
      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result, unmount } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      unmount();

      expect(mockSound.unloadAsync).toHaveBeenCalled();
    });

    it('clears error timeout on unmount', async () => {
      mockCreateAsync.mockRejectedValueOnce(new Error('Network error'));

      const { useAudio } = require('@/lib/hooks/useAudio');
      const { result, unmount } = renderHook(() => useAudio('https://example.com/audio.mp3'));

      await act(async () => {
        await result.current.play();
      });

      expect(result.current.isError).toBe(true);

      // Unmount before timer fires - should not cause state update warning
      unmount();

      // Advance timer after unmount — no state update should occur
      jest.advanceTimersByTime(2000);
    });
  });
});
