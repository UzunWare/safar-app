import React from 'react';
import { render } from '@testing-library/react-native';
import { StreakCounter } from '@/components/progress/StreakCounter';

describe('StreakCounter', () => {
  it('renders with testID', () => {
    const { getByTestId } = render(<StreakCounter count={5} />);
    expect(getByTestId('streak-counter')).toBeTruthy();
  });

  it('displays the streak count', () => {
    const { getByText } = render(<StreakCounter count={12} />);
    expect(getByText('12')).toBeTruthy();
  });

  it('displays "Day Streak" label', () => {
    const { getByText } = render(<StreakCounter count={5} />);
    expect(getByText('Day Streak')).toBeTruthy();
  });

  it('renders zero streak', () => {
    const { getByText } = render(<StreakCounter count={0} />);
    expect(getByText('0')).toBeTruthy();
  });

  it('renders inactive state', () => {
    const { getByTestId } = render(<StreakCounter count={0} isActive={false} />);
    expect(getByTestId('streak-counter')).toBeTruthy();
  });
});
