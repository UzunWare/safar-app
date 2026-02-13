/**
 * usePurchase Hook
 *
 * Handles RevenueCat purchase flow: initiation, success, cancellation, and errors.
 * Returns purchase state and actions for UI integration.
 *
 * Story 6.4: Purchase Flow - Tasks 1-3, 5-7
 */

import { useState, useCallback } from 'react';
import Purchases, {
  PURCHASES_ERROR_CODE,
  type PurchasesError,
  type PurchasesPackage,
} from 'react-native-purchases';
import { checkEntitlements } from '@/lib/subscription/entitlementService';
import { AnalyticsEvents, trackEvent } from '@/lib/utils/analytics';

type PurchaseResult =
  | { success: true }
  | { cancelled: true }
  | { error: string };

type PurchasePlanType = 'monthly' | 'annual' | 'unknown';

function getPlanType(pkg: PurchasesPackage): PurchasePlanType {
  const packageType = pkg.packageType.toUpperCase();
  if (packageType.includes('MONTH')) return 'monthly';
  if (packageType.includes('ANNUAL') || packageType.includes('YEAR')) return 'annual';
  return 'unknown';
}

function isCancelledError(error: PurchasesError | null | undefined): boolean {
  if (!error) return false;
  return (
    error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || error.userCancelled === true
  );
}

function getErrorMessage(error: PurchasesError | null | undefined): string {
  const code = error?.code;
  if (
    code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR ||
    String(code) === 'PAYMENT_PENDING'
  ) {
    return 'Your payment is pending. Please wait and try again.';
  }
  if (code === PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR || String(code) === 'STORE_PROBLEM') {
    return 'There was a problem with the store. Please try again later.';
  }
  if (
    code === PURCHASES_ERROR_CODE.NETWORK_ERROR ||
    code === PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR ||
    String(code) === 'NETWORK_ERROR'
  ) {
    return 'Please check your internet connection and try again.';
  }
  return 'Something went wrong. Please try again.';
}

export function usePurchase() {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPurchasedPackage, setLastPurchasedPackage] = useState<PurchasesPackage | null>(null);

  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
      setIsPurchasing(true);
      setError(null);

      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);

        // Check if premium entitlement is now active
        if (customerInfo.entitlements.active['premium']) {
          await checkEntitlements();
          setLastPurchasedPackage(pkg);
          setShowSuccess(true);

          trackEvent(AnalyticsEvents.SUBSCRIPTION_STARTED, {
            plan_type: getPlanType(pkg),
            package_type: pkg.packageType,
            package_identifier: pkg.identifier,
            product_identifier: pkg.product.identifier,
            price: pkg.product.price,
            price_string: pkg.product.priceString,
            offering_identifier: pkg.offeringIdentifier ?? null,
          });

          return { success: true };
        }

        // Entitlement not active despite successful purchase
        setLastPurchasedPackage(null);
        return { error: 'Purchase completed but entitlement not active. Please try again.' };
      } catch (err: unknown) {
        const purchaseError = err as PurchasesError;

        if (isCancelledError(purchaseError)) {
          setLastPurchasedPackage(null);
          return { cancelled: true };
        }

        const message = getErrorMessage(purchaseError);
        setError(message);
        setLastPurchasedPackage(null);
        return { error: message };
      } finally {
        setIsPurchasing(false);
      }
    },
    []
  );

  const dismissSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isPurchasing,
    showSuccess,
    error,
    lastPurchasedPackage,
    purchasePackage,
    dismissSuccess,
    clearError,
  };
}
