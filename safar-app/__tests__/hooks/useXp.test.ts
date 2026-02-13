import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useXp } from '@/lib/hooks/useXp';
import * as xpApi from '@/lib/api/xp';
import { AppState } from 'react-native';

const mockRemove = jest.fn();
let appStateChangeHandler: ((state: string) => void) | null = null;
const mockAddEventListener = jest.fn((_event: string, handler: (state: string) => void) => {
  appStateChangeHandler = handler;
  return { remove: mockRemove };
});

// Mock the auth store
const mockUserId = 'test-user-id';
jest.mock('@/lib/stores/useAuthStore', () => ({
  useAuthStore: (selector: any) => selector({ user: { id: mockUserId } }),
}));

// Mock TanStack Query
const mockSetQueryData = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(({ enabled }) => {
    if (!enabled) return { data: undefined, isLoading: false };
    return { data: { totalXp: 50 }, isLoading: false };
  }),
  useQueryClient: () => ({
    setQueryData: mockSetQueryData,
  }),
}));

// Mock XP API
jest.mock('@/lib/api/xp', () => ({
  fetchXp: jest.fn(),
  awardXp: jest.fn(),
  syncPendingXp: jest.fn(),
}));

describe('useXp', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    appStateChangeHandler = null;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(mockAddEventListener as any);
    (xpApi.syncPendingXp as jest.Mock).mockResolvedValue(null);
  });

  it('returns totalXp from query data', () => {
    const { result } = renderHook(() => useXp());
    expect(result.current.totalXp).toBe(50);
  });

  it('returns isLoading state', () => {
    const { result } = renderHook(() => useXp());
    expect(result.current.isLoading).toBe(false);
  });

  it('provides awardXp function', () => {
    const { result } = renderHook(() => useXp());
    expect(typeof result.current.awardXp).toBe('function');
  });

  it('awardXp calls API and updates query data', async () => {
    const updatedData = { totalXp: 60 };
    (xpApi.awardXp as jest.Mock).mockResolvedValue(updatedData);

    const { result } = renderHook(() => useXp());

    await act(async () => {
      await result.current.awardXp(10);
    });

    expect(xpApi.awardXp).toHaveBeenCalledWith(mockUserId, 10);
    expect(mockSetQueryData).toHaveBeenCalledWith(['xp', mockUserId], updatedData);
  });

  it('returns 0 when no data available', () => {
    const { useQuery } = require('@tanstack/react-query');
    useQuery.mockReturnValueOnce({ data: undefined, isLoading: false });

    const { result } = renderHook(() => useXp());
    expect(result.current.totalXp).toBe(0);
  });

  it('syncs pending XP on mount', async () => {
    renderHook(() => useXp());

    await waitFor(() => {
      expect(xpApi.syncPendingXp).toHaveBeenCalledWith(mockUserId);
    });
  });

  it('syncs pending XP when app becomes active', async () => {
    renderHook(() => useXp());

    await waitFor(() => {
      expect(xpApi.syncPendingXp).toHaveBeenCalledTimes(1);
    });

    act(() => {
      appStateChangeHandler?.('background');
    });

    expect(xpApi.syncPendingXp).toHaveBeenCalledTimes(1);

    act(() => {
      appStateChangeHandler?.('active');
    });

    await waitFor(() => {
      expect(xpApi.syncPendingXp).toHaveBeenCalledTimes(2);
    });
  });

  it('updates query cache when pending XP sync succeeds', async () => {
    (xpApi.syncPendingXp as jest.Mock).mockResolvedValue({ totalXp: 88 });

    renderHook(() => useXp());

    await waitFor(() => {
      expect(mockSetQueryData).toHaveBeenCalledWith(['xp', mockUserId], { totalXp: 88 });
    });
  });

  it('removes app state listener on unmount', () => {
    const { unmount } = renderHook(() => useXp());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });
});
