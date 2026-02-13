/**
 * ProgressDot - Animated 3-state progress indicator
 * Extracted from learn.tsx for shared use across Home + Learn tabs.
 * States: completed (gold), active (white with ping), locked (dim).
 */

import { useState, useEffect } from 'react';
import { View, AccessibilityInfo } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';

interface ProgressDotProps {
  state: 'completed' | 'active' | 'locked';
}

export function ProgressDot({ state }: ProgressDotProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  const pingStyle = useAnimatedStyle(() => {
    if (state !== 'active' || reduceMotion) {
      return { opacity: 0, transform: [{ scale: 1 }] };
    }
    return {
      opacity: withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      ),
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1.8, { duration: 800, easing: Easing.out(Easing.ease) }),
              withTiming(1.8, { duration: 800 })
            ),
            -1,
            false
          ),
        },
      ],
    };
  });

  const dotSize = state === 'active' ? 14 : state === 'completed' ? 12 : 10;
  const bgColor =
    state === 'completed'
      ? colors.gold
      : state === 'active'
        ? '#ffffff'
        : 'rgba(255, 255, 255, 0.15)';

  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
      {state === 'active' && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: '#ffffff',
            },
            pingStyle,
          ]}
        />
      )}
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: bgColor,
          ...(state === 'active' && {
            shadowColor: '#ffffff',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 4,
          }),
        }}
      />
    </View>
  );
}
