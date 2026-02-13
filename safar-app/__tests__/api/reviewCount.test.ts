/**
 * Tests for Review Count API
 * Story 5.6: Push Notifications - Review Reminders
 * Task 2: Check due reviews count
 */

import { supabase } from '@/lib/api/supabase';
import { getDueReviewCount } from '@/lib/api/reviewCount';

// Build a chainable Supabase mock
function mockSupabaseChain(result: { data: unknown; error: unknown; count?: number | null }) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnValue(Promise.resolve(result)),
  };
  (supabase.from as jest.Mock).mockReturnValue(chain);
  return chain;
}

describe('getDueReviewCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the count of due reviews from Supabase', async () => {
    mockSupabaseChain({ data: null, error: null, count: 7 });

    const count = await getDueReviewCount('user-123');

    expect(supabase.from).toHaveBeenCalledWith('user_word_progress');
    expect(count).toBe(7);
  });

  it('queries with correct filters: user_id and next_review <= now', async () => {
    const chain = mockSupabaseChain({ data: null, error: null, count: 3 });

    await getDueReviewCount('user-456');

    expect(chain.select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-456');
    expect(chain.lte).toHaveBeenCalledWith('next_review', expect.any(String));
  });

  it('returns 0 when count is null', async () => {
    mockSupabaseChain({ data: null, error: null, count: null });

    const count = await getDueReviewCount('user-123');

    expect(count).toBe(0);
  });

  it('returns 0 on Supabase error', async () => {
    mockSupabaseChain({ data: null, error: new Error('DB error'), count: null });

    const count = await getDueReviewCount('user-123');

    expect(count).toBe(0);
  });

  it('returns 0 when userId is empty', async () => {
    const count = await getDueReviewCount('');

    expect(count).toBe(0);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
