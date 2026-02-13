import {
  calculateStreakStatus,
  calculateStreakWithFreeze,
  formatLocalDate,
  getEffectiveCurrentStreak,
  getNextFreezeDate,
  getTodayLocalDateString,
  isFreezeAvailable,
  shouldIncrementStreak,
} from '@/lib/utils/streak';

// Helper to create dates relative to "now"
function daysAgo(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return formatLocalDate(date);
}

function today(): string {
  return getTodayLocalDateString();
}

function yesterday(): string {
  return daysAgo(1);
}

describe('calculateStreakStatus', () => {
  it('returns "broken" when lastActivityDate is null', () => {
    expect(calculateStreakStatus(null, 5)).toBe('broken');
  });

  it('returns "active" when activity happened today', () => {
    expect(calculateStreakStatus(today(), 3)).toBe('active');
  });

  it('returns "at-risk" when last activity was yesterday', () => {
    expect(calculateStreakStatus(yesterday(), 3)).toBe('at-risk');
  });

  it('returns "broken" when last activity was 2+ days ago', () => {
    expect(calculateStreakStatus(daysAgo(2), 5)).toBe('broken');
    expect(calculateStreakStatus(daysAgo(10), 5)).toBe('broken');
  });

  it('returns "broken" when last activity was 30 days ago', () => {
    expect(calculateStreakStatus(daysAgo(30), 100)).toBe('broken');
  });
});

describe('local date helpers', () => {
  it('formats local date as YYYY-MM-DD with zero padding', () => {
    const date = new Date(2026, 1, 3); // 2026-02-03 local
    expect(formatLocalDate(date)).toBe('2026-02-03');
  });

  it('uses local calendar components and not toISOString', () => {
    const fakeDate = {
      getFullYear: () => 2026,
      getMonth: () => 1, // February
      getDate: () => 3,
      toISOString: () => '2099-12-31T00:00:00.000Z',
    } as unknown as Date;

    expect(formatLocalDate(fakeDate)).toBe('2026-02-03');
  });
});

describe('getEffectiveCurrentStreak', () => {
  it('returns 0 when streak status is broken with stale non-zero value', () => {
    expect(getEffectiveCurrentStreak(daysAgo(2), 7)).toBe(0);
  });

  it('returns unchanged streak when active', () => {
    expect(getEffectiveCurrentStreak(today(), 7)).toBe(7);
  });
});

describe('shouldIncrementStreak', () => {
  it('returns newStreak 1 when lastActivityDate is null (first ever activity)', () => {
    const result = shouldIncrementStreak(null, 0);
    expect(result).toEqual({ newStreak: 1, shouldUpdate: true });
  });

  it('returns same streak and shouldUpdate false when already active today', () => {
    const result = shouldIncrementStreak(today(), 5);
    expect(result).toEqual({ newStreak: 5, shouldUpdate: false });
  });

  it('increments streak by 1 when continuing from yesterday', () => {
    const result = shouldIncrementStreak(yesterday(), 3);
    expect(result).toEqual({ newStreak: 4, shouldUpdate: true });
  });

  it('resets to 1 when streak was broken (2+ days ago)', () => {
    const result = shouldIncrementStreak(daysAgo(2), 10);
    expect(result).toEqual({ newStreak: 1, shouldUpdate: true });
  });

  it('resets to 1 when streak was broken (many days ago)', () => {
    const result = shouldIncrementStreak(daysAgo(30), 50);
    expect(result).toEqual({ newStreak: 1, shouldUpdate: true });
  });

  it('handles first activity after null with correct streak start', () => {
    const result = shouldIncrementStreak(null, 0);
    expect(result.newStreak).toBe(1);
    expect(result.shouldUpdate).toBe(true);
  });

  it('continues streak when freeze bridges 2-day gap (freeze was yesterday)', () => {
    // Last activity 2 days ago, freeze used yesterday → freeze bridges the gap
    const result = shouldIncrementStreak(daysAgo(2), 5, yesterday());
    expect(result).toEqual({ newStreak: 6, shouldUpdate: true });
  });

  it('resets streak when freeze was 2+ days ago (not bridging)', () => {
    // Last activity 3 days ago, freeze 2 days ago → gap not fully bridged
    const result = shouldIncrementStreak(daysAgo(3), 5, daysAgo(2));
    expect(result).toEqual({ newStreak: 1, shouldUpdate: true });
  });

  it('ignores freeze when last activity was yesterday (normal continue)', () => {
    // Last activity yesterday, freeze also yesterday → normal continuation
    const result = shouldIncrementStreak(yesterday(), 3, yesterday());
    expect(result).toEqual({ newStreak: 4, shouldUpdate: true });
  });
});

describe('isFreezeAvailable', () => {
  it('returns true when freezeUsedAt is null (never used)', () => {
    expect(isFreezeAvailable(null)).toBe(true);
  });

  it('returns false when freeze was used today (same week)', () => {
    expect(isFreezeAvailable(today())).toBe(false);
  });

  it('returns false when freeze was used yesterday (same week, not Monday boundary)', () => {
    // This test is valid when yesterday and today are in the same ISO week
    const y = yesterday();
    const todayDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    // Only test if both are in the same week (yesterday wasn't Sunday with today being Monday)
    const todayDay = todayDate.getDay(); // 0=Sun, 1=Mon
    if (todayDay !== 1) {
      // Not Monday, so yesterday is in same week
      expect(isFreezeAvailable(y)).toBe(false);
    }
  });

  it('returns true when freeze was used in a previous week', () => {
    // Use a date guaranteed to be in a previous week (8 days ago)
    expect(isFreezeAvailable(daysAgo(8))).toBe(true);
  });

  it('returns true when freeze was used long ago', () => {
    expect(isFreezeAvailable(daysAgo(30))).toBe(true);
  });

  it('weekly reset: freeze used on Sunday becomes available next Monday', () => {
    // Sunday 2026-02-08 is in the week of Mon Feb 3
    // Monday 2026-02-09 starts a new week → freeze should be available
    // We test this via getNextFreezeDate: next Monday after Sunday Feb 8 is Feb 9
    const nextAvailable = getNextFreezeDate('2026-02-08');
    expect(nextAvailable).toBe('2026-02-09');
  });

  it('weekly reset: freeze used on Monday stays unavailable same week', () => {
    // Monday 2026-02-09 is in week starting Feb 9
    // Same-week check: if we check on the same Monday, it's the same week
    // isFreezeAvailable checks getWeekStartMonday for both dates
    // On Feb 9 (Mon), freeze used Feb 9 → same week → unavailable
    // We verify via getNextFreezeDate: next Monday is Feb 16
    const nextAvailable = getNextFreezeDate('2026-02-09');
    expect(nextAvailable).toBe('2026-02-16');
  });
});

describe('getNextFreezeDate', () => {
  it('returns next Monday after the freeze was used', () => {
    // If freeze used on Wednesday 2026-02-11, next Monday is 2026-02-16
    const result = getNextFreezeDate('2026-02-11');
    expect(result).toBe('2026-02-16');
  });

  it('returns next Monday when freeze used on Monday', () => {
    // Monday 2026-02-09 → next Monday 2026-02-16
    const result = getNextFreezeDate('2026-02-09');
    expect(result).toBe('2026-02-16');
  });

  it('returns next Monday when freeze used on Sunday', () => {
    // Sunday 2026-02-08 → next Monday 2026-02-09
    const result = getNextFreezeDate('2026-02-08');
    expect(result).toBe('2026-02-09');
  });
});

describe('calculateStreakWithFreeze', () => {
  it('returns "active" when activity happened today (freeze irrelevant)', () => {
    const result = calculateStreakWithFreeze(today(), null, 5);
    expect(result).toBe('active');
  });

  it('returns "active" when activity happened today even with freeze used', () => {
    const result = calculateStreakWithFreeze(today(), today(), 5);
    expect(result).toBe('active');
  });

  it('returns "frozen" when freeze was used yesterday (protecting streak)', () => {
    const result = calculateStreakWithFreeze(daysAgo(2), yesterday(), 5);
    expect(result).toBe('frozen');
  });

  it('returns "frozen" when freeze was used today (streak protected for today)', () => {
    const result = calculateStreakWithFreeze(yesterday(), today(), 5);
    expect(result).toBe('frozen');
  });

  it('returns "at-risk" when last activity was yesterday and no freeze', () => {
    const result = calculateStreakWithFreeze(yesterday(), null, 3);
    expect(result).toBe('at-risk');
  });

  it('returns "broken" when last activity was 2+ days ago and no freeze', () => {
    const result = calculateStreakWithFreeze(daysAgo(3), null, 5);
    expect(result).toBe('broken');
  });

  it('returns "broken" when freeze was used 2+ days ago (not protecting anymore)', () => {
    const result = calculateStreakWithFreeze(daysAgo(3), daysAgo(2), 5);
    expect(result).toBe('broken');
  });

  it('returns "broken" when freeze was used today but last activity is stale', () => {
    const result = calculateStreakWithFreeze(daysAgo(5), today(), 5);
    expect(result).toBe('broken');
  });

  it('returns "broken" when no activity date even with freeze', () => {
    const result = calculateStreakWithFreeze(null, yesterday(), 0);
    expect(result).toBe('broken');
  });
});
