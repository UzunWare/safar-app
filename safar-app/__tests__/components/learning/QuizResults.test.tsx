import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

import { QuizResults } from '@/components/learning/QuizResults';

// Mock react-native-reanimated (used by CelebrationGlow + StarRating)
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
    withDelay: jest.fn((_delay: any, val: any) => val),
    Easing: { inOut: jest.fn(() => jest.fn()), ease: {} },
    runOnJS: (fn: any) => fn,
  };
});

// Mock react-native-svg (used by IslamicPattern in ScreenBackground)
jest.mock('react-native-svg', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Path: View,
    Circle: View,
    G: View,
    Rect: View,
    Defs: View,
    LinearGradient: View,
    Stop: View,
  };
});

describe('QuizResults', () => {
  const defaultProps: React.ComponentProps<typeof QuizResults> = {
    correctCount: 8,
    totalCount: 10,
    onComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function renderAndFlush(props: React.ComponentProps<typeof QuizResults> = defaultProps) {
    const result = render(<QuizResults {...props} />);
    // Advance past the animated counter duration (1200ms)
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    return result;
  }

  // --- AC #1: Results screen showing score, percentage, feedback, and button ---

  it('renders the results screen', () => {
    const { getByTestId } = renderAndFlush();
    expect(getByTestId('quiz-results')).toBeTruthy();
  });

  it('displays score in X/Y format', () => {
    const { getByTestId } = renderAndFlush();
    const score = getByTestId('quiz-results-score');
    expect(score.props.children).toEqual([8, '/', 10]);
  });

  it('displays percentage', () => {
    const { getByTestId } = renderAndFlush();
    const pct = getByTestId('quiz-results-percentage');
    expect(pct.props.children).toEqual([80, '%']);
  });

  it('displays feedback message', () => {
    const { getByTestId } = renderAndFlush();
    expect(getByTestId('quiz-results-feedback')).toBeTruthy();
  });

  it('displays Complete Lesson button', () => {
    const { getByTestId } = renderAndFlush();
    expect(getByTestId('quiz-complete-lesson-button')).toBeTruthy();
  });

  it('calls onComplete when Complete Lesson button pressed', () => {
    const onComplete = jest.fn();
    const { getByTestId } = renderAndFlush({ ...defaultProps, onComplete });
    fireEvent.press(getByTestId('quiz-complete-lesson-button'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // --- AC #2: High score (>= 80%) shows encouraging feedback + celebration ---

  it('shows encouraging feedback for score >= 80%', () => {
    const { getByTestId } = renderAndFlush({
      correctCount: 8,
      totalCount: 10,
      onComplete: jest.fn(),
    });
    const feedback = getByTestId('quiz-results-feedback');
    expect(feedback.props.children).toContain('Excellent');
  });

  it('shows celebration animation for score >= 80%', () => {
    const { getByTestId } = renderAndFlush({
      correctCount: 8,
      totalCount: 10,
      onComplete: jest.fn(),
    });
    expect(getByTestId('quiz-celebration-animation')).toBeTruthy();
  });

  it('shows celebration animation for perfect score', () => {
    const { getByTestId } = renderAndFlush({
      correctCount: 10,
      totalCount: 10,
      onComplete: jest.fn(),
    });
    expect(getByTestId('quiz-celebration-animation')).toBeTruthy();
  });

  // --- AC #3: Low score (< 80%) shows constructive feedback, no shame ---

  it('shows constructive feedback for score < 80%', () => {
    const { getByTestId } = renderAndFlush({
      correctCount: 6,
      totalCount: 10,
      onComplete: jest.fn(),
    });
    const feedback = getByTestId('quiz-results-feedback');
    expect(feedback.props.children).toContain('effort');
  });

  it('does not show celebration animation for score < 80%', () => {
    const { queryByTestId } = renderAndFlush({
      correctCount: 5,
      totalCount: 10,
      onComplete: jest.fn(),
    });
    expect(queryByTestId('quiz-celebration-animation')).toBeNull();
  });

  it('shows constructive feedback for very low score', () => {
    const { getByTestId } = renderAndFlush({
      correctCount: 1,
      totalCount: 10,
      onComplete: jest.fn(),
    });
    const feedback = getByTestId('quiz-results-feedback');
    expect(feedback.props.children).toContain('reviews');
  });

  // --- Star Rating ---

  it('shows star rating', () => {
    const { getByTestId } = renderAndFlush();
    expect(getByTestId('quiz-star-rating')).toBeTruthy();
  });

  // --- Review Mistakes ---

  it('shows review mistakes button when onReviewMistakes provided and not perfect', () => {
    const { getByTestId } = renderAndFlush({
      correctCount: 7,
      totalCount: 10,
      onComplete: jest.fn(),
      onReviewMistakes: jest.fn(),
    });
    expect(getByTestId('quiz-review-mistakes-button')).toBeTruthy();
  });

  it('does not show review mistakes button for perfect score', () => {
    const { queryByTestId } = renderAndFlush({
      correctCount: 10,
      totalCount: 10,
      onComplete: jest.fn(),
      onReviewMistakes: jest.fn(),
    });
    expect(queryByTestId('quiz-review-mistakes-button')).toBeNull();
  });

  it('calls onReviewMistakes when review button pressed', () => {
    const onReviewMistakes = jest.fn();
    const { getByTestId } = renderAndFlush({
      correctCount: 7,
      totalCount: 10,
      onComplete: jest.fn(),
      onReviewMistakes,
    });
    fireEvent.press(getByTestId('quiz-review-mistakes-button'));
    expect(onReviewMistakes).toHaveBeenCalledTimes(1);
  });

  // --- Edge cases ---

  it('calculates percentage correctly for 3/4', () => {
    const { getByTestId } = renderAndFlush({
      correctCount: 3,
      totalCount: 4,
      onComplete: jest.fn(),
    });
    const pct = getByTestId('quiz-results-percentage');
    expect(pct.props.children).toEqual([75, '%']);
  });

  it('handles 0 total count gracefully', () => {
    const { getByTestId } = renderAndFlush({
      correctCount: 0,
      totalCount: 0,
      onComplete: jest.fn(),
    });
    const pct = getByTestId('quiz-results-percentage');
    expect(pct.props.children).toEqual([0, '%']);
  });

  it('disables button when isCompleting is true', () => {
    const onComplete = jest.fn();
    const { getByTestId } = renderAndFlush({
      ...defaultProps,
      onComplete,
      isCompleting: true,
    });
    const button = getByTestId('quiz-complete-lesson-button');
    expect(button.props.accessibilityState?.disabled || button.props.disabled).toBeTruthy();
  });
});
