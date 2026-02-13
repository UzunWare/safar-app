/**
 * Streak calculation utilities for daily learning streaks.
 * Uses device local timezone for day boundary comparisons.
 */

export type StreakStatus = 'active' | 'at-risk' | 'broken';
export type FreezeStreakStatus = StreakStatus | 'frozen';

/** Formats a Date using local calendar components (YYYY-MM-DD). */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns today's date as YYYY-MM-DD in local time. */
export function getTodayLocalDateString(): string {
  return formatLocalDate(new Date());
}

/**
 * Determines current streak status based on last activity date.
 * - active: User completed activity today
 * - at-risk: Last activity was yesterday (streak intact but needs activity today)
 * - broken: No activity or gap of 2+ days
 */
export function calculateStreakStatus(
  lastActivityDate: string | null,
  currentStreak: number
): StreakStatus {
  if (!lastActivityDate) return 'broken';

  const today = startOfDay(new Date());
  const lastActivity = startOfDay(parseLocalDate(lastActivityDate));
  const diffMs = today.getTime() - lastActivity.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'active';
  if (diffDays === 1) return 'at-risk';
  return 'broken';
}

/**
 * Returns the effective streak count for display/use.
 * Broken streaks are treated as 0, even if stale DB value is non-zero.
 */
export function getEffectiveCurrentStreak(
  lastActivityDate: string | null,
  currentStreak: number
): number {
  const status = calculateStreakStatus(lastActivityDate, currentStreak);
  return status === 'broken' ? 0 : currentStreak;
}

/**
 * Determines whether to increment the streak and what the new value should be.
 * Called when user completes an activity (lesson or review).
 */
export function shouldIncrementStreak(
  lastActivityDate: string | null,
  currentStreak: number,
  freezeUsedAt?: string | null
): { newStreak: number; shouldUpdate: boolean } {
  if (!lastActivityDate) {
    return { newStreak: 1, shouldUpdate: true };
  }

  const today = startOfDay(new Date());
  const lastActivity = startOfDay(parseLocalDate(lastActivityDate));
  const diffMs = today.getTime() - lastActivity.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already recorded activity today
    return { newStreak: currentStreak, shouldUpdate: false };
  }

  if (diffDays === 1) {
    // Continuing streak from yesterday
    return { newStreak: currentStreak + 1, shouldUpdate: true };
  }

  // Check if freeze bridges a 2-day gap
  if (diffDays === 2 && freezeUsedAt) {
    const freezeDate = startOfDay(parseLocalDate(freezeUsedAt));
    const freezeDiffMs = today.getTime() - freezeDate.getTime();
    const freezeDiffDays = Math.round(freezeDiffMs / (1000 * 60 * 60 * 24));

    if (freezeDiffDays === 1) {
      // Freeze was used yesterday, bridging the gap
      return { newStreak: currentStreak + 1, shouldUpdate: true };
    }
  }

  // Streak was broken, starting new
  return { newStreak: 1, shouldUpdate: true };
}

/** Returns a Date set to midnight local time */
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Parses a YYYY-MM-DD date string as local time (not UTC).
 * new Date('2026-02-10') parses as UTC which causes timezone issues.
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Returns the Monday (start of ISO week) for a given date.
 * Monday = 1, Sunday = 0 (adjusted to 7 for week start calculation).
 */
function getWeekStartMonday(date: Date): Date {
  const d = startOfDay(new Date(date));
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // days since Monday
  d.setDate(d.getDate() - diff);
  return d;
}

/**
 * Checks if a streak freeze is available this week.
 * Returns true if freeze hasn't been used this calendar week (Monday start).
 * Story 5.3: Streak Freeze — Task 4
 */
export function isFreezeAvailable(freezeUsedAt: string | null): boolean {
  if (!freezeUsedAt) return true;

  const usedDate = parseLocalDate(freezeUsedAt);
  const today = new Date();

  const currentWeekStart = getWeekStartMonday(today);
  const usedWeekStart = getWeekStartMonday(usedDate);

  // Freeze is available if used in a different week
  return currentWeekStart.getTime() !== usedWeekStart.getTime();
}

/**
 * Returns the date string (YYYY-MM-DD) of the next Monday after the freeze was used.
 * This is when the freeze becomes available again.
 * Story 5.3: Streak Freeze — Task 4
 */
export function getNextFreezeDate(freezeUsedAt: string): string {
  const usedDate = parseLocalDate(freezeUsedAt);
  const weekStart = getWeekStartMonday(usedDate);
  weekStart.setDate(weekStart.getDate() + 7); // Next Monday
  return formatLocalDate(weekStart);
}

/**
 * Extended streak status calculation that accounts for streak freeze.
 * - active: Activity happened today
 * - frozen: Freeze was used today or yesterday, protecting the streak
 * - at-risk: Last activity was yesterday, no freeze protecting
 * - broken: Gap of 2+ days with no freeze protection
 * Story 5.3: Streak Freeze — Task 7
 */
export function calculateStreakWithFreeze(
  lastActivityDate: string | null,
  freezeUsedAt: string | null,
  currentStreak: number
): FreezeStreakStatus {
  if (!lastActivityDate) return 'broken';

  const today = startOfDay(new Date());
  const lastActivity = startOfDay(parseLocalDate(lastActivityDate));
  const diffMs = today.getTime() - lastActivity.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Activity today — always active regardless of freeze
  if (diffDays === 0) return 'active';

  // Check if freeze protects the streak.
  // A freeze only protects:
  // - today when last activity was yesterday and freeze used today
  // - yesterday when last activity was 2 days ago and freeze used yesterday
  if (freezeUsedAt) {
    const freezeDate = startOfDay(parseLocalDate(freezeUsedAt));
    const freezeDiffMs = today.getTime() - freezeDate.getTime();
    const freezeDiffDays = Math.round(freezeDiffMs / (1000 * 60 * 60 * 24));

    const protectsToday = diffDays === 1 && freezeDiffDays === 0;
    const bridgesYesterday = diffDays === 2 && freezeDiffDays === 1;

    if (protectsToday || bridgesYesterday) {
      return 'frozen';
    }
  }

  // Normal streak logic
  if (diffDays === 1) return 'at-risk';
  return 'broken';
}
