import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWordState } from '@/lib/hooks/useWordState';
import { useWordProgress } from '@/lib/hooks/useWordProgress';
import React from 'react';

// Mock the useWordProgress hook
jest.mock('@/lib/hooks/useWordProgress');

const mockUseWordProgress = useWordProgress as jest.MockedFunction<typeof useWordProgress>;

describe('useWordState', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it('returns "new" when progress is null', () => {
    mockUseWordProgress.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      rateWord: jest.fn(),
      isRating: false,
    } as any);

    const { result } = renderHook(() => useWordState('word-1'), { wrapper });

    expect(result.current.state).toBe('new');
    expect(result.current.isLoading).toBe(false);
  });

  it('returns "new" when repetitions is 0', () => {
    mockUseWordProgress.mockReturnValue({
      data: { repetitions: 0, interval: 1, ease_factor: 2.5, nextReview: '' },
      isLoading: false,
      isError: false,
      error: null,
      rateWord: jest.fn(),
      isRating: false,
    } as any);

    const { result } = renderHook(() => useWordState('word-1'), { wrapper });

    expect(result.current.state).toBe('new');
  });

  it('returns "learning" when repetitions is 1-2', () => {
    mockUseWordProgress.mockReturnValue({
      data: { repetitions: 1, interval: 1, ease_factor: 2.5, nextReview: '' },
      isLoading: false,
      isError: false,
      error: null,
      rateWord: jest.fn(),
      isRating: false,
    } as any);

    const { result } = renderHook(() => useWordState('word-1'), { wrapper });

    expect(result.current.state).toBe('learning');
  });

  it('returns "review" when repetitions >= 3 and interval < 7', () => {
    mockUseWordProgress.mockReturnValue({
      data: { repetitions: 3, interval: 6, ease_factor: 2.5, nextReview: '' },
      isLoading: false,
      isError: false,
      error: null,
      rateWord: jest.fn(),
      isRating: false,
    } as any);

    const { result } = renderHook(() => useWordState('word-1'), { wrapper });

    expect(result.current.state).toBe('review');
  });

  it('returns "mastered" when interval >= 7', () => {
    mockUseWordProgress.mockReturnValue({
      data: { repetitions: 3, interval: 7, ease_factor: 2.5, nextReview: '' },
      isLoading: false,
      isError: false,
      error: null,
      rateWord: jest.fn(),
      isRating: false,
    } as any);

    const { result } = renderHook(() => useWordState('word-1'), { wrapper });

    expect(result.current.state).toBe('mastered');
  });

  it('forwards loading state from useWordProgress', () => {
    mockUseWordProgress.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      rateWord: jest.fn(),
      isRating: false,
    } as any);

    const { result } = renderHook(() => useWordState('word-1'), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('forwards error state from useWordProgress', () => {
    const mockError = new Error('Failed to load');
    mockUseWordProgress.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
      rateWord: jest.fn(),
      isRating: false,
    } as any);

    const { result } = renderHook(() => useWordState('word-1'), { wrapper });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError);
  });

  it('handles database format with ease_factor field', () => {
    mockUseWordProgress.mockReturnValue({
      data: {
        repetitions: 3,
        interval: 10,
        ease_factor: 2.5, // database format
        nextReview: '',
      },
      isLoading: false,
      isError: false,
      error: null,
      rateWord: jest.fn(),
      isRating: false,
    } as any);

    const { result } = renderHook(() => useWordState('word-1'), { wrapper });

    expect(result.current.state).toBe('mastered');
  });

  it('handles local format with easeFactor field', () => {
    mockUseWordProgress.mockReturnValue({
      data: {
        repetitions: 2,
        interval: 6,
        easeFactor: 2.5, // local format
        nextReview: '',
      },
      isLoading: false,
      isError: false,
      error: null,
      rateWord: jest.fn(),
      isRating: false,
    } as any);

    const { result } = renderHook(() => useWordState('word-1'), { wrapper });

    expect(result.current.state).toBe('learning');
  });
});
