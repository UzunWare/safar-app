/**
 * AudioButton Component
 * Story 3.4: Audio Pronunciation Playback
 *
 * Renders an audio playback button with idle/loading/playing/error/disabled states.
 * Uses Divine Geometry design system (emerald deep bg, gold icon).
 * Premium: gold pulsing ring during playback.
 */

import { View, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Volume2, VolumeX } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAudio } from '@/lib/hooks/useAudio';
import '@/global.css';

export interface AudioButtonProps {
  audioUrl: string | null;
  onPlay?: () => void;
  size?: number;
}

/** Gold pulsing ring that expands outward during audio playback */
function PulsingRing({ size }: { size: number }) {
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.5, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    ),
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1.4, { duration: 600, easing: Easing.out(Easing.ease) }),
            withTiming(1.4, { duration: 600 })
          ),
          -1,
          false
        ),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: colors.gold,
        },
        pulseStyle,
      ]}
    />
  );
}

export function AudioButton({ audioUrl, onPlay, size = 48 }: AudioButtonProps) {
  const { play, isLoading, isPlaying, isError } = useAudio(audioUrl);
  const isDisabled = !audioUrl;

  const handlePress = async () => {
    if (isDisabled) return;
    onPlay?.();
    await play();
  };

  const accessibilityLabel = isDisabled
    ? 'Audio unavailable'
    : isError
      ? 'Audio error'
      : isPlaying
        ? 'Playing pronunciation'
        : 'Play pronunciation';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {isPlaying && <PulsingRing size={size} />}
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isError ? colors.gold : colors.emeraldDeep,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isError ? 0.8 : isDisabled ? 0.3 : 1,
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: isDisabled }}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.gold} />
        ) : isError ? (
          <VolumeX size={20} color={colors.emeraldDeep} />
        ) : (
          <Volume2 size={20} color={colors.gold} />
        )}
      </Pressable>
    </View>
  );
}
