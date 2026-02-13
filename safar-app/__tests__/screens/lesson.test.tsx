import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import LessonScreen from '@/app/lesson/[id]';
import { supabase } from '@/lib/api/supabase';
import { useLearningStore } from '@/lib/stores/useLearningStore';
import { markLessonComplete } from '@/lib/api/progress';
import { useAuthStore } from '@/lib/stores/useAuthStore';

jest.mock('@/lib/api/progress', () => ({
  markLessonComplete: jest.fn(() => Promise.resolve({ success: true })),
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
    audio_url: 'https://example.com/bismi.mp3',
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
    audio_url: 'https://example.com/allahi.mp3',
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
];

const mockLessonData = {
  id: 'l1',
  unit_id: 'u1',
  name: 'Bismillah',
  order: 1,
  word_count: 3,
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

describe('LessonScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'l1' });
    // Reset Zustand store between tests
    useLearningStore.getState().resetLesson();
    // Set up auth store with a mock user
    useAuthStore.setState({ user: { id: 'user-123' } as any });
    // Reset markLessonComplete mock
    (markLessonComplete as jest.Mock).mockImplementation(() => Promise.resolve({ success: true }));
  });

  it('renders loading state initially', () => {
    const mockSingle = jest.fn().mockReturnValue(new Promise(() => {}));
    const mockOrder = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByTestId } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('lesson-loading')).toBeTruthy();
  });

  it('fetches lesson data using ID from route params', async () => {
    const { mockEq } = setupLessonMock();

    render(<LessonScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('lessons');
      expect(mockEq).toHaveBeenCalledWith('id', 'l1');
    });
  });

  it('displays first word card after loading', async () => {
    setupLessonMock();

    const { getAllByText, getByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      // Arabic appears in both verse area and analysis panel
      expect(getAllByText('بِسْمِ')[0]).toBeTruthy();
      expect(getByText('In the name of')).toBeTruthy();
    });
  });

  it('shows progress indicator "1/3"', async () => {
    setupLessonMock();

    const { getByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('1/3')).toBeTruthy();
    });
  });

  it('renders error state when fetch fails', async () => {
    setupLessonMock(null, { message: 'Network error' });

    const { getByTestId } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('lesson-error')).toBeTruthy();
    });
  });

  it('shows close button to exit lesson', async () => {
    setupLessonMock();

    const { getByTestId } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('close-button')).toBeTruthy();
    });
  });

  it('navigates back when close button pressed', async () => {
    setupLessonMock();

    const { getByTestId } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('close-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('close-button'));
    expect(router.back).toHaveBeenCalled();
  });

  it('shows Next button', async () => {
    setupLessonMock();

    const { getByTestId } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('next-button')).toBeTruthy();
    });
  });

  it('advances to next word when Next pressed', async () => {
    setupLessonMock();

    const { getByTestId, getAllByText, getByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAllByText('بِسْمِ')[0]).toBeTruthy();
    });

    fireEvent.press(getByTestId('next-button'));

    await waitFor(() => {
      expect(getAllByText('اللَّهِ')[0]).toBeTruthy();
      expect(getByText('2/3')).toBeTruthy();
    });
  });

  it('shows Previous button on second word', async () => {
    setupLessonMock();

    const { getByTestId, getAllByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAllByText('بِسْمِ')[0]).toBeTruthy();
    });

    fireEvent.press(getByTestId('next-button'));

    await waitFor(() => {
      expect(getByTestId('previous-button')).toBeTruthy();
    });
  });

  it('does not show Previous button on first word', async () => {
    setupLessonMock();

    const { queryByTestId, getAllByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAllByText('بِسْمِ')[0]).toBeTruthy();
    });

    expect(queryByTestId('previous-button')).toBeNull();
  });

  it('navigates to previous word when Previous pressed', async () => {
    setupLessonMock();

    const { getByTestId, getAllByText, getByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAllByText('بِسْمِ')[0]).toBeTruthy();
    });

    // Go to word 2
    fireEvent.press(getByTestId('next-button'));
    await waitFor(() => expect(getAllByText('اللَّهِ')[0]).toBeTruthy());

    // Go back to word 1
    fireEvent.press(getByTestId('previous-button'));
    await waitFor(() => {
      expect(getAllByText('بِسْمِ')[0]).toBeTruthy();
      expect(getByText('1/3')).toBeTruthy();
    });
  });

  it('shows lesson completion on last word Next press', async () => {
    setupLessonMock();

    const { getByTestId, getAllByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(getAllByText('بِسْمِ')[0]).toBeTruthy());

    // Navigate to last word
    fireEvent.press(getByTestId('next-button'));
    await waitFor(() => expect(getAllByText('اللَّهِ')[0]).toBeTruthy());

    fireEvent.press(getByTestId('next-button'));
    await waitFor(() => expect(getAllByText('الرَّحْمَنِ')[0]).toBeTruthy());

    // Press next on last word
    fireEvent.press(getByTestId('next-button'));

    await waitFor(() => {
      expect(getByTestId('lesson-complete')).toBeTruthy();
    });
  });

  it('shows lesson name', async () => {
    setupLessonMock();

    const { getByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Bismillah')).toBeTruthy();
    });
  });

  it('renders swipeable card area', async () => {
    setupLessonMock();

    const { getByTestId } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('swipe-area')).toBeTruthy();
    });
  });

  it('shows progress bar', async () => {
    setupLessonMock();

    const { getByTestId } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('progress-bar')).toBeTruthy();
    });
  });

  it('shows Complete text on next button when on last word', async () => {
    setupLessonMock();

    const { getByTestId, getAllByText, getByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(getAllByText('بِسْمِ')[0]).toBeTruthy());

    // Navigate to last word
    fireEvent.press(getByTestId('next-button'));
    await waitFor(() => expect(getAllByText('اللَّهِ')[0]).toBeTruthy());

    fireEvent.press(getByTestId('next-button'));
    await waitFor(() => {
      expect(getByText('Complete')).toBeTruthy();
    });
  });

  it('shows finish button on completion screen', async () => {
    setupLessonMock();

    const { getByTestId, getAllByText, getByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(getAllByText('بِسْمِ')[0]).toBeTruthy());

    // Navigate through all words
    fireEvent.press(getByTestId('next-button'));
    await waitFor(() => expect(getAllByText('اللَّهِ')[0]).toBeTruthy());
    fireEvent.press(getByTestId('next-button'));
    await waitFor(() => expect(getAllByText('الرَّحْمَنِ')[0]).toBeTruthy());
    fireEvent.press(getByTestId('next-button'));

    await waitFor(() => {
      expect(getByTestId('finish-button')).toBeTruthy();
      expect(getByText('Lesson Complete')).toBeTruthy();
    });
  });

  it('calls markLessonComplete when lesson completes', async () => {
    setupLessonMock();

    const { getByTestId, getAllByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(getAllByText('بِسْمِ')[0]).toBeTruthy());

    // Navigate through all words
    fireEvent.press(getByTestId('next-button'));
    await waitFor(() => expect(getAllByText('اللَّهِ')[0]).toBeTruthy());
    fireEvent.press(getByTestId('next-button'));
    await waitFor(() => expect(getAllByText('الرَّحْمَنِ')[0]).toBeTruthy());

    // Complete lesson
    fireEvent.press(getByTestId('next-button'));

    await waitFor(() => {
      expect(markLessonComplete).toHaveBeenCalledWith('user-123', 'l1');
    });
  });

  it('does not call markLessonComplete on regular navigation', async () => {
    setupLessonMock();

    const { getByTestId, getAllByText } = render(<LessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(getAllByText('بِسْمِ')[0]).toBeTruthy());

    fireEvent.press(getByTestId('next-button'));
    await waitFor(() => expect(getAllByText('اللَّهِ')[0]).toBeTruthy());

    expect(markLessonComplete).not.toHaveBeenCalled();
  });

  describe('resume functionality', () => {
    it('shows resume modal when returning to a lesson with saved progress', async () => {
      // Pre-set store to simulate saved progress on this lesson
      useLearningStore.setState({
        currentLessonId: 'l1',
        currentWordIndex: 1,
        isComplete: false,
      });

      setupLessonMock();

      const { getByTestId, getByText } = render(<LessonScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getByTestId('resume-modal')).toBeTruthy();
        expect(getByText(/word 2 of 3/i)).toBeTruthy();
      });
    });

    it('resumes at saved position when Resume is pressed', async () => {
      useLearningStore.setState({
        currentLessonId: 'l1',
        currentWordIndex: 1,
        isComplete: false,
      });

      setupLessonMock();

      const { getByTestId, getAllByText, getByText } = render(<LessonScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getByTestId('resume-modal')).toBeTruthy();
      });

      fireEvent.press(getByTestId('resume-button'));

      await waitFor(() => {
        // Should show the second word (index 1)
        expect(getAllByText('اللَّهِ')[0]).toBeTruthy();
        expect(getByText('2/3')).toBeTruthy();
      });
    });

    it('starts from beginning when Start Over is pressed', async () => {
      useLearningStore.setState({
        currentLessonId: 'l1',
        currentWordIndex: 1,
        isComplete: false,
      });

      setupLessonMock();

      const { getByTestId, getAllByText, getByText } = render(<LessonScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getByTestId('resume-modal')).toBeTruthy();
      });

      fireEvent.press(getByTestId('restart-button'));

      await waitFor(() => {
        // Should show the first word (index 0)
        expect(getAllByText('بِسْمِ')[0]).toBeTruthy();
        expect(getByText('1/3')).toBeTruthy();
      });
    });

    it('does not show resume modal when entering fresh lesson', async () => {
      // Store has no progress for this lesson
      useLearningStore.setState({
        currentLessonId: null,
        currentWordIndex: 0,
        isComplete: false,
      });

      setupLessonMock();

      const { queryByTestId, getAllByText } = render(<LessonScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getAllByText('بِسْمِ')[0]).toBeTruthy();
      });

      expect(queryByTestId('resume-modal')).toBeNull();
    });

    it('does not show resume modal when at index 0', async () => {
      useLearningStore.setState({
        currentLessonId: 'l1',
        currentWordIndex: 0,
        isComplete: false,
      });

      setupLessonMock();

      const { queryByTestId, getAllByText } = render(<LessonScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getAllByText('بِسْمِ')[0]).toBeTruthy();
      });

      expect(queryByTestId('resume-modal')).toBeNull();
    });

    it('shows review modal when re-entering a completed lesson', async () => {
      useLearningStore.setState({
        currentLessonId: 'l1',
        currentWordIndex: 2,
        isComplete: true,
      });

      setupLessonMock();

      const { getByTestId, getByText } = render(<LessonScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getByTestId('resume-modal')).toBeTruthy();
        expect(getByText(/reviewed all/i)).toBeTruthy();
        expect(getByTestId('review-again-button')).toBeTruthy();
      });
    });

    it('restarts lesson when Review Again is pressed on completed lesson', async () => {
      useLearningStore.setState({
        currentLessonId: 'l1',
        currentWordIndex: 2,
        isComplete: true,
      });

      setupLessonMock();

      const { getByTestId, getAllByText, getByText } = render(<LessonScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getByTestId('review-again-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('review-again-button'));

      await waitFor(() => {
        expect(getAllByText('بِسْمِ')[0]).toBeTruthy();
        expect(getByText('1/3')).toBeTruthy();
      });
    });
  });
});
