# Story 5.2: Streak Tracking

Status: done

## Story

As a learner,
I want my daily learning streak tracked,
so that I am motivated to learn every day.

## Acceptance Criteria

1. **Given** I complete at least one learning session (lesson or review), **When** the day ends (midnight local time), **Then** my streak increments by 1 if I had activity today, or resets to 0 if I had no activity
2. **Given** I am on a streak, **When** viewing the Home screen, **Then** I see my streak count with a flame icon and "Day X" or "X day streak" text
3. **Given** my streak is at risk (no activity today, evening time), **When** viewing the app, **Then** I see a subtle reminder (not guilt-tripping)
4. **Given** I break my streak, **When** I return to the app, **Then** I see "Welcome back!" message, "Your knowledge is still here. X words ready for review.", no shame messaging, and my new streak starts at 1 after completing a session

## Tasks / Subtasks

- [x] Task 1: Create user_streaks table (AC: #1)
  - [x] Create migration for user_streaks
  - [x] Fields: user_id, current_streak, longest_streak, last_activity_date, freeze_used_at
  - [x] Add RLS policies

- [x] Task 2: Implement streak calculation logic (AC: #1)
  - [x] Compare last_activity_date with today
  - [x] Use device local timezone for day boundaries
  - [x] Increment if activity today
  - [x] Reset if no activity yesterday

- [x] Task 3: Create useStreak hook (AC: #1, #2)
  - [x] Query user_streaks table
  - [x] Calculate current status
  - [x] Return streak count and status

- [x] Task 4: Track activity for streak (AC: #1)
  - [x] On lesson completion, update last_activity_date
  - [x] On review completion, update last_activity_date
  - [x] Update streak count

- [x] Task 5: Display streak on Home screen (AC: #2)
  - [x] Use StreakCounter component
  - [x] Show flame icon + count
  - [x] Add "X day streak" text

- [x] Task 6: Implement streak at-risk indicator (AC: #3)
  - [x] Check if evening and no activity today
  - [x] Show subtle reminder banner
  - [x] No guilt-tripping tone

- [x] Task 7: Handle broken streak gracefully (AC: #4)
  - [x] Detect when streak was broken
  - [x] Show "Welcome back!" message
  - [x] Show words ready for review
  - [x] No shame messaging

- [x] Task 8: Update streak on activity
  - [x] Increment current_streak
  - [x] Update longest_streak if new record
  - [x] Update last_activity_date

### Review Follow-ups (AI)

- [x] [AI-Review][HIGH] Use local calendar date (not UTC `toISOString`) when writing `last_activity_date`; add regression tests around timezone boundaries. [safar-app/lib/api/streak.ts:83]
- [x] [AI-Review][HIGH] Implement day-end reset semantics so streak state is `0` after a missed day (before the next activity), matching AC #1. [safar-app/lib/utils/streak.ts:34]
- [x] [AI-Review][HIGH] Fix broken-streak UX gating: ensure "Welcome back!" appears for broken streaks and stale streak values are not shown as active. [safar-app/app/(tabs)/index.tsx:353]
- [x] [AI-Review][MEDIUM] Make streak row creation idempotent (`upsert` or explicit conflict handling) to avoid race failures on first-load concurrency. [safar-app/lib/api/streak.ts:34]
- [x] [AI-Review][MEDIUM] Expand tests for local-day boundaries and broken-streak UI behavior; current date helpers use UTC and miss this regression class. [safar-app/__tests__/api/streak.test.ts:6]

## Dev Notes

### Architecture Patterns

- **Timezone Handling**: Use device local time for day boundaries
- **Graceful Messaging**: Never shame users for broken streaks
- **Local First**: Calculate locally, sync to server

### Database Schema

```sql
-- User streaks table
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  freeze_used_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own streaks"
  ON user_streaks FOR ALL
  USING (auth.uid() = user_id);
```

### Code Patterns

```typescript
// lib/utils/streak.ts
export function calculateStreakStatus(
  lastActivityDate: string | null,
  currentStreak: number
): 'active' | 'at-risk' | 'broken' {
  if (!lastActivityDate) return 'broken';

  const today = startOfDay(new Date());
  const lastActivity = startOfDay(new Date(lastActivityDate));
  const yesterday = subDays(today, 1);

  if (isSameDay(lastActivity, today)) {
    return 'active'; // Already did activity today
  }

  if (isSameDay(lastActivity, yesterday)) {
    return 'at-risk'; // Streak intact but needs activity today
  }

  return 'broken'; // More than 1 day gap
}

export function shouldIncrementStreak(
  lastActivityDate: string | null,
  currentStreak: number
): { newStreak: number; shouldUpdate: boolean } {
  const today = startOfDay(new Date());

  if (!lastActivityDate) {
    return { newStreak: 1, shouldUpdate: true };
  }

  const lastActivity = startOfDay(new Date(lastActivityDate));

  if (isSameDay(lastActivity, today)) {
    // Already incremented today
    return { newStreak: currentStreak, shouldUpdate: false };
  }

  const yesterday = subDays(today, 1);
  if (isSameDay(lastActivity, yesterday)) {
    // Continuing streak
    return { newStreak: currentStreak + 1, shouldUpdate: true };
  }

  // Streak was broken, starting new
  return { newStreak: 1, shouldUpdate: true };
}
```

### Streak At-Risk Reminder

```typescript
function StreakReminder() {
  const { status, count } = useStreak();
  const isEvening = new Date().getHours() >= 18;

  if (status !== 'at-risk' || !isEvening) return null;

  return (
    <View className="bg-amber-50 p-4 rounded-xl mx-4 mt-2">
      <Text className="text-amber-800 text-center">
        🔥 Keep your {count}-day streak going!
      </Text>
      <Text className="text-amber-600 text-center text-sm mt-1">
        Complete a quick review or lesson today.
      </Text>
    </View>
  );
}
```

### Welcome Back Message

```typescript
function WelcomeBack({ dueReviews }: { dueReviews: number }) {
  return (
    <View className="p-6 items-center">
      <Text className="text-2xl font-bold">Welcome back! 👋</Text>
      <Text className="text-gray-600 text-center mt-2">
        Your knowledge is still here.
      </Text>
      {dueReviews > 0 && (
        <Text className="text-blue-600 mt-2">
          {dueReviews} words ready for review.
        </Text>
      )}
    </View>
  );
}
```

### References

- [Source: epics.md#Story 5.2: Streak Tracking]
- [Source: prd.md#FR34-FR35: Streak tracking]
- [Source: architecture.md#Zustand Store Structure]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed timezone issue: `new Date('YYYY-MM-DD')` parses as UTC midnight, causing off-by-one day errors. Solved with `parseLocalDate()` that splits the date string and constructs with `new Date(year, month-1, day)` for local time.
- Had to add `useStreak` mock to existing `useProgressStats.test.ts` after integrating the streak hook into the stats aggregator.

### Completion Notes List

- **Task 1**: Created `20260211000001_create_user_streaks.sql` migration with user_streaks table (id, user_id, current_streak, longest_streak, last_activity_date, freeze_used_at, timestamps). Added index on user_id, RLS policy for user-scoped access. Updated `supabase.types.ts` with UserStreak Row/Insert/Update types.
- **Task 2**: Created `lib/utils/streak.ts` with `calculateStreakStatus()` (returns 'active'|'at-risk'|'broken') and `shouldIncrementStreak()` (returns new streak value and whether update needed). Uses device local timezone via `parseLocalDate()` helper. 11 unit tests.
- **Task 3**: Created `lib/api/streak.ts` with `fetchStreak()` (gets/creates streak record, offline fallback via AsyncStorage cache) and `recordStreakActivity()` (calculates increment, updates Supabase, caches locally). Created `lib/hooks/useStreak.ts` hook using TanStack Query with 2-minute stale time. 6 hook tests + 9 API tests.
- **Task 4 & 8**: Integrated `recordStreakActivity()` calls into all lesson/review completion flows: quiz/[lessonId].tsx, lesson/[id].tsx, frequency-lesson/[id].tsx, review/session.tsx. Fire-and-forget pattern (`.catch(() => {})`) to avoid blocking completion flow.
- **Task 5**: Integrated `useStreak` hook into `useProgressStats` to replace hardcoded `currentStreak: 0`. StreakCounter component (already built in Story 5.1) now displays real streak data with flame icon and "Day Streak" label.
- **Task 6**: Created `StreakReminder` component with Divine Geometry gold tones. Shows only when status='at-risk' AND isEvening=true. Message: "Keep your X-day streak going! Complete a quick review or lesson today." No guilt-tripping. 5 tests.
- **Task 7**: Created `WelcomeBack` component with heart icon. Shows "Welcome back!", "Your knowledge is still here.", and "{X} words ready for review." Uses `useReviewQueue().dueCount` for review count. No shame messaging verified by test. 5 tests.
- **Review Fixes (2026-02-12)**: Resolved all 5 review findings by switching streak date writes to local-calendar formatting, normalizing broken streaks to `0` (and persisting reset), making streak-row bootstrap race-safe (`23505` conflict recovery), removing fragile welcome-back gating, and adding regression tests for local-date formatting and broken-streak behavior.

### Senior Developer Review (AI)

- Reviewer: Emrek (AI)
- Date: 2026-02-11
- Outcome: Changes Requested

#### Acceptance Criteria Validation

- AC #1: PARTIAL - streak increment path exists, but day-end reset to `0` and local-day write semantics are not fully implemented.
- AC #2: PARTIAL - streak counter renders with flame/count, but broken streaks can still display stale non-zero values.
- AC #3: IMPLEMENTED - at-risk reminder is shown for `status='at-risk'` and evening.
- AC #4: PARTIAL - welcome-back component exists, but gating condition blocks expected display for common broken-streak states.

#### Findings

1. [HIGH] Local timezone boundary bug on write path: `last_activity_date` uses UTC date generation (`toISOString().split('T')[0]`), which can shift calendar day for many users. Evidence: `safar-app/lib/api/streak.ts:83`.
2. [HIGH] AC #1 reset semantics not enforced: broken streaks are not reset to `0` at day boundary; logic only resets to `1` on next activity. Evidence: `safar-app/lib/utils/streak.ts:34`, `safar-app/lib/utils/streak.ts:58`.
3. [HIGH] AC #4 UX regression: welcome-back message is gated behind `currentStreak === 0`, but broken users can still have stale non-zero streak values. Evidence: `safar-app/app/(tabs)/index.tsx:353`, `safar-app/lib/hooks/useStreak.ts:37`.
4. [MEDIUM] Race condition risk in streak initialization: `select().single()` followed by `insert()` conflicts with `UNIQUE(user_id)` under concurrent calls. Evidence: `safar-app/lib/api/streak.ts:34`, `safar-app/lib/api/streak.ts:38`, `safar-app/supabase/migrations/20260211000001_create_user_streaks.sql:13`.
5. [MEDIUM] Test coverage gap for critical edge cases: timezone helpers in tests use UTC date derivation and do not protect against local-midnight regressions or broken-streak display logic. Evidence: `safar-app/__tests__/api/streak.test.ts:6`, `safar-app/__tests__/hooks/useStreak.test.ts:21`, `safar-app/__tests__/lib/useProgressStats.test.ts:56`.

### Re-review (AI)

- Reviewer: Emrek (AI)
- Date: 2026-02-12
- Outcome: Approved
- Notes: All HIGH and MEDIUM findings are fixed and verified by targeted test execution.

### Change Log

- 2026-02-12: Applied all review fixes (5/5) and verified with targeted Jest suite. Story advanced to done.
- 2026-02-11: Senior developer adversarial review completed. 5 issues found (3 HIGH, 2 MEDIUM). Added "Review Follow-ups (AI)", changed status to in-progress, and requested implementation fixes before re-review.
- 2026-02-11: Story 5.2 implementation complete. Created streak tracking system with database migration, utility functions, API layer, React hook, and UI components. Integrated streak recording into all lesson and review completion flows. Added at-risk reminder and welcome-back messages to Home dashboard. 46 new tests added (634 total, all passing).

### File List

**New Files:**
- safar-app/supabase/migrations/20260211000001_create_user_streaks.sql
- safar-app/lib/utils/streak.ts
- safar-app/lib/api/streak.ts
- safar-app/lib/hooks/useStreak.ts
- safar-app/components/progress/StreakReminder.tsx
- safar-app/components/progress/WelcomeBack.tsx
- safar-app/__tests__/utils/streak.test.ts
- safar-app/__tests__/api/streak.test.ts
- safar-app/__tests__/hooks/useStreak.test.ts
- safar-app/__tests__/components/progress/StreakReminder.test.tsx
- safar-app/__tests__/components/progress/WelcomeBack.test.tsx

**Modified Files:**
- safar-app/types/supabase.types.ts (added user_streaks table type + convenience exports)
- safar-app/constants/timeouts.ts (added streak query stale time)
- safar-app/lib/hooks/useProgressStats.ts (integrated useStreak, replaced hardcoded 0)
- safar-app/app/(tabs)/index.tsx (added StreakReminder, WelcomeBack, useStreak, useReviewQueue)
- safar-app/app/quiz/[lessonId].tsx (added recordStreakActivity on lesson complete)
- safar-app/app/lesson/[id].tsx (added recordStreakActivity on lesson complete)
- safar-app/app/frequency-lesson/[id].tsx (added recordStreakActivity on lesson complete)
- safar-app/app/review/session.tsx (added recordStreakActivity on review session complete)
- safar-app/lib/api/streak.ts (review fixes: local-date writes, broken-streak normalization, race-safe row bootstrap)
- safar-app/lib/utils/streak.ts (review fixes: local date helper + effective streak normalization helper)
- safar-app/lib/hooks/useStreak.ts (review fixes: normalize broken stale streak values for UI)
- safar-app/__tests__/api/streak.test.ts (review regression tests: local-date write, broken reset, insert race handling)
- safar-app/__tests__/utils/streak.test.ts (review regression tests: local date formatting and effective streak behavior)
- safar-app/__tests__/hooks/useStreak.test.ts (review regression tests: stale broken streak display behavior)
- safar-app/__tests__/lib/useProgressStats.test.ts (updated streak expectation to real hook behavior)
- _bmad-output/implementation-artifacts/stories/5-2-streak-tracking.md (added Senior Developer Re-review, resolved follow-ups, set status done)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status: in-progress -> done)
