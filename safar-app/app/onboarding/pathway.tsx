/**
 * Pathway Introduction Screen (Story 2.2)
 * Shows the "Salah First" pathway with units, preview, and CTA.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BookOpen, Lock, ArrowRight, Star } from 'lucide-react-native';
import * as Sentry from '@/lib/utils/sentry';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { usePathway } from '@/lib/hooks/usePathway';
import { completeOnboarding } from '@/lib/api/progress';
import { trackEvent, AnalyticsEvents } from '@/lib/utils/analytics';
import { hasTrialBeenTracked, trackTrialStart } from '@/lib/subscription/trialService';
import { IslamicPattern } from '@/components/ui/IslamicPattern';
import { NoiseTexture } from '@/components/ui/NoiseTexture';
import { colors } from '@/constants/colors';
import '@/global.css';

export default function PathwayScreen() {
  const [isCompleting, setIsCompleting] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { data: pathway, isLoading, isError, refetch } = usePathway();

  const handleBeginJourney = async () => {
    if (!user) {
      router.replace('/auth/sign-in' as any);
      return;
    }

    const trackTrialStartIfNeeded = async () => {
      const alreadyTracked = await hasTrialBeenTracked();
      if (!alreadyTracked) {
        await trackTrialStart(user.id);
      }
    };

    setIsCompleting(true);

    try {
      const result = await completeOnboarding(user.id);

      if (!result.success) {
        if (__DEV__) {
          console.error('Failed to mark onboarding complete:', result.error);
        }
        Sentry.captureMessage('Failed to complete onboarding', {
          level: 'warning',
          tags: { screen: 'pathway', user_id: user.id },
          extra: { error: result.error },
        });
      }

      await trackTrialStartIfNeeded();

      trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
        user_id: user.id,
      });

      // Update Zustand store so RootLayoutNav allows tabs access
      useAuthStore.getState().setOnboardingCompleted(true);

      // Navigate to learn tab (lesson screens built in Epic 3)
      router.replace('/(tabs)/learn');
    } catch (error) {
      if (__DEV__) {
        console.error('Error completing onboarding:', error);
      }
      Sentry.captureException(error, {
        level: 'error',
        tags: { screen: 'pathway', user_id: user.id },
      });

      trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
        user_id: user.id,
        had_error: true,
      });

      await trackTrialStartIfNeeded();

      // Update store even on error so user isn't stuck
      useAuthStore.getState().setOnboardingCompleted(true);

      // Continue anyway - don't block user
      router.replace('/(tabs)/learn');
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-midnight" testID="pathway-loading">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-midnight" testID="pathway-error">
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="mb-4 text-center text-lg text-cream"
            style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
            Unable to load pathway
          </Text>
          <Text className="mb-6 text-center text-sm text-cream/60" style={{ fontFamily: 'Outfit' }}>
            Please check your connection and try again.
          </Text>
          <TouchableOpacity
            testID="pathway-retry"
            onPress={() => refetch()}
            className="rounded-xl bg-gold px-8 py-3"
            accessibilityRole="button"
            accessibilityLabel="Try again">
            <Text
              className="text-base text-midnight"
              style={{ fontFamily: 'Outfit', fontWeight: '600' }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-midnight" testID="pathway-screen">
      <IslamicPattern opacity={0.03} />
      <NoiseTexture opacity={0.04} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="items-center px-6 pt-12">
          {/* Icon */}
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
            <BookOpen color={colors.gold} size={36} strokeWidth={1.5} />
          </View>

          {/* Pathway Name */}
          <Text
            testID="pathway-title"
            className="mb-3 text-center text-4xl text-cream"
            style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
            {pathway?.name ?? 'Salah First'}
          </Text>

          {/* Promise */}
          <Text
            testID="pathway-promise"
            className="mb-6 text-center text-lg text-cream/80"
            style={{ fontFamily: 'Outfit' }}>
            {pathway?.promise ?? 'Understand your daily prayers in 6 weeks'}
          </Text>

          {/* Stats */}
          <View className="mb-8 flex-row items-center gap-4">
            <View className="flex-row items-center gap-1.5 rounded-full bg-white/5 px-4 py-2">
              <Text
                className="text-sm text-gold"
                style={{ fontFamily: 'Outfit', fontWeight: '600' }}>
                {pathway?.total_words ?? 120} words
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5 rounded-full bg-white/5 px-4 py-2">
              <Text
                className="text-sm text-gold"
                style={{ fontFamily: 'Outfit', fontWeight: '600' }}>
                {pathway?.total_units ?? 6} units
              </Text>
            </View>
          </View>
        </View>

        {/* Preview Section */}
        <View className="mx-6 mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <Text
            className="mb-3 text-base text-cream"
            style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
            What you&apos;ll learn
          </Text>
          {(
            pathway?.preview_items ?? [
              'Surah Al-Fatiha — every word explained',
              'Prayer position phrases (ruku, sujood)',
              "Essential du'as & adhkar",
            ]
          ).map((item, index) => (
            <View key={index} className="mb-2 flex-row items-center gap-3">
              <Star color={colors.gold} size={14} fill={colors.gold} />
              <Text className="text-sm text-cream/70" style={{ fontFamily: 'Outfit' }}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Unit Breakdown */}
        <View className="mx-6">
          <Text
            className="mb-4 text-base text-cream"
            style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
            Your journey
          </Text>
          {(pathway?.units ?? []).map((unit, index) => {
            const isUnlocked = index === 0;
            return (
              <View
                key={unit.id}
                testID={`unit-item-${index}`}
                className={`mb-3 flex-row items-center justify-between rounded-xl border p-4 ${
                  isUnlocked ? 'border-gold/30 bg-gold/10' : 'border-white/10 bg-white/5'
                }`}>
                <View className="flex-1 flex-row items-center gap-3">
                  <View
                    className={`h-8 w-8 items-center justify-center rounded-full ${
                      isUnlocked ? 'bg-gold' : 'bg-white/10'
                    }`}>
                    <Text
                      className={`text-sm ${isUnlocked ? 'text-midnight' : 'text-cream/50'}`}
                      style={{ fontFamily: 'Outfit', fontWeight: '700' }}>
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-sm ${isUnlocked ? 'text-cream' : 'text-cream/50'}`}
                      style={{ fontFamily: 'Outfit', fontWeight: '600' }}>
                      {unit.name}
                    </Text>
                    <Text className="text-xs text-cream/40" style={{ fontFamily: 'Outfit' }}>
                      {unit.word_count} words
                    </Text>
                  </View>
                </View>
                {!isUnlocked && (
                  <View testID={`unit-lock-${index}`}>
                    <Lock color={colors.cream} size={16} opacity={0.3} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-midnight/95 px-6 pb-10 pt-4">
        <TouchableOpacity
          testID="pathway-cta"
          onPress={handleBeginJourney}
          disabled={isCompleting}
          className={`flex-row items-center justify-center gap-3 rounded-xl px-10 py-5 ${
            isCompleting ? 'bg-gold/50' : 'bg-gold'
          }`}
          style={
            !isCompleting
              ? {
                  shadowColor: colors.gold,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 15,
                  elevation: 8,
                }
              : {}
          }
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Begin your journey"
          accessibilityState={{ disabled: isCompleting }}>
          {isCompleting ? (
            <ActivityIndicator color={colors.midnight} />
          ) : (
            <>
              <Text
                className="text-lg text-midnight"
                style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
                Begin Your Journey
              </Text>
              <ArrowRight color={colors.midnight} size={22} strokeWidth={2.5} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
