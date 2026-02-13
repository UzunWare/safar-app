/**
 * Auth Hooks
 * Session initialization and protected route handling
 */

import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { supabase } from '@/lib/api/supabase';

/**
 * Initialize auth session and listen for changes
 * Call this in the root layout
 */
export function useAuthInit() {
  const setSession = useAuthStore((state) => state.setSession);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          if (__DEV__) {
            console.warn('Failed to get session:', error.message);
          }
        }

        if (isMounted) {
          // setSession is async, await it
          await setSession(session);
          setInitialized(true);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Auth initialization error:', error);
        }
        if (isMounted) {
          // Still initialize even on error so app doesn't hang
          setInitialized(true);
        }
      }
    }

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        await setSession(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setInitialized]);
}

/**
 * Protect routes based on authentication status
 * Redirects based on current auth state, route segment, and onboarding completion
 */
export function useProtectedRoute() {
  const session = useAuthStore((state) => state.session);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const accountDeleted = useAuthStore((state) => state.accountDeleted);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboardingGroup = segments[0] === 'onboarding';
    const inTabsGroup = segments[0] === '(tabs)';

    // Account deletion handling
    if (accountDeleted && !inAuthGroup) {
      // If account was deleted, ensure we're on the sign-up screen
      // The sign-up screen will read this state to show a confirmation message
      router.replace('/auth/sign-up');
      return;
    }

    if (!session && !inAuthGroup) {
      // Not logged in and not on auth screen -> redirect to sign in
      router.replace('/auth/sign-in');
    } else if (session && inAuthGroup) {
      // Logged in but on auth screen -> redirect based on onboarding status
      if (onboardingCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } else if (session && onboardingCompleted !== null) {
      // Logged in user navigating between main areas
      if (!onboardingCompleted && inTabsGroup) {
        // Need to complete onboarding first
        router.replace('/onboarding');
      } else if (onboardingCompleted && inOnboardingGroup) {
        // Already completed onboarding, go to tabs
        router.replace('/(tabs)');
      }
    }
  }, [session, isInitialized, onboardingCompleted, accountDeleted, segments, router]);
}

/**
 * Convenience hook to access auth state
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const error = useAuthStore((state) => state.error);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const signInWithSocial = useAuthStore((state) => state.signInWithSocial);

  return {
    user,
    session,
    isLoading,
    isInitialized,
    error,
    onboardingCompleted,
    isAuthenticated: !!session,
    signInWithSocial,
  };
}
