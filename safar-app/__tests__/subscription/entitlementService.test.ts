/**
 * Tests for Entitlement Service
 *
 * Story 6.1: RevenueCat Integration & Setup - Task 6
 */

import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkEntitlements,
  CACHE_TTL_MS,
  ENTITLEMENT_ID,
  CACHE_KEY,
} from '@/lib/subscription/entitlementService';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';
import { getLocalTrialStatus } from '@/lib/subscription/trialService';

jest.mock('@/lib/subscription/trialService', () => ({
  getLocalTrialStatus: jest.fn(),
}));

const mockGetLocalTrialStatus = getLocalTrialStatus as jest.MockedFunction<typeof getLocalTrialStatus>;

describe('entitlementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => Promise.resolve(null));
    (AsyncStorage.setItem as jest.Mock).mockImplementation(() => Promise.resolve());
    (AsyncStorage.removeItem as jest.Mock).mockImplementation(() => Promise.resolve());

    // Default: no local trial active
    mockGetLocalTrialStatus.mockResolvedValue({
      isActive: false,
      expirationDate: null,
      daysRemaining: 0,
    });

    // Reset store
    useSubscriptionStore.setState({
      isPremium: false,
      isTrialActive: false,
      currentPlan: null,
      entitlementStatus: 'unknown',
      isLoading: true,
    });
  });

  describe('checkEntitlements', () => {
    it('should check RevenueCat customer info and update store when premium', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        entitlements: {
          active: {
            [ENTITLEMENT_ID]: {
              identifier: ENTITLEMENT_ID,
              isActive: true,
              periodType: 'NORMAL',
              productIdentifier: 'safar_monthly',
            },
          },
        },
      });

      await checkEntitlements();

      const state = useSubscriptionStore.getState();
      expect(state.isPremium).toBe(true);
      expect(state.entitlementStatus).toBe('active');
      expect(state.isLoading).toBe(false);
    });

    it('should detect trial period', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        entitlements: {
          active: {
            [ENTITLEMENT_ID]: {
              identifier: ENTITLEMENT_ID,
              isActive: true,
              periodType: 'TRIAL',
              productIdentifier: 'safar_monthly',
            },
          },
        },
      });

      await checkEntitlements();

      const state = useSubscriptionStore.getState();
      expect(state.isPremium).toBe(true);
      expect(state.isTrialActive).toBe(true);
    });

    it('should detect monthly plan from product identifier', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        entitlements: {
          active: {
            [ENTITLEMENT_ID]: {
              identifier: ENTITLEMENT_ID,
              isActive: true,
              periodType: 'NORMAL',
              productIdentifier: 'safar_monthly',
            },
          },
        },
      });

      await checkEntitlements();

      expect(useSubscriptionStore.getState().currentPlan).toBe('monthly');
    });

    it('should detect annual plan from product identifier', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        entitlements: {
          active: {
            [ENTITLEMENT_ID]: {
              identifier: ENTITLEMENT_ID,
              isActive: true,
              periodType: 'NORMAL',
              productIdentifier: 'safar_annual',
            },
          },
        },
      });

      await checkEntitlements();

      expect(useSubscriptionStore.getState().currentPlan).toBe('annual');
    });

    it('should detect annual plan from yearly product identifier', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        entitlements: {
          active: {
            [ENTITLEMENT_ID]: {
              identifier: ENTITLEMENT_ID,
              isActive: true,
              periodType: 'NORMAL',
              productIdentifier: 'safar_yearly',
            },
          },
        },
      });

      await checkEntitlements();

      expect(useSubscriptionStore.getState().currentPlan).toBe('annual');
    });

    it('should set not premium when no active entitlements', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        entitlements: { active: {} },
      });

      await checkEntitlements();

      const state = useSubscriptionStore.getState();
      expect(state.isPremium).toBe(false);
      expect(state.entitlementStatus).toBe('none');
    });

    it('should mark entitlement as expired when user had premium before but is no longer active', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        entitlements: {
          active: {},
          all: {
            [ENTITLEMENT_ID]: {
              identifier: ENTITLEMENT_ID,
              isActive: false,
              periodType: 'NORMAL',
              productIdentifier: 'safar_monthly',
              expirationDate: '2026-01-01T00:00:00Z',
            },
          },
        },
      });

      await checkEntitlements();

      const state = useSubscriptionStore.getState();
      expect(state.isPremium).toBe(false);
      expect(state.entitlementStatus).toBe('expired');
      expect(state.currentPlan).toBe('monthly');
      expect(state.expirationDate).toBe('2026-01-01T00:00:00Z');
    });

    it('should cache entitlement status in AsyncStorage', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        entitlements: {
          active: {
            [ENTITLEMENT_ID]: {
              identifier: ENTITLEMENT_ID,
              isActive: true,
              periodType: 'NORMAL',
              productIdentifier: 'safar_monthly',
            },
          },
        },
      });

      await checkEntitlements();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(CACHE_KEY, expect.any(String));
      const cachedValue = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      expect(cachedValue.isPremium).toBe(true);
      expect(typeof cachedValue.cachedAt).toBe('number');
    });

    it('should fall back to cached entitlement when offline', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockRejectedValue(new Error('Network error'));
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          isPremium: true,
          isTrialActive: false,
          currentPlan: 'annual',
          entitlementStatus: 'active',
          cachedAt: Date.now(),
        })
      );

      await checkEntitlements();

      const state = useSubscriptionStore.getState();
      expect(state.isPremium).toBe(true);
      expect(state.currentPlan).toBe('annual');
      expect(state.entitlementStatus).toBe('active');
    });

    it('should set none status when offline with no cache', async () => {
      useSubscriptionStore.setState({
        isPremium: true,
        isTrialActive: true,
        currentPlan: 'monthly',
        entitlementStatus: 'active',
        isLoading: true,
      });

      (Purchases.getCustomerInfo as jest.Mock).mockRejectedValue(new Error('Network error'));
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await checkEntitlements();

      const state = useSubscriptionStore.getState();
      expect(state.isPremium).toBe(false);
      expect(state.isTrialActive).toBe(false);
      expect(state.currentPlan).toBeNull();
      expect(state.entitlementStatus).toBe('none');
      expect(state.isLoading).toBe(false);
    });

    it('should ignore stale cached entitlement and clear it', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockRejectedValue(new Error('Network error'));
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          isPremium: true,
          isTrialActive: false,
          currentPlan: 'annual',
          entitlementStatus: 'active',
          cachedAt: Date.now() - CACHE_TTL_MS - 1,
        })
      );

      await checkEntitlements();

      const state = useSubscriptionStore.getState();
      expect(state.entitlementStatus).toBe('none');
      expect(state.isPremium).toBe(false);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(CACHE_KEY);
    });

    it('should grant access via local trial when RevenueCat has no entitlement', async () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        entitlements: { active: {} },
      });
      mockGetLocalTrialStatus.mockResolvedValue({
        isActive: true,
        expirationDate: futureDate,
        daysRemaining: 5,
      });

      await checkEntitlements();

      const state = useSubscriptionStore.getState();
      // isPremium is true because setEntitlementStatus('active') sets it
      expect(state.isPremium).toBe(true);
      expect(state.isTrialActive).toBe(true);
      expect(state.entitlementStatus).toBe('active');
      expect(state.expirationDate).toBe(futureDate);
      expect(state.isLoading).toBe(false);
    });

    it('should show paywall when RevenueCat has no entitlement and local trial expired', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        entitlements: { active: {} },
      });
      mockGetLocalTrialStatus.mockResolvedValue({
        isActive: false,
        expirationDate: null,
        daysRemaining: 0,
      });

      await checkEntitlements();

      const state = useSubscriptionStore.getState();
      expect(state.isPremium).toBe(false);
      expect(state.isTrialActive).toBe(false);
      expect(state.entitlementStatus).toBe('none');
    });

    it('should grant access via local trial when offline with no cache', async () => {
      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      (Purchases.getCustomerInfo as jest.Mock).mockRejectedValue(new Error('Network error'));
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      mockGetLocalTrialStatus.mockResolvedValue({
        isActive: true,
        expirationDate: futureDate,
        daysRemaining: 3,
      });

      await checkEntitlements();

      const state = useSubscriptionStore.getState();
      expect(state.isTrialActive).toBe(true);
      expect(state.entitlementStatus).toBe('active');
      expect(state.expirationDate).toBe(futureDate);
    });
  });
});
