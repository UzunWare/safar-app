import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Star } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useReducedMotionPreference } from '@/lib/hooks/useReducedMotionPreference';

interface StarRatingProps {
  percentage: number;
}

export function getStarCount(percentage: number): number {
  if (percentage >= 100) return 3;
  if (percentage >= 80) return 2;
  return 1;
}

function AnimatedStar({
  filled,
  delay,
  reducedMotion,
}: {
  filled: boolean;
  delay: number;
  reducedMotion: boolean;
}) {
  const scale = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      scale.value = withTiming(filled ? 1 : 0, { duration: 0 });
      return;
    }

    if (filled) {
      scale.value = withDelay(delay, withSpring(1, { damping: 8, stiffness: 120 }));
    }
  }, [filled, delay, scale, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  if (!filled) {
    return (
      <View style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}>
        <Star size={32} color={colors.white[20]} />
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
        animatedStyle,
      ]}>
      <Star size={32} color={colors.gold} fill={colors.gold} />
    </Animated.View>
  );
}

export function StarRating({ percentage }: StarRatingProps) {
  const starCount = getStarCount(percentage);
  const reducedMotion = useReducedMotionPreference();

  return (
    <View
      testID="quiz-star-rating"
      accessibilityRole="image"
      accessibilityLabel={`${starCount} out of 3 stars`}
      style={{
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 16,
      }}>
      <AnimatedStar filled={starCount >= 1} delay={300} reducedMotion={reducedMotion} />
      <AnimatedStar filled={starCount >= 2} delay={600} reducedMotion={reducedMotion} />
      <AnimatedStar filled={starCount >= 3} delay={900} reducedMotion={reducedMotion} />
    </View>
  );
}
