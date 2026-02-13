/**
 * Subscription Store using Zustand
 * Manages subscription and entitlement state
 *
 * Story 6.1: RevenueCat Integration & Setup - Task 7
 */

import { create } from 'zustand';

export type EntitlementStatus = 'unknown' | 'active' | 'expired' | 'none';
export type SubscriptionPlan = 'monthly' | 'annual' | null;

interface SubscriptionState {
  isPremium: boolean;
  isTrialActive: boolean;
  currentPlan: SubscriptionPlan;
  entitlementStatus: EntitlementStatus;
  expirationDate: string | null;
  isLoading: boolean;

  // Actions
  setEntitlementStatus: (status: EntitlementStatus) => void;
  setTrialActive: (active: boolean) => void;
  setCurrentPlan: (plan: SubscriptionPlan) => void;
  setExpirationDate: (date: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  isPremium: false,
  isTrialActive: false,
  currentPlan: null as SubscriptionPlan,
  entitlementStatus: 'unknown' as EntitlementStatus,
  expirationDate: null as string | null,
  isLoading: true,
};

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  ...initialState,

  setEntitlementStatus: (status) =>
    set({
      entitlementStatus: status,
      isPremium: status === 'active',
      isLoading: false,
    }),

  setTrialActive: (active) => set({ isTrialActive: active }),

  setCurrentPlan: (plan) => set({ currentPlan: plan }),

  setExpirationDate: (date) => set({ expirationDate: date }),

  setLoading: (loading) => set({ isLoading: loading }),

  reset: () => set(initialState),
}));
