/**
 * Learn Tab - Pathway & Unit Navigation
 * Divine Geometry Design - Dark (Midnight) theme
 * Uses shared ScreenBackground, IslamicPattern, ProgressDot
 */

import { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  Droplets,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePathway, HIGH_FREQUENCY_PATHWAY_ID } from '@/lib/hooks/usePathway';
import { colors } from '@/constants/colors';
import { useLessons } from '@/lib/hooks/useLessons';
import { useProgress } from '@/lib/hooks/useProgress';
import { syncOfflineProgress } from '@/lib/api/progress';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useContentAccess } from '@/lib/hooks/useContentAccess';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { ProgressDot } from '@/components/ui/ProgressDot';
import { PaywallGate } from '@/components/subscription/PaywallGate';
import type { Unit, Lesson } from '@/types/supabase.types';
import '@/global.css';

function UnitLessonList({
  unitId,
  isLessonComplete,
}: {
  unitId: string;
  isLessonComplete: (id: string) => boolean;
}) {
  const router = useRouter();
  const { data: lessons, isLoading } = useLessons(unitId);

  if (isLoading) {
    return (
      <View className="px-5 py-4">
        <ActivityIndicator size="small" color="#cfaa6b" />
      </View>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <View className="px-5 py-4">
        <Text className="text-sm text-cream/40" style={{ fontFamily: 'Outfit' }}>
          No lessons available yet
        </Text>
      </View>
    );
  }

  return (
    <View testID="lesson-list" className="px-4 pb-5 pt-1">
      {lessons.map((lesson: Lesson, idx: number) => {
        const completed = isLessonComplete(lesson.id);
        return (
          <Pressable
            key={lesson.id}
            testID={`lesson-${lesson.id}`}
            onPress={() => {
              const lessonType: 'word' | 'root' | 'frequency' =
                lesson.lesson_type === 'root' || lesson.lesson_type === 'frequency'
                  ? lesson.lesson_type
                  : 'word';
              if (lessonType === 'frequency') {
                router.push(`/frequency-lesson/${lesson.id}` as any);
              } else if (lessonType === 'root') {
                router.push(`/root-lesson/${lesson.id}` as any);
              } else {
                router.push(`/lesson/${lesson.id}` as any);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={`${lesson.name}, ${lesson.word_count} words${completed ? ', completed' : ''}`}
            className="mb-2 flex-row items-center justify-between overflow-hidden rounded-2xl p-4 active:opacity-80"
            style={{
              backgroundColor: 'rgba(244, 241, 234, 0.06)',
              borderWidth: 1,
              borderColor: completed ? 'rgba(207, 170, 107, 0.25)' : 'rgba(207, 170, 107, 0.12)',
            }}>
            {/* Decorative corner accent - top right */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 40,
                height: 40,
                backgroundColor: 'rgba(207, 170, 107, 0.08)',
                borderBottomLeftRadius: 40,
              }}
            />
            <View className="flex-1 flex-row items-center gap-3">
              {/* Lesson status indicator */}
              {completed ? (
                <View
                  className="h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(207, 170, 107, 0.15)' }}>
                  <CheckCircle color="#cfaa6b" size={18} />
                </View>
              ) : (
                <View
                  className="h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: 'rgba(207, 170, 107, 0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(207, 170, 107, 0.2)',
                  }}>
                  <Text
                    className="text-xs text-gold"
                    style={{ fontFamily: 'Outfit', fontWeight: '500' }}>
                    {idx + 1}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text
                  className="text-base text-cream"
                  style={{ fontFamily: 'Outfit', fontWeight: '400' }}>
                  {lesson.name}
                </Text>
                <Text className="mt-0.5 text-xs text-cream/40" style={{ fontFamily: 'Outfit' }}>
                  {lesson.lesson_type === 'root'
                    ? 'Interactive lesson'
                    : `${lesson.word_count} words`}
                </Text>
              </View>
            </View>
            <ChevronRight color="rgba(207, 170, 107, 0.4)" size={18} />
          </Pressable>
        );
      })}
    </View>
  );
}

function UnitItem({
  unit,
  index,
  isComplete,
  percent,
  isLessonComplete,
}: {
  unit: Unit;
  index: number;
  isComplete: boolean;
  percent: number;
  isLessonComplete: (id: string) => boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="mx-6 mb-4">
      <Pressable
        testID={`unit-${unit.id}`}
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={`Unit ${index + 1}: ${unit.name}, ${unit.word_count} words`}
        className="overflow-hidden active:opacity-90"
        style={{
          backgroundColor: '#0f2e28',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: expanded ? 'rgba(207, 170, 107, 0.25)' : 'rgba(255, 255, 255, 0.06)',
        }}>
        {/* Layered glow orb - top right */}
        <View className="absolute -right-10 -top-10" style={{ width: 100, height: 100 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: expanded
                ? 'rgba(207, 170, 107, 0.04)'
                : 'rgba(255, 255, 255, 0.015)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 15,
              left: 15,
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: expanded ? 'rgba(207, 170, 107, 0.06)' : 'rgba(255, 255, 255, 0.02)',
            }}
          />
        </View>
        {/* Layered glow orb - bottom left */}
        <View className="absolute -bottom-8 -left-8" style={{ width: 80, height: 80 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: expanded
                ? 'rgba(207, 170, 107, 0.03)'
                : 'rgba(207, 170, 107, 0.015)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: expanded ? 'rgba(207, 170, 107, 0.05)' : 'rgba(207, 170, 107, 0.02)',
            }}
          />
        </View>

        <View className="flex-row items-center justify-between p-5">
          <View className="flex-1 flex-row items-center gap-4">
            {/* Unit number badge / completion diamond */}
            {isComplete ? (
              <View
                className="h-12 w-12 items-center justify-center"
                style={{
                  backgroundColor: 'rgba(207, 170, 107, 0.15)',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(207, 170, 107, 0.25)',
                  transform: [{ rotate: '45deg' }],
                }}>
                <View style={{ transform: [{ rotate: '-45deg' }] }}>
                  <CheckCircle color="#cfaa6b" size={22} />
                </View>
              </View>
            ) : (
              <View
                className="h-12 w-12 items-center justify-center"
                style={{
                  backgroundColor: expanded
                    ? 'rgba(207, 170, 107, 0.15)'
                    : 'rgba(255, 255, 255, 0.06)',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: expanded ? 'rgba(207, 170, 107, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                }}>
                <Text
                  className="text-base"
                  style={{
                    fontFamily: 'Fraunces',
                    fontWeight: '600',
                    color: expanded ? '#cfaa6b' : 'rgba(232, 220, 197, 0.7)',
                  }}>
                  {index + 1}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text
                className="text-lg"
                style={{
                  fontFamily: 'Fraunces',
                  fontWeight: '400',
                  color: expanded ? '#e8dcc5' : 'rgba(232, 220, 197, 0.85)',
                }}>
                {unit.name}
              </Text>
              <Text className="mt-1 text-xs text-cream/40" style={{ fontFamily: 'Outfit' }}>
                {unit.word_count} words ·{' '}
                {isComplete ? 'Complete' : percent > 0 ? `${percent}% done` : 'Not started'}
              </Text>
            </View>
          </View>

          {/* Chevron */}
          <View
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: expanded ? 'rgba(207, 170, 107, 0.1)' : 'transparent' }}>
            {expanded ? (
              <ChevronDown color="rgba(207, 170, 107, 0.7)" size={20} />
            ) : (
              <ChevronRight color="rgba(232, 220, 197, 0.3)" size={20} />
            )}
          </View>
        </View>
      </Pressable>

      {/* Expanded lesson list - slides below the card */}
      {expanded && (
        <View
          className="mt-1 overflow-hidden"
          style={{
            backgroundColor: 'rgba(15, 46, 40, 0.6)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(207, 170, 107, 0.1)',
          }}>
          <UnitLessonList unitId={unit.id} isLessonComplete={isLessonComplete} />
        </View>
      )}
    </View>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const { data: pathway, isLoading, isError, refetch } = usePathway();
  const { data: freqPathway } = usePathway(HIGH_FREQUENCY_PATHWAY_ID);
  const userId = useAuthStore((s) => s.user?.id);
  const { shouldShowPaywall, isLoading: isSubscriptionLoading } = useContentAccess();

  const units = pathway?.units ?? [];
  const progress = useProgress(units);

  // H1: Sync any offline completions when screen mounts
  useEffect(() => {
    if (userId) {
      syncOfflineProgress(userId).catch(() => {});
    }
  }, [userId]);

  const handleContinue = useCallback(() => {
    if (progress.nextLessonId) {
      router.push(`/lesson/${progress.nextLessonId}` as any);
    }
  }, [progress.nextLessonId, router]);

  if (isSubscriptionLoading) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.03}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#cfaa6b" />
          <Text style={{ marginTop: 16, color: 'rgba(232, 220, 197, 0.6)', fontFamily: 'Outfit' }}>
            Checking subscription...
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  if (shouldShowPaywall) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.03}>
        <PaywallGate />
      </ScreenBackground>
    );
  }

  if (isLoading) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.03}>
        <View
          testID="learn-loading"
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#cfaa6b" />
          <Text style={{ marginTop: 16, color: 'rgba(232, 220, 197, 0.6)', fontFamily: 'Outfit' }}>
            Loading your pathway...
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  if (isError || !pathway) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.03}>
        <View
          testID="learn-error"
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}>
          <BookOpen color="#cfaa6b" size={48} />
          <Text
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: 20,
              color: '#e8dcc5',
              fontFamily: 'Fraunces',
            }}>
            Unable to load pathway
          </Text>
          <Text
            style={{
              marginTop: 8,
              textAlign: 'center',
              fontSize: 14,
              color: 'rgba(232, 220, 197, 0.6)',
              fontFamily: 'Outfit',
            }}>
            Please check your connection and try again.
          </Text>
          <Pressable
            testID="retry-button"
            onPress={() => refetch()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading pathway"
            style={{
              marginTop: 24,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: 'rgba(207, 170, 107, 0.2)',
            }}>
            <RefreshCw color="#cfaa6b" size={16} />
            <Text
              style={{ fontSize: 14, color: '#cfaa6b', fontFamily: 'Outfit', fontWeight: '500' }}>
              Try Again
            </Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground variant="midnight" patternOpacity={0.03}>
      <ScrollView style={{ flex: 1 }} testID="learn-screen">
        {/* Pathway Hero Card */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
          <View
            style={{
              borderRadius: 32,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.35,
              shadowRadius: 30,
              elevation: 16,
            }}>
            <LinearGradient
              colors={['#065f46', '#022c22']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: 32,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}>
              {/* Layered glow orb - top right (simulates blur-3xl) */}
              <View style={{ position: 'absolute', top: -64, right: -64, width: 160, height: 160 }}>
                <View
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: 80,
                    backgroundColor: 'rgba(255, 255, 255, 0.015)',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: 'rgba(255, 255, 255, 0.025)',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 40,
                    left: 40,
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(255, 255, 255, 0.035)',
                  }}
                />
              </View>
              {/* Layered glow orb - bottom left (gold, simulates blur-3xl) */}
              <View
                style={{ position: 'absolute', bottom: -80, left: -80, width: 180, height: 180 }}>
                <View
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 90,
                    backgroundColor: 'rgba(207, 170, 107, 0.02)',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 25,
                    left: 25,
                    width: 130,
                    height: 130,
                    borderRadius: 65,
                    backgroundColor: 'rgba(207, 170, 107, 0.04)',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 50,
                    left: 50,
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(207, 170, 107, 0.06)',
                  }}
                />
              </View>

              {/* Header row */}
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
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}>
                  <BookOpen color="#6ee7b7" size={24} />
                </View>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 20,
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontFamily: 'Outfit',
                      fontWeight: '500',
                      letterSpacing: 0.5,
                    }}>
                    {units.filter((u: Unit) => progress.isUnitComplete(u.id)).length}/{units.length}{' '}
                    Steps
                  </Text>
                </View>
              </View>

              {/* Title + description */}
              <Text
                style={{
                  fontSize: 30,
                  color: '#fff',
                  marginBottom: 8,
                  fontFamily: 'Fraunces',
                  lineHeight: 36,
                }}>
                {pathway.name}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: 32,
                  fontFamily: 'Outfit',
                  fontWeight: '300',
                  lineHeight: 22,
                }}>
                {pathway.description}
              </Text>

              {/* Progress dots - 3-state with ping animation on active */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {units.slice(0, 4).map((u: Unit, idx: number) => {
                  const unitComplete = progress.isUnitComplete(u.id);
                  const unitPct = progress.unitPercent(u.id);
                  const dotState: 'completed' | 'active' | 'locked' = unitComplete
                    ? 'completed'
                    : unitPct > 0 || idx === 0
                      ? 'active'
                      : 'locked';
                  return (
                    <View key={u.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ProgressDot state={dotState} />
                      {idx < Math.min(units.length - 1, 3) && (
                        <View
                          style={{
                            width: 24,
                            height: 2,
                            borderRadius: 1,
                            marginHorizontal: 4,
                            backgroundColor:
                              dotState === 'completed' ? '#cfaa6b' : 'rgba(255, 255, 255, 0.1)',
                          }}
                        />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Continue button */}
              <Pressable
                testID="continue-button"
                onPress={handleContinue}
                disabled={!progress.nextLessonId}
                accessibilityRole="button"
                accessibilityLabel="Continue learning"
                accessibilityState={{ disabled: !progress.nextLessonId }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 28,
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: progress.nextLessonId ? '#cfaa6b' : 'rgba(207, 170, 107, 0.3)',
                }}>
                {progress.isLoading ? (
                  <ActivityIndicator size="small" color="#0a1f1b" />
                ) : (
                  <>
                    <Text
                      style={{
                        fontSize: 16,
                        color: '#0a1f1b',
                        fontFamily: 'Fraunces',
                        fontWeight: '600',
                      }}>
                      Continue Learning
                    </Text>
                    <ArrowRight color="#0a1f1b" size={18} />
                  </>
                )}
              </Pressable>
            </LinearGradient>
          </View>
        </View>

        {/* High Frequency Pathway Card */}
        {freqPathway && (
          <View
            testID="frequency-pathway-card"
            style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
            <View
              style={{
                borderRadius: 32,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.35,
                shadowRadius: 30,
                elevation: 16,
              }}>
              <LinearGradient
                colors={[colors.frequency.gradient1, colors.frequency.gradient2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 32,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}>
                {/* Layered glow orb - top right */}
                <View
                  style={{ position: 'absolute', top: -64, right: -64, width: 160, height: 160 }}>
                  <View
                    style={{
                      width: 160,
                      height: 160,
                      borderRadius: 80,
                      backgroundColor: 'rgba(255, 255, 255, 0.015)',
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 20,
                      left: 20,
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      backgroundColor: 'rgba(255, 255, 255, 0.025)',
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 40,
                      left: 40,
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: 'rgba(255, 255, 255, 0.035)',
                    }}
                  />
                </View>
                {/* Layered glow orb - bottom left (blue tinted) */}
                <View
                  style={{ position: 'absolute', bottom: -80, left: -80, width: 180, height: 180 }}>
                  <View
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: 90,
                      backgroundColor: 'rgba(147, 197, 253, 0.02)',
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 25,
                      left: 25,
                      width: 130,
                      height: 130,
                      borderRadius: 65,
                      backgroundColor: 'rgba(147, 197, 253, 0.04)',
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 50,
                      left: 50,
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: 'rgba(147, 197, 253, 0.06)',
                    }}
                  />
                </View>

                {/* Header row */}
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
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }}>
                    <Droplets color={colors.frequency.accent} size={24} />
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: 20,
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.frequency.accent,
                        fontFamily: 'Outfit',
                        fontWeight: '500',
                        letterSpacing: 0.5,
                      }}>
                      Coming Soon
                    </Text>
                  </View>
                </View>

                {/* Title + description */}
                <Text
                  style={{
                    fontSize: 30,
                    color: '#fff',
                    marginBottom: 8,
                    fontFamily: 'Fraunces',
                    lineHeight: 36,
                  }}>
                  {freqPathway.name}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: 32,
                    fontFamily: 'Outfit',
                    fontWeight: '300',
                    lineHeight: 22,
                  }}>
                  {freqPathway.description}
                </Text>

                {/* Coming Soon badge */}
                <View
                  testID="frequency-coming-soon-badge"
                  accessibilityLabel="High Frequency pathway coming soon"
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 28,
                    paddingVertical: 14,
                    paddingHorizontal: 24,
                    borderRadius: 16,
                    backgroundColor: colors.frequency.accentAlpha20,
                    borderWidth: 1,
                    borderColor: colors.frequency.accentAlpha10,
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.frequency.accent,
                      fontFamily: 'Fraunces',
                      fontWeight: '600',
                      letterSpacing: 1,
                    }}>
                    Coming Soon
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Units Section */}
        <View style={{ marginTop: 24, paddingBottom: 128 }}>
          <Text
            style={{
              paddingHorizontal: 24,
              marginBottom: 16,
              fontSize: 10,
              color: 'rgba(232, 220, 197, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: 3,
              fontFamily: 'Outfit',
              fontWeight: '500',
            }}>
            Units
          </Text>
          {units.map((unit: Unit, index: number) => (
            <UnitItem
              key={unit.id}
              unit={unit}
              index={index}
              isComplete={progress.isUnitComplete(unit.id)}
              percent={progress.unitPercent(unit.id)}
              isLessonComplete={progress.isLessonComplete}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
