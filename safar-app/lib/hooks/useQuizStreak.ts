import { useState, useCallback } from 'react';

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  /** Fires when a streak milestone (3 or 5) is reached */
  milestoneReached: number | null;
}

const STREAK_MILESTONES = [3, 5];

export function useQuizStreak() {
  const [state, setState] = useState<StreakState>({
    currentStreak: 0,
    bestStreak: 0,
    milestoneReached: null,
  });

  const recordCorrect = useCallback(() => {
    setState((prev) => {
      const newStreak = prev.currentStreak + 1;
      const newBest = Math.max(prev.bestStreak, newStreak);
      const milestone = STREAK_MILESTONES.includes(newStreak) ? newStreak : null;
      return {
        currentStreak: newStreak,
        bestStreak: newBest,
        milestoneReached: milestone,
      };
    });
  }, []);

  const recordIncorrect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStreak: 0,
      milestoneReached: null,
    }));
  }, []);

  const clearMilestone = useCallback(() => {
    setState((prev) => ({ ...prev, milestoneReached: null }));
  }, []);

  const reset = useCallback(() => {
    setState({ currentStreak: 0, bestStreak: 0, milestoneReached: null });
  }, []);

  return {
    ...state,
    recordCorrect,
    recordIncorrect,
    clearMilestone,
    reset,
  };
}
