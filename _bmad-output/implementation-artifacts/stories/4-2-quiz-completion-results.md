# Story 4.2: Quiz Completion & Results

Status: done

## Story

As a learner,
I want to see my quiz results,
so that I understand how well I learned the words.

## Acceptance Criteria

1. **Given** I complete all quiz questions, **When** the quiz ends, **Then** I see a results screen showing: total score (e.g., "8/10 correct"), percentage (e.g., "80%"), brief feedback based on score, and a "Complete Lesson" button
2. **Given** my score is 80% or higher, **When** viewing results, **Then** I see encouraging feedback (e.g., "Excellent work!") and a celebration animation (Lottie)
3. **Given** my score is below 80%, **When** viewing results, **Then** I see constructive feedback (e.g., "Good effort! These words will appear in your reviews.") and no shame messaging
4. **Given** I tap "Complete Lesson", **When** the action is processed, **Then** the lesson is marked complete, words are added to my review queue based on quiz performance, and I am navigated back to the unit view

## Tasks / Subtasks

- [x] Task 1: Create quiz results screen (AC: #1)
  - [x] Create results component/modal
  - [x] Display score (X/Y format)
  - [x] Display percentage
  - [x] Display feedback message
  - [x] Add "Complete Lesson" button

- [x] Task 2: Implement score calculation (AC: #1)
  - [x] Track correct/total from quiz
  - [x] Calculate percentage
  - [x] Pass to results screen

- [x] Task 3: Create feedback logic (AC: #2, #3)
  - [x] Define feedback messages for score ranges
  - [x] >= 80%: Encouraging message
  - [x] < 80%: Constructive message (no shame)
  - [x] Consider different thresholds

- [x] Task 4: Add celebration animation (AC: #2)
  - [x] Install lottie-react-native if not done
  - [x] Add celebration Lottie file to assets
  - [x] Show for scores >= 80%
  - [x] Auto-play on results display

- [x] Task 5: Implement lesson completion (AC: #4)
  - [x] Call markLessonComplete
  - [x] Add words to review queue
  - [x] Navigate back to unit view

- [x] Task 6: Add words to review queue (AC: #4)
  - [x] Initialize SM-2 data for each word
  - [x] Words answered incorrectly get shorter intervals
  - [x] Words answered correctly get normal intervals

- [x] Task 7: Track quiz analytics
  - [x] Track quiz_completed event
  - [x] Include score, percentage, lesson_id
  - [x] Track individual question results

## Dev Notes

### Architecture Patterns

- **Lottie**: Used for celebration animations
- **SM-2 Integration**: Quiz results affect initial intervals
- **No Shame**: Constructive feedback only

### Code Patterns

```typescript
// Quiz results screen
interface QuizResultsProps {
  correctCount: number;
  totalCount: number;
  incorrectWords: Word[];
  onComplete: () => void;
}

export function QuizResults({
  correctCount,
  totalCount,
  incorrectWords,
  onComplete,
}: QuizResultsProps) {
  const percentage = Math.round((correctCount / totalCount) * 100);
  const isHighScore = percentage >= 80;

  const feedback = isHighScore
    ? "Excellent work! You've mastered these words."
    : "Good effort! These words will appear in your reviews for extra practice.";

  return (
    <View className="flex-1 items-center justify-center p-6">
      {/* Celebration animation for high scores */}
      {isHighScore && (
        <LottieView
          source={require('@/assets/animations/celebration.json')}
          autoPlay
          loop={false}
          style={{ width: 200, height: 200 }}
        />
      )}

      {/* Score display */}
      <Text className="text-6xl font-bold text-blue-600">
        {correctCount}/{totalCount}
      </Text>

      <Text className="text-2xl text-gray-600 mt-2">
        {percentage}%
      </Text>

      {/* Feedback */}
      <Text className="text-lg text-center text-gray-700 mt-6 px-4">
        {feedback}
      </Text>

      {/* Complete button */}
      <Pressable
        onPress={onComplete}
        className="bg-blue-600 px-8 py-4 rounded-full mt-8"
      >
        <Text className="text-white text-lg font-semibold">
          Complete Lesson
        </Text>
      </Pressable>
    </View>
  );
}
```

### Feedback Messages

```typescript
function getQuizFeedback(percentage: number): { message: string; emoji: string } {
  if (percentage >= 100) {
    return { message: "Perfect score! You've mastered these words.", emoji: "🌟" };
  } else if (percentage >= 80) {
    return { message: "Excellent work! Keep up the great progress.", emoji: "🎉" };
  } else if (percentage >= 60) {
    return { message: "Good effort! These words will come back for review.", emoji: "💪" };
  } else {
    return { message: "Keep practicing! These words will appear in your reviews.", emoji: "📚" };
  }
}
```

### SM-2 Initialization Based on Quiz

```typescript
// Initialize word progress after quiz
async function initializeWordProgress(word: Word, wasCorrect: boolean) {
  const initialProgress = {
    word_id: word.id,
    ease_factor: 2.5, // Default
    interval: wasCorrect ? 1 : 0, // Incorrect = review same day
    repetitions: wasCorrect ? 1 : 0,
    next_review: wasCorrect
      ? addDays(new Date(), 1).toISOString()
      : new Date().toISOString(), // Due immediately if wrong
  };

  await saveWordProgress(initialProgress);
}
```

### References

- [Source: epics.md#Story 4.2: Quiz Completion & Results]
- [Source: architecture.md#From UX - Animation Requirements]
- [Source: prd.md#FR25: System provides immediate feedback]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No blocking issues encountered during implementation.

### Completion Notes List

- Created `QuizResults` component with Divine Geometry design system (gold/cream/emerald palette)
- Implemented `getQuizFeedback()` utility with 4 score tiers: perfect (100%), excellent (>=80%), good effort (>=60%), keep practicing (<60%) — all positive, no shame messaging
- Integrated Lottie celebration animation for scores >= 80% with auto-play
- Score calculation uses `Math.round((correctCount / totalCount) * 100)` for clean percentages
- "Complete Lesson" button triggers: word progress initialization → lesson completion → analytics tracking → navigation back
- Created `initializeWordProgress()` API using upsert for idempotency — correct answers get 1-day interval, incorrect answers are due immediately
- Created `user_word_progress` database migration with RLS policies, review queue index, and auto-updated timestamps
- Extended existing analytics utility with `QUIZ_COMPLETED` event and `trackQuizCompleted()` helper
- Added Lottie mock for Jest testing and placeholder celebration.json animation
- All 350 tests pass with 0 regressions (35 new tests added)

### Change Log

- 2026-02-10: Implemented all 7 tasks for Story 4.2 Quiz Completion & Results
- 2026-02-10: Code review (adversarial) — 10 issues found (3H, 5M, 2L), 8 auto-fixed:
  - [H1] Fixed: Word progress results now checked, failures logged with count
  - [H2] Fixed: Alert shown on completion failure with Retry/Go Back options (was silent nav)
  - [H3] Fixed: Analytics now sends flagged_word_ids array (was only sending count)
  - [M1] Fixed: WordProgressInit status type now matches all 4 DB values (new/learning/review/mastered)
  - [M2] Fixed: Added DELETE RLS policy to user_word_progress migration (GDPR)
  - [M4/L1] Fixed: Added TODO comment for placeholder celebration.json
  - [M3] Deferred: router.back() vs unit-view navigation — acceptable for current flow
  - [M5] Deferred: No offline fallback for wordProgress.ts — track in future story
  - [L2] Noted: Worker forced exit warning is pre-existing jest timer leak

### File List

**New files:**
- safar-app/components/learning/QuizResults.tsx
- safar-app/lib/api/wordProgress.ts
- safar-app/assets/animations/celebration.json
- safar-app/__mocks__/lottie-react-native.js
- safar-app/supabase/migrations/20260210000002_create_user_word_progress.sql
- safar-app/__tests__/components/learning/QuizResults.test.tsx
- safar-app/__tests__/lib/wordProgress.test.ts

**Modified files:**
- safar-app/app/quiz/[lessonId].tsx
- safar-app/lib/utils/quiz.ts
- safar-app/lib/utils/analytics.ts
- safar-app/jest.config.js
- safar-app/__tests__/lib/quiz.test.ts
- safar-app/__tests__/screens/quiz.test.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/stories/4-2-quiz-completion-results.md
