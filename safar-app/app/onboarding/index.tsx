/**
 * Onboarding Welcome Screen
 * First screen in onboarding flow - shows Safar value proposition
 * Premium Divine Geometry design matching prototype OnboardingView
 */

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { BookOpen, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { trackEvent, AnalyticsEvents } from '@/lib/utils/analytics';
import { IslamicPattern } from '@/components/ui/IslamicPattern';
import { NoiseTexture } from '@/components/ui/NoiseTexture';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants';
import '@/global.css';

function PulsingGlow() {
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    ),
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
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
          width: 112,
          height: 112,
          borderRadius: 56,
          backgroundColor: colors.gold,
        },
        pulseStyle,
      ]}
    />
  );
}

export default function OnboardingWelcomeScreen() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  useEffect(() => {
    // Check if user should be here
    if (user && onboardingCompleted) {
      // User already completed onboarding, redirect to home
      router.replace('/(tabs)');
    } else {
      // User is new or not completed, show welcome
      setIsCheckingAuth(false);

      // Track welcome screen view
      trackEvent(AnalyticsEvents.ONBOARDING_WELCOME_VIEWED, {
        user_id: user?.id,
      });
    }
  }, [user, onboardingCompleted]);

  const handleGetStarted = () => {
    // Track onboarding start
    trackEvent(AnalyticsEvents.ONBOARDING_WELCOME_STARTED, {
      user_id: user?.id,
    });

    router.push('/onboarding/script-gate' as any);
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <SafeAreaView className="flex-1 bg-midnight">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-midnight" testID="welcome-screen">
      <IslamicPattern opacity={0.05} />
      <NoiseTexture opacity={0.04} />
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo with pulsing gold glow */}
        <View
          testID="welcome-logo"
          className="mb-10 items-center justify-center"
          style={{ width: 112, height: 112 }}>
          <PulsingGlow />
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              borderWidth: 1,
              borderColor: colors.gold,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ rotate: '45deg' }],
            }}>
            <View style={{ transform: [{ rotate: '-45deg' }] }}>
              <BookOpen color={colors.gold} size={36} strokeWidth={1} />
            </View>
          </View>
        </View>

        {/* Arabic App Name — prominent, spiritual */}
        <Text
          testID="welcome-title"
          className="mb-4 text-center text-cream"
          style={{
            fontFamily: fonts.amiri,
            fontSize: 64,
            letterSpacing: 2,
          }}>
          سَفَر
        </Text>

        {/* English App Name */}
        <Text
          className="mb-6 text-center"
          style={{
            fontFamily: 'Fraunces',
            fontWeight: '300',
            fontSize: 36,
            color: colors.gold,
          }}>
          Safar
        </Text>

        {/* Value Proposition */}
        <Text
          testID="welcome-value-proposition"
          className="mb-16 max-w-xs text-center text-cream/70"
          style={{
            fontFamily: 'Outfit',
            fontWeight: '300',
            fontSize: 18,
            lineHeight: 28,
          }}>
          The journey from recitation{'\n'}to conversation.
        </Text>

        {/* CTA Button — gold with enhanced glow shadow */}
        <TouchableOpacity
          testID="welcome-get-started"
          onPress={handleGetStarted}
          className="flex-row items-center gap-3 rounded-2xl bg-gold px-10 py-5"
          style={{
            shadowColor: colors.gold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 40,
            elevation: 10,
          }}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Get started with onboarding">
          <Text
            className="text-xl text-midnight"
            style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
            Begin Journey
          </Text>
          <ArrowRight color={colors.midnight} size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
