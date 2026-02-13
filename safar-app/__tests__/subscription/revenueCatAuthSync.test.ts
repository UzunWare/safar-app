/**
 * Tests for RevenueCat auth synchronization
 */

import Purchases from 'react-native-purchases';
import { syncRevenueCatAuthState } from '@/lib/subscription/revenueCatAuthSync';
import { checkEntitlements } from '@/lib/subscription/entitlementService';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';

jest.mock('@/lib/subscription/entitlementService', () => ({
  __esModule: true,
  checkEntitlements: jest.fn(() => Promise.resolve()),
}));

describe('syncRevenueCatAuthState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSubscriptionStore.setState({
      isPremium: false,
      isTrialActive: false,
      currentPlan: null,
      entitlementStatus: 'unknown',
      isLoading: true,
    });
  });

  it('logs in RevenueCat user and refreshes entitlements for signed-in users', async () => {
    await syncRevenueCatAuthState('user-123');

    expect(Purchases.logIn).toHaveBeenCalledWith('user-123');
    expect(checkEntitlements).toHaveBeenCalledTimes(1);
  });

  it('still checks entitlements when logIn fails', async () => {
    (Purchases.logIn as jest.Mock).mockRejectedValueOnce(new Error('Network'));

    await syncRevenueCatAuthState('user-123');

    expect(checkEntitlements).toHaveBeenCalledTimes(1);
  });

  it('logs out and resets subscription state for signed-out users', async () => {
    useSubscriptionStore.setState({
      isPremium: true,
      isTrialActive: true,
      currentPlan: 'monthly',
      entitlementStatus: 'active',
      isLoading: false,
    });

    await syncRevenueCatAuthState(null);

    const state = useSubscriptionStore.getState();
    expect(Purchases.logOut).toHaveBeenCalledTimes(1);
    expect(checkEntitlements).not.toHaveBeenCalled();
    expect(state.entitlementStatus).toBe('unknown');
    expect(state.isPremium).toBe(false);
    expect(state.isTrialActive).toBe(false);
    expect(state.currentPlan).toBeNull();
    expect(state.isLoading).toBe(true);
  });
});
