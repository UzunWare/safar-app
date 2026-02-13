/**
 * Paywall Screen Tests
 *
 * Story 6.5: Paywall Enforcement - Task 2
 * Tests the paywall route (app/paywall.tsx) that shows subscription benefits
 * and navigates to subscription options.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';

const mockRestore = jest.fn();
const mockClearRestoreError = jest.fn();

// Mock useSubscription for package data
jest.mock('@/lib/hooks/useSubscription', () => ({
  useSubscription: () => ({
    packages: [
      {
        identifier: '$rc_annual',
        packageType: 'ANNUAL',
        product: { identifier: 'safar_annual', priceString: '$34.99', price: 34.99 },
        offeringIdentifier: 'default',
      },
      {
        identifier: '$rc_monthly',
        packageType: 'MONTHLY',
        product: { identifier: 'safar_monthly', priceString: '$4.99', price: 4.99 },
        offeringIdentifier: 'default',
      },
    ],
    isPremium: false,
    isTrialActive: false,
    isLoading: false,
  }),
}));

jest.mock('@/lib/hooks/useRestore', () => ({
  useRestore: () => ({
    isRestoring: false,
    restored: false,
    noSubscription: false,
    error: null,
    restore: mockRestore,
    clearError: mockClearRestoreError,
  }),
}));

// Must import after mock setup
import PaywallScreen from '@/app/paywall';

describe('PaywallScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSubscriptionStore.getState().reset();
    useSubscriptionStore.setState({ isLoading: false, entitlementStatus: 'none' });
  });

  it('should render paywall screen with subscription benefits', () => {
    const { getByText } = render(<PaywallScreen />);

    expect(getByText('Unlock All Content')).toBeTruthy();
  });

  it('should show feature list', () => {
    const { getByTestId } = render(<PaywallScreen />);

    expect(getByTestId('features-list')).toBeTruthy();
  });

  it('should show subscription plan options', () => {
    const { getByTestId } = render(<PaywallScreen />);

    expect(getByTestId('subscription-option-annual')).toBeTruthy();
    expect(getByTestId('subscription-option-monthly')).toBeTruthy();
  });

  it('should have a subscribe button', () => {
    const { getByTestId } = render(<PaywallScreen />);

    expect(getByTestId('paywall-subscribe-btn')).toBeTruthy();
  });

  it('should have a dismiss button that navigates back', () => {
    const { getByTestId } = render(<PaywallScreen />);

    fireEvent.press(getByTestId('paywall-dismiss'));
    expect(router.back).toHaveBeenCalled();
  });

  it('should navigate to subscription screen when subscribe pressed', () => {
    const { getByTestId } = render(<PaywallScreen />);

    fireEvent.press(getByTestId('paywall-subscribe-btn'));
    expect(router.push).toHaveBeenCalledWith('/subscription');
  });

  it('should trigger restore when restore purchases is pressed', () => {
    const { getByTestId } = render(<PaywallScreen />);

    fireEvent.press(getByTestId('restore-purchases-btn'));
    expect(mockRestore).toHaveBeenCalledTimes(1);
  });
});
