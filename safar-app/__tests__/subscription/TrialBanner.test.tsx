/**
 * TrialBanner Component Tests
 *
 * Story 6.2: Free Trial Period - Tasks 4, 5, 6
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';
import { TrialBanner } from '@/components/subscription/TrialBanner';

describe('TrialBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSubscriptionStore.getState().reset();
  });

  // Task 4: Display trial status
  describe('trial status display', () => {
    it('should render nothing when not in trial', () => {
      useSubscriptionStore.setState({
        isTrialActive: false,
        expirationDate: null,
      });

      const { queryByTestId } = render(<TrialBanner />);
      expect(queryByTestId('trial-banner')).toBeNull();
    });

    it('should render banner when trial is active', () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      useSubscriptionStore.setState({
        isTrialActive: true,
        expirationDate: futureDate,
      });

      const { getByTestId } = render(<TrialBanner />);
      expect(getByTestId('trial-banner')).toBeTruthy();
    });

    it('should show "Trial: X days remaining" text', () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      useSubscriptionStore.setState({
        isTrialActive: true,
        expirationDate: futureDate,
      });

      const { getByText } = render(<TrialBanner />);
      expect(getByText('Trial: 5 days remaining')).toBeTruthy();
    });

    it('should show singular "day" for 1 day remaining', () => {
      const futureDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();
      useSubscriptionStore.setState({
        isTrialActive: true,
        expirationDate: futureDate,
      });

      const { getByText } = render(<TrialBanner />);
      expect(getByText('Trial: 1 day remaining')).toBeTruthy();
    });
  });

  // Task 5: Show trial end date
  describe('trial end date display', () => {
    it('should display the trial end date', () => {
      // Use a specific date for predictable output
      const endDate = new Date(2026, 1, 19); // Feb 19, 2026
      useSubscriptionStore.setState({
        isTrialActive: true,
        expirationDate: endDate.toISOString(),
      });

      const { getByText } = render(<TrialBanner />);
      expect(getByText(/Your trial ends Feb 19/)).toBeTruthy();
    });
  });

  // Task 6: Subscribe CTA
  describe('subscribe CTA', () => {
    it('should show "Subscribe now" button', () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      useSubscriptionStore.setState({
        isTrialActive: true,
        expirationDate: futureDate,
      });

      const { getByTestId, getByText } = render(<TrialBanner />);
      expect(getByTestId('trial-subscribe-cta')).toBeTruthy();
      expect(getByText('Subscribe now')).toBeTruthy();
    });

    it('should navigate to subscription on CTA press', () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      useSubscriptionStore.setState({
        isTrialActive: true,
        expirationDate: futureDate,
      });

      const { getByTestId } = render(<TrialBanner />);
      fireEvent.press(getByTestId('trial-subscribe-cta'));

      expect(router.push).toHaveBeenCalledWith('/subscription');
    });
  });

  // Urgency styling
  describe('urgency states', () => {
    it('should render with urgency style when 2 or fewer days remaining', () => {
      const futureDate = new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString();
      useSubscriptionStore.setState({
        isTrialActive: true,
        expirationDate: futureDate,
      });

      const { getByTestId } = render(<TrialBanner />);
      const banner = getByTestId('trial-banner');
      // Urgency banner uses solid gold background
      expect(banner.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: '#cfaa6b',
        })
      );
    });

    it('should render with normal style when more than 2 days remaining', () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      useSubscriptionStore.setState({
        isTrialActive: true,
        expirationDate: futureDate,
      });

      const { getByTestId } = render(<TrialBanner />);
      const banner = getByTestId('trial-banner');
      // Normal banner uses soft gold background
      expect(banner.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: 'rgba(207, 170, 107, 0.12)',
        })
      );
    });
  });
});
