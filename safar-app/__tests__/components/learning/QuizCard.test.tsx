import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuizCard, getOptionState } from '@/components/learning/QuizCard';
import type { QuizQuestionData } from '@/lib/utils/quiz';

const mockQuestion: QuizQuestionData = {
  wordId: 'w1',
  arabic: 'بِسْمِ',
  correctMeaning: 'In the name of',
  options: [
    { id: 'distractor-0', text: 'God', isCorrect: false },
    { id: 'correct', text: 'In the name of', isCorrect: true },
    { id: 'distractor-1', text: 'The Most Gracious', isCorrect: false },
    { id: 'distractor-2', text: 'The Most Merciful', isCorrect: false },
  ],
};

describe('QuizCard', () => {
  const defaultProps = {
    question: mockQuestion,
    selectedOptionId: null,
    phase: 'selecting' as const,
    onSelectOption: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Arabic word', () => {
    const { getByTestId } = render(<QuizCard {...defaultProps} />);
    expect(getByTestId('quiz-arabic-word')).toBeTruthy();
  });

  it('displays the Arabic text correctly', () => {
    const { getByText } = render(<QuizCard {...defaultProps} />);
    expect(getByText('بِسْمِ')).toBeTruthy();
  });

  it('renders 4 answer options', () => {
    const { getAllByTestId } = render(<QuizCard {...defaultProps} />);
    const options = getAllByTestId(/^quiz-option-/);
    expect(options).toHaveLength(4);
  });

  it('displays all option texts', () => {
    const { getByText } = render(<QuizCard {...defaultProps} />);
    expect(getByText('God', { exact: false })).toBeTruthy();
    expect(getByText('In the name of', { exact: false })).toBeTruthy();
    expect(getByText('The Most Gracious', { exact: false })).toBeTruthy();
    expect(getByText('The Most Merciful', { exact: false })).toBeTruthy();
  });

  it('calls onSelectOption when option is tapped', () => {
    const onSelectOption = jest.fn();
    const { getByTestId } = render(<QuizCard {...defaultProps} onSelectOption={onSelectOption} />);

    fireEvent.press(getByTestId('quiz-option-correct'));
    expect(onSelectOption).toHaveBeenCalledWith('correct');
  });

  it('disables options when phase is checked', () => {
    const onSelectOption = jest.fn();
    const { getByTestId } = render(
      <QuizCard
        {...defaultProps}
        phase="checked"
        selectedOptionId="correct"
        onSelectOption={onSelectOption}
      />
    );

    fireEvent.press(getByTestId('quiz-option-correct'));
    expect(onSelectOption).not.toHaveBeenCalled();
  });

  it('shows question prompt text', () => {
    const { getByText } = render(<QuizCard {...defaultProps} />);
    expect(getByText('What does this word mean?')).toBeTruthy();
  });

  it('renders quiz-card testID', () => {
    const { getByTestId } = render(<QuizCard {...defaultProps} />);
    expect(getByTestId('quiz-card')).toBeTruthy();
  });

  it('shows revealed state for correct answer when wrong answer selected', () => {
    const { getByTestId } = render(
      <QuizCard {...defaultProps} phase="checked" selectedOptionId="distractor-0" />
    );

    expect(getByTestId('quiz-option-correct')).toBeTruthy();
  });
});

describe('getOptionState', () => {
  const correctOption = { id: 'correct', text: 'Answer', isCorrect: true };
  const wrongOption = { id: 'wrong', text: 'Wrong', isCorrect: false };

  it('returns normal when selecting and not selected', () => {
    expect(getOptionState(wrongOption, null, 'selecting')).toBe('normal');
  });

  it('returns selected when selecting and this option is selected', () => {
    expect(getOptionState(wrongOption, 'wrong', 'selecting')).toBe('selected');
  });

  it('returns correct when checked and correct option was selected', () => {
    expect(getOptionState(correctOption, 'correct', 'checked')).toBe('correct');
  });

  it('returns revealed when checked and correct option was not selected', () => {
    expect(getOptionState(correctOption, 'wrong', 'checked')).toBe('revealed');
  });

  it('returns incorrect when checked and wrong option was selected', () => {
    expect(getOptionState(wrongOption, 'wrong', 'checked')).toBe('incorrect');
  });

  it('returns normal when checked and neither selected nor correct', () => {
    expect(getOptionState(wrongOption, 'other', 'checked')).toBe('normal');
  });
});
