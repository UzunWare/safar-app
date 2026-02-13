import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFeedbackPreferences } from './useFeedbackPreferences';

export function useHaptics() {
  const { hapticFeedbackEnabled, loaded } = useFeedbackPreferences();

  const success = useCallback(() => {
    if (Platform.OS === 'web' || !loaded || !hapticFeedbackEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [hapticFeedbackEnabled, loaded]);

  const error = useCallback(() => {
    if (Platform.OS === 'web' || !loaded || !hapticFeedbackEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [hapticFeedbackEnabled, loaded]);

  const light = useCallback(() => {
    if (Platform.OS === 'web' || !loaded || !hapticFeedbackEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [hapticFeedbackEnabled, loaded]);

  return { success, error, light };
}
