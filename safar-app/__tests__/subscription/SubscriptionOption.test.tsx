/**
 * SubscriptionOption Component Tests
 *
 * Story 6.3: Subscription Options Display - Task 2
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SubscriptionOption } from '@/components/subscription/SubscriptionOption';

describe('SubscriptionOption', () => {
  const defaultProps = {
    title: 'Annual',
    price: '$34.99',
    priceDetail: 'per year',
    onSelect: jest.fn(),
    testID: 'subscription-option-annual',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', () => {
    const { getByText } = render(<SubscriptionOption {...defaultProps} />);
    expect(getByText('Annual')).toBeTruthy();
  });

  it('renders the price', () => {
    const { getByText } = render(<SubscriptionOption {...defaultProps} />);
    expect(getByText('$34.99')).toBeTruthy();
  });

  it('renders the price detail', () => {
    const { getByText } = render(<SubscriptionOption {...defaultProps} />);
    expect(getByText('per year')).toBeTruthy();
  });

  it('calls onSelect when pressed', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <SubscriptionOption {...defaultProps} onSelect={onSelect} />
    );
    fireEvent.press(getByTestId('subscription-option-annual'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows badge when provided', () => {
    const { getByText } = render(
      <SubscriptionOption {...defaultProps} badge="Save 42%" />
    );
    expect(getByText('Save 42%')).toBeTruthy();
  });

  it('does not show badge when not provided', () => {
    const { queryByTestId } = render(
      <SubscriptionOption {...defaultProps} />
    );
    expect(queryByTestId('savings-badge')).toBeNull();
  });

  it('shows recommended label when isRecommended is true', () => {
    const { getByText } = render(
      <SubscriptionOption {...defaultProps} isRecommended />
    );
    expect(getByText('Recommended')).toBeTruthy();
  });

  it('does not show recommended label by default', () => {
    const { queryByText } = render(
      <SubscriptionOption {...defaultProps} />
    );
    expect(queryByText('Recommended')).toBeNull();
  });

  it('applies selected style when isSelected is true', () => {
    const { getByTestId } = render(
      <SubscriptionOption {...defaultProps} isSelected />
    );
    expect(getByTestId('subscription-option-annual')).toBeTruthy();
  });
});
