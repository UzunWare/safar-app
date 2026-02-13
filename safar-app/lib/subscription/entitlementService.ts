/**
 * Entitlement Service
 *
 * Checks RevenueCat entitlements and updates the subscription store.
 * Handles offline graceful degradation via AsyncStorage caching.
 *
 * Story 6.1: RevenueCat Integration & Setup - Task 6
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import { useSubscriptionStore, type SubscriptionPlan } from '@/lib/stores/useSubscriptionStore';
import { getLocalTrialStatus } from '@/lib/subscription/trialService';

export const ENTITLEMENT_ID = 'premium';
export const CACHE_KEY = 'safar_entitlement_cache';
export const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

interface CachedEntitlement {
  isPremium: boolean;
  isTrialActive: boolean;
  currentPlan: SubscriptionPlan;
  entitlementStatus: 'active' | 'expired' | 'none';
  expirationDate: string | null;
  cachedAt: number;
}

function detectPlan(productIdentifier: string | null | undefined): SubscriptionPlan {
  if (!productIdentifier) return null;
  const normalizedId = productIdentifier.toLowerCase();
  if (
    normalizedId.includes('annual') ||
    normalizedId.includes('yearly') ||
    normalizedId.includes('year')
  ) {
    return 'annual';
  }
  if (
    normalizedId.includes('monthly') ||
    normalizedId.includes('month')
  ) {
    return 'monthly';
  }
  return null;
}

async function cacheEntitlementStatus(data: Omit<CachedEntitlement, 'cachedAt'>): Promise<void> {
  try {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        ...data,
        cachedAt: Date.now(),
      })
    );
  } catch {
    // Cache failure is non-critical
  }
}

async function loadCachedEntitlement(): Promise<CachedEntitlement | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as Partial<CachedEntitlement>;
    const isValid =
      typeof parsed.isPremium === 'boolean' &&
      typeof parsed.isTrialActive === 'boolean' &&
      (parsed.currentPlan === 'monthly' ||
        parsed.currentPlan === 'annual' ||
        parsed.currentPlan === null) &&
      (parsed.entitlementStatus === 'active' ||
        parsed.entitlementStatus === 'expired' ||
        parsed.entitlementStatus === 'none') &&
      (parsed.expirationDate === null ||
        parsed.expirationDate === undefined ||
        typeof parsed.expirationDate === 'string') &&
      typeof parsed.cachedAt === 'number';

    if (!isValid) return null;

    const cachedAt = parsed.cachedAt;
    if (typeof cachedAt !== 'number') return null;

    if (Date.now() - cachedAt > CACHE_TTL_MS) {
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed as CachedEntitlement;
  } catch {
    // Cache read failure is non-critical
  }
  return null;
}

export async function checkEntitlements(): Promise<void> {
  const { setEntitlementStatus, setTrialActive, setCurrentPlan, setExpirationDate, setLoading } =
    useSubscriptionStore.getState();

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const activeEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    const anyEntitlement = customerInfo.entitlements.all?.[ENTITLEMENT_ID];

    if (activeEntitlement) {
      const expDate = activeEntitlement.expirationDate ?? null;
      setEntitlementStatus('active');
      setTrialActive(activeEntitlement.periodType === 'TRIAL');
      setCurrentPlan(detectPlan(activeEntitlement.productIdentifier));
      setExpirationDate(expDate);

      await cacheEntitlementStatus({
        isPremium: true,
        isTrialActive: activeEntitlement.periodType === 'TRIAL',
        currentPlan: detectPlan(activeEntitlement.productIdentifier),
        entitlementStatus: 'active',
        expirationDate: expDate,
      });
    } else if (anyEntitlement) {
      const expDate = anyEntitlement.expirationDate ?? null;

      setEntitlementStatus('expired');
      setTrialActive(false);
      setCurrentPlan(detectPlan(anyEntitlement.productIdentifier));
      setExpirationDate(expDate);

      await cacheEntitlementStatus({
        isPremium: false,
        isTrialActive: false,
        currentPlan: detectPlan(anyEntitlement.productIdentifier),
        entitlementStatus: 'expired',
        expirationDate: expDate,
      });
    } else {
      // No RevenueCat entitlement — check local trial fallback
      const localTrial = await getLocalTrialStatus();
      if (localTrial.isActive) {
        setEntitlementStatus('active');
        setTrialActive(true);
        setCurrentPlan(null);
        setExpirationDate(localTrial.expirationDate);

        await cacheEntitlementStatus({
          isPremium: false,
          isTrialActive: true,
          currentPlan: null,
          entitlementStatus: 'active',
          expirationDate: localTrial.expirationDate,
        });
      } else {
        setEntitlementStatus('none');
        setTrialActive(false);
        setCurrentPlan(null);
        setExpirationDate(null);

        await cacheEntitlementStatus({
          isPremium: false,
          isTrialActive: false,
          currentPlan: null,
          entitlementStatus: 'none',
          expirationDate: null,
        });
      }
    }
  } catch {
    // Offline fallback: use cached entitlement
    const cached = await loadCachedEntitlement();
    if (cached) {
      setEntitlementStatus(cached.entitlementStatus);
      setTrialActive(cached.isTrialActive);
      setCurrentPlan(cached.currentPlan);
      setExpirationDate(cached.expirationDate ?? null);
    } else {
      // No cache — check local trial fallback
      const localTrial = await getLocalTrialStatus();
      if (localTrial.isActive) {
        setEntitlementStatus('active');
        setTrialActive(true);
        setCurrentPlan(null);
        setExpirationDate(localTrial.expirationDate);
      } else {
        setEntitlementStatus('none');
        setTrialActive(false);
        setCurrentPlan(null);
        setExpirationDate(null);
        setLoading(false);
      }
    }
  }
}
