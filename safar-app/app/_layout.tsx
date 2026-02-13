import '../global.css';

import { useEffect, useState } from 'react';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { Fraunces_400Regular, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Outfit_400Regular, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/api/supabase';
import { useNotificationHandler } from '@/lib/hooks/useNotificationHandler';
import { configureNotificationHandler } from '@/lib/notifications/notificationService';
import {
  updateBadgeCount,
  updateReviewNotificationSchedule,
} from '@/lib/notifications/reviewNotificationOrchestrator';
import { syncRevenueCatAuthState } from '@/lib/subscription/revenueCatAuthSync';
import { initializePurchases } from '@/lib/subscription/purchasesConfig';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useSettingsStore } from '@/lib/stores/useSettingsStore';
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';
import { useSyncOnForeground } from '@/lib/hooks/useSyncOnForeground';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { colors } from '@/constants/colors';
import { timeouts } from '@/constants/timeouts';

// Prevent splash screen auto-hide.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Create query client.
const queryClient = new QueryClient();

// Module-level guard that survives Expo Router component remounts.
let hasInitialized = false;

export default function RootLayout() {
  useNotificationHandler();
  useNetworkStatus();
  useSyncOnForeground();

  const [isReady, setIsReady] = useState(false);

  // Load custom fonts.
  const [fontsLoaded, fontError] = useFonts({
    Amiri: Amiri_400Regular,
    'Amiri-Bold': Amiri_700Bold,
    Outfit: Outfit_400Regular,
    'Outfit-SemiBold': Outfit_600SemiBold,
    Fraunces: Fraunces_400Regular,
    'Fraunces-SemiBold': Fraunces_600SemiBold,
  });

  useEffect(() => {
    configureNotificationHandler();
  }, []);

  useEffect(() => {
    // Already initialized from a previous mount; just show the app.
    if (hasInitialized) {
      setIsReady(true);
      return;
    }
    hasInitialized = true;

    let isMounted = true;
    const { setInitialized, setSession } = useAuthStore.getState();

    async function initializeApp() {
      try {
        if (__DEV__) {
          console.log('App: Initializing...');
        }

        // Initialize RevenueCat SDK (best effort).
        await initializePurchases().catch(() => {});

        // Try to get session with timeout.
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), timeouts.auth.sessionInit)
        );

        let initialSession: Session | null = null;

        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]);
          initialSession = result?.data?.session ?? null;

          if (isMounted && result?.data?.session !== undefined) {
            await setSession(result.data.session);
          }
        } catch (authError) {
          if (__DEV__) {
            console.warn('App: Auth initialization skipped:', authError);
          }
          // Keep auth initialization resilient.
        }

        await syncRevenueCatAuthState(initialSession?.user?.id);
      } catch (error) {
        if (__DEV__) {
          console.error('App: Initialization error:', error);
        }
      } finally {
        if (isMounted) {
          setInitialized(true);
          setIsReady(true);
          await SplashScreen.hideAsync().catch(() => {});
        }
      }
    }

    initializeApp();

    // Set up auth state listener for login/logout events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (__DEV__) {
        console.log('App: onAuthStateChange', event);
      }
      if (isMounted) {
        await useAuthStore.getState().setSession(session);
        await syncRevenueCatAuthState(session?.user?.id);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show loading while initializing or loading fonts.
  if (!isReady || !fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.midnight,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={{ color: colors.cream, marginTop: 16, fontFamily: 'System' }}>
            {fontError ? 'Loading (fonts unavailable)...' : 'Loading Safar...'}
          </Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <OfflineIndicator />
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const session = useAuthStore((state) => state.session);
  const reviewRemindersEnabled = useSettingsStore((state) => state.reviewReminders);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const accountDeleted = useAuthStore((state) => state.accountDeleted);
  const segments = useSegments();
  const router = useRouter();

  // Check if navigation is ready.
  const navigationState = useRootNavigationState();
  const navigationReady = navigationState?.key != null;

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    updateReviewNotificationSchedule(userId, undefined, reviewRemindersEnabled).catch(() => {
      // Best effort only.
    });

    updateBadgeCount(userId).catch(() => {
      // Best effort only.
    });
  }, [session?.user?.id, reviewRemindersEnabled]);

  // Handle all redirects via useEffect so the Stack navigator stays mounted.
  useEffect(() => {
    if (!isInitialized || !navigationReady) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboardingGroup = segments[0] === 'onboarding';
    const inTabsGroup = segments[0] === '(tabs)';
    const inLessonGroup = (segments[0] as string) === 'lesson';
    const inFrequencyLessonGroup = (segments[0] as string) === 'frequency-lesson';
    const inQuizGroup = (segments[0] as string) === 'quiz';
    const inReviewGroup = (segments[0] as string) === 'review';
    const inRootDetailGroup = (segments[0] as string) === 'root-detail';
    const inRootLessonGroup = (segments[0] as string) === 'root-lesson';
    const inSubscriptionGroup = (segments[0] as string) === 'subscription';
    const inSettingsGroup = (segments[0] as string) === 'settings';

    // Account was deleted, redirect to sign-up with message.
    if (accountDeleted && segments[1] !== 'sign-up') {
      router.replace('/auth/sign-up' as any);
      return;
    }

    // Not logged in and not on auth screen, redirect to sign in.
    if (!session && !inAuthGroup) {
      router.replace('/auth/sign-in' as any);
      return;
    }

    // Logged in but on auth screen, redirect based on onboarding.
    if (session && inAuthGroup) {
      router.replace((onboardingCompleted ? '/(tabs)' : '/onboarding') as any);
      return;
    }

    // Logged in, check onboarding status.
    if (session && onboardingCompleted !== null) {
      // Has not completed onboarding but trying to access tabs.
      if (!onboardingCompleted && inTabsGroup) {
        router.replace('/onboarding' as any);
        return;
      }
      // Completed onboarding but on onboarding screen.
      if (onboardingCompleted && inOnboardingGroup) {
        router.replace('/(tabs)' as any);
        return;
      }
    }

    // Catch-all: logged in but at root "/" or unknown route.
    if (
      session &&
      !inAuthGroup &&
      !inOnboardingGroup &&
      !inTabsGroup &&
      !inLessonGroup &&
      !inFrequencyLessonGroup &&
      !inQuizGroup &&
      !inReviewGroup &&
      !inRootDetailGroup &&
      !inRootLessonGroup &&
      !inSubscriptionGroup &&
      !inSettingsGroup
    ) {
      router.replace((onboardingCompleted ? '/(tabs)' : '/onboarding') as any);
    }
  }, [
    isInitialized,
    navigationReady,
    session,
    onboardingCompleted,
    accountDeleted,
    segments,
    router,
  ]);

  // Always render the Stack so the navigator is mounted and routes are registered.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="lesson/[id]" />
      <Stack.Screen name="frequency-lesson/[id]" />
      <Stack.Screen name="root-lesson/[id]" />
      <Stack.Screen name="quiz/[lessonId]" />
      <Stack.Screen name="review/session" />
      <Stack.Screen name="root-detail/[id]" />
      <Stack.Screen name="index" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
