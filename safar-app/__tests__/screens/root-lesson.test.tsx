/**
 * Root Lesson Screen Tests
 * Tests for 3-step educational flow: intro → bloom → quiz
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import RootLessonScreen from '@/app/root-lesson/[id]';
import { supabase } from '@/lib/api/supabase';

// Mock expo-router
const mockBack = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'sf-root-rhm' }),
  useRouter: () => ({
    back: mockBack,
    canGoBack: mockCanGoBack,
    replace: mockReplace,
    push: jest.fn(),
  }),
  router: {
    back: mockBack,
    canGoBack: mockCanGoBack,
    replace: mockReplace,
  },
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
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('RootLessonScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const mockSingle = jest.fn().mockImplementation(() => new Promise(() => {}));
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const Wrapper = createWrapper();
    render(<RootLessonScreen />, { wrapper: Wrapper });

    expect(screen.getByText('Loading lesson...')).toBeTruthy();
  });

  it('renders Step 0: New Concept introduction', async () => {
    const mockLesson = {
      id: 'sf-root-rhm',
      name: 'Root Lesson: Mercy (R-H-M)',
      lesson_type: 'root',
    };

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'lessons') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockLesson, error: null }),
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };
    });

    const Wrapper = createWrapper();
    render(<RootLessonScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('New Concept')).toBeTruthy();
    });

    expect(screen.getByText('The Root System')).toBeTruthy();
    expect(screen.getByText(/Arabic words are grown like trees/)).toBeTruthy();
    expect(screen.getByText('Show me')).toBeTruthy();
  });

  it('advances to Step 1 when Show me button is pressed', async () => {
    const mockLesson = {
      id: 'sf-root-rhm',
      name: 'Root Lesson: Mercy (R-H-M)',
      lesson_type: 'root',
    };

    const mockRoot = {
      id: 'r-rhm',
      letters: 'ر-ح-م',
      meaning: 'mercy, compassion',
      transliteration: 'R-H-M',
    };

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'lessons') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockLesson, error: null }),
            }),
          }),
        };
      }
      if (table === 'roots') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockRoot, error: null }),
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };
    });

    const Wrapper = createWrapper();
    render(<RootLessonScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Show me')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Show me'));

    await waitFor(() => {
      // Check for root letters (bloom visualization)
      expect(screen.getByText('ر-ح-م')).toBeTruthy();
    });
  });

  it('closes lesson when X button is pressed', async () => {
    const mockLesson = {
      id: 'sf-root-rhm',
      name: 'Root Lesson: Mercy (R-H-M)',
      lesson_type: 'root',
    };

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'lessons') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockLesson, error: null }),
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };
    });

    const Wrapper = createWrapper();
    render(<RootLessonScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByLabelText('Close lesson')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Close lesson'));

    expect(mockBack).toHaveBeenCalled();
  });
});
