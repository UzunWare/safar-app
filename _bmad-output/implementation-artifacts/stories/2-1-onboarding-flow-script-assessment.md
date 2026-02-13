# Story 2.1: Onboarding Flow & Script Assessment

Status: done

## Story

As a new user,
I want to answer a question about my Arabic reading ability,
so that the app can customize my learning experience appropriately.

## Acceptance Criteria

1. **Given** I have just completed registration/sign-in for the first time, **When** I am navigated to the onboarding flow, **Then** I see a welcome screen with the Safar value proposition
2. **Given** I am on the welcome screen, **When** I proceed, **Then** I can continue to the script assessment question
3. **Given** I am on the script assessment screen, **When** I see the question "Can you read Arabic script?", **Then** I have two options: "Yes, I can read Arabic" and "I'm still learning" with each option having a brief description
4. **Given** I select "Yes, I can read Arabic", **When** I proceed, **Then** my preference is saved to my user profile and I am navigated to the pathway introduction
5. **Given** I select "I'm still learning", **When** I proceed, **Then** my preference is saved, I see a message that transliteration support is coming (Phase 2), and I can still proceed to the pathway with Arabic script

## Tasks / Subtasks

- [x] Task 1: Create onboarding flow structure (AC: #1, #2)
  - [x] Create `app/onboarding/_layout.tsx` for onboarding navigation
  - [x] Create `app/onboarding/index.tsx` welcome screen
  - [x] Create `app/onboarding/script-gate.tsx` assessment screen

- [x] Task 2: Design and implement welcome screen (AC: #1, #2)
  - [x] Add Safar logo/branding
  - [x] Add value proposition text: "Understand your prayers in 6 weeks"
  - [x] Add "Get Started" button to proceed
  - [x] Consider adding app illustration

- [x] Task 3: Implement script assessment screen (AC: #3)
  - [x] Add question: "Can you read Arabic script?"
  - [x] Create two option cards:
    - "Yes, I can read Arabic" with description
    - "I'm still learning" with description
  - [x] Style as selectable cards with visual feedback
  - [x] Add "Continue" button (enabled when option selected)

- [x] Task 4: Save script reading ability preference (AC: #4, #5)
  - [x] Update user_profiles table with script_reading_ability
  - [x] Create mutation function in lib/api/progress.ts
  - [x] Handle offline case (queue for sync)

- [x] Task 5: Handle "I'm still learning" path (AC: #5)
  - [x] Show informational modal/toast about Phase 2 transliteration
  - [x] Allow user to dismiss and continue
  - [x] Don't block progression

- [x] Task 6: Navigation to pathway introduction (AC: #4, #5)
  - [x] Navigate to pathway.tsx on completion
  - [x] Pass script ability as context if needed

## Dev Notes

### Architecture Patterns

- **Progressive Onboarding**: Step-by-step, not overwhelming
- **Persistent State**: Save preferences immediately
- **Graceful Degradation**: Phase 2 features noted but not blocking

### Code Patterns

```typescript
// Script ability options
const scriptOptions = [
  {
    value: 'fluent',
    title: 'Yes, I can read Arabic',
    description: 'I can read Arabic script and recognize letters',
  },
  {
    value: 'learning',
    title: "I'm still learning",
    description: 'I need help with Arabic letters and pronunciation',
  },
];

// Save to user profile
async function saveScriptAbility(ability: 'fluent' | 'learning') {
  const { error } = await supabase
    .from('user_profiles')
    .update({ script_reading_ability: ability })
    .eq('id', user.id);
}
```

### Onboarding Screen Flow

```
Sign Up / Sign In
       ↓
Welcome Screen (index.tsx)
       ↓
Script Assessment (script-gate.tsx)
       ↓
Pathway Introduction (pathway.tsx - Story 2.2)
       ↓
First Lesson (Epic 3)
```

### UX Considerations

- Large touch targets (44x44pt minimum)
- Clear visual selection state
- Progress indicator (optional)
- Skip option consideration (not for MVP)

### References

- [Source: epics.md#Story 2.1: Onboarding Flow & Script Assessment]
- [Source: ux-design-specification.md#Onboarding]
- [Source: prd.md#Onboarding (FR9-FR12)]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

Implementation completed on 2026-02-05.

### Completion Notes List

- **Task 1 - Onboarding Flow Structure**: Created complete onboarding flow structure with existing _layout.tsx Stack navigator. Replaced placeholder index.tsx with full welcome screen implementation. Created script-gate.tsx assessment screen with interactive selection UI.

- **Task 2 - Welcome Screen**: Implemented welcoming onboarding screen with Book icon for Safar branding, app name in Fraunces font, value proposition "Understand your prayers in 6 weeks", descriptive subtitle, and "Get Started" button with gold styling and shadow effects. Uses SafeAreaView and follows Divine Geometry design system.

- **Task 3 - Script Assessment Screen**: Created interactive script assessment with two selectable option cards ("Yes, I can read Arabic" / "I'm still learning"). Implemented visual feedback using CheckCircle2/Circle icons, border and background color changes on selection. Continue button with loading state (ActivityIndicator) during save operation.

- **Task 4 - Save Script Ability**: Implemented saveScriptAbility() function in lib/api/progress.ts. Updates user_profiles.script_reading_ability via Supabase. Includes robust offline handling - falls back to SecureStore when network unavailable, ensuring user isn't blocked during onboarding. Returns success/error status.

- **Task 5 - Learning Path Modal**: Implemented modal for users who select "I'm still learning". Shows friendly message explaining transliteration support coming in Phase 2. User can dismiss with X button or "Got it, continue" button. Non-blocking UX - allows continuation regardless of selection.

- **Task 6 - Navigation**: Navigation flow complete: welcome → script-gate → pathway. Fluent users go directly to pathway; learning users see modal first, then proceed to pathway. Pathway screen is placeholder for Story 2.2, currently redirects to main tabs.

- **Note on Testing**: Project does not have test framework (Jest/RTL) configured. Test infrastructure setup recommended as separate story. Implementation includes testID props for future testing (e.g., "continue-loading").

### Change Log

- 2026-02-05: All Tasks (1-6) - Implemented complete onboarding flow with welcome screen, script assessment, preference saving with offline support, modal for learners, and navigation to pathway placeholder. Added accessibility props (accessibilityRole, accessibilityLabel) to all interactive elements.
- 2026-02-05: Code Review Fixes - Applied 8 fixes from adversarial code review (1 CRITICAL, 3 HIGH, 4 MEDIUM). See Code Review Fixes section below.
- 2026-02-05: Code Review LOW Fixes - Applied 4 additional LOW fixes: analytics events, font loading verification, hardcoded colors replaced with constants, comprehensive testID coverage.

### Code Review Fixes (2026-02-05)

**Adversarial code review identified and fixed 12 issues (1 CRITICAL, 3 HIGH, 4 MEDIUM, 4 LOW):**

**CRITICAL:**
- **Database Migration Verification**: Added comprehensive error handling for missing database columns, with specific detection for migration-not-applied scenarios. Reports to Sentry with clear error tags. Falls back to AsyncStorage gracefully without blocking users.

**HIGH:**
- **Missing User Error Handling**: Added explicit check for null user in script-gate.tsx with user-friendly error message ("Please sign in to continue") and automatic redirect to auth screen after 2 seconds.
- **Storage Architecture Compliance**: Switched from SecureStore to AsyncStorage for script reading ability preference storage, aligning with Architecture decision that SecureStore is exclusively for auth tokens. Updated both saveScriptAbility and getScriptAbility functions.
- **Onboarding Completion Tracking**: Added completeOnboarding() function in progress.ts and integrated it into pathway.tsx. Now properly sets onboarding_completed=true and onboarding_completed_at timestamp when user reaches pathway screen, enabling Story 2.3 functionality.

**MEDIUM:**
- **Type Safety**: Removed `as any` type assertions, replaced with proper UserProfileUpdate interface for type-safe database updates.
- **Sentry Error Reporting**: Added comprehensive Sentry error reporting throughout onboarding flow while maintaining non-blocking UX. All errors tagged with screen and user_id for debugging.
- **Welcome Screen Loading State**: Added auth/onboarding status check with loading spinner to prevent flash-of-welcome-screen before redirect for returning users.
- **Accessibility - Reduce Transparency**: Added AccessibilityInfo check for reduce transparency system setting. Modal now uses opaque background (bg-black) instead of transparent overlay (bg-black/80) when setting is enabled, meeting WCAG 2.1 AA requirements.

All fixes maintain the principle of "don't block users" - errors are logged and reported but users can continue their onboarding journey.

**LOW:**
- **Analytics Events**: Created `lib/utils/analytics.ts` with `trackEvent()` wrapper and `AnalyticsEvents` constants. Added funnel events: `onboarding_welcome_viewed`, `onboarding_welcome_started`, `script_assessment_viewed`, `script_assessment_selected`, `script_assessment_completed`, `onboarding_completed`. Ready for Mixpanel integration.
- **Font Loading Verification**: Added `useFonts` from expo-font in root `_layout.tsx`. App now waits for fonts to load before rendering, with graceful fallback message if fonts fail.
- **Hardcoded Colors Replaced**: All hardcoded hex colors (`#cfaa6b`, `#0a1f1b`) in onboarding screens replaced with `colors.gold` and `colors.midnight` imports from `constants/colors.ts`, enabling proper theming support.
- **Comprehensive testID Coverage**: Added testIDs to all screens: `welcome-screen`, `welcome-logo`, `welcome-title`, `welcome-value-proposition`, `welcome-subtitle`, `welcome-get-started`, `script-gate-screen`, `script-gate-question`, `script-gate-subtitle`, `script-gate-options`, `script-option-fluent`, `script-option-learning`, `script-gate-continue`, `continue-loading`, `script-gate-error`, `transliteration-modal`, `modal-close`, `modal-title`, `modal-message`, `modal-continue`, `pathway-screen`, `pathway-icon`, `pathway-title`, `pathway-continue`.

### File List

- safar-app/app/_layout.tsx (modified - added useFonts for font loading verification)
- safar-app/app/onboarding/_layout.tsx (existing - Stack navigator)
- safar-app/app/onboarding/index.tsx (modified - added analytics, colors import, testIDs, auth/onboarding check with loading state)
- safar-app/app/onboarding/script-gate.tsx (new - script assessment with error handling, Sentry, analytics, accessibility, testIDs, colors import)
- safar-app/app/onboarding/pathway.tsx (new - placeholder for Story 2.2, onboarding completion, analytics, colors import, testIDs)
- safar-app/lib/api/progress.ts (new - saveScriptAbility, getScriptAbility, completeOnboarding with proper error handling)
- safar-app/lib/utils/analytics.ts (new - analytics wrapper with event constants)
- safar-app/constants/colors.ts (existing - referenced by all onboarding screens)
