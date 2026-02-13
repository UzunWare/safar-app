import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DifficultyRating } from '@/components/learning/DifficultyRating';
import type { SM2Input } from '@/lib/utils/sm2';
import { calculateNextReview, formatInterval } from '@/lib/utils/sm2';

describe('DifficultyRating', () => {
  const defaultProgress: SM2Input = {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
  };

  const mockOnRate = jest.fn();

  beforeEach(() => {
    mockOnRate.mockClear();
  });

  describe('AC #1: Display 4 rating buttons', () => {
    it('renders all 4 rating buttons', () => {
      const { getByText } = render(
        <DifficultyRating currentProgress={defaultProgress} onRate={mockOnRate} />
      );

      expect(getByText('Again')).toBeTruthy();
      expect(getByText('Hard')).toBeTruthy();
      expect(getByText('Good')).toBeTruthy();
      expect(getByText('Easy')).toBeTruthy();
    });

    it('displays interval preview on each button', () => {
      const { getAllByText } = render(
        <DifficultyRating currentProgress={defaultProgress} onRate={mockOnRate} />
      );

      // For rep 0, all buttons show "1d" (first repetition = 1 day)
      const dayLabels = getAllByText('1d');
      expect(dayLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('shows different interval previews for advanced progress', () => {
      const advancedProgress: SM2Input = {
        easeFactor: 2.5,
        interval: 6,
        repetitions: 2,
      };

      const { getByLabelText } = render(
        <DifficultyRating currentProgress={advancedProgress} onRate={mockOnRate} />
      );

      // Verify each button shows correct preview via accessibility label
      const againInterval = formatInterval(calculateNextReview(0, advancedProgress).interval);
      const easyInterval = formatInterval(calculateNextReview(3, advancedProgress).interval);

      expect(getByLabelText(`Rate as Again, next review in ${againInterval}`)).toBeTruthy();
      expect(getByLabelText(`Rate as Easy, next review in ${easyInterval}`)).toBeTruthy();
    });

    it('has accessible labels for each button', () => {
      const { getByLabelText } = render(
        <DifficultyRating currentProgress={defaultProgress} onRate={mockOnRate} />
      );

      expect(getByLabelText(/Rate as Again/)).toBeTruthy();
      expect(getByLabelText(/Rate as Hard/)).toBeTruthy();
      expect(getByLabelText(/Rate as Good/)).toBeTruthy();
      expect(getByLabelText(/Rate as Easy/)).toBeTruthy();
    });
  });

  describe('AC #2: Rating tap triggers callback', () => {
    it('calls onRate with 0 when Again is pressed', () => {
      const { getByText } = render(
        <DifficultyRating currentProgress={defaultProgress} onRate={mockOnRate} />
      );

      fireEvent.press(getByText('Again'));
      expect(mockOnRate).toHaveBeenCalledWith(0);
    });

    it('calls onRate with 1 when Hard is pressed', () => {
      const { getByText } = render(
        <DifficultyRating currentProgress={defaultProgress} onRate={mockOnRate} />
      );

      fireEvent.press(getByText('Hard'));
      expect(mockOnRate).toHaveBeenCalledWith(1);
    });

    it('calls onRate with 2 when Good is pressed', () => {
      const { getByText } = render(
        <DifficultyRating currentProgress={defaultProgress} onRate={mockOnRate} />
      );

      fireEvent.press(getByText('Good'));
      expect(mockOnRate).toHaveBeenCalledWith(2);
    });

    it('calls onRate with 3 when Easy is pressed', () => {
      const { getByText } = render(
        <DifficultyRating currentProgress={defaultProgress} onRate={mockOnRate} />
      );

      fireEvent.press(getByText('Easy'));
      expect(mockOnRate).toHaveBeenCalledWith(3);
    });

    it('disables buttons when disabled prop is true', () => {
      const { getByText } = render(
        <DifficultyRating currentProgress={defaultProgress} onRate={mockOnRate} disabled={true} />
      );

      fireEvent.press(getByText('Again'));
      expect(mockOnRate).not.toHaveBeenCalled();
    });
  });
});
