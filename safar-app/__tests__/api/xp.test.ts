import { fetchXp, awardXp, syncPendingXp } from '@/lib/api/xp';
import { supabase } from '@/lib/api/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseAny = supabase as any;

describe('fetchXp', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    supabaseAny.rpc = jest.fn();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('returns XP data from Supabase', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: { total_xp: 100 },
      error: null,
    });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock) = jest.fn().mockReturnValue({ select: mockSelect });

    const result = await fetchXp('user-1');

    expect(supabase.from).toHaveBeenCalledWith('user_xp');
    expect(result.totalXp).toBe(100);
  });

  it('creates row when none exists (PGRST116)', async () => {
    const mockSingleNotFound = jest.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' },
    });
    const mockEqNotFound = jest.fn().mockReturnValue({ single: mockSingleNotFound });
    const mockSelectNotFound = jest.fn().mockReturnValue({ eq: mockEqNotFound });

    const mockInsertSingle = jest.fn().mockResolvedValue({
      data: { total_xp: 0 },
      error: null,
    });
    const mockInsertSelect = jest.fn().mockReturnValue({ single: mockInsertSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockInsertSelect });

    let callCount = 0;
    (supabase.from as jest.Mock) = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { select: mockSelectNotFound };
      }
      return { insert: mockInsert };
    });

    const result = await fetchXp('user-1');
    expect(result.totalXp).toBe(0);
  });

  it('returns cached data on Supabase error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ totalXp: 50 }));

    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'network error' },
    });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock) = jest.fn().mockReturnValue({ select: mockSelect });

    const result = await fetchXp('user-1');
    expect(result.totalXp).toBe(50);
  });

  it('returns default (0 XP) when no cache and Supabase fails', async () => {
    const mockSingle = jest.fn().mockRejectedValue(new Error('network error'));
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock) = jest.fn().mockReturnValue({ select: mockSelect });

    const result = await fetchXp('user-1');
    expect(result.totalXp).toBe(0);
  });
});

describe('awardXp', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    supabaseAny.rpc = jest.fn();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('increments XP atomically via RPC and caches result', async () => {
    supabaseAny.rpc.mockResolvedValue({ data: 60, error: null });

    const result = await awardXp('user-1', 10);

    expect(supabaseAny.rpc).toHaveBeenCalledWith('increment_user_xp', {
      p_user_id: 'user-1',
      p_delta: 10,
    });
    expect(result.totalXp).toBe(60);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@safar/xp/user-1',
      expect.stringContaining('"totalXp":60')
    );
  });

  it('returns current XP for zero awards without RPC increment', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: { total_xp: 33 },
      error: null,
    });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock) = jest.fn().mockReturnValue({ select: mockSelect });

    const result = await awardXp('user-1', 0);

    expect(result.totalXp).toBe(33);
    expect(supabaseAny.rpc).not.toHaveBeenCalled();
  });

  it('rejects negative awards', async () => {
    await expect(awardXp('user-1', -1)).rejects.toThrow('non-negative');
    expect(supabaseAny.rpc).not.toHaveBeenCalled();
  });

  it('rejects non-integer awards', async () => {
    await expect(awardXp('user-1', 1.5)).rejects.toThrow('integer');
    expect(supabaseAny.rpc).not.toHaveBeenCalled();
  });

  it('rejects non-finite awards', async () => {
    await expect(awardXp('user-1', Number.NaN)).rejects.toThrow('finite');
    expect(supabaseAny.rpc).not.toHaveBeenCalled();
  });

  it('queues pending delta and returns optimistic value when RPC fails', async () => {
    supabaseAny.rpc.mockResolvedValue({ data: null, error: { message: 'network error' } });

    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === '@safar/xp/user-1') return Promise.resolve(JSON.stringify({ totalXp: 75 }));
      if (key === '@safar/xp-pending/user-1') return Promise.resolve(null);
      return Promise.resolve(null);
    });

    const result = await awardXp('user-1', 10);

    expect(result.totalXp).toBe(85);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@safar/xp-pending/user-1', '10');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@safar/xp/user-1',
      expect.stringContaining('"totalXp":85')
    );
  });

  it('accumulates pending deltas from multiple failed awards', async () => {
    supabaseAny.rpc.mockResolvedValue({ data: null, error: { message: 'network error' } });

    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === '@safar/xp/user-1') return Promise.resolve(JSON.stringify({ totalXp: 0 }));
      if (key === '@safar/xp-pending/user-1') return Promise.resolve('10');
      return Promise.resolve(null);
    });

    await awardXp('user-1', 15);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@safar/xp-pending/user-1', '25');
  });
});

describe('syncPendingXp', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    supabaseAny.rpc = jest.fn();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('no-ops when no pending delta exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const result = await syncPendingXp('user-1');

    expect(result).toBeNull();
    expect(supabaseAny.rpc).not.toHaveBeenCalled();
  });

  it('syncs pending delta via RPC and clears queue', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === '@safar/xp-pending/user-1') return Promise.resolve('25');
      return Promise.resolve(null);
    });

    supabaseAny.rpc.mockResolvedValue({ data: 125, error: null });

    const result = await syncPendingXp('user-1');

    expect(supabaseAny.rpc).toHaveBeenCalledWith('increment_user_xp', {
      p_user_id: 'user-1',
      p_delta: 25,
    });
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@safar/xp-pending/user-1');
    expect(result!.totalXp).toBe(125);
  });

  it('clears invalid pending delta values', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === '@safar/xp-pending/user-1') return Promise.resolve('not-a-number');
      return Promise.resolve(null);
    });

    const result = await syncPendingXp('user-1');

    expect(result).toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@safar/xp-pending/user-1');
    expect(supabaseAny.rpc).not.toHaveBeenCalled();
  });

  it('preserves pending delta on sync failure', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === '@safar/xp-pending/user-1') return Promise.resolve('15');
      return Promise.resolve(null);
    });

    supabaseAny.rpc.mockResolvedValue({ data: null, error: { message: 'still offline' } });

    const result = await syncPendingXp('user-1');

    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
