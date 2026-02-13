/**
 * useContentAccess Hook
 *
 * Determines whether the user has access to premium content.
 * Access is granted during active trial, active subscription, or while loading.
 * Returns shouldShowPaywall for gating learning content.
 *
 * Story 6.2: Free Trial Period - Task 7
 */

import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';

interface ContentAccess {
  hasAccess: boolean;
  shouldShowPaywall: boolean;
  isLoading: boolean;
}

export function useContentAccess(): ContentAccess {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const isTrialActive = useSubscriptionStore((s) => s.isTrialActive);
  const isLoading = useSubscriptionStore((s) => s.isLoading);

  // During loading, optimistically grant access to avoid paywall flash
  const hasAccess = isPremium || isTrialActive || isLoading;

  return {
    hasAccess,
    shouldShowPaywall: !hasAccess,
    isLoading,
  };
}
