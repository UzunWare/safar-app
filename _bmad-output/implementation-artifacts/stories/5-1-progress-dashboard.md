# Story 5.1: Progress Dashboard

Status: done

## Story

As a learner,
I want to see my learning progress at a glance,
so that I feel motivated and informed about my journey.

## Acceptance Criteria

1. **Given** I am on the Home tab, **When** the dashboard loads, **Then** I see my total words learned count, mastered words count (interval â‰¥7 days), pathway completion percentage with a ProgressRing visual, and current streak count with flame icon
2. **Given** I tap on any progress metric, **When** the detail view opens (optional for MVP), **Then** I see more detailed breakdown
3. **Given** my progress data is cached locally, **When** I open the app offline, **Then** I still see my progress (from cache) and a subtle indicator shows "last synced" time

## Tasks / Subtasks

- [x] Task 1: Create Home tab screen (AC: #1)
  - [x] Create `app/(tabs)/index.tsx` for Home
  - [x] Set up as default tab
  - [x] Design dashboard layout

- [x] Task 2: Create ProgressRing component (AC: #1)
  - [x] Create `components/progress/ProgressRing.tsx`
  - [x] SVG-based circular progress
  - [x] Accept percentage prop
  - [x] Animate on mount

- [x] Task 3: Create StreakCounter component (AC: #1)
  - [x] Create `components/progress/StreakCounter.tsx`
  - [x] Display flame icon
  - [x] Show streak count
  - [x] Add animation for active streak

- [x] Task 4: Create progress metrics display (AC: #1)
  - [x] Words learned count
  - [x] Mastered words count
  - [x] Layout in grid or cards

- [x] Task 5: Create useProgressStats hook (AC: #1)
  - [x] Aggregate data from multiple sources
  - [x] Calculate pathway completion
  - [x] Count mastered words
  - [x] Get current streak

- [x] Task 6: Implement metric tap detail (AC: #2, optional)
  - [x] Navigate to detail view on tap
  - [x] Show breakdown by unit/lesson
  - [x] Low priority for MVP

- [x] Task 7: Implement offline caching (AC: #3)
  - [x] Cache progress stats locally
  - [x] Show cached data when offline
  - [x] Display "last synced" indicator

- [x] Task 8: Add Continue Learning CTA
  - [x] Show next lesson recommendation
  - [x] Navigate to Learn tab on tap

## Dev Notes

### Architecture Patterns

- **Data Aggregation**: Combine multiple queries for dashboard
- **Caching**: Local cache for offline access
- **Component Library**: Reusable progress components

### Code Patterns

```typescript
// components/progress/ProgressRing.tsx
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, withTiming } from 'react-native-reanimated';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = '#3B82F6',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: withTiming(
      circumference - (percentage / 100) * circumference,
      { duration: 1000 }
    ),
  }));

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-3xl font-bold text-gray-800">
          {percentage}%
        </Text>
      </View>
    </View>
  );
}
```

```typescript
// components/progress/StreakCounter.tsx
interface StreakCounterProps {
  count: number;
  isActive?: boolean;
}

export function StreakCounter({ count, isActive = true }: StreakCounterProps) {
  return (
    <View className="flex-row items-center">
      <Text className={cn('text-2xl', isActive && 'animate-pulse')}>
        ðŸ”¥
      </Text>
      <Text className="text-2xl font-bold ml-1">
        {count}
      </Text>
      <Text className="text-gray-500 ml-1">
        {count === 1 ? 'day' : 'days'}
      </Text>
    </View>
  );
}
```

### Dashboard Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Home                               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Welcome back, [Name]! ðŸ‘‹           â”‚
â”‚                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚     â— 35%                     â”‚  â”‚
â”‚  â”‚  Pathway Progress             â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”‚
â”‚  â”‚  ðŸ”¥ 12  â”‚  â”‚  â­ 47  â”‚          â”‚
â”‚  â”‚ Streak  â”‚  â”‚Mastered â”‚          â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜          â”‚
â”‚                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Continue: Unit 2, Lesson 3   â†’â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                     â”‚
â”‚  ðŸŽ¯ Today's Goal                    â”‚
â”‚  â”â”â”â”â”â”â”â”â”â–‘â–‘â–‘â–‘ 3/5 words           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### useProgressStats Hook

```typescript
function useProgressStats() {
  const { data: lessonProgress } = useLessonProgress();
  const { data: wordProgress } = useWordProgress();
  const { data: streak } = useStreak();

  const stats = useMemo(() => {
    const wordsLearned = wordProgress?.length || 0;
    const wordsMastered = wordProgress?.filter(p => p.interval >= 7).length || 0;
    const completedLessons = lessonProgress?.filter(p => p.completed_at).length || 0;
    const totalLessons = 30; // From pathway
    const percentage = Math.round((completedLessons / totalLessons) * 100);

    return {
      wordsLearned,
      wordsMastered,
      completedLessons,
      pathwayPercentage: percentage,
      currentStreak: streak?.current_streak || 0,
    };
  }, [lessonProgress, wordProgress, streak]);

  return stats;
}
```

### References

- [Source: epics.md#Story 5.1: Progress Dashboard]
- [Source: prd.md#FR31-FR35: Progress and streak tracking]
- [Source: architecture.md#UX-Driven Architecture Requirements]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Code review (AI): fixed metric detail navigation coverage, streak flame icon compliance, and user-scoped offline cache behavior.
- Code review (AI): fixed stale cache writes in useProgressStats so dashboard cache refreshes when fresh data changes.

### Completion Notes List

- **Task 1**: Enhanced existing Home tab (`app/(tabs)/index.tsx`) with progress stats section, testIDs, and Divine Geometry styling. Home tab was already the default tab.
- **Task 2**: Created components/progress/ProgressRing.tsx - SVG-based circular progress with animated stroke using react-native-reanimated. Gold ring on emerald theme.
- **Task 3**: Updated components/progress/StreakCounter.tsx to use a flame icon for AC#1 compliance, with active/inactive visual states.
- **Task 4**: Added words learned and mastered words metric cards to Home screen in a 2-column grid layout with Divine Geometry styling (BookOpen + Star icons).
- **Task 5**: Enhanced lib/hooks/useProgressStats.ts to include pathway percentage and user-scoped cache keys (@safar/progress_stats/{userId}), while keeping streak placeholder at 0 for Story 5.2.
- **Task 6**: Made all progress metric cards tappable (ProgressRing, Streak, Words Learned, Mastered) -> navigate to Progress tab detail breakdown (AC#2 optional MVP).
- **Task 7**: Updated AsyncStorage caching to refresh when new data arrives and to provide cached pathway percentage plus "last synced" when data is loading/offline.
- **Task 8**: Added dedicated Continue Learning CTA button below stats - emerald background with gold chevron icon, navigates to next incomplete lesson.

### Senior Developer Review (AI)

**Review Date:** 2026-02-11  
**Outcome:** Changes Requested -> Fixed in this review pass

**Findings fixed (HIGH):**
- AC#1 mismatch: streak card used lightning icon instead of flame icon (safar-app/components/progress/StreakCounter.tsx).
- AC#2 partial implementation: only progress ring card navigated to details; other metrics were non-interactive (safar-app/app/(tabs)/index.tsx).
- Privacy/data isolation risk: dashboard cache key was global and not user-scoped, allowing cross-account cache bleed on shared devices (safar-app/lib/hooks/useProgressStats.ts).

**Findings fixed (MEDIUM):**
- Cache staleness: dashboard cache write was one-shot and did not refresh when values changed (safar-app/lib/hooks/useProgressStats.ts).
- Test quality gap: navigation tests validated pressability but did not assert actual router navigation (safar-app/__tests__/screens/dashboard.test.tsx).

**Verification:**
- Targeted tests passed: __tests__/lib/useProgressStats.test.ts, __tests__/screens/dashboard.test.tsx, __tests__/components/progress/ProgressRing.test.tsx, __tests__/components/progress/StreakCounter.test.tsx.
- Result: 4/4 suites passed, 45/45 tests passed.

### Change Log

- 2026-02-11: Story 5.1 implemented - Progress dashboard with ProgressRing, StreakCounter, metrics display, useProgressStats hook, offline caching, and Continue Learning CTA. All 592 tests pass (34 new tests added).
- 2026-02-11: Senior code review fixes applied - flame icon compliance, all metric cards route to Progress detail, user-scoped + refreshable dashboard cache, stronger navigation/cache tests.

### File List

- safar-app/app/(tabs)/index.tsx (modified) - Enhanced with progress stats section, ProgressRing, StreakCounter, tappable metrics cards, Continue CTA, last synced indicator
- safar-app/components/progress/ProgressRing.tsx (new) - SVG circular progress component with reanimated animation
- safar-app/components/progress/StreakCounter.tsx (modified) - Day streak display card updated to flame icon semantics
- safar-app/lib/hooks/useProgressStats.ts (modified) - User-scoped cache, refresh-on-change caching, cached pathway percentage support
- safar-app/__tests__/screens/dashboard.test.tsx (modified) - 21 tests with real router push assertions for metric/detail navigation
- safar-app/__tests__/components/progress/ProgressRing.test.tsx (new) - 6 tests for ProgressRing component
- safar-app/__tests__/components/progress/StreakCounter.test.tsx (new) - 5 tests for StreakCounter component
- safar-app/__tests__/lib/useProgressStats.test.ts (modified) - 14 tests including user-scoped cache key and cached pathway percentage behavior


