import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { FreezeConfirmModal } from '@/components/progress/FreezeConfirmModal';

describe('FreezeConfirmModal', () => {
  const defaultProps = {
    visible: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when visible', () => {
    render(<FreezeConfirmModal {...defaultProps} />);

    expect(screen.getByTestId('freeze-confirm-modal')).toBeTruthy();
  });

  it('shows explanation of what freeze does', () => {
    render(<FreezeConfirmModal {...defaultProps} />);

    expect(screen.getByText('Use Streak Freeze?')).toBeTruthy();
    expect(screen.getByText(/protect your streak for today/i)).toBeTruthy();
    expect(screen.getByText(/one freeze per week/i)).toBeTruthy();
  });

  it('shows confirm and cancel buttons', () => {
    render(<FreezeConfirmModal {...defaultProps} />);

    expect(screen.getByText('Use Freeze')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('calls onConfirm when confirm button pressed', () => {
    const onConfirm = jest.fn();
    render(<FreezeConfirmModal {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.press(screen.getByText('Use Freeze'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button pressed', () => {
    const onCancel = jest.fn();
    render(<FreezeConfirmModal {...defaultProps} onCancel={onCancel} />);

    fireEvent.press(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not render when not visible', () => {
    render(<FreezeConfirmModal {...defaultProps} visible={false} />);

    expect(screen.queryByTestId('freeze-confirm-modal')).toBeNull();
  });

  it('disables confirm button when loading', () => {
    const onConfirm = jest.fn();
    render(<FreezeConfirmModal {...defaultProps} onConfirm={onConfirm} isLoading={true} />);

    fireEvent.press(screen.getByText('Use Freeze'));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
