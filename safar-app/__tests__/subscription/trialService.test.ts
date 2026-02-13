/**
 * Trial Service Tests
 *
 * Story 6.2: Free Trial Period - Task 3
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/api/supabase';

// Must import after mocks are set up by jest.setup.ts
import {
  trackTrialStart,
  hasTrialBeenTracked,
  getLocalTrialStatus,
  TRIAL_TRACKED_KEY,
  TRIAL_START_KEY,
  LOCAL_TRIAL_DAYS,
} from '@/lib/subscription/trialService';

describe('trialService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackTrialStart', () => {
    it('should update user profile with trial_started_at', async () => {
      const mockEq = jest.fn(() => Promise.resolve({ data: null, error: null }));
      const mockUpdate = jest.fn(() => ({ eq: mockEq }));
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      await trackTrialStart('user-123');

      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          trial_started_at: expect.any(String),
        })
      );
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
    });

    it('should store trial tracked flag in AsyncStorage', async () => {
      const mockEq = jest.fn(() => Promise.resolve({ data: null, error: null }));
      const mockUpdate = jest.fn(() => ({ eq: mockEq }));
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      await trackTrialStart('user-123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(TRIAL_TRACKED_KEY, 'true');
    });

    it('should store trial start date in AsyncStorage', async () => {
      const mockEq = jest.fn(() => Promise.resolve({ data: null, error: null }));
      const mockUpdate = jest.fn(() => ({ eq: mockEq }));
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await trackTrialStart('user-123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        TRIAL_START_KEY,
        expect.any(String)
      );
    });

    it('should not overwrite existing trial start date', async () => {
      const mockEq = jest.fn(() => Promise.resolve({ data: null, error: null }));
      const mockUpdate = jest.fn(() => ({ eq: mockEq }));
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('2026-01-01T00:00:00.000Z');

      await trackTrialStart('user-123');

      // Should not overwrite existing start date
      expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
        TRIAL_START_KEY,
        expect.any(String)
      );
    });

    it('should not throw on supabase error (graceful degradation)', async () => {
      const mockEq = jest.fn(() =>
        Promise.resolve({ data: null, error: { message: 'Network error' } })
      );
      const mockUpdate = jest.fn(() => ({ eq: mockEq }));
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      // Should not throw
      await expect(trackTrialStart('user-123')).resolves.not.toThrow();
    });

    it('should still set AsyncStorage flag even if supabase fails', async () => {
      const mockEq = jest.fn(() =>
        Promise.resolve({ data: null, error: { message: 'Network error' } })
      );
      const mockUpdate = jest.fn(() => ({ eq: mockEq }));
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      await trackTrialStart('user-123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(TRIAL_TRACKED_KEY, 'true');
    });

    it('should not throw if userId is empty', async () => {
      await expect(trackTrialStart('')).resolves.not.toThrow();
    });

    it('should not call supabase if userId is empty', async () => {
      await trackTrialStart('');
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('getLocalTrialStatus', () => {
    it('should return inactive when no start date stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const status = await getLocalTrialStatus();
      expect(status).toEqual({
        isActive: false,
        expirationDate: null,
        daysRemaining: 0,
      });
    });

    it('should return active with correct days remaining when within trial period', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(twoDaysAgo);

      const status = await getLocalTrialStatus();
      expect(status.isActive).toBe(true);
      expect(status.daysRemaining).toBe(5);
      expect(status.expirationDate).not.toBeNull();
    });

    it('should return active with 7 days remaining when just started', async () => {
      const justNow = new Date().toISOString();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(justNow);

      const status = await getLocalTrialStatus();
      expect(status.isActive).toBe(true);
      expect(status.daysRemaining).toBe(LOCAL_TRIAL_DAYS);
      expect(status.expirationDate).not.toBeNull();
    });

    it('should return inactive when trial has expired', async () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(eightDaysAgo);

      const status = await getLocalTrialStatus();
      expect(status.isActive).toBe(false);
      expect(status.daysRemaining).toBe(0);
      expect(status.expirationDate).not.toBeNull();
    });

    it('should return inactive on AsyncStorage error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const status = await getLocalTrialStatus();
      expect(status).toEqual({
        isActive: false,
        expirationDate: null,
        daysRemaining: 0,
      });
    });

    it('should return 1 day remaining on last day of trial', async () => {
      // 6.5 days ago → 0.5 days remaining → ceil → 1
      const almostExpired = new Date(
        Date.now() - 6.5 * 24 * 60 * 60 * 1000
      ).toISOString();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(almostExpired);

      const status = await getLocalTrialStatus();
      expect(status.isActive).toBe(true);
      expect(status.daysRemaining).toBe(1);
    });
  });

  describe('hasTrialBeenTracked', () => {
    it('should return true when trial has been tracked', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

      const result = await hasTrialBeenTracked();
      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(TRIAL_TRACKED_KEY);
    });

    it('should return false when trial has not been tracked', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await hasTrialBeenTracked();
      expect(result).toBe(false);
    });

    it('should return false on AsyncStorage error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await hasTrialBeenTracked();
      expect(result).toBe(false);
    });
  });
});
