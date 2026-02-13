import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressRing } from '@/components/progress/ProgressRing';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: {
      View: View,
      createAnimatedComponent: (component: any) => component,
    },
    useAnimatedProps: jest.fn(() => ({})),
    useSharedValue: (initial: any) => ({ value: initial }),
    withTiming: jest.fn((val: any) => val),
    Easing: {
      out: jest.fn(() => jest.fn()),
      cubic: {},
    },
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Circle: View,
  };
});

describe('ProgressRing', () => {
  it('renders with testID', () => {
    const { getByTestId } = render(<ProgressRing percentage={50} />);
    expect(getByTestId('progress-ring')).toBeTruthy();
  });

  it('displays percentage text', () => {
    const { getByText } = render(<ProgressRing percentage={75} />);
    expect(getByText('75%')).toBeTruthy();
  });

  it('displays default label "Complete"', () => {
    const { getByText } = render(<ProgressRing percentage={50} />);
    expect(getByText('Complete')).toBeTruthy();
  });

  it('displays custom label', () => {
    const { getByText } = render(<ProgressRing percentage={50} label="Progress" />);
    expect(getByText('Progress')).toBeTruthy();
  });

  it('renders 0% correctly', () => {
    const { getByText } = render(<ProgressRing percentage={0} />);
    expect(getByText('0%')).toBeTruthy();
  });

  it('renders 100% correctly', () => {
    const { getByText } = render(<ProgressRing percentage={100} />);
    expect(getByText('100%')).toBeTruthy();
  });
});
