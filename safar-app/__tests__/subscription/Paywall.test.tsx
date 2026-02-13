/**
 * Paywall Component Tests
 *
 * Story 6.3: Subscription Options Display - Task 7
 * Reusable paywall with subscription options, modal/full screen, dismiss
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/lib/hooks/useSubscription');
jest.mock('@/lib/hooks/useTrialStatus');

import { Paywall } from '@/components/subscription/Paywall';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useTrialStatus } from '@/lib/hooks/useTrialStatus';

const mockUseSubscription = useSubscription as jest.MockedFunction<typeof useSubscription>;
const mockUseTrialStatus = useTrialStatus as jest.MockedFunction<typeof useTrialStatus>;

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

jest.mock('expo-router', () => ({
  router: mockRouter,
  useRouter: () => mockRouter,
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

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

function setupMocks(overrides: {
  subscription?: Partial<ReturnType<typeof useSubscription>>;
  trial?: Partial<ReturnType<typeof useTrialStatus>>;
} = {}) {
  mockUseSubscription.mockReturnValue({
    packages: defaultPackages as any,
    isPremium: false,
    isTrialActive: false,
    currentPlan: null,
    entitlementStatus: 'none',
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
}

describe('Paywall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  describe('rendering', () => {
    it('renders the paywall component', () => {
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} />);
      expect(getByTestId('paywall')).toBeTruthy();
    });

    it('shows subscription options (annual and monthly)', () => {
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} />);
      expect(getByTestId('subscription-option-annual')).toBeTruthy();
      expect(getByTestId('subscription-option-monthly')).toBeTruthy();
    });

    it('shows the unlock header text', () => {
      const { getByText } = render(<Paywall onDismiss={jest.fn()} />);
      expect(getByText('Unlock All Content')).toBeTruthy();
    });

    it('includes features list', () => {
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} />);
      expect(getByTestId('features-list')).toBeTruthy();
    });

    it('shows savings badge on annual option', () => {
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} />);
      expect(getByTestId('savings-badge')).toBeTruthy();
    });
  });

  describe('dismiss functionality', () => {
    it('shows a dismiss button', () => {
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} />);
      expect(getByTestId('paywall-dismiss')).toBeTruthy();
    });

    it('calls onDismiss when dismiss button is pressed', () => {
      const onDismiss = jest.fn();
      const { getByTestId } = render(<Paywall onDismiss={onDismiss} />);
      fireEvent.press(getByTestId('paywall-dismiss'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('display modes', () => {
    it('renders in fullscreen mode by default', () => {
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} />);
      const paywall = getByTestId('paywall');
      expect(paywall).toBeTruthy();
    });

    it('renders in modal mode when variant="modal"', () => {
      const { getByTestId } = render(<Paywall variant="modal" onDismiss={jest.fn()} />);
      expect(getByTestId('paywall-modal')).toBeTruthy();
    });
  });

  describe('subscribe action', () => {
    it('shows a subscribe button', () => {
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} />);
      expect(getByTestId('paywall-subscribe-btn')).toBeTruthy();
    });

    it('selects annual plan by default', () => {
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} />);
      // Annual option should be visually highlighted by default
      expect(getByTestId('subscription-option-annual')).toBeTruthy();
    });

    it('calls onSubscribe with annual by default', () => {
      const onSubscribe = jest.fn();
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} onSubscribe={onSubscribe} />);
      fireEvent.press(getByTestId('paywall-subscribe-btn'));
      expect(onSubscribe).toHaveBeenCalledWith('annual');
    });

    it('calls onSubscribe with monthly after monthly selection', () => {
      const onSubscribe = jest.fn();
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} onSubscribe={onSubscribe} />);
      fireEvent.press(getByTestId('subscription-option-monthly'));
      fireEvent.press(getByTestId('paywall-subscribe-btn'));
      expect(onSubscribe).toHaveBeenCalledWith('monthly');
    });
  });

  describe('loading state', () => {
    it('shows loading state when packages are loading', () => {
      setupMocks({ subscription: { isLoading: true, packages: [] } });
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} />);
      expect(getByTestId('paywall-loading')).toBeTruthy();
    });
  });

  // --- Story 6.6: Restore Purchases ---
  describe('Story 6.6: Restore Purchases button', () => {
    it('shows "Restore Purchases" button on paywall', () => {
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} />);
      expect(getByTestId('restore-purchases-btn')).toBeTruthy();
    });

    it('renders restore button with correct label', () => {
      const { getByText } = render(<Paywall onDismiss={jest.fn()} />);
      expect(getByText('Restore Purchases')).toBeTruthy();
    });

    it('calls onRestore prop when restore button is pressed', () => {
      const onRestore = jest.fn();
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} onRestore={onRestore} />);
      fireEvent.press(getByTestId('restore-purchases-btn'));
      expect(onRestore).toHaveBeenCalledTimes(1);
    });

    it('shows loading indicator during restore', () => {
      const { getByTestId } = render(
        <Paywall onDismiss={jest.fn()} onRestore={jest.fn()} isRestoring />
      );
      expect(getByTestId('restore-loading')).toBeTruthy();
    });

    it('disables restore button when no restore handler is provided', () => {
      const { getByTestId } = render(<Paywall onDismiss={jest.fn()} />);
      expect(getByTestId('restore-purchases-btn').props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('savings badge edge cases', () => {
    it('does not show savings badge when annual is more expensive than monthly x12', () => {
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
      const { queryByTestId, queryByText } = render(<Paywall onDismiss={jest.fn()} />);
      expect(queryByTestId('savings-badge')).toBeNull();
      expect(queryByText(/Save -/)).toBeNull();
    });
  });
});
