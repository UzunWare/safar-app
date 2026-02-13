import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import { useFrequencyLesson } from '@/lib/hooks/useFrequencyLesson';

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
  lesson_type: 'frequency',
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
      description: 'The most common particle.',
      audio_url: null,
      order: 1,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      frequency_word_examples: [
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
      ],
    },
  ],
};

function setupMock(data: any = mockLessonData, error: any = null) {
  const mockSingle = jest.fn().mockResolvedValue({ data, error });
  const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
  (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
  return { mockSelect, mockEq, mockSingle };
}

describe('useFrequencyLesson', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches frequency lesson data', async () => {
    setupMock();

    const { result } = renderHook(() => useFrequencyLesson('hf-u1-l1-wa'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.name).toBe('The Connector: Wa');
    expect(result.current.data?.lesson_type).toBe('frequency');
    expect(result.current.data?.words[0].arabic).toBe('وَ');
    expect(result.current.data?.words[0].frequency).toBe(9800);
  });

  it('sorts examples by order', async () => {
    setupMock();

    const { result } = renderHook(() => useFrequencyLesson('hf-u1-l1-wa'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const examples = result.current.data?.words[0].frequency_word_examples ?? [];
    expect(examples[0].order).toBe(1);
    expect(examples[1].order).toBe(2);
    expect(examples[2].order).toBe(3);
  });

  it('returns error on fetch failure', async () => {
    setupMock(null, { message: 'Not found' });

    const { result } = renderHook(() => useFrequencyLesson('nonexistent'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('queries the lessons table with lesson id', async () => {
    const { mockEq } = setupMock();

    renderHook(() => useFrequencyLesson('hf-u1-l1-wa'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('lessons');
      expect(mockEq).toHaveBeenCalledWith('id', 'hf-u1-l1-wa');
    });
  });
});
