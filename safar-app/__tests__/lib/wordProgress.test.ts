import { initializeWordProgress, updateWordProgress } from '@/lib/api/wordProgress';
import { supabase } from '@/lib/api/supabase';

describe('initializeWordProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function setupUpsertMock(error: any = null) {
    const mockUpsert = jest.fn().mockResolvedValue({ data: null, error });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });
    return mockUpsert;
  }

  it('calls supabase upsert on user_word_progress table', async () => {
    const mockUpsert = setupUpsertMock();

    await initializeWordProgress('user-1', 'word-1', true);

    expect(supabase.from).toHaveBeenCalledWith('user_word_progress');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        word_id: 'word-1',
      }),
      { onConflict: 'user_id,word_id' }
    );
  });

  it('sets interval=1 and repetitions=1 for correct answers', async () => {
    const mockUpsert = setupUpsertMock();

    await initializeWordProgress('user-1', 'word-1', true);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        interval: 1,
        repetitions: 1,
        ease_factor: 2.5,
        status: 'learning',
      }),
      expect.anything()
    );
  });

  it('sets interval=0 and repetitions=0 for incorrect answers', async () => {
    const mockUpsert = setupUpsertMock();

    await initializeWordProgress('user-1', 'word-1', false);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        interval: 0,
        repetitions: 0,
        ease_factor: 2.5,
        status: 'learning',
      }),
      expect.anything()
    );
  });

  it('sets next_review to ~1 day for correct answers', async () => {
    const mockUpsert = setupUpsertMock();
    const before = new Date();

    await initializeWordProgress('user-1', 'word-1', true);

    const call = mockUpsert.mock.calls[0][0];
    const nextReview = new Date(call.next_review);
    const diff = nextReview.getTime() - before.getTime();
    // Should be approximately 24 hours (within 5 seconds tolerance)
    expect(diff).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(diff).toBeLessThan(25 * 60 * 60 * 1000);
  });

  it('sets next_review to now for incorrect answers', async () => {
    const mockUpsert = setupUpsertMock();
    const before = new Date();

    await initializeWordProgress('user-1', 'word-1', false);

    const call = mockUpsert.mock.calls[0][0];
    const nextReview = new Date(call.next_review);
    const diff = nextReview.getTime() - before.getTime();
    // Should be approximately now (within 5 seconds)
    expect(Math.abs(diff)).toBeLessThan(5000);
  });

  it('returns success when upsert succeeds', async () => {
    setupUpsertMock(null);

    const result = await initializeWordProgress('user-1', 'word-1', true);

    expect(result).toEqual({ success: true });
  });

  it('returns error when upsert fails', async () => {
    setupUpsertMock({ message: 'Database error' });

    const result = await initializeWordProgress('user-1', 'word-1', true);

    expect(result).toEqual({ success: false, error: 'Database error' });
  });

  it('handles thrown exceptions gracefully', async () => {
    (supabase.from as jest.Mock).mockImplementation(() => {
      throw new Error('Connection refused');
    });

    const result = await initializeWordProgress('user-1', 'word-1', true);

    expect(result).toEqual({ success: false, error: 'Connection refused' });
  });
});

describe('updateWordProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sm2Result = {
    easeFactor: 2.5,
    interval: 6,
    repetitions: 2,
    nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
  };

  function setupUpdateMock(error: any = null, data: any = { id: 'row-1' }) {
    const mockSingle = jest.fn().mockResolvedValue({ data, error, count: data ? 1 : 0 });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq2 = jest.fn().mockReturnValue({ select: mockSelect });
    const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq1 });
    (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });
    return { mockUpdate, mockEq1, mockEq2, mockSelect, mockSingle };
  }

  it('calls supabase update on user_word_progress table', async () => {
    const { mockUpdate, mockEq1, mockEq2 } = setupUpdateMock();

    await updateWordProgress('user-1', 'word-1', sm2Result);

    expect(supabase.from).toHaveBeenCalledWith('user_word_progress');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        ease_factor: 2.5,
        interval: 6,
        repetitions: 2,
      })
    );
    expect(mockEq1).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mockEq2).toHaveBeenCalledWith('word_id', 'word-1');
  });

  it('sets status to learning for low interval', async () => {
    const { mockUpdate } = setupUpdateMock();

    await updateWordProgress('user-1', 'word-1', { ...sm2Result, interval: 5 });

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'learning' }));
  });

  it('sets status to review for interval >= 21 days', async () => {
    const { mockUpdate } = setupUpdateMock();

    await updateWordProgress('user-1', 'word-1', { ...sm2Result, interval: 21 });

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'review' }));
  });

  it('sets status to learning when repetitions is 0 (Again)', async () => {
    const { mockUpdate } = setupUpdateMock();

    await updateWordProgress('user-1', 'word-1', {
      ...sm2Result,
      repetitions: 0,
      interval: 1,
    });

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'learning' }));
  });

  it('returns success when update succeeds', async () => {
    setupUpdateMock(null);

    const result = await updateWordProgress('user-1', 'word-1', sm2Result);

    expect(result).toEqual({ success: true });
  });

  it('returns error when word progress record not found', async () => {
    setupUpdateMock(null, null);

    const result = await updateWordProgress('user-1', 'word-1', sm2Result);

    expect(result).toEqual({ success: false, error: 'Word progress record not found' });
  });

  it('returns error when update fails', async () => {
    setupUpdateMock({ message: 'Database error' });

    const result = await updateWordProgress('user-1', 'word-1', sm2Result);

    expect(result).toEqual({ success: false, error: 'Database error' });
  });

  it('handles thrown exceptions gracefully', async () => {
    (supabase.from as jest.Mock).mockImplementation(() => {
      throw new Error('Connection refused');
    });

    const result = await updateWordProgress('user-1', 'word-1', sm2Result);

    expect(result).toEqual({ success: false, error: 'Connection refused' });
  });
});
