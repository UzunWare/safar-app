/**
 * Secure Storage Adapter for Supabase Auth
 * Uses expo-secure-store for Keychain (iOS) / Keystore (Android)
 */

import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'supabase.auth.token';

export const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      if (__DEV__) {
        console.warn('SecureStore getItem error:', error);
      }
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      if (__DEV__) {
        console.warn('SecureStore setItem error:', error);
      }
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      if (__DEV__) {
        console.warn('SecureStore removeItem error:', error);
      }
    }
  },
};

// Helper functions for auth token management
export async function storeAuthToken(token: string): Promise<void> {
  await SecureStoreAdapter.setItem(AUTH_TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return await SecureStoreAdapter.getItem(AUTH_TOKEN_KEY);
}

export async function removeAuthToken(): Promise<void> {
  await SecureStoreAdapter.removeItem(AUTH_TOKEN_KEY);
}
