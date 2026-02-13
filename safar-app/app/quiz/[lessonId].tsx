// Quiz v10 - accessibility and interaction hardening
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useLesson } from '@/lib/hooks/useLesson';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useContentAccess } from '@/lib/hooks/useContentAccess';
import { useHaptics } from '@/lib/hooks/useHaptics';
import { useQuizStreak } from '@/lib/hooks/useQuizStreak';
import { useQuizSounds } from '@/lib/hooks/useQuizSounds';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { PaywallGate } from '@/components/subscription/PaywallGate';
import { QuizCard } from '@/components/learning/QuizCard';
import { QuizProgressBar } from '@/components/learning/QuizProgressBar';
import { QuizResults } from '@/components/learning/QuizResults';
import { FeedbackBanner } from '@/components/learning/FeedbackBanner';
import { generateQuizQuestions, type QuizQuestionData } from '@/lib/utils/quiz';
import { markLessonComplete } from '@/lib/api/progress';
import { recordStreakActivity } from '@/lib/api/streak';
import { initializeWordProgress } from '@/lib/api/wordProgress';
import { onLearningActivityCompleted } from '@/lib/notifications/notificationOrchestrator';
import { trackQuizCompleted } from '@/lib/utils/analytics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface QuizState {
  currentIndex: number;
  score: number;
  totalAnswered: number;
  flaggedWordIds: string[];
  selectedOptionId: string | null;
  phase: 'selecting' | 'checked';
  isCorrect: boolean | null;
  answerHistory: ('correct' | 'incorrect')[];
}

const initialState: QuizState = {
  currentIndex: 0,
  score: 0,
  totalAnswered: 0,
  flaggedWordIds: [],
  selectedOptionId: null,
  phase: 'selecting',
  isCorrect: null,
  answerHistory: [],
};

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { data: lesson, isLoading, error } = useLesson(lessonId ?? '');
  const { shouldShowPaywall, isLoading: isSubscriptionLoading } = useContentAccess();
  const haptics = useHaptics();
  const streak = useQuizStreak();
  const sounds = useQuizSounds();

  const [questions, setQuestions] = useState<QuizQuestionData[]>([]);
  const [state, setState] = useState<QuizState>(initialState);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const checkLockRef = useRef(false);

  useEffect(() => {
    const lessonWords = lesson?.words;
    if (lessonWords) {
      setQuestions(generateQuizQuestions(lessonWords));
      setState({ ...initialState });
      setIsChecking(false);
      checkLockRef.current = false;
    }
  }, [lesson]);

  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (state.phase === 'checked') return;
      haptics.light();
      sounds.playSelect();
      setState((prev) => ({ ...prev, selectedOptionId: optionId }));
    },
    [haptics, sounds, state.phase]
  );

  const handleCheck = useCallback(() => {
    if (
      !state.selectedOptionId ||
      state.phase === 'checked' ||
      isChecking ||
      checkLockRef.current
    ) {
      return;
    }
    checkLockRef.current = true;
    setIsChecking(true);

    const currentQuestion = questions[state.currentIndex];
    if (!currentQuestion) {
      checkLockRef.current = false;
      setIsChecking(false);
      return;
    }

    const selectedOption = currentQuestion.options.find(
      (option) => option.id === state.selectedOptionId
    );
    if (!selectedOption) {
      checkLockRef.current = false;
      setIsChecking(false);
      return;
    }

    const isCorrect = selectedOption.isCorrect;

    if (isCorrect) {
      haptics.success();
      sounds.playCorrect();
      streak.recordCorrect();
    } else {
      haptics.error();
      sounds.playIncorrect();
      streak.recordIncorrect();
    }

    setState((prev) => ({
      ...prev,
      phase: 'checked',
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalAnswered: prev.totalAnswered + 1,
      answerHistory: [...prev.answerHistory, isCorrect ? 'correct' : 'incorrect'],
      flaggedWordIds: isCorrect
        ? prev.flaggedWordIds
        : [...prev.flaggedWordIds, currentQuestion.wordId],
    }));
  }, [
    haptics,
    isChecking,
    questions,
    sounds,
    state.currentIndex,
    state.phase,
    state.selectedOptionId,
    streak,
  ]);

  const handleContinue = useCallback(() => {
    streak.clearMilestone();
    checkLockRef.current = false;
    setIsChecking(false);
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= questions.length) {
        sounds.playComplete();
      }
      return {
        ...prev,
        currentIndex: nextIndex,
        selectedOptionId: null,
        phase: 'selecting',
        isCorrect: null,
      };
    });
  }, [questions.length, sounds, streak]);

  const handleReviewMistakes = useCallback(() => {
    const reviewQuestions = questions.filter((question) =>
      state.flaggedWordIds.includes(question.wordId)
    );
    if (reviewQuestions.length === 0) return;
    setQuestions(reviewQuestions);
    setState({ ...initialState });
    checkLockRef.current = false;
    setIsChecking(false);
    streak.reset();
  }, [questions, state.flaggedWordIds, streak]);

  const handleClose = useCallback(() => {
    const hasProgress = state.totalAnswered > 0 && state.currentIndex < questions.length;
    if (!hasProgress) {
      router.back();
      return;
    }

    Alert.alert('Leave quiz?', 'Your current quiz progress will be lost.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => router.back() },
    ]);
  }, [questions.length, state.currentIndex, state.totalAnswered]);

  const handleCompleteLesson = useCallback(async () => {
    if (isCompleting || !lessonId || !lesson) return;
    setIsCompleting(true);

    try {
      const userId = useAuthStore.getState().user?.id;

      if (userId && lesson.words) {
        const progressResults = await Promise.all(
          lesson.words.map((word) => {
            const wasCorrect = !state.flaggedWordIds.includes(word.id);
            return initializeWordProgress(userId, word.id, wasCorrect);
          })
        );

        const failedCount = progressResults.filter((result) => !result.success).length;
        if (failedCount > 0 && __DEV__) {
          console.warn(`Word progress: ${failedCount}/${lesson.words.length} failed to save`);
        }
      }

      if (userId) {
        await markLessonComplete(userId, lessonId);
        recordStreakActivity(userId)
          .then((streak) => onLearningActivityCompleted(streak.currentStreak))
          .catch(() => onLearningActivityCompleted().catch(() => {}));
      }

      trackQuizCompleted({
        lessonId,
        score: state.score,
        totalQuestions: questions.length,
        percentage: questions.length > 0 ? Math.round((state.score / questions.length) * 100) : 0,
        flaggedWordIds: state.flaggedWordIds,
      });

      router.back();
    } catch (err) {
      if (__DEV__) {
        console.error('Error completing lesson:', err);
      }
      setIsCompleting(false);
      Alert.alert(
        'Could not save progress',
        'Your lesson completion could not be saved. Please try again.',
        [
          { text: 'Go Back', style: 'cancel', onPress: () => router.back() },
          { text: 'Retry', onPress: () => handleCompleteLesson() },
        ]
      );
    }
  }, [isCompleting, lesson, lessonId, questions.length, state.flaggedWordIds, state.score]);

  if (isSubscriptionLoading) {
    return (
      <ScreenBackground variant="midnight" safeArea>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text
            style={{
              color: colors.cream,
              fontFamily: fonts.outfit,
              fontSize: 16,
              marginTop: 16,
            }}>
            Checking subscription...
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  if (shouldShowPaywall) {
    return (
      <ScreenBackground variant="midnight" safeArea>
        <PaywallGate />
      </ScreenBackground>
    );
  }

  if (isLoading || (!error && !lesson)) {
    return (
      <ScreenBackground variant="midnight" safeArea>
        <View
          testID="quiz-loading"
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text
            style={{
              color: colors.cream,
              fontFamily: fonts.outfit,
              fontSize: 16,
              marginTop: 16,
            }}>
            Preparing quiz...
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  if (error) {
    return (
      <ScreenBackground variant="midnight" safeArea>
        <View
          testID="quiz-error"
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
          }}>
          <Text
            style={{
              color: colors.cream,
              fontFamily: fonts.fraunces,
              fontSize: 24,
              textAlign: 'center',
              marginBottom: 16,
            }}>
            Unable to load quiz
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text
              style={{
                color: colors.gold,
                fontFamily: fonts.outfit,
                fontSize: 16,
              }}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  if (!error && lesson && questions.length === 0) {
    return (
      <ScreenBackground variant="midnight" safeArea>
        <View
          testID="quiz-empty"
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
          }}>
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
              marginBottom: 24,
            }}>
            This lesson does not have enough content to generate a quiz.
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text
              style={{
                color: colors.gold,
                fontFamily: fonts.outfit,
                fontSize: 16,
                fontWeight: '700',
              }}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  const currentQuestion = questions[state.currentIndex];
  const isQuizComplete = state.currentIndex >= questions.length;
  const totalQuestions = questions.length;
  const selectedOptionText =
    currentQuestion?.options.find((option) => option.id === state.selectedOptionId)?.text ??
    undefined;

  if (isQuizComplete) {
    return (
      <View testID="quiz-complete" style={{ flex: 1 }}>
        <QuizResults
          correctCount={state.score}
          totalCount={totalQuestions}
          onComplete={handleCompleteLesson}
          isCompleting={isCompleting}
          bestStreak={streak.bestStreak}
          onReviewMistakes={state.flaggedWordIds.length > 0 ? handleReviewMistakes : undefined}
        />
      </View>
    );
  }

  const showCheckButton =
    state.phase === 'selecting' && state.selectedOptionId !== null && !isChecking;
  const showBottomActions = showCheckButton;
  const scoreLabel =
    state.totalAnswered === 0 ? '0 correct' : `${state.score}/${state.totalAnswered}`;

  return (
    <ScreenBackground variant="midnight" safeArea showPattern={false} showNoise={false}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 8,
        }}>
        <Pressable
          testID="quiz-close-button"
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close quiz"
          style={{
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <X color={colors.cream} size={22} />
        </Pressable>

        <Text
          testID="quiz-score"
          style={{
            fontFamily: fonts.outfit,
            fontSize: 16,
            fontWeight: '700',
            color: colors.gold,
          }}>
          {scoreLabel}
        </Text>
      </View>

      <QuizProgressBar
        totalQuestions={totalQuestions}
        currentIndex={state.currentIndex}
        answerHistory={state.answerHistory}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingBottom: 220,
        }}>
        {currentQuestion && (
          <QuizCard
            question={currentQuestion}
            selectedOptionId={state.selectedOptionId}
            phase={state.phase}
            onSelectOption={handleSelectOption}
          />
        )}

        {currentQuestion && state.phase === 'checked' && (
          <View style={{ marginTop: 16 }}>
            <FeedbackBanner
              visible
              placement="inline"
              isCorrect={!!state.isCorrect}
              correctAnswer={currentQuestion.correctMeaning}
              selectedAnswer={selectedOptionText}
              streakMilestone={streak.milestoneReached}
              onContinue={handleContinue}
              continueLabel="CONTINUE"
              showContinueButton
            />
          </View>
        )}
      </ScrollView>

      {showBottomActions && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'android' ? 34 : 18,
            borderTopWidth: 1,
            borderTopColor: 'rgba(207, 170, 107, 0.18)',
            backgroundColor: 'rgba(7, 20, 17, 0.96)',
            zIndex: 20,
          }}>
          <Pressable
            testID="quiz-check-button"
            onPress={handleCheck}
            disabled={isChecking}
            accessibilityRole="button"
            accessibilityLabel="Check your answer"
            style={{
              backgroundColor: colors.gold,
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              shadowColor: colors.gold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 15,
              elevation: 8,
              opacity: isChecking ? 0.65 : 1,
            }}>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 18,
                fontWeight: '700',
                color: colors.emeraldDeep,
                letterSpacing: 1,
              }}>
              CHECK
            </Text>
          </Pressable>
        </View>
      )}
    </ScreenBackground>
  );
}
