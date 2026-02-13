/**
 * useWordOfTheDay Hook Tests
 * Verifies daily word rotation with audio from database
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWordOfTheDay } from '@/lib/hooks/useWordOfTheDay';

// Mock supabase
const mockSelect = jest.fn();
const mockNot = jest.fn();
const mockOrder = jest.fn();

jest.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
    })),
  },
}));

const MOCK_WORDS = [
  { id: 'w-bismi', arabic: 'بِسْمِ', transliteration: 'bismi', meaning: 'In the name of', audio_url: 'https://audio.qurancdn.com/wbw/001_001_001.mp3' },
  { id: 'w-allahi', arabic: 'اللَّهِ', transliteration: 'Allahi', meaning: 'Allah (God)', audio_url: 'https://audio.qurancdn.com/wbw/001_001_002.mp3' },
  { id: 'w-arrahman', arabic: 'الرَّحْمَنِ', transliteration: 'ar-Rahmani', meaning: 'the Most Gracious', audio_url: 'https://audio.qurancdn.com/wbw/001_001_003.mp3' },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useWordOfTheDay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrder.mockResolvedValue({ data: MOCK_WORDS, error: null });
    mockNot.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ not: mockNot });
  });

  it('returns a word from the database', async () => {
    const { result } = renderHook(() => useWordOfTheDay(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toBeTruthy();
    });

    const word = result.current.data!;
    expect(word.arabic).toBeTruthy();
    expect(word.transliteration).toBeTruthy();
    expect(word.meaning).toBeTruthy();
    expect(word.audio_url).toBeTruthy();
  });

  it('only fetches words with audio_url (not null)', async () => {
    renderHook(() => useWordOfTheDay(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockNot).toHaveBeenCalledWith('audio_url', 'is', null);
    });
  });

  it('returns null when no words available', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useWordOfTheDay(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toBeNull();
    });
  });

  it('selects a deterministic word based on date', async () => {
    const { result: result1 } = renderHook(() => useWordOfTheDay(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result1.current.data).toBeTruthy();
    });

    // Same day should return same word
    const { result: result2 } = renderHook(() => useWordOfTheDay(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result2.current.data).toBeTruthy();
    });

    expect(result1.current.data!.id).toBe(result2.current.data!.id);
  });

  it('throws on supabase error', async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error('DB error') });

    const { result } = renderHook(() => useWordOfTheDay(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
