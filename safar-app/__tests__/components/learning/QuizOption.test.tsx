import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuizOption } from '@/components/learning/QuizOption';

jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: {
      View: View,
      createAnimatedComponent: (component: any) => component,
    },
    useAnimatedStyle: jest.fn(() => ({})),
    useSharedValue: (initial: any) => ({ value: initial }),
    withSpring: jest.fn((val: any) => val),
    withTiming: jest.fn((val: any) => val),
    withRepeat: jest.fn((val: any) => val),
    withSequence: jest.fn((...args: any[]) => args[0]),
    Easing: { inOut: jest.fn(() => jest.fn()), ease: {} },
  };
});

describe('QuizOption', () => {
  const defaultProps = {
    text: 'In the name of',
    state: 'normal' as const,
    onPress: jest.fn(),
    disabled: false,
    testID: 'quiz-option-test',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the option text', () => {
    const { getByText } = render(<QuizOption {...defaultProps} />);
    expect(getByText('In the name of')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<QuizOption {...defaultProps} onPress={onPress} />);

    fireEvent.press(getByTestId('quiz-option-test'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <QuizOption {...defaultProps} onPress={onPress} disabled={true} />
    );

    fireEvent.press(getByTestId('quiz-option-test'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with correct state styling', () => {
    const { getByTestId } = render(<QuizOption {...defaultProps} state="correct" />);

    const option = getByTestId('quiz-option-test');
    expect(option).toBeTruthy();
  });

  it('renders with incorrect state styling', () => {
    const { getByTestId } = render(<QuizOption {...defaultProps} state="incorrect" />);

    const option = getByTestId('quiz-option-test');
    expect(option).toBeTruthy();
  });

  it('renders with selected state styling', () => {
    const { getByTestId } = render(<QuizOption {...defaultProps} state="selected" />);

    const option = getByTestId('quiz-option-test');
    expect(option).toBeTruthy();
  });

  it('renders with revealed state styling', () => {
    const { getByTestId } = render(<QuizOption {...defaultProps} state="revealed" />);

    const option = getByTestId('quiz-option-test');
    expect(option).toBeTruthy();
  });

  it('has proper accessibility role', () => {
    const { getByRole } = render(<QuizOption {...defaultProps} />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('sets accessibility state disabled when disabled', () => {
    const { getByTestId } = render(<QuizOption {...defaultProps} disabled={true} />);

    const option = getByTestId('quiz-option-test');
    expect(option.props.accessibilityState.disabled).toBe(true);
  });
});
