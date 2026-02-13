# Story 4.5: Review Queue

Status: done

## Story

As a learner,
I want to access my due reviews,
so that I can maintain my vocabulary knowledge.

## Acceptance Criteria

1. **Given** I have words due for review, **When** I navigate to the Review tab, **Then** I see the count of due reviews (e.g., "15 words ready"), a "Start Review" button, and optionally a preview of due words
2. **Given** I start a review session, **When** the session loads, **Then** I see review cards one at a time, each card shows Arabic word (front) then meaning (after tap/reveal), and after revealing I see the 4-button difficulty rating
3. **Given** I have no words due for review, **When** I navigate to the Review tab, **Then** I see "No reviews due" message, when my next review is scheduled, and I am encouraged to continue learning new words
4. **Given** I complete all due reviews, **When** the session ends, **Then** I see a completion message and stats (words reviewed, accuracy if applicable)

## Tasks / Subtasks

- [x] Task 1: Create Review tab screen (AC: #1, #3)
  - [x] Create `app/(tabs)/review.tsx`
  - [x] Set up tab bar with Review icon (RotateCcw from lucide)
  - [x] Show review count or empty state

- [x] Task 2: Query due reviews (AC: #1)
  - [x] Create useReviewQueue hook
  - [x] Query user_word_progress WHERE next_review <= now
  - [x] Order by next_review (oldest first)
  - [x] Cache with TanStack Query (1 min staleTime)

- [x] Task 3: Create review count display (AC: #1)
  - [x] Show "X words ready" prominently (Fraunces 56px)
  - [x] Add visual indicator (RotateCcw icon in gold circle)
  - [x] Count derived from useReviewQueue hook data

- [x] Task 4: Create "Start Review" button (AC: #1)
  - [x] Prominent CTA button (gold bg with gold glow shadow)
  - [x] Navigate to review session screen
  - [x] Button only shown when reviews are due (empty state shown otherwise)

- [x] Task 5: Create review session screen (AC: #2)
  - [x] Create `app/review/session.tsx`
  - [x] Display review cards sequentially
  - [x] Track current card index with progress dots

- [x] Task 6: Create review card with reveal (AC: #2)
  - [x] Show Arabic word (front) in Amiri 56px
  - [x] Tap to reveal meaning + transliteration
  - [x] Show 4-button rating after reveal
  - [x] Key-based re-mount for clean card transitions

- [x] Task 7: Integrate difficulty rating (AC: #2)
  - [x] Use DifficultyRating component from Story 4.3
  - [x] Process rating with SM-2 via useWordProgress hook
  - [x] Advance to next card after rating

- [x] Task 8: Create empty state (AC: #3)
  - [x] "All caught up!" message with Clock icon
  - [x] Encouragement to continue learning
  - [x] Add "Continue Learning" button (navigates to learn tab)

- [x] Task 9: Create review completion screen (AC: #4)
  - [x] Show "Reviews Complete!" with gold celebration icon
  - [x] Display stats: words reviewed count
  - [x] Done button navigates back to review tab

## Dev Notes

### Architecture Patterns

- **Tab Navigation**: Review is one of 4 main tabs
- **Data Fetching**: TanStack Query for due reviews
- **State Management**: useLearningStore for session state

### Code Patterns

```typescript
// lib/hooks/useReviewQueue.ts
export function useReviewQueue() {
  const userId = useAuthStore.getState().user?.id;

  return useQuery({
    queryKey: ['reviewQueue', userId],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { data } = await supabase
        .from('user_word_progress')
        .select(`
          *,
          word:words (
            id, arabic, transliteration, meaning, audio_url
          )
        `)
        .eq('user_id', userId)
        .lte('next_review', now)
        .order('next_review', { ascending: true });

      return data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}
```

```typescript
// Review tab main screen
export function ReviewTab() {
  const { data: queue, isLoading } = useReviewQueue();
  const dueCount = queue?.length || 0;

  if (isLoading) {
    return <ReviewSkeleton />;
  }

  if (dueCount === 0) {
    return <ReviewEmptyState />;
  }

  return (
    <View className="flex-1 p-6">
      <View className="items-center py-12">
        <Text className="text-6xl font-bold text-blue-600">
          {dueCount}
        </Text>
        <Text className="text-xl text-gray-600 mt-2">
          words ready for review
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/review/session')}
        className="bg-blue-600 py-4 rounded-full items-center"
      >
        <Text className="text-white text-lg font-semibold">
          Start Review
        </Text>
      </Pressable>
    </View>
  );
}
```

### Review Card with Reveal

```typescript
// Review card with flip to reveal
function ReviewCard({ word, onReveal }: { word: Word; onReveal: () => void }) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
    onReveal();
  };

  return (
    <Pressable
      onPress={!revealed ? handleReveal : undefined}
      className="bg-white rounded-2xl p-8 shadow-lg"
    >
      {/* Arabic word (always visible) */}
      <Text className="text-center font-amiri text-5xl">
        {word.arabic}
      </Text>

      {revealed ? (
        <>
          {/* Revealed content */}
          <Text className="text-center text-gray-500 text-lg mt-4">
            {word.transliteration}
          </Text>
          <Text className="text-center text-blue-600 text-2xl mt-2">
            {word.meaning}
          </Text>
        </>
      ) : (
        <Text className="text-center text-gray-400 mt-8">
          Tap to reveal
        </Text>
      )}
    </Pressable>
  );
}
```

### Empty State

```typescript
function ReviewEmptyState() {
  const { data: nextReview } = useNextReviewTime();

  return (
    <View className="flex-1 items-center justify-center p-6">
      <CheckCircleIcon className="w-16 h-16 text-green-500" />
      <Text className="text-2xl font-bold mt-4">
        All caught up!
      </Text>
      <Text className="text-gray-600 text-center mt-2">
        No reviews due right now.
      </Text>
      {nextReview && (
        <Text className="text-gray-500 mt-4">
          Next review: {formatRelativeTime(nextReview)}
        </Text>
      )}
      <Pressable
        onPress={() => router.push('/(tabs)/learn')}
        className="mt-8 bg-blue-100 px-6 py-3 rounded-full"
      >
        <Text className="text-blue-600 font-semibold">
          Continue Learning
        </Text>
      </Pressable>
    </View>
  );
}
```

### References

- [Source: epics.md#Story 4.5: Review Queue]
- [Source: prd.md#FR28: Users can access their review queue]
- [Source: architecture.md#State Management Philosophy]

## Senior Developer Review (AI)

**Reviewer:** Emrek | **Date:** 2026-02-10 | **Outcome:** Approved (after fixes)

### Summary

Adversarial review found **9 issues** (2 Critical, 1 High, 4 Medium, 2 Low). All fixed in-place.

### Critical Findings (Fixed)

1. **Route redirect guard blocked `/review/session`** — Root layout catch-all redirect at `_layout.tsx:183` didn't include `review` as a recognized route group. Users pressing "Start Review" would be immediately redirected back to tabs, making the review session **completely inaccessible**.
2. **Missing `Stack.Screen` registration** — `review/session` was not registered in the root Stack navigator.

### High Findings (Fixed)

3. **AC3 gap: next review time not shown** — Empty state didn't display when the next review is scheduled, violating AC3. Added `nextReviewTime` query to `useReviewQueue` hook and `formatRelativeTime` display in empty state.

### Medium Findings (Fixed)

4. **Stale review queue cache** — `useWordProgress.rateWord` didn't invalidate `reviewQueue`/`nextReviewTime` queries. Added cache invalidation in `onSuccess`.
5. **Progress dots overflow** — 50+ review items would render 50+ dots in a single row. Added conditional: dots for <=20 items, progress bar for larger queues.
6. **No SafeAreaView on session screen** — Session used bare `<View>` with hardcoded `paddingTop: 12`. Wrapped in `SafeAreaView`.
7. **Misleading test name** — "provides nextReviewTime" test didn't actually test nextReviewTime. Replaced with 2 real tests (with/without future review data).

### Low Findings (Fixed)

8. **Dead code in test** — Unused `goodButton` variable removed.
9. **Tab navigation method** — `router.push` changed to `router.replace` for "Continue Learning" button.

### Test Results After Fixes

- Review tests: 23 passed (3 suites)
- Full suite: **444 tests, 33 suites, 0 failures, 0 regressions**

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- ReviewCard internal state persisted across card changes → fixed by adding `key={word_id}` to force re-mount

### Completion Notes List

- Implemented full review queue feature with 5-tab navigation (Home, Learn, Review, Progress, Profile)
- useReviewQueue hook queries Supabase user_word_progress with word join, 1-min staleTime
- Review tab shows due count card with gold accent or "All caught up!" empty state
- Review session: midnight bg, sequential cards, tap-to-reveal, difficulty rating integration
- ReviewCard component: parchment card, Amiri Arabic display, reveal with divider transition
- ReviewResults component: midnight bg, gold celebration icon, words reviewed stats
- Integrates with existing DifficultyRating (Story 4.3) and useWordProgress (Story 4.4)
- SM-2 rating persisted via local-first architecture (AsyncStorage + fire-and-forget Supabase sync)
- All Divine Geometry palette (emerald/gold/cream/parchment) — no generic blue/gray colors
- 23 tests across 3 test files (hook: 9, review tab: 6, session: 8)
- Full suite: 444 tests, 33 suites, 0 regressions

### Change Log

- 2026-02-10: Story 4.5 implementation — Review Queue with tab screen, session flow, card reveal, difficulty rating, completion screen
- 2026-02-10: Code Review (9 issues found, all fixed):
  - CRITICAL: Added `/review` route to root layout redirect guard and Stack.Screen registration (session was inaccessible)
  - CRITICAL: Registered `review/session` as Stack.Screen in root layout
  - HIGH: Implemented nextReviewTime query + display in empty state (AC3 gap)
  - MEDIUM: Added reviewQueue/nextReviewTime cache invalidation after word rating
  - MEDIUM: Capped progress dots at 20, switched to progress bar for large queues
  - MEDIUM: Wrapped session screen in SafeAreaView for notch safety
  - MEDIUM: Replaced misleading nextReviewTime test with real assertions (2 new tests)
  - LOW: Removed dead `goodButton` variable in session test
  - LOW: Changed `router.push` to `router.replace` for tab navigation in empty state

### File List

- `safar-app/app/(tabs)/review.tsx` — NEW: Review tab screen with count display, start button, empty state, next review time
- `safar-app/app/(tabs)/_layout.tsx` — MODIFIED: Added Review tab + review route guard + Stack.Screen
- `safar-app/app/review/session.tsx` — NEW: Review session screen with SafeAreaView, progressive dots/bar
- `safar-app/app/_layout.tsx` — MODIFIED: Added review route guard + Stack.Screen registration
- `safar-app/lib/hooks/useReviewQueue.ts` — NEW: TanStack Query hook for due reviews + nextReviewTime
- `safar-app/lib/hooks/useWordProgress.ts` — MODIFIED: Added reviewQueue/nextReviewTime cache invalidation
- `safar-app/components/learning/ReviewCard.tsx` — NEW: Tap-to-reveal review card component
- `safar-app/components/learning/ReviewResults.tsx` — NEW: Review completion screen component
- `safar-app/components/ui/FloatingTabBar.tsx` — MODIFIED: Added RotateCcw icon for 5-tab support
- `safar-app/__tests__/hooks/useReviewQueue.test.ts` — NEW: 9 tests for review queue hook (incl. nextReviewTime)
- `safar-app/__tests__/screens/review.test.tsx` — NEW: 6 tests for review tab screen
- `safar-app/__tests__/screens/review-session.test.tsx` — NEW: 8 tests for review session screen
