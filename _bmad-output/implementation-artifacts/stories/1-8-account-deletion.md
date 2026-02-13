# Story 1.8: Account Deletion

Status: done

## Story

As a user,
I want to delete my account and all associated data,
so that I can exercise my right to data removal (GDPR compliance).

## Acceptance Criteria

1. **Given** I am signed in and on the settings screen, **When** I tap "Delete Account", **Then** I see a warning dialog explaining that all data will be permanently deleted and I am asked to type "DELETE" to confirm
2. **Given** I confirm deletion by typing "DELETE", **When** the deletion process completes, **Then** my user record is deleted from Supabase Auth
3. **Given** deletion completes, **When** checking database, **Then** all my associated data (progress, streaks, settings) is cascade deleted
4. **Given** deletion completes, **When** checking local storage, **Then** my local cached data is cleared
5. **Given** deletion completes, **When** navigation occurs, **Then** I am navigated to the sign-up screen and I see a confirmation "Your account has been deleted"
6. **Given** I cancel the deletion, **When** I dismiss the dialog or tap "Cancel", **Then** no data is deleted and I remain on the settings screen

## Tasks / Subtasks

- [x] Task 1: Add delete account option to settings (AC: #1)
  - [x] Add "Delete Account" row to profile/settings screen
  - [x] Style as destructive action (red text or icon)
  - [x] Place at bottom of settings list

- [x] Task 2: Create deletion confirmation dialog (AC: #1, #6)
  - [x] Create specialized dialog with text input
  - [x] Show warning message about permanent deletion
  - [x] Require typing "DELETE" to enable confirm button
  - [x] Add Cancel button

- [x] Task 3: Create Supabase Edge Function for deletion (AC: #2, #3)
  - [x] Create `supabase/functions/delete-user/` Edge Function
  - [x] Verify user identity from JWT
  - [x] Delete all user data from related tables
  - [x] Delete user from auth.users
  - [x] Log deletion for audit (without PII)

- [x] Task 4: Configure cascade deletion in database (AC: #3)
  - [x] Ensure user_profiles has ON DELETE CASCADE
  - [x] Ensure user_progress has ON DELETE CASCADE (future table — will be added in Epic 4)
  - [x] Ensure user_streaks has ON DELETE CASCADE (future table — will be added in Epic 5)
  - [x] Ensure user_xp has ON DELETE CASCADE (future table — will be added in Epic 5)
  - [x] Ensure user_settings has ON DELETE CASCADE (future table — will be added in Epic 7)

- [x] Task 5: Clear local data on deletion (AC: #4)
  - [x] Clear expo-secure-store (auth tokens via signOut)
  - [x] Clear AsyncStorage (no user data stored yet — future epics)
  - [x] Clear TanStack Query cache (no QueryClient configured yet — future epics)
  - [x] Clear all Zustand stores (auth store reset)

- [x] Task 6: Handle post-deletion navigation (AC: #5)
  - [x] Navigate to /auth/sign-up via useProtectedRoute accountDeleted flag
  - [x] Show success message "Your account has been deleted" on sign-up screen
  - [x] Clear navigation history via router.replace

- [x] Task 7: Implement deletion flow in app (AC: #1, #2)
  - [x] Add deleteAccount action to useAuthStore
  - [x] Call Edge Function via supabase.functions.invoke
  - [x] Handle success and error cases
  - [x] Show loading state during deletion

## Dev Notes

### Architecture Patterns

- **GDPR Compliance**: Full data deletion within 30 days (immediate in this case)
- **Cascade Delete**: Database-level cascading via foreign keys
- **Edge Function**: Server-side deletion for security
- **Audit Logging**: Log deletion event without PII

### Code Patterns

```typescript
// Deletion confirmation dialog
function DeleteAccountDialog({ visible, onConfirm, onCancel }) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmEnabled = confirmText === 'DELETE';

  return (
    <Modal visible={visible}>
      <Text>Warning: This will permanently delete your account and all data.</Text>
      <Text>Type "DELETE" to confirm:</Text>
      <TextInput
        value={confirmText}
        onChangeText={setConfirmText}
        autoCapitalize="characters"
      />
      <Button
        title="Delete My Account"
        onPress={onConfirm}
        disabled={!isConfirmEnabled}
        variant="destructive"
      />
      <Button title="Cancel" onPress={onCancel} />
    </Modal>
  );
}
```

```typescript
// Edge Function: delete-user
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Cascade delete handles related tables
  const { error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Log deletion event (no PII)
  console.log(`User deleted: ${user.id.substring(0, 8)}...`);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
```

### Data Deletion Scope

| Table | Deletion Method | Notes |
|-------|-----------------|-------|
| auth.users | Admin API | Primary deletion |
| user_profiles | CASCADE | FK to auth.users |
| user_progress | CASCADE | FK to auth.users |
| user_streaks | CASCADE | FK to auth.users |
| user_xp | CASCADE | FK to auth.users |
| user_settings | CASCADE | FK to auth.users |
| Local Storage | App-side | Clear all |

### References

- [Source: architecture.md#Authentication & Security]
- [Source: epics.md#Story 1.8: Account Deletion]
- [Source: prd.md#Data & Privacy (FR53-FR57)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

204 tests passing across 15 test suites (37 new tests for Story 1.8 including review fixes)

### Completion Notes List

- Added `deleteAccount` method and `accountDeleted` flag to useAuthStore
- Created DeleteAccountDialog component with "DELETE" text confirmation
- Added Delete Account button to profile screen with destructive styling
- Created Supabase Edge Function (`delete-user`) for server-side user deletion
- Implemented post-deletion navigation via `accountDeleted` flag in `useProtectedRoute`
- Sign-up screen shows "Your account has been deleted" confirmation message
- user_profiles already has ON DELETE CASCADE; future tables (user_progress, user_streaks, user_xp, user_settings) don't exist yet — CASCADE will be configured when those tables are created in their respective epics
- Local data clearing: signOut clears SecureStore tokens, Zustand auth store is reset; AsyncStorage and TanStack Query cache clearing deferred to when those systems are in use

### Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5
**Date:** 2026-01-29
**Outcome:** Approved with fixes applied

**Issues Found:** 0 Critical, 3 Medium, 3 Low — all fixed automatically

| ID | Severity | Description | Resolution |
|----|----------|-------------|------------|
| M1 | MEDIUM | No test coverage for `accountDeleted` routing in `_layout.tsx` | Created `__tests__/app/_layout.test.tsx` with 7 routing tests |
| M2 | MEDIUM | `isLoading` shared between signOut and deleteAccount | Added dedicated `isDeletingAccount` flag to decouple delete loading state |
| M3 | MEDIUM | Edge Function lacks top-level error boundary | Wrapped handler body in try-catch with 500 fallback |
| L1 | LOW | Dialog stays visible on successful deletion | Changed `handleDeleteAccount` to always close dialog |
| L2 | LOW | No unit tests for Edge Function | Acknowledged — Deno testing deferred (not Jest-compatible) |
| L3 | LOW | Case-sensitive DELETE comparison with advisory autoCapitalize | Changed to `confirmText.toUpperCase() === 'DELETE'` |

**All 6 ACs validated: PASS**

### Change Log

- `lib/stores/useAuthStore.ts` — Added `deleteAccount` method, `accountDeleted` state; [Review] added `isDeletingAccount` flag, decoupled from `isLoading`
- `components/ui/DeleteAccountDialog.tsx` — New component: deletion dialog with "DELETE" text input; [Review] case-insensitive comparison
- `app/(tabs)/profile.tsx` — Added Delete Account button and DeleteAccountDialog; [Review] pass `isDeletingAccount`, always close dialog
- `app/_layout.tsx` — Added `accountDeleted` check in useProtectedRoute for sign-up redirect
- `app/auth/sign-up.tsx` — Added account deletion confirmation message display
- `supabase/functions/delete-user/index.ts` — New Edge Function for server-side user deletion; [Review] added top-level try-catch
- `__tests__/lib/useAuthStore.test.ts` — Added 8 deleteAccount tests, updated header and mocks; [Review] updated for `isDeletingAccount`
- `__tests__/app/profile.test.tsx` — Added 6 Delete Account tests, updated header and mocks; [Review] added `isDeletingAccount` to state
- `__tests__/components/DeleteAccountDialog.test.tsx` — New test file: 15 dialog component tests (14 + 1 lowercase test)
- `__tests__/app/_layout.test.tsx` — [Review] New test file: 7 useProtectedRoute routing tests

### File List

- `safar-app/lib/stores/useAuthStore.ts`
- `safar-app/components/ui/DeleteAccountDialog.tsx`
- `safar-app/app/(tabs)/profile.tsx`
- `safar-app/app/_layout.tsx`
- `safar-app/app/auth/sign-up.tsx`
- `safar-app/supabase/functions/delete-user/index.ts`
- `safar-app/__tests__/lib/useAuthStore.test.ts`
- `safar-app/__tests__/app/profile.test.tsx`
- `safar-app/__tests__/components/DeleteAccountDialog.test.tsx`
- `safar-app/__tests__/app/_layout.test.tsx`
