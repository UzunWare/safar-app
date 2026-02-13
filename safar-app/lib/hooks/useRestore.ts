/**
 * useRestore Hook
 *
 * Handles RevenueCat purchase restoration: success, no subscription, and errors.
 * Returns restore state and actions for UI integration.
 *
 * Story 6.6: Purchase Restoration - Tasks 2-6
 */

import { useState, useCallback } from 'react';
import Purchases from 'react-native-purchases';
import { checkEntitlements, ENTITLEMENT_ID } from '@/lib/subscription/entitlementService';

type RestoreResult =
  | { success: true }
  | { noSubscription: true }
  | { error: string };

export function useRestore() {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restored, setRestored] = useState(false);
  const [noSubscription, setNoSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restore = useCallback(async (): Promise<RestoreResult> => {
    setIsRestoring(true);
    setError(null);
    setRestored(false);
    setNoSubscription(false);

    try {
      const customerInfo = await Purchases.restorePurchases();

      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        // Restores should still succeed even if a follow-up entitlement refresh fails.
        try {
          await checkEntitlements();
        } catch {
          // Non-fatal: restore result already includes active entitlement.
        }
        setRestored(true);
        return { success: true };
      }

      // No active subscription found
      setNoSubscription(true);
      return { noSubscription: true };
    } catch {
      const message = "Couldn't restore purchases. Check your connection and try again.";
      setError(message);
      return { error: message };
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isRestoring,
    restored,
    noSubscription,
    error,
    restore,
    clearError,
  };
}
