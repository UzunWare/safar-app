/**
 * Profile Tab - Traveler's Log
 * Parchment background, stats grid, milestone badges
 * Matches prototype ProfileView exactly
 * UPDATED: Story 4.6 - Added learning state summary (Issue #3 fix)
 */

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Zap, BookOpen, LogOut, Settings, Star } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { resetOnboarding } from '@/lib/api/progress';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { DiamondBadge } from '@/components/ui/DiamondBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DeleteAccountDialog } from '@/components/ui/DeleteAccountDialog';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { useLearningStateSummary } from '@/lib/hooks/useLearningStateSummary';
import { useMasteredCount } from '@/lib/hooks/useMasteredCount';
import { useXp } from '@/lib/hooks/useXp';
import { useStreak } from '@/lib/hooks/useStreak';
import { getStateColor, getStateLabel } from '@/lib/utils/learningState';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import '@/global.css';

const BADGES = [
  { id: 1, name: 'First Step', icon: '🌱', earned: true },
  { id: 2, name: 'Root Seeker', icon: '🔍', earned: true },
  { id: 3, name: 'Salah Master', icon: '🕌', earned: false },
  { id: 4, name: 'Daily Star', icon: '⭐', earned: false },
];

export default function ProfileScreen() {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetOnboardingDialog, setShowResetOnboardingDialog] = useState(false);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const isDeletingAccount = useAuthStore((state) => state.isDeletingAccount);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  // Story 4.6: Learning state summary (AC#1, AC#2 - Issue #3 fix)
  const { data: summary, error: summaryError } = useLearningStateSummary();
  const { data: masteredCount, error: masteredError } = useMasteredCount();
  const { totalXp } = useXp();
  const { currentStreak, status: streakStatus } = useStreak();

  const handleSignOut = async () => {
    setShowSignOutDialog(false);
    await signOut();
  };

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.success) {
      setShowDeleteDialog(false);
    }
  };

  const handleResetOnboarding = async () => {
    if (!user) return;
    setShowResetOnboardingDialog(false);
    const result = await resetOnboarding(user.id);
    if (result.success) {
      useAuthStore.getState().setOnboardingCompleted(false);
      router.replace('/onboarding');
    } else {
      Alert.alert('Reset Failed', result.error || 'Could not reset onboarding. Please try again.');
    }
  };

  return (
    <ScreenBackground variant="parchment" patternOpacity={0.02}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ padding: 24, paddingTop: 48 }}>
          {/* Header */}
          <Pressable
            onLongPress={() => setShowResetOnboardingDialog(true)}
            accessibilityLabel="Profile header - long press for dev options">
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 32,
              }}>
              <View>
                <Text
                  style={{
                    fontFamily: fonts.fraunces,
                    fontSize: 30,
                    color: colors.emeraldDeep,
                    marginBottom: 4,
                  }}>
                  Traveler&apos;s Log
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 16,
                    color: 'rgba(15, 46, 40, 0.6)',
                  }}>
                  Level: Seeker
                </Text>
              </View>
              {/* Arabic avatar */}
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.emeraldDeep,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: colors.gold,
                }}>
                <Text style={{ fontFamily: fonts.amiri, fontSize: 24, color: colors.gold }}>ع</Text>
              </View>
            </View>
          </Pressable>

          <View style={{ marginBottom: 20 }}>
            <TrialBanner />
          </View>

          {/* Stats Grid */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                padding: 16,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 6,
                elevation: 1,
                borderWidth: 1,
                borderColor: 'rgba(15, 46, 40, 0.05)',
              }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(207, 170, 107, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}>
                <Zap color={colors.emeraldDeep} size={18} fill={colors.emeraldDeep} />
              </View>
              <Text style={{ fontFamily: fonts.fraunces, fontSize: 26, color: colors.emeraldDeep }}>
                {currentStreak}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: colors.emeraldDeep,
                  opacity: 0.5,
                }}>
                Day Streak
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                padding: 16,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 6,
                elevation: 1,
                borderWidth: 1,
                borderColor: 'rgba(15, 46, 40, 0.05)',
              }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(207, 170, 107, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}>
                <Star color={colors.gold} size={18} fill={colors.gold} />
              </View>
              <Text
                testID="profile-xp-count"
                style={{ fontFamily: fonts.fraunces, fontSize: 26, color: colors.emeraldDeep }}>
                {totalXp}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: colors.emeraldDeep,
                  opacity: 0.5,
                }}>
                Total XP
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                padding: 16,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 6,
                elevation: 1,
                borderWidth: 1,
                borderColor: 'rgba(15, 46, 40, 0.05)',
              }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(15, 46, 40, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}>
                <BookOpen color={colors.emeraldDeep} size={18} />
              </View>
              <Text style={{ fontFamily: fonts.fraunces, fontSize: 26, color: colors.emeraldDeep }}>
                {masteredCount ?? 0}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: colors.emeraldDeep,
                  opacity: 0.5,
                }}>
                Mastered
              </Text>
            </View>
          </View>

          {/* Learning Progress - Story 4.6: AC#1 & AC#2 (Issue #3 fix) */}
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 20,
              color: colors.emeraldDeep,
              marginBottom: 16,
            }}>
            Learning Progress
          </Text>

          {/* Error State for Learning Progress */}
          {(summaryError || masteredError) && (
            <View
              style={{
                backgroundColor: 'rgba(168, 84, 84, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(168, 84, 84, 0.3)',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
              }}>
              <Text style={{ fontFamily: fonts.outfit, fontSize: 14, color: colors.rating.again }}>
                Unable to load learning progress. Please check your connection.
              </Text>
            </View>
          )}

          <View
            testID="learning-state-summary"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 24,
              padding: 20,
              marginBottom: 32,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1,
              borderWidth: 1,
              borderColor: 'rgba(15, 46, 40, 0.05)',
              opacity: summaryError || masteredError ? 0.5 : 1,
            }}>
            {/* Mastered Words (North Star Metric) */}
            <View
              style={{
                alignItems: 'center',
                marginBottom: 24,
                paddingBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(15, 46, 40, 0.08)',
              }}>
              <Text
                style={{
                  fontFamily: fonts.fraunces,
                  fontSize: 42,
                  color: colors.emeraldDeep,
                  marginBottom: 4,
                }}>
                {masteredCount ?? 0}
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
                Words Mastered (7+ Day Intervals)
              </Text>
            </View>

            {/* State Breakdown Grid */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* New */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: getStateColor('new'),
                    marginBottom: 8,
                  }}
                />
                <Text
                  style={{ fontFamily: fonts.fraunces, fontSize: 24, color: colors.emeraldDeep }}>
                  {summary?.new ?? 0}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: colors.emeraldDeep,
                    opacity: 0.4,
                    textAlign: 'center',
                  }}>
                  {getStateLabel('new')}
                </Text>
              </View>

              {/* Learning */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: getStateColor('learning'),
                    marginBottom: 8,
                  }}
                />
                <Text
                  style={{ fontFamily: fonts.fraunces, fontSize: 24, color: colors.emeraldDeep }}>
                  {summary?.learning ?? 0}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: colors.emeraldDeep,
                    opacity: 0.4,
                    textAlign: 'center',
                  }}>
                  {getStateLabel('learning')}
                </Text>
              </View>

              {/* Review */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: getStateColor('review'),
                    marginBottom: 8,
                  }}
                />
                <Text
                  style={{ fontFamily: fonts.fraunces, fontSize: 24, color: colors.emeraldDeep }}>
                  {summary?.review ?? 0}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: colors.emeraldDeep,
                    opacity: 0.4,
                    textAlign: 'center',
                  }}>
                  {getStateLabel('review')}
                </Text>
              </View>

              {/* Mastered */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: getStateColor('mastered'),
                    marginBottom: 8,
                  }}
                />
                <Text
                  style={{ fontFamily: fonts.fraunces, fontSize: 24, color: colors.emeraldDeep }}>
                  {summary?.mastered ?? 0}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: colors.emeraldDeep,
                    opacity: 0.4,
                    textAlign: 'center',
                  }}>
                  {getStateLabel('mastered')}
                </Text>
              </View>
            </View>
          </View>

          {/* Milestones */}
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 20,
              color: colors.emeraldDeep,
              marginBottom: 16,
            }}>
            Milestones
          </Text>
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1,
              borderWidth: 1,
              borderColor: 'rgba(15, 46, 40, 0.05)',
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {BADGES.map((badge) => (
                <DiamondBadge
                  key={badge.id}
                  icon={badge.icon}
                  name={badge.name}
                  earned={badge.earned}
                />
              ))}
            </View>
          </View>

          {/* Account Section */}
          <View style={{ marginTop: 48, gap: 16 }}>
            <Pressable
              onPress={() => router.push('/settings' as any)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 16,
                paddingHorizontal: 20,
                backgroundColor: '#ffffff',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(15, 46, 40, 0.05)',
              }}
              accessibilityRole="button"
              accessibilityLabel="Settings">
              <Settings color={colors.emeraldDeep} size={20} />
              <Text style={{ fontFamily: fonts.outfit, fontSize: 16, color: colors.emeraldDeep }}>
                Settings
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                clearError();
                setShowSignOutDialog(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 16,
                backgroundColor: 'rgba(15, 46, 40, 0.04)',
                borderRadius: 16,
              }}
              accessibilityRole="button"
              accessibilityLabel="Sign Out">
              <LogOut color="rgba(15, 46, 40, 0.4)" size={18} />
              <Text
                style={{ fontFamily: fonts.outfit, fontSize: 14, color: 'rgba(15, 46, 40, 0.4)' }}>
                Sign Out
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                clearError();
                setShowDeleteDialog(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Delete Account"
              style={{ padding: 8 }}>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 12,
                  color: 'rgba(15, 46, 40, 0.3)',
                  textAlign: 'center',
                  textDecorationLine: 'underline',
                }}>
                Delete Account
              </Text>
            </Pressable>

            {error && (
              <View
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: 16,
                }}
                accessibilityRole="alert">
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 14,
                    color: '#f87171',
                    textAlign: 'center',
                  }}>
                  {error}
                </Text>
              </View>
            )}
          </View>

          {/* Version footer */}
          <View
            style={{
              marginTop: 32,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: 'rgba(15, 46, 40, 0.1)',
            }}>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                textAlign: 'center',
                color: 'rgba(15, 46, 40, 0.3)',
              }}>
              Version 0.8.2 · Safar Beta
            </Text>
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showSignOutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutDialog(false)}
        isDestructive
      />
      <DeleteAccountDialog
        visible={showDeleteDialog}
        isDeleting={isDeletingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
      />
      <ConfirmDialog
        visible={showResetOnboardingDialog}
        title="Reset Onboarding"
        message="This will reset your onboarding progress and return you to the onboarding flow. This is a developer option for testing."
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={handleResetOnboarding}
        onCancel={() => setShowResetOnboardingDialog(false)}
        isDestructive
      />
    </ScreenBackground>
  );
}
