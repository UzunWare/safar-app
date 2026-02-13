/**
 * usePurchase Hook Tests
 *
 * Story 6.4: Purchase Flow
 * Tasks 1-3, 5-7: Purchase initiation, success, cancellation, errors, analytics
 */

import { renderHook, act } from '@testing-library/react-native';
import Purchases, { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';
import { usePurchase } from '@/lib/hooks/usePurchase';

// Mock checkEntitlements
jest.mock('@/lib/subscription/entitlementService', () => ({
  checkEntitlements: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/lib/utils/analytics', () => ({
  trackEvent: jest.fn(),
  AnalyticsEvents: {
    SUBSCRIPTION_STARTED: 'subscription_started',
  },
}));

const mockPurchasePackage = Purchases.purchasePackage as jest.Mock;

const mockMonthlyPackage = {
  identifier: '$rc_monthly',
  packageType: 'MONTHLY',
  product: {
    identifier: 'safar_monthly',
    priceString: '$4.99',
    price: 4.99,
  },
  offeringIdentifier: 'default',
};

const mockAnnualPackage = {
  identifier: '$rc_annual',
  packageType: 'ANNUAL',
  product: {
    identifier: 'safar_annual',
    priceString: '$34.99',
    price: 34.99,
  },
  offeringIdentifier: 'default',
};

describe('usePurchase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSubscriptionStore.getState().reset();
  });

  // --- Task 1: Purchase initiation ---
  describe('Task 1: Purchase initiation', () => {
    it('calls RevenueCat purchasePackage with selected package', async () => {
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      });

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(mockPurchasePackage).toHaveBeenCalledWith(mockMonthlyPackage);
    });

    it('sets isPurchasing to true during purchase', async () => {
      let resolvePurchase: (value: any) => void;
      const purchasePromise = new Promise((resolve) => {
        resolvePurchase = resolve;
      });
      mockPurchasePackage.mockReturnValueOnce(purchasePromise);

      const { result } = renderHook(() => usePurchase());

      expect(result.current.isPurchasing).toBe(false);

      let purchasePromiseResult: Promise<any>;
      act(() => {
        purchasePromiseResult = result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.isPurchasing).toBe(true);

      await act(async () => {
        resolvePurchase!({
          customerInfo: {
            entitlements: {
              active: {
                premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
              },
            },
          },
        });
        await purchasePromiseResult!;
      });

      expect(result.current.isPurchasing).toBe(false);
    });

    it('passes the correct package to purchasePackage', async () => {
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      });

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockAnnualPackage as any);
      });

      expect(mockPurchasePackage).toHaveBeenCalledWith(mockAnnualPackage);
    });
  });

  // --- Task 2: Native purchase flow (RevenueCat handles UI) ---
  describe('Task 2: Native purchase flow', () => {
    it('delegates to RevenueCat for native purchase UI', async () => {
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      });

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      // RevenueCat purchasePackage handles all native UI (Face ID, password, etc.)
      expect(Purchases.purchasePackage).toHaveBeenCalledTimes(1);
    });
  });

  // --- Task 3: Successful purchase ---
  describe('Task 3: Successful purchase', () => {
    it('returns success result when purchase completes', async () => {
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      });

      const { result } = renderHook(() => usePurchase());

      let purchaseResult: any;
      await act(async () => {
        purchaseResult = await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(purchaseResult).toEqual({ success: true });
    });

    it('updates subscription store on successful purchase', async () => {
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      });

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      const { checkEntitlements } = require('@/lib/subscription/entitlementService');
      expect(checkEntitlements).toHaveBeenCalled();
    });

    it('sets showSuccess to true on successful purchase', async () => {
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      });

      const { result } = renderHook(() => usePurchase());

      expect(result.current.showSuccess).toBe(false);

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.showSuccess).toBe(true);
    });

    it('can dismiss success modal', async () => {
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      });

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.showSuccess).toBe(true);

      act(() => {
        result.current.dismissSuccess();
      });

      expect(result.current.showSuccess).toBe(false);
    });

    it('does not show success if entitlement not active after purchase', async () => {
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {},
          },
        },
      });

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.showSuccess).toBe(false);
    });
  });

  // --- Task 5: Purchase cancellation ---
  describe('Task 5: Purchase cancellation', () => {
    it('handles user cancellation silently', async () => {
      const cancelError = new Error('User cancelled');
      (cancelError as any).code = PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
      mockPurchasePackage.mockRejectedValueOnce(cancelError);

      const { result } = renderHook(() => usePurchase());

      let purchaseResult: any;
      await act(async () => {
        purchaseResult = await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(purchaseResult).toEqual({ cancelled: true });
      expect(result.current.error).toBeNull();
      expect(result.current.showSuccess).toBe(false);
    });

    it('does not set error state on cancellation', async () => {
      const cancelError = new Error('User cancelled');
      (cancelError as any).code = PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
      mockPurchasePackage.mockRejectedValueOnce(cancelError);

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.error).toBeNull();
    });
  });

  // --- Task 6: Purchase errors ---
  describe('Task 6: Purchase errors', () => {
    it('sets error state on payment failure', async () => {
      const paymentError = new Error('Payment declined');
      (paymentError as any).code = PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR;
      mockPurchasePackage.mockRejectedValueOnce(paymentError);

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('pending');
    });

    it('shows user-friendly message for store problems', async () => {
      const storeError = new Error('Store error');
      (storeError as any).code = PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR;
      mockPurchasePackage.mockRejectedValueOnce(storeError);

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.error).toContain('store');
    });

    it('shows network error message', async () => {
      const networkError = new Error('Network error');
      (networkError as any).code = PURCHASES_ERROR_CODE.NETWORK_ERROR;
      mockPurchasePackage.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.error).toContain('internet');
    });

    it('shows generic error for unknown failures', async () => {
      const unknownError = new Error('Something failed');
      mockPurchasePackage.mockRejectedValueOnce(unknownError);

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('try again');
    });

    it('returns error result on failure', async () => {
      const paymentError = new Error('Payment declined');
      mockPurchasePackage.mockRejectedValueOnce(paymentError);

      const { result } = renderHook(() => usePurchase());

      let purchaseResult: any;
      await act(async () => {
        purchaseResult = await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(purchaseResult).toEqual({ error: expect.any(String) });
    });

    it('can clear error state', async () => {
      const paymentError = new Error('Payment declined');
      mockPurchasePackage.mockRejectedValueOnce(paymentError);

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('can retry purchase after error', async () => {
      const paymentError = new Error('Payment declined');
      mockPurchasePackage.mockRejectedValueOnce(paymentError);

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.error).toBeTruthy();

      // Retry - succeeds this time
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      });

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.showSuccess).toBe(true);
    });
  });

  // --- Task 7: Purchase analytics ---
  describe('Task 7: Purchase analytics', () => {
    it('returns success result after tracking analytics', async () => {
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      });

      const { result } = renderHook(() => usePurchase());

      let purchaseResult: any;
      await act(async () => {
        purchaseResult = await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(purchaseResult).toEqual({ success: true });
    });

    it('tracks subscription_started analytics event with plan metadata', async () => {
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      });

      const { trackEvent, AnalyticsEvents } = require('@/lib/utils/analytics');
      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.SUBSCRIPTION_STARTED, {
        plan_type: 'monthly',
        package_type: 'MONTHLY',
        package_identifier: '$rc_monthly',
        product_identifier: 'safar_monthly',
        price: 4.99,
        price_string: '$4.99',
        offering_identifier: 'default',
      });
    });

    it('tracks last purchased package info', async () => {
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      });

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockAnnualPackage as any);
      });

      expect(result.current.lastPurchasedPackage).toEqual(mockAnnualPackage);
    });

    it('clears lastPurchasedPackage on error', async () => {
      const error = new Error('Failed');
      mockPurchasePackage.mockRejectedValueOnce(error);

      const { result } = renderHook(() => usePurchase());

      await act(async () => {
        await result.current.purchasePackage(mockMonthlyPackage as any);
      });

      expect(result.current.lastPurchasedPackage).toBeNull();
    });
  });
});
