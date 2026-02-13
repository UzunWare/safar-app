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

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  if (__DEV__) {
    console.warn(
      '⚠️ Supabase credentials not configured.',
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local',
      'App will run in offline/demo mode.'
    );
  }
}

// Create typed Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Export helper for checking if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
