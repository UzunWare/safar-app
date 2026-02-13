/**
 * Explore Screen Tests
 * Smoke tests for Root Garden browse screen
 */

import { render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ExploreScreen from '@/app/(tabs)/explore';
import { supabase } from '@/lib/api/supabase';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock analytics
jest.mock('@/lib/utils/analytics', () => ({
  trackEvent: jest.fn(),
  AnalyticsEvents: {
    ROOT_GARDEN_VIEWED: 'root_garden_viewed',
    ROOT_SEARCHED: 'root_searched',
  },
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

describe('ExploreScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Root Garden title', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const Wrapper = createWrapper();
    render(<ExploreScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Root Garden')).toBeTruthy();
    });
  });

  it('renders search input', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const Wrapper = createWrapper();
    render(<ExploreScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search roots...')).toBeTruthy();
    });
  });

  it('shows loading state initially', () => {
    const mockOrder = jest.fn().mockImplementation(() => new Promise(() => {}));
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const Wrapper = createWrapper();
    render(<ExploreScreen />, { wrapper: Wrapper });

    expect(screen.getByText('Loading roots...')).toBeTruthy();
  });

  it('shows empty state when no roots', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const Wrapper = createWrapper();
    render(<ExploreScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('No roots found')).toBeTruthy();
    });
  });

  it('shows error state on fetch error', async () => {
    const mockOrder = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const Wrapper = createWrapper();
    render(<ExploreScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Unable to load roots')).toBeTruthy();
    });
  });
});
