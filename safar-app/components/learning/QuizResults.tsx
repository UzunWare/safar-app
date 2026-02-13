import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { StarRating } from '@/components/learning/StarRating';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { getQuizFeedback } from '@/lib/utils/quiz';
import { useReducedMotionPreference } from '@/lib/hooks/useReducedMotionPreference';

interface QuizResultsProps {
  correctCount: number;
  totalCount: number;
  onComplete: () => void;
  isCompleting?: boolean;
  bestStreak?: number;
  onReviewMistakes?: () => void;
}

/** Gold pulsing glow for high-score celebration */
function CelebrationGlow({ reducedMotion }: { reducedMotion: boolean }) {
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion
      ? 0.12
      : withRepeat(
          withSequence(
            withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.08, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        ),
    transform: [
      {
        scale: reducedMotion
          ? 1
          : withRepeat(
              withSequence(
                withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
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
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.gold,
        },
        pulseStyle,
      ]}
    />
  );
}

/** Animated counter that rolls from 0 to target */
function useAnimatedCounter(target: number, duration: number = 1200): number {
  const [displayCount, setDisplayCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setDisplayCount(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return displayCount;
}

export function QuizResults({
  correctCount,
  totalCount,
  onComplete,
  isCompleting = false,
  bestStreak = 0,
  onReviewMistakes,
}: QuizResultsProps) {
  const reducedMotion = useReducedMotionPreference();
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const isHighScore = percentage >= 80;
  const isPerfect = percentage >= 100;
  const feedback = getQuizFeedback(percentage);

  const animatedScore = useAnimatedCounter(correctCount);
  const animatedPercentage = useAnimatedCounter(percentage);
  const displayedScore = reducedMotion ? correctCount : animatedScore;
  const displayedPercentage = reducedMotion ? percentage : animatedPercentage;

  return (
    <ScreenBackground variant="midnight">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}>
        <View
          testID="quiz-results"
          accessibilityLabel={`Quiz complete. You scored ${correctCount} out of ${totalCount}, ${percentage} percent. ${feedback.message}`}
          style={{
            width: '100%',
            maxWidth: 460,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {/* Celebration glow + emoji container */}
          <View
            style={{
              width: 120,
              height: 120,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
            {isHighScore && (
              <View testID="quiz-celebration-animation">
                <CelebrationGlow reducedMotion={reducedMotion} />
                {!reducedMotion && (
                  <LottieView
                    source={require('@/assets/animations/celebration.json')}
                    autoPlay
                    loop={false}
                    style={{
                      width: 200,
                      height: 200,
                      position: 'absolute',
                      top: -40,
                      left: -40,
                    }}
                  />
                )}
              </View>
            )}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(207, 170, 107, 0.15)',
                borderWidth: 1,
                borderColor: colors.goldAlpha[20],
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 36 }}>{feedback.emoji}</Text>
            </View>
          </View>

          {/* Star Rating */}
          <StarRating percentage={percentage} />

          {/* Score (animated counter) */}
          <Text
            testID="quiz-results-score"
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 48,
              color: colors.gold,
              textAlign: 'center',
              marginBottom: 8,
            }}>
            {displayedScore}/{totalCount}
          </Text>

          {/* Percentage (animated counter) */}
          <Text
            testID="quiz-results-percentage"
            style={{
              fontFamily: fonts.outfit,
              fontSize: 24,
              color: colors.cream,
              textAlign: 'center',
              marginBottom: 24,
            }}>
            {displayedPercentage}%
          </Text>

          {/* Feedback message */}
          <Text
            testID="quiz-results-feedback"
            style={{
              fontFamily: fonts.outfit,
              fontSize: 18,
              color: colors.cream,
              opacity: 0.8,
              textAlign: 'center',
              paddingHorizontal: 16,
              lineHeight: 26,
              marginBottom: 32,
            }}>
            {feedback.message}
          </Text>

          {/* Best Streak — only shown when streak >= 3 */}
          {bestStreak >= 3 && (
            <Text
              testID="quiz-best-streak"
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: colors.gold,
                opacity: 0.7,
                textAlign: 'center',
                marginBottom: 24,
              }}>
              Best streak: {bestStreak} in a row
            </Text>
          )}

          {/* Review Mistakes button — only when not perfect */}
          {!isPerfect && onReviewMistakes && (
            <Pressable
              testID="quiz-review-mistakes-button"
              onPress={onReviewMistakes}
              accessibilityRole="button"
              accessibilityLabel="Review mistakes"
              style={{
                borderWidth: 1.5,
                borderColor: colors.goldAlpha[30],
                paddingVertical: 14,
                paddingHorizontal: 40,
                borderRadius: 16,
                marginBottom: 16,
              }}>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 16,
                  color: colors.gold,
                  fontWeight: '600',
                }}>
                Review Mistakes
              </Text>
            </Pressable>
          )}

          {/* Complete Lesson button */}
          <Pressable
            testID="quiz-complete-lesson-button"
            onPress={onComplete}
            disabled={isCompleting}
            accessibilityRole="button"
            accessibilityLabel="Complete Lesson"
            style={{
              backgroundColor: colors.gold,
              paddingVertical: 16,
              paddingHorizontal: 48,
              borderRadius: 16,
              opacity: isCompleting ? 0.6 : 1,
              shadowColor: colors.gold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 15,
              elevation: 8,
            }}>
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 18,
                color: colors.emeraldDeep,
                fontWeight: '700',
              }}>
              {isCompleting ? 'Completing...' : 'Complete Lesson'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
