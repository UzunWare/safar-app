/**
 * Review Tab - Spaced Repetition Review Queue
 * Shows due review count with Start Review CTA, or empty state
 * Divine Geometry Design - Parchment background
 */

import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { useReviewQueue } from '@/lib/hooks/useReviewQueue';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { RotateCcw, BookOpen, Clock } from 'lucide-react-native';

export default function ReviewScreen() {
  const { isLoading, dueCount, nextReviewTime } = useReviewQueue();

  if (isLoading) {
    return (
      <ScreenBackground variant="parchment" patternOpacity={0.02}>
        <View
          testID="review-loading"
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 16,
              color: colors.emeraldDeep,
              marginTop: 16,
              opacity: 0.6,
            }}>
            Checking your reviews...
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  if (dueCount === 0) {
    return (
      <ScreenBackground variant="parchment" patternOpacity={0.02}>
        <View
          testID="review-empty"
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          {/* Success icon */}
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: 'rgba(207, 170, 107, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}>
            <Clock color={colors.gold} size={32} />
          </View>

          <Text
            testID="review-empty-title"
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 26,
              color: colors.emeraldDeep,
              textAlign: 'center',
              marginBottom: 8,
            }}>
            All caught up!
          </Text>

          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 16,
              color: 'rgba(15, 46, 40, 0.6)',
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: nextReviewTime ? 12 : 32,
            }}>
            No reviews due right now.{'\n'}Keep learning to build your review queue.
          </Text>

          {nextReviewTime && (
            <Text
              testID="review-next-time"
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: 'rgba(15, 46, 40, 0.45)',
                textAlign: 'center',
                marginBottom: 32,
              }}>
              Next review: {formatRelativeTime(nextReviewTime)}
            </Text>
          )}

          {/* Continue Learning button */}
          <Pressable
            testID="review-continue-learning"
            onPress={() => router.replace('/(tabs)/learn')}
            style={{
              backgroundColor: colors.gold,
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              shadowColor: colors.gold,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 4,
            }}>
            <BookOpen color={colors.midnight} size={18} />
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 16,
                fontWeight: '600',
                color: colors.midnight,
              }}>
              Continue Learning
            </Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground variant="parchment" patternOpacity={0.02}>
      <View style={{ flex: 1, padding: 24, paddingTop: 48 }}>
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 30,
              color: colors.emeraldDeep,
              marginBottom: 4,
            }}>
            Review
          </Text>
          <Text style={{ fontFamily: fonts.outfit, fontSize: 16, color: 'rgba(15, 46, 40, 0.6)' }}>
            Strengthen your vocabulary
          </Text>
        </View>

        {/* Due count display */}
        <View
          testID="review-count-card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            padding: 32,
            alignItems: 'center',
            marginBottom: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.03,
            shadowRadius: 6,
            elevation: 1,
            borderWidth: 1,
            borderColor: 'rgba(15, 46, 40, 0.05)',
          }}>
          {/* Review icon */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(207, 170, 107, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
            <RotateCcw color={colors.gold} size={26} />
          </View>

          {/* Count */}
          <Text
            testID="review-due-count"
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 56,
              color: colors.emeraldDeep,
              marginBottom: 4,
            }}>
            {dueCount}
          </Text>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: colors.emeraldDeep,
              opacity: 0.5,
            }}>
            words ready for review
          </Text>
        </View>

        {/* Start Review button */}
        <Pressable
          testID="review-start-button"
          onPress={() => {
            // Only navigate if there are reviews due
            if (dueCount > 0) {
              router.push('/review/session');
            }
          }}
          disabled={dueCount === 0}
          style={{
            backgroundColor: colors.gold,
            paddingVertical: 18,
            borderRadius: 16,
            alignItems: 'center',
            shadowColor: colors.gold,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 4,
          }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 18,
              fontWeight: '600',
              color: colors.midnight,
            }}>
            Start Review
          </Text>
        </Pressable>

        {/* Footer encouragement */}
        <View style={{ marginTop: 'auto', paddingBottom: 120, paddingTop: 16 }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: 'uppercase',
              textAlign: 'center',
              color: 'rgba(15, 46, 40, 0.3)',
            }}>
            Consistency builds mastery
          </Text>
        </View>
      </View>
    </ScreenBackground>
  );
}

function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const target = new Date(isoString);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return 'now';

  const diffMins = Math.round(diffMs / (1000 * 60));
  if (diffMins < 60) return `in ${diffMins} min`;

  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `in ${diffHours}h`;

  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return `in ${diffDays}d`;
}
