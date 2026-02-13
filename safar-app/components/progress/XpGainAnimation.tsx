/**
 * XpGainAnimation - Floating "+X XP" animation
 * Animates upward and fades out after 1 second.
 * Story 5.4 - Task 4
 */

import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface XpGainAnimationProps {
  amount: number;
  onComplete?: () => void;
}

export function XpGainAnimation({ amount, onComplete }: XpGainAnimationProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-50, { duration: 1000 });
    opacity.value = withDelay(500, withTiming(0, { duration: 500 }));

    const timeout = setTimeout(() => {
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [onComplete, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      testID="xp-gain-animation"
      style={[
        {
          position: 'absolute',
          alignItems: 'center',
          alignSelf: 'center',
        },
        animatedStyle,
      ]}>
      <Text
        style={{
          fontFamily: fonts.fraunces,
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.gold,
        }}>
        +{amount} XP
      </Text>
    </Animated.View>
  );
}
