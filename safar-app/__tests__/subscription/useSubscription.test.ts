/**
 * Tests for useSubscription Hook
 *
 * Story 6.1: RevenueCat Integration & Setup - Task 5
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import Purchases from 'react-native-purchases';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';

describe('useSubscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset store
    useSubscriptionStore.setState({
      isPremium: false,
      isTrialActive: false,
      currentPlan: null,
      entitlementStatus: 'unknown',
      isLoading: true,
    });

    // Default: free user
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
      entitlements: { active: {} },
    });

    (Purchases.getOfferings as jest.Mock).mockResolvedValue({
      current: {
        availablePackages: [
          {
            identifier: '$rc_monthly',
            packageType: 'MONTHLY',
            product: {
              identifier: 'safar_monthly',
              priceString: '$4.99',
              price: 4.99,
            },
            offeringIdentifier: 'default',
          },
          {
            identifier: '$rc_annual',
            packageType: 'ANNUAL',
            product: {
              identifier: 'safar_annual',
              priceString: '$34.99',
              price: 34.99,
            },
            offeringIdentifier: 'default',
          },
        ],
      },
    });
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useSubscription());

    expect(result.current.isLoading).toBe(true);
  });

  it('should fetch available packages on mount', async () => {
    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.packages).toHaveLength(2);
    expect(Purchases.getOfferings).toHaveBeenCalled();
  });

  it('should check entitlements on mount', async () => {
    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(Purchases.getCustomerInfo).toHaveBeenCalled();
  });

  it('should return premium status from store', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
      entitlements: {
        active: {
          premium: {
            identifier: 'premium',
            isActive: true,
            periodType: 'NORMAL',
            productIdentifier: 'safar_monthly',
          },
        },
      },
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.isPremium).toBe(true);
    });
  });

  it('should detect trial status', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
      entitlements: {
        active: {
          premium: {
            identifier: 'premium',
            isActive: true,
            periodType: 'TRIAL',
            productIdentifier: 'safar_monthly',
          },
        },
      },
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.isTrialActive).toBe(true);
    });
  });

  it('should provide a refresh function', async () => {
    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear and refresh
    (Purchases.getCustomerInfo as jest.Mock).mockClear();
    await act(async () => {
      await result.current.refresh();
    });

    expect(Purchases.getCustomerInfo).toHaveBeenCalled();
  });

  it('should register customer info update listener', async () => {
    renderHook(() => useSubscription());

    await waitFor(() => {
      expect(Purchases.addCustomerInfoUpdateListener).toHaveBeenCalled();
    });
  });

  it('should return expirationDate from store', async () => {
    useSubscriptionStore.setState({ expirationDate: '2026-06-01T00:00:00Z' });
    const { result } = renderHook(() => useSubscription());

    expect(result.current.expirationDate).toBe('2026-06-01T00:00:00Z');
  });

  it('should register AppState change listener for foreground refresh', async () => {
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');

    renderHook(() => useSubscription());

    await waitFor(() => {
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });

    addEventListenerSpy.mockRestore();
  });

  it('should refresh entitlements when app comes to foreground', async () => {
    let appStateCallback: ((state: AppStateStatus) => void) | null = null;
    const removeSpy = jest.fn();
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (type: string, listener: any) => {
        if (type === 'change') {
          appStateCallback = listener;
        }
        return { remove: removeSpy } as any;
      }
    );

    renderHook(() => useSubscription());

    await waitFor(() => {
      expect(appStateCallback).not.toBeNull();
    });

    // Clear call counts from initial load
    (Purchases.getCustomerInfo as jest.Mock).mockClear();

    // Simulate foreground
    await act(async () => {
      appStateCallback!('active');
    });

    expect(Purchases.getCustomerInfo).toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it('should handle offline gracefully', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockRejectedValue(new Error('Network error'));
    (Purchases.getOfferings as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not crash, should have empty packages
    expect(result.current.packages).toEqual([]);
  });
});
