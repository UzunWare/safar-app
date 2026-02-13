/**
 * Social Authentication Utilities
 * Apple Sign-In and Google Sign-In via Supabase
 */

import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

// Complete any pending auth session
WebBrowser.maybeCompleteAuthSession();

/**
 * Extract hash parameters from OAuth callback URL
 */
export function extractHashParams(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return {};

  const hash = url.substring(hashIndex + 1);
  const params: Record<string, string> = {};

  hash.split('&').forEach((pair) => {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });

  return params;
}

/**
 * Sign in with Apple
 * Uses native Apple Sign-In flow and exchanges token with Supabase
 */
export async function signInWithApple() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('No identity token received from Apple');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    // Handle user cancellation gracefully
    if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'ERR_CANCELED') {
      return null;
    }
    throw error;
  }
}

/**
 * Sign in with Google
 * Uses Supabase OAuth flow with WebBrowser
 */
export async function signInWithGoogle() {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'safar-app',
    path: 'auth/callback',
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('No OAuth URL received');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

  // Handle user cancellation gracefully
  if (result.type === 'cancel' || result.type === 'dismiss') {
    return null;
  }

  if (result.type === 'success') {
    const params = extractHashParams(result.url);
    if (params.access_token && params.refresh_token) {
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });

      if (sessionError) throw sessionError;
      return sessionData;
    }
  }

  throw new Error('Authentication failed');
}

/**
 * Check if Apple Sign-In is available (iOS only)
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  return await AppleAuthentication.isAvailableAsync();
}
