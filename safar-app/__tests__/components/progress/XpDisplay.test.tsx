import React from 'react';
import { render } from '@testing-library/react-native';
import { XpDisplay } from '@/components/progress/XpDisplay';

describe('XpDisplay', () => {
  it('renders with testID', () => {
    const { getByTestId } = render(<XpDisplay totalXp={0} />);
    expect(getByTestId('xp-display')).toBeTruthy();
  });

  it('displays the total XP count', () => {
    const { getByText } = render(<XpDisplay totalXp={340} />);
    expect(getByText('340')).toBeTruthy();
  });

  it('displays "Total XP" label', () => {
    const { getByText } = render(<XpDisplay totalXp={100} />);
    expect(getByText('Total XP')).toBeTruthy();
  });

  it('renders zero XP', () => {
    const { getByText } = render(<XpDisplay totalXp={0} />);
    expect(getByText('0')).toBeTruthy();
  });

  it('renders large XP values', () => {
    const { getByText } = render(<XpDisplay totalXp={9999} />);
    expect(getByText('9999')).toBeTruthy();
  });

  it('renders compact variant', () => {
    const { getByTestId, getByText } = render(<XpDisplay totalXp={50} compact />);
    expect(getByTestId('xp-display')).toBeTruthy();
    expect(getByText('50')).toBeTruthy();
  });
});
