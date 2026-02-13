import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { StreakFreezeButton } from '@/components/progress/StreakFreezeButton';

describe('StreakFreezeButton', () => {
  const defaultProps = {
    isAvailable: true,
    nextAvailableDate: null as string | null,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders freeze button with snowflake icon area', () => {
    render(<StreakFreezeButton {...defaultProps} />);

    expect(screen.getByTestId('streak-freeze-button')).toBeTruthy();
  });

  it('shows "Streak Freeze" label', () => {
    render(<StreakFreezeButton {...defaultProps} />);

    expect(screen.getByText('Streak Freeze')).toBeTruthy();
  });

  it('shows available state text when freeze is available', () => {
    render(<StreakFreezeButton {...defaultProps} isAvailable={true} />);

    expect(screen.getByText('Available')).toBeTruthy();
  });

  it('calls onPress when available and pressed', () => {
    const onPress = jest.fn();
    render(<StreakFreezeButton {...defaultProps} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('streak-freeze-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when unavailable', () => {
    const onPress = jest.fn();
    render(
      <StreakFreezeButton
        {...defaultProps}
        isAvailable={false}
        nextAvailableDate="2026-02-16"
        onPress={onPress}
      />
    );

    fireEvent.press(screen.getByTestId('streak-freeze-button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows next freeze available date text when unavailable', () => {
    render(
      <StreakFreezeButton {...defaultProps} isAvailable={false} nextAvailableDate="2026-02-16" />
    );

    expect(screen.getByText(/Next freeze available Feb 16/)).toBeTruthy();
  });

  it('shows "Used" text when unavailable', () => {
    render(
      <StreakFreezeButton {...defaultProps} isAvailable={false} nextAvailableDate="2026-02-16" />
    );

    expect(screen.getByText('Used')).toBeTruthy();
  });
});
