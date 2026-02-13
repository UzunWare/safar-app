/**
 * RevenueCat Purchases Configuration
 *
 * Initializes the RevenueCat SDK with platform-specific API keys.
 *
 * Story 6.1: RevenueCat Integration & Setup - Task 4
 */

import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

export async function initializePurchases(): Promise<void> {
  const apiKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

  if (!apiKey) {
    if (__DEV__) {
      console.warn('RevenueCat: No API key configured for', Platform.OS);
    }
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  }

  await Purchases.configure({ apiKey });
}
