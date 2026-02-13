# Story 5.3: Streak Freeze

Status: done

## Story

As a learner,
I want to use a streak freeze when I can't learn,
so that I don't lose my streak due to life circumstances.

## Acceptance Criteria

1. **Given** I have not used a streak freeze this week, **When** I view my streak and haven't learned today, **Then** I see an option to "Use Streak Freeze" and the freeze icon shows as available
2. **Given** I tap "Use Streak Freeze", **When** confirming the action, **Then** my streak is preserved for today, the freeze is marked as used (freeze_used_at = today), and I see confirmation "Streak preserved! Learn tomorrow to continue."
3. **Given** I have already used a freeze this week, **When** viewing the freeze option, **Then** it shows as unavailable and I see "Next freeze available [date]"
4. **Given** a new week begins (Monday), **When** the reset occurs, **Then** my freeze becomes available again

## Tasks / Subtasks

- [x] Task 1: Add freeze UI to streak display (AC: #1)
  - [x] Add freeze icon/button near streak counter
  - [x] Show available/unavailable state
  - [x] Style appropriately

- [x] Task 2: Create freeze confirmation modal (AC: #2)
  - [x] Explain what freeze does
  - [x] Confirm and Cancel buttons
  - [x] Show success confirmation

- [x] Task 3: Implement freeze logic (AC: #2)
  - [x] Update freeze_used_at in user_streaks
  - [x] Preserve streak when calculating next day
  - [x] Handle edge cases

- [x] Task 4: Check freeze availability (AC: #1, #3)
  - [x] Get freeze_used_at from user_streaks
  - [x] Calculate if used this week
  - [x] Return available/unavailable status

- [x] Task 5: Display unavailable state (AC: #3)
  - [x] Show grayed out freeze icon
  - [x] Calculate next available date (next Monday)
  - [x] Display "Next freeze available [date]"

- [x] Task 6: Implement weekly reset (AC: #4)
  - [x] Reset is automatic (no cron needed)
  - [x] Check week of freeze_used_at vs current week
  - [x] Monday as week start

- [x] Task 7: Update streak calculation for freeze (AC: #2)
  - [x] When checking streak, account for freeze
  - [x] If freeze_used_at was yesterday, don't break streak
  - [x] Modify shouldIncrementStreak logic

### Review Follow-ups (AI)

- [x] [AI-Review][CRITICAL] Implemented AC #2 success confirmation after freeze action via dashboard confirmation alert. [safar-app/app/(tabs)/index.tsx:108]
- [x] [AI-Review][CRITICAL] Fixed freeze edge-case handling so stale broken streaks cannot be marked `frozen`. [safar-app/lib/utils/streak.ts:185]
- [x] [AI-Review][HIGH] Enforced one-freeze-per-week in API layer; repeated weekly use now no-ops before DB update. [safar-app/lib/api/streak.ts:235]
- [x] [AI-Review][MEDIUM] Updated unavailable copy to `Next freeze available [date]`. [safar-app/components/progress/StreakFreezeButton.tsx:23]
- [x] [AI-Review][MEDIUM] Added regression tests for stale-broken-streak freeze behavior, API weekly enforcement, and success confirmation flow. [safar-app/__tests__/utils/streak.test.ts:238], [safar-app/__tests__/api/streak.test.ts:297], [safar-app/__tests__/screens/dashboard.test.tsx:284]

## Dev Notes

### Architecture Patterns

- **Weekly Reset**: Based on calendar week, Monday start
- **Preemptive Use**: Can use freeze before end of day
- **User-Initiated**: Never auto-use freeze

### Code Patterns

```typescript
// lib/utils/streak.ts
export function isFreezeAvailable(freezeUsedAt: string | null): boolean {
  if (!freezeUsedAt) return true;

  const usedDate = new Date(freezeUsedAt);
  const today = new Date();

  // Get start of current week (Monday)
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const usedWeekStart = startOfWeek(usedDate, { weekStartsOn: 1 });

  // Freeze is available if used in a different week
  return !isSameWeek(usedDate, today, { weekStartsOn: 1 });
}

export function getNextFreezeDate(freezeUsedAt: string): Date {
  const usedDate = new Date(freezeUsedAt);
  // Next Monday after the used date
  const nextWeekStart = addWeeks(startOfWeek(usedDate, { weekStartsOn: 1 }), 1);
  return nextWeekStart;
}

// Modified streak calculation accounting for freeze
export function calculateStreakWithFreeze(
  lastActivityDate: string | null,
  freezeUsedAt: string | null,
  currentStreak: number
): 'active' | 'frozen' | 'at-risk' | 'broken' {
  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);

  // Check if freeze was used yesterday
  if (freezeUsedAt) {
    const freezeDate = startOfDay(new Date(freezeUsedAt));
    if (isSameDay(freezeDate, yesterday)) {
      return 'frozen'; // Streak protected by freeze
    }
  }

  // Normal streak logic
  return calculateStreakStatus(lastActivityDate, currentStreak);
}
```

```typescript
// Freeze button component
function StreakFreezeButton() {
  const { freezeUsedAt, useFreeze } = useStreak();
  const [showModal, setShowModal] = useState(false);

  const isAvailable = isFreezeAvailable(freezeUsedAt);
  const nextAvailable = freezeUsedAt ? getNextFreezeDate(freezeUsedAt) : null;

  const handleUseFreeze = async () => {
    await useFreeze();
    setShowModal(false);
    Toast.show('Streak preserved! Learn tomorrow to continue.');
  };

  return (
    <>
      <Pressable
        onPress={() => isAvailable && setShowModal(true)}
        className={cn(
          'flex-row items-center p-3 rounded-xl',
          isAvailable ? 'bg-blue-100' : 'bg-gray-100'
        )}
        disabled={!isAvailable}
      >
        <Text className="text-xl">â„ï¸</Text>
        <View className="ml-2">
          <Text className={cn(
            'font-medium',
            isAvailable ? 'text-blue-700' : 'text-gray-400'
          )}>
            Streak Freeze
          </Text>
          {!isAvailable && nextAvailable && (
            <Text className="text-xs text-gray-400">
              Available {format(nextAvailable, 'MMM d')}
            </Text>
          )}
        </View>
      </Pressable>

      <Modal visible={showModal} onClose={() => setShowModal(false)}>
        <Text className="text-xl font-bold">Use Streak Freeze?</Text>
        <Text className="text-gray-600 mt-2">
          This will protect your streak for today. You can use one freeze per week.
        </Text>
        <Button title="Use Freeze" onPress={handleUseFreeze} />
        <Button title="Cancel" variant="ghost" onPress={() => setShowModal(false)} />
      </Modal>
    </>
  );
}
```

### Freeze Rules

| Scenario | Action |
|----------|--------|
| No activity today, freeze available | Can use freeze |
| Activity today, freeze available | Freeze not needed |
| No activity, freeze already used this week | Show next available date |
| Freeze used yesterday | Streak protected |

### References

- [Source: epics.md#Story 5.3: Streak Freeze]
- [Source: prd.md#FR36: One free streak freeze per week]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Created StreakFreezeButton component with Divine Geometry styling (gold accent available, muted unavailable). Snowflake icon from lucide-react-native. 7 tests passing.
- Task 2: Created FreezeConfirmModal with Divine Geometry modal overlay (emerald deep overlay, white card). Shows explanation, confirm/cancel, loading state. 7 tests passing.
- Task 3: Added freezeUsedAt to StreakData/StreakRow interfaces, updated select queries to include freeze_used_at, created useStreakFreeze API function. 13 API tests passing.
- Task 4: Created isFreezeAvailable and getNextFreezeDate utility functions with Monday-start week logic. Wired freezeUsedAt/freezeAvailable/nextFreezeDate/useFreeze into useStreak hook. 23 utility + 10 hook tests passing. Fixed pre-existing flaky waitFor assertion in broken streak test.
- Task 5: Integrated StreakFreezeButton and FreezeConfirmModal into home screen. Freeze button shows when streak is at-risk/broken with currentStreak > 0. Modal wired to useFreeze with loading state.
- Task 6: Weekly reset is automatic via isFreezeAvailable comparing week start (Monday) of freeze date vs today. Added 2 explicit boundary tests confirming Sundayâ†’Monday reset.
- Task 7: Created calculateStreakWithFreeze returning FreezeStreakStatus ('active'|'frozen'|'at-risk'|'broken'). Extended shouldIncrementStreak with optional freezeUsedAt to bridge 2-day gaps when freeze was used yesterday. Updated normalizeBrokenStreak and useStreak hook to use freeze-aware calculations. 36 utility, 13 API, 10 hook tests. Full suite: 681 tests, 0 regressions.
- Review Fixes (2026-02-12): Resolved all 5 review findings by adding the required success confirmation, tightening freeze protection logic to valid day-gap cases, enforcing one-freeze-per-week in API behavior, updating unavailable copy to `Next freeze available [date]`, and adding regression tests across utils/api/screen flow.

### Senior Developer Review (AI)

- Reviewer: Emrek (AI)
- Date: 2026-02-12
- Outcome: Changes Requested

#### Acceptance Criteria Validation

- AC #1: IMPLEMENTED - freeze option and available state render when streak is at risk.
- AC #2: PARTIAL - `freeze_used_at` update exists, but required success confirmation text is missing and edge-case freeze behavior can preserve stale broken streak states.
- AC #3: PARTIAL - unavailable state renders with date, but required copy `Next freeze available [date]` is not shown.
- AC #4: IMPLEMENTED - weekly Monday reset logic is present via week-start comparison.

#### Findings

1. [CRITICAL] Task 2 marked complete but success confirmation is not implemented after freeze action. Evidence: `safar-app/app/(tabs)/index.tsx:102`.
2. [CRITICAL] Task 3 marked complete but edge-case handling is incomplete: freeze status logic can classify stale broken streaks as `frozen`, blocking proper normalization. Evidence: `safar-app/lib/utils/streak.ts:182`, `safar-app/lib/api/streak.ts:171`.
3. [HIGH] AC #2 business rule enforcement gap: one-freeze-per-week is not enforced in API/database update path, only by UI gating. Evidence: `safar-app/lib/api/streak.ts:233`, `safar-app/supabase/migrations/20260211000001_create_user_streaks.sql:4`.
4. [MEDIUM] AC #3 copy mismatch: UI shows `Available {date}` instead of `Next freeze available [date]`. Evidence: `safar-app/components/progress/StreakFreezeButton.tsx:85`.
5. [MEDIUM] Regression coverage gaps: no tests assert required success confirmation behavior or stale-broken-streak freeze misuse case. Evidence: `safar-app/__tests__/components/progress/FreezeConfirmModal.test.tsx:23`, `safar-app/__tests__/utils/streak.test.ts:202`.

### Re-review (AI)

- Reviewer: Emrek (AI)
- Date: 2026-02-12
- Outcome: Approved
- Notes: All CRITICAL/HIGH/MEDIUM findings were fixed and verified by targeted test execution.

### Change Log

- 2026-02-12: Applied all review fixes (5/5) and verified with targeted Jest suites. Story advanced to done.
- 2026-02-12: Senior developer adversarial review completed. 5 issues found (2 CRITICAL, 1 HIGH, 2 MEDIUM). Added "Review Follow-ups (AI)", changed status to in-progress, and requested implementation fixes before re-review.
- 2026-02-12: Task 1 â€” Created StreakFreezeButton component with available/unavailable states, Divine Geometry palette
- 2026-02-12: Task 3 â€” Extended streak API with freeze_used_at support and useStreakFreeze function
- 2026-02-12: Task 4 â€” Added freeze availability utilities and wired into useStreak hook
- 2026-02-12: Task 5 â€” Integrated freeze UI into home screen dashboard
- 2026-02-12: Task 6 â€” Verified automatic weekly reset via isFreezeAvailable with Monday boundary tests
- 2026-02-12: Task 7 â€” Freeze-aware streak calculation with calculateStreakWithFreeze and shouldIncrementStreak freeze bridging

### File List

- safar-app/components/progress/StreakFreezeButton.tsx (new)
- safar-app/__tests__/components/progress/StreakFreezeButton.test.tsx (new)
- safar-app/components/progress/FreezeConfirmModal.tsx (new)
- safar-app/__tests__/components/progress/FreezeConfirmModal.test.tsx (new)
- safar-app/lib/api/streak.ts (modified)
- safar-app/__tests__/api/streak.test.ts (modified)
- safar-app/lib/utils/streak.ts (modified)
- safar-app/__tests__/utils/streak.test.ts (modified)
- safar-app/lib/hooks/useStreak.ts (modified)
- safar-app/__tests__/hooks/useStreak.test.ts (modified)
- safar-app/app/(tabs)/index.tsx (modified)
- safar-app/components/progress/StreakReminder.tsx (modified)
- safar-app/__tests__/screens/dashboard.test.tsx (modified)
- _bmad-output/implementation-artifacts/stories/5-3-streak-freeze.md (updated with AI review outcomes and fixes)
