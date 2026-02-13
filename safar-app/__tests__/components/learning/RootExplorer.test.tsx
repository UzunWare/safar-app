/**
 * RootExplorer Component Tests
 * Story 3.3: Root Explorer - The "Aha Moment"
 * Radial bloom visualization with diamond derivative tiles
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { RootExplorer } from '@/components/learning/RootExplorer';
import type { RootExplorerProps } from '@/components/learning/RootExplorer';

// Track animation calls for testing
const mockWithSpring = jest.fn((val: any, config?: any) => val);
const mockWithTiming = jest.fn((val: any, config?: any) => val);
const mockUseAnimatedStyle = jest.fn((fn: () => any) => ({}));

// Mock react-native-reanimated before importing component
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: {
      View: View,
      createAnimatedComponent: (component: any) => component,
    },
    useAnimatedStyle: (fn: () => any) => mockUseAnimatedStyle(fn),
    useSharedValue: (initial: any) => ({ value: initial }),
    withSpring: (val: any, config?: any) => mockWithSpring(val, config),
    withTiming: (val: any, config?: any) => mockWithTiming(val, config),
    runOnJS: (fn: any) => fn,
  };
});

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
}));

// Mock analytics
const mockTrackEvent = jest.fn();
jest.mock('@/lib/utils/analytics', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
  AnalyticsEvents: {
    ROOT_TAPPED: 'root_tapped',
  },
}));

const mockRoot = {
  id: 'root-hmd',
  letters: 'ح-م-د',
  meaning: 'praise, commendation',
  transliteration: 'h-m-d',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

const mockRelatedWords = [
  {
    id: 'word-1',
    arabic: 'الْحَمْدُ',
    transliteration: 'al-hamdu',
    meaning: 'the praise',
    audio_url: null,
    description: null,
    frequency: null,
    lesson_id: 'lesson-1',
    order: 1,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'word-2',
    arabic: 'مُحَمَّد',
    transliteration: 'muhammad',
    meaning: 'praised one',
    audio_url: null,
    description: null,
    frequency: null,
    lesson_id: 'lesson-1',
    order: 2,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'word-3',
    arabic: 'حَمِيد',
    transliteration: 'hameed',
    meaning: 'praiseworthy',
    audio_url: null,
    description: null,
    frequency: null,
    lesson_id: 'lesson-2',
    order: 1,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
];

const defaultProps: RootExplorerProps = {
  root: mockRoot,
  relatedWords: mockRelatedWords,
  isExpanded: true,
  onCollapse: jest.fn(),
  wordId: 'current-word-id',
};

describe('RootExplorer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove: jest.fn() } as any);
  });

  describe('Task 1: Component structure', () => {
    it('renders without crashing', () => {
      const { getByText } = render(<RootExplorer {...defaultProps} />);
      expect(getByText('ح-م-د')).toBeTruthy();
    });

    it('accepts RootExplorerProps interface', () => {
      const props: RootExplorerProps = {
        root: mockRoot,
        relatedWords: mockRelatedWords,
        isExpanded: false,
        onCollapse: jest.fn(),
        wordId: 'word-1',
      };
      const { UNSAFE_root } = render(<RootExplorer {...props} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('accepts root data with correct shape', () => {
      const { getByText } = render(<RootExplorer {...defaultProps} />);
      expect(getByText('ح-م-د')).toBeTruthy();
      expect(getByText('praise, commendation')).toBeTruthy();
    });

    it('accepts related words array', () => {
      const { getByText } = render(<RootExplorer {...defaultProps} />);
      expect(getByText('الْحَمْدُ')).toBeTruthy();
      expect(getByText('مُحَمَّد')).toBeTruthy();
    });
  });

  describe('Task 2: Spring animation', () => {
    it('uses useAnimatedStyle for animation', () => {
      render(<RootExplorer {...defaultProps} />);
      expect(mockUseAnimatedStyle).toHaveBeenCalled();
    });

    it('calls useAnimatedStyle with a worklet function', () => {
      render(<RootExplorer {...defaultProps} />);
      const workletFn = mockUseAnimatedStyle.mock.calls[0][0];
      expect(typeof workletFn).toBe('function');
    });

    it('animation worklet uses withSpring with damping: 15 when expanded', () => {
      mockUseAnimatedStyle.mockImplementation((fn) => {
        fn();
        return {};
      });
      render(<RootExplorer {...defaultProps} isExpanded={true} />);
      expect(mockWithSpring).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({ damping: 15 })
      );
    });

    it('animation worklet uses withSpring for collapsed state', () => {
      mockWithSpring.mockClear();
      mockUseAnimatedStyle.mockImplementation((fn) => {
        fn();
        return {};
      });
      render(<RootExplorer {...defaultProps} isExpanded={false} />);
      expect(mockWithSpring).toHaveBeenCalledWith(0, expect.objectContaining({ damping: 15 }));
    });

    it('checks AccessibilityInfo for Reduce Motion on mount', () => {
      render(<RootExplorer {...defaultProps} />);
      expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled();
    });

    it('uses instant animation when Reduce Motion is enabled', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
      mockWithTiming.mockClear();
      mockWithSpring.mockClear();
      mockUseAnimatedStyle.mockImplementation((fn) => {
        fn();
        return {};
      });

      render(<RootExplorer {...defaultProps} />);
      await act(async () => {
        await Promise.resolve();
      });

      const timingCalls = mockWithTiming.mock.calls;
      const hasInstantTiming = timingCalls.some((call) => call[1]?.duration === 0);
      expect(hasInstantTiming).toBe(true);
    });
  });

  describe('Task 3: Root center display', () => {
    it('shows root letters with Amiri font in center circle', () => {
      const { getByText } = render(<RootExplorer {...defaultProps} />);
      const rootLetters = getByText('ح-م-د');
      const style = rootLetters.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.fontFamily).toBe('Amiri');
      expect(flatStyle.fontSize).toBeGreaterThanOrEqual(24);
    });

    it('displays "Root" label in center circle', () => {
      const { getByText } = render(<RootExplorer {...defaultProps} />);
      expect(getByText('Root')).toBeTruthy();
    });

    it('displays root meaning below bloom', () => {
      const { getByText } = render(<RootExplorer {...defaultProps} />);
      expect(getByText('praise, commendation')).toBeTruthy();
    });

    it('displays root transliteration below bloom', () => {
      const { getByText } = render(<RootExplorer {...defaultProps} />);
      // transliteration 'h-m-d' uppercased, split on '-' and joined with ' - '
      expect(getByText('H - M - D')).toBeTruthy();
    });

    it('has accessibility label for root panel', () => {
      const { getByLabelText } = render(<RootExplorer {...defaultProps} />);
      expect(getByLabelText(/Root ح-م-د means praise, commendation/)).toBeTruthy();
    });
  });

  describe('Task 4: Derivative tiles display', () => {
    it('displays Arabic text for each related word in diamond tiles', () => {
      const { getByText } = render(<RootExplorer {...defaultProps} />);
      expect(getByText('الْحَمْدُ')).toBeTruthy();
      expect(getByText('مُحَمَّد')).toBeTruthy();
      expect(getByText('حَمِيد')).toBeTruthy();
    });

    it('limits display to 4 tiles maximum', () => {
      const fiveWords = [
        ...mockRelatedWords,
        {
          id: 'word-4',
          arabic: 'أحمد',
          transliteration: 'ahmad',
          meaning: 'most praised',
          audio_url: null,
          description: null,
          frequency: null,
          lesson_id: 'lesson-3',
          order: 1,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
        {
          id: 'word-5',
          arabic: 'تحميد',
          transliteration: 'tahmeed',
          meaning: 'praising',
          audio_url: null,
          description: null,
          frequency: null,
          lesson_id: 'lesson-3',
          order: 2,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
      ];
      const { queryByText } = render(<RootExplorer {...defaultProps} relatedWords={fiveWords} />);
      expect(queryByText('تحميد')).toBeNull();
    });

    it('renders empty state gracefully with no related words', () => {
      const { getByText } = render(<RootExplorer {...defaultProps} relatedWords={[]} />);
      expect(getByText('ح-م-د')).toBeTruthy();
    });

    it('displays transliteration and meaning visually for each related word', () => {
      const { getByText } = render(<RootExplorer {...defaultProps} />);
      expect(getByText('al-hamdu')).toBeTruthy();
      expect(getByText('the praise')).toBeTruthy();
      expect(getByText('muhammad')).toBeTruthy();
      expect(getByText('praised one')).toBeTruthy();
    });
  });

  describe('Task 5: Derivative tile taps', () => {
    it('derivative tiles are tappable (have button role)', () => {
      const { getByLabelText } = render(<RootExplorer {...defaultProps} />);
      const wordButton = getByLabelText('al-hamdu, the praise');
      expect(wordButton.props.accessibilityRole).toBe('button');
    });

    it('derivative tiles have accessible labels', () => {
      const { getByLabelText } = render(<RootExplorer {...defaultProps} />);
      expect(getByLabelText('al-hamdu, the praise')).toBeTruthy();
      expect(getByLabelText('muhammad, praised one')).toBeTruthy();
      expect(getByLabelText('hameed, praiseworthy')).toBeTruthy();
    });

    it('tapping derivative tile does not crash in MVP', () => {
      const { getByLabelText } = render(<RootExplorer {...defaultProps} />);
      const wordButton = getByLabelText('al-hamdu, the praise');
      expect(() => fireEvent.press(wordButton)).not.toThrow();
    });
  });

  describe('Task 6: Collapse behavior', () => {
    it('renders in collapsed state when isExpanded is false', () => {
      const { UNSAFE_root } = render(<RootExplorer {...defaultProps} isExpanded={false} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders in expanded state when isExpanded is true', () => {
      const { getByText } = render(<RootExplorer {...defaultProps} isExpanded={true} />);
      expect(getByText('ح-م-د')).toBeTruthy();
    });

    it('calls onCollapse when center root circle is tapped', () => {
      const onCollapse = jest.fn();
      const { getByLabelText } = render(
        <RootExplorer {...defaultProps} onCollapse={onCollapse} isExpanded={true} />
      );
      const rootCircle = getByLabelText(/Collapse root/);
      fireEvent.press(rootCircle);
      expect(onCollapse).toHaveBeenCalledTimes(1);
    });
  });

  describe('Task 8: Analytics tracking', () => {
    it('tracks root_tapped event when panel expands', () => {
      render(<RootExplorer {...defaultProps} isExpanded={true} />);
      expect(mockTrackEvent).toHaveBeenCalledWith(
        'root_tapped',
        expect.objectContaining({
          root_id: 'root-hmd',
          word_id: 'current-word-id',
        })
      );
    });

    it('includes root_letters in analytics properties', () => {
      render(<RootExplorer {...defaultProps} isExpanded={true} />);
      expect(mockTrackEvent).toHaveBeenCalledWith(
        'root_tapped',
        expect.objectContaining({
          root_letters: 'ح-م-د',
        })
      );
    });

    it('does not track when collapsed', () => {
      render(<RootExplorer {...defaultProps} isExpanded={false} />);
      expect(mockTrackEvent).not.toHaveBeenCalled();
    });

    it('includes lesson_id in analytics when provided', () => {
      render(<RootExplorer {...defaultProps} isExpanded={true} lessonId="lesson-42" />);
      expect(mockTrackEvent).toHaveBeenCalledWith(
        'root_tapped',
        expect.objectContaining({
          lesson_id: 'lesson-42',
        })
      );
    });
  });

  describe('Navigation', () => {
    it('navigates to word lesson when derivative tile is pressed', () => {
      const { getByLabelText } = render(<RootExplorer {...defaultProps} />);
      const firstDerivative = getByLabelText('al-hamdu, the praise');

      fireEvent.press(firstDerivative);

      expect(mockPush).toHaveBeenCalledWith('/lesson/lesson-1');
    });

    it('navigates to correct lesson for each derivative', () => {
      const { getByLabelText } = render(<RootExplorer {...defaultProps} />);

      // First word - lesson-1
      const firstWord = getByLabelText('al-hamdu, the praise');
      fireEvent.press(firstWord);
      expect(mockPush).toHaveBeenCalledWith('/lesson/lesson-1');

      // Third word - lesson-2
      const thirdWord = getByLabelText('hameed, praiseworthy');
      fireEvent.press(thirdWord);
      expect(mockPush).toHaveBeenCalledWith('/lesson/lesson-2');
    });

    it('does not navigate if word has no lesson_id', () => {
      const wordsWithoutLessonId = [
        {
          ...mockRelatedWords[0],
          lesson_id: undefined,
        },
      ];

      const { getByLabelText } = render(
        <RootExplorer {...defaultProps} relatedWords={wordsWithoutLessonId as any} />
      );

      const derivative = getByLabelText('al-hamdu, the praise (no lesson available)');
      fireEvent.press(derivative);

      // Should not navigate since no lesson_id
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
