/**
 * Learning State Utilities
 *
 * Derives word learning states from SM-2 progress values.
 * States: new, learning, review, mastered
 *
 * Story 4.6: Word Learning States
 * FIXED: Code review issue #1/#2 - Use Divine Geometry palette from constants
 */

import { colors } from '@/constants/colors';

export type LearningState = 'new' | 'learning' | 'review' | 'mastered';

interface WordProgress {
  repetitions: number;
  interval: number;
}

/**
 * Determine the learning state of a word based on SM-2 progress.
 *
 * AC#1: State logic
 * - New: never reviewed (repetitions=0) or null progress
 * - Learning: reviewed 1-2 times (repetitions 1-2)
 * - Review: reviewed 3+ times (repetitions >= 3, interval < 7 days)
 * - Mastered: interval >= 7 days (highest priority)
 *
 * Priority order: mastered > learning > review > new
 */
export function getWordState(progress: WordProgress | null): LearningState {
  if (!progress || progress.repetitions === 0) {
    return 'new';
  }

  // Mastered has highest priority (AC#2: North Star metric)
  if (progress.interval >= 7) {
    return 'mastered';
  }

  // Learning: repetitions 1-2 with interval < 7
  if (progress.repetitions <= 2) {
    return 'learning';
  }

  // Review: repetitions >= 3 with interval < 7
  return 'review';
}

/**
 * Divine Geometry color mapping for learning states.
 * Uses brand colors from constants instead of generic Tailwind colors.
 * AC#1: Color coding for visual indicators
 */
const STATE_COLOR_MAP: Record<LearningState, string> = {
  new: colors.black[20], // Subtle gray from Divine Geometry palette
  learning: colors.gold, // Brand gold for active learning
  review: colors.rating.hard, // Warm amber from rating system
  mastered: colors.emeraldDeep, // Brand emerald for mastery
};

/**
 * Get the color for a learning state.
 * AC#1: Color coding for visual indicators
 */
export function getStateColor(state: LearningState): string {
  return STATE_COLOR_MAP[state];
}

/**
 * Get the display label for a learning state.
 * AC#1: User-facing labels
 */
export function getStateLabel(state: LearningState): string {
  const labels: Record<LearningState, string> = {
    new: 'New',
    learning: 'Learning',
    review: 'Review',
    mastered: 'Mastered',
  };
  return labels[state];
}
