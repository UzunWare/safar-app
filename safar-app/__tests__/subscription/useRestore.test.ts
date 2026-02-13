/**
 * useRestore Hook Tests
 *
 * Story 6.6: Purchase Restoration - Tasks 2-6
 * Tests restore purchases flow: success, no subscription, errors, loading state
 */

import { renderHook, act } from '@testing-library/react-native';
import Purchases from 'react-native-purchases';
import { useRestore } from '@/lib/hooks/useRestore';
import { checkEntitlements } from '@/lib/subscription/entitlementService';

jest.mock('@/lib/subscription/entitlementService', () => ({
  ENTITLEMENT_ID: 'premium',
  checkEntitlements: jest.fn(() => Promise.resolve()),
}));

const mockRestorePurchases = Purchases.restorePurchases as jest.Mock;
const mockCheckEntitlements = checkEntitlements as jest.Mock;

describe('useRestore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckEntitlements.mockResolvedValue(undefined);
  });

  // --- Task 2: Implement restore functionality ---
  describe('Task 2: Restore functionality', () => {
    it('calls Purchases.restorePurchases() when restore is invoked', async () => {
      mockRestorePurchases.mockResolvedValue({
        entitlements: { active: { premium: { isActive: true } } },
      });

      const { result } = renderHook(() => useRestore());

      await act(async () => {
        await result.current.restore();
      });

      expect(mockRestorePurchases).toHaveBeenCalledTimes(1);
    });

    it('updates entitlement state after successful restore', async () => {
      mockRestorePurchases.mockResolvedValue({
        entitlements: { active: { premium: { isActive: true } } },
      });

      const { result } = renderHook(() => useRestore());

      await act(async () => {
        await result.current.restore();
      });

      expect(mockCheckEntitlements).toHaveBeenCalled();
    });

    it('returns result object from restore call', async () => {
      mockRestorePurchases.mockResolvedValue({
        entitlements: { active: { premium: { isActive: true } } },
      });

      const { result } = renderHook(() => useRestore());

      let restoreResult: any;
      await act(async () => {
        restoreResult = await result.current.restore();
      });

      expect(restoreResult).toBeDefined();
      expect(restoreResult.success).toBe(true);
    });
  });

  // --- Task 3: Handle successful restore ---
  describe('Task 3: Successful restore', () => {
    it('sets restored=true when premium entitlement found', async () => {
      mockRestorePurchases.mockResolvedValue({
        entitlements: { active: { premium: { isActive: true } } },
      });

      const { result } = renderHook(() => useRestore());

      await act(async () => {
        await result.current.restore();
      });

      expect(result.current.restored).toBe(true);
    });

    it('clears error state on successful restore', async () => {
      // First fail, then succeed
      mockRestorePurchases
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValueOnce({
          entitlements: { active: { premium: { isActive: true } } },
        });

      const { result } = renderHook(() => useRestore());

      await act(async () => {
        await result.current.restore();
      });

      expect(result.current.error).toBeTruthy();

      await act(async () => {
        await result.current.restore();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.restored).toBe(true);
    });
  });

  // --- Task 4: Handle no subscription found ---
  describe('Task 4: No subscription found', () => {
    it('sets noSubscription=true when no active entitlement', async () => {
      mockRestorePurchases.mockResolvedValue({
        entitlements: { active: {} },
      });

      const { result } = renderHook(() => useRestore());

      await act(async () => {
        await result.current.restore();
      });

      expect(result.current.noSubscription).toBe(true);
      expect(result.current.restored).toBe(false);
    });

    it('does not call checkEntitlements when no subscription found', async () => {
      mockRestorePurchases.mockResolvedValue({
        entitlements: { active: {} },
      });

      const { result } = renderHook(() => useRestore());

      await act(async () => {
        await result.current.restore();
      });

      expect(mockCheckEntitlements).not.toHaveBeenCalled();
    });
  });

  // --- Task 5: Handle restore errors ---
  describe('Task 5: Restore errors', () => {
    it('sets error message on network failure', async () => {
      mockRestorePurchases.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useRestore());

      await act(async () => {
        await result.current.restore();
      });

      expect(result.current.error).toBe(
        "Couldn't restore purchases. Check your connection and try again."
      );
    });

    it('sets restored=false on error', async () => {
      mockRestorePurchases.mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useRestore());

      await act(async () => {
        await result.current.restore();
      });

      expect(result.current.restored).toBe(false);
    });

    it('provides clearError function', async () => {
      mockRestorePurchases.mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useRestore());

      await act(async () => {
        await result.current.restore();
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  // --- Task 6: Show loading state during restore ---
  describe('Task 6: Loading state', () => {
    it('sets isRestoring=true during restore', async () => {
      let resolveRestore: (value: any) => void;
      mockRestorePurchases.mockReturnValue(
        new Promise((resolve) => {
          resolveRestore = resolve;
        })
      );

      const { result } = renderHook(() => useRestore());

      expect(result.current.isRestoring).toBe(false);

      let restorePromise: Promise<any>;
      act(() => {
        restorePromise = result.current.restore();
      });

      expect(result.current.isRestoring).toBe(true);

      await act(async () => {
        resolveRestore!({ entitlements: { active: {} } });
        await restorePromise;
      });

      expect(result.current.isRestoring).toBe(false);
    });

    it('resets isRestoring on error', async () => {
      mockRestorePurchases.mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useRestore());

      await act(async () => {
        await result.current.restore();
      });

      expect(result.current.isRestoring).toBe(false);
    });

    it('starts with isRestoring=false', () => {
      const { result } = renderHook(() => useRestore());
      expect(result.current.isRestoring).toBe(false);
    });

    it('starts with no error', () => {
      const { result } = renderHook(() => useRestore());
      expect(result.current.error).toBeNull();
    });

    it('starts with restored=false', () => {
      const { result } = renderHook(() => useRestore());
      expect(result.current.restored).toBe(false);
    });

    it('starts with noSubscription=false', () => {
      const { result } = renderHook(() => useRestore());
      expect(result.current.noSubscription).toBe(false);
    });
  });
});
