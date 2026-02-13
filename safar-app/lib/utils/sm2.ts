/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Maps 4-button difficulty ratings to SM-2 quality values:
 *   Again (0) → quality 2: Reset interval, decrease EF
 *   Hard  (1) → quality 3: Small interval, slight EF decrease
 *   Good  (2) → quality 4: Normal interval, maintain EF
 *   Easy  (3) → quality 5: Large interval, increase EF
 */

export type DifficultyRating = 0 | 1 | 2 | 3;

export interface SM2Input {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string; // ISO date string
}

const MIN_EASE_FACTOR = 1.3;
const EASY_BONUS = 1.3;

/** Map 4-button rating (0-3) to SM-2 quality (2-5) */
function toSM2Quality(rating: DifficultyRating): number {
  return rating + 2;
}

/**
 * Calculate new ease factor using SM-2 formula.
 * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 */
function calculateEaseFactor(currentEF: number, quality: number): number {
  const diff = 5 - quality;
  const newEF = currentEF + (0.1 - diff * (0.08 + diff * 0.02));
  return Math.max(MIN_EASE_FACTOR, Math.round(newEF * 100) / 100);
}

/**
 * Calculate the next review state after a difficulty rating.
 */
export function calculateNextReview(rating: DifficultyRating, current: SM2Input): SM2Result {
  const quality = toSM2Quality(rating);

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    // Again: reset
    newInterval = 1;
    newRepetitions = 0;
  } else {
    // Hard, Good, Easy: progress — interval uses CURRENT EF per SM-2 spec
    newRepetitions = current.repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(current.interval * current.easeFactor);
    }

    // Easy bonus multiplier
    if (rating === 3) {
      newInterval = Math.round(newInterval * EASY_BONUS);
    }
  }

  // EF updated AFTER interval calculation per SM-2 spec
  const newEF = calculateEaseFactor(current.easeFactor, quality);

  const now = new Date();
  const nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  return {
    easeFactor: newEF,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview: nextReviewDate.toISOString(),
  };
}

/**
 * Get default SM-2 values for a new word entering the review system.
 * AC#1: ease_factor=2.5, interval=1, repetitions=0
 */
export function getDefaultProgress(): SM2Input {
  return {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  };
}

/** Threshold in days for transitioning from 'learning' to 'review' status */
export const REVIEW_INTERVAL_THRESHOLD = 21;

/** Derive word status from SM-2 state. Mastered logic deferred to Story 4-6. */
export function deriveWordStatus(repetitions: number, interval: number): 'learning' | 'review' {
  if (repetitions === 0) return 'learning';
  return interval >= REVIEW_INTERVAL_THRESHOLD ? 'review' : 'learning';
}

/**
 * Format an interval in days to a human-readable string.
 * Examples: "Now", "1d", "6d", "2w", "1mo"
 */
export function formatInterval(days: number): string {
  if (days === 0) return 'Now';
  if (days === 1) return '1d';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}
