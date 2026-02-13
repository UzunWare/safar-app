# Story 4.4: SM-2 Spaced Repetition Algorithm

Status: done

## Story

As a learner,
I want the system to schedule my reviews optimally,
so that I remember words long-term with minimal effort.

## Acceptance Criteria

1. **Given** a new word is learned, **When** it enters the review system, **Then** it has default values: ease_factor=2.5, interval=1, repetitions=0
2. **Given** a word is rated during review, **When** the SM-2 algorithm runs, **Then** the ease_factor is adjusted based on rating, the interval is calculated (first=1, second=6, subsequent=previous×ease_factor), and the next_review date is set to today + interval
3. **Given** a word is rated "Again" (quality < 3), **When** the algorithm processes this, **Then** repetitions resets to 0, interval resets to 1 day, and ease_factor decreases but stays ≥1.3
4. **Given** I am offline, **When** the algorithm runs, **Then** all calculations happen locally and results are queued for sync

## Tasks / Subtasks

- [x] Task 1: Create SM-2 algorithm implementation (AC: #1, #2, #3)
  - [x] Create `lib/utils/sm2.ts`
  - [x] Implement calculateNextReview function
  - [x] Follow SM-2 formula exactly

- [x] Task 2: Define word progress types (AC: #1)
  - [x] Create WordProgress interface
  - [x] Include: ease_factor, interval, repetitions, next_review
  - [x] Include sync metadata: is_synced, updated_at

- [x] Task 3: Implement default initialization (AC: #1)
  - [x] Default ease_factor = 2.5
  - [x] Default interval = 1
  - [x] Default repetitions = 0
  - [x] Set next_review to tomorrow

- [x] Task 4: Implement rating-based calculation (AC: #2)
  - [x] First successful review: interval = 1
  - [x] Second successful review: interval = 6
  - [x] Subsequent: interval = previous × ease_factor
  - [x] Adjust ease_factor per SM-2 formula

- [x] Task 5: Handle "Again" (failure) case (AC: #3)
  - [x] Reset repetitions to 0
  - [x] Reset interval to 1
  - [x] Decrease ease_factor (min 1.3)

- [x] Task 6: Create user_word_progress table (AC: #1, #2)
  - [x] Migration with SM-2 fields
  - [x] Add RLS policies
  - [x] Add indexes for querying

- [x] Task 7: Implement local-first calculation (AC: #4)
  - [x] Calculate immediately on device
  - [x] Save to local storage
  - [x] Queue sync item
  - [x] Sync on connectivity

- [x] Task 8: Create useWordProgress hook
  - [x] Fetch current progress for word
  - [x] Handle optimistic updates
  - [x] Manage sync state

## Dev Notes

### Architecture Patterns

- **Client-Side Calculation**: Immediate feedback, works offline
- **Local-First**: Save locally, sync in background
- **SM-2 Algorithm**: Industry standard spaced repetition

### Code Patterns

```typescript
// lib/utils/sm2.ts
interface WordProgress {
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  last_review: string;
  is_synced: boolean;
  updated_at: string;
}

// Quality mapping: 0=Again, 1=Hard, 2=Good, 3=Easy
// Converted to SM-2 scale: 2-5
function qualityToSm2(quality: 0 | 1 | 2 | 3): number {
  return quality + 2; // 0→2, 1→3, 2→4, 3→5
}

export function calculateNextReview(
  quality: 0 | 1 | 2 | 3,
  current: WordProgress
): WordProgress {
  const q = qualityToSm2(quality);
  let { ease_factor, interval, repetitions } = current;

  if (q < 3) {
    // Failed review (Again or Hard with low quality)
    repetitions = 0;
    interval = 1;
  } else {
    // Successful review
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }
    repetitions += 1;
  }

  // Adjust ease factor (SM-2 formula)
  ease_factor = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  ease_factor = Math.max(1.3, ease_factor); // Minimum 1.3

  const now = new Date();
  const nextReview = addDays(now, interval);

  return {
    ease_factor,
    interval,
    repetitions,
    next_review: nextReview.toISOString(),
    last_review: now.toISOString(),
    is_synced: false,
    updated_at: now.toISOString(),
  };
}

// Helper to add days
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Get default progress for new word
export function getDefaultProgress(): Omit<WordProgress, 'next_review' | 'last_review' | 'updated_at'> {
  return {
    ease_factor: 2.5,
    interval: 1,
    repetitions: 0,
    is_synced: false,
  };
}
```

### Database Schema

```sql
-- User word progress (SM-2 data)
CREATE TABLE user_word_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ NOT NULL,
  last_review TIMESTAMPTZ,
  is_synced BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

CREATE INDEX idx_user_word_progress_user_id ON user_word_progress(user_id);
CREATE INDEX idx_user_word_progress_next_review ON user_word_progress(user_id, next_review);

-- RLS Policies
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own word progress"
  ON user_word_progress FOR ALL
  USING (auth.uid() = user_id);
```

### Sync Pattern

```typescript
// Save progress locally and queue sync
async function saveWordProgress(wordId: string, progress: WordProgress) {
  const userId = useAuthStore.getState().user?.id;

  // Save to local storage
  const key = `progress:${userId}:${wordId}`;
  await AsyncStorage.setItem(key, JSON.stringify(progress));

  // Queue for sync
  await queueForSync({
    type: 'word_progress',
    payload: { word_id: wordId, ...progress },
  });

  // Invalidate TanStack Query cache
  queryClient.invalidateQueries(['wordProgress', wordId]);
}
```

### References

- [Source: epics.md#Story 4.4: SM-2 Spaced Repetition Algorithm]
- [Source: architecture.md#SM-2 Algorithm Implementation]
- [Source: architecture.md#SM-2 Core Logic]
- [Source: prd.md#FR27-FR30: Spaced Repetition]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No blocking issues encountered during implementation.

### Completion Notes List

- **Tasks 1-6:** Validated as already implemented by Story 4-3 (Difficulty Rating). SM-2 algorithm (`sm2.ts`), word progress types (`types/index.ts`), default initialization (`initializeWordProgress`), rating-based calculation, "Again" case handling, and `user_word_progress` migration all pre-existed with 39 passing tests.
- **Task 3 enhancement:** Added `getDefaultProgress()` export to `sm2.ts` for explicit default value access (AC#1). Added `updatedAt` field to `UserProgress` type for sync metadata completeness (Task 2).
- **Task 7 (NEW):** Implemented `lib/api/wordProgressLocal.ts` with `saveWordProgressLocally()`, `getLocalWordProgress()`, and `syncWordProgress()`. Follows existing `progress.ts` sync queue pattern (`sync_queue_{userId}` AsyncStorage key). Supports offline SM-2 calculations with background Supabase sync. 14 tests.
- **Task 8 (NEW):** Implemented `lib/hooks/useWordProgress.ts` TanStack Query hook with Supabase-first + AsyncStorage fallback. Provides `rateWord` mutation that saves locally first, then syncs to Supabase (local-first pattern). Cache invalidation on mutation success. 7 tests.
- **Full regression:** 414 tests pass across 30 suites with zero failures.

### Change Log

- 2026-02-10: Story 4-4 implementation complete. Added `getDefaultProgress()` to sm2.ts, `updatedAt` to UserProgress type, new `wordProgressLocal.ts` for offline storage + sync, new `useWordProgress.ts` hook with local-first pattern. 24 new tests added (3 getDefaultProgress + 14 wordProgressLocal + 7 useWordProgress). Total: 414 tests passing.
- 2026-02-10: **Code Review (Adversarial)** — 9 issues found (3H/4M/2L), 7 fixed:
  - [H1] Fixed `.single()` → `.maybeSingle()` in useWordProgress hook (local fallback was unreachable for new words)
  - [H2] Added 3 behavioral tests for rateWord mutation (saves locally, syncs to Supabase, uses defaults)
  - [H3] Fixed test mocks to match `.maybeSingle()` behavior (previously mocked impossible state)
  - [M1] Changed Supabase update to fire-and-forget in rateWord (no longer blocks UI on network)
  - [M2] Extracted `deriveWordStatus()` to sm2.ts, eliminated duplicated 21-day magic number
  - [M3] Replaced conditional assertion in sync test with unconditional `expect(...).toBeGreaterThan(0)`
  - [L2] Replaced hardcoded defaults with `getDefaultProgress()` call in hook
  - Remaining (not fixed): [M4] `UserProgress` type unused by new code (3 separate interfaces — intentional layering), [L1] duck-typing for data normalization (minor, works correctly)
  - Tests: 421 passing across 30 suites (+7 new tests, 0 regressions)

### File List

- `safar-app/lib/utils/sm2.ts` (modified - added getDefaultProgress, deriveWordStatus)
- `safar-app/types/index.ts` (modified - added updatedAt to UserProgress)
- `safar-app/lib/api/wordProgressLocal.ts` (new - local-first storage + sync, uses deriveWordStatus)
- `safar-app/lib/api/wordProgress.ts` (modified - uses deriveWordStatus)
- `safar-app/lib/hooks/useWordProgress.ts` (new - TanStack Query hook, maybeSingle, fire-and-forget sync)
- `safar-app/__tests__/lib/sm2.test.ts` (modified - added getDefaultProgress + deriveWordStatus tests)
- `safar-app/__tests__/lib/wordProgressLocal.test.ts` (new - 14 tests, fixed conditional assertion)
- `safar-app/__tests__/hooks/useWordProgress.test.ts` (new - 10 tests, maybeSingle mocks + rateWord behavioral tests)
