/**
 * Script Assessment Screen
 * Asks user about their Arabic reading ability
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CheckCircle2, Circle, X } from 'lucide-react-native';
import * as Sentry from '@/lib/utils/sentry';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { saveScriptAbility } from '@/lib/api/progress';
import { trackEvent, AnalyticsEvents } from '@/lib/utils/analytics';
import { IslamicPattern } from '@/components/ui/IslamicPattern';
import { NoiseTexture } from '@/components/ui/NoiseTexture';
import { colors } from '@/constants/colors';
import { timeouts } from '@/constants/timeouts';
import '@/global.css';

type ScriptAbility = 'fluent' | 'learning';

interface ScriptOption {
  value: ScriptAbility;
  title: string;
  description: string;
}

const scriptOptions: ScriptOption[] = [
  {
    value: 'fluent',
    title: 'Yes, I can read Arabic',
    description: 'I can read Arabic script and recognize letters',
  },
  {
    value: 'learning',
    title: "I'm still learning",
    description: 'I need help with Arabic letters and pronunciation',
  },
];

export default function ScriptGateScreen() {
  const [selected, setSelected] = useState<ScriptAbility | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Check accessibility settings and track view
  useEffect(() => {
    // Check if reduce transparency is enabled
    AccessibilityInfo.isReduceTransparencyEnabled().then((enabled) => {
      setReduceTransparency(enabled);
    });

    // Track script assessment view
    trackEvent(AnalyticsEvents.SCRIPT_ASSESSMENT_VIEWED, {
      user_id: user?.id,
    });
  }, [user?.id]);

  const handleContinue = async () => {
    if (!selected) return;

    // Check if user is authenticated
    if (!user) {
      setError('Please sign in to continue');
      // Redirect to auth after showing error briefly
      setTimeout(() => {
        router.replace('/auth/sign-in' as any);
      }, timeouts.ui.errorRedirect);
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveScriptAbility(user.id, selected);

      if (!result.success) {
        // If save fails, still continue but log error to Sentry
        if (__DEV__) {
          console.error('Failed to save script ability:', result.error);
        }
        Sentry.captureMessage('Failed to save script ability preference', {
          level: 'warning',
          tags: { screen: 'script-gate', user_id: user.id },
          extra: { error: result.error, ability: selected },
        });
      }

      // Track script assessment completion
      trackEvent(AnalyticsEvents.SCRIPT_ASSESSMENT_COMPLETED, {
        user_id: user.id,
        script_ability: selected,
        shows_modal: selected === 'learning',
      });

      // If user selected "learning", show modal first
      if (selected === 'learning') {
        setIsSaving(false);
        setShowModal(true);
      } else {
        // Fluent users go directly to pathway
        router.replace('/onboarding/pathway' as any);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error in handleContinue:', error);
      }

      // Report to Sentry while allowing user to continue (don't block onboarding)
      Sentry.captureException(error, {
        level: 'error',
        tags: { screen: 'script-gate', user_id: user.id },
        extra: { ability: selected },
      });

      // Continue anyway - don't block user
      if (selected === 'learning') {
        setIsSaving(false);
        setShowModal(true);
      } else {
        router.replace('/onboarding/pathway' as any);
      }
    }
  };

  const handleModalDismiss = () => {
    setShowModal(false);
    router.replace('/onboarding/pathway' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-midnight" testID="script-gate-screen">
      <IslamicPattern opacity={0.03} />
      <NoiseTexture opacity={0.04} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-8"
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center py-12">
          {/* Question */}
          <Text
            testID="script-gate-question"
            className="mb-3 text-center text-4xl text-cream"
            style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
            Can you read Arabic script?
          </Text>

          <Text
            testID="script-gate-subtitle"
            className="mb-12 text-center text-base text-cream/60"
            style={{ fontFamily: 'Outfit' }}>
            This helps us customize your learning experience
          </Text>

          {/* Options */}
          <View testID="script-gate-options" className="mb-10 gap-4">
            {scriptOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                testID={`script-option-${option.value}`}
                onPress={() => {
                  setSelected(option.value);
                  // Track selection
                  trackEvent(AnalyticsEvents.SCRIPT_ASSESSMENT_SELECTED, {
                    user_id: user?.id,
                    script_ability: option.value,
                  });
                }}
                className={`rounded-xl border-2 p-6 ${
                  selected === option.value ? 'border-gold bg-gold/10' : 'border-gold/20 bg-white/5'
                }`}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Select ${option.title}`}
                accessibilityState={{ selected: selected === option.value }}>
                <View className="flex-row items-start gap-4">
                  {/* Selection Indicator */}
                  <View className="pt-1">
                    {selected === option.value ? (
                      <CheckCircle2 color={colors.gold} size={24} strokeWidth={2} />
                    ) : (
                      <Circle color={colors.goldAlpha[20]} size={24} strokeWidth={2} />
                    )}
                  </View>

                  {/* Text Content */}
                  <View className="flex-1">
                    <Text
                      className="mb-2 text-lg text-cream"
                      style={{ fontFamily: 'Outfit', fontWeight: '600' }}>
                      {option.title}
                    </Text>
                    <Text className="text-sm text-cream/60" style={{ fontFamily: 'Outfit' }}>
                      {option.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            testID="script-gate-continue"
            onPress={handleContinue}
            disabled={!selected || isSaving}
            className={`rounded-xl px-10 py-5 ${selected && !isSaving ? 'bg-gold' : 'bg-gold/30'}`}
            style={
              selected && !isSaving
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
            accessibilityLabel="Continue"
            accessibilityState={{ disabled: !selected || isSaving }}>
            {isSaving ? (
              <ActivityIndicator color={colors.midnight} testID="continue-loading" />
            ) : (
              <Text
                className={`text-center text-lg ${selected ? 'text-midnight' : 'text-midnight/40'}`}
                style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
                Continue
              </Text>
            )}
          </TouchableOpacity>

          {/* Error Message */}
          {error && (
            <View
              testID="script-gate-error"
              className="mt-4 rounded-lg p-4"
              style={{
                borderWidth: 1,
                borderColor: 'rgba(168, 84, 84, 0.30)',
                backgroundColor: 'rgba(168, 84, 84, 0.10)',
              }}>
              <Text
                testID="script-gate-error-text"
                className="text-center text-sm"
                style={{ fontFamily: 'Outfit', color: colors.rating.again }}>
                {error}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Transliteration Coming Soon Modal */}
      <Modal visible={showModal} transparent={!reduceTransparency} animationType="fade">
        <View
          className={`flex-1 items-center justify-center px-8 ${
            reduceTransparency ? 'bg-black' : 'bg-black/80'
          }`}>
          <View
            testID="transliteration-modal"
            className="w-full max-w-sm rounded-2xl border border-gold/30 bg-midnight p-8">
            {/* Close Button */}
            <TouchableOpacity
              testID="modal-close"
              onPress={handleModalDismiss}
              className="absolute right-4 top-4"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close modal">
              <X color={colors.gold} size={24} />
            </TouchableOpacity>

            {/* Content */}
            <Text
              testID="modal-title"
              className="mb-4 text-center text-2xl text-cream"
              style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
              Coming Soon
            </Text>

            <Text
              testID="modal-message"
              className="mb-6 text-center text-base text-cream/80"
              style={{ fontFamily: 'Outfit' }}>
              Transliteration support for learners will be available in Phase 2. For now, you can
              continue with Arabic script, and we&apos;ll help you learn!
            </Text>

            <TouchableOpacity
              testID="modal-continue"
              onPress={handleModalDismiss}
              className="rounded-xl bg-gold px-8 py-4"
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Got it, continue">
              <Text
                className="text-center text-base text-midnight"
                style={{ fontFamily: 'Outfit', fontWeight: '600' }}>
                Got it, continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
