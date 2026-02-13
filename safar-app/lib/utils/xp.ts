/**
 * XP Points System - Constants and Calculation Utilities
 * Story 5.4: XP Points System
 */

export const XP_VALUES = {
  LESSON_COMPLETE: 10,
  WORD_REVIEWED: 1,
  REVIEW_BONUS_THRESHOLD: 10,
  REVIEW_BONUS_XP: 5,
} as const;

/** Returns XP awarded for completing a lesson */
export function calculateLessonXp(): number {
  return XP_VALUES.LESSON_COMPLETE;
}

function normalizeWordsReviewed(wordsReviewed: number): number {
  if (!Number.isFinite(wordsReviewed)) return 0;
  return Math.max(0, Math.floor(wordsReviewed));
}

/** Calculates XP earned from a review session */
export function calculateReviewXp(wordsReviewed: number): number {
  const normalizedWords = normalizeWordsReviewed(wordsReviewed);
  let xp = normalizedWords * XP_VALUES.WORD_REVIEWED;

  if (normalizedWords >= XP_VALUES.REVIEW_BONUS_THRESHOLD) {
    xp += XP_VALUES.REVIEW_BONUS_XP;
  }

  return xp;
}
