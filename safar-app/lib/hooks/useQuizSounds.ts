/**
 * useQuizSounds Hook
 * Story 7.3 - Quiz sound effects controlled by useSettingsStore.soundEnabled
 * Pronunciation audio (useAudio hook) is NOT affected by this setting
 */

import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { useSettingsStore } from '@/lib/stores/useSettingsStore';

type SoundKey = 'select' | 'correct' | 'incorrect' | 'complete';

const SOUND_SOURCES: Record<SoundKey, any> = {
  select: require('@/assets/sounds/select.mp3'),
  correct: require('@/assets/sounds/correct.mp3'),
  incorrect: require('@/assets/sounds/incorrect.mp3'),
  complete: require('@/assets/sounds/complete.mp3'),
};

export function useQuizSounds() {
  const soundsRef = useRef<Map<SoundKey, Audio.Sound>>(new Map());
  const loadedRef = useRef(false);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);

  useEffect(() => {
    if (Platform.OS === 'web' || !soundEnabled) return;

    let mounted = true;
    const soundsMap = soundsRef.current;

    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });

        const entries = Object.entries(SOUND_SOURCES) as [SoundKey, any][];
        for (const [key, source] of entries) {
          if (!mounted) return;
          try {
            const { sound } = await Audio.Sound.createAsync(source);
            soundsMap.set(key, sound);
          } catch (e) {
            if (__DEV__) console.warn(`[useQuizSounds] Failed to load sound: ${key}`, e);
          }
        }
        if (mounted) loadedRef.current = true;
      } catch (e) {
        if (__DEV__) console.warn('[useQuizSounds] Audio mode setup failed', e);
      }
    };

    loadSounds();

    return () => {
      mounted = false;
      soundsMap.forEach((sound) => {
        sound.unloadAsync().catch(() => {});
      });
      soundsMap.clear();
      loadedRef.current = false;
    };
  }, [soundEnabled]);

  const play = useCallback(
    async (key: SoundKey) => {
      // Check current state at play-time for immediate response to setting changes
      const currentEnabled = useSettingsStore.getState().soundEnabled;
      if (Platform.OS === 'web' || !currentEnabled) return;
      const sound = soundsRef.current.get(key);
      if (!sound) return;
      try {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } catch (e) {
        if (__DEV__) console.warn(`[useQuizSounds] Playback failed: ${key}`, e);
      }
    },
    []
  );

  return {
    playSelect: useCallback(() => play('select'), [play]),
    playCorrect: useCallback(() => play('correct'), [play]),
    playIncorrect: useCallback(() => play('incorrect'), [play]),
    playComplete: useCallback(() => play('complete'), [play]),
  };
}
