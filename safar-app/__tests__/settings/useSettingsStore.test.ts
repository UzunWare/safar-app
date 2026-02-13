/**
 * useSettingsStore Tests
 *
 * Story 7.1: Tasks 4-6 - Settings store with persistence and sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock supabase
const mockSelect = jest.fn();
const mockUpsert = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: (...args: any[]) => {
        mockSelect(...args);
        return {
          eq: (...eqArgs: any[]) => {
            mockEq(...eqArgs);
            return {
              single: () => mockSingle(),
            };
          },
        };
      },
      upsert: (...args: any[]) => mockUpsert(...args),
    })),
  },
}));

// Mock useAuthStore
jest.mock('@/lib/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      session: { user: { id: 'test-user-id' } },
    })),
  },
}));

// Need to import after mocks are set up
import { useSettingsStore } from '@/lib/stores/useSettingsStore';

describe('useSettingsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to defaults
    useSettingsStore.setState({
      streakReminders: true,
      reviewReminders: true,
      learningReminders: true,
      soundEnabled: true,
      isLoaded: false,
    });
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockUpsert.mockResolvedValue({ data: null, error: null });
  });

  // === Task 4: Store creation and defaults ===

  describe('Task 4: Store defaults and structure', () => {
    it('has correct default values', () => {
      const state = useSettingsStore.getState();
      expect(state.streakReminders).toBe(true);
      expect(state.reviewReminders).toBe(true);
      expect(state.learningReminders).toBe(true);
      expect(state.soundEnabled).toBe(true);
      expect(state.isLoaded).toBe(false);
    });

    it('exposes updateSetting action', () => {
      const state = useSettingsStore.getState();
      expect(typeof state.updateSetting).toBe('function');
    });

    it('exposes loadSettings action', () => {
      const state = useSettingsStore.getState();
      expect(typeof state.loadSettings).toBe('function');
    });

    it('exposes syncSettings action', () => {
      const state = useSettingsStore.getState();
      expect(typeof state.syncSettings).toBe('function');
    });
  });

  // === Task 4: UpdateSetting ===

  describe('Task 4: updateSetting', () => {
    it('updates streakReminders', async () => {
      await useSettingsStore.getState().updateSetting('streakReminders', false);
      expect(useSettingsStore.getState().streakReminders).toBe(false);
    });

    it('updates reviewReminders', async () => {
      await useSettingsStore.getState().updateSetting('reviewReminders', false);
      expect(useSettingsStore.getState().reviewReminders).toBe(false);
    });

    it('updates soundEnabled', async () => {
      await useSettingsStore.getState().updateSetting('soundEnabled', false);
      expect(useSettingsStore.getState().soundEnabled).toBe(false);
    });
  });

  // === Task 5: Load settings from server ===

  describe('Task 5: loadSettings', () => {
    it('loads settings from Supabase', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          streak_reminders: false,
          review_reminders: false,
          sound_enabled: false,
        },
        error: null,
      });

      await useSettingsStore.getState().loadSettings();

      const state = useSettingsStore.getState();
      expect(state.streakReminders).toBe(false);
      expect(state.reviewReminders).toBe(false);
      expect(state.soundEnabled).toBe(false);
      expect(state.isLoaded).toBe(true);
    });

    it('keeps defaults when no server data exists', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: null });

      await useSettingsStore.getState().loadSettings();

      const state = useSettingsStore.getState();
      expect(state.streakReminders).toBe(true);
      expect(state.reviewReminders).toBe(true);
      expect(state.soundEnabled).toBe(true);
      expect(state.isLoaded).toBe(true);
    });

    it('handles load errors gracefully', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Network error' } });

      await useSettingsStore.getState().loadSettings();

      // Should still mark as loaded and keep defaults
      const state = useSettingsStore.getState();
      expect(state.isLoaded).toBe(true);
      expect(state.streakReminders).toBe(true);
    });
  });

  // === Task 6: Settings persistence ===

  describe('Task 6: syncSettings', () => {
    it('syncs settings to Supabase on update', async () => {
      await useSettingsStore.getState().updateSetting('streakReminders', false);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user-id',
          streak_reminders: false,
        }),
        expect.anything()
      );
    });

    it('throws when Supabase returns an error response', async () => {
      mockUpsert.mockResolvedValueOnce({ data: null, error: { message: 'Write failed' } });

      await expect(useSettingsStore.getState().syncSettings()).rejects.toThrow('Write failed');
    });

    it('handles sync errors gracefully without crashing', async () => {
      mockUpsert.mockResolvedValueOnce({ data: null, error: { message: 'Network error' } });

      // Should not throw - updateSetting catches sync errors
      await useSettingsStore.getState().updateSetting('soundEnabled', false);

      // Local state should still be updated despite sync failure
      expect(useSettingsStore.getState().soundEnabled).toBe(false);
    });
  });
});
