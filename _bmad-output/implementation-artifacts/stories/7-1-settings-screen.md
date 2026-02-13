# Story 7.1: Settings Screen

Status: done

## Story

As a user,
I want to access app settings,
so that I can customize my experience.

## Acceptance Criteria

1. **Given** I am on the Profile tab, **When** I tap "Settings", **Then** I see the settings screen with organized sections: Notifications, Sound, Account, Legal, Support
2. **Given** I am on the settings screen, **When** I view each section, **Then** settings are displayed with appropriate controls (toggles, buttons) and current values are shown

## Tasks / Subtasks

- [x] Task 1: Create settings screen (AC: #1)
  - [x] Create `app/settings.tsx` screen (root-level route, consistent with subscription/paywall pattern)
  - [x] Add navigation from profile tab
  - [x] Design settings layout

- [x] Task 2: Create settings sections (AC: #1, #2)
  - [x] Notifications section
  - [x] Sound section
  - [x] Account section
  - [x] Legal section
  - [x] Support section

- [x] Task 3: Create SettingsRow component (AC: #2)
  - [x] Support toggle type (SettingsToggleRow)
  - [x] Support navigation type (SettingsNavRow)
  - [x] Support value display (SettingsValueRow)
  - [x] Consistent styling (Divine Geometry palette)

- [x] Task 4: Create useSettingsStore (AC: #2)
  - [x] Create `lib/stores/useSettingsStore.ts`
  - [x] Track all user preferences (streakReminders, reviewReminders, soundEnabled)
  - [x] Persist to AsyncStorage (via Zustand persist middleware)

- [x] Task 5: Load current settings values (AC: #2)
  - [x] Query user_settings from Supabase
  - [x] Populate store with values
  - [x] Show current state in UI

- [x] Task 6: Add settings persistence (AC: #2)
  - [x] Save to local storage (AsyncStorage via Zustand persist)
  - [x] Sync to server (Supabase upsert on update)
  - [x] Handle offline changes (local-first with non-blocking sync)

### Review Follow-ups (AI)

- [x] [AI-Review][High] `loadSettings()` is now called on screen mount when store state is not loaded, ensuring runtime hydration from `user_settings`. [safar-app/app/settings.tsx]
- [x] [AI-Review][High] Broken `/settings/delete-account` route dependency removed; Delete Account now opens `DeleteAccountDialog` directly from the settings screen. [safar-app/app/settings.tsx]
- [x] [AI-Review][High] `syncSettings()` now validates Supabase upsert response and throws on `error` so failures are not silently ignored. [safar-app/lib/stores/useSettingsStore.ts]
- [x] [AI-Review][Medium] External link handling now uses `Linking.canOpenURL()` with guarded fallback alerts for legal/support actions. [safar-app/app/settings.tsx]
- [x] [AI-Review][Medium] Test suite expanded to cover mount hydration, delete-account flow, legal/support link behavior, and fallback handling. [safar-app/__tests__/settings/SettingsScreen.test.tsx]

## Dev Notes

### Architecture Patterns

- **Zustand Store**: useSettingsStore for preferences
- **AsyncStorage**: Local persistence
- **Server Sync**: Sync preferences across devices

### Code Patterns

```typescript
// app/(tabs)/profile/settings.tsx
export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Notifications Section */}
      <SettingsSection title="Notifications">
        <SettingsRow
          label="Streak Reminders"
          type="toggle"
          value={settings.streakReminders}
          onToggle={(v) => updateSetting('streakReminders', v)}
        />
        <SettingsRow
          label="Review Reminders"
          type="toggle"
          value={settings.reviewReminders}
          onToggle={(v) => updateSetting('reviewReminders', v)}
        />
      </SettingsSection>

      {/* Sound Section */}
      <SettingsSection title="Sound">
        <SettingsRow
          label="Sound Effects"
          type="toggle"
          value={settings.soundEnabled}
          onToggle={(v) => updateSetting('soundEnabled', v)}
        />
      </SettingsSection>

      {/* Account Section */}
      <SettingsSection title="Account">
        <SettingsRow
          label="Subscription"
          type="navigation"
          value={subscriptionStatus}
          onPress={() => router.push('/subscription')}
        />
        <SettingsRow
          label="Delete Account"
          type="navigation"
          onPress={() => router.push('/settings/delete-account')}
          destructive
        />
      </SettingsSection>

      {/* Legal Section */}
      <SettingsSection title="Legal">
        <SettingsRow
          label="Privacy Policy"
          type="navigation"
          onPress={() => openUrl(PRIVACY_URL)}
        />
        <SettingsRow
          label="Terms of Service"
          type="navigation"
          onPress={() => openUrl(TERMS_URL)}
        />
      </SettingsSection>

      {/* Support Section */}
      <SettingsSection title="Support">
        <SettingsRow
          label="Contact Support"
          type="navigation"
          onPress={() => handleContactSupport()}
        />
        <SettingsRow
          label="App Version"
          type="value"
          value={appVersion}
        />
      </SettingsSection>
    </ScrollView>
  );
}
```

```typescript
// lib/stores/useSettingsStore.ts
interface SettingsState {
  // Notifications
  streakReminders: boolean;
  reviewReminders: boolean;
  learningReminders: boolean;

  // Sound
  soundEnabled: boolean;

  // Actions
  updateSetting: (key: string, value: any) => void;
  loadSettings: () => Promise<void>;
  syncSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      streakReminders: true,
      reviewReminders: true,
      learningReminders: true,
      soundEnabled: true,

      updateSetting: async (key, value) => {
        set({ [key]: value });
        await get().syncSettings();
      },

      loadSettings: async () => {
        // Load from Supabase
        const { data } = await supabase
          .from('user_settings')
          .select('*')
          .single();

        if (data) {
          set(data);
        }
      },

      syncSettings: async () => {
        const state = get();
        await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            streak_reminders: state.streakReminders,
            review_reminders: state.reviewReminders,
            sound_enabled: state.soundEnabled,
          });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Settings Sections

| Section | Items |
|---------|-------|
| Notifications | Streak reminders, Review reminders, Learning reminders |
| Sound | Sound effects toggle |
| Account | Subscription, Export data, Delete account |
| Legal | Privacy Policy, Terms of Service |
| Support | Contact Support, App Version |

### References

- [Source: epics.md#Story 7.1: Settings Screen]
- [Source: prd.md#FR48-FR52: Settings & Preferences]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Settings screen placed at `app/settings.tsx` (root-level route) instead of `app/(tabs)/profile/settings.tsx` to follow existing subscription/paywall pattern and avoid nested tab layout complexity
- SettingsRow components (Toggle, Nav, Value) kept as local components within settings.tsx since they're only used there
- Zustand persist middleware with `partialize` used to exclude `isLoaded` and actions from AsyncStorage
- `updateSetting` uses local-first pattern: state updated immediately, Supabase sync wrapped in try/catch so network failures don't block UI

### Completion Notes List

- **Task 1**: Created `app/settings.tsx` with ScreenBackground (parchment variant), back navigation, and "Settings" header using Fraunces 30px font. Wired profile Settings button via `router.push('/settings')`. Registered route in `app/_layout.tsx` Stack navigator.
- **Task 2**: All 5 sections implemented: Notifications (streak/review toggles), Sound (effects toggle), Account (subscription nav with status, delete account), Legal (privacy policy, terms of service), Support (contact email, app version display).
- **Task 3**: Three row types: `SettingsToggleRow` (Switch with emerald/teal track), `SettingsNavRow` (Pressable with ChevronRight, optional value, destructive variant), `SettingsValueRow` (static text display). All use Divine Geometry palette with white card styling.
- **Task 4**: `useSettingsStore` created with Zustand + persist middleware. Tracks streakReminders, reviewReminders, soundEnabled. Persists to AsyncStorage under key `settings-storage`.
- **Task 5**: `loadSettings()` queries `user_settings` table from Supabase, maps snake_case columns to camelCase state. Handles no-data and error cases gracefully.
- **Task 6**: `syncSettings()` upserts to Supabase with `onConflict: 'user_id'`. `updateSetting()` updates local state first, then syncs non-blocking. Offline changes preserved in AsyncStorage.

### Change Log

- 2026-02-12: Story 7.1 implementation complete - Settings screen with 5 sections, Zustand store with AsyncStorage persistence and Supabase sync, 28 tests added
- 2026-02-12: Senior Developer Review (AI) completed - 3 High and 2 Medium issues identified; follow-up tasks added; status moved to in-progress
- 2026-02-12: Senior Developer Review (AI, YOLO rerun) reconfirmed unresolved findings; existing follow-up actions retained; status remains in-progress
- 2026-02-12: Fixed all 5 AI review findings (3 High, 2 Medium), expanded settings tests, and moved story to done

### File List

- `safar-app/app/settings.tsx` (NEW) - Settings screen with all sections and row components
- `safar-app/lib/stores/useSettingsStore.ts` (NEW) - Zustand settings store with persist middleware
- `safar-app/app/(tabs)/profile.tsx` (MODIFIED) - Wired Settings button to navigate to /settings
- `safar-app/app/_layout.tsx` (MODIFIED) - Added settings route to Stack navigator and catch-all guard
- `safar-app/__tests__/settings/SettingsScreen.test.tsx` (NEW) - 16 tests for settings screen UI
- `safar-app/__tests__/settings/useSettingsStore.test.ts` (NEW) - 12 tests for settings store

## Senior Developer Review (AI)

### Reviewer

Emrek

### Date

2026-02-12

### Outcome

Approved

### Summary

- Git repository metadata was unavailable in this workspace, so git-based change validation could not be performed.
- AC #1 is implemented (profile navigation to settings and sectioned settings screen present).
- AC #2 is now fully implemented with runtime hydration and improved sync/link robustness.
- Findings resolved: 3 High, 2 Medium, 0 Low remaining.
- Verification: `npm test -- __tests__/settings/SettingsScreen.test.tsx __tests__/settings/useSettingsStore.test.ts` (34 passing tests).
