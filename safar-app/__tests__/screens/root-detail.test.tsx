/**
 * Root Detail Screen Tests
 * Smoke tests for full-screen bloom visualization
 */

import { render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import RootDetailScreen from '@/app/root-detail/[id]';
import { supabase } from '@/lib/api/supabase';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'test-root-id' }),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
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

describe('RootDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Root Explorer title', () => {
    const mockSingle = jest.fn().mockImplementation(() => new Promise(() => {}));
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const Wrapper = createWrapper();
    render(<RootDetailScreen />, { wrapper: Wrapper });

    expect(screen.getByText('Root Explorer')).toBeTruthy();
  });

  it('renders back button', () => {
    const mockSingle = jest.fn().mockImplementation(() => new Promise(() => {}));
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const Wrapper = createWrapper();
    render(<RootDetailScreen />, { wrapper: Wrapper });

    expect(screen.getByLabelText('Go back to root garden')).toBeTruthy();
  });

  it('shows loading state initially', () => {
    const mockSingle = jest.fn().mockImplementation(() => new Promise(() => {}));
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const Wrapper = createWrapper();
    render(<RootDetailScreen />, { wrapper: Wrapper });

    expect(screen.getByText('Loading root...')).toBeTruthy();
  });

  it('shows error state when root not found', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Root not found' },
    });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const Wrapper = createWrapper();
    render(<RootDetailScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      // Use getAllByText since there are multiple elements with this text (title + description)
      const elements = screen.getAllByText(/Root not found/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
