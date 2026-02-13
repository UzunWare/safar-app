import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from 'expo-router';
import ReviewSessionScreen from '@/app/review/session';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { onReviewSessionCompleted } from '@/lib/notifications/reviewNotificationOrchestrator';

jest.mock('@/lib/api/wordProgressLocal', () => ({
  saveWordProgressLocally: jest.fn().mockResolvedValue(undefined),
  getLocalWordProgress: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/lib/api/wordProgress', () => ({
  updateWordProgress: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/lib/notifications/reviewNotificationOrchestrator', () => ({
  onReviewSessionCompleted: jest.fn(() => Promise.resolve()),
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

const mockReviewItems = [
  {
    id: 'uwp-1',
    user_id: 'user-1',
    word_id: 'w1',
    ease_factor: 2.5,
    interval: 1,
    repetitions: 1,
    next_review: '2026-02-09T00:00:00Z',
    status: 'learning',
    word: {
      id: 'w1',
      arabic: '\u0628\u0650\u0633\u0652\u0645\u0650',
      transliteration: 'bismi',
      meaning: 'In the name of',
      audio_url: null,
    },
  },
  {
    id: 'uwp-2',
    user_id: 'user-1',
    word_id: 'w2',
    ease_factor: 2.36,
    interval: 6,
    repetitions: 2,
    next_review: '2026-02-08T00:00:00Z',
    status: 'learning',
    word: {
      id: 'w2',
      arabic: '\u0627\u0644\u0644\u0651\u064e\u0647\u0650',
      transliteration: 'allahi',
      meaning: 'God',
      audio_url: null,
    },
  },
];

function setupMocks(reviewData: any = mockReviewItems, reviewError: any = null) {
  // Review queue mock chain: from -> select -> eq -> lte -> order
  const mockOrder = jest.fn().mockResolvedValue({ data: reviewData, error: reviewError });
  const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
  const mockEqUserId = jest.fn().mockReturnValue({ lte: mockLte });
  const mockSelectQueue = jest.fn().mockReturnValue({ eq: mockEqUserId });

  // Word progress mock chain: from -> select -> eq(user_id) -> eq(word_id) -> maybeSingle
  const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
  const mockEqWordId = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
  const mockEqUserIdProgress = jest.fn().mockReturnValue({ eq: mockEqWordId });
  const mockSelectProgress = jest.fn().mockReturnValue({ eq: mockEqUserIdProgress });

  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'user_word_progress') {
      // Distinguish between queue query (with select containing 'word:words') and progress query
      return {
        select: jest.fn().mockImplementation((selectStr: string) => {
          if (selectStr && selectStr.includes('word:words')) {
            return { eq: mockEqUserId };
          }
          // Progress query
          return { eq: mockEqUserIdProgress };
        }),
      };
    }
    return { select: jest.fn().mockReturnValue({ eq: jest.fn() }) };
  });

  return { mockOrder, mockLte, mockMaybeSingle };
}

function setupPendingMock() {
  const mockOrder = jest.fn().mockReturnValue(new Promise(() => {}));
  const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
  const mockEq = jest.fn().mockReturnValue({ lte: mockLte });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
  (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
}

describe('ReviewSessionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: { id: 'user-1' } as any });
  });

  // --- Task 5: Review session screen ---

  it('renders loading state while fetching', () => {
    setupPendingMock();

    const { getByTestId } = render(<ReviewSessionScreen />, { wrapper: createWrapper() });
    expect(getByTestId('review-session-loading')).toBeTruthy();
  });

  it('renders error state on fetch failure', async () => {
    const mockOrder = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Network error' } });
    const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
    const mockEq = jest.fn().mockReturnValue({ lte: mockLte });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByTestId } = render(<ReviewSessionScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('review-session-error')).toBeTruthy();
    });
  });

  it('shows review session with close button and progress', async () => {
    setupMocks();

    const { getByTestId, getByText } = render(<ReviewSessionScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('review-session')).toBeTruthy();
    });

    expect(getByTestId('review-session-close')).toBeTruthy();
    expect(getByTestId('review-session-progress')).toBeTruthy();
    expect(getByText('1 / 2')).toBeTruthy();
  });

  it('navigates back when close button pressed', async () => {
    setupMocks();

    const { getByTestId } = render(<ReviewSessionScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('review-session-close')).toBeTruthy();
    });

    fireEvent.press(getByTestId('review-session-close'));
    expect(router.back).toHaveBeenCalled();
  });

  // --- Task 6: Review card with reveal ---

  it('displays review card with Arabic word', async () => {
    setupMocks();

    const { getByTestId } = render(<ReviewSessionScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('review-card')).toBeTruthy();
    });

    expect(getByTestId('review-card-arabic')).toBeTruthy();
    expect(getByTestId('review-card-prompt')).toBeTruthy();
  });

  it('reveals meaning when card is tapped', async () => {
    setupMocks();

    const { getByTestId } = render(<ReviewSessionScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('review-card')).toBeTruthy();
    });

    fireEvent.press(getByTestId('review-card'));

    await waitFor(() => {
      expect(getByTestId('review-card-revealed')).toBeTruthy();
      expect(getByTestId('review-card-transliteration')).toBeTruthy();
      expect(getByTestId('review-card-meaning')).toBeTruthy();
    });
  });

  // --- Task 7: Difficulty rating integration ---

  it('shows difficulty rating after card is revealed', async () => {
    setupMocks();

    const { getByTestId } = render(<ReviewSessionScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('review-card')).toBeTruthy();
    });

    // Reveal the card
    fireEvent.press(getByTestId('review-card'));

    await waitFor(() => {
      expect(getByTestId('review-rating-section')).toBeTruthy();
      expect(getByTestId('difficulty-rating')).toBeTruthy();
    });
  });

  // --- Task 9: Completion ---

  it('shows completion screen after reviewing all cards', async () => {
    setupMocks();

    const { getByTestId, getByText } = render(<ReviewSessionScreen />, {
      wrapper: createWrapper(),
    });

    // Review first card
    await waitFor(() => {
      expect(getByTestId('review-card')).toBeTruthy();
    });
    fireEvent.press(getByTestId('review-card'));

    await waitFor(() => {
      expect(getByTestId('difficulty-rating')).toBeTruthy();
    });

    // Rate "Good"
    fireEvent.press(getByText('Good'));

    // Wait for second card
    await waitFor(() => {
      expect(getByText('2 / 2')).toBeTruthy();
    });

    // Reveal and rate second card
    fireEvent.press(getByTestId('review-card'));

    await waitFor(() => {
      expect(getByTestId('difficulty-rating')).toBeTruthy();
    });

    fireEvent.press(getByText('Good'));

    // Should show completion
    await waitFor(() => {
      expect(getByTestId('review-results')).toBeTruthy();
      expect(getByTestId('review-results-count')).toBeTruthy();
      expect(getByTestId('xp-gain-animation')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
    });

    expect(onReviewSessionCompleted).toHaveBeenCalledWith('user-1');
  });

  it('shows Done button on completion that navigates to review tab', async () => {
    setupMocks();

    const { getByTestId, getByText } = render(<ReviewSessionScreen />, {
      wrapper: createWrapper(),
    });

    // Complete both reviews
    await waitFor(() => {
      expect(getByTestId('review-card')).toBeTruthy();
    });

    fireEvent.press(getByTestId('review-card'));
    await waitFor(() => expect(getByTestId('difficulty-rating')).toBeTruthy());
    fireEvent.press(getByText('Good'));

    await waitFor(() => expect(getByText('2 / 2')).toBeTruthy());
    fireEvent.press(getByTestId('review-card'));
    await waitFor(() => expect(getByTestId('difficulty-rating')).toBeTruthy());
    fireEvent.press(getByText('Good'));

    await waitFor(() => {
      expect(getByTestId('review-done-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('review-done-button'));
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/review');
  });
});
