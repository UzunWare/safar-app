# Story 3.3: Root Explorer - The "Aha Moment"

Status: done

## Story

As a learner,
I want to tap on a root to see other words from the same root,
so that I understand how Arabic words are connected (the core differentiator).

## Acceptance Criteria

1. **Given** I am viewing a word card with a root indicator, **When** I tap on the root (e.g., "Root: ح-م-د"), **Then** an inline panel expands with a spring animation (damping: 15) showing the root meaning (e.g., "praise, commendation") and 2-4 related words that share this root (each showing Arabic, transliteration, brief meaning)
2. **Given** the root explorer is expanded, **When** I tap on a related word, **Then** nothing happens in MVP (future: navigate to that word's lesson)
3. **Given** the root explorer is expanded, **When** I tap the root indicator again or tap outside, **Then** the panel collapses with a smooth animation
4. **Given** "Reduce Motion" is enabled in system settings, **When** the root explorer expands/collapses, **Then** the animation is instant (no spring effect)

## Tasks / Subtasks

- [x] Task 1: Create RootExplorer component (AC: #1)
  - [x] Create `components/learning/RootExplorer.tsx`
  - [x] Define RootExplorerProps interface
  - [x] Accept root data and related words

- [x] Task 2: Implement spring animation (AC: #1, #4)
  - [x] Use react-native-reanimated for animation
  - [x] Configure spring with damping: 15
  - [x] Animate height from 0 to content height
  - [x] Check AccessibilityInfo for Reduce Motion
  - [x] Use instant animation if Reduce Motion enabled

- [x] Task 3: Display root meaning (AC: #1)
  - [x] Show root letters prominently
  - [x] Display root meaning/translation
  - [x] Style appropriately

- [x] Task 4: Display related words (AC: #1)
  - [x] Query word_roots junction table for related words
  - [x] Limit to 2-4 words
  - [x] Show Arabic, transliteration, brief meaning for each

- [x] Task 5: Handle related word taps (AC: #2)
  - [x] Make related words tappable
  - [x] For MVP: no action, just visual feedback
  - [x] Add TODO comment for future navigation

- [x] Task 6: Implement collapse behavior (AC: #3)
  - [x] Tap root indicator again to collapse
  - [x] Tap outside panel to collapse
  - [x] Animate back to collapsed state

- [x] Task 7: Create useRelatedWords hook (AC: #1)
  - [x] Query words sharing same root
  - [x] Exclude current word from results
  - [x] Limit results to 4 words
  - [x] Cache with TanStack Query

- [x] Task 8: Track analytics event (AC: #1)
  - [x] Track 'root_tapped' event
  - [x] Include root_id, word_id in properties
  - [x] Critical metric for "aha moment"

## Dev Notes

### Architecture Patterns

- **Animation**: react-native-reanimated with spring config
- **Accessibility**: Respect Reduce Motion setting
- **Analytics**: Track root_tapped as key engagement metric

### Code Patterns

```typescript
// components/learning/RootExplorer.tsx
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AccessibilityInfo } from 'react-native';

interface RootExplorerProps {
  root: Root;
  relatedWords: Word[];
  isExpanded: boolean;
  onCollapse: () => void;
}

export function RootExplorer({
  root,
  relatedWords,
  isExpanded,
  onCollapse,
}: RootExplorerProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const height = isExpanded ? 200 : 0; // Measure actual content height
    const opacity = isExpanded ? 1 : 0;

    if (reduceMotion) {
      return {
        height: withTiming(height, { duration: 0 }),
        opacity: withTiming(opacity, { duration: 0 }),
      };
    }

    return {
      height: withSpring(height, { damping: 15 }),
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  return (
    <Animated.View style={animatedStyle} className="overflow-hidden">
      <View className="bg-amber-50 rounded-xl p-4 mt-2">
        {/* Root meaning */}
        <Text className="text-center font-amiri text-2xl">
          {root.letters}
        </Text>
        <Text className="text-center text-gray-600 mt-1">
          {root.meaning}
        </Text>

        {/* Related words */}
        <View className="mt-4 space-y-2">
          {relatedWords.slice(0, 4).map((word) => (
            <Pressable
              key={word.id}
              className="flex-row items-center justify-between py-2"
              onPress={() => {
                // MVP: no action
                // Future: navigate to word's lesson
              }}
            >
              <Text className="font-amiri text-lg">{word.arabic}</Text>
              <Text className="text-gray-500">{word.meaning}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}
```

```typescript
// useRelatedWords hook
function useRelatedWords(rootId: string, excludeWordId: string) {
  return useQuery({
    queryKey: ['relatedWords', rootId],
    queryFn: async () => {
      const { data } = await supabase
        .from('word_roots')
        .select(`
          words (
            id,
            arabic,
            transliteration,
            meaning
          )
        `)
        .eq('root_id', rootId)
        .neq('word_id', excludeWordId)
        .limit(4);

      return data?.map(wr => wr.words) || [];
    },
    staleTime: Infinity, // Static content
  });
}
```

### Analytics Event

```typescript
// Track root tap - critical engagement metric
analytics.track('root_tapped', {
  root_id: root.id,
  root_letters: root.letters,
  word_id: currentWord.id,
  lesson_id: currentLesson.id,
});
```

### References

- [Source: epics.md#Story 3.3: Root Explorer - The "Aha Moment"]
- [Source: architecture.md#UX-Driven Architecture Requirements]
- [Source: architecture.md#From UX - Animation Requirements]
- [Source: ux-design-specification.md#RootExplorer Component]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Reanimated mock approach: Used `jest.requireActual('react-native')` inside `jest.mock` factory to avoid circular dependency with css-interop
- AccessibilityInfo mock: Used `jest.spyOn` in `beforeEach` instead of module-level mock to avoid hoisting issues
- Async reduce motion test: Separated `render()` from `act()` to avoid unmounted renderer error

### Completion Notes List

- Task 1: Created RootExplorer component with typed props (RootExplorerProps), accepting root data, related words, expansion state, collapse callback, and wordId
- Task 2: Implemented spring animation using react-native-reanimated with damping: 15 config; added AccessibilityInfo listener for Reduce Motion (instant withTiming duration: 0); uses useRef to prevent duplicate analytics on re-renders
- Task 3: Root letters displayed with Amiri font at 28pt, root meaning with Outfit font; accessibility label on panel
- Task 4: Related words rendered in a list showing Arabic (Amiri, RTL), transliteration, and meaning; limited to 4 words max via slice
- Task 5: Related words have Pressable wrapper with button accessibilityRole; MVP: no navigation action, TODO comment for future
- Task 6: Collapse managed via isExpanded prop; parent controls toggle via onCollapse callback; animation handles both expand/collapse
- Task 7: Created useRelatedWords hook querying word_roots junction table via Supabase; excludes current word, limits to 4, uses Infinity staleTime for static content, disabled when rootId is empty
- Task 8: Tracks root_tapped event via trackEvent utility with root_id, root_letters, word_id properties; uses useRef to fire only once per expansion

### Change Log

- 2026-02-09: Story 3.3 implementation complete - RootExplorer component, useRelatedWords hook, analytics tracking (all 8 tasks)
- 2026-02-09: Visual enhancement - Replaced flat list layout with radial bloom visualization matching prototype design (center circle + diamond derivative tiles + gold connecting lines)
- 2026-02-09: Code review fixes (7 issues fixed):
  - H1: Fixed transliteration formatting bug (split('') → split('-')) — 'H - M - D' instead of 'H - - - M - - - D'
  - H2: Added visible transliteration/meaning labels below each derivative tile (AC #1 compliance)
  - H3: Wired onCollapse to center root circle Pressable (AC #3 compliance)
  - M1: Removed unused useSharedValue import
  - M2: Updated test assertion for correct transliteration format
  - M3: Added collapse behavior test (onCollapse called on root circle tap)
  - M4: Added optional lessonId prop and lesson_id in analytics event
  - Added 3 new tests: collapse callback, visible transliteration/meaning, analytics lesson_id

### File List

- safar-app/components/learning/RootExplorer.tsx (new)
- safar-app/lib/hooks/useRelatedWords.ts (new)
- safar-app/__tests__/components/learning/RootExplorer.test.tsx (new)
- safar-app/__tests__/hooks/useRelatedWords.test.ts (new)
