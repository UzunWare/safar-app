import { requestDataDeletion, getDeletionRequestStatus } from '@/lib/api/dataDeletion';

// Mock supabase with chainable query builder
const mockInvoke = jest.fn();
const mockSingle = jest.fn();
const mockLimit = jest.fn().mockReturnValue({ single: mockSingle });
const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

jest.mock('@/lib/api/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
    from: () => ({
      select: (...args: any[]) => mockSelect(...args),
    }),
  },
}));

describe('Data Deletion API (Story 7.8)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestDataDeletion', () => {
    it('calls supabase edge function without body (user from JWT)', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

      await requestDataDeletion();

      expect(mockInvoke).toHaveBeenCalledWith('request-data-deletion');
    });

    it('returns success on successful invocation', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

      const result = await requestDataDeletion();

      expect(result).toEqual({ success: true });
    });

    it('passes through duplicate detection message from edge function', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: true, message: 'A deletion request is already being processed.' },
        error: null,
      });

      const result = await requestDataDeletion();

      expect(result).toEqual({
        success: true,
        message: 'A deletion request is already being processed.',
      });
    });

    it('returns error when edge function returns error', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Function error' },
      });

      const result = await requestDataDeletion();

      expect(result).toEqual({ success: false, error: 'Function error' });
    });

    it('returns error when invocation throws', async () => {
      mockInvoke.mockRejectedValue(new Error('Network error'));

      const result = await requestDataDeletion();

      expect(result).toEqual({
        success: false,
        error: 'Failed to request data deletion. Please try again.',
      });
    });
  });

  describe('getDeletionRequestStatus', () => {
    it('returns deletion request status when found', async () => {
      const mockData = {
        id: 'req-1',
        status: 'pending',
        requested_at: '2026-02-13T10:00:00Z',
        completed_at: null,
      };
      mockSingle.mockResolvedValue({ data: mockData, error: null });

      const result = await getDeletionRequestStatus('user-123');

      expect(result).toEqual(mockData);
      expect(mockSelect).toHaveBeenCalledWith('id, status, requested_at, completed_at');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('returns null when no deletion request exists', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      const result = await getDeletionRequestStatus('user-123');

      expect(result).toBeNull();
    });

    it('returns null when query throws', async () => {
      mockSingle.mockRejectedValue(new Error('DB error'));

      const result = await getDeletionRequestStatus('user-123');

      expect(result).toBeNull();
    });
  });
});
