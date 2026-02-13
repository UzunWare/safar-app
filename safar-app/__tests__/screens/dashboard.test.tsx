import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert } from 'react-native';
import HomeScreen from '@/app/(tabs)/index';

jest.mock('expo-router', () => {
  const mockPush = jest.fn();
  return {
    __mockPush: mockPush,
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    }),
  };
});

const { __mockPush: mockPush } = require('expo-router');

// Mock react-native-reanimated (used by ProgressRing)
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: {
      View: View,
      createAnimatedComponent: (component: any) => component,
    },
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedProps: jest.fn(() => ({})),
    useSharedValue: (initial: any) => ({ value: initial }),
    withSpring: jest.fn((val: any) => val),
    withTiming: jest.fn((val: any) => val),
    withRepeat: jest.fn((val: any) => val),
    withSequence: jest.fn((...args: any[]) => args[0]),
    withDelay: jest.fn((_delay: any, val: any) => val),
    Easing: {
      inOut: jest.fn(() => jest.fn()),
      out: jest.fn(() => jest.fn()),
      ease: {},
      cubic: {},
    },
    runOnJS: (fn: any) => fn,
  };
});

// Mock react-native-svg (used by ProgressRing + ScreenBackground)
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

// Mock hooks
jest.mock('@/lib/hooks/usePathway', () => ({
  usePathway: jest.fn(() => ({
    data: {
      id: 'salah-first',
      name: 'Salah First',
      description: 'Learn the words of your daily prayers',
      units: [
        { id: 'u1', pathway_id: 'salah-first', name: 'Al-Fatiha', order: 1, word_count: 20 },
        { id: 'u2', pathway_id: 'salah-first', name: "Ruku' & Sujud", order: 2, word_count: 18 },
      ],
    },
    isLoading: false,
  })),
  SALAH_FIRST_PATHWAY_ID: 'salah-first',
}));

jest.mock('@/lib/hooks/useProgress', () => ({
  useProgress: jest.fn(() => ({
    completedLessons: 5,
    totalLessons: 30,
    pathwayPercent: 35,
    isLessonComplete: () => false,
    isUnitComplete: () => false,
    unitPercent: () => 0,
    isLoading: false,
    completedLessonIds: new Set(),
    nextLessonId: 'l6',
  })),
}));

jest.mock('@/lib/hooks/useLearningStateSummary', () => ({
  useLearningStateSummary: jest.fn(() => ({
    data: { new: 50, learning: 20, review: 15, mastered: 12 },
    isLoading: false,
  })),
}));

jest.mock('@/lib/hooks/useMasteredCount', () => ({
  useMasteredCount: jest.fn(() => ({
    data: 12,
    isLoading: false,
  })),
}));

jest.mock('@/lib/hooks/useWordOfTheDay', () => ({
  useWordOfTheDay: jest.fn(() => ({
    data: {
      id: 'w-bismi',
      arabic: 'بِسْمِ',
      transliteration: 'bismi',
      meaning: 'In the name of',
      audio_url: 'https://audio.qurancdn.com/wbw/001_001_001.mp3',
    },
    isLoading: false,
  })),
}));

const mockAudioButton = jest.fn(() => null);
jest.mock('@/components/learning/AudioButton', () => ({
  AudioButton: (props: any) => mockAudioButton(props),
}));

jest.mock('@/lib/hooks/useStreak', () => ({
  useStreak: jest.fn(() => ({
    currentStreak: 5,
    longestStreak: 10,
    status: 'active',
    lastActivityDate: null,
    freezeUsedAt: null,
    freezeAvailable: true,
    nextFreezeDate: null,
    isLoading: false,
    recordActivity: jest.fn(),
    useFreeze: jest.fn(),
  })),
}));

const { useStreak } = require('@/lib/hooks/useStreak');
const mockUseStreak = useStreak as jest.Mock;

function defaultStreakMock() {
  return {
    currentStreak: 5,
    longestStreak: 10,
    status: 'active',
    lastActivityDate: null,
    freezeUsedAt: null,
    freezeAvailable: true,
    nextFreezeDate: null,
    isLoading: false,
    recordActivity: jest.fn(),
    useFreeze: jest.fn(),
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('HomeScreen - Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockUseStreak.mockReturnValue(defaultStreakMock());
  });

  // Task 1: Home tab renders
  it('renders the home screen with dashboard testID', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByTestId('home-screen')).toBeTruthy();
  });

  it('renders the header with "Your Journey" title', () => {
    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByText('Your Journey')).toBeTruthy();
  });

  it('renders settings button', () => {
    const { getByLabelText } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByLabelText('Settings')).toBeTruthy();
  });

  // Task 2: ProgressRing
  it('displays pathway progress ring', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByTestId('progress-ring')).toBeTruthy();
  });

  // Task 3: StreakCounter
  it('displays streak counter', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByTestId('streak-counter')).toBeTruthy();
  });

  it('displays streak label', () => {
    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByText('Day Streak')).toBeTruthy();
  });

  // Task 4: Progress metrics display
  it('displays words learned count', () => {
    const { getByTestId, getByText } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByTestId('words-learned-count')).toBeTruthy();
    expect(getByText('Words Learned')).toBeTruthy();
  });

  it('displays mastered words count', () => {
    const { getByTestId, getByText } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByTestId('mastered-count')).toBeTruthy();
    expect(getByText('Mastered')).toBeTruthy();
  });

  it('shows correct words learned value from aggregated stats', () => {
    // learning(20) + review(15) + mastered(12) = 47
    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByText('47')).toBeTruthy();
  });

  it('shows correct mastered count value', () => {
    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByText('12')).toBeTruthy();
  });

  // Task 8: Continue Learning CTA
  it('displays continue learning CTA', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByTestId('continue-learning-cta')).toBeTruthy();
  });

  it('shows continue learning text', () => {
    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByText('Continue Learning')).toBeTruthy();
    expect(getByText('Next Lesson')).toBeTruthy();
  });

  it('navigates when continue CTA is tapped', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() });
    fireEvent.press(getByTestId('continue-learning-cta'));
    expect(mockPush).toHaveBeenCalledWith('/lesson/l6');
  });

  it('opens progress details when progress ring is tapped', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() });
    fireEvent.press(getByTestId('progress-ring-card'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/progress');
  });

  it('opens progress details when streak card is tapped', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() });
    fireEvent.press(getByTestId('streak-counter-card'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/progress');
  });

  it('opens progress details when words learned card is tapped', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() });
    fireEvent.press(getByTestId('words-learned-count'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/progress');
  });

  it('opens progress details when mastered card is tapped', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() });
    fireEvent.press(getByTestId('mastered-count'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/progress');
  });

  // Word of the Day
  it('displays word of the day card with database word', () => {
    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByText('Word of the Day')).toBeTruthy();
    expect(getByText('بِسْمِ')).toBeTruthy();
    expect(getByText(/bismi/)).toBeTruthy();
    expect(getByText(/In the name of/)).toBeTruthy();
  });

  it('renders AudioButton with correct audio URL in word of the day card', () => {
    render(<HomeScreen />, { wrapper: createWrapper() });
    expect(mockAudioButton).toHaveBeenCalledWith(
      expect.objectContaining({
        audioUrl: 'https://audio.qurancdn.com/wbw/001_001_001.mp3',
      })
    );
  });

  it('hides word of the day when no data available', () => {
    const { useWordOfTheDay } = require('@/lib/hooks/useWordOfTheDay');
    useWordOfTheDay.mockReturnValue({ data: null, isLoading: false });

    const { queryByText } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(queryByText('Word of the Day')).toBeNull();
  });

  it('displays pathway hero card', () => {
    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByText('Salah First')).toBeTruthy();
  });

  it('shows success confirmation after using streak freeze', async () => {
    const mockUseFreeze = jest.fn().mockResolvedValue(undefined);
    mockUseStreak.mockReturnValue({
      ...defaultStreakMock(),
      status: 'at-risk',
      currentStreak: 3,
      useFreeze: mockUseFreeze,
    });

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByTestId, getByText } = render(<HomeScreen />, { wrapper: createWrapper() });
    fireEvent.press(getByTestId('streak-freeze-button'));
    fireEvent.press(getByText('Use Freeze'));

    await waitFor(() => {
      expect(mockUseFreeze).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Streak preserved! Learn tomorrow to continue.');
    });

    alertSpy.mockRestore();
  });

  // Empty state
  it('shows empty state when no pathway data', () => {
    const { usePathway } = require('@/lib/hooks/usePathway');
    usePathway.mockReturnValue({ data: null, isLoading: false });

    const { getByText, queryByTestId } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(getByText('Start Your Journey')).toBeTruthy();
    // No progress stats when no pathway
    expect(queryByTestId('progress-ring')).toBeNull();
    expect(queryByTestId('streak-counter')).toBeNull();
    expect(queryByTestId('continue-learning-cta')).toBeNull();
  });

  it('hides continue CTA when no next lesson', () => {
    const { useProgress } = require('@/lib/hooks/useProgress');
    useProgress.mockReturnValue({
      completedLessons: 30,
      totalLessons: 30,
      pathwayPercent: 100,
      isLessonComplete: () => true,
      isUnitComplete: () => true,
      unitPercent: () => 100,
      isLoading: false,
      completedLessonIds: new Set(),
      nextLessonId: null,
    });

    const { queryByTestId } = render(<HomeScreen />, { wrapper: createWrapper() });
    expect(queryByTestId('continue-learning-cta')).toBeNull();
  });
});
