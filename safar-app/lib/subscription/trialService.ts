/**
 * Trial Service
 *
 * Manages a local 7-day trial tracked via AsyncStorage.
 * Also records trial start in Supabase for analytics.
 * RevenueCat entitlements take priority when configured.
 *
 * Story 6.2: Free Trial Period - Task 3
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/api/supabase';

export const TRIAL_TRACKED_KEY = 'safar_trial_tracked';
export const TRIAL_START_KEY = 'safar_trial_start_date';
export const LOCAL_TRIAL_DAYS = 7;

interface LocalTrialStatus {
  isActive: boolean;
  expirationDate: string | null;
  daysRemaining: number;
}

/**
 * Record trial start in user profile for analytics and start local trial.
 * Gracefully handles errors — trial tracking is non-critical.
 */
export async function trackTrialStart(userId: string): Promise<void> {
  if (!userId) return;

  try {
    await supabase
      .from('user_profiles')
      .update({ trial_started_at: new Date().toISOString() } as any)
      .eq('id', userId);
  } catch {
    // Supabase failure is non-critical for analytics tracking
  }

  try {
    await AsyncStorage.setItem(TRIAL_TRACKED_KEY, 'true');
  } catch {
    // AsyncStorage failure is non-critical
  }

  try {
    // Only set start date if not already set (preserve original trial start)
    const existing = await AsyncStorage.getItem(TRIAL_START_KEY);
    if (!existing) {
      await AsyncStorage.setItem(TRIAL_START_KEY, new Date().toISOString());
    }
  } catch {
    // AsyncStorage failure is non-critical
  }
}

/**
 * Check if trial start has already been tracked locally.
 */
export async function hasTrialBeenTracked(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(TRIAL_TRACKED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Get local trial status from AsyncStorage.
 * Returns whether the 7-day trial is still active, the expiration date,
 * and days remaining.
 */
export async function getLocalTrialStatus(): Promise<LocalTrialStatus> {
  try {
    const startDateStr = await AsyncStorage.getItem(TRIAL_START_KEY);
    if (!startDateStr) {
      return { isActive: false, expirationDate: null, daysRemaining: 0 };
    }

    const startDate = new Date(startDateStr);
    const expirationDate = new Date(startDate.getTime() + LOCAL_TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const now = Date.now();
    const msRemaining = expirationDate.getTime() - now;

    if (msRemaining <= 0) {
      return { isActive: false, expirationDate: expirationDate.toISOString(), daysRemaining: 0 };
    }

    const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
    return {
      isActive: true,
      expirationDate: expirationDate.toISOString(),
      daysRemaining,
    };
  } catch {
    return { isActive: false, expirationDate: null, daysRemaining: 0 };
  }
}
