/**
 * useAudioPreloader Hook
 * Story 3.4: Audio Pronunciation Playback - Task 8
 *
 * Preloads audio for upcoming words in a lesson to reduce
 * playback latency. Stores preloaded sounds in shared cache
 * for useAudio to consume, achieving <500ms playback target.
 */

import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { setCachedSound, getCachedSound, removeCachedSound } from './audioCache';

interface PreloadableWord {
  id: string;
  audio_url: string | null;
}

const PRELOAD_AHEAD = 3;

export function useAudioPreloader(words: PreloadableWord[], currentIndex: number) {
  const preloadedUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const preload = async () => {
      // Clean up previously preloaded sounds that weren't consumed by useAudio
      for (const url of preloadedUrlsRef.current) {
        const sound = getCachedSound(url);
        if (sound) {
          removeCachedSound(url);
          try {
            await sound.unloadAsync();
          } catch {
            // Ignore cleanup errors
          }
        }
      }
      preloadedUrlsRef.current = [];

      const toPreload = words
        .slice(currentIndex, currentIndex + PRELOAD_AHEAD)
        .filter((w) => w.audio_url);

      for (const word of toPreload) {
        // Skip if already in cache (consumed sounds are removed, so this avoids duplicates)
        if (getCachedSound(word.audio_url!)) continue;

        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: word.audio_url! },
            { shouldPlay: false }
          );
          setCachedSound(word.audio_url!, sound);
          preloadedUrlsRef.current.push(word.audio_url!);
        } catch {
          // Silently skip failed preloads
        }
      }
    };

    preload();

    return () => {
      for (const url of preloadedUrlsRef.current) {
        const sound = getCachedSound(url);
        if (sound) {
          removeCachedSound(url);
          try {
            sound.unloadAsync();
          } catch {
            // Ignore cleanup errors
          }
        }
      }
      preloadedUrlsRef.current = [];
    };
  }, [words, currentIndex]);
}
