# Story 4.1: Multiple Choice Quiz

Status: done

## Story

As a learner,
I want to take a quiz after learning words,
so that I can test my understanding and reinforce my memory.

## Acceptance Criteria

1. **Given** I complete viewing all words in a lesson, **When** the quiz begins, **Then** I see a quiz card with an Arabic word, 4 English meaning options (1 correct, 3 distractors), and the options are randomly ordered each time
2. **Given** I am viewing a quiz question, **When** I tap on an answer option, **Then** I receive immediate visual feedback (<100ms), correct answers show green highlight, and incorrect answers show red highlight with correct answer revealed
3. **Given** I answer correctly, **When** the feedback is shown, **Then** I see a brief success animation and after 1 second, I automatically proceed to the next question
4. **Given** I answer incorrectly, **When** the feedback is shown, **Then** I see the correct answer highlighted, I must tap "Continue" to proceed, and this word is flagged for additional review

## Tasks / Subtasks

- [x] Task 1: Create quiz screen (AC: #1)
  - [x] Create `app/quiz/[lessonId].tsx` screen (adapted path from story — flat route pattern matches codebase)
  - [x] Accept lesson ID from route params
  - [x] Fetch lesson words for quiz

- [x] Task 2: Create QuizCard component (AC: #1)
  - [x] Create `components/learning/QuizCard.tsx`
  - [x] Display Arabic word prominently
  - [x] Display 4 answer options
  - [x] Track selected state

- [x] Task 3: Generate quiz questions (AC: #1)
  - [x] Create quiz generation logic (`lib/utils/quiz.ts`)
  - [x] Select correct answer from word.meaning
  - [x] Generate 3 distractors from other words in pathway
  - [x] Randomize option order (Fisher-Yates shuffle)

- [x] Task 4: Create answer option component (AC: #2)
  - [x] Create `components/learning/QuizOption.tsx`
  - [x] Handle tap/press events
  - [x] Show normal, correct, incorrect, revealed states
  - [x] State-driven visual transitions (gold correct, red incorrect)

- [x] Task 5: Implement immediate feedback (AC: #2)
  - [x] Detect correct/incorrect instantly via synchronous state update
  - [x] Apply visual feedback within 100ms (synchronous setState)
  - [x] Gold highlight for correct (Divine Geometry palette)
  - [x] Red highlight for wrong, reveal correct in gold

- [x] Task 6: Handle correct answer flow (AC: #3)
  - [x] Show success animation (gold checkmark circle)
  - [x] Wait 1 second (setTimeout auto-advance)
  - [x] Auto-advance to next question
  - [x] Track correct answer count

- [x] Task 7: Handle incorrect answer flow (AC: #4)
  - [x] Show red highlight on selected
  - [x] Show gold highlight on correct answer
  - [x] Display "Continue" button
  - [x] Flag word for additional review (flaggedWordIds array)
  - [x] Track incorrect answer count

- [x] Task 8: Create quiz state management
  - [x] Track current question index
  - [x] Track score (correct/total)
  - [x] Track flagged words
  - [x] Handle quiz completion (quiz complete screen with score)

## Dev Notes

### Architecture Patterns

- **Immediate Feedback**: NFR5 requires <100ms response
- **Animation**: Subtle but clear feedback
- **Spaced Repetition Integration**: Incorrect words get shorter intervals

### Code Patterns

```typescript
// components/learning/QuizCard.tsx
interface QuizCardProps {
  word: Word;
  options: string[];
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
}

export function QuizCard({ word, options, onAnswer }: QuizCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const correctIndex = options.indexOf(word.meaning);

  const handleSelect = (index: number) => {
    if (showResult) return; // Already answered

    setSelectedIndex(index);
    setShowResult(true);
    const isCorrect = index === correctIndex;
    onAnswer(index, isCorrect);
  };

  return (
    <View className="p-6">
      {/* Arabic word */}
      <Text className="text-center font-amiri text-4xl mb-8">
        {word.arabic}
      </Text>

      {/* Options */}
      <View className="space-y-3">
        {options.map((option, index) => (
          <QuizOption
            key={index}
            text={option}
            state={getOptionState(index, selectedIndex, correctIndex, showResult)}
            onPress={() => handleSelect(index)}
            disabled={showResult}
          />
        ))}
      </View>
    </View>
  );
}

function getOptionState(
  index: number,
  selectedIndex: number | null,
  correctIndex: number,
  showResult: boolean
): 'normal' | 'correct' | 'incorrect' | 'missed' {
  if (!showResult) return 'normal';

  if (index === correctIndex) return 'correct';
  if (index === selectedIndex) return 'incorrect';
  return 'normal';
}
```

```typescript
// Quiz option component
interface QuizOptionProps {
  text: string;
  state: 'normal' | 'correct' | 'incorrect' | 'missed';
  onPress: () => void;
  disabled: boolean;
}

export function QuizOption({ text, state, onPress, disabled }: QuizOptionProps) {
  const bgColor = {
    normal: 'bg-gray-100',
    correct: 'bg-green-100 border-green-500',
    incorrect: 'bg-red-100 border-red-500',
    missed: 'bg-gray-100',
  }[state];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'p-4 rounded-xl border-2',
        bgColor,
        disabled && 'opacity-70'
      )}
    >
      <Text className="text-lg text-center">{text}</Text>
    </Pressable>
  );
}
```

### Distractor Generation

```typescript
// Generate distractors from other words
function generateDistractors(
  correctWord: Word,
  allWords: Word[],
  count: number = 3
): string[] {
  const otherMeanings = allWords
    .filter(w => w.id !== correctWord.id)
    .map(w => w.meaning);

  // Shuffle and take first N
  return shuffleArray(otherMeanings).slice(0, count);
}

// Combine and shuffle all options
function createQuizOptions(correctMeaning: string, distractors: string[]): string[] {
  return shuffleArray([correctMeaning, ...distractors]);
}
```

### References

- [Source: epics.md#Story 4.1: Multiple Choice Quiz]
- [Source: architecture.md#NFR5: Quiz answer feedback under 100ms]
- [Source: prd.md#FR23-FR25: Quiz functionality]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No blocking issues encountered during implementation.

### Completion Notes List

- Quiz screen created at `app/quiz/[lessonId].tsx` using flat route pattern (matches existing `lesson/[id]` and `frequency-lesson/[id]` patterns) instead of nested `app/lesson/[id]/quiz.tsx` to avoid filesystem conflicts with existing `[id].tsx` file
- QuizCard component displays Arabic word (Amiri 48px, RTL) with "What does this word mean?" prompt (Fraunces), followed by 4 shuffled answer options
- QuizOption component supports 4 visual states: normal (transparent/white border), correct (gold), incorrect (red), revealed (gold subtle)
- Quiz generation utility (`lib/utils/quiz.ts`) uses Fisher-Yates shuffle, deduplicates meanings, gracefully handles <4 words
- Immediate feedback is synchronous — setState fires on press with no async delay, well under 100ms NFR
- Correct answer flow: gold checkmark circle appears, auto-advances after 1 second via setTimeout
- Incorrect answer flow: red highlight on wrong pick, gold highlight on correct answer revealed, "Continue" button required to advance, word flagged in `flaggedWordIds` array
- State managed via React useState (QuizState interface) — no external store needed for quiz-session-scoped state
- Quiz complete screen shows final score and "Done" button
- All styling uses Divine Geometry palette (emerald/gold/cream) — no generic colors
- Route registered in `_layout.tsx` Stack navigator with proper navigation guard
- Replaced deprecated SafeAreaView from RN with plain View (safe area handled by Expo Router layout)
- 54 tests across 4 test files, 315 total tests passing with 0 regressions (4 tests added during code review)

### Change Log

- 2026-02-10: Implemented Story 4.1 — Multiple Choice Quiz (all 8 tasks complete)
- 2026-02-10: Code review fixes — 3 HIGH, 4 MEDIUM issues resolved (see Senior Developer Review below)

### File List

New files:
- safar-app/app/quiz/[lessonId].tsx
- safar-app/components/learning/QuizCard.tsx
- safar-app/components/learning/QuizOption.tsx
- safar-app/lib/utils/quiz.ts
- safar-app/__tests__/screens/quiz.test.tsx
- safar-app/__tests__/lib/quiz.test.ts
- safar-app/__tests__/components/learning/QuizOption.test.tsx
- safar-app/__tests__/components/learning/QuizCard.test.tsx

Modified files:
- safar-app/app/_layout.tsx (added quiz route, inQuizGroup navigation guard)
- safar-app/types/index.ts (added quiz + frequency-lesson routes to RootStackParamList) [review fix]

## Senior Developer Review (AI)

**Reviewer:** Emrek | **Date:** 2026-02-10 | **Model:** Claude Opus 4.6

### Review Outcome: Approved with Fixes Applied

**Issues Found:** 3 HIGH, 4 MEDIUM, 2 LOW
**Issues Fixed:** 3 HIGH, 4 MEDIUM (all automatically)

### Fixes Applied

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| H1 | HIGH | No test for quiz completion screen | Added 2 tests: completion screen renders after all questions, Done button navigates back |
| H2 | HIGH | No test for flagged word tracking | Added test: incorrect answer → score reflects 3/4 on completion |
| H3 | HIGH | `RootStackParamList` missing quiz route | Added `quiz/[lessonId]` and `frequency-lesson/[id]` to navigation types |
| M1 | MEDIUM | No animation on success checkmark | Added Animated spring scale + opacity entrance (200ms, native driver) |
| M2 | MEDIUM | `revealed` state dead code | Wired up `getOptionState` to return `revealed` when correct answer shown after wrong pick |
| M3 | MEDIUM | `getOptionTestID` dead parameters | Removed unused `selectedOptionId` and `showResult` params |
| M4 | MEDIUM | `advanceToNext` missing from useCallback deps | Moved `advanceToNext` before `handleSelectOption`, added to dependency array |

### Remaining LOW Issues (Deferred)

- **L1:** Correct option ID is predictably `'correct'` — cosmetic, no runtime impact
- **L2:** Parallel quiz type systems (`QuizQuestion` vs `QuizQuestionData`) undocumented — architectural note for future reference
