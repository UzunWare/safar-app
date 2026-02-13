import { XP_VALUES, calculateLessonXp, calculateReviewXp } from '@/lib/utils/xp';

describe('XP_VALUES', () => {
  it('defines lesson completion XP as 10', () => {
    expect(XP_VALUES.LESSON_COMPLETE).toBe(10);
  });

  it('defines word reviewed XP as 1', () => {
    expect(XP_VALUES.WORD_REVIEWED).toBe(1);
  });

  it('defines review bonus threshold as 10', () => {
    expect(XP_VALUES.REVIEW_BONUS_THRESHOLD).toBe(10);
  });

  it('defines review bonus XP as 5', () => {
    expect(XP_VALUES.REVIEW_BONUS_XP).toBe(5);
  });
});

describe('calculateLessonXp', () => {
  it('returns 10 XP for lesson completion', () => {
    expect(calculateLessonXp()).toBe(10);
  });
});

describe('calculateReviewXp', () => {
  it('returns 1 XP per word reviewed', () => {
    expect(calculateReviewXp(1)).toBe(1);
    expect(calculateReviewXp(5)).toBe(5);
    expect(calculateReviewXp(9)).toBe(9);
  });

  it('adds 5 XP bonus when reviewing 10+ words', () => {
    expect(calculateReviewXp(10)).toBe(15); // 10 * 1 + 5
    expect(calculateReviewXp(15)).toBe(20); // 15 * 1 + 5
  });

  it('adds bonus at exactly the threshold', () => {
    expect(calculateReviewXp(10)).toBe(15);
  });

  it('does not add bonus below threshold', () => {
    expect(calculateReviewXp(9)).toBe(9);
  });

  it('returns 0 XP for 0 words reviewed', () => {
    expect(calculateReviewXp(0)).toBe(0);
  });

  it('returns 0 XP for invalid or negative values', () => {
    expect(calculateReviewXp(-5)).toBe(0);
    expect(calculateReviewXp(Number.NaN)).toBe(0);
    expect(calculateReviewXp(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('rounds down fractional review counts', () => {
    expect(calculateReviewXp(9.9)).toBe(9);
    expect(calculateReviewXp(10.4)).toBe(15);
  });
});
