/**
 * WordCard Component Tests
 * Story 3.2: Word Card Display
 * Story 4.6: Word Learning States
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WordCard } from '@/components/learning/WordCard';
import type { WordCardProps } from '@/components/learning/WordCard';
import { useWordState } from '@/lib/hooks/useWordState';

// Mock useWordState hook (Story 4.6)
jest.mock('@/lib/hooks/useWordState');

// Task 1: Typography constants for Arabic font configuration
describe('Typography Configuration', () => {
  it('defines Amiri font family for Arabic text', () => {
    const { fonts } = require('@/constants/typography');
    expect(fonts.amiri).toBe('Amiri');
  });

  it('defines Arabic typography scale with correct sizes', () => {
    const { typography } = require('@/constants/typography');
    expect(typography.arabicLarge.fontFamily).toBe('Amiri');
    expect(typography.arabicLarge.fontSize).toBe(48);
    expect(typography.arabicMedium.fontFamily).toBe('Amiri');
    expect(typography.arabicMedium.fontSize).toBe(36);
    expect(typography.arabicSmall.fontFamily).toBe('Amiri');
    expect(typography.arabicSmall.fontSize).toBe(24);
  });

  it('defines word-specific typography sizes', () => {
    const { typography } = require('@/constants/typography');
    // Word card needs 32-48pt for Arabic display
    expect(typography.arabicLarge.fontSize).toBeGreaterThanOrEqual(32);
    expect(typography.arabicLarge.fontSize).toBeLessThanOrEqual(48);
  });
});

// Mock word data for testing
const mockWord: WordCardProps['word'] = {
  id: 'word-1',
  arabic: 'بِسْمِ',
  transliteration: 'bismi',
  meaning: 'In the name of',
  audio_url: 'https://example.com/audio.mp3',
  description: null,
  frequency: null,
  lesson_id: 'lesson-1',
  order: 1,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

const mockRoot = {
  id: 'root-1',
  letters: 'س-م-و',
  meaning: 'name',
  transliteration: 's-m-w',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

const defaultProps: WordCardProps = {
  word: mockWord,
  root: mockRoot,
  onRootTap: jest.fn(),
  onAudioPlay: jest.fn(),
};

// Task 2: Component structure
describe('WordCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Story 4.6: Mock useWordState to return learning state
    (useWordState as jest.Mock).mockReturnValue({
      state: 'learning',
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  describe('Task 2: Component structure', () => {
    it('renders without crashing', () => {
      const { getByText } = render(<WordCard {...defaultProps} />);
      expect(getByText('بِسْمِ')).toBeTruthy();
    });

    it('renders all required elements', () => {
      const { getByText, getByLabelText } = render(<WordCard {...defaultProps} />);
      // Arabic word
      expect(getByText('بِسْمِ')).toBeTruthy();
      // Transliteration
      expect(getByText('bismi')).toBeTruthy();
      // Meaning
      expect(getByText('In the name of')).toBeTruthy();
      // Root indicator
      expect(getByText('س-م-و')).toBeTruthy();
      // Audio button
      expect(getByLabelText('Play pronunciation')).toBeTruthy();
    });
  });

  // Task 3: Arabic word display
  describe('Task 3: Arabic word display', () => {
    it('displays Arabic text with Amiri font', () => {
      const { getByText } = render(<WordCard {...defaultProps} />);
      const arabicText = getByText('بِسْمِ');
      const style = arabicText.props.style;
      // Check that font family includes Amiri
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.fontFamily).toBe('Amiri');
    });

    it('renders Arabic text with RTL direction', () => {
      const { getByText } = render(<WordCard {...defaultProps} />);
      const arabicText = getByText('بِسْمِ');
      const style = arabicText.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.writingDirection).toBe('rtl');
    });

    it('displays Arabic text with proper font size (32-48pt range)', () => {
      const { getByText } = render(<WordCard {...defaultProps} />);
      const arabicText = getByText('بِسْمِ');
      const style = arabicText.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.fontSize).toBeGreaterThanOrEqual(32);
      expect(flatStyle.fontSize).toBeLessThanOrEqual(48);
    });

    it('handles Arabic text with diacritics (tashkeel)', () => {
      const wordWithTashkeel = {
        ...mockWord,
        arabic: 'الْحَمْدُ',
      };
      const { getByText } = render(<WordCard {...defaultProps} word={wordWithTashkeel} />);
      expect(getByText('الْحَمْدُ')).toBeTruthy();
    });
  });

  // Task 4: Transliteration and meaning
  describe('Task 4: Transliteration and meaning', () => {
    it('displays transliteration text', () => {
      const { getByText } = render(<WordCard {...defaultProps} />);
      expect(getByText('bismi')).toBeTruthy();
    });

    it('displays English meaning', () => {
      const { getByText } = render(<WordCard {...defaultProps} />);
      expect(getByText('In the name of')).toBeTruthy();
    });
  });

  // Task 5: Root indicator
  describe('Task 5: Root indicator', () => {
    it('displays root letters', () => {
      const { getByText } = render(<WordCard {...defaultProps} />);
      expect(getByText('س-م-و')).toBeTruthy();
    });

    it('displays "Root Family" label', () => {
      const { getByText } = render(<WordCard {...defaultProps} />);
      // Design system uses "Root Family" label (adapted from AC's "Root: letters" example)
      expect(getByText('Root Family')).toBeTruthy();
    });

    it('root indicator is tappable with 44x44pt minimum', () => {
      const { getByLabelText } = render(<WordCard {...defaultProps} />);
      const rootButton = getByLabelText(/Explore root/);
      expect(rootButton).toBeTruthy();
      expect(rootButton.props.accessibilityRole).toBe('button');
      // Check minimum touch target size
      const style = rootButton.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.minWidth).toBeGreaterThanOrEqual(44);
      expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);
    });

    it('calls onRootTap with root id when tapped', () => {
      const onRootTap = jest.fn();
      const { getByLabelText } = render(<WordCard {...defaultProps} onRootTap={onRootTap} />);
      fireEvent.press(getByLabelText(/Explore root/));
      expect(onRootTap).toHaveBeenCalledWith('root-1');
    });

    it('handles missing root gracefully', () => {
      const { queryByText, queryByLabelText } = render(
        <WordCard {...defaultProps} root={undefined} />
      );
      // Should not crash, root section should not render
      expect(queryByLabelText(/Explore root/)).toBeNull();
    });
  });

  // Task 6: Audio play button
  describe('Task 6: Audio play button', () => {
    it('renders audio play button', () => {
      const { getByLabelText } = render(<WordCard {...defaultProps} />);
      expect(getByLabelText('Play pronunciation')).toBeTruthy();
    });

    it('calls onAudioPlay when pressed', () => {
      const onAudioPlay = jest.fn();
      const { getByLabelText } = render(<WordCard {...defaultProps} onAudioPlay={onAudioPlay} />);
      fireEvent.press(getByLabelText('Play pronunciation'));
      expect(onAudioPlay).toHaveBeenCalledTimes(1);
    });

    it('audio button has button accessibility role', () => {
      const { getByLabelText } = render(<WordCard {...defaultProps} />);
      const audioBtn = getByLabelText('Play pronunciation');
      expect(audioBtn.props.accessibilityRole).toBe('button');
    });
  });

  // Task 7: Font scaling
  describe('Task 7: Font scaling', () => {
    it('does not disable font scaling on Arabic text', () => {
      const { getByText } = render(<WordCard {...defaultProps} />);
      const arabicText = getByText('بِسْمِ');
      // allowFontScaling defaults to true in RN; verify it's not explicitly disabled
      expect(arabicText.props.allowFontScaling).not.toBe(false);
    });

    it('does not disable font scaling on transliteration text', () => {
      const { getByText } = render(<WordCard {...defaultProps} />);
      const transliteration = getByText('bismi');
      expect(transliteration.props.allowFontScaling).not.toBe(false);
    });

    it('does not disable font scaling on meaning text', () => {
      const { getByText } = render(<WordCard {...defaultProps} />);
      const meaning = getByText('In the name of');
      expect(meaning.props.allowFontScaling).not.toBe(false);
    });
  });

  // Task 8: Accessibility
  describe('Task 8: Accessibility labels', () => {
    it('has correct accessibility label format', () => {
      const { getByLabelText } = render(<WordCard {...defaultProps} />);
      const card = getByLabelText('Arabic word bismi, meaning In the name of, from root س-م-و');
      expect(card).toBeTruthy();
    });

    it('card is accessible', () => {
      const { getByLabelText } = render(<WordCard {...defaultProps} />);
      const card = getByLabelText('Arabic word bismi, meaning In the name of, from root س-م-و');
      expect(card.props.accessible).toBe(true);
    });

    it('handles accessibility label without root', () => {
      const { getByLabelText } = render(<WordCard {...defaultProps} root={undefined} />);
      const card = getByLabelText('Arabic word bismi, meaning In the name of');
      expect(card).toBeTruthy();
    });
  });

  // Story 4.6: Learning state indicator
  describe('Story 4.6: Learning state indicator', () => {
    it('does not show state indicator by default', () => {
      const { queryByText } = render(<WordCard {...defaultProps} />);
      expect(queryByText('Learning')).toBeNull();
      expect(queryByText('New')).toBeNull();
      expect(queryByText('Review')).toBeNull();
      expect(queryByText('Mastered')).toBeNull();
    });

    it('shows state indicator when showLearningState is true', () => {
      (useWordState as jest.Mock).mockReturnValue({
        state: 'mastered',
        isLoading: false,
        isError: false,
        error: null,
      });

      const { getByText } = render(<WordCard {...defaultProps} showLearningState={true} />);

      expect(getByText('Mastered')).toBeTruthy();
    });

    it('displays correct state labels for all states', () => {
      const states = [
        { state: 'new', label: 'New' },
        { state: 'learning', label: 'Learning' },
        { state: 'review', label: 'Review' },
        { state: 'mastered', label: 'Mastered' },
      ] as const;

      states.forEach(({ state, label }) => {
        (useWordState as jest.Mock).mockReturnValue({
          state,
          isLoading: false,
          isError: false,
          error: null,
        });

        const { getByText } = render(<WordCard {...defaultProps} showLearningState={true} />);

        expect(getByText(label)).toBeTruthy();
      });
    });

    it('calls useWordState with word ID', () => {
      render(<WordCard {...defaultProps} showLearningState={true} />);

      expect(useWordState).toHaveBeenCalledWith('word-1');
    });
  });
});
