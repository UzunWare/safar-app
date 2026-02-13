/**
 * Settings Store
 * Story 7.1 - User preferences with AsyncStorage persistence and Supabase sync
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/lib/stores/useAuthStore';

interface SettingsState {
  // Preferences
  streakReminders: boolean;
  reviewReminders: boolean;
  learningReminders: boolean;
  soundEnabled: boolean;

  // Meta
  isLoaded: boolean;

  // Actions
  updateSetting: (key: string, value: any) => Promise<void>;
  loadSettings: () => Promise<void>;
  syncSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      streakReminders: true,
      reviewReminders: true,
      learningReminders: true,
      soundEnabled: true,
      isLoaded: false,

      updateSetting: async (key: string, value: any) => {
        set({ [key]: value });
        try {
          await get().syncSettings();
        } catch {
          // Sync failure is non-blocking; local state already updated
        }
      },

      loadSettings: async () => {
        try {
          const userId = useAuthStore.getState().session?.user?.id;
          if (!userId) {
            set({ isLoaded: true });
            return;
          }

          const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (data && !error) {
            set({
              streakReminders: data.streak_reminders ?? true,
              reviewReminders: data.review_reminders ?? true,
              learningReminders: data.learning_reminders ?? true,
              soundEnabled: data.sound_enabled ?? true,
            });
          }
        } catch {
          // Keep defaults on error
        } finally {
          set({ isLoaded: true });
        }
      },

      syncSettings: async () => {
        const userId = useAuthStore.getState().session?.user?.id;
        if (!userId) return;

        const state = get();
        const { error } = await supabase.from('user_settings').upsert(
          {
            user_id: userId,
            streak_reminders: state.streakReminders,
            review_reminders: state.reviewReminders,
            learning_reminders: state.learningReminders,
            sound_enabled: state.soundEnabled,
          },
          { onConflict: 'user_id' }
        );

        if (error) {
          throw new Error(error.message);
        }
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        streakReminders: state.streakReminders,
        reviewReminders: state.reviewReminders,
        learningReminders: state.learningReminders,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);
