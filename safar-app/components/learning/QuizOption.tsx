import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Check, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useReducedMotionPreference } from '@/lib/hooks/useReducedMotionPreference';

export type QuizOptionState = 'normal' | 'selected' | 'correct' | 'incorrect' | 'revealed';

interface QuizOptionProps {
  text: string;
  label?: string;
  state: QuizOptionState;
  onPress: () => void;
  disabled: boolean;
  testID?: string;
}

/**
 * State styles — matches prototype's quiz option pattern:
 * Default: subtle border, clean bg
 * Selected: solid gold fill (bg-[#cfaa6b] border-[#cfaa6b] text-[#0f2e28])
 * Incorrect: red tint (bg-red-500/20 border-red-500)
 */
const stateStyles: Record<
  QuizOptionState,
  {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    labelColor: string;
    shadowColor?: string;
    shadowOpacity?: number;
    shadowRadius?: number;
  }
> = {
  normal: {
    backgroundColor: '#ffffff',
    borderColor: colors.goldAlpha[20],
    textColor: colors.emeraldDeep,
    labelColor: colors.gold,
  },
  selected: {
    backgroundColor: '#f7f1e4',
    borderColor: colors.emeraldDeep,
    textColor: colors.emeraldDeep,
    labelColor: colors.emeraldDeep,
    shadowColor: colors.emeraldDeep,
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  correct: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
    textColor: colors.emeraldDeep,
    labelColor: 'rgba(15, 46, 40, 0.6)',
    shadowColor: colors.gold,
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  incorrect: {
    backgroundColor: '#f8eaea',
    borderColor: colors.rating.again,
    textColor: '#6d2121',
    labelColor: '#6d2121',
  },
  revealed: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
    textColor: colors.emeraldDeep,
    labelColor: colors.emeraldDeep,
  },
};

export function QuizOption({ text, label, state, onPress, disabled, testID }: QuizOptionProps) {
  const style = stateStyles[state];
  const reducedMotion = useReducedMotionPreference();

  // Shake animation for incorrect answers
  const shakeX = useSharedValue(0);
  // Scale animation for tap feedback
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      scale.value = 1;
      shakeX.value = 0;
      return;
    }

    if (state === 'selected') {
      scale.value = withSpring(1.04, { damping: 12, stiffness: 180 });
    } else if (state === 'incorrect') {
      scale.value = withTiming(1, { duration: 100 });
      shakeX.value = withSequence(
        withTiming(10, { duration: 60 }),
        withTiming(-10, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(4, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [state, shakeX, scale, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !reducedMotion) {
      scale.value = withTiming(0.97, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !reducedMotion) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  };

  const isSelectedState = state === 'selected' || state === 'correct' || state === 'incorrect';
  const statusSuffix =
    state === 'correct'
      ? ' Correct answer.'
      : state === 'incorrect'
        ? ' Incorrect answer.'
        : state === 'revealed'
          ? ' Correct answer.'
          : state === 'selected'
            ? ' Selected.'
            : '';
  const rightIndicator =
    state === 'selected'
      ? {
          icon: 'check' as const,
          iconColor: colors.emeraldDeep,
          backgroundColor: 'rgba(15, 46, 40, 0.08)',
          borderColor: colors.emeraldDeep,
        }
      : state === 'incorrect'
        ? {
            icon: 'x' as const,
            iconColor: '#ffffff',
            backgroundColor: '#8c2f2f',
            borderColor: '#6d2121',
          }
        : state === 'revealed'
          ? {
              icon: 'check' as const,
              iconColor: colors.emeraldDeep,
              backgroundColor: 'rgba(207, 170, 107, 0.35)',
              borderColor: colors.gold,
            }
          : state === 'correct'
            ? {
                icon: 'check' as const,
                iconColor: colors.emeraldDeep,
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderColor: 'rgba(15, 46, 40, 0.25)',
              }
            : null;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        testID={testID}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: isSelectedState }}
        accessibilityLabel={`${label ? `${label}. ` : ''}${text}${statusSuffix}`}
        accessibilityHint={disabled ? undefined : 'Double tap to select this answer'}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: 14,
          borderWidth: state === 'selected' ? 3 : 1,
          minHeight: 56,
          backgroundColor:
            pressed && !disabled && state === 'normal'
              ? colors.goldAlpha[10]
              : style.backgroundColor,
          borderColor:
            pressed && !disabled && state === 'normal' ? colors.goldAlpha[30] : style.borderColor,
          opacity: disabled && state === 'normal' ? 0.45 : 1,
          shadowColor: style.shadowColor || 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: style.shadowOpacity || 0,
          shadowRadius: style.shadowRadius || 0,
          elevation: state === 'correct' || state === 'selected' ? 6 : 0,
        })}>
        <View
          style={{
            width: 24,
            height: 24,
            marginRight: 10,
            marginTop: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {rightIndicator && (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: rightIndicator.borderColor,
                backgroundColor: rightIndicator.backgroundColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {rightIndicator.icon === 'x' ? (
                <X size={14} color={rightIndicator.iconColor} strokeWidth={3} />
              ) : (
                <Check size={14} color={rightIndicator.iconColor} strokeWidth={3} />
              )}
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 18,
              lineHeight: 24,
              color: style.textColor,
            }}>
            {label && (
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: style.labelColor,
                  letterSpacing: 0.5,
                }}>
                {label}
                {'   '}
              </Text>
            )}
            {text}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
