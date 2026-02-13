/**
 * Root Index - Redirect Screen
 * This screen should never be visible. RootLayoutNav in _layout.tsx
 * redirects to /auth, /onboarding, or /(tabs) before this renders.
 * Shows a loading spinner as a safety net.
 */

import { Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import '@/global.css';

export default function RootIndex() {
  const session = useAuthStore((state) => state.session);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  // Safety redirect in case RootLayoutNav doesn't catch this
  if (!session) {
    return <Redirect href="/auth/sign-in" />;
  }
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/onboarding" />;
}
