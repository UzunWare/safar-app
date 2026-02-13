import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FrequencyLessonScreen from '@/app/frequency-lesson/[id]';
import { supabase } from '@/lib/api/supabase';
import { useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/lib/stores/useAuthStore';

import { markLessonComplete } from '@/lib/api/progress';

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

const mockLessonData = {
  id: 'hf-u1-l1-wa',
  unit_id: 'hf-u1-particles',
  name: 'The Connector: Wa',
  order: 1,
  word_count: 1,
  type: 'frequency',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  words: [
    {
      id: 'w-wa',
      lesson_id: 'hf-u1-l1-wa',
      arabic: 'وَ',
      transliteration: 'Wa',
      meaning: 'And',
      frequency: 9800,
      description: 'The most common particle. It connects ideas, stories, and blessings.',
      audio_url: null,
      order: 1,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      frequency_word_examples: [
        {
          id: 'fex-wa-1',
          word_id: 'w-wa',
          arabic: 'وَالشَّمْسِ',
          transliteration: 'Wash-shams',
          meaning: 'And the sun',
          order: 1,
          audio_url: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'fex-wa-2',
          word_id: 'w-wa',
          arabic: 'وَالْقَمَرِ',
          transliteration: 'Wal-qamar',
          meaning: 'And the moon',
          order: 2,
          audio_url: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'fex-wa-3',
          word_id: 'w-wa',
          arabic: 'وَالنَّهَارِ',
          transliteration: 'Wan-nahar',
          meaning: 'And the day',
          order: 3,
          audio_url: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ],
    },
  ],
};

function setupLessonMock(data: any = mockLessonData, error: any = null) {
  const mockSingle = jest.fn().mockResolvedValue({ data, error });
  const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
  (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
  return { mockSelect, mockEq, mockSingle };
}

describe('FrequencyLessonScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hf-u1-l1-wa' });
    useAuthStore.setState({ user: { id: 'user-123' } as any });
    (markLessonComplete as jest.Mock).mockImplementation(() => Promise.resolve({ success: true }));
  });

  it('shows loading state initially', () => {
    const mockSingle = jest.fn().mockReturnValue(new Promise(() => {}));
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const { getByTestId } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('frequency-lesson-loading')).toBeTruthy();
  });

  it('shows error state on fetch failure', async () => {
    setupLessonMock(null, { message: 'Not found' });

    const { getByTestId } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('frequency-lesson-error')).toBeTruthy();
    });
  });

  it('shows intro state with Arabic particle and transliteration', async () => {
    setupLessonMock();

    const { getByText, getByTestId } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('frequency-lesson-intro')).toBeTruthy();
      expect(getByText('وَ')).toBeTruthy();
      expect(getByText('Wa')).toBeTruthy();
    });
  });

  it('shows meaning and frequency count in intro', async () => {
    setupLessonMock();

    const { getByText } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('"And"')).toBeTruthy();
      expect(getByText('9,800 times')).toBeTruthy();
    });
  });

  it('shows description in intro', async () => {
    setupLessonMock();

    const { getByText } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(
        getByText('The most common particle. It connects ideas, stories, and blessings.')
      ).toBeTruthy();
    });
  });

  it('shows "Particle" label and "See Examples" button', async () => {
    setupLessonMock();

    const { getByText, getByTestId } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Particle')).toBeTruthy();
      expect(getByTestId('see-examples-button')).toBeTruthy();
    });
  });

  it('transitions to examples state when "See Examples" is tapped', async () => {
    setupLessonMock();

    const { getByTestId, getByText, queryByTestId } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('frequency-lesson-intro')).toBeTruthy();
    });

    fireEvent.press(getByTestId('see-examples-button'));

    await waitFor(() => {
      expect(getByTestId('frequency-lesson-examples')).toBeTruthy();
      expect(queryByTestId('frequency-lesson-intro')).toBeNull();
      expect(getByText('The Foundation')).toBeTruthy();
    });
  });

  it('shows example cards with transliteration and meaning', async () => {
    setupLessonMock();

    const { getByTestId, getByText } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('frequency-lesson-intro')).toBeTruthy();
    });

    fireEvent.press(getByTestId('see-examples-button'));

    await waitFor(() => {
      expect(getByText('Wash-shams')).toBeTruthy();
      expect(getByText('And the sun')).toBeTruthy();
      expect(getByText('Wal-qamar')).toBeTruthy();
      expect(getByText('And the moon')).toBeTruthy();
      expect(getByText('Wan-nahar')).toBeTruthy();
      expect(getByText('And the day')).toBeTruthy();
    });
  });

  it('shows "Complete Lesson" button in examples state', async () => {
    setupLessonMock();

    const { getByTestId } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('frequency-lesson-intro')).toBeTruthy();
    });

    fireEvent.press(getByTestId('see-examples-button'));

    await waitFor(() => {
      expect(getByTestId('complete-lesson-button')).toBeTruthy();
    });
  });

  it('marks lesson complete and shows completion state', async () => {
    setupLessonMock();

    const { getByTestId, getByText } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('frequency-lesson-intro')).toBeTruthy();
    });

    fireEvent.press(getByTestId('see-examples-button'));

    await waitFor(() => {
      expect(getByTestId('complete-lesson-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('complete-lesson-button'));

    await waitFor(() => {
      expect(getByTestId('frequency-lesson-complete')).toBeTruthy();
      expect(getByText('Lesson Complete')).toBeTruthy();
      expect(markLessonComplete).toHaveBeenCalledWith('user-123', 'hf-u1-l1-wa');
    });
  });

  it('shows close button', async () => {
    setupLessonMock();

    const { getByTestId } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('close-button')).toBeTruthy();
    });
  });

  it('shows finish button on completion screen', async () => {
    setupLessonMock();

    const { getByTestId } = render(<FrequencyLessonScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('frequency-lesson-intro')).toBeTruthy();
    });

    fireEvent.press(getByTestId('see-examples-button'));

    await waitFor(() => {
      expect(getByTestId('complete-lesson-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('complete-lesson-button'));

    await waitFor(() => {
      expect(getByTestId('finish-button')).toBeTruthy();
    });
  });
});
