/**
 * useSubscription Hook
 *
 * Provides subscription state, available packages, and entitlement info.
 * Loads data on mount and listens for customer info updates.
 *
 * Story 6.1: RevenueCat Integration & Setup - Task 5
 */

import { useEffect, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';
import { checkEntitlements } from '@/lib/subscription/entitlementService';

export function useSubscription() {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const isTrialActive = useSubscriptionStore((s) => s.isTrialActive);
  const currentPlan = useSubscriptionStore((s) => s.currentPlan);
  const entitlementStatus = useSubscriptionStore((s) => s.entitlementStatus);
  const expirationDate = useSubscriptionStore((s) => s.expirationDate);
  const isLoading = useSubscriptionStore((s) => s.isLoading);
  const setLoading = useSubscriptionStore((s) => s.setLoading);

  const loadSubscriptionData = useCallback(async () => {
    try {
      // Fetch available packages
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setPackages(offerings.current.availablePackages);
      }
    } catch {
      // Offerings fetch failed (offline) — keep empty packages
    }

    // Check entitlements (updates store)
    await checkEntitlements();
  }, []);

  useEffect(() => {
    loadSubscriptionData();

    // Listen for customer info updates (e.g., subscription changes)
    const handleCustomerInfoUpdate = () => {
      checkEntitlements();
    };
    Purchases.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);

    // Refresh entitlements when app comes to foreground
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkEntitlements();
      }
    });

    return () => {
      Purchases.removeCustomerInfoUpdateListener(handleCustomerInfoUpdate);
      appStateSubscription?.remove();
    };
  }, [loadSubscriptionData]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadSubscriptionData();
  }, [loadSubscriptionData, setLoading]);

  return {
    packages,
    isPremium,
    isTrialActive,
    currentPlan,
    entitlementStatus,
    expirationDate,
    isLoading,
    refresh,
  };
}
