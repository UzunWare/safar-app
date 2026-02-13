/**
 * ProgressRing - SVG circular progress indicator
 * Divine Geometry design — gold ring on emerald/parchment
 * Story 5.1 - Task 2
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = colors.gold,
  trackColor = 'rgba(15, 46, 40, 0.08)',
  label = 'Complete',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percentage, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentage, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (progress.value / 100) * circumference,
  }));

  return (
    <View testID="progress-ring" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: fonts.fraunces,
            fontSize: size * 0.22,
            color: colors.emeraldDeep,
          }}>
          {percentage}%
        </Text>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'rgba(15, 46, 40, 0.5)',
          }}>
          {label}
        </Text>
      </View>
    </View>
  );
}
