/**
 * Root Lesson Screen - 3-Step Educational Flow
 * Step 0: "New Concept" introduction to root system
 * Step 1: Interactive bloom visualization with derivatives
 * Step 2: Quiz questions about the root
 * Divine Geometry Design - Dark (Midnight) theme
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, ArrowRight } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import { RootExplorer } from '@/components/learning/RootExplorer';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { QuizProgressBar } from '@/components/learning/QuizProgressBar';
import { QuizOption, type QuizOptionState } from '@/components/learning/QuizOption';
import { FeedbackBanner } from '@/components/learning/FeedbackBanner';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { timeouts } from '@/constants/timeouts';
import { shuffleArray } from '@/lib/utils/quiz';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useContentAccess } from '@/lib/hooks/useContentAccess';
import { markLessonComplete } from '@/lib/api/progress';
import { recordStreakActivity } from '@/lib/api/streak';
import { onLearningActivityCompleted } from '@/lib/notifications/notificationOrchestrator';
import { PaywallGate } from '@/components/subscription/PaywallGate';
import type { Lesson, Root, Word, LessonQuizQuestion } from '@/types';
import '@/global.css';

interface QuizState {
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  feedback: 'correct' | 'wrong' | null;
  score: number;
  answerHistory: ('correct' | 'incorrect')[];
}

const initialQuizState: QuizState = {
  currentQuestionIndex: 0,
  selectedAnswer: null,
  feedback: null,
  score: 0,
  answerHistory: [],
};

export default function RootLessonScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const lessonId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const { shouldShowPaywall, isLoading: isSubscriptionLoading } = useContentAccess();
  const [step, setStep] = useState(0);
  const [bloomState, setBloomState] = useState<'closed' | 'open'>('closed');
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  const [isChecking, setIsChecking] = useState(false);
  const checkLockRef = useRef(false);
  const scrollRef = useRef<ScrollView | null>(null);

  const {
    data: lesson,
    isLoading: lessonLoading,
    error: lessonError,
    refetch: refetchLesson,
  } = useQuery<Lesson>({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) {
        throw new Error('Missing lesson id');
      }
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  const rootId = lesson?.name
    ?.match(/\(([^)]+)\)/)?.[1]
    .toLowerCase()
    .replace(/-/g, '');
  const rootTransliteration = rootId ? rootId.toUpperCase().split('').join('-') : null;

  const {
    data: root,
    isLoading: rootLoading,
    error: rootError,
    refetch: refetchRoot,
  } = useQuery<Root>({
    queryKey: ['root', rootTransliteration],
    queryFn: async () => {
      if (!rootTransliteration) {
        throw new Error('Missing root transliteration');
      }
      const { data, error } = await supabase
        .from('roots')
        .select('*')
        .eq('transliteration', rootTransliteration)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!rootTransliteration,
  });

  const { data: words = [] } = useQuery<Word[]>({
    queryKey: ['rootWords', root?.id],
    queryFn: async () => {
      if (!root) return [];
      const { data, error } = await supabase
        .from('word_roots')
        .select(
          `
          words (
            id,
            arabic,
            transliteration,
            meaning,
            lesson_id
          )
        `
        )
        .eq('root_id', root.id);

      if (error) throw error;
      return data?.map((wr: any) => wr.words) ?? [];
    },
    enabled: !!root,
  });

  const {
    data: quizQuestionsData,
    isLoading: quizLoading,
    error: quizError,
    refetch: refetchQuizQuestions,
  } = useQuery<LessonQuizQuestion[]>({
    queryKey: ['quizQuestions', lessonId],
    queryFn: async () => {
      if (!lessonId) {
        throw new Error('Missing lesson id');
      }
      const { data, error } = await supabase
        .from('lesson_quiz_questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order');

      if (error) throw error;
      return (data ?? []).map((question) => ({
        ...question,
        explanation: question.explanation ?? undefined,
      }));
    },
    enabled: !!lessonId && step === 2,
  });
  const quizQuestions = quizQuestionsData ?? [];

  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => setBloomState('open'), timeouts.ui.bloomAnimation);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step !== 2 || !quizState.feedback) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [quizState.feedback, step, quizState.currentQuestionIndex]);

  const handleExit = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/learn' as any);
    }
  }, [router]);

  const handleClose = useCallback(() => {
    const hasQuizProgress =
      step === 2 &&
      (quizState.currentQuestionIndex > 0 ||
        quizState.selectedAnswer !== null ||
        quizState.feedback !== null ||
        quizState.answerHistory.length > 0);

    if (!hasQuizProgress) {
      handleExit();
      return;
    }

    Alert.alert('Leave quiz?', 'Your current quiz progress will be lost.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: handleExit },
    ]);
  }, [handleExit, quizState, step]);

  const currentQuestion = quizQuestions[quizState.currentQuestionIndex];
  const currentQuestionId = currentQuestion?.id;
  const currentCorrectAnswer = currentQuestion?.correct_answer;
  const currentWrongAnswers = currentQuestion?.wrong_answers;
  const allAnswers = useMemo(() => {
    if (!currentQuestionId || !currentCorrectAnswer) return [];
    return shuffleArray([currentCorrectAnswer, ...(currentWrongAnswers ?? [])]);
  }, [currentQuestionId, currentCorrectAnswer, currentWrongAnswers]);

  const handleSelectAnswer = useCallback(
    (answer: string) => {
      if (quizState.feedback) return;
      setQuizState((prev) => ({ ...prev, selectedAnswer: answer }));
    },
    [quizState.feedback]
  );

  const handleCheckAnswer = useCallback(() => {
    if (
      !currentQuestion ||
      !quizState.selectedAnswer ||
      quizState.feedback ||
      isChecking ||
      checkLockRef.current
    ) {
      return;
    }
    checkLockRef.current = true;
    setIsChecking(true);

    const isCorrect = quizState.selectedAnswer === currentQuestion.correct_answer;
    setQuizState((prev) => ({
      ...prev,
      feedback: isCorrect ? 'correct' : 'wrong',
      score: isCorrect ? prev.score + 1 : prev.score,
      answerHistory: [...prev.answerHistory, isCorrect ? 'correct' : 'incorrect'],
    }));
  }, [currentQuestion, isChecking, quizState.feedback, quizState.selectedAnswer]);

  const handleContinue = useCallback(async () => {
    checkLockRef.current = false;
    setIsChecking(false);

    if (quizState.currentQuestionIndex >= quizQuestions.length - 1) {
      if (userId && lessonId) {
        try {
          await markLessonComplete(userId, lessonId);
          await queryClient.invalidateQueries({ queryKey: ['progress'] });
          recordStreakActivity(userId)
            .then((streak) => onLearningActivityCompleted(streak.currentStreak))
            .catch(() => onLearningActivityCompleted().catch(() => {}));
        } catch (error) {
          if (__DEV__) {
            console.warn('[RootLesson] Failed to persist completion:', error);
          }
        }
      }
      handleExit();
      return;
    }

    setQuizState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      selectedAnswer: null,
      feedback: null,
    }));
  }, [
    handleExit,
    lessonId,
    queryClient,
    quizQuestions.length,
    quizState.currentQuestionIndex,
    userId,
  ]);

  if (isSubscriptionLoading) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.05}>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.gold} />
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: colors.cream,
                opacity: 0.6,
                marginTop: 16,
              }}>
              Checking subscription...
            </Text>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (shouldShowPaywall) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.05}>
        <SafeAreaView style={{ flex: 1 }}>
          <PaywallGate />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (lessonLoading) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.05}>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.gold} />
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: colors.cream,
                opacity: 0.6,
                marginTop: 16,
              }}>
              Loading lesson...
            </Text>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (lessonError || !lesson) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.05}>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center px-8">
            <Text
              style={{
                color: colors.cream,
                fontFamily: fonts.fraunces,
                fontSize: 24,
                textAlign: 'center',
                marginBottom: 12,
              }}>
              Unable to load lesson
            </Text>
            <Text
              style={{
                color: colors.cream,
                fontFamily: fonts.outfit,
                fontSize: 14,
                opacity: 0.75,
                textAlign: 'center',
                marginBottom: 24,
              }}>
              Please try again or return to the learning path.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable onPress={() => refetchLesson()}>
                <Text
                  style={{
                    color: colors.gold,
                    fontFamily: fonts.outfit,
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                  Retry
                </Text>
              </Pressable>
              <Pressable onPress={handleExit}>
                <Text
                  style={{
                    color: colors.cream,
                    fontFamily: fonts.outfit,
                    fontSize: 16,
                    opacity: 0.8,
                  }}>
                  Go Back
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const showCheckButton =
    step === 2 &&
    !quizLoading &&
    !quizError &&
    !!currentQuestion &&
    quizState.feedback === null &&
    quizState.selectedAnswer !== null;
  const showBottomActions =
    step === 2 && !quizLoading && !quizError && !!currentQuestion && showCheckButton;
  const isLastQuestion = quizState.currentQuestionIndex === quizQuestions.length - 1;

  return (
    <ScreenBackground variant="midnight" patternOpacity={0.05}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(207, 170, 107, 0.1)',
          }}>
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 20,
              color: colors.cream,
            }}>
            {lesson?.name}
          </Text>
          <Pressable
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Close lesson">
            <X size={24} color={colors.cream} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(207, 170, 107, 0.3)',
                  backgroundColor: 'rgba(207, 170, 107, 0.1)',
                  marginBottom: 32,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 12,
                    color: colors.gold,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}>
                  New Concept
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: fonts.fraunces,
                  fontSize: 40,
                  color: colors.cream,
                  textAlign: 'center',
                  marginBottom: 24,
                }}>
                The Root System
              </Text>

              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 18,
                  color: colors.cream,
                  opacity: 0.8,
                  textAlign: 'center',
                  lineHeight: 28,
                  maxWidth: 320,
                  marginBottom: 64,
                }}>
                Arabic words are grown like trees. They start from a 3-letter seed called a Root.
              </Text>

              <Pressable
                onPress={() => setStep(1)}
                style={{
                  paddingHorizontal: 40,
                  paddingVertical: 16,
                  borderRadius: 14,
                  backgroundColor: colors.cream,
                  shadowColor: colors.cream,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 30,
                  elevation: 8,
                }}
                accessibilityRole="button"
                accessibilityLabel="Show me the root system">
                <Text
                  style={{
                    fontFamily: fonts.fraunces,
                    fontSize: 18,
                    color: colors.midnight,
                    fontWeight: '600',
                  }}>
                  Show me
                </Text>
              </Pressable>
            </View>
          )}

          {step === 1 && rootLoading && (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text
                style={{
                  color: colors.cream,
                  fontFamily: fonts.outfit,
                  opacity: 0.75,
                  marginTop: 12,
                }}>
                Loading root map...
              </Text>
            </View>
          )}

          {step === 1 && !rootLoading && !root && (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 12,
              }}>
              <Text
                style={{
                  color: colors.cream,
                  fontFamily: fonts.fraunces,
                  fontSize: 28,
                  textAlign: 'center',
                  marginBottom: 12,
                }}>
                Root view unavailable
              </Text>
              <Text
                style={{
                  color: colors.cream,
                  fontFamily: fonts.outfit,
                  fontSize: 16,
                  opacity: 0.75,
                  textAlign: 'center',
                  marginBottom: 28,
                }}>
                {rootError
                  ? 'We could not load the root visualization for this lesson.'
                  : 'This lesson does not include root visualization data yet.'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                {rootError && (
                  <Pressable onPress={() => refetchRoot()}>
                    <Text
                      style={{
                        color: colors.gold,
                        fontFamily: fonts.outfit,
                        fontSize: 16,
                        fontWeight: '700',
                      }}>
                      Retry
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => {
                    setQuizState({ ...initialQuizState });
                    setStep(2);
                    checkLockRef.current = false;
                    setIsChecking(false);
                  }}>
                  <Text
                    style={{
                      color: colors.cream,
                      fontFamily: fonts.outfit,
                      fontSize: 16,
                    }}>
                    Continue to Quiz
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {step === 1 && root && (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
              <RootExplorer
                root={root}
                relatedWords={words}
                isExpanded={bloomState === 'open'}
                onCollapse={() => {}}
                wordId=""
                fullScreen
              />

              {bloomState === 'open' && (
                <Pressable
                  onPress={() => {
                    setQuizState({ ...initialQuizState });
                    setStep(2);
                    checkLockRef.current = false;
                    setIsChecking(false);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: colors.gold,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Continue to quiz">
                  <ArrowRight size={24} color={colors.midnight} />
                </Pressable>
              )}
            </View>
          )}

          {step === 2 && (
            <View style={{ flex: 1, paddingTop: 16 }}>
              {quizLoading && (
                <View
                  style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                  <ActivityIndicator size="large" color={colors.gold} />
                  <Text
                    style={{
                      color: colors.cream,
                      fontFamily: fonts.outfit,
                      opacity: 0.7,
                      marginTop: 12,
                    }}>
                    Loading quiz...
                  </Text>
                </View>
              )}

              {!quizLoading && quizError && (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Text
                    style={{
                      color: colors.cream,
                      fontFamily: fonts.fraunces,
                      fontSize: 24,
                      textAlign: 'center',
                      marginBottom: 12,
                    }}>
                    Unable to load quiz
                  </Text>
                  <Pressable onPress={() => refetchQuizQuestions()}>
                    <Text
                      style={{
                        color: colors.gold,
                        fontFamily: fonts.outfit,
                        fontSize: 16,
                        fontWeight: '700',
                      }}>
                      Retry
                    </Text>
                  </Pressable>
                </View>
              )}

              {!quizLoading && !quizError && quizQuestions.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Text
                    style={{
                      color: colors.cream,
                      fontFamily: fonts.fraunces,
                      fontSize: 24,
                      textAlign: 'center',
                      marginBottom: 12,
                    }}>
                    No quiz questions yet
                  </Text>
                  <Text
                    style={{
                      color: colors.cream,
                      fontFamily: fonts.outfit,
                      fontSize: 16,
                      opacity: 0.75,
                      textAlign: 'center',
                    }}>
                    This lesson does not have quiz questions yet.
                  </Text>
                </View>
              )}

              {!quizLoading && !quizError && currentQuestion && (
                <View>
                  <QuizProgressBar
                    totalQuestions={quizQuestions.length}
                    currentIndex={quizState.currentQuestionIndex}
                    answerHistory={quizState.answerHistory}
                  />

                  <View
                    style={{
                      backgroundColor: colors.cream,
                      borderRadius: 24,
                      padding: 24,
                      borderWidth: 1,
                      borderColor: colors.goldAlpha[30],
                      minHeight: 360,
                      shadowColor: colors.gold,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.08,
                      shadowRadius: 20,
                      elevation: 4,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.fraunces,
                        fontSize: 22,
                        color: colors.emeraldDeep,
                        marginBottom: 24,
                        lineHeight: 32,
                      }}>
                      {currentQuestion.question}
                    </Text>

                    <View style={{ gap: 12 }}>
                      {allAnswers.map((answer, index) => {
                        const isSelected = quizState.selectedAnswer === answer;
                        const isCorrect = answer === currentQuestion.correct_answer;
                        const checked = quizState.feedback !== null;
                        const label = String.fromCharCode(65 + index);

                        let optionState: QuizOptionState = 'normal';
                        if (!checked) {
                          optionState = isSelected ? 'selected' : 'normal';
                        } else if (isCorrect && isSelected) {
                          optionState = 'correct';
                        } else if (isCorrect) {
                          optionState = 'revealed';
                        } else if (isSelected) {
                          optionState = 'incorrect';
                        }

                        return (
                          <QuizOption
                            key={`${currentQuestion.id}-${answer}`}
                            label={label}
                            text={answer}
                            state={optionState}
                            disabled={checked}
                            onPress={() => handleSelectAnswer(answer)}
                            testID={`root-quiz-option-${index}`}
                          />
                        );
                      })}
                    </View>
                  </View>

                  <View style={{ marginTop: 20 }}>
                    {quizState.feedback && (
                      <View>
                        <FeedbackBanner
                          visible
                          placement="inline"
                          isCorrect={quizState.feedback === 'correct'}
                          correctAnswer={currentQuestion.correct_answer}
                          selectedAnswer={quizState.selectedAnswer ?? undefined}
                          continueLabel={isLastQuestion ? 'COMPLETE LESSON' : 'CONTINUE'}
                          onContinue={handleContinue}
                          showContinueButton
                        />

                        {currentQuestion.explanation && (
                          <Text
                            style={{
                              color: colors.cream,
                              fontFamily: fonts.outfit,
                              fontSize: 14,
                              lineHeight: 20,
                              opacity: 0.85,
                            }}>
                            {currentQuestion.explanation}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
        {showBottomActions && (
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: Platform.OS === 'android' ? 34 : 18,
              borderTopWidth: 1,
              borderTopColor: 'rgba(207, 170, 107, 0.18)',
              backgroundColor: 'rgba(7, 20, 17, 0.96)',
            }}>
            {showCheckButton && (
              <Pressable
                onPress={handleCheckAnswer}
                disabled={isChecking}
                accessibilityRole="button"
                accessibilityLabel="Check your answer"
                style={{
                  backgroundColor: colors.gold,
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: 'center',
                  opacity: isChecking ? 0.65 : 1,
                  shadowColor: colors.gold,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 15,
                  elevation: 8,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 18,
                    color: colors.emeraldDeep,
                    fontWeight: '700',
                    letterSpacing: 1,
                  }}>
                  CHECK
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}
