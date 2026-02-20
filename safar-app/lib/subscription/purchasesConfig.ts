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
  const fallbackApiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
  const apiKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || fallbackApiKey
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || fallbackApiKey;

  if (!apiKey) {
    if (__DEV__) {
      console.warn(
        'RevenueCat: No API key configured for',
        Platform.OS,
        '(set EXPO_PUBLIC_REVENUECAT_IOS_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_KEY)'
      );
    }
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  }

  await Purchases.configure({ apiKey });
}
