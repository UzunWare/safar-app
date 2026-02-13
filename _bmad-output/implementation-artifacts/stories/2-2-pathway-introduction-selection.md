# Story 2.2: Pathway Introduction & Selection

Status: done

## Story

As a new user,
I want to see the Salah First learning pathway,
so that I understand what I will learn and can begin my journey.

## Acceptance Criteria

1. **Given** I have completed the script assessment, **When** I arrive at the pathway introduction screen, **Then** I see the "Salah First" pathway prominently displayed
2. **Given** I am viewing the pathway, **When** I see the promise, **Then** it shows "Understand your daily prayers in 6 weeks"
3. **Given** I am viewing the pathway, **When** I see the details, **Then** I see the pathway contains ~120 words across 6 units and a preview of what I'll learn (Al-Fatiha, common prayer phrases)
4. **Given** I am viewing the pathway introduction, **When** I tap "Start Learning" or "Begin Pathway", **Then** I am navigated to the first lesson of Unit 1 and my onboarding is marked as complete
5. **Given** I am viewing the pathway, **When** I see the unit breakdown, **Then** I see 6 units listed with their titles and word counts, with all units except Unit 1 showing as locked (visual only, no actual gating in MVP)

## Tasks / Subtasks

- [x] Task 1: Create pathway introduction screen (AC: #1, #2, #3)
  - [x] Create `app/onboarding/pathway.tsx` screen
  - [x] Display "Salah First" pathway name prominently
  - [x] Display promise: "Understand your daily prayers in 6 weeks"
  - [x] Display word count (~120 words) and unit count (6 units)

- [x] Task 2: Create pathway preview section (AC: #3)
  - [x] Show preview of content (Al-Fatiha, prayer phrases)
  - [x] Add visual elements (icons, illustrations)
  - [x] Make content engaging and motivational

- [x] Task 3: Create unit breakdown list (AC: #5)
  - [x] Display 6 units with titles
  - [x] Show word count per unit
  - [x] Show Unit 1 as unlocked
  - [x] Show Units 2-6 with lock icon (visual only)

- [x] Task 4: Implement "Begin Your Journey" action (AC: #4)
  - [x] Add prominent CTA button ("Begin Your Journey" - UX improvement over AC wording)
  - [x] Mark onboarding as complete in user_profiles
  - [x] Navigate to `/(tabs)/learn` (lesson screens deferred to Epic 3)

- [x] Task 5: Mark onboarding complete (AC: #4)
  - [x] Update user_profiles.onboarding_completed = true
  - [x] Update user_profiles.onboarding_completed_at = now()
  - [x] Save offline fallback via AsyncStorage (sync queue deferred to Story 7-6)

- [x] Task 6: Query pathway data (AC: #1, #5)
  - [x] Create usePathway hook in lib/hooks/
  - [x] Query pathways table for Salah First
  - [x] Query units for this pathway
  - [x] Cache with TanStack Query

## Dev Notes

### Architecture Patterns

- **Data Fetching**: TanStack Query for pathway/unit data
- **Caching**: Pathway data is static, long cache time
- **Navigation**: Deep link to first lesson after completion

### Code Patterns

```typescript
// usePathway hook
function usePathway(pathwayId: string) {
  return useQuery({
    queryKey: ['pathway', pathwayId],
    queryFn: async () => {
      const { data } = await supabase
        .from('pathways')
        .select(`
          *,
          units (
            id,
            name,
            order,
            word_count
          )
        `)
        .eq('id', pathwayId)
        .single();
      return data;
    },
    staleTime: Infinity, // Static content
  });
}
```

```typescript
// Mark onboarding complete
async function completeOnboarding(userId: string) {
  await supabase
    .from('user_profiles')
    .update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', userId);
}
```

### UI Structure

```
┌─────────────────────────────────────┐
│        🕌 Salah First               │
│  Understand your prayers in 6 weeks │
│                                     │
│  📖 120 words · 6 units             │
│                                     │
│  What you'll learn:                 │
│  • Al-Fatiha (complete)             │
│  • Common prayer phrases            │
│  • Essential du'as                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Unit 1: Al-Fatiha    20 words│   │
│  │ Unit 2: Ruku' & Sujud 🔒    │   │
│  │ Unit 3: Tashahhud    🔒     │   │
│  │ ...                          │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ Begin Your Journey ]             │
└─────────────────────────────────────┘
```

### References

- [Source: epics.md#Story 2.2: Pathway Introduction & Selection]
- [Source: prd.md#Onboarding (FR10, FR11)]
- [Source: ux-design-specification.md#Pathway Selection]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Resolved Expo SDK 54 Jest compatibility issue: `expo/src/winter/runtime.native.ts` lazy requires fail in Jest. Fixed with custom test environment that locks globals as non-configurable before jest-expo setup runs.

### Completion Notes List

- Jest test infrastructure set up with custom `ExpoTestEnvironment` to handle Expo SDK 54 winter runtime compatibility
- `usePathway` hook created with TanStack Query, `staleTime: Infinity` for static content
- `pathways` and `units` table types added to `supabase.types.ts`
- Pathway screen fully implemented with: header (name + promise), stats badges, preview section, unit breakdown list with lock icons, sticky CTA
- `completeOnboarding` already existed in `lib/api/progress.ts` with offline fallback via AsyncStorage
- 17 tests passing: 5 hook tests, 11 screen tests, 1 smoke test
- CTA navigates to `/(tabs)/learn` after marking onboarding complete (non-blocking on errors)
- **[Review Fix]** Units now sorted by `order` column in usePathway hook (prevents out-of-order display)
- **[Review Fix]** Error state UI added with retry button when pathway query fails
- **[Review Fix]** `setIsCompleting` now resets in `finally` block
- **[Review Fix]** Test coverage added: unauthenticated user redirect, error state display
- **[Review Fix]** Navigation updated from `/(tabs)` to `/(tabs)/learn` (closer to AC intent)
- 19 tests passing: 5 hook tests, 13 screen tests, 1 smoke test

### Known Deviations

- **AC #4 Navigation**: Navigates to `/(tabs)/learn` instead of "first lesson of Unit 1" because lesson screens are built in Epic 3. Will be updated to deep-link to first lesson once Story 3-1 is complete.
- **AC #4 CTA Text**: Button says "Begin Your Journey" instead of "Start Learning"/"Begin Pathway" - intentional UX improvement.
- **Offline Sync**: `completeOnboarding` saves to AsyncStorage as fallback but no automatic sync queue implemented. Full offline sync queue is deferred to Story 7-6.

### Change Log

- `app/onboarding/pathway.tsx` - Replaced placeholder with full pathway introduction screen
- `lib/hooks/usePathway.ts` - New hook for querying pathway + units data
- `types/supabase.types.ts` - Added `pathways`, `units` table types + `PathwayWithUnits` convenience type
- `jest.config.js` - Created Jest configuration with custom test environment
- `__tests__/setup/test-environment.js` - Custom Jest environment for Expo SDK 54 compatibility
- `__tests__/setup/jest.setup.ts` - Common mocks for React Native + Expo testing
- `__tests__/hooks/usePathway.test.ts` - Hook unit tests (5 tests)
- `__tests__/screens/pathway.test.tsx` - Screen integration tests (11 tests)
- `__tests__/smoke.test.ts` - Basic Jest smoke test
- `__mocks__/lucide-react-native.js` - Proxy-based icon mock
- `__mocks__/@sentry/react-native.js` - Sentry mock
- `package.json` - Added test scripts and dev dependencies

### File List

- `app/onboarding/pathway.tsx`
- `lib/hooks/usePathway.ts`
- `types/supabase.types.ts`
- `jest.config.js`
- `__tests__/setup/test-environment.js`
- `__tests__/setup/jest.setup.ts`
- `__tests__/setup/jest.pre-setup.js`
- `__tests__/hooks/usePathway.test.ts`
- `__tests__/screens/pathway.test.tsx`
- `__tests__/smoke.test.ts`
- `__mocks__/lucide-react-native.js`
- `__mocks__/@sentry/react-native.js`
- `__mocks__/expo-import-meta-registry.js`
- `package.json`
