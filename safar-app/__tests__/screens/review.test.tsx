import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from 'expo-router';
import ReviewScreen from '@/app/(tabs)/review';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';

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

function setupReviewQueueMock(data: any = mockReviewItems, error: any = null) {
  const mockOrder = jest.fn().mockResolvedValue({ data, error });
  const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
  const mockEq = jest.fn().mockReturnValue({ lte: mockLte });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
  (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
  return { mockSelect, mockEq, mockLte, mockOrder };
}

function setupPendingMock() {
  const mockOrder = jest.fn().mockReturnValue(new Promise(() => {}));
  const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
  const mockEq = jest.fn().mockReturnValue({ lte: mockLte });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
  (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
}

describe('ReviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: { id: 'user-1' } as any });
  });

  // --- Task 1: Review tab screen ---

  it('renders loading state while fetching', () => {
    setupPendingMock();

    const { getByTestId } = render(<ReviewScreen />, { wrapper: createWrapper() });
    expect(getByTestId('review-loading')).toBeTruthy();
  });

  // --- Task 3: Review count display ---

  it('shows due review count prominently', async () => {
    setupReviewQueueMock();

    const { getByTestId, getByText } = render(<ReviewScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('review-count-card')).toBeTruthy();
    });

    expect(getByTestId('review-due-count')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('words ready for review')).toBeTruthy();
  });

  // --- Task 4: Start Review button ---

  it('shows Start Review button when reviews are due', async () => {
    setupReviewQueueMock();

    const { getByTestId } = render(<ReviewScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('review-start-button')).toBeTruthy();
    });
  });

  it('navigates to review session when Start Review pressed', async () => {
    setupReviewQueueMock();

    const { getByTestId } = render(<ReviewScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('review-start-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('review-start-button'));
    expect(router.push).toHaveBeenCalledWith('/review/session');
  });

  // --- Task 8: Empty state ---

  it('shows empty state when no reviews are due', async () => {
    setupReviewQueueMock([]);

    const { getByTestId, getByText } = render(<ReviewScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('review-empty')).toBeTruthy();
    });

    expect(getByTestId('review-empty-title')).toBeTruthy();
    expect(getByText('All caught up!')).toBeTruthy();
  });

  it('shows Continue Learning button in empty state', async () => {
    setupReviewQueueMock([]);

    const { getByTestId } = render(<ReviewScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByTestId('review-continue-learning')).toBeTruthy();
    });

    fireEvent.press(getByTestId('review-continue-learning'));
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/learn');
  });
});
