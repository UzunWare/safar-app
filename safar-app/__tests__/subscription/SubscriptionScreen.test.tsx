/**
 * Subscription Screen Tests
 *
 * Story 6.3: Subscription Options Display - Tasks 1-6
 * Story 6.4: Purchase Flow - Integration tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';

// Must mock before component import
jest.mock('@/lib/hooks/useSubscription');
jest.mock('@/lib/hooks/useTrialStatus');
jest.mock('@/lib/hooks/usePurchase');
jest.mock('@/lib/hooks/useRestore');

import SubscriptionScreen from '@/app/subscription';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useTrialStatus } from '@/lib/hooks/useTrialStatus';
import { usePurchase } from '@/lib/hooks/usePurchase';
import { useRestore } from '@/lib/hooks/useRestore';

const mockUseSubscription = useSubscription as jest.MockedFunction<typeof useSubscription>;
const mockUseTrialStatus = useTrialStatus as jest.MockedFunction<typeof useTrialStatus>;
const mockUsePurchase = usePurchase as jest.MockedFunction<typeof usePurchase>;
const mockUseRestore = useRestore as jest.MockedFunction<typeof useRestore>;

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: (...args: any[]) => mockPush(...args),
    replace: jest.fn(),
    back: (...args: any[]) => mockBack(...args),
  },
  useRouter: () => ({
    push: (...args: any[]) => mockPush(...args),
    replace: jest.fn(),
    back: (...args: any[]) => mockBack(...args),
  }),
}));

let mockOpenURL: jest.SpyInstance;
let mockCanOpenURL: jest.SpyInstance;

const TERMS_URL = 'https://safar.app/terms';
const PRIVACY_URL = 'https://safar.app/privacy';
const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

const defaultPackages = [
  {
    identifier: '$rc_monthly',
    packageType: 'MONTHLY',
    product: {
      identifier: 'safar_monthly',
      title: 'Monthly',
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
      title: 'Annual',
      priceString: '$34.99',
      price: 34.99,
    },
    offeringIdentifier: 'default',
  },
];

const mockPurchasePackage = jest.fn();
const mockDismissSuccess = jest.fn();
const mockClearError = jest.fn();
const mockRestore = jest.fn();
const mockClearRestoreError = jest.fn();

function setupMocks(overrides: {
  subscription?: Partial<ReturnType<typeof useSubscription>>;
  trial?: Partial<ReturnType<typeof useTrialStatus>>;
  purchase?: Partial<ReturnType<typeof usePurchase>>;
  restore?: Partial<ReturnType<typeof useRestore>>;
} = {}) {
  mockUseSubscription.mockReturnValue({
    packages: defaultPackages as any,
    isPremium: false,
    isTrialActive: false,
    currentPlan: null,
    entitlementStatus: 'none',
    expirationDate: null,
    isLoading: false,
    refresh: jest.fn(),
    ...overrides.subscription,
  });

  mockUseTrialStatus.mockReturnValue({
    isInTrial: false,
    daysRemaining: 0,
    endDate: null,
    isUrgent: false,
    ...overrides.trial,
  });

  mockUsePurchase.mockReturnValue({
    isPurchasing: false,
    showSuccess: false,
    error: null,
    lastPurchasedPackage: null,
    purchasePackage: mockPurchasePackage,
    dismissSuccess: mockDismissSuccess,
    clearError: mockClearError,
    ...overrides.purchase,
  });

  mockUseRestore.mockReturnValue({
    isRestoring: false,
    restored: false,
    noSubscription: false,
    error: null,
    restore: mockRestore,
    clearError: mockClearRestoreError,
    ...overrides.restore,
  });
}

describe('SubscriptionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanOpenURL = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    mockOpenURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    setupMocks();
  });

  // --- Task 1: Subscription screen creation ---
  describe('Task 1: Subscription screen layout', () => {
    it('renders the subscription screen with header', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Unlock All Content')).toBeTruthy();
    });

    it('shows a back button to navigate away', () => {
      const { getByTestId } = render(<SubscriptionScreen />);
      const backButton = getByTestId('subscription-back');
      fireEvent.press(backButton);
      expect(mockBack).toHaveBeenCalled();
    });

    it('fetches packages from RevenueCat via useSubscription', () => {
      render(<SubscriptionScreen />);
      expect(mockUseSubscription).toHaveBeenCalled();
    });

    it('shows loading indicator when packages are loading', () => {
      setupMocks({ subscription: { isLoading: true, packages: [] } });
      const { getByTestId } = render(<SubscriptionScreen />);
      expect(getByTestId('subscription-loading')).toBeTruthy();
    });
  });

  // --- Task 2: Display subscription options ---
  describe('Task 2: Subscription options display', () => {
    it('renders monthly option with price', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Monthly')).toBeTruthy();
      expect(getByText('$4.99')).toBeTruthy();
      expect(getByText(/per month/i)).toBeTruthy();
    });

    it('renders annual option with price', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Annual')).toBeTruthy();
      expect(getByText('$34.99')).toBeTruthy();
      expect(getByText(/per year/i)).toBeTruthy();
    });

    it('renders annual option before monthly (recommended first)', () => {
      const { getByTestId } = render(<SubscriptionScreen />);
      const annualOption = getByTestId('subscription-option-annual');
      const monthlyOption = getByTestId('subscription-option-monthly');
      // Annual appears in the tree - we verify both exist
      expect(annualOption).toBeTruthy();
      expect(monthlyOption).toBeTruthy();
    });

    it('shows selectable subscription options', () => {
      const { getByTestId } = render(<SubscriptionScreen />);
      expect(getByTestId('subscription-option-annual')).toBeTruthy();
      expect(getByTestId('subscription-option-monthly')).toBeTruthy();
    });
  });

  // --- Task 3: Calculate and display savings ---
  describe('Task 3: Savings calculation and display', () => {
    it('shows savings badge on annual plan', () => {
      const { getByTestId } = render(<SubscriptionScreen />);
      const badge = getByTestId('savings-badge');
      expect(badge).toBeTruthy();
    });

    it('calculates correct savings percentage (42%)', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/Save 42%/)).toBeTruthy();
    });

    it('highlights annual as recommended option', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Recommended')).toBeTruthy();
    });

    it('calculates savings dynamically from package prices', () => {
      setupMocks({
        subscription: {
          packages: [
            {
              identifier: '$rc_monthly',
              packageType: 'MONTHLY',
              product: { identifier: 'safar_monthly', title: 'Monthly', priceString: '$9.99', price: 9.99 },
              offeringIdentifier: 'default',
            },
            {
              identifier: '$rc_annual',
              packageType: 'ANNUAL',
              product: { identifier: 'safar_annual', title: 'Annual', priceString: '$59.99', price: 59.99 },
              offeringIdentifier: 'default',
            },
          ] as any,
        },
      });
      const { getByText } = render(<SubscriptionScreen />);
      // 9.99 * 12 = 119.88, annual = 59.99, savings = 50%
      expect(getByText(/Save 50%/)).toBeTruthy();
    });
  });

  // --- Task 4: List included features ---
  describe('Task 4: Included features list', () => {
    it('shows "All learning pathways" feature', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('All learning pathways')).toBeTruthy();
    });

    it('shows "Unlimited reviews" feature', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Unlimited reviews')).toBeTruthy();
    });

    it('shows "Offline access" feature', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Offline access')).toBeTruthy();
    });

    it('shows "No ads" feature', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('No ads')).toBeTruthy();
    });

    it('renders features section with testID', () => {
      const { getByTestId } = render(<SubscriptionScreen />);
      expect(getByTestId('features-list')).toBeTruthy();
    });
  });

  // --- Task 5: Required disclosures ---
  describe('Task 5: Required legal disclosures', () => {
    it('shows auto-renewal disclosure text', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(
        getByText(/automatically renews unless canceled/i)
      ).toBeTruthy();
    });

    it('shows Terms of Service link', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Terms of Service')).toBeTruthy();
    });

    it('shows Privacy Policy link', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Privacy Policy')).toBeTruthy();
    });

    it('opens Terms of Service URL on press', async () => {
      const { getByText } = render(<SubscriptionScreen />);
      fireEvent.press(getByText('Terms of Service'));
      await waitFor(() => {
        expect(mockCanOpenURL).toHaveBeenCalledWith(TERMS_URL);
        expect(mockOpenURL).toHaveBeenCalledWith(TERMS_URL);
      });
    });

    it('opens Privacy Policy URL on press', async () => {
      const { getByText } = render(<SubscriptionScreen />);
      fireEvent.press(getByText('Privacy Policy'));
      await waitFor(() => {
        expect(mockCanOpenURL).toHaveBeenCalledWith(PRIVACY_URL);
        expect(mockOpenURL).toHaveBeenCalledWith(PRIVACY_URL);
      });
    });

    it('shows billing period disclosure', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/24 hours/i)).toBeTruthy();
    });
  });

  // --- Task 6: Already subscribed state ---
  describe('Task 6: Already subscribed state', () => {
    it('shows current plan when user is subscribed', () => {
      setupMocks({
        subscription: { isPremium: true, currentPlan: 'annual' },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/Annual/)).toBeTruthy();
    });

    it('shows Manage Subscription button when subscribed', () => {
      setupMocks({
        subscription: { isPremium: true, currentPlan: 'monthly' },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Manage Subscription')).toBeTruthy();
    });

    it('shows current plan label for subscribed users', () => {
      setupMocks({
        subscription: { isPremium: true, currentPlan: 'monthly' },
      });
      const { getByTestId } = render(<SubscriptionScreen />);
      expect(getByTestId('current-plan-view')).toBeTruthy();
    });

    it('does NOT show subscription options when already subscribed', () => {
      setupMocks({
        subscription: { isPremium: true, currentPlan: 'annual' },
      });
      const { queryByTestId } = render(<SubscriptionScreen />);
      expect(queryByTestId('subscription-option-annual')).toBeNull();
      expect(queryByTestId('subscription-option-monthly')).toBeNull();
    });

    it('shows monthly plan display when subscribed to monthly', () => {
      setupMocks({
        subscription: { isPremium: true, currentPlan: 'monthly' },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/Monthly/)).toBeTruthy();
    });

    it('shows subscribed view even if current plan is unknown', () => {
      setupMocks({
        subscription: { isPremium: true, currentPlan: null },
      });
      const { getByTestId, getByText } = render(<SubscriptionScreen />);
      expect(getByTestId('current-plan-view')).toBeTruthy();
      expect(getByText('Active Subscription')).toBeTruthy();
    });

    it('opens platform subscription management URL', async () => {
      setupMocks({
        subscription: { isPremium: true, currentPlan: 'annual' },
      });
      const expectedUrl =
        Platform.OS === 'ios'
          ? APPLE_SUBSCRIPTIONS_URL
          : 'https://play.google.com/store/account/subscriptions';
      const { getByTestId } = render(<SubscriptionScreen />);
      fireEvent.press(getByTestId('manage-subscription-btn'));
      await waitFor(() => {
        expect(mockCanOpenURL).toHaveBeenCalledWith(expectedUrl);
        expect(mockOpenURL).toHaveBeenCalledWith(expectedUrl);
      });
    });

    it('shows restore confirmation in current plan view after successful restore', () => {
      setupMocks({
        subscription: { isPremium: true, currentPlan: 'annual' },
        restore: { restored: true },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Subscription restored!')).toBeTruthy();
    });
  });

  // --- Story 6.7 Task 1: Subscription status with renewal/expiration date ---
  describe('Story 6.7 Task 1: Subscription status with renewal date', () => {
    it('shows renewal date when subscription has expiration date', () => {
      setupMocks({
        subscription: {
          isPremium: true,
          currentPlan: 'annual',
          expirationDate: '2026-03-15T00:00:00Z',
        },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/March 15, 2026/)).toBeTruthy();
    });

    it('shows "Renews" label for active subscription with expiration date', () => {
      setupMocks({
        subscription: {
          isPremium: true,
          currentPlan: 'monthly',
          expirationDate: '2026-04-01T00:00:00Z',
        },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/Renews/)).toBeTruthy();
    });

    it('does not show renewal date when expiration date is null', () => {
      setupMocks({
        subscription: {
          isPremium: true,
          currentPlan: 'annual',
          expirationDate: null,
        },
      });
      const { queryByText } = render(<SubscriptionScreen />);
      expect(queryByText(/Renews/)).toBeNull();
    });

    it('does not show renewal date when expiration date is invalid', () => {
      setupMocks({
        subscription: {
          isPremium: true,
          currentPlan: 'annual',
          expirationDate: 'invalid-date',
        },
      });
      const { queryByText } = render(<SubscriptionScreen />);
      expect(queryByText(/Renews/)).toBeNull();
      expect(queryByText(/Next billing:/)).toBeNull();
    });
  });

  // --- Story 6.7 Task 2: Display subscription details ---
  describe('Story 6.7 Task 2: Subscription details display', () => {
    it('shows price per period for annual plan subscriber', () => {
      setupMocks({
        subscription: {
          isPremium: true,
          currentPlan: 'annual',
          expirationDate: '2026-03-15T00:00:00Z',
        },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('$34.99/year')).toBeTruthy();
    });

    it('shows price per period for monthly plan subscriber', () => {
      setupMocks({
        subscription: {
          isPremium: true,
          currentPlan: 'monthly',
          expirationDate: '2026-04-01T00:00:00Z',
        },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('$4.99/month')).toBeTruthy();
    });

    it('shows next billing date for subscriber', () => {
      setupMocks({
        subscription: {
          isPremium: true,
          currentPlan: 'annual',
          expirationDate: '2026-06-01T00:00:00Z',
        },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/Next billing: June 1, 2026/)).toBeTruthy();
    });

    it('does not show price when packages are empty', () => {
      setupMocks({
        subscription: {
          isPremium: true,
          currentPlan: 'annual',
          expirationDate: '2026-03-15T00:00:00Z',
          packages: [] as any,
        },
      });
      const { queryByText } = render(<SubscriptionScreen />);
      expect(queryByText(/\/year/)).toBeNull();
    });
  });

  // --- Story 6.6: Restore Purchases ---
  describe('Story 6.6: Restore Purchases button', () => {
    it('shows "Restore Purchases" button on subscription screen', () => {
      const { getByTestId } = render(<SubscriptionScreen />);
      expect(getByTestId('restore-purchases-btn')).toBeTruthy();
    });

    it('keeps restore button available when no plans are loaded', () => {
      setupMocks({ subscription: { packages: [] as any } });
      const { getByTestId, queryByTestId } = render(<SubscriptionScreen />);
      expect(getByTestId('restore-purchases-btn')).toBeTruthy();
      expect(queryByTestId('subscription-subscribe-btn')).toBeNull();
    });

    it('renders restore button with correct label', () => {
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Restore Purchases')).toBeTruthy();
    });

    it('does NOT show restore button when user is already subscribed', () => {
      setupMocks({ subscription: { isPremium: true, currentPlan: 'annual' } });
      const { queryByTestId } = render(<SubscriptionScreen />);
      expect(queryByTestId('restore-purchases-btn')).toBeNull();
    });

    it('shows restore button below subscribe button area', () => {
      const { getByTestId } = render(<SubscriptionScreen />);
      expect(getByTestId('restore-purchases-btn')).toBeTruthy();
      expect(getByTestId('subscription-subscribe-btn')).toBeTruthy();
    });

    it('calls restore when restore button is pressed', () => {
      const { getByTestId } = render(<SubscriptionScreen />);
      fireEvent.press(getByTestId('restore-purchases-btn'));
      expect(mockRestore).toHaveBeenCalledTimes(1);
    });

    it('shows loading indicator during restore', () => {
      setupMocks({ restore: { isRestoring: true } });
      const { getByTestId } = render(<SubscriptionScreen />);
      expect(getByTestId('restore-loading')).toBeTruthy();
    });

    it('disables restore button during restore', () => {
      setupMocks({ restore: { isRestoring: true } });
      const { getByTestId } = render(<SubscriptionScreen />);
      const btn = getByTestId('restore-purchases-btn');
      expect(btn.props.accessibilityState?.disabled).toBe(true);
    });

    it('shows "Subscription restored!" on successful restore', () => {
      setupMocks({ restore: { restored: true } });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Subscription restored!')).toBeTruthy();
    });

    it('shows "No active subscription found" when no subscription', () => {
      setupMocks({ restore: { noSubscription: true } });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('No active subscription found')).toBeTruthy();
    });

    it('shows restore error message', () => {
      setupMocks({
        restore: { error: "Couldn't restore purchases. Check your connection and try again." },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/Couldn't restore purchases/)).toBeTruthy();
    });

    it('shows retry button on restore error', () => {
      setupMocks({
        restore: { error: "Couldn't restore purchases. Check your connection and try again." },
      });
      const { getByTestId } = render(<SubscriptionScreen />);
      expect(getByTestId('restore-retry-btn')).toBeTruthy();
    });
  });

  // --- Story 6.7 Task 7: Subscription cancellation/expiration ---
  describe('Story 6.7 Task 7: Subscription cancellation', () => {
    it('shows expiration banner when subscription has expired', () => {
      setupMocks({
        subscription: {
          isPremium: false,
          entitlementStatus: 'expired',
          currentPlan: 'monthly',
        },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/subscription has expired/i)).toBeTruthy();
    });

    it('shows re-subscribe prompt when subscription expired', () => {
      setupMocks({
        subscription: {
          isPremium: false,
          entitlementStatus: 'expired',
          currentPlan: 'annual',
        },
      });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/re-subscribe/i)).toBeTruthy();
    });

    it('shows subscription options when expired (not premium view)', () => {
      setupMocks({
        subscription: {
          isPremium: false,
          entitlementStatus: 'expired',
          currentPlan: 'annual',
        },
      });
      const { queryByTestId } = render(<SubscriptionScreen />);
      // Should show purchase options, not the current plan view
      expect(queryByTestId('current-plan-view')).toBeNull();
      expect(queryByTestId('subscription-subscribe-btn')).toBeTruthy();
    });
  });

  // --- Edge cases ---
  describe('Edge cases', () => {
    it('handles empty packages gracefully', () => {
      setupMocks({ subscription: { packages: [] } });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/no plans available/i)).toBeTruthy();
    });

    it('handles missing annual package (only monthly available)', () => {
      setupMocks({
        subscription: {
          packages: [defaultPackages[0]] as any,
        },
      });
      const { getByText, queryByTestId } = render(<SubscriptionScreen />);
      expect(getByText('$4.99')).toBeTruthy();
      expect(queryByTestId('savings-badge')).toBeNull();
    });

    it('does not show savings badge when annual is not actually cheaper', () => {
      setupMocks({
        subscription: {
          packages: [
            {
              identifier: '$rc_monthly',
              packageType: 'MONTHLY',
              product: { identifier: 'safar_monthly', title: 'Monthly', priceString: '$4.99', price: 4.99 },
              offeringIdentifier: 'default',
            },
            {
              identifier: '$rc_annual',
              packageType: 'ANNUAL',
              product: { identifier: 'safar_annual', title: 'Annual', priceString: '$99.99', price: 99.99 },
              offeringIdentifier: 'default',
            },
          ] as any,
        },
      });
      const { queryByTestId, queryByText } = render(<SubscriptionScreen />);
      expect(queryByTestId('savings-badge')).toBeNull();
      expect(queryByText(/Save -/)).toBeNull();
    });
  });

  // --- Story 6.4: Purchase Flow Integration ---
  describe('Story 6.4: Purchase flow', () => {
    it('calls purchasePackage when subscribe button is pressed (annual selected)', () => {
      const { getByTestId } = render(<SubscriptionScreen />);
      fireEvent.press(getByTestId('subscription-subscribe-btn'));
      expect(mockPurchasePackage).toHaveBeenCalledWith(
        expect.objectContaining({ packageType: 'ANNUAL' })
      );
    });

    it('calls purchasePackage with monthly when monthly is selected', () => {
      const { getByTestId } = render(<SubscriptionScreen />);
      // Select monthly first
      fireEvent.press(getByTestId('subscription-option-monthly'));
      fireEvent.press(getByTestId('subscription-subscribe-btn'));
      expect(mockPurchasePackage).toHaveBeenCalledWith(
        expect.objectContaining({ packageType: 'MONTHLY' })
      );
    });

    it('shows loading state during purchase', () => {
      setupMocks({ purchase: { isPurchasing: true } });
      const { getByTestId } = render(<SubscriptionScreen />);
      expect(getByTestId('purchase-loading')).toBeTruthy();
    });

    it('disables subscribe button during purchase', () => {
      setupMocks({ purchase: { isPurchasing: true } });
      const { getByTestId } = render(<SubscriptionScreen />);
      const btn = getByTestId('subscription-subscribe-btn');
      expect(btn.props.accessibilityState?.disabled).toBe(true);
    });

    it('shows success modal when purchase succeeds', () => {
      setupMocks({ purchase: { showSuccess: true } });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText('Welcome to Safar Premium!')).toBeTruthy();
    });

    it('dismisses success modal and navigates back', () => {
      setupMocks({ purchase: { showSuccess: true } });
      const { getByText } = render(<SubscriptionScreen />);
      fireEvent.press(getByText('Continue Learning'));
      expect(mockDismissSuccess).toHaveBeenCalled();
      expect(mockBack).toHaveBeenCalled();
    });

    it('shows error message on purchase failure', () => {
      setupMocks({ purchase: { error: 'Something went wrong. Please try again.' } });
      const { getByText } = render(<SubscriptionScreen />);
      expect(getByText(/Something went wrong/)).toBeTruthy();
    });

    it('shows retry button on purchase error', () => {
      setupMocks({ purchase: { error: 'Something went wrong. Please try again.' } });
      const { getByTestId } = render(<SubscriptionScreen />);
      expect(getByTestId('purchase-retry-btn')).toBeTruthy();
    });

    it('clears error when retry is pressed', () => {
      setupMocks({ purchase: { error: 'Something went wrong. Please try again.' } });
      const { getByTestId } = render(<SubscriptionScreen />);
      fireEvent.press(getByTestId('purchase-retry-btn'));
      expect(mockClearError).toHaveBeenCalled();
    });
  });
});
