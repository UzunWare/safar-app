/**
 * useWordState Hook
 *
 * Derives the learning state for a word from its progress data.
 * Wraps useWordProgress and applies getWordState logic.
 *
 * Story 4.6: Word Learning States - Task 3
 */

import { useWordProgress } from './useWordProgress';
import { getWordState, type LearningState } from '@/lib/utils/learningState';

interface UseWordStateResult {
  state: LearningState;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Get the current learning state for a word.
 * AC#1: Returns new, learning, review, or mastered based on SM-2 progress.
 */
export function useWordState(wordId: string): UseWordStateResult {
  const { data: progress, isLoading, isError, error } = useWordProgress(wordId);

  // Handle both database format (ease_factor) and local format (easeFactor)
  const normalizedProgress = progress
    ? {
        repetitions: progress.repetitions,
        interval: progress.interval,
      }
    : null;

  const state = getWordState(normalizedProgress);

  return {
    state,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
