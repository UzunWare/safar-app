/**
 * Auth Store using Zustand
 * Manages authentication state and actions
 */

import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/api/supabase';
import { storeAuthToken, removeAuthToken } from '@/lib/api/secure-storage';
import { timeouts } from '@/constants/timeouts';

const SIGN_IN_NETWORK_ERROR = 'Unable to connect. Please check your internet connection.';
const SIGN_UP_EMAIL_DELIVERY_ERROR =
  'We could not send the confirmation email. Please try again shortly.';

async function withTimeout<T>(
  promise: PromiseLike<T> | T,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function getSignInErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : 'Sign in failed';
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes('invalid login')) {
    return 'Invalid email or password';
  }

  if (
    normalized.includes('timed out') ||
    normalized.includes('timeout') ||
    normalized.includes('network') ||
    normalized.includes('fetch') ||
    normalized.includes('unable to connect')
  ) {
    return SIGN_IN_NETWORK_ERROR;
  }

  if (normalized.includes('rate limit') || normalized.includes('security purposes')) {
    return 'Please wait a moment before trying again';
  }

  return rawMessage;
}

function getSignUpErrorMessage(error: unknown): string {
  const rawMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message ?? 'Registration failed')
          : 'Registration failed';
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes('already registered')) {
    return 'An account with this email already exists';
  }

  if (normalized.includes('error sending confirmation email')) {
    return SIGN_UP_EMAIL_DELIVERY_ERROR;
  }

  if (
    normalized.includes('timed out') ||
    normalized.includes('timeout') ||
    normalized.includes('network') ||
    normalized.includes('fetch') ||
    normalized.includes('unable to connect')
  ) {
    return SIGN_IN_NETWORK_ERROR;
  }

  if (normalized.includes('rate limit') || normalized.includes('security purposes')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }

  return rawMessage;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  onboardingCompleted: boolean | null;
  passwordRecoveryMode: boolean;
  accountDeleted: boolean;
  isDeletingAccount: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithSocial: (provider: 'apple' | 'google') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setInitialized: (value: boolean) => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  setPasswordRecoveryMode: (value: boolean) => void;
  setOnboardingCompleted: (value: boolean) => void;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  onboardingCompleted: null,
  passwordRecoveryMode: false,
  accountDeleted: false,
  isDeletingAccount: false,

  setSession: async (session) => {
    if (session?.user) {
      if (session.access_token) {
        await storeAuthToken(session.access_token);
      }

      // Fetch user profile to check onboarding status (with timeout)
      let onboardingValue = false;
      try {
        const profilePromise = supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();
        const { data: profile } = await withTimeout(
          profilePromise,
          timeouts.auth.profileFetch,
          'Profile fetch timeout'
        );
        onboardingValue =
          (profile as { onboarding_completed: boolean } | null)?.onboarding_completed ?? false;
      } catch {
        // Profile fetch failed or timed out - check offline cache
        try {
          const cached = await AsyncStorage.getItem(`onboarding_completed_${session.user.id}`);
          if (cached === 'true') {
            onboardingValue = true;
          }
        } catch {
          // AsyncStorage also failed, default to false
        }
      }
      set({
        session,
        user: session.user,
        isLoading: false,
        onboardingCompleted: onboardingValue,
        accountDeleted: false,
      });
    } else {
      await removeAuthToken();

      set({
        session: null,
        user: null,
        isLoading: false,
        onboardingCompleted: null,
      });
    }
  },

  setInitialized: (value) => {
    set({ isInitialized: value });
  },

  clearError: () => {
    set({ error: null });
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
      });
      const { data, error } = await withTimeout(
        signUpPromise,
        timeouts.auth.signUp,
        'Sign up timed out. Please check your connection.'
      );

      if (error) {
        const message = getSignUpErrorMessage(error);
        if (__DEV__ && message === SIGN_UP_EMAIL_DELIVERY_ERROR) {
          console.warn(
            'Supabase sign-up email delivery failed. Check Auth > Email provider/SMTP settings.'
          );
        }
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }

      // Handle email confirmation case (session may be null)
      if (data.session) {
        await get().setSession(data.session);
        return { success: true };
      } else if (data.user?.identities?.length === 0) {
        // Existing confirmed account — Supabase returned a fake user object
        const message = 'An account with this email already exists';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      } else {
        // Genuine new signup — email confirmation required
        set({ isLoading: false });
        return {
          success: false,
          error: 'Please check your email to confirm your account',
        };
      }
    } catch (err) {
      const message = getSignUpErrorMessage(err);
      if (__DEV__ && message === SIGN_UP_EMAIL_DELIVERY_ERROR) {
        console.warn(
          'Supabase sign-up email delivery failed. Check Auth > Email provider/SMTP settings.'
        );
      }
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      const { data, error } = await withTimeout(
        authPromise,
        timeouts.auth.signIn,
        'Sign in timed out. Please check your connection.'
      );

      if (error) {
        const message = getSignInErrorMessage(error);

        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }

      await get().setSession(data.session);

      return { success: true };
    } catch (err) {
      const message = getSignInErrorMessage(err);
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  signInWithSocial: async (provider) => {
    set({ isLoading: true, error: null });

    try {
      // Lazy load auth module to avoid circular dependencies
      const authModule = await import('@/lib/api/auth');

      let result;
      if (provider === 'apple') {
        result = await authModule.signInWithApple();
      } else {
        result = await authModule.signInWithGoogle();
      }

      // User cancelled - no error, just return
      if (result === null) {
        set({ isLoading: false });
        return { success: false };
      }

      // Success - session is set by the auth functions
      await get().setSession(result.session);
      return { success: true };
    } catch {
      const message = 'Sign in failed. Please check your connection and try again.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  signOut: async () => {
    set({ isLoading: true });

    try {
      await supabase.auth.signOut();
      await removeAuthToken();
      set({
        session: null,
        user: null,
        isLoading: false,
        error: null,
        onboardingCompleted: null,
        passwordRecoveryMode: false,
      });
    } catch {
      const message = 'Sign out failed. Please try again.';
      set({ isLoading: false, error: message });
    }
  },

  requestPasswordReset: async (email) => {
    set({ isLoading: true, error: null });

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'safar-app://auth/reset-password',
      });

      set({ isLoading: false });
      // Always return true for security (don't reveal if email exists)
      return true;
    } catch {
      // Still return true for security
      set({ isLoading: false });
      return true;
    }
  },

  updatePassword: async (newPassword) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      set({ isLoading: false, passwordRecoveryMode: false });
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  setPasswordRecoveryMode: (value) => {
    set({ passwordRecoveryMode: value });
  },

  setOnboardingCompleted: (value) => {
    set({ onboardingCompleted: value });
  },

  deleteAccount: async () => {
    set({ isDeletingAccount: true, error: null });

    try {
      const { error } = await supabase.functions.invoke('delete-user');

      if (error) {
        throw error;
      }

      await supabase.auth.signOut();
      await removeAuthToken();

      set({
        user: null,
        session: null,
        onboardingCompleted: null,
        accountDeleted: true,
        isDeletingAccount: false,
      });

      return { success: true };
    } catch (err) {
      if (__DEV__) {
        console.error('Delete account error:', err);
      }
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      set({ isDeletingAccount: false, error: message });
      return { success: false, error: message };
    }
  },
}));
