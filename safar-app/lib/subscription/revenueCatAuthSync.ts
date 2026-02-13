/**
 * RevenueCat auth/user synchronization
 *
 * Aligns RevenueCat customer identity with app auth session changes.
 */

import Purchases from 'react-native-purchases';
import { checkEntitlements } from '@/lib/subscription/entitlementService';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';

export async function syncRevenueCatAuthState(userId: string | null | undefined): Promise<void> {
  if (userId) {
    try {
      await Purchases.logIn(userId);
    } catch {
      // Best effort - continue to entitlement check.
    }

    await checkEntitlements().catch(() => {
      // Keep initialization resilient.
    });
    return;
  }

  try {
    if (typeof Purchases.logOut === 'function') {
      await Purchases.logOut();
    }
  } catch {
    // Ignore logout failures.
  }

  useSubscriptionStore.getState().reset();
}
