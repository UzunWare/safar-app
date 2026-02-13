/**
 * Onboarding Stack Layout
 * Stack navigator for onboarding screens
 */

import { Stack } from 'expo-router';
import '@/global.css';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a1f1b' }, // midnight
        animation: 'fade',
      }}
    />
  );
}
