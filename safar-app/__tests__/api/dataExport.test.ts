import { requestDataExport, getExportRequestStatus } from '@/lib/api/dataExport';

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

describe('Data Export API (Story 7.7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestDataExport', () => {
    it('calls supabase edge function without body (user from JWT)', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

      await requestDataExport();

      expect(mockInvoke).toHaveBeenCalledWith('request-data-export');
    });

    it('returns success on successful invocation', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

      const result = await requestDataExport();

      expect(result).toEqual({ success: true });
    });

    it('passes through duplicate detection message from edge function', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: true, message: 'An export request is already being processed.' },
        error: null,
      });

      const result = await requestDataExport();

      expect(result).toEqual({
        success: true,
        message: 'An export request is already being processed.',
      });
    });

    it('returns error when edge function returns error', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Function error' },
      });

      const result = await requestDataExport();

      expect(result).toEqual({ success: false, error: 'Function error' });
    });

    it('returns error when invocation throws', async () => {
      mockInvoke.mockRejectedValue(new Error('Network error'));

      const result = await requestDataExport();

      expect(result).toEqual({
        success: false,
        error: 'Failed to request data export. Please try again.',
      });
    });
  });

  describe('getExportRequestStatus', () => {
    it('returns export request status when found', async () => {
      const mockData = {
        id: 'req-1',
        status: 'pending',
        requested_at: '2026-02-13T10:00:00Z',
        completed_at: null,
      };
      mockSingle.mockResolvedValue({ data: mockData, error: null });

      const result = await getExportRequestStatus('user-123');

      expect(result).toEqual(mockData);
      expect(mockSelect).toHaveBeenCalledWith('id, status, requested_at, completed_at');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('returns null when no export request exists', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      const result = await getExportRequestStatus('user-123');

      expect(result).toBeNull();
    });

    it('returns null when query throws', async () => {
      mockSingle.mockRejectedValue(new Error('DB error'));

      const result = await getExportRequestStatus('user-123');

      expect(result).toBeNull();
    });
  });
});
