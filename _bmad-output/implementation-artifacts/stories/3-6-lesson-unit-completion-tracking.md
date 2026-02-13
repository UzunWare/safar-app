# Story 3.6: Lesson & Unit Completion Tracking

Status: done

## Story

As a learner,
I want the system to track which lessons and units I've completed,
so that I can see my progress through the pathway.

## Acceptance Criteria

1. **Given** I complete all words in a lesson (view all cards), **When** the lesson is marked complete, **Then** a record is created in user_lesson_progress table, the lesson shows as "completed" in the unit view, and the completion is synced to the server
2. **Given** I complete all lessons in a unit, **When** the last lesson is marked complete, **Then** the unit is automatically marked as complete and shows a completion badge/checkmark
3. **Given** I view the pathway, **When** looking at my progress, **Then** I see accurate completion percentages for each unit and overall pathway completion percentage
4. **Given** I am offline, **When** I complete a lesson, **Then** the completion is saved locally and syncs when connectivity is restored

## Tasks / Subtasks

- [x] Task 1: Create user_lesson_progress table (AC: #1)
  - [x] Create migration for user_lesson_progress
  - [x] Fields: id, user_id (FK), lesson_id (FK), completed_at, is_synced, updated_at
  - [x] Add RLS policies for user access
  - [x] Add indexes on user_id, lesson_id

- [x] Task 2: Create progress mutation functions (AC: #1)
  - [x] Create `lib/api/progress.ts`
  - [x] Implement markLessonComplete function
  - [x] Handle upsert logic (idempotent)

- [x] Task 3: Implement lesson completion trigger (AC: #1)
  - [x] Detect when last word in lesson is viewed
  - [x] Call markLessonComplete
  - [x] Update local state immediately

- [x] Task 4: Create useProgress hook (AC: #3)
  - [x] Query user_lesson_progress
  - [x] Calculate unit completion (all lessons complete)
  - [x] Calculate pathway completion percentage
  - [x] Cache with TanStack Query

- [x] Task 5: Implement unit completion detection (AC: #2)
  - [x] Check if all lessons in unit are complete
  - [x] No separate table needed (derived)
  - [x] Update UI to show unit complete

- [x] Task 6: Display progress in unit view (AC: #3)
  - [x] Show completion checkmark for completed units
  - [x] Show progress bar for in-progress units
  - [x] Show completion percentage

- [x] Task 7: Calculate pathway completion (AC: #3)
  - [x] Total lessons in pathway
  - [x] Completed lessons count
  - [x] Display as percentage

- [x] Task 8: Implement offline completion tracking (AC: #4)
  - [x] Save completion to local storage
  - [x] Add to sync queue
  - [x] Sync when online
  - [x] Handle sync conflicts (server wins for timestamps)

## Dev Notes

### Architecture Patterns

- **Optimistic Updates**: Update UI immediately, sync in background
- **Derived State**: Unit completion derived from lessons
- **Offline-First**: Local storage + sync queue
- **Idempotent**: Multiple completion calls safe

### Database Schema

```sql
-- User lesson progress tracking
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  is_synced BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);

-- RLS Policies
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);
```

### Code Patterns

```typescript
// lib/api/progress.ts
export async function markLessonComplete(lessonId: string) {
  const userId = useAuthStore.getState().user?.id;

  // Optimistic local update
  queryClient.setQueryData(['lessonProgress', lessonId], {
    completed: true,
    completedAt: new Date().toISOString(),
  });

  // Sync to server (or queue if offline)
  const { error } = await supabase
    .from('user_lesson_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      is_synced: true,
    }, {
      onConflict: 'user_id,lesson_id',
    });

  if (error) {
    // Queue for later sync
    await queueForSync({
      type: 'lesson_complete',
      payload: { lesson_id: lessonId },
    });
  }
}
```

```typescript
// useProgress hook
function useProgress(pathwayId: string) {
  const { data: lessons } = useLessons(pathwayId);
  const { data: progress } = useQuery({
    queryKey: ['progress', pathwayId],
    queryFn: () => fetchUserProgress(pathwayId),
  });

  const completedLessons = progress?.filter(p => p.completed_at).length || 0;
  const totalLessons = lessons?.length || 0;
  const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return {
    completedLessons,
    totalLessons,
    percentage: Math.round(percentage),
    isUnitComplete: (unitId: string) => {
      const unitLessons = lessons?.filter(l => l.unit_id === unitId) || [];
      return unitLessons.every(l => progress?.some(p => p.lesson_id === l.id));
    },
  };
}
```

### Offline Sync Pattern

```typescript
// Add to sync queue
async function queueForSync(item: SyncItem) {
  const queue = await AsyncStorage.getItem('syncQueue');
  const items = queue ? JSON.parse(queue) : [];
  items.push({
    ...item,
    id: uuid(),
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
  await AsyncStorage.setItem('syncQueue', JSON.stringify(items));
}
```

### References

- [Source: epics.md#Story 3.6: Lesson & Unit Completion Tracking]
- [Source: architecture.md#Offline-First Sync Strategy]
- [Source: prd.md#FR19: System tracks which lessons and units have been completed]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Created migration `20260209000001_create_user_lesson_progress.sql` with table, indexes, RLS policies. Added `UserLessonProgress` and `UserLessonProgressInsert` types to `supabase.types.ts` and re-exported from `types/index.ts`. 2 new type tests added (20 total pass).
- Task 2: Added `markLessonComplete` (upsert, idempotent) and `fetchLessonProgress` to `lib/api/progress.ts`. Offline fallback via `saveCompletionLocally` queues to AsyncStorage sync queue. 7 new tests pass (22 total in progress.test.ts).
- Task 3: Integrated `markLessonComplete` into lesson screen `handleNext`. When user completes last word, both `completeLesson()` (local store) and `markLessonComplete(userId, lessonId)` (server sync) are called. 2 new tests.
- Task 4: Created `useProgress` hook with TanStack Query. Fetches lessons for units and user progress, computes `isLessonComplete`, `isUnitComplete`, `unitPercent`, `pathwayPercent`. 7 tests covering zero/partial/full completion.
- Task 5: Unit completion derived from `isUnitComplete()` in useProgress — checks all lessons in unit are complete. No separate DB table needed.
- Task 6: Updated learn screen to use `useProgress`. Unit subtitle now shows "Complete", "X% done", or "Not started". ProgressDots reflect real completion state. Continue Learning button navigates to next incomplete lesson. 2 new tests.
- Task 7: Pathway completion percentage displayed from `useProgress.pathwayPercent`. Replaces hardcoded `0%`.
- Task 8: Added `syncOfflineProgress` function that processes queued completions, retains failed items for retry, and clears successfully synced items. 4 new tests.

### Senior Developer Review (AI)

**Reviewer:** Emrek on 2026-02-09
**Outcome:** Approved (after auto-fix)
**Issues Found:** 3 High, 5 Medium, 3 Low (11 total)
**Issues Fixed:** 8 (all HIGH + all MEDIUM)

**Fixes Applied:**
- H1: Added `syncOfflineProgress` call on learn screen mount via useEffect (AC#4 completion)
- H2: Added `queryClient.invalidateQueries(['progress'])` after markLessonComplete in lesson screen
- H3: Fixed `syncOfflineProgress` to retain non-lesson_complete queue items instead of dropping them
- M1: Added CheckCircle icon badge to completed units in UnitItem component (AC#2 completion)
- M2: Added lesson completion indicators (CheckCircle) in expanded UnitLessonList (AC#1 completion)
- M3: Replaced raw Supabase queries in handleContinue with `nextLessonId` from useProgress hook
- M4: Added useMemo for unitIds in useProgress to prevent reference instability
- M5: Replaced inline Supabase query with `fetchLessonProgress` in useProgress hook
- L3: Added try/catch around JSON.parse in saveCompletionLocally and syncOfflineProgress

**Remaining LOW issues (deferred):**
- L1: ProgressDot hardcodes hex colors instead of design system constants
- L2: Migration lacks updated_at auto-update trigger

**Tests:** 245 passed (3 new nextLessonId tests added)

### Change Log

- 2026-02-09: Task 1 - Created user_lesson_progress migration, types, and schema tests
- 2026-02-09: Task 2 - Added markLessonComplete, fetchLessonProgress with offline fallback
- 2026-02-09: Task 3 - Integrated completion trigger in lesson screen
- 2026-02-09: Task 4-5 - Created useProgress hook with unit/lesson/pathway completion
- 2026-02-09: Task 6-7 - Updated learn screen with real progress display
- 2026-02-09: Task 8 - Added syncOfflineProgress with queue management
- 2026-02-09: Code Review - Fixed 8 issues (H1-H3, M1-M5), added 3 tests

### File List

- safar-app/supabase/migrations/20260209000001_create_user_lesson_progress.sql (new)
- safar-app/types/supabase.types.ts (modified)
- safar-app/types/index.ts (modified)
- safar-app/lib/api/progress.ts (modified)
- safar-app/lib/hooks/useProgress.ts (new)
- safar-app/app/lesson/[id].tsx (modified)
- safar-app/app/(tabs)/learn.tsx (modified)
- safar-app/__tests__/types/database-schema.test.ts (modified)
- safar-app/__tests__/lib/progress.test.ts (modified)
- safar-app/__tests__/hooks/useProgress.test.ts (new)
- safar-app/__tests__/screens/lesson.test.tsx (modified)
- safar-app/__tests__/screens/learn.test.tsx (modified)
