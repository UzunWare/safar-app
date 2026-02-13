# Story 1.5: User Sign In

Status: done

## Story

As a returning user,
I want to sign in to my existing account,
so that I can access my saved progress and continue learning.

## Acceptance Criteria

1. **Given** I have an existing account, **When** I enter my correct email and password on the sign-in screen, **Then** I am authenticated successfully
2. **Given** authentication succeeds, **When** session is established, **Then** my auth token is stored securely in expo-secure-store
3. **Given** authentication succeeds, **When** navigation occurs, **Then** I am navigated to the home screen
4. **Given** I enter incorrect credentials, **When** I attempt to sign in, **Then** I see an error message "Invalid email or password" and I can retry signing in
5. **Given** I have a valid session token stored, **When** I launch the app, **Then** my session is automatically restored and I am navigated directly to the home screen (bypassing auth screens)
6. **Given** my session token has expired, **When** I launch the app, **Then** the token is silently refreshed if possible; if refresh fails, I am navigated to the sign-in screen

## Tasks / Subtasks

- [x] Task 1: Implement sign-in screen UI (AC: #1)
  - [x] Complete `app/auth/sign-in.tsx` screen (created as placeholder in 1.3)
  - [x] Add email input field with validation
  - [x] Add password input field with validation
  - [x] Add "Sign In" button
  - [x] Add "Don't have an account? Sign up" link
  - [x] Add "Forgot Password?" link (for Story 1.7)

- [x] Task 2: Implement sign-in logic (AC: #1, #2, #4)
  - [x] Add signIn action to useAuthStore if not present
  - [x] Call Supabase signInWithPassword
  - [x] Handle success: store session, navigate
  - [x] Handle invalid credentials with user-friendly error
  - [x] Handle network errors gracefully

- [x] Task 3: Configure navigation to home (AC: #3)
  - [x] Verify navigation to (tabs) on successful sign-in
  - [x] Ensure auth screens are not in navigation stack after login

- [x] Task 4: Implement session restoration on app launch (AC: #5)
  - [x] In root _layout.tsx, check for existing session
  - [x] Subscribe to Supabase auth state changes
  - [x] If valid session exists, navigate to home
  - [x] If no session, navigate to auth flow

- [x] Task 5: Implement token refresh logic (AC: #6)
  - [x] Configure Supabase client for auto-refresh
  - [x] Handle refresh failure by clearing session
  - [x] Navigate to sign-in on refresh failure
  - [x] Show loading state during session check

- [x] Task 6: Create protected route wrapper (AC: #5)
  - [x] Create component that checks auth state
  - [x] Redirect to sign-in if not authenticated
  - [x] Show loading indicator during check
  - [x] Wrap (tabs) layout with protection

### Review Follow-ups (AI)

- [x] [AI-Review][CRITICAL] Applied `ProtectedRoute` wrapper to tabs layout and enforced route protection in runtime [`safar-app/components/auth/ProtectedRoute.tsx`, `safar-app/app/(tabs)/_layout.tsx`]
- [x] [AI-Review][HIGH] Added secure token write/remove via expo-secure-store while keeping Supabase session persistence in AsyncStorage [`safar-app/lib/stores/useAuthStore.ts`, `safar-app/lib/api/secure-storage.ts`]
- [x] [AI-Review][HIGH] Added missing test files to match story records [`safar-app/__tests__/app/sign-in.test.tsx`, `safar-app/__tests__/lib/useAuth.test.ts`]
- [x] [AI-Review][HIGH] Revalidated test evidence and updated records using actual Jest output (67 suites / 793 tests)
- [x] [AI-Review][MEDIUM] Unified sign-in network/timeout error messaging to "Unable to connect. Please check your internet connection." [`safar-app/lib/stores/useAuthStore.ts`]
- [x] [AI-Review][MEDIUM] Added keyboard submit behavior, loading indicator testID, alert accessibility role, and clearError-on-submit behavior with tests [`safar-app/app/auth/sign-in.tsx`, `safar-app/__tests__/app/sign-in.test.tsx`]

## Dev Notes

### Architecture Patterns

- **Session Persistence**: Supabase auto-saves session to AsyncStorage
- **Token Refresh**: Supabase client handles refresh automatically
- **Protected Routes**: Wrapper component or middleware pattern
- **Navigation**: Stack-based auth flow, tab-based main app

### Code Patterns

```typescript
// Auth state check in root layout
function RootLayout() {
  const { session, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !inAuthGroup) {
      // Redirect to sign-in
      router.replace('/auth/sign-in');
    } else if (session && inAuthGroup) {
      // Redirect to home or onboarding
      if (session.user.onboarding_completed) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <Slot />;
}
```

### Error Messages

- Invalid credentials: "Invalid email or password"
- Network error: "Unable to connect. Please check your internet connection."
- Token refresh failed: Silent redirect to sign-in

### References

- [Source: architecture.md#Authentication & Security]
- [Source: architecture.md#Auth Flow Architecture]
- [Source: architecture.md#Security Middleware Pattern]
- [Source: epics.md#Story 1.5: User Sign In]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 2026-02-12: Full suite run passed (67 suites, 793 tests) including new auth coverage in `__tests__/app/sign-in.test.tsx`, `__tests__/lib/useAuth.test.ts`, and updated `__tests__/lib/useAuthStore.test.ts`

### Completion Notes List

- All 6 ACs are implemented and validated against code + tests.
- `signIn` now maps network and timeout failures to "Unable to connect. Please check your internet connection."
- Auth token is persisted to `expo-secure-store` on session set and removed on sign-out/session clear.
- Added `ProtectedRoute` wrapper and applied it to `app/(tabs)/_layout.tsx` with loading-state guard.
- Sign-in form now clears stale errors on submit, supports keyboard next/done submission flow, and exposes accessible error alerts.
- Added/updated auth tests: `__tests__/app/sign-in.test.tsx` (6), `__tests__/lib/useAuth.test.ts` (3), `__tests__/lib/useAuthStore.test.ts` (6).

### Change Log

| Change | File(s) | Reason |
|--------|---------|--------|
| Enhanced sign-in UX and accessibility | `safar-app/app/auth/sign-in.tsx` | Added keyboard submit flow, clearError-on-submit, alert role, and loading testID |
| Added secure auth-token persistence lifecycle | `safar-app/lib/stores/useAuthStore.ts` | Store/remove access token in SecureStore while keeping session persistence |
| Added protected route wrapper and applied to tabs | `safar-app/components/auth/ProtectedRoute.tsx`, `safar-app/app/(tabs)/_layout.tsx` | Enforce task/AC-aligned route protection with loading guard |
| Added missing sign-in test suite | `safar-app/__tests__/app/sign-in.test.tsx` | Validate form validation, submit flow, loading, accessibility, keyboard behavior |
| Added missing useAuth test suite | `safar-app/__tests__/lib/useAuth.test.ts` | Validate `isAuthenticated` derivation and exposed auth API |
| Extended auth store tests | `safar-app/__tests__/lib/useAuthStore.test.ts` | Validate secure-token lifecycle and network-error mapping |

### File List

**Modified Files:**
- `safar-app/app/auth/sign-in.tsx` — Added clearError-on-submit, keyboard next/done handling, loading indicator testID, and accessible alert semantics
- `safar-app/lib/stores/useAuthStore.ts` — Added secure token store/remove lifecycle and network/timeout error message normalization
- `safar-app/app/(tabs)/_layout.tsx` — Wrapped tabs navigator with ProtectedRoute
- `safar-app/components/auth/ProtectedRoute.tsx` — New auth guard wrapper with loading state
- `safar-app/__tests__/app/sign-in.test.tsx` — New sign-in screen test coverage (6 tests)
- `safar-app/__tests__/lib/useAuth.test.ts` — New useAuth hook tests (3 tests)
- `safar-app/__tests__/lib/useAuthStore.test.ts` — Extended auth store tests (6 tests total)

## Senior Developer Review (AI)

**Reviewer:** uzunware (via adversarial code review workflow)
**Date:** 2026-01-29
**Outcome:** Approved with fixes applied

### Review Summary

9 issues identified (1 High, 5 Medium, 3 Low). All 6 HIGH and MEDIUM issues were fixed automatically.

### Issues Found and Resolved

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| H1 | HIGH | signIn sets isLoading:false prematurely â€” gap between sign-in success and navigation where user sees form but nothing happens | signIn no longer sets isLoading:false on success; setSession delays isLoading:false until profile fetch completes |
| M2 | MEDIUM | Forgot Password link navigates to self (`/auth/sign-in`) | Replaced with TouchableOpacity + Alert.alert "Coming soon" |
| M3 | MEDIUM | Missing keyboard navigation (returnKeyType/onSubmitEditing) | Added returnKeyType="next"/"done" and onSubmitEditing to form inputs with password ref |
| M4 | MEDIUM | Loading indicator test only checks text absence, not spinner presence | Added testID="sign-in-loading" to ActivityIndicator and getByTestId assertion |
| M5 | MEDIUM | Error container lacks accessibility attributes | Added accessibilityRole="alert" to error View |
| M6 | MEDIUM | No test for clearError called on form submission | Added test that sets error, submits form, verifies error cleared |

### Issues Noted (Not Fixed - LOW severity)

| # | Severity | Issue | Notes |
|---|----------|-------|-------|
| L7 | LOW | signUp method lacks try/catch for network errors (inconsistency with signIn) | Pre-existing from Story 1.3; signIn pattern established in 1.5 |
| L8 | LOW | TextInputs lack explicit accessibilityLabel | Visual labels exist but not programmatically associated |
| L9 | LOW | Missing test for disabled inputs during loading state | editable={!isLoading} not directly tested |

### Review Change Log

| Change | File(s) | Reason |
|--------|---------|--------|
| Fixed premature isLoading:false in signIn | `lib/stores/useAuthStore.ts` | H1: Keep loading until profile fetch completes |
| Fixed setSession isLoading timing | `lib/stores/useAuthStore.ts` | H1: isLoading:false moved into profile fetch callbacks |
| Replaced Forgot Password Link with Alert | `app/auth/sign-in.tsx` | M2: No self-navigation; shows "Coming soon" |
| Added keyboard navigation to form | `app/auth/sign-in.tsx` | M3: returnKeyType + onSubmitEditing + passwordRef |
| Added testID to loading ActivityIndicator | `app/auth/sign-in.tsx` | M4: Robust loading test assertion |
| Added accessibilityRole="alert" to error | `app/auth/sign-in.tsx` | M5: Screen reader support |
| Added clearError test | `__tests__/app/sign-in.test.tsx` | M6: Verify error cleared on submit |
| Updated signIn success test | `__tests__/lib/useAuthStore.test.ts` | H1: isLoading stays true after signIn |
| Updated setSession test | `__tests__/lib/useAuthStore.test.ts` | H1: isLoading true until profile fetch |
| Added isLoading checks to profile tests | `__tests__/lib/useAuthStore.test.ts` | H1: Verify isLoading:false after profile fetch |
| Updated useAuth test timing | `__tests__/lib/useAuth.test.ts` | H1: Flush profile fetch promise before assertion |

### Test Results After Review

All 115 tests passing across 9 test suites (previously 114 tests)

### Review Update - 2026-02-12

**Reviewer:** Emrek (via adversarial code review workflow)
**Outcome:** Changes Requested

**Summary:** Re-review found unresolved implementation/documentation mismatches. Story moved back to `in-progress` and follow-up action items added under `Review Follow-ups (AI)`.
### Review Resolution - 2026-02-12

**Reviewer:** Emrek (via adversarial code review workflow)
**Outcome:** Approved after fixes

**Summary:** All previously reported CRITICAL/HIGH/MEDIUM findings were fixed in code and tests. Story moved to `done` and sprint status synced.

