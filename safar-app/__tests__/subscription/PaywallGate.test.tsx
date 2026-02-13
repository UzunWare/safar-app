/**
 * PaywallGate Component Tests
 *
 * Story 6.5: Paywall Enforcement - Task 1
 * Tests wrapper component that gates content behind subscription check.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';
import { PaywallGate } from '@/components/subscription/PaywallGate';
import { router } from 'expo-router';

describe('PaywallGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSubscriptionStore.getState().reset();
  });

  // --- Standalone mode (no children) ---

  describe('standalone mode (no children)', () => {
    it('should render paywall gate card when no children provided', () => {
      useSubscriptionStore.setState({
        isPremium: false,
        isTrialActive: false,
        isLoading: false,
        entitlementStatus: 'none',
      });

      const { getByTestId, getByText } = render(<PaywallGate />);

      expect(getByTestId('paywall-gate')).toBeTruthy();
      expect(getByText('Trial ended')).toBeTruthy();
    });

    it('should render custom title and message', () => {
      useSubscriptionStore.setState({
        isPremium: false,
        isTrialActive: false,
        isLoading: false,
        entitlementStatus: 'none',
      });

      const { getByText } = render(
        <PaywallGate title="Custom Title" message="Custom message" />
      );

      expect(getByText('Custom Title')).toBeTruthy();
      expect(getByText('Custom message')).toBeTruthy();
    });

    it('should navigate to subscription screen when subscribe button pressed', () => {
      useSubscriptionStore.setState({
        isPremium: false,
        isTrialActive: false,
        isLoading: false,
        entitlementStatus: 'none',
      });

      const { getByTestId } = render(<PaywallGate />);
      fireEvent.press(getByTestId('paywall-subscribe-cta'));

      expect(router.push).toHaveBeenCalledWith('/subscription');
    });

    it('should render preview content in standalone mode when preview prop is provided', () => {
      useSubscriptionStore.setState({
        isPremium: false,
        isTrialActive: false,
        isLoading: false,
        entitlementStatus: 'none',
      });

      const preview = (
        <View testID="standalone-preview-content">
          <Text>Preview Words</Text>
        </View>
      );

      const { getByTestId } = render(<PaywallGate preview={preview} />);

      expect(getByTestId('standalone-preview-content')).toBeTruthy();
      expect(getByTestId('paywall-gate')).toBeTruthy();
    });
  });

  // --- Wrapper mode (with children) ---

  describe('wrapper mode (with children)', () => {
    it('should render children when user has premium access', () => {
      useSubscriptionStore.setState({
        isPremium: true,
        isTrialActive: false,
        isLoading: false,
        entitlementStatus: 'active',
      });

      const { getByText, queryByTestId } = render(
        <PaywallGate>
          <Text>Protected Content</Text>
        </PaywallGate>
      );

      expect(getByText('Protected Content')).toBeTruthy();
      expect(queryByTestId('paywall-gate')).toBeNull();
    });

    it('should render children when user has active trial', () => {
      useSubscriptionStore.setState({
        isPremium: false,
        isTrialActive: true,
        isLoading: false,
        entitlementStatus: 'active',
      });

      const { getByText, queryByTestId } = render(
        <PaywallGate>
          <Text>Trial Content</Text>
        </PaywallGate>
      );

      expect(getByText('Trial Content')).toBeTruthy();
      expect(queryByTestId('paywall-gate')).toBeNull();
    });

    it('should show paywall instead of children when no access', () => {
      useSubscriptionStore.setState({
        isPremium: false,
        isTrialActive: false,
        isLoading: false,
        entitlementStatus: 'none',
      });

      const { queryByText, getByTestId } = render(
        <PaywallGate>
          <Text>Protected Content</Text>
        </PaywallGate>
      );

      expect(queryByText('Protected Content')).toBeNull();
      expect(getByTestId('paywall-gate')).toBeTruthy();
    });

    it('should render preview content alongside paywall when preview prop provided', () => {
      useSubscriptionStore.setState({
        isPremium: false,
        isTrialActive: false,
        isLoading: false,
        entitlementStatus: 'none',
      });

      const preview = (
        <View testID="preview-content">
          <Text>Preview Words</Text>
        </View>
      );

      const { getByTestId, queryByText } = render(
        <PaywallGate preview={preview}>
          <Text>Full Content</Text>
        </PaywallGate>
      );

      expect(getByTestId('preview-content')).toBeTruthy();
      expect(getByTestId('paywall-gate')).toBeTruthy();
      expect(queryByText('Full Content')).toBeNull();
    });

    it('should show loading indicator while subscription status loads', () => {
      useSubscriptionStore.setState({
        isPremium: false,
        isTrialActive: false,
        isLoading: true,
        entitlementStatus: 'unknown',
      });

      const { getByTestId, queryByText } = render(
        <PaywallGate>
          <Text>Content</Text>
        </PaywallGate>
      );

      expect(getByTestId('paywall-gate-loading')).toBeTruthy();
      expect(queryByText('Content')).toBeNull();
    });
  });

  // --- Lapsed subscription messaging ---

  describe('lapsed subscription messaging', () => {
    it('should show "Welcome back" for lapsed subscribers', () => {
      useSubscriptionStore.setState({
        isPremium: false,
        isTrialActive: false,
        isLoading: false,
        entitlementStatus: 'expired',
      });

      const { getByText } = render(<PaywallGate />);

      expect(getByText('Welcome back!')).toBeTruthy();
      expect(
        getByText('Renew your subscription to continue learning.')
      ).toBeTruthy();
    });

    it('should show "Trial ended" for users who never subscribed', () => {
      useSubscriptionStore.setState({
        isPremium: false,
        isTrialActive: false,
        isLoading: false,
        entitlementStatus: 'none',
      });

      const { getByText } = render(<PaywallGate />);

      expect(getByText('Trial ended')).toBeTruthy();
    });
  });
});
