/**
 * Lesson Learning Mode Screen
 * Story 3.5: Progress through all words in a lesson
 * Divine Geometry Design — Two-zone layout matching prototype SurahLesson:
 *   Top: Midnight verse area with tappable Arabic words
 *   Bottom: Parchment analysis panel with word details
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle,
  RotateCcw,
  Play,
  Search,
} from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useLesson, useLessonPreview } from '@/lib/hooks/useLesson';
import { useLearningStore } from '@/lib/stores/useLearningStore';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useContentAccess } from '@/lib/hooks/useContentAccess';
import { markLessonComplete } from '@/lib/api/progress';
import { recordStreakActivity } from '@/lib/api/streak';
import { onLearningActivityCompleted } from '@/lib/notifications/notificationOrchestrator';
import { awardXp } from '@/lib/api/xp';
import { calculateLessonXp } from '@/lib/utils/xp';
import { XpGainAnimation } from '@/components/progress/XpGainAnimation';
import { PaywallGate } from '@/components/subscription/PaywallGate';
import { ContentPreview } from '@/components/subscription/ContentPreview';
import { useWordRoot } from '@/lib/hooks/useWordRoot';
import { AudioButton } from '@/components/learning/AudioButton';
import { IslamicPattern } from '@/components/ui/IslamicPattern';
import { NoiseTexture } from '@/components/ui/NoiseTexture';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import '@/global.css';

const SWIPE_THRESHOLD = 50;
const ANIMATION_DURATION = 180;

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

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { shouldShowPaywall, isLoading: isSubscriptionLoading } = useContentAccess();
  const shouldLoadFullLesson = !isSubscriptionLoading && !shouldShowPaywall;
  const shouldLoadPreview = !isSubscriptionLoading && shouldShowPaywall;

  const { data: lesson, isLoading, isError } = useLesson(id ?? '', { enabled: shouldLoadFullLesson });
  const { data: previewWords = [] } = useLessonPreview(id ?? '', 2, { enabled: shouldLoadPreview });

  const currentIndex = useLearningStore((s) => s.currentWordIndex);
  const isComplete = useLearningStore((s) => s.isComplete);
  const storedLessonId = useLearningStore((s) => s.currentLessonId);
  const { setLesson, nextWord, previousWord, setWordIndex, completeLesson } =
    useLearningStore.getState();
  const userId = useAuthStore((s) => s.user?.id);

  const words = lesson?.words ?? [];
  const totalWords = words.length;
  const currentWord = words[currentIndex];
  const progressNow = totalWords > 0 ? currentIndex + 1 : 0;
  const progressMax = totalWords > 0 ? totalWords : 1;
  const progressPercent = totalWords > 0 ? (progressNow / totalWords) * 100 : 0;

  // Fetch root data for the current word
  const { data: currentRoot } = useWordRoot(currentWord?.id);

  // Resume modal state
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState<number | null>(null);
  const hasCheckedResume = useRef(false);
  const directionRef = useRef<'next' | 'prev'>('next');

  // Animation values for panel content transitions
  const panelOpacity = useSharedValue(1);

  // Initialize store when lesson loads, check for resume or completed state
  useEffect(() => {
    if (!id) return;
    if (id !== storedLessonId) {
      setLesson(id);
    } else if (!hasCheckedResume.current) {
      hasCheckedResume.current = true;
      if (isComplete || currentIndex > 0) {
        setShowResumeModal(true);
      }
    }
  }, [id, storedLessonId, setLesson, currentIndex, isComplete]);

  // Animate panel content when word index changes
  useEffect(() => {
    panelOpacity.value = 0;
    panelOpacity.value = withTiming(1, { duration: ANIMATION_DURATION });
  }, [currentIndex, panelOpacity]);

  const handleNext = useCallback(() => {
    directionRef.current = 'next';
    if (currentIndex >= totalWords - 1) {
      completeLesson();
      if (userId && id) {
        markLessonComplete(userId, id).then(() => {
          queryClient.invalidateQueries({ queryKey: ['progress'] });
        });
        recordStreakActivity(userId)
          .then((streak) => onLearningActivityCompleted(streak.currentStreak))
          .catch(() => onLearningActivityCompleted().catch(() => {}));
        const lessonXp = calculateLessonXp();
        setXpGainAmount(lessonXp);
        awardXp(userId, lessonXp)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['xp'] });
          })
          .catch(() => {});
      }
    } else {
      nextWord();
    }
  }, [currentIndex, totalWords, completeLesson, nextWord, userId, id, queryClient]);

  const handlePrevious = useCallback(() => {
    if (currentIndex === 0) return;
    directionRef.current = 'prev';
    previousWord();
  }, [currentIndex, previousWord]);

  const handleWordTap = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      directionRef.current = index > currentIndex ? 'next' : 'prev';
      setWordIndex(index);
    },
    [currentIndex, setWordIndex]
  );

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const handleResume = useCallback(() => {
    setShowResumeModal(false);
  }, []);

  const handleRestart = useCallback(() => {
    if (id) setLesson(id);
    setShowResumeModal(false);
  }, [id, setLesson]);

  // Swipe gesture for card navigation
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onEnd((event) => {
      'worklet';
      if (event.translationX < -SWIPE_THRESHOLD) {
        runOnJS(handleNext)();
      } else if (event.translationX > SWIPE_THRESHOLD) {
        runOnJS(handlePrevious)();
      }
    });

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: panelOpacity.value,
  }));

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
    const previewContent = previewWords.length > 0 ? (
      <ContentPreview words={previewWords} previewCount={2} />
    ) : undefined;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
        <PaywallGate preview={previewContent} />
      </SafeAreaView>
    );
  }

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
        <View
          testID="lesson-loading"
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
  if (isError || !lesson) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
        <View
          testID="lesson-error"
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}>
          <BookOpen color={colors.gold} size={48} />
          <Text
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: 20,
              color: colors.cream,
              fontFamily: fonts.fraunces,
            }}>
            Unable to load lesson
          </Text>
          <Text
            style={{
              marginTop: 8,
              textAlign: 'center',
              fontSize: 14,
              color: colors.cream,
              opacity: 0.6,
              fontFamily: fonts.outfit,
            }}>
            Please check your connection and try again.
          </Text>
          <Pressable
            testID="close-button"
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{
              marginTop: 24,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: 'rgba(207, 170, 107, 0.2)',
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

  if (totalWords === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}>
          <BookOpen color={colors.gold} size={48} />
          <Text
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: 20,
              color: colors.cream,
              fontFamily: fonts.fraunces,
            }}>
            No words in this lesson yet
          </Text>
          <Text
            style={{
              marginTop: 8,
              textAlign: 'center',
              fontSize: 14,
              color: colors.cream,
              opacity: 0.6,
              fontFamily: fonts.outfit,
            }}>
            This lesson will be available soon.
          </Text>
          <Pressable
            testID="close-button"
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{
              marginTop: 24,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: 'rgba(207, 170, 107, 0.2)',
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
  if (isComplete && !showResumeModal) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
        <IslamicPattern opacity={0.04} />
        <NoiseTexture opacity={0.04} />
        <View
          testID="lesson-complete"
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
          {xpGainAmount !== null && (
            <XpGainAnimation amount={xpGainAmount} onComplete={() => setXpGainAmount(null)} />
          )}
          <Text
            style={{
              fontSize: 16,
              color: colors.cream,
              opacity: 0.6,
              fontFamily: fonts.outfit,
              textAlign: 'center',
              marginBottom: 32,
            }}>
            You&apos;ve reviewed all {totalWords} words. Ready to test your knowledge?
          </Text>
          {/* Primary: Take Quiz */}
          <Pressable
            testID="take-quiz-button"
            onPress={() => router.replace(`/quiz/${id}`)}
            accessibilityRole="button"
            accessibilityLabel="Take quiz"
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
              marginBottom: 16,
            }}>
            <Text
              style={{
                fontSize: 18,
                color: colors.midnight,
                fontFamily: fonts.fraunces,
                fontWeight: '600',
              }}>
              Take Quiz
            </Text>
          </Pressable>
          {/* Secondary: Skip */}
          <Pressable
            testID="finish-button"
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Skip quiz and finish"
            style={{
              paddingHorizontal: 32,
              paddingVertical: 12,
            }}>
            <Text
              style={{ fontSize: 14, color: colors.cream, opacity: 0.5, fontFamily: fonts.outfit }}>
              Skip for now
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // --- MAIN LESSON VIEW: Two-Zone Layout ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.midnight }}>
      <IslamicPattern opacity={0.04} />
      <NoiseTexture opacity={0.04} />

      {/* Header: X + Progress Bar + Counter */}
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

        {/* Progress bar */}
        <View style={{ flex: 1, marginHorizontal: 20 }}>
          <View
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}>
            <View
              testID="progress-bar"
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: progressMax, now: progressNow }}
              style={{
                height: '100%',
                borderRadius: 2,
                backgroundColor: colors.gold,
                width: `${progressPercent}%`,
              }}
            />
          </View>
        </View>

        {/* Word counter */}
        <Text
          style={{
            fontSize: 12,
            color: colors.cream,
            opacity: 0.5,
            fontFamily: fonts.outfit,
            fontWeight: '500',
          }}>
          {progressNow}/{totalWords}
        </Text>
      </View>

      {/* Resume Modal */}
      {showResumeModal && (
        <View
          testID="resume-modal"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            backgroundColor: 'rgba(10, 14, 23, 0.92)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}>
          <View
            style={{
              width: '100%',
              maxWidth: 320,
              borderRadius: 20,
              backgroundColor: colors.midnight,
              borderWidth: 1,
              borderColor: 'rgba(207, 170, 107, 0.15)',
              padding: 28,
              alignItems: 'center',
            }}>
            {isComplete ? (
              <CheckCircle color={colors.gold} size={36} />
            ) : (
              <BookOpen color={colors.gold} size={36} />
            )}
            <Text
              style={{
                marginTop: 16,
                fontSize: 20,
                color: colors.cream,
                fontFamily: fonts.fraunces,
                textAlign: 'center',
              }}>
              {isComplete ? 'Lesson Complete' : 'Welcome Back'}
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                color: colors.cream,
                opacity: 0.6,
                fontFamily: fonts.outfit,
                textAlign: 'center',
              }}>
              {isComplete
                ? `You've reviewed all ${totalWords} words`
                : `You were on word ${currentIndex + 1} of ${totalWords}`}
            </Text>

            <Pressable
              testID={isComplete ? 'review-again-button' : 'resume-button'}
              onPress={isComplete ? handleRestart : handleResume}
              accessibilityRole="button"
              accessibilityLabel={isComplete ? 'Review again' : 'Resume lesson'}
              style={{
                marginTop: 24,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: colors.gold,
              }}>
              {isComplete ? (
                <RotateCcw color={colors.midnight} size={16} />
              ) : (
                <Play color={colors.midnight} size={16} />
              )}
              <Text
                style={{
                  fontSize: 15,
                  color: colors.midnight,
                  fontFamily: fonts.outfit,
                  fontWeight: '600',
                }}>
                {isComplete ? 'Review Again' : 'Resume'}
              </Text>
            </Pressable>

            <Pressable
              testID={isComplete ? 'exit-button' : 'restart-button'}
              onPress={isComplete ? handleClose : handleRestart}
              accessibilityRole="button"
              accessibilityLabel={isComplete ? 'Exit lesson' : 'Start over'}
              style={{
                marginTop: 12,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}>
              {isComplete ? (
                <X color={colors.cream} size={16} />
              ) : (
                <RotateCcw color={colors.cream} size={16} />
              )}
              <Text
                style={{
                  fontSize: 15,
                  color: colors.cream,
                  opacity: 0.8,
                  fontFamily: fonts.outfit,
                }}>
                {isComplete ? 'Exit' : 'Start Over'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Two-Zone Content with Swipe Gesture */}
      <GestureDetector gesture={swipeGesture}>
        <View testID="swipe-area" style={{ flex: 1 }}>
          {/* === TOP ZONE: Verse Area (midnight) === */}
          <View style={{ paddingHorizontal: 24, paddingTop: 8, alignItems: 'center' }}>
            {/* Lesson heading */}
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 20,
                color: colors.gold,
                textAlign: 'center',
                marginBottom: 24,
              }}>
              {lesson.name}
            </Text>

            {/* Tappable Arabic word flow (RTL) */}
            <View
              style={{
                flexDirection: 'row-reverse',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 12,
                marginBottom: 20,
              }}>
              {words.map((word, index) => (
                <Pressable
                  key={word.id}
                  onPress={() => handleWordTap(index)}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    backgroundColor:
                      index === currentIndex ? 'rgba(207, 170, 107, 0.1)' : 'transparent',
                    transform: [{ scale: index === currentIndex ? 1.1 : 1 }],
                  }}>
                  <Text
                    style={{
                      fontFamily: fonts.amiri,
                      fontSize: 36,
                      lineHeight: 72,
                      color: index === currentIndex ? colors.gold : colors.cream,
                      opacity: index === currentIndex ? 1 : 0.7,
                    }}>
                    {word.arabic}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* === BOTTOM ZONE: Parchment Analysis Panel === */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.parchment,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              overflow: 'hidden',
            }}>
            {currentWord ? (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 24, paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}>
                <Animated.View style={panelAnimatedStyle}>
                  {/* Header: Word Analysis pill + Audio button */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 20,
                    }}>
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor: 'rgba(15, 46, 40, 0.08)',
                        borderRadius: 20,
                      }}>
                      <Text
                        style={{
                          fontFamily: fonts.outfit,
                          fontSize: 10,
                          letterSpacing: 2,
                          textTransform: 'uppercase',
                          color: colors.emeraldDeep,
                          opacity: 0.6,
                        }}>
                        Word Analysis
                      </Text>
                    </View>
                    <AudioButton audioUrl={currentWord.audio_url} />
                  </View>

                  {/* Arabic text — generous lineHeight for tashkeel (diacritics) */}
                  <View style={{ overflow: 'visible', paddingTop: 10, marginBottom: 12 }}>
                    <Text
                      style={{
                        fontFamily: fonts.amiri,
                        fontSize: 40,
                        writingDirection: 'rtl',
                        color: colors.emeraldDeep,
                        lineHeight: 80,
                      }}>
                      {currentWord.arabic}
                    </Text>
                  </View>

                  {/* Translation section */}
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontFamily: fonts.outfit,
                        fontSize: 12,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        color: colors.emeraldDeep,
                        opacity: 0.4,
                        marginBottom: 6,
                      }}>
                      Translation
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.fraunces,
                        fontSize: 24,
                        color: colors.emeraldDeep,
                        marginBottom: 4,
                      }}>
                      {currentWord.transliteration}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.outfit,
                        fontSize: 18,
                        color: colors.emeraldDeep,
                        opacity: 0.7,
                      }}>
                      {currentWord.meaning}
                    </Text>
                  </View>

                  {/* Root Family card */}
                  {currentRoot && (
                    <Pressable
                      onPress={() => router.push(`/root-detail/${currentRoot.id}`)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        borderRadius: 16,
                        backgroundColor: 'rgba(207, 170, 107, 0.1)',
                        borderWidth: 1,
                        borderColor: 'rgba(207, 170, 107, 0.2)',
                        gap: 16,
                      }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: colors.emeraldDeep,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Search size={16} color={colors.gold} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: fonts.outfit,
                            fontSize: 10,
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                            color: colors.emeraldDeep,
                            opacity: 0.6,
                          }}>
                          Root Family
                        </Text>
                        <Text
                          style={{
                            fontFamily: fonts.amiri,
                            fontSize: 22,
                            color: colors.emeraldDeep,
                          }}>
                          {currentRoot.letters}
                        </Text>
                      </View>
                      <ChevronRight size={16} color={colors.emeraldDeep} style={{ opacity: 0.5 }} />
                    </Pressable>
                  )}
                </Animated.View>
              </ScrollView>
            ) : (
              <View
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 14,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: colors.emeraldDeep,
                    opacity: 0.4,
                  }}>
                  Tap a word above to analyze
                </Text>
              </View>
            )}

            {/* Navigation buttons inside panel */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingBottom: 24,
                paddingTop: 8,
                backgroundColor: colors.parchment,
              }}>
              {currentIndex > 0 ? (
                <Pressable
                  testID="previous-button"
                  onPress={handlePrevious}
                  accessibilityRole="button"
                  accessibilityLabel="Previous word"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderRadius: 14,
                    backgroundColor: 'rgba(15, 46, 40, 0.06)',
                    borderWidth: 1,
                    borderColor: 'rgba(15, 46, 40, 0.08)',
                  }}>
                  <ChevronLeft color={colors.emeraldDeep} size={18} />
                  <Text
                    style={{
                      fontSize: 15,
                      color: colors.emeraldDeep,
                      opacity: 0.7,
                      fontFamily: fonts.outfit,
                    }}>
                    Previous
                  </Text>
                </Pressable>
              ) : (
                <View style={{ width: 120 }} />
              )}

              <Pressable
                testID="next-button"
                onPress={handleNext}
                accessibilityRole="button"
                accessibilityLabel={
                  currentIndex >= totalWords - 1 ? 'Complete lesson' : 'Next word'
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 24,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: colors.emeraldDeep,
                  shadowColor: colors.emeraldDeep,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 6,
                }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: colors.cream,
                    fontFamily: fonts.outfit,
                    fontWeight: '600',
                  }}>
                  {currentIndex >= totalWords - 1 ? 'Complete' : 'Next'}
                </Text>
                <ChevronRight color={colors.cream} size={18} />
              </Pressable>
            </View>
          </View>
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
}
