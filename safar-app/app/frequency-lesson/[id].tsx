/**
 * Frequency Lesson Screen
 * Teaches high-frequency Quranic particles (Wa, Fi, Min, etc.)
 * Two-state UI matching prototype FrequencyLesson (lines 476-579):
 *   Intro: Glowing orb with particle, frequency count, description
 *   Examples: Quranic examples with highlighted particle, completion
 */

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ArrowRight, CheckCircle, Droplets } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useFrequencyLesson } from '@/lib/hooks/useFrequencyLesson';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useContentAccess } from '@/lib/hooks/useContentAccess';
import { markLessonComplete } from '@/lib/api/progress';
import { recordStreakActivity } from '@/lib/api/streak';
import { onLearningActivityCompleted } from '@/lib/notifications/notificationOrchestrator';
import { AudioButton } from '@/components/learning/AudioButton';
import { PaywallGate } from '@/components/subscription/PaywallGate';
import { IslamicPattern } from '@/components/ui/IslamicPattern';
import { NoiseTexture } from '@/components/ui/NoiseTexture';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import '@/global.css';

type ViewState = 'intro' | 'examples' | 'complete';

/** Gold pulsing glow for the intro orb */
function GlowingOrb() {
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.25, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.08, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    ),
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
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
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: colors.gold,
        },
        pulseStyle,
      ]}
    />
  );
}

/** Gold pulsing glow for lesson completion celebration */
function CelebrationGlow() {
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.08, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    ),
    transform: [
      {
        scale: withRepeat(
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

/**
 * Renders Arabic text with the target particle highlighted in gold.
 *
 * Uses a View wrapper with generous paddingTop to prevent diacritics (tashkeel)
 * from being clipped. React Native's Android text renderer distributes lineHeight
 * space unevenly (bottom-heavy), so lineHeight alone cannot prevent top clipping.
 * See: https://github.com/facebook/react-native/issues/24837
 */
function HighlightedArabic({ text, particle }: { text: string; particle: string }) {
  const parts = text.split(particle);
  return (
    <View style={{ overflow: 'visible', paddingTop: 14, paddingBottom: 4 }}>
      <Text
        {...(Platform.OS === 'android' && {
          includeFontPadding: true,
          textBreakStrategy: 'simple',
        })}
        style={{
          fontFamily: fonts.amiri,
          fontSize: 36,
          lineHeight: 90,
          textAlign: 'right',
          writingDirection: 'rtl',
          color: colors.emeraldDeep,
        }}>
        {parts.map((part, idx) => (
          <Text key={idx}>
            {part}
            {idx < parts.length - 1 && (
              <Text style={{ color: colors.gold, fontWeight: 'bold' }}>{particle}</Text>
            )}
          </Text>
        ))}
      </Text>
    </View>
  );
}

export default function FrequencyLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: lesson, isLoading, isError } = useFrequencyLesson(id ?? '');
  const userId = useAuthStore((s) => s.user?.id);
  const { shouldShowPaywall, isLoading: isSubscriptionLoading } = useContentAccess();

  const [viewState, setViewState] = useState<ViewState>('intro');

  const word = lesson?.words?.[0];
  const examples = word?.frequency_word_examples ?? [];

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const handleComplete = useCallback(() => {
    if (userId && id) {
      markLessonComplete(userId, id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['progress'] });
      });
      recordStreakActivity(userId)
        .then((streak) => onLearningActivityCompleted(streak.currentStreak))
        .catch(() => onLearningActivityCompleted().catch(() => {}));
    }
    setViewState('complete');
  }, [userId, id, queryClient]);

  if (isSubscriptionLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text
            style={{ marginTop: 16, color: colors.cream, opacity: 0.6, fontFamily: fonts.outfit }}>
            Checking subscription...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (shouldShowPaywall) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
        <PaywallGate />
      </SafeAreaView>
    );
  }

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
        <View
          testID="frequency-lesson-loading"
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text
            style={{ marginTop: 16, color: colors.cream, opacity: 0.6, fontFamily: fonts.outfit }}>
            Loading lesson...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- ERROR STATE ---
  if (isError || !lesson || !word) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
        <View
          testID="frequency-lesson-error"
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}>
          <Droplets color={colors.gold} size={48} />
          <Text
            style={{
              marginTop: 24,
              fontSize: 20,
              color: colors.cream,
              fontFamily: fonts.fraunces,
              textAlign: 'center',
            }}>
            Unable to load lesson
          </Text>
          <Pressable
            onPress={handleClose}
            style={{
              marginTop: 24,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: colors.goldAlpha[20],
            }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.gold,
                fontFamily: fonts.outfit,
                fontWeight: '500',
              }}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // --- COMPLETION STATE ---
  if (viewState === 'complete') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
        <IslamicPattern opacity={0.04} />
        <NoiseTexture opacity={0.04} />
        <View
          testID="frequency-lesson-complete"
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}>
          <View
            style={{
              width: 120,
              height: 120,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}>
            <CelebrationGlow />
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(207, 170, 107, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(207, 170, 107, 0.25)',
              }}>
              <CheckCircle color={colors.gold} size={40} />
            </View>
          </View>
          <Text
            style={{
              fontSize: 28,
              color: colors.cream,
              fontFamily: fonts.fraunces,
              textAlign: 'center',
              marginBottom: 8,
            }}>
            Lesson Complete
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.cream,
              opacity: 0.6,
              fontFamily: fonts.outfit,
              textAlign: 'center',
              marginBottom: 32,
            }}>
            You&apos;ve learned &quot;{word.transliteration}&quot; - {word.meaning}
          </Text>
          <Pressable
            testID="finish-button"
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Finish lesson"
            style={{
              paddingHorizontal: 48,
              paddingVertical: 16,
              borderRadius: 14,
              backgroundColor: colors.gold,
              shadowColor: colors.gold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 30,
              elevation: 8,
            }}>
            <Text
              style={{
                fontSize: 18,
                color: colors.midnight,
                fontFamily: fonts.fraunces,
                fontWeight: '600',
              }}>
              Finish
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // --- MAIN LESSON VIEW ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
      <IslamicPattern opacity={0.04} />
      <NoiseTexture opacity={0.04} />

      {/* Header: X button */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 12,
        }}>
        <Pressable
          testID="close-button"
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close lesson"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <X color={colors.cream} size={24} />
        </Pressable>
      </View>

      {/* INTRO STATE */}
      {viewState === 'intro' && (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
            paddingBottom: 40,
          }}
          testID="frequency-lesson-intro">
          {/* Glowing Orb with Arabic particle */}
          <Pressable
            onPress={() => setViewState('examples')}
            style={{ marginBottom: 48, alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                width: 192,
                height: 192,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'visible',
              }}>
              <GlowingOrb />
              <View
                style={{
                  width: 192,
                  height: 192,
                  borderRadius: 96,
                  backgroundColor: colors.midnight,
                  borderWidth: 2,
                  borderColor: colors.gold,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'visible',
                  shadowColor: colors.gold,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.15,
                  shadowRadius: 50,
                  elevation: 8,
                }}>
                <View style={{ overflow: 'visible', paddingTop: 10 }}>
                  <Text
                    {...(Platform.OS === 'android' && {
                      includeFontPadding: true,
                      textBreakStrategy: 'simple',
                    })}
                    style={{
                      fontFamily: fonts.amiri,
                      fontSize: 80,
                      lineHeight: 140,
                      color: colors.cream,
                    }}>
                    {word.arabic}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 4,
                    color: colors.gold,
                  }}>
                  Particle
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Transliteration + Meaning */}
          <Text
            style={{
              fontSize: 36,
              fontFamily: fonts.fraunces,
              color: colors.cream,
              marginBottom: 4,
              textAlign: 'center',
            }}>
            {word.transliteration}
          </Text>
          <Text
            style={{
              fontSize: 22,
              color: colors.gold,
              fontStyle: 'italic',
              marginBottom: 24,
              textAlign: 'center',
              fontFamily: fonts.fraunces,
            }}>
            &quot;{word.meaning}&quot;
          </Text>

          {/* Description + Frequency box */}
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.10)',
              borderRadius: 16,
              paddingHorizontal: 24,
              paddingVertical: 20,
              maxWidth: 320,
              width: '100%',
            }}>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: 'rgba(232, 220, 197, 0.8)',
                lineHeight: 22,
              }}>
              {word.description ?? 'No description available yet.'}
            </Text>
            <View
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.05)',
              }}>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 3,
                  color: colors.gold,
                  opacity: 0.8,
                  marginBottom: 4,
                }}>
                Frequency
              </Text>
              <Text style={{ fontFamily: fonts.fraunces, fontSize: 22, color: colors.cream }}>
                {word.frequency != null
                  ? `${word.frequency.toLocaleString()} times`
                  : 'Frequency data unavailable'}
              </Text>
            </View>
          </View>

          {/* See Examples button */}
          <Pressable
            testID="see-examples-button"
            onPress={() => setViewState('examples')}
            accessibilityRole="button"
            accessibilityLabel="See examples"
            style={{ marginTop: 48, alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 3,
                color: 'rgba(232, 220, 197, 0.6)',
              }}>
              See Examples
            </Text>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: 'rgba(232, 220, 197, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ArrowRight size={18} color={colors.cream} />
            </View>
          </Pressable>
        </ScrollView>
      )}

      {/* EXAMPLES STATE */}
      {viewState === 'examples' && (
        <ScrollView
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          testID="frequency-lesson-examples">
          {/* Section heading */}
          <Text
            style={{
              textAlign: 'center',
              fontFamily: fonts.fraunces,
              fontSize: 22,
              color: colors.gold,
              marginBottom: 24,
            }}>
            The Foundation
          </Text>

          {/* Example cards */}
          <View style={{ paddingHorizontal: 20, gap: 16 }}>
            {examples.map((ex) => (
              <View
                key={ex.id}
                style={{
                  backgroundColor: colors.parchment,
                  borderRadius: 20,
                  paddingHorizontal: 24,
                  paddingTop: 6,
                  paddingBottom: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(207, 170, 107, 0.2)',
                  overflow: 'visible',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                }}>
                {/* Decorative corner accent */}
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 64,
                    height: 64,
                    backgroundColor: 'rgba(207, 170, 107, 0.2)',
                    borderBottomLeftRadius: 64,
                    borderTopRightRadius: 20,
                  }}
                />

                {/* Arabic text with highlighted particle */}
                <View style={{ marginBottom: 4 }}>
                  <HighlightedArabic text={ex.arabic} particle={word.arabic} />
                </View>

                {/* Divider */}
                <View
                  style={{ height: 1, backgroundColor: 'rgba(15, 46, 40, 0.1)', marginBottom: 12 }}
                />

                {/* Transliteration + meaning + audio */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: fonts.fraunces,
                        fontSize: 18,
                        color: colors.emeraldDeep,
                      }}>
                      {ex.transliteration}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.outfit,
                        fontSize: 14,
                        color: 'rgba(15, 46, 40, 0.6)',
                        fontStyle: 'italic',
                        marginTop: 2,
                      }}>
                      {ex.meaning}
                    </Text>
                  </View>
                  <AudioButton audioUrl={ex.audio_url} size={40} />
                </View>
              </View>
            ))}
          </View>

          {/* Complete Lesson button */}
          <View style={{ alignItems: 'center', marginTop: 32, paddingHorizontal: 20 }}>
            <Pressable
              testID="complete-lesson-button"
              onPress={handleComplete}
              accessibilityRole="button"
              accessibilityLabel="Complete lesson"
              style={{
                paddingHorizontal: 48,
                paddingVertical: 18,
                borderRadius: 16,
                backgroundColor: colors.gold,
                shadowColor: colors.gold,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 30,
                elevation: 8,
              }}>
              <Text
                style={{
                  fontSize: 18,
                  color: colors.midnight,
                  fontFamily: fonts.fraunces,
                  fontWeight: '700',
                }}>
                Complete Lesson
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
