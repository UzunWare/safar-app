import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import QuizScreen from '@/app/quiz/[lessonId]';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { initializeWordProgress } from '@/lib/api/wordProgress';
import { markLessonComplete } from '@/lib/api/progress';
import { trackQuizCompleted } from '@/lib/utils/analytics';

// Mock react-native-reanimated (used by FeedbackBanner + QuizResults)
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

jest.mock('@/lib/api/wordProgress', () => ({
  initializeWordProgress: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/lib/api/progress', () => ({
  markLessonComplete: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/lib/utils/analytics', () => ({
  trackQuizCompleted: jest.fn(),
  trackEvent: jest.fn(),
  AnalyticsEvents: {},
}));

jest.mock('@/lib/hooks/useHaptics', () => ({
  useHaptics: () => ({
    success: jest.fn(),
    error: jest.fn(),
    light: jest.fn(),
  }),
}));

jest.mock('@/lib/hooks/useQuizSounds', () => ({
  useQuizSounds: () => ({
    playSelect: jest.fn(),
    playCorrect: jest.fn(),
    playIncorrect: jest.fn(),
    playComplete: jest.fn(),
  }),
}));

jest.mock('@/lib/hooks/useContentAccess', () => ({
  useContentAccess: () => ({
    hasAccess: true,
    shouldShowPaywall: false,
    isLoading: false,
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockWordsData = [
  {
    id: 'w1',
    lesson_id: 'l1',
    arabic: 'بِسْمِ',
    transliteration: 'bismi',
    meaning: 'In the name of',
    order: 1,
    audio_url: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'w2',
    lesson_id: 'l1',
    arabic: 'اللَّهِ',
    transliteration: 'allahi',
    meaning: 'God',
    order: 2,
    audio_url: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'w3',
    lesson_id: 'l1',
    arabic: 'الرَّحْمَنِ',
    transliteration: 'ar-rahmani',
    meaning: 'The Most Gracious',
    order: 3,
    audio_url: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'w4',
    lesson_id: 'l1',
    arabic: 'الرَّحِيمِ',
    transliteration: 'ar-rahimi',
    meaning: 'The Most Merciful',
    order: 4,
    audio_url: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

const mockLessonData = {
  id: 'l1',
  unit_id: 'u1',
  name: 'Bismillah',
  order: 1,
  word_count: 4,
  type: 'surah',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  words: mockWordsData,
};

function setupLessonMock(data: any = mockLessonData, error: any = null) {
  const mockSingle = jest.fn().mockResolvedValue({ data, error });
  const mockOrder = jest.fn().mockReturnValue({ single: mockSingle });
  const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
  (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
  return { mockSelect, mockEq, mockOrder, mockSingle };
}

/** Helper: select option → press CHECK → press CONTINUE to advance */
async function answerQuestion(getByTestId: any, getAllByTestId: any, correct: boolean) {
  if (correct) {
    fireEvent.press(getByTestId('quiz-option-correct'));
  } else {
    const options = getAllByTestId(/^quiz-option-/);
    const wrongOption = options.find((opt: any) => opt.props.testID !== 'quiz-option-correct');
    fireEvent.press(wrongOption!);
  }

  // Press CHECK
  await waitFor(() => {
    expect(getByTestId('quiz-check-button')).toBeTruthy();
  });
  fireEvent.press(getByTestId('quiz-check-button'));

  // Press CONTINUE on feedback banner
  await waitFor(() => {
    expect(getByTestId('quiz-continue-button')).toBeTruthy();
  });
  fireEvent.press(getByTestId('quiz-continue-button'));
}

describe('QuizScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ lessonId: 'l1' });
    useAuthStore.setState({ user: { id: 'user-123' } as any });
  });

  // --- Task 1: Quiz Screen Shell ---

  it('renders loading state initially', () => {
    const mockSingle = jest.fn().mockReturnValue(new Promise(() => {}));
    const mockOrder = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByTestId } = render(<QuizScreen />, { wrapper: createWrapper() });
    expect(getByTestId('quiz-loading')).toBeTruthy();
  });

  it('fetches lesson data using lessonId from route params', async () => {
    const { mockEq } = setupLessonMock();

    render(<QuizScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('lessons');
      expect(mockEq).toHaveBeenCalledWith('id', 'l1');
    });
  });

  it('renders error state when fetch fails', async () => {
    setupLessonMock(null, { message: 'Network error' });

    const { getByTestId } = render(<QuizScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('quiz-error')).toBeTruthy();
    });
  });

  it('shows close button to exit quiz', async () => {
    setupLessonMock();

    const { getByTestId } = render(<QuizScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('quiz-close-button')).toBeTruthy();
    });
  });

  it('navigates back when close button pressed', async () => {
    setupLessonMock();

    const { getByTestId } = render(<QuizScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('quiz-close-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('quiz-close-button'));
    expect(router.back).toHaveBeenCalled();
  });

  // --- Task 2: QuizCard Display ---

  it('displays Arabic word prominently on quiz card', async () => {
    setupLessonMock();

    const { getByTestId } = render(<QuizScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('quiz-arabic-word')).toBeTruthy();
    });
  });

  it('displays 4 answer options', async () => {
    setupLessonMock();

    const { getAllByTestId } = render(<QuizScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      const options = getAllByTestId(/^quiz-option-/);
      expect(options.length).toBe(4);
    });
  });

  // --- Task 3: Progress Bar ---

  it('shows progress bar with question count', async () => {
    setupLessonMock();

    const { getByTestId } = render(<QuizScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('quiz-progress-bar')).toBeTruthy();
    });
  });

  // --- Select-Check-Continue Flow ---

  it('shows CHECK button after selecting an option', async () => {
    setupLessonMock();

    const { getByTestId } = render(<QuizScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('quiz-option-correct')).toBeTruthy();
    });

    fireEvent.press(getByTestId('quiz-option-correct'));

    await waitFor(() => {
      expect(getByTestId('quiz-check-button')).toBeTruthy();
    });
  });

  it('shows correct feedback banner after CHECK on correct answer', async () => {
    setupLessonMock();

    const { getByTestId } = render(<QuizScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('quiz-option-correct')).toBeTruthy();
    });

    // Select correct option
    fireEvent.press(getByTestId('quiz-option-correct'));

    // Press CHECK
    await waitFor(() => {
      expect(getByTestId('quiz-check-button')).toBeTruthy();
    });
    fireEvent.press(getByTestId('quiz-check-button'));

    // Feedback banner should appear
    await waitFor(() => {
      expect(getByTestId('quiz-feedback-correct')).toBeTruthy();
    });
  });

  it('shows incorrect feedback banner after CHECK on wrong answer', async () => {
    setupLessonMock();

    const { getAllByTestId, getByTestId } = render(<QuizScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAllByTestId(/^quiz-option-/).length).toBe(4);
    });

    // Select wrong option
    const options = getAllByTestId(/^quiz-option-/);
    const wrongOption = options.find((opt) => opt.props.testID !== 'quiz-option-correct');
    fireEvent.press(wrongOption!);

    // Press CHECK
    await waitFor(() => {
      expect(getByTestId('quiz-check-button')).toBeTruthy();
    });
    fireEvent.press(getByTestId('quiz-check-button'));

    // Incorrect feedback banner should appear with correct answer
    await waitFor(() => {
      expect(getByTestId('quiz-feedback-incorrect')).toBeTruthy();
      expect(getByTestId('feedback-correct-answer')).toBeTruthy();
    });
  });

  it('advances to next question after CONTINUE', async () => {
    setupLessonMock();

    const { getByTestId, getByText, getAllByTestId } = render(<QuizScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('quiz-option-correct')).toBeTruthy();
    });

    await answerQuestion(getByTestId, getAllByTestId, true);

    await waitFor(() => {
      expect(getByText(/Question 2 of 4/)).toBeTruthy();
    });
  });

  // --- Task 8: State Management ---

  it('tracks score throughout quiz', async () => {
    setupLessonMock();

    const { getByTestId, getAllByTestId } = render(<QuizScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('quiz-option-correct')).toBeTruthy();
    });

    // Answer correctly: select → CHECK → CONTINUE
    fireEvent.press(getByTestId('quiz-option-correct'));
    await waitFor(() => expect(getByTestId('quiz-check-button')).toBeTruthy());
    fireEvent.press(getByTestId('quiz-check-button'));

    await waitFor(() => {
      expect(getByTestId('quiz-score')).toBeTruthy();
    });
  });

  it('prevents selecting another option after CHECK', async () => {
    setupLessonMock();

    const { getAllByTestId, getByTestId } = render(<QuizScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAllByTestId(/^quiz-option-/).length).toBe(4);
    });

    // Select and CHECK
    fireEvent.press(getByTestId('quiz-option-correct'));
    await waitFor(() => expect(getByTestId('quiz-check-button')).toBeTruthy());
    fireEvent.press(getByTestId('quiz-check-button'));

    // All options should be disabled
    await waitFor(() => {
      const options = getAllByTestId(/^quiz-option-/);
      options.forEach((opt) => {
        expect(opt.props.accessibilityState?.disabled || opt.props.disabled).toBeTruthy();
      });
    });
  });

  // --- H1: Quiz Completion Screen ---

  it('shows quiz results screen after answering all questions', async () => {
    setupLessonMock();

    const { getByTestId, getAllByTestId } = render(<QuizScreen />, {
      wrapper: createWrapper(),
    });

    // Answer all 4 questions correctly
    for (let i = 0; i < 4; i++) {
      await waitFor(() => {
        expect(getByTestId('quiz-option-correct')).toBeTruthy();
      });
      await answerQuestion(getByTestId, getAllByTestId, true);
    }

    // Should show results screen
    await waitFor(() => {
      expect(getByTestId('quiz-complete')).toBeTruthy();
      expect(getByTestId('quiz-results')).toBeTruthy();
    });

    expect(getByTestId('quiz-results-score')).toBeTruthy();
    expect(getByTestId('quiz-results-percentage')).toBeTruthy();
    expect(getByTestId('quiz-results-feedback')).toBeTruthy();
    expect(getByTestId('quiz-complete-lesson-button')).toBeTruthy();
  });

  it('shows celebration animation for high score (>= 80%)', async () => {
    setupLessonMock();

    const { getByTestId, getAllByTestId } = render(<QuizScreen />, {
      wrapper: createWrapper(),
    });

    // Answer all 4 questions correctly (100%)
    for (let i = 0; i < 4; i++) {
      await waitFor(() => {
        expect(getByTestId('quiz-option-correct')).toBeTruthy();
      });
      await answerQuestion(getByTestId, getAllByTestId, true);
    }

    await waitFor(() => {
      expect(getByTestId('quiz-celebration-animation')).toBeTruthy();
    });
  });

  it('completes lesson and navigates back when Complete Lesson pressed', async () => {
    setupLessonMock();

    const { getByTestId, getAllByTestId } = render(<QuizScreen />, {
      wrapper: createWrapper(),
    });

    // Answer all 4 questions correctly
    for (let i = 0; i < 4; i++) {
      await waitFor(() => {
        expect(getByTestId('quiz-option-correct')).toBeTruthy();
      });
      await answerQuestion(getByTestId, getAllByTestId, true);
    }

    await waitFor(() => {
      expect(getByTestId('quiz-complete-lesson-button')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('quiz-complete-lesson-button'));
    });

    await waitFor(() => {
      expect(markLessonComplete).toHaveBeenCalledWith('user-123', 'l1');
      expect(router.back).toHaveBeenCalled();
    });
  });

  it('initializes word progress for all words on completion', async () => {
    setupLessonMock();

    const { getByTestId, getAllByTestId } = render(<QuizScreen />, {
      wrapper: createWrapper(),
    });

    // Answer all 4 questions correctly
    for (let i = 0; i < 4; i++) {
      await waitFor(() => {
        expect(getByTestId('quiz-option-correct')).toBeTruthy();
      });
      await answerQuestion(getByTestId, getAllByTestId, true);
    }

    await waitFor(() => {
      expect(getByTestId('quiz-complete-lesson-button')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('quiz-complete-lesson-button'));
    });

    await waitFor(() => {
      expect(initializeWordProgress).toHaveBeenCalledTimes(4);
      expect(initializeWordProgress).toHaveBeenCalledWith('user-123', 'w1', true);
      expect(initializeWordProgress).toHaveBeenCalledWith('user-123', 'w2', true);
      expect(initializeWordProgress).toHaveBeenCalledWith('user-123', 'w3', true);
      expect(initializeWordProgress).toHaveBeenCalledWith('user-123', 'w4', true);
    });
  });

  it('tracks quiz analytics on completion', async () => {
    setupLessonMock();

    const { getByTestId, getAllByTestId } = render(<QuizScreen />, {
      wrapper: createWrapper(),
    });

    // Answer all 4 correctly
    for (let i = 0; i < 4; i++) {
      await waitFor(() => {
        expect(getByTestId('quiz-option-correct')).toBeTruthy();
      });
      await answerQuestion(getByTestId, getAllByTestId, true);
    }

    await waitFor(() => {
      expect(getByTestId('quiz-complete-lesson-button')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('quiz-complete-lesson-button'));
    });

    await waitFor(() => {
      expect(trackQuizCompleted).toHaveBeenCalledWith(
        expect.objectContaining({
          lessonId: 'l1',
          score: 4,
          totalQuestions: 4,
          percentage: 100,
        })
      );
    });
  });

  // --- H2: Flagged Word Tracking ---

  it('flags incorrectly answered word for additional review', async () => {
    setupLessonMock();

    const { getAllByTestId, getByTestId } = render(<QuizScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAllByTestId(/^quiz-option-/).length).toBe(4);
    });

    // Answer first question wrong
    await answerQuestion(getByTestId, getAllByTestId, false);

    // Answer remaining 3 questions correctly
    for (let i = 0; i < 3; i++) {
      await waitFor(() => {
        expect(getByTestId('quiz-option-correct')).toBeTruthy();
      });
      await answerQuestion(getByTestId, getAllByTestId, true);
    }

    // Should show completion with score 3/4 (75%)
    await waitFor(() => {
      expect(getByTestId('quiz-complete')).toBeTruthy();
      expect(getByTestId('quiz-results-score')).toBeTruthy();
    });
  });

  it('marks incorrect words with wasCorrect=false in word progress', async () => {
    setupLessonMock();

    const { getAllByTestId, getByTestId } = render(<QuizScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAllByTestId(/^quiz-option-/).length).toBe(4);
    });

    // Answer first question wrong
    await answerQuestion(getByTestId, getAllByTestId, false);

    // Answer remaining 3 correctly
    for (let i = 0; i < 3; i++) {
      await waitFor(() => {
        expect(getByTestId('quiz-option-correct')).toBeTruthy();
      });
      await answerQuestion(getByTestId, getAllByTestId, true);
    }

    await waitFor(() => {
      expect(getByTestId('quiz-complete-lesson-button')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('quiz-complete-lesson-button'));
    });

    await waitFor(() => {
      // First word was answered incorrectly
      expect(initializeWordProgress).toHaveBeenCalledWith('user-123', 'w1', false);
      // Others were correct
      expect(initializeWordProgress).toHaveBeenCalledWith('user-123', 'w2', true);
      expect(initializeWordProgress).toHaveBeenCalledWith('user-123', 'w3', true);
      expect(initializeWordProgress).toHaveBeenCalledWith('user-123', 'w4', true);
    });
  });
});
