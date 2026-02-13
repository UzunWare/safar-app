/**
 * Tests for Subscription Store (Zustand)
 *
 * Story 6.1: RevenueCat Integration & Setup - Task 7
 */

import { act } from '@testing-library/react-native';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';

describe('useSubscriptionStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useSubscriptionStore.setState({
        isPremium: false,
        isTrialActive: false,
        currentPlan: null,
        entitlementStatus: 'unknown',
        isLoading: true,
      });
    });
  });

  it('should have correct initial state', () => {
    const state = useSubscriptionStore.getState();

    expect(state.isPremium).toBe(false);
    expect(state.isTrialActive).toBe(false);
    expect(state.currentPlan).toBeNull();
    expect(state.entitlementStatus).toBe('unknown');
    expect(state.isLoading).toBe(true);
  });

  it('should set premium status', () => {
    act(() => {
      useSubscriptionStore.getState().setEntitlementStatus('active');
    });

    const state = useSubscriptionStore.getState();
    expect(state.isPremium).toBe(true);
    expect(state.entitlementStatus).toBe('active');
    expect(state.isLoading).toBe(false);
  });

  it('should set trial status', () => {
    act(() => {
      useSubscriptionStore.getState().setTrialActive(true);
    });

    expect(useSubscriptionStore.getState().isTrialActive).toBe(true);
  });

  it('should set current plan', () => {
    act(() => {
      useSubscriptionStore.getState().setCurrentPlan('monthly');
    });

    expect(useSubscriptionStore.getState().currentPlan).toBe('monthly');
  });

  it('should set annual plan', () => {
    act(() => {
      useSubscriptionStore.getState().setCurrentPlan('annual');
    });

    expect(useSubscriptionStore.getState().currentPlan).toBe('annual');
  });

  it('should handle expired entitlement', () => {
    // First set as active
    act(() => {
      useSubscriptionStore.getState().setEntitlementStatus('active');
    });
    expect(useSubscriptionStore.getState().isPremium).toBe(true);

    // Then expire
    act(() => {
      useSubscriptionStore.getState().setEntitlementStatus('expired');
    });

    const state = useSubscriptionStore.getState();
    expect(state.isPremium).toBe(false);
    expect(state.entitlementStatus).toBe('expired');
  });

  it('should set loading state', () => {
    act(() => {
      useSubscriptionStore.getState().setLoading(false);
    });

    expect(useSubscriptionStore.getState().isLoading).toBe(false);
  });

  it('should reset store to defaults', () => {
    // Set some values
    act(() => {
      useSubscriptionStore.getState().setEntitlementStatus('active');
      useSubscriptionStore.getState().setCurrentPlan('monthly');
      useSubscriptionStore.getState().setTrialActive(true);
    });

    // Reset
    act(() => {
      useSubscriptionStore.getState().reset();
    });

    const state = useSubscriptionStore.getState();
    expect(state.isPremium).toBe(false);
    expect(state.isTrialActive).toBe(false);
    expect(state.currentPlan).toBeNull();
    expect(state.entitlementStatus).toBe('unknown');
    expect(state.isLoading).toBe(true);
  });
});
