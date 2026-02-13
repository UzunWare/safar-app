# Story 7.3: Sound Settings

Status: done

## Story

As a user,
I want to control sound settings,
so that I can use the app in different environments.

## Acceptance Criteria

1. **Given** I am in Settings > Sound, **When** I view sound options, **Then** I see a toggle for "Sound Effects" (UI sounds like button taps, success chimes) and the current state is shown
2. **Given** I toggle "Sound Effects" off, **When** using the app, **Then** UI sounds are muted but word pronunciation audio still plays (separate from sound effects)
3. **Given** I toggle "Sound Effects" on, **When** completing an action (correct answer, level up), **Then** appropriate sound effect plays

## Tasks / Subtasks

- [x] Task 1: Create sound settings UI (AC: #1)
  - [x] Add Sound section to settings
  - [x] Create toggle for sound effects
  - [x] Show current state

- [x] Task 2: Implement sound toggle handler (AC: #1)
  - [x] Update useSettingsStore
  - [x] Save preference immediately
  - [x] Apply immediately (no restart needed)

- [x] Task 3: Sound enabled/disabled check in quiz sounds (AC: #2, #3)
  - [x] useQuizSounds checks useSettingsStore.soundEnabled at play-time
  - [x] Sounds not played when disabled
  - [x] Play sound only if enabled

- [x] Task 4: Integrate sounds with UI (AC: #3)
  - [x] Correct answer sound
  - [x] Lesson complete sound
  - [x] XP gain sound
  - [x] Button tap feedback (optional)

- [x] Task 5: Ensure pronunciation not affected (AC: #2)
  - [x] Pronunciation uses separate setting
  - [x] Word audio always plays if requested
  - [x] Document separation in code

## Dev Notes

### Architecture Patterns

- **expo-av**: Used for both sound effects and pronunciation
- **Separate Controls**: Sound effects separate from pronunciation
- **Preloading**: Common sounds loaded at startup

### Code Patterns

```typescript
// lib/utils/sound.ts
import { Audio } from 'expo-av';

const sounds: Record<string, Audio.Sound> = {};

export async function loadSounds() {
  sounds.correct = (await Audio.Sound.createAsync(
    require('@/assets/audio/correct.mp3')
  )).sound;

  sounds.complete = (await Audio.Sound.createAsync(
    require('@/assets/audio/complete.mp3')
  )).sound;

  sounds.xp = (await Audio.Sound.createAsync(
    require('@/assets/audio/xp-gain.mp3')
  )).sound;
}

export async function playSound(name: 'correct' | 'complete' | 'xp') {
  const { soundEnabled } = useSettingsStore.getState();

  if (!soundEnabled) return;

  const sound = sounds[name];
  if (sound) {
    await sound.replayAsync();
  }
}

export async function unloadSounds() {
  for (const sound of Object.values(sounds)) {
    await sound.unloadAsync();
  }
}
```

```typescript
// Sound settings section
function SoundSettings() {
  const { soundEnabled, updateSetting } = useSettingsStore();

  const handleToggle = (value: boolean) => {
    updateSetting('soundEnabled', value);

    // Play test sound if enabling
    if (value) {
      playSound('correct');
    }
  };

  return (
    <SettingsSection title="Sound">
      <SettingsRow
        label="Sound Effects"
        description="UI sounds like success chimes"
        type="toggle"
        value={soundEnabled}
        onToggle={handleToggle}
      />
      <Text className="text-xs text-gray-500 px-4 mt-2">
        Word pronunciation is not affected by this setting.
      </Text>
    </SettingsSection>
  );
}
```

### Sound Effects Usage

```typescript
// In quiz component
const handleCorrectAnswer = async () => {
  setIsCorrect(true);
  await playSound('correct'); // Only plays if soundEnabled

  // Continue with next question
};

// In lesson complete
const handleLessonComplete = async () => {
  await playSound('complete');
  await markLessonComplete();
  router.push('/lesson/complete');
};

// In XP award
const handleXpGain = async (amount: number) => {
  await playSound('xp');
  showXpAnimation(amount);
};
```

### Distinction from Pronunciation

| Setting | Controls | Does NOT Control |
|---------|----------|------------------|
| Sound Effects | UI sounds, chimes, feedback | Word audio |
| (No setting) | N/A | Word pronunciation |

Word pronunciation always plays when the audio button is tapped, regardless of the sound effects setting.

### References

- [Source: epics.md#Story 7.3: Sound Settings]
- [Source: prd.md#FR49: Toggle sound effects]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No blocking issues encountered.

### Completion Notes List

- **Task 1-2 (AC #1):** Sound Settings UI and toggle handler were pre-implemented in Story 7.1. Validated with 34 existing settings tests — all pass. The settings screen has a "Sound" section with "Sound Effects" toggle wired to `useSettingsStore.soundEnabled`, persisted via AsyncStorage + Supabase sync.
- **Task 3 (AC #2, #3):** `useQuizSounds` hook checks `useSettingsStore.getState().soundEnabled` at play-time for immediate response to setting changes. Sound is only played when enabled. The original standalone `lib/utils/sound.ts` was removed during code review (dead code — never called from any app component).
- **Task 4 (AC #3):** Refactored `useQuizSounds` hook to use `useSettingsStore.soundEnabled` instead of the deprecated `useFeedbackPreferences` hook. This bridges the Settings screen toggle to the actual quiz sound playback. Uses `getState()` at play-time for instant mute when user toggles off mid-session. Correct answer + lesson complete sounds play via `useQuizSounds` in quiz component. XP gain sound fires at same moment as lesson complete (shared complete sound). 7 hook tests including enabled/disabled cases.
- **Task 5 (AC #2):** Verified `useAudio` pronunciation hook has zero dependency on `soundEnabled` — pronunciation always plays when user taps audio button. 2 architectural separation tests verifying source-level independence.

### Change Log

- 2026-02-13: Story 7.3 implementation complete. Refactored useQuizSounds to use useSettingsStore, validated pronunciation independence. 9 new/updated tests, all passing.
- 2026-02-13: Code review fixes applied. Removed dead code `lib/utils/sound.ts` and `__tests__/utils/sound.test.ts` (never integrated into app lifecycle). Added `__DEV__` error logging to `useQuizSounds.ts` catch blocks. Rewrote `soundSeparation.test.ts` with source-level architectural assertions. All 63 directly-related tests passing.

### File List

- `safar-app/lib/hooks/useQuizSounds.ts` (modified) — Switched from useFeedbackPreferences to useSettingsStore.soundEnabled; added __DEV__ error logging
- `safar-app/__tests__/utils/soundSeparation.test.ts` (new) — 2 source-level architectural separation tests
- `safar-app/__tests__/hooks/useQuizSounds.test.ts` (modified) — 7 tests updated for useSettingsStore integration

### Senior Developer Review

**Reviewer:** Code Review Workflow (Adversarial)
**Date:** 2026-02-13
**Outcome:** Approved with fixes applied

**Review Cycle 1 — Findings (1 High, 3 Medium, 2 Low):**

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| H1 | HIGH | `lib/utils/sound.ts` was dead code — `loadSounds()` never called from any app component, making `playSound()` a permanent no-op | Removed `sound.ts` and `sound.test.ts` (14 tests). All sound playback handled by `useQuizSounds` hook. |
| M1 | MEDIUM | Duplicate `SOUND_SOURCES` between `sound.ts` and `useQuizSounds.ts` | Resolved by H1 removal — single source of truth in `useQuizSounds.ts` |
| M2 | MEDIUM | Silent error swallowing in all catch blocks (no logging, no Sentry) unlike `useAudio.ts` pattern | Added `__DEV__` console.warn to 3 catch blocks in `useQuizSounds.ts` |
| M3 | MEDIUM | `soundSeparation.test.ts` test #2 was a no-op assertion (`toBeDefined()` on mock) | Rewrote with source-level `fs.readFileSync` assertions verifying `useAudio` has no `useSettingsStore` import |
| L1 | LOW | Missing pronunciation helper text in Sound settings UI (suggested in Dev Notes) | Not fixed — nice-to-have UX, not required by ACs |
| L2 | LOW | Redundant `Audio.setAudioModeAsync()` calls in multiple modules | Not fixed — low impact, pre-existing pattern |

**AC Verification:**
- AC#1: IMPLEMENTED — Settings toggle at `settings.tsx:338-345`
- AC#2: IMPLEMENTED — `useQuizSounds` respects `soundEnabled`; `useAudio` is independent
- AC#3: IMPLEMENTED — Quiz component calls `playSelect`, `playCorrect`, `playIncorrect`, `playComplete`

**Test Summary:** 9 tests across 2 files (down from 21 across 3 after removing dead code tests). All passing.
