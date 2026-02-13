/**
 * Home Screen - Dashboard
 * Parchment background, progress stats, pathway card, Word of the Day
 * Divine Geometry design system
 * Story 5.1: Progress Dashboard
 */

import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { BookOpen, Settings, Star, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePathway } from '@/lib/hooks/usePathway';
import { useProgress } from '@/lib/hooks/useProgress';
import { useProgressStats } from '@/lib/hooks/useProgressStats';
import { useStreak } from '@/lib/hooks/useStreak';
import { useXp } from '@/lib/hooks/useXp';
import { useReviewQueue } from '@/lib/hooks/useReviewQueue';
import { useWordOfTheDay } from '@/lib/hooks/useWordOfTheDay';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useSettingsStore } from '@/lib/stores/useSettingsStore';
import { ProgressRing } from '@/components/progress/ProgressRing';
import { StreakCounter } from '@/components/progress/StreakCounter';
import { StreakReminder } from '@/components/progress/StreakReminder';
import { WelcomeBack } from '@/components/progress/WelcomeBack';
import { XpDisplay } from '@/components/progress/XpDisplay';
import { StreakFreezeButton } from '@/components/progress/StreakFreezeButton';
import { FreezeConfirmModal } from '@/components/progress/FreezeConfirmModal';
import { AudioButton } from '@/components/learning/AudioButton';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { updateNotificationSchedule } from '@/lib/notifications/notificationOrchestrator';
import {
  updateReviewNotificationSchedule,
  updateBadgeCount,
} from '@/lib/notifications/reviewNotificationOrchestrator';
import type { Unit } from '@/types/supabase.types';
import '@/global.css';

/** Progress dot matching prototype pathway cards */
function DashboardDot({ state }: { state: 'completed' | 'active' | 'locked' }) {
  const size = state === 'active' ? 16 : 12;
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      {state === 'active' && (
        <View
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#fff',
            opacity: 0.3,
          }}
        />
      )}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor:
            state === 'completed'
              ? colors.gold
              : state === 'active'
                ? '#ffffff'
                : 'rgba(255, 255, 255, 0.2)',
          ...(state === 'active' && {
            shadowColor: '#fff',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 4,
          }),
        }}
      />
    </View>
  );
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HomeScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const streakRemindersEnabled = useSettingsStore((s) => s.streakReminders);
  const reviewRemindersEnabled = useSettingsStore((s) => s.reviewReminders);
  const { data: pathway } = usePathway();
  const units = pathway?.units ?? [];
  const progress = useProgress(units);
  const stats = useProgressStats(progress.pathwayPercent, progress.isLoading);
  const {
    status: streakStatus,
    currentStreak,
    freezeAvailable,
    nextFreezeDate,
    useFreeze: applyFreeze,
    isLoading: streakLoading,
  } = useStreak();
  const { totalXp } = useXp();
  const { dueCount } = useReviewQueue();
  const { data: wordOfTheDay } = useWordOfTheDay();
  const isEvening = new Date().getHours() >= 18;
  const hasDashboardData = !!pathway || !!stats.lastSynced;
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeLoading, setFreezeLoading] = useState(false);

  // Show freeze button when user hasn't learned today and streak would be at risk or broken
  const showFreezeOption = streakStatus === 'at-risk' || streakStatus === 'broken';

  const handleUseFreeze = useCallback(async () => {
    setFreezeLoading(true);
    try {
      await applyFreeze();
      setShowFreezeModal(false);
      Alert.alert('Streak preserved! Learn tomorrow to continue.');
    } finally {
      setFreezeLoading(false);
    }
  }, [applyFreeze]);

  const handleOpenProgressDetails = useCallback(() => {
    router.push('/(tabs)/progress' as any);
  }, [router]);

  const handleContinue = useCallback(() => {
    if (progress.nextLessonId) {
      router.push(`/lesson/${progress.nextLessonId}` as any);
    } else {
      router.push('/(tabs)/learn' as any);
    }
  }, [progress.nextLessonId, router]);

  useEffect(() => {
    if (streakLoading) return;

    updateNotificationSchedule({
      currentStreak,
      hasLearnedToday: streakStatus === 'active',
      enabled: streakRemindersEnabled,
    }).catch(() => {
      // Best effort only
    });
  }, [currentStreak, streakStatus, streakLoading, streakRemindersEnabled]);

  useEffect(() => {
    if (!userId) return;

    updateReviewNotificationSchedule(userId, undefined, reviewRemindersEnabled).catch(() => {
      // Best effort only
    });

    updateBadgeCount(userId).catch(() => {
      // Best effort only
    });
  }, [userId, dueCount, reviewRemindersEnabled]);

  return (
    <ScreenBackground variant="parchment" patternOpacity={0.02}>
      <ScrollView
        testID="home-screen"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 24,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(15, 46, 40, 0.05)',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>
          <View>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: 'rgba(15, 46, 40, 0.5)',
                marginBottom: 4,
              }}>
              Current Path
            </Text>
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 30,
                lineHeight: 36,
                color: colors.emeraldDeep,
              }}>
              Your Journey
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile' as any)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(15, 46, 40, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel="Settings">
            <Settings color={colors.emeraldDeep} size={18} />
          </Pressable>
        </View>

        <View style={{ padding: 24, gap: 24 }}>
          {/* Progress Stats Section — AC#1, AC#2 */}
          {hasDashboardData && (
            <View style={{ gap: 16 }}>
              {/* Row 1: Progress Ring + Streak */}
              <View style={{ flexDirection: 'row', gap: 16 }}>
                {/* Pathway Progress Ring Card — taps to Progress tab (AC#2) */}
                <Pressable
                  testID="progress-ring-card"
                  onPress={handleOpenProgressDetails}
                  style={{
                    flex: 1,
                    backgroundColor: '#ffffff',
                    padding: 20,
                    borderRadius: 20,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 6,
                    elevation: 1,
                    borderWidth: 1,
                    borderColor: 'rgba(15, 46, 40, 0.05)',
                  }}>
                  <ProgressRing percentage={stats.pathwayPercentage} size={100} strokeWidth={8} />
                  <Text
                    style={{
                      fontFamily: fonts.outfit,
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      color: colors.emeraldDeep,
                      opacity: 0.5,
                      marginTop: 8,
                    }}>
                    Pathway
                  </Text>
                </Pressable>

                {/* Streak Counter */}
                <Pressable
                  testID="streak-counter-card"
                  onPress={handleOpenProgressDetails}
                  style={{ flex: 1 }}
                  accessibilityRole="button"
                  accessibilityLabel="Open progress details from streak">
                  <StreakCounter count={stats.currentStreak} isActive={stats.currentStreak > 0} />
                </Pressable>
              </View>

              {/* Row 2: Words Learned + Mastered */}
              <View style={{ flexDirection: 'row', gap: 16 }}>
                {/* Words Learned Card */}
                <Pressable
                  testID="words-learned-count"
                  onPress={handleOpenProgressDetails}
                  style={{
                    flex: 1,
                    backgroundColor: '#ffffff',
                    padding: 20,
                    borderRadius: 20,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 6,
                    elevation: 1,
                    borderWidth: 1,
                    borderColor: 'rgba(15, 46, 40, 0.05)',
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Open progress details from words learned">
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: 'rgba(15, 46, 40, 0.1)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}>
                    <BookOpen color={colors.emeraldDeep} size={20} />
                  </View>
                  <Text
                    style={{
                      fontFamily: fonts.fraunces,
                      fontSize: 30,
                      color: colors.emeraldDeep,
                    }}>
                    {stats.wordsLearned}
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
                    Words Learned
                  </Text>
                </Pressable>

                {/* Mastered Words Card */}
                <Pressable
                  testID="mastered-count"
                  onPress={handleOpenProgressDetails}
                  style={{
                    flex: 1,
                    backgroundColor: '#ffffff',
                    padding: 20,
                    borderRadius: 20,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 6,
                    elevation: 1,
                    borderWidth: 1,
                    borderColor: 'rgba(15, 46, 40, 0.05)',
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Open progress details from mastered words">
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: 'rgba(207, 170, 107, 0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}>
                    <Star color={colors.gold} size={20} fill={colors.gold} />
                  </View>
                  <Text
                    style={{
                      fontFamily: fonts.fraunces,
                      fontSize: 30,
                      color: colors.emeraldDeep,
                    }}>
                    {stats.wordsMastered}
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
                    Mastered
                  </Text>
                </Pressable>
              </View>

              {/* Row 3: Total XP — Story 5.4 */}
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Pressable
                  testID="xp-display-card"
                  onPress={handleOpenProgressDetails}
                  style={{ flex: 1 }}
                  accessibilityRole="button"
                  accessibilityLabel="Open progress details from XP">
                  <XpDisplay totalXp={totalXp} />
                </Pressable>
              </View>

              {/* Streak Freeze Button — Story 5.3 */}
              {showFreezeOption && currentStreak > 0 && (
                <StreakFreezeButton
                  isAvailable={freezeAvailable}
                  nextAvailableDate={nextFreezeDate}
                  onPress={() => setShowFreezeModal(true)}
                />
              )}

              {/* Last synced indicator — AC#3 */}
              {stats.lastSynced && (
                <Text
                  testID="last-synced"
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 11,
                    color: 'rgba(15, 46, 40, 0.35)',
                    textAlign: 'center',
                  }}>
                  Last synced {formatTimeAgo(stats.lastSynced)}
                </Text>
              )}
            </View>
          )}

          {/* Streak At-Risk Reminder — Story 5.2 AC#3 */}
          <StreakReminder status={streakStatus} streakCount={currentStreak} isEvening={isEvening} />

          {/* Welcome Back — Story 5.2 AC#4 */}
          {streakStatus === 'broken' && hasDashboardData && <WelcomeBack dueReviews={dueCount} />}

          {/* Continue Learning CTA — Task 8 */}
          {pathway && progress.nextLessonId && (
            <Pressable
              testID="continue-learning-cta"
              onPress={handleContinue}
              style={{
                backgroundColor: colors.emeraldDeep,
                borderRadius: 20,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                shadowColor: colors.emeraldDeep,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 3,
              }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 10,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: 4,
                  }}>
                  Continue Learning
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.fraunces,
                    fontSize: 18,
                    color: '#ffffff',
                  }}>
                  Next Lesson
                </Text>
              </View>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.gold,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ChevronRight color={colors.emeraldDeep} size={20} />
              </View>
            </Pressable>
          )}

          {/* Pathway Hero Card */}
          {pathway && (
            <Pressable onPress={handleContinue} style={{ borderRadius: 32, overflow: 'hidden' }}>
              <LinearGradient
                colors={[colors.salah.gradient1, colors.salah.gradient2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 32 }}>
                {/* Decorative blur orbs */}
                <View
                  style={{
                    position: 'absolute',
                    top: -60,
                    right: -60,
                    width: 160,
                    height: 160,
                    borderRadius: 80,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: -50,
                    left: -50,
                    width: 140,
                    height: 140,
                    borderRadius: 70,
                    backgroundColor: 'rgba(207, 170, 107, 0.05)',
                  }}
                />

                {/* Icon + step count */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 24,
                  }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <BookOpen color="rgba(167, 243, 208, 0.9)" size={24} />
                  </View>
                  <View
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 20,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.outfit,
                        fontSize: 12,
                        fontWeight: '500',
                        letterSpacing: 0.5,
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}>
                      {progress.pathwayPercent > 0
                        ? `${progress.pathwayPercent}% Complete`
                        : `${units.length} Units`}
                    </Text>
                  </View>
                </View>

                {/* Title + description */}
                <Text
                  style={{
                    fontFamily: fonts.fraunces,
                    fontSize: 30,
                    color: '#fff',
                    marginBottom: 8,
                    lineHeight: 36,
                  }}>
                  {pathway.name}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontWeight: '300',
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: 32,
                    lineHeight: 22,
                  }}>
                  {pathway.description}
                </Text>

                {/* Progress dots */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {units.slice(0, 5).map((u: Unit, idx: number) => {
                    const unitComplete = progress.isUnitComplete(u.id);
                    const unitPct = progress.unitPercent(u.id);
                    const dotState: 'completed' | 'active' | 'locked' = unitComplete
                      ? 'completed'
                      : unitPct > 0 || idx === 0
                        ? 'active'
                        : 'locked';
                    return (
                      <View key={u.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <DashboardDot state={dotState} />
                        {idx < Math.min(units.length - 1, 4) && (
                          <View
                            style={{
                              width: 24,
                              height: 2,
                              borderRadius: 1,
                              marginHorizontal: 2,
                              backgroundColor:
                                dotState === 'completed' ? colors.gold : 'rgba(255, 255, 255, 0.1)',
                            }}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              </LinearGradient>
            </Pressable>
          )}

          {/* Word of the Day Card */}
          {wordOfTheDay && (
            <View
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: 'rgba(15, 46, 40, 0.05)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
                overflow: 'hidden',
              }}>
              {/* Decorative gold corner */}
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 96,
                  height: 96,
                  backgroundColor: 'rgba(207, 170, 107, 0.1)',
                  borderBottomLeftRadius: 64,
                }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Text style={{ fontSize: 18, color: colors.gold }}>☀</Text>
                <Text style={{ fontFamily: fonts.fraunces, fontSize: 18, color: colors.emeraldDeep }}>
                  Word of the Day
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <Text
                    style={{
                      fontFamily: fonts.amiri,
                      fontSize: 36,
                      color: colors.emeraldDeep,
                      marginBottom: 4,
                    }}>
                    {wordOfTheDay.arabic}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.outfit,
                      fontSize: 14,
                      color: 'rgba(15, 46, 40, 0.6)',
                      fontWeight: '500',
                    }}>
                    {wordOfTheDay.transliteration} · {wordOfTheDay.meaning}
                  </Text>
                </View>
                <AudioButton audioUrl={wordOfTheDay.audio_url} />
              </View>
            </View>
          )}

          {/* Empty state */}
          {!pathway && (
            <View
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 24,
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(15, 46, 40, 0.05)',
              }}>
              <BookOpen color={colors.gold} size={36} />
              <Text
                style={{
                  fontFamily: fonts.fraunces,
                  fontSize: 20,
                  color: colors.emeraldDeep,
                  marginTop: 16,
                  textAlign: 'center',
                }}>
                Start Your Journey
              </Text>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 14,
                  color: 'rgba(15, 46, 40, 0.6)',
                  marginTop: 8,
                  textAlign: 'center',
                }}>
                Begin your first lesson to see your learning progress here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Freeze Confirmation Modal — Story 5.3 */}
      <FreezeConfirmModal
        visible={showFreezeModal}
        onConfirm={handleUseFreeze}
        onCancel={() => setShowFreezeModal(false)}
        isLoading={freezeLoading}
      />
    </ScreenBackground>
  );
}
