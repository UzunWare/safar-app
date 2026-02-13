/**
 * Review Session Screen
 * Displays review cards sequentially with tap-to-reveal and difficulty rating
 * Divine Geometry Design - Midnight background with parchment cards
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useReviewQueue, type ReviewQueueItem } from '@/lib/hooks/useReviewQueue';
import { useWordProgress } from '@/lib/hooks/useWordProgress';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useContentAccess } from '@/lib/hooks/useContentAccess';
import { recordStreakActivity } from '@/lib/api/streak';
import { onLearningActivityCompleted } from '@/lib/notifications/notificationOrchestrator';
import { onReviewSessionCompleted } from '@/lib/notifications/reviewNotificationOrchestrator';
import { awardXp } from '@/lib/api/xp';
import { calculateReviewXp } from '@/lib/utils/xp';
import { ReviewCard } from '@/components/learning/ReviewCard';
import { DifficultyRating } from '@/components/learning/DifficultyRating';
import { ReviewResults } from '@/components/learning/ReviewResults';
import { PaywallGate } from '@/components/subscription/PaywallGate';
import { type DifficultyRating as Rating } from '@/lib/utils/sm2';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

export default function ReviewSessionScreen() {
  const { data: queue, isLoading, isError } = useReviewQueue();
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const { shouldShowPaywall, isLoading: isSubscriptionLoading } = useContentAccess();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [wordsReviewed, setWordsReviewed] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const currentItem = queue?.[currentIndex];

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const handleDone = useCallback(() => {
    router.replace('/(tabs)/review');
  }, []);

  if (isSubscriptionLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.midnight,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text
          style={{ color: colors.cream, fontFamily: fonts.outfit, fontSize: 16, marginTop: 16 }}>
          Checking subscription...
        </Text>
      </View>
    );
  }

  if (shouldShowPaywall) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.midnight }}>
        <PaywallGate />
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View
        testID="review-session-loading"
        style={{
          flex: 1,
          backgroundColor: colors.midnight,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text
          style={{ color: colors.cream, fontFamily: fonts.outfit, fontSize: 16, marginTop: 16 }}>
          Loading reviews...
        </Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View
        testID="review-session-error"
        style={{
          flex: 1,
          backgroundColor: colors.midnight,
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
          Unable to load reviews
        </Text>
        <Pressable onPress={handleClose}>
          <Text style={{ color: colors.gold, fontFamily: fonts.outfit, fontSize: 16 }}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  // No items (shouldn't happen from Review tab, but handle gracefully)
  if (!queue || queue.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.midnight,
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
          No reviews available
        </Text>
        <Pressable onPress={handleClose}>
          <Text style={{ color: colors.gold, fontFamily: fonts.outfit, fontSize: 16 }}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  // Completion state
  if (isComplete) {
    return <ReviewResults wordsReviewed={wordsReviewed} xpEarned={xpEarned} onDone={handleDone} />;
  }

  const totalCards = queue.length;

  return (
    <SafeAreaView testID="review-session" style={{ flex: 1, backgroundColor: colors.midnight }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 8,
        }}>
        {/* Close button */}
        <Pressable
          testID="review-session-close"
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close review session"
          style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.cream, fontSize: 24 }}>{'\u2715'}</Text>
        </Pressable>

        {/* Progress count */}
        <Text
          testID="review-session-progress"
          style={{ fontFamily: fonts.outfit, fontSize: 14, color: colors.gold }}>
          {currentIndex + 1} / {totalCards}
        </Text>
      </View>

      {/* Progress dots (capped at 20 for large queues) */}
      {totalCards <= 20 ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: 16,
            gap: 4,
          }}>
          {queue.map((_, i) => (
            <View
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i === currentIndex
                    ? colors.gold
                    : i < currentIndex
                      ? colors.goldAlpha[30]
                      : colors.white[10],
              }}
            />
          ))}
        </View>
      ) : (
        <View style={{ alignItems: 'center', paddingBottom: 16 }}>
          <View
            style={{
              backgroundColor: colors.white[10],
              borderRadius: 8,
              height: 4,
              width: 200,
              overflow: 'hidden',
            }}>
            <View
              style={{
                backgroundColor: colors.gold,
                height: 4,
                width: 200 * ((currentIndex + 1) / totalCards),
                borderRadius: 8,
              }}
            />
          </View>
        </View>
      )}

      {/* Review card */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingBottom: 32,
        }}>
        {currentItem && (
          <ReviewCardWithRating
            key={currentItem.word_id}
            item={currentItem}
            revealed={revealed}
            onReveal={handleReveal}
            onRate={(rating: Rating) => {
              const newWordsReviewed = wordsReviewed + 1;
              setWordsReviewed(newWordsReviewed);
              const nextIndex = currentIndex + 1;
              if (nextIndex >= totalCards) {
                setIsComplete(true);
                if (userId) {
                  recordStreakActivity(userId)
                    .then((streak) => onLearningActivityCompleted(streak.currentStreak))
                    .catch(() => onLearningActivityCompleted().catch(() => {}));
                  onReviewSessionCompleted(userId).catch(() => {});
                  const xp = calculateReviewXp(newWordsReviewed);
                  setXpEarned(xp);
                  awardXp(userId, xp)
                    .then(() => {
                      queryClient.invalidateQueries({ queryKey: ['xp'] });
                    })
                    .catch(() => {});
                }
              } else {
                setCurrentIndex(nextIndex);
                setRevealed(false);
              }
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * ReviewCardWithRating - Combines ReviewCard with DifficultyRating
 * Uses useWordProgress hook for the current word's SM2 data
 */
function ReviewCardWithRating({
  item,
  revealed,
  onReveal,
  onRate,
}: {
  item: ReviewQueueItem;
  revealed: boolean;
  onReveal: () => void;
  onRate: (rating: Rating) => void;
}) {
  const { rateWord, isRating } = useWordProgress(item.word_id);

  const handleRate = async (rating: Rating) => {
    await rateWord(rating);
    onRate(rating);
  };

  const currentProgress = {
    easeFactor: item.ease_factor,
    interval: item.interval,
    repetitions: item.repetitions,
  };

  return (
    <View>
      <ReviewCard word={item.word} onReveal={onReveal} />

      {/* Show difficulty rating after reveal */}
      {revealed && (
        <View testID="review-rating-section" style={{ marginTop: 24 }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: colors.cream,
              opacity: 0.5,
              textAlign: 'center',
              marginBottom: 12,
            }}>
            How well did you know this?
          </Text>
          <DifficultyRating
            currentProgress={currentProgress}
            onRate={handleRate}
            disabled={isRating}
          />
        </View>
      )}
    </View>
  );
}
