/**
 * useAudio Hook
 * Story 3.4: Audio Pronunciation Playback
 *
 * Manages audio playback for word pronunciation.
 * Handles play, stop, replay, error states, and cleanup.
 * Checks shared audio cache for preloaded sounds before loading fresh.
 */

import { Audio } from 'expo-av';
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Sentry from '@/lib/utils/sentry';
import { getCachedSound, removeCachedSound } from './audioCache';
import { timeouts } from '@/constants/timeouts';

export interface UseAudioReturn {
  play: () => Promise<void>;
  stop: () => Promise<void>;
  isLoading: boolean;
  isPlaying: boolean;
  isError: boolean;
}

export function useAudio(audioUrl: string | null): UseAudioReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isError, setIsError] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const play = useCallback(async () => {
    if (!audioUrl) return;

    try {
      setIsLoading(true);
      setIsError(false);

      // Stop and unload existing sound (replay behavior)
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch {
          // Sound may already be unloaded
        }
      }

      // Check shared cache for preloaded sound
      let newSound: Audio.Sound;
      const cached = getCachedSound(audioUrl);

      if (cached) {
        removeCachedSound(audioUrl);
        newSound = cached as Audio.Sound;
        await newSound.setPositionAsync(0);
        await newSound.playAsync();
      } else {
        // Load and play new sound
        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl }, { shouldPlay: true });
        newSound = sound;
      }

      soundRef.current = newSound;
      setIsPlaying(true);
      setIsLoading(false);

      // Handle playback completion
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch {
      setIsError(true);
      setIsLoading(false);
      setIsPlaying(false);
      Sentry.captureException(new Error('Audio playback failed'));

      // Clear error state after timeout (tracked for cleanup)
      errorTimeoutRef.current = setTimeout(() => setIsError(false), timeouts.ui.audioErrorClear);
    }
  }, [audioUrl]);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch {
        // Sound may already be unloaded
      }
      setIsPlaying(false);
    }
  }, []);

  return { play, stop, isLoading, isPlaying, isError };
}
