/**
 * useContentAccess Hook Tests
 *
 * Story 6.2: Free Trial Period - Task 7
 */

import { renderHook } from '@testing-library/react-native';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';
import { useContentAccess } from '@/lib/hooks/useContentAccess';

describe('useContentAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSubscriptionStore.getState().reset();
  });

  it('should grant access when user is premium (paid subscriber)', () => {
    useSubscriptionStore.setState({
      isPremium: true,
      isTrialActive: false,
      entitlementStatus: 'active',
    });

    const { result } = renderHook(() => useContentAccess());

    expect(result.current.hasAccess).toBe(true);
    expect(result.current.shouldShowPaywall).toBe(false);
  });

  it('should grant access when user is in trial', () => {
    useSubscriptionStore.setState({
      isPremium: false,
      isTrialActive: true,
      entitlementStatus: 'active',
    });

    const { result } = renderHook(() => useContentAccess());

    expect(result.current.hasAccess).toBe(true);
    expect(result.current.shouldShowPaywall).toBe(false);
  });

  it('should deny access when trial has expired and no subscription', () => {
    useSubscriptionStore.setState({
      isPremium: false,
      isTrialActive: false,
      entitlementStatus: 'none',
      isLoading: false,
    });

    const { result } = renderHook(() => useContentAccess());

    expect(result.current.hasAccess).toBe(false);
    expect(result.current.shouldShowPaywall).toBe(true);
  });

  it('should deny access when entitlement status is expired', () => {
    useSubscriptionStore.setState({
      isPremium: false,
      isTrialActive: false,
      entitlementStatus: 'expired',
      isLoading: false,
    });

    const { result } = renderHook(() => useContentAccess());

    expect(result.current.hasAccess).toBe(false);
    expect(result.current.shouldShowPaywall).toBe(true);
  });

  it('should grant access during loading (optimistic)', () => {
    useSubscriptionStore.setState({
      isPremium: false,
      isTrialActive: false,
      entitlementStatus: 'unknown',
      isLoading: true,
    });

    const { result } = renderHook(() => useContentAccess());

    // During loading, don't show paywall to avoid flash
    expect(result.current.hasAccess).toBe(true);
    expect(result.current.shouldShowPaywall).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('should expose loading state', () => {
    useSubscriptionStore.setState({
      isLoading: false,
      isPremium: true,
      entitlementStatus: 'active',
    });

    const { result } = renderHook(() => useContentAccess());

    expect(result.current.isLoading).toBe(false);
  });
});
