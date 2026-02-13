import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LearningState {
  currentLessonId: string | null;
  currentWordIndex: number;
  isComplete: boolean;

  setLesson: (lessonId: string) => void;
  nextWord: () => void;
  previousWord: () => void;
  setWordIndex: (index: number) => void;
  completeLesson: () => void;
  resetLesson: () => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      currentLessonId: null,
      currentWordIndex: 0,
      isComplete: false,

      setLesson: (lessonId) =>
        set({ currentLessonId: lessonId, currentWordIndex: 0, isComplete: false }),

      nextWord: () =>
        set((state) => (state.isComplete ? {} : { currentWordIndex: state.currentWordIndex + 1 })),

      previousWord: () =>
        set((state) => ({ currentWordIndex: Math.max(0, state.currentWordIndex - 1) })),

      setWordIndex: (index) => set({ currentWordIndex: index }),

      completeLesson: () => set({ isComplete: true }),

      resetLesson: () => set({ currentLessonId: null, currentWordIndex: 0, isComplete: false }),
    }),
    {
      name: 'learning-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
