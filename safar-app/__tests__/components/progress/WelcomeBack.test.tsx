import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { WelcomeBack } from '@/components/progress/WelcomeBack';

describe('WelcomeBack', () => {
  it('renders welcome back message', () => {
    render(<WelcomeBack dueReviews={5} />);

    expect(screen.getByTestId('welcome-back')).toBeTruthy();
    expect(screen.getByText('Welcome back!')).toBeTruthy();
  });

  it('shows "Your knowledge is still here" message', () => {
    render(<WelcomeBack dueReviews={3} />);

    expect(screen.getByText('Your knowledge is still here.')).toBeTruthy();
  });

  it('shows due reviews count when reviews are available', () => {
    render(<WelcomeBack dueReviews={8} />);

    expect(screen.getByText('8 words ready for review.')).toBeTruthy();
  });

  it('does not show review count when no reviews due', () => {
    render(<WelcomeBack dueReviews={0} />);

    expect(screen.queryByText(/words ready for review/)).toBeNull();
  });

  it('does not use shame messaging', () => {
    const { toJSON } = render(<WelcomeBack dueReviews={5} />);
    const content = JSON.stringify(toJSON());

    // Should not contain shaming words
    expect(content).not.toMatch(/lost|broke|failed|shame|bad/i);
  });
});
