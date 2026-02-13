import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Check, X, Flame } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useReducedMotionPreference } from '@/lib/hooks/useReducedMotionPreference';
import { ContinueActionButton } from '@/components/learning/ContinueActionButton';

interface FeedbackBannerProps {
  isCorrect: boolean;
  correctAnswer?: string;
  selectedAnswer?: string;
  onContinue: () => void;
  visible: boolean;
  streakMilestone?: number | null;
  placement?: 'inline' | 'docked';
  continueLabel?: string;
  showContinueButton?: boolean;
}

export function FeedbackBanner({
  isCorrect,
  correctAnswer,
  selectedAnswer,
  onContinue,
  visible,
  streakMilestone = null,
  placement = 'inline',
  continueLabel = 'CONTINUE',
  showContinueButton = true,
}: FeedbackBannerProps) {
  const reducedMotion = useReducedMotionPreference();
  const hiddenOffset = placement === 'docked' ? 300 : 20;
  const translateY = useSharedValue(hiddenOffset);
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      if (reducedMotion) {
        translateY.value = withTiming(0, { duration: 0 });
        iconScale.value = withTiming(1, { duration: 0 });
        iconRotate.value = withTiming(0, { duration: 0 });
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
        iconScale.value = withDelay(150, withSpring(1, { damping: 10, stiffness: 300 }));
        if (isCorrect) {
          iconRotate.value = withDelay(
            150,
            withSequence(
              withTiming(-8, { duration: 100 }),
              withSpring(0, { damping: 8, stiffness: 200 })
            )
          );
        }
      }
    } else {
      translateY.value = withTiming(hiddenOffset, { duration: reducedMotion ? 0 : 120 });
      iconScale.value = withTiming(0, { duration: reducedMotion ? 0 : 120 });
      iconRotate.value = withTiming(0, { duration: reducedMotion ? 0 : 120 });
    }
  }, [hiddenOffset, iconRotate, iconScale, isCorrect, reducedMotion, translateY, visible]);

  const bannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }, { rotate: `${iconRotate.value}deg` }],
  }));

  if (!visible) return null;
  const isDocked = placement === 'docked';

  const containerPlacementStyle = isDocked
    ? {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 24,
        paddingBottom: 44,
        paddingHorizontal: 24,
        borderTopWidth: 3,
        borderTopColor: isCorrect ? 'rgba(255, 255, 255, 0.25)' : colors.rating.again,
      }
    : {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: isCorrect ? 0 : 1.5,
        borderColor: colors.rating.again,
      };

  return (
    <Animated.View
      testID={isCorrect ? 'quiz-feedback-correct' : 'quiz-feedback-incorrect'}
      accessibilityLiveRegion="polite"
      accessibilityLabel={
        isCorrect
          ? streakMilestone
            ? `Correct! ${streakMilestone} in a row!`
            : 'Correct!'
          : `Not quite. You selected ${selectedAnswer || 'an option'}. The correct answer is ${correctAnswer || 'shown above'}`
      }
      style={[
        {
          backgroundColor: isCorrect ? colors.gold : colors.emeraldDeep,
          shadowColor: isCorrect ? colors.gold : '#000',
          shadowOffset: { width: 0, height: isDocked ? -4 : 2 },
          shadowOpacity: isDocked ? (isCorrect ? 0.25 : 0.4) : 0.08,
          shadowRadius: isDocked ? 16 : 6,
          elevation: isDocked ? 12 : 2,
        },
        containerPlacementStyle,
        bannerStyle,
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <Animated.View
          style={[
            {
              width: 44,
              height: 44,
              borderRadius: 22,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 14,
              backgroundColor: isCorrect ? colors.emeraldDeep : colors.rating.again,
            },
            iconStyle,
          ]}>
          {isCorrect ? (
            <Check size={22} color={colors.gold} strokeWidth={3} />
          ) : (
            <X size={22} color="#ffffff" strokeWidth={3} />
          )}
        </Animated.View>

        <Text
          style={{
            fontFamily: fonts.fraunces,
            fontSize: 20,
            fontWeight: '600',
            color: isCorrect ? colors.emeraldDeep : colors.cream,
          }}>
          {isCorrect ? 'Correct!' : 'Not quite'}
        </Text>
      </View>

      {isCorrect && streakMilestone && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 58,
            marginBottom: 10,
          }}>
          <Flame size={16} color={colors.emeraldDeep} />
          <Text
            testID="quiz-streak-milestone"
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(15, 46, 40, 0.7)',
              fontWeight: '700',
              marginLeft: 6,
            }}>
            {streakMilestone} in a row!
          </Text>
        </View>
      )}

      {(selectedAnswer || correctAnswer) && (
        <View
          style={{
            marginLeft: 58,
            marginBottom: 16,
            padding: 12,
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            gap: 8,
          }}>
          {selectedAnswer && (
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: isCorrect
                    ? 'rgba(15, 46, 40, 0.14)'
                    : 'rgba(255, 255, 255, 0.1)',
                  marginRight: 8,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 10,
                    letterSpacing: 0.7,
                    textTransform: 'uppercase',
                    color: isCorrect ? 'rgba(15, 46, 40, 0.8)' : 'rgba(232, 220, 197, 0.8)',
                    fontWeight: '700',
                  }}>
                  Your choice
                </Text>
              </View>
              <Text
                testID="feedback-selected-answer"
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 15,
                  lineHeight: 22,
                  color: isCorrect ? colors.emeraldDeep : colors.cream,
                  fontWeight: '700',
                }}>
                {selectedAnswer}
              </Text>
            </View>
          )}

          {!isCorrect && correctAnswer && (
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: 'rgba(207, 170, 107, 0.2)',
                  marginRight: 8,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 10,
                    letterSpacing: 0.7,
                    textTransform: 'uppercase',
                    color: 'rgba(232, 220, 197, 0.88)',
                    fontWeight: '700',
                  }}>
                  Correct answer
                </Text>
              </View>
              <Text
                testID="feedback-correct-answer"
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 15,
                  lineHeight: 22,
                  color: colors.gold,
                  fontWeight: '700',
                }}>
                {correctAnswer}
              </Text>
            </View>
          )}
        </View>
      )}

      {showContinueButton && <ContinueActionButton label={continueLabel} onPress={onContinue} />}
    </Animated.View>
  );
}
