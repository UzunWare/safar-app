import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SOUND_EFFECTS_KEY = 'preferences.soundEffects';
const HAPTIC_FEEDBACK_KEY = 'preferences.hapticFeedback';

function parseBoolean(raw: string | null, fallback: boolean): boolean {
  if (raw === null) return fallback;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

interface FeedbackPreferencesState {
  soundEffectsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  loaded: boolean;
}

export function useFeedbackPreferences() {
  const [state, setState] = useState<FeedbackPreferencesState>({
    soundEffectsEnabled: true,
    hapticFeedbackEnabled: true,
    loaded: Platform.OS === 'web',
  });

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let mounted = true;

    Promise.all([
      AsyncStorage.getItem(SOUND_EFFECTS_KEY),
      AsyncStorage.getItem(HAPTIC_FEEDBACK_KEY),
    ])
      .then(([soundRaw, hapticRaw]) => {
        if (!mounted) return;
        setState({
          soundEffectsEnabled: parseBoolean(soundRaw, true),
          hapticFeedbackEnabled: parseBoolean(hapticRaw, true),
          loaded: true,
        });
      })
      .catch(() => {
        if (!mounted) return;
        setState((prev) => ({ ...prev, loaded: true }));
      });

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
