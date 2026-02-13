import React from 'react';
import { render, act } from '@testing-library/react-native';
import { XpGainAnimation } from '@/components/progress/XpGainAnimation';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: {
      View: View,
      createAnimatedComponent: (component: any) => component,
    },
    useSharedValue: (initial: any) => ({ value: initial }),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((val: any) => val),
    withDelay: jest.fn((_delay: any, val: any) => val),
  };
});

describe('XpGainAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with testID', () => {
    const { getByTestId } = render(<XpGainAnimation amount={10} />);
    expect(getByTestId('xp-gain-animation')).toBeTruthy();
  });

  it('displays the XP amount with + prefix', () => {
    const { getByText } = render(<XpGainAnimation amount={10} />);
    expect(getByText('+10 XP')).toBeTruthy();
  });

  it('displays various XP amounts', () => {
    const { getByText } = render(<XpGainAnimation amount={15} />);
    expect(getByText('+15 XP')).toBeTruthy();
  });

  it('calls onComplete after animation duration', () => {
    const onComplete = jest.fn();
    render(<XpGainAnimation amount={10} onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not crash without onComplete', () => {
    expect(() => {
      render(<XpGainAnimation amount={5} />);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }).not.toThrow();
  });
});
