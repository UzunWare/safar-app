/**
 * PurchaseSuccessModal Tests
 *
 * Story 6.4: Purchase Flow - Task 4
 * Success confirmation modal with celebration and continue button
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PurchaseSuccessModal } from '@/components/subscription/PurchaseSuccessModal';

describe('PurchaseSuccessModal', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task 4: Success confirmation modal', () => {
    it('renders "Welcome to Safar Premium!" message', () => {
      const { getByText } = render(
        <PurchaseSuccessModal visible onDismiss={mockOnDismiss} />
      );
      expect(getByText('Welcome to Safar Premium!')).toBeTruthy();
    });

    it('renders a continue button', () => {
      const { getByText } = render(
        <PurchaseSuccessModal visible onDismiss={mockOnDismiss} />
      );
      expect(getByText('Continue Learning')).toBeTruthy();
    });

    it('calls onDismiss when continue button is pressed', () => {
      const { getByText } = render(
        <PurchaseSuccessModal visible onDismiss={mockOnDismiss} />
      );
      fireEvent.press(getByText('Continue Learning'));
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('shows full access message', () => {
      const { getByText } = render(
        <PurchaseSuccessModal visible onDismiss={mockOnDismiss} />
      );
      expect(getByText(/full access/i)).toBeTruthy();
    });

    it('renders celebration icon', () => {
      const { getByTestId } = render(
        <PurchaseSuccessModal visible onDismiss={mockOnDismiss} />
      );
      expect(getByTestId('celebration-icon')).toBeTruthy();
    });

    it('renders celebration animation', () => {
      const { getByTestId } = render(
        <PurchaseSuccessModal visible onDismiss={mockOnDismiss} />
      );
      expect(getByTestId('celebration-animation')).toBeTruthy();
    });

    it('does not render when visible is false', () => {
      const { queryByText } = render(
        <PurchaseSuccessModal visible={false} onDismiss={mockOnDismiss} />
      );
      expect(queryByText('Welcome to Safar Premium!')).toBeNull();
    });

    it('has correct testID for the modal', () => {
      const { getByTestId } = render(
        <PurchaseSuccessModal visible onDismiss={mockOnDismiss} />
      );
      expect(getByTestId('purchase-success-modal')).toBeTruthy();
    });
  });
});
