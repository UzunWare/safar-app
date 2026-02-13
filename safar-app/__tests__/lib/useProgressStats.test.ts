import { renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProgressStats } from '@/lib/hooks/useProgressStats';

let mockUserId: string | null = 'user-1';

jest.mock('@/lib/stores/useAuthStore', () => ({
  useAuthStore: (selector: (state: { user: { id: string } | null }) => unknown) =>
    selector({ user: mockUserId ? { id: mockUserId } : null }),
}));

jest.mock('@/lib/hooks/useLearningStateSummary', () => ({
  useLearningStateSummary: jest.fn(() => ({
    data: { new: 50, learning: 20, review: 15, mastered: 12 },
    isLoading: false,
  })),
}));

jest.mock('@/lib/hooks/useMasteredCount', () => ({
  useMasteredCount: jest.fn(() => ({
    data: 8,
    isLoading: false,
  })),
}));

jest.mock('@/lib/hooks/useStreak', () => ({
  useStreak: jest.fn(() => ({
    currentStreak: 4,
    longestStreak: 7,
    status: 'active',
    lastActivityDate: '2026-02-12',
    isLoading: false,
    recordActivity: jest.fn(),
  })),
}));

describe('useProgressStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserId = 'user-1';
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('aggregates words learned from learning, review, and mastered counts', () => {
    const { result } = renderHook(() => useProgressStats());
    // learning(20) + review(15) + mastered(12) = 47
    expect(result.current.wordsLearned).toBe(47);
  });

  it('returns mastered count from useMasteredCount', () => {
    const { result } = renderHook(() => useProgressStats());
    expect(result.current.wordsMastered).toBe(8);
  });

  it('returns current streak from useStreak hook', () => {
    const { result } = renderHook(() => useProgressStats());
    expect(result.current.currentStreak).toBe(4);
  });

  it('returns isLoading false when all data loaded', () => {
    const { result } = renderHook(() => useProgressStats());
    expect(result.current.isLoading).toBe(false);
  });

  it('returns pathway percentage from current progress input', () => {
    const { result } = renderHook(() => useProgressStats(35, false));
    expect(result.current.pathwayPercentage).toBe(35);
  });

  it('returns isLoading true when learning state is loading', () => {
    const { useLearningStateSummary } = require('@/lib/hooks/useLearningStateSummary');
    useLearningStateSummary.mockReturnValue({ data: null, isLoading: true });

    const { result } = renderHook(() => useProgressStats());
    expect(result.current.isLoading).toBe(true);
  });

  it('returns 0 words learned when no data', () => {
    const { useLearningStateSummary } = require('@/lib/hooks/useLearningStateSummary');
    useLearningStateSummary.mockReturnValue({ data: null, isLoading: false });

    const { result } = renderHook(() => useProgressStats());
    expect(result.current.wordsLearned).toBe(0);
  });

  it('returns 0 mastered when no data', () => {
    const { useMasteredCount } = require('@/lib/hooks/useMasteredCount');
    useMasteredCount.mockReturnValue({ data: null, isLoading: false });

    const { result } = renderHook(() => useProgressStats());
    expect(result.current.wordsMastered).toBe(0);
  });

  // Task 7: Offline caching tests
  it('attempts to load cache from AsyncStorage on mount', () => {
    renderHook(() => useProgressStats());
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@safar/progress_stats/user-1');
  });

  it('returns lastSynced as null when no cache exists', () => {
    const { result } = renderHook(() => useProgressStats());
    expect(result.current.lastSynced).toBeNull();
  });

  it('loads cached stats and provides lastSynced', async () => {
    const cached = JSON.stringify({
      wordsLearned: 30,
      wordsMastered: 5,
      currentStreak: 0,
      pathwayPercentage: 42,
      lastSynced: '2026-02-10T12:00:00.000Z',
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(cached);

    const { result } = renderHook(() => useProgressStats());

    await waitFor(() => {
      expect(result.current.lastSynced).toBeTruthy();
    });
  });

  it('uses cached data when in loading state', async () => {
    const cached = JSON.stringify({
      wordsLearned: 30,
      wordsMastered: 5,
      currentStreak: 0,
      pathwayPercentage: 42,
      lastSynced: '2026-02-10T12:00:00.000Z',
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(cached);

    const { useLearningStateSummary } = require('@/lib/hooks/useLearningStateSummary');
    useLearningStateSummary.mockReturnValue({ data: null, isLoading: true });

    const { result } = renderHook(() => useProgressStats(0, true));

    await waitFor(() => {
      expect(result.current.wordsLearned).toBe(30);
      expect(result.current.wordsMastered).toBe(5);
      expect(result.current.pathwayPercentage).toBe(42);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.lastSynced).toBe('2026-02-10T12:00:00.000Z');
    });
  });

  it('uses user-scoped cache keys when account changes', () => {
    const { rerender } = renderHook(() => useProgressStats());
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@safar/progress_stats/user-1');

    mockUserId = 'user-2';
    rerender(undefined);

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@safar/progress_stats/user-2');
  });
});
