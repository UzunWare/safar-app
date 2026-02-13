import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PathwayScreen from '@/app/onboarding/pathway';
import { usePathway } from '@/lib/hooks/usePathway';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { completeOnboarding } from '@/lib/api/progress';
import { router } from 'expo-router';

// Mock the hooks and APIs
jest.mock('@/lib/hooks/usePathway');
jest.mock('@/lib/stores/useAuthStore');
jest.mock('@/lib/api/progress');
jest.mock('@/lib/utils/analytics', () => ({
  trackEvent: jest.fn(),
  AnalyticsEvents: { ONBOARDING_COMPLETED: 'onboarding_completed' },
}));

const mockUsePathway = usePathway as jest.MockedFunction<typeof usePathway>;
const mockCompleteOnboarding = completeOnboarding as jest.MockedFunction<typeof completeOnboarding>;

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

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(React.createElement(QueryClientProvider, { client: queryClient }, ui));
}

describe('PathwayScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default: authenticated user
    const mockSetOnboardingCompleted = jest.fn();
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({ user: { id: 'test-user-id' } })
    );
    (useAuthStore as any).getState = jest.fn(() => ({
      setOnboardingCompleted: mockSetOnboardingCompleted,
    }));

    // Default: successful pathway data
    mockUsePathway.mockReturnValue({
      data: mockPathwayData,
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null,
    } as any);

    mockCompleteOnboarding.mockResolvedValue({ success: true });
  });

  // AC #1: "Salah First" pathway prominently displayed
  it('displays the "Salah First" pathway name', () => {
    const { getByText } = renderWithProviders(React.createElement(PathwayScreen));
    expect(getByText('Salah First')).toBeTruthy();
  });

  // AC #2: Shows promise text
  it('displays the promise "Understand your daily prayers in 6 weeks"', () => {
    const { getByText } = renderWithProviders(React.createElement(PathwayScreen));
    expect(getByText('Understand your daily prayers in 6 weeks')).toBeTruthy();
  });

  // AC #3: Shows word count and unit count
  it('displays word count (~120) and unit count (6 units)', () => {
    const { getByText } = renderWithProviders(React.createElement(PathwayScreen));
    expect(getByText(/120 words/)).toBeTruthy();
    expect(getByText(/6 units/)).toBeTruthy();
  });

  // AC #3: Shows preview items
  it('displays preview content items', () => {
    const { getAllByText, getByText } = renderWithProviders(React.createElement(PathwayScreen));
    // Al-Fatiha appears in preview and unit list
    expect(getAllByText(/Al-Fatiha/).length).toBeGreaterThanOrEqual(1);
    expect(getByText(/prayer phrases/i)).toBeTruthy();
  });

  // AC #5: Shows 6 units with titles
  it('displays all 6 units with their titles', () => {
    const { getByText } = renderWithProviders(React.createElement(PathwayScreen));
    expect(getByText('Al-Fatiha')).toBeTruthy();
    expect(getByText(/Ruku.*Sujud/)).toBeTruthy();
    expect(getByText('Tashahhud')).toBeTruthy();
    expect(getByText(/Salawat/)).toBeTruthy();
    expect(getByText(/Du.*as/)).toBeTruthy();
    expect(getByText(/Review.*Mastery/)).toBeTruthy();
  });

  // AC #5: Shows word counts per unit
  it('displays word counts per unit', () => {
    const { getAllByText } = renderWithProviders(React.createElement(PathwayScreen));
    // At least some units should show word counts
    expect(getAllByText(/\d+ words/).length).toBeGreaterThanOrEqual(1);
  });

  // AC #5: Unit 1 unlocked, Units 2-6 locked (visual only)
  it('shows Unit 1 as unlocked and other units with lock indicator', () => {
    const { getByTestId } = renderWithProviders(React.createElement(PathwayScreen));
    // Unit 1 should not have a lock icon
    expect(getByTestId('unit-item-0')).toBeTruthy();
    // Units 2-6 should have lock indicators
    for (let i = 1; i < 6; i++) {
      expect(getByTestId(`unit-lock-${i}`)).toBeTruthy();
    }
  });

  // AC #4: CTA button exists
  it('shows a "Begin Your Journey" button', () => {
    const { getByTestId } = renderWithProviders(React.createElement(PathwayScreen));
    expect(getByTestId('pathway-cta')).toBeTruthy();
  });

  // AC #4: Tapping CTA marks onboarding complete and navigates
  it('marks onboarding complete and navigates on CTA press', async () => {
    const { getByTestId } = renderWithProviders(React.createElement(PathwayScreen));

    fireEvent.press(getByTestId('pathway-cta'));

    await waitFor(() => {
      expect(mockCompleteOnboarding).toHaveBeenCalledWith('test-user-id');
      expect(router.replace).toHaveBeenCalledWith('/(tabs)/learn');
    });
  });

  // Loading state
  it('shows loading state while fetching pathway data', () => {
    mockUsePathway.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isSuccess: false,
      error: null,
    } as any);

    const { getByTestId } = renderWithProviders(React.createElement(PathwayScreen));
    expect(getByTestId('pathway-loading')).toBeTruthy();
  });

  // Error resilience - still navigates even if completeOnboarding fails
  it('navigates even if completeOnboarding fails', async () => {
    mockCompleteOnboarding.mockResolvedValue({ success: false, error: 'Network error' });

    const { getByTestId } = renderWithProviders(React.createElement(PathwayScreen));
    fireEvent.press(getByTestId('pathway-cta'));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(tabs)/learn');
    });
  });

  // M2 fix: Unauthenticated user redirects to sign-in
  it('redirects to sign-in when user is not authenticated', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({ user: null })
    );

    const { getByTestId } = renderWithProviders(React.createElement(PathwayScreen));
    fireEvent.press(getByTestId('pathway-cta'));

    expect(router.replace).toHaveBeenCalledWith('/auth/sign-in');
    expect(mockCompleteOnboarding).not.toHaveBeenCalled();
  });

  // M1 fix: Error state shows retry button
  it('shows error state with retry when pathway query fails', () => {
    mockUsePathway.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isSuccess: false,
      error: new Error('Network error'),
      refetch: jest.fn(),
    } as any);

    const { getByTestId, getByText } = renderWithProviders(React.createElement(PathwayScreen));
    expect(getByTestId('pathway-error')).toBeTruthy();
    expect(getByText('Unable to load pathway')).toBeTruthy();
    expect(getByTestId('pathway-retry')).toBeTruthy();
  });
});
