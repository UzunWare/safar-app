import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/constants/config';
import type { Database } from '@/types/supabase.types';

/**
 * Supabase Client
 *
 * Typed client for database operations with session persistence
 * via AsyncStorage for React Native. (SecureStore has a 2048-byte
 * value limit that Supabase JWTs exceed, causing session loss.)
 */

const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;
const legacyAuthStorageKey = 'supabase.auth.token';

function getProjectRefFromUrl(url: string): string {
  try {
    const projectRef = new URL(url).hostname.split('.')[0];
    return projectRef;
  } catch {
    return 'unknown';
  }
}

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const msg =
    'Supabase credentials not configured. ' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local';
  if (__DEV__) {
    console.error(msg);
  } else {
    // In production, log the error so crash reporters can surface it
    console.error(`FATAL: ${msg}`);
  }
}

const authStorageKey = supabaseUrl
  ? `sb-${getProjectRefFromUrl(supabaseUrl)}-auth-token`
  : 'sb-unconfigured-auth-token';

// Create typed Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || 'https://unconfigured.supabase.co',
  supabaseAnonKey || 'missing-key',
  {
    auth: {
      storage: AsyncStorage,
      storageKey: authStorageKey,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Detect stale refresh-token errors returned by Supabase auth.
 * These happen after reinstall/logout on another device and should
 * be recovered by clearing local persisted auth state.
 */
export function isInvalidRefreshTokenError(error: unknown): boolean {
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message ?? '')
          : '';

  const normalized = message.toLowerCase();
  return (
    normalized.includes('invalid refresh token') ||
    normalized.includes('refresh token not found')
  );
}

/**
 * Best-effort local auth cleanup for stale/invalid persisted sessions.
 */
export async function clearLocalSupabaseSession(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Continue with storage cleanup.
  }

  await Promise.allSettled([
    AsyncStorage.removeItem(authStorageKey),
    AsyncStorage.removeItem(legacyAuthStorageKey),
  ]);
}

// Export helper for checking if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
