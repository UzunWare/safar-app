import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from 'expo-router';
import LearnScreen from '@/app/(tabs)/learn';
import { supabase } from '@/lib/api/supabase';
import { useProgress } from '@/lib/hooks/useProgress';

jest.mock('@/lib/api/progress', () => ({
  syncOfflineProgress: jest.fn(() => Promise.resolve({ synced: 0, failed: 0 })),
}));

jest.mock('@/lib/hooks/useProgress', () => ({
  useProgress: jest.fn(() => ({
    completedLessons: 0,
    totalLessons: 0,
    pathwayPercent: 0,
    isLessonComplete: () => false,
    isUnitComplete: () => false,
    unitPercent: () => 0,
    isLoading: false,
    completedLessonIds: new Set(),
    nextLessonId: null,
  })),
}));

jest.mock('@/lib/hooks/useContentAccess', () => ({
  useContentAccess: () => ({
    hasAccess: true,
    shouldShowPaywall: false,
    isLoading: false,
  }),
}));

const mockLessonsData = [
  {
    id: 'l1',
    unit_id: 'u1',
    name: 'Bismillah',
    order: 1,
    word_count: 4,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'l2',
    unit_id: 'u1',
    name: 'Al-Hamd',
    order: 2,
    word_count: 6,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'l3',
    unit_id: 'u1',
    name: 'Rabb Al-Alamin',
    order: 3,
    word_count: 5,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

// Helper: creates a pathway-aware mockEq that returns error for high-frequency pathway
function createPathwayAwareEq(mockSingle: jest.Mock) {
  return jest.fn().mockImplementation((_field: string, value: string) => {
    if (value === 'high-frequency') {
      return {
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
      };
    }
    return { single: mockSingle };
  });
}

const mockPathwayData = {
  id: 'salah-first',
  name: 'Salah First',
  slug: 'salah-first',
  description: 'Learn the words of your daily prayers',
  promise: 'Understand your daily prayers in 6 weeks',
  total_words: 120,
  total_units: 6,
  preview_items: ['Al-Fatiha (complete)', 'Common prayer phrases', "Essential du'as"],
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  units: [
    {
      id: 'u1',
      pathway_id: 'salah-first',
      name: 'Al-Fatiha',
      order: 1,
      word_count: 20,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'u2',
      pathway_id: 'salah-first',
      name: "Ruku' & Sujud",
      order: 2,
      word_count: 18,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'u3',
      pathway_id: 'salah-first',
      name: 'Tashahhud',
      order: 3,
      word_count: 22,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'u4',
      pathway_id: 'salah-first',
      name: 'Salawat & Closing',
      order: 4,
      word_count: 20,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'u5',
      pathway_id: 'salah-first',
      name: "Common Du'as",
      order: 5,
      word_count: 20,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'u6',
      pathway_id: 'salah-first',
      name: 'Review & Mastery',
      order: 6,
      word_count: 20,
      description: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ],
};

describe('LearnScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Mock a never-resolving query
    const mockSingle = jest.fn().mockReturnValue(new Promise(() => {}));
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByTestId } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('learn-loading')).toBeTruthy();
  });

  it('renders pathway name after loading', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = createPathwayAwareEq(mockSingle);
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByText } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Salah First')).toBeTruthy();
    });
  });

  it('renders all 6 units', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = createPathwayAwareEq(mockSingle);
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByText } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Al-Fatiha')).toBeTruthy();
      expect(getByText("Ruku' & Sujud")).toBeTruthy();
      expect(getByText('Tashahhud')).toBeTruthy();
      expect(getByText('Salawat & Closing')).toBeTruthy();
      expect(getByText("Common Du'as")).toBeTruthy();
      expect(getByText('Review & Mastery')).toBeTruthy();
    });
  });

  it('renders Continue Learning button', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = createPathwayAwareEq(mockSingle);
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByTestId } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('continue-button')).toBeTruthy();
    });
  });

  it('renders error state when fetch fails', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByTestId } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('learn-error')).toBeTruthy();
    });
  });

  it('shows unit word count', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = createPathwayAwareEq(mockSingle);
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getAllByText } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      // 6 units show word count + 1 header total = 7 matches
      const wordLabels = getAllByText(/\d+ words/);
      expect(wordLabels.length).toBeGreaterThanOrEqual(6);
    });
  });

  it('shows step count in pill', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = createPathwayAwareEq(mockSingle);
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByText } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      // Shows "0/6 Steps" format matching prototype
      expect(getByText('0/6 Steps')).toBeTruthy();
    });
  });

  it('expands unit to show lessons when tapped', async () => {
    // First call is for pathway, subsequent calls for lessons
    const mockOrder = jest.fn().mockResolvedValue({ data: mockLessonsData, error: null });
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = jest.fn().mockImplementation((field: string, value: string) => {
      if (field === 'id' && value === 'high-frequency')
        return {
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
        };
      if (field === 'id') return { single: mockSingle };
      // unit_id eq for lessons query
      return { order: mockOrder };
    });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByTestId, getByText } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    // Wait for pathway to load
    await waitFor(() => {
      expect(getByText('Al-Fatiha')).toBeTruthy();
    });

    // Tap first unit to expand
    fireEvent.press(getByTestId('unit-u1'));

    // Should show lessons after expansion
    await waitFor(() => {
      expect(getByText('Bismillah')).toBeTruthy();
      expect(getByText('Al-Hamd')).toBeTruthy();
      expect(getByText('Rabb Al-Alamin')).toBeTruthy();
    });
  });

  it('collapses unit when tapped again', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: mockLessonsData, error: null });
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = jest.fn().mockImplementation((field: string, value: string) => {
      if (field === 'id' && value === 'high-frequency')
        return {
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
        };
      if (field === 'id') return { single: mockSingle };
      return { order: mockOrder };
    });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByTestId, getByText, queryByText } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Al-Fatiha')).toBeTruthy();
    });

    // Expand
    fireEvent.press(getByTestId('unit-u1'));
    await waitFor(() => {
      expect(getByText('Bismillah')).toBeTruthy();
    });

    // Collapse
    fireEvent.press(getByTestId('unit-u1'));
    await waitFor(() => {
      expect(queryByText('Bismillah')).toBeNull();
    });
  });

  it('shows lesson word count in expanded unit', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: mockLessonsData, error: null });
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = jest.fn().mockImplementation((field: string, value: string) => {
      if (field === 'id' && value === 'high-frequency')
        return {
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
        };
      if (field === 'id') return { single: mockSingle };
      return { order: mockOrder };
    });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByTestId, getByText } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Al-Fatiha')).toBeTruthy();
    });

    fireEvent.press(getByTestId('unit-u1'));

    await waitFor(() => {
      expect(getByText('4 words')).toBeTruthy();
      expect(getByText('6 words')).toBeTruthy();
      expect(getByText('5 words')).toBeTruthy();
    });
  });

  it('renders each lesson as tappable', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: mockLessonsData, error: null });
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = jest.fn().mockImplementation((field: string, value: string) => {
      if (field === 'id' && value === 'high-frequency')
        return {
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
        };
      if (field === 'id') return { single: mockSingle };
      return { order: mockOrder };
    });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByTestId, getByText } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Al-Fatiha')).toBeTruthy();
    });

    fireEvent.press(getByTestId('unit-u1'));

    await waitFor(() => {
      expect(getByTestId('lesson-l1')).toBeTruthy();
      expect(getByTestId('lesson-l2')).toBeTruthy();
      expect(getByTestId('lesson-l3')).toBeTruthy();
    });
  });

  it('shows "Continue Learning" text on the continue button', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = createPathwayAwareEq(mockSingle);
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByText } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Continue Learning')).toBeTruthy();
    });
  });

  it('displays pathway description', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = createPathwayAwareEq(mockSingle);
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByText } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Learn the words of your daily prayers')).toBeTruthy();
    });
  });

  it('shows units section header', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
    const mockEq = createPathwayAwareEq(mockSingle);
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByText } = render(<LearnScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Units')).toBeTruthy();
    });
  });

  describe('progress display', () => {
    function setupPathwayMock() {
      const mockSingle = jest.fn().mockResolvedValue({ data: mockPathwayData, error: null });
      const mockEq = createPathwayAwareEq(mockSingle);
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
    }

    it('shows step count reflecting completed units', async () => {
      (useProgress as jest.Mock).mockReturnValue({
        completedLessons: 5,
        totalLessons: 10,
        pathwayPercent: 50,
        isLessonComplete: () => false,
        isUnitComplete: (id: string) => id === 'u1' || id === 'u2',
        unitPercent: () => 0,
        isLoading: false,
        completedLessonIds: new Set(),
        nextLessonId: 'l1',
      });
      setupPathwayMock();

      const { getByText } = render(<LearnScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getByText('2/6 Steps')).toBeTruthy();
      });
    });

    it('shows unit progress status text', async () => {
      (useProgress as jest.Mock).mockReturnValue({
        completedLessons: 3,
        totalLessons: 10,
        pathwayPercent: 30,
        isLessonComplete: () => false,
        isUnitComplete: (id: string) => id === 'u1',
        unitPercent: (id: string) => (id === 'u1' ? 100 : id === 'u2' ? 50 : 0),
        isLoading: false,
        completedLessonIds: new Set(),
        nextLessonId: 'l3',
      });
      setupPathwayMock();

      const { getByText } = render(<LearnScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getByText(/Complete/)).toBeTruthy();
      });
    });
  });

  describe('High Frequency Coming Soon card', () => {
    const mockFreqPathwayData = {
      id: 'high-frequency',
      name: 'High Frequency',
      slug: 'high-frequency',
      description: '80% of Quranic vocabulary.',
      promise: 'Learn the most common words in the Quran',
      total_words: 50,
      total_units: 1,
      preview_items: [],
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      units: [
        {
          id: 'hf-u1-particles',
          pathway_id: 'high-frequency',
          name: 'Common Particles',
          order: 1,
          word_count: 3,
          description: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ],
    };

    function setupBothPathwaysMock() {
      const mockEq = jest.fn().mockImplementation((_field: string, value: string) => {
        if (value === 'high-frequency') {
          return {
            single: jest.fn().mockResolvedValue({ data: mockFreqPathwayData, error: null }),
          };
        }
        return {
          single: jest.fn().mockResolvedValue({ data: mockPathwayData, error: null }),
        };
      });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
    }

    it('renders frequency pathway card with Coming Soon badge', async () => {
      setupBothPathwaysMock();

      const { getByTestId, getByText } = render(<LearnScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getByTestId('frequency-pathway-card')).toBeTruthy();
        expect(getByText('High Frequency')).toBeTruthy();
        expect(getByText('80% of Quranic vocabulary.')).toBeTruthy();
        expect(getByTestId('frequency-coming-soon-badge')).toBeTruthy();
      });
    });

    it('does not render Start Learning or Continue button', async () => {
      setupBothPathwaysMock();

      const { queryByTestId, queryByText } = render(<LearnScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(queryByTestId('frequency-continue-button')).toBeNull();
        expect(queryByText('Start Learning')).toBeNull();
      });
    });

    it('shows Coming Soon text in the badge', async () => {
      setupBothPathwaysMock();

      const { getAllByText } = render(<LearnScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const comingSoonElements = getAllByText('Coming Soon');
        expect(comingSoonElements.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
