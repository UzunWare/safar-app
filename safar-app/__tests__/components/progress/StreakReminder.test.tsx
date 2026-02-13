import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { StreakReminder } from '@/components/progress/StreakReminder';

describe('StreakReminder', () => {
  it('renders at-risk reminder with correct message', () => {
    render(<StreakReminder status="at-risk" streakCount={5} isEvening={true} />);

    expect(screen.getByTestId('streak-reminder')).toBeTruthy();
    expect(screen.getByText(/keep your 5-day streak going/i)).toBeTruthy();
  });

  it('shows lesson/review suggestion text', () => {
    render(<StreakReminder status="at-risk" streakCount={3} isEvening={true} />);

    expect(screen.getByText(/complete a quick review or lesson today/i)).toBeTruthy();
  });

  it('does not render when status is active', () => {
    render(<StreakReminder status="active" streakCount={5} isEvening={true} />);

    expect(screen.queryByTestId('streak-reminder')).toBeNull();
  });

  it('does not render when status is at-risk but not evening', () => {
    render(<StreakReminder status="at-risk" streakCount={5} isEvening={false} />);

    expect(screen.queryByTestId('streak-reminder')).toBeNull();
  });

  it('does not render when status is broken', () => {
    render(<StreakReminder status="broken" streakCount={0} isEvening={true} />);

    expect(screen.queryByTestId('streak-reminder')).toBeNull();
  });
});
