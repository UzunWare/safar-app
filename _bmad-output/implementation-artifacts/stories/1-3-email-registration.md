# Story 1.3: Email Registration

Status: done

## Story

As a new user,
I want to create an account using my email and password,
so that I can access the app and have my progress saved.

## Acceptance Criteria

1. **Given** I am on the sign-up screen, **When** I enter a valid email address and password (minimum 8 characters), **Then** my account is created in Supabase Auth
2. **Given** registration is successful, **When** account is created, **Then** I am automatically signed in
3. **Given** I am signed in, **When** checking token storage, **Then** my auth token is stored securely using expo-secure-store
4. **Given** registration is successful, **When** navigation occurs, **Then** I am navigated to the onboarding flow
5. **Given** I enter an email that is already registered, **When** I attempt to sign up, **Then** I see an error message "An account with this email already exists" and I am offered a link to sign in instead
6. **Given** I enter a password shorter than 8 characters, **When** I attempt to sign up, **Then** I see a validation error "Password must be at least 8 characters" and the form is not submitted
7. **Given** I enter an invalid email format, **When** I attempt to sign up, **Then** I see a validation error "Please enter a valid email address"

## Tasks / Subtasks

- [x] Task 1: Create auth screens structure (AC: #1)
  - [x] Create `app/auth/_layout.tsx` for auth flow layout
  - [x] Create `app/auth/sign-up.tsx` screen
  - [x] Create `app/auth/sign-in.tsx` screen (placeholder for Story 1.5)

- [x] Task 2: Create Zod validation schemas (AC: #6, #7)
  - [x] Create `lib/validation/auth.schema.ts`
  - [x] Define signUpSchema with email and password validation
  - [x] Email: valid format required
  - [x] Password: minimum 8 characters required

- [x] Task 3: Create useAuthStore with Zustand (AC: #2, #3)
  - [x] Create `lib/stores/useAuthStore.ts`
  - [x] Define state: user, session, isLoading, error
  - [x] Define actions: signUp, signIn, signOut, setSession
  - [x] Integrate with expo-secure-store for token storage

- [x] Task 4: Create AuthProvider context (AC: #2, #3)
  - [x] Create `lib/hooks/useAuth.ts` hook
  - [x] Handle session initialization on app launch
  - [x] Subscribe to Supabase auth state changes
  - [x] Store/retrieve tokens from secure storage

- [x] Task 5: Implement sign-up form UI (AC: #1, #5, #6, #7)
  - [x] Create form with react-hook-form + zod resolver
  - [x] Add email input with validation
  - [x] Add password input with validation
  - [x] Add "Sign Up" button
  - [x] Add "Already have an account? Sign in" link

- [x] Task 6: Implement sign-up logic (AC: #1, #2, #5)
  - [x] Call Supabase signUp with email/password
  - [x] Handle success: set session, navigate to onboarding
  - [x] Handle duplicate email error with user-friendly message
  - [x] Handle other errors gracefully

- [x] Task 7: Configure navigation flow (AC: #4)
  - [x] Update root _layout.tsx to check auth state
  - [x] Redirect unauthenticated users to auth flow
  - [x] Navigate to onboarding after successful signup
  - [x] Create protected route wrapper component

## Dev Notes

### Architecture Patterns

- **Form State**: React Hook Form + Zod for type-safe validation
- **Auth State**: Zustand store (useAuthStore) for session management
- **Token Storage**: expo-secure-store for Keychain/Keystore access
- **Error Handling**: Inline validation for form errors, toast for API errors

### Code Patterns

```typescript
// lib/validation/auth.schema.ts
import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
```

```typescript
// lib/stores/useAuthStore.ts
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  // ... actions
}));
```

### Navigation Structure

```
app/
├── _layout.tsx         # Root: checks auth, routes appropriately
├── auth/
│   ├── _layout.tsx     # Auth flow layout
│   ├── sign-up.tsx     # This story
│   └── sign-in.tsx     # Story 1.5
├── onboarding/
│   └── ...             # Epic 2
└── (tabs)/
    └── ...             # Protected main app
```

### References

- [Source: architecture.md#Authentication & Security]
- [Source: architecture.md#Auth Flow Architecture]
- [Source: architecture.md#Frontend Architecture]
- [Source: epics.md#Story 1.3: Email Registration]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 64 tests passing across 7 test suites (sign-up: 7, auth-schema: 10, useAuthStore: 18, useAuth: 7, supabase: 5, migration-schema: 13, supabase-types: 4)

### Completion Notes List

- All 7 ACs implemented and covered by tests
- SecureStoreAdapter created for Supabase auth storage using expo-secure-store (Keychain/Keystore)
- Zustand store pattern used for auth state management (not Context)
- React Hook Form + Zod integration for type-safe form validation
- Expo Router useSegments + useRouter pattern for auth-guarded navigation
- Duplicate email errors mapped to user-friendly message with "Sign in instead" link
- Sign-in screen created as placeholder for Story 1.5
- Onboarding placeholder created for Epic 2 redirect target
- Installed `@testing-library/react-native` as dev dependency for hook testing

### Change Log

| Change | File(s) | Reason |
|--------|---------|--------|
| Created auth layout | `app/auth/_layout.tsx` | Stack navigator for auth screens |
| Created sign-up screen | `app/auth/sign-up.tsx` | Full form with validation, error handling |
| Created sign-in placeholder | `app/auth/sign-in.tsx` | Placeholder for Story 1.5 |
| Created Zod schemas | `lib/validation/auth.schema.ts` | signUpSchema + signInSchema with validation |
| Created auth store | `lib/stores/useAuthStore.ts` | Zustand store: signUp, signIn, signOut, setSession |
| Created SecureStore adapter | `lib/api/secure-storage.ts` | Supabase-compatible storage using expo-secure-store |
| Created auth hooks | `lib/hooks/useAuth.ts` | useAuthInit (session init + listener), useAuth (state access) |
| Updated root layout | `app/_layout.tsx` | Auth-aware with useProtectedRoute pattern |
| Created onboarding placeholder | `app/onboarding/index.tsx` | Redirect target after sign-up |
| Updated Supabase client | `lib/api/supabase.ts` | Switched from AsyncStorage to SecureStoreAdapter |
| Updated Supabase test | `__tests__/lib/supabase.test.ts` | Updated mock from AsyncStorage to expo-secure-store |
| Created auth schema tests | `__tests__/lib/auth-schema.test.ts` | 10 tests for signUp + signIn validation |
| Created auth store tests | `__tests__/lib/useAuthStore.test.ts` | 17 tests for all store actions |
| Created auth hook tests | `__tests__/lib/useAuth.test.ts` | 6 tests for useAuthInit + useAuth |
| **Review Fix #1** | `app/auth/sign-up.tsx`, `app/_layout.tsx` | Centralized navigation in useProtectedRoute to fix race condition |
| **Review Fix #2** | `__tests__/app/sign-up.test.tsx` | Added 7 component tests for sign-up screen |
| **Review Fix #3** | `lib/hooks/useAuth.ts` | Added .catch() to getSession to prevent stuck loading |
| **Review Fix #4** | `app/auth/sign-up.tsx` | Added KeyboardAvoidingView + ScrollView for iOS keyboard |
| **Review Fix #5** | `lib/stores/useAuthStore.ts` | Handle null session (email confirmation) case |

### File List

**New Files:**
- `safar-app/app/auth/_layout.tsx`
- `safar-app/app/auth/sign-up.tsx`
- `safar-app/app/auth/sign-in.tsx`
- `safar-app/app/onboarding/index.tsx`
- `safar-app/lib/validation/auth.schema.ts`
- `safar-app/lib/stores/useAuthStore.ts`
- `safar-app/lib/api/secure-storage.ts`
- `safar-app/lib/hooks/useAuth.ts`
- `safar-app/__tests__/lib/auth-schema.test.ts`
- `safar-app/__tests__/lib/useAuthStore.test.ts`
- `safar-app/__tests__/lib/useAuth.test.ts`
- `safar-app/__tests__/app/sign-up.test.tsx`

**Modified Files:**
- `safar-app/app/_layout.tsx` — Auth-aware routing; redirects to /onboarding (not /) after auth
- `safar-app/lib/api/supabase.ts` — Switched storage to SecureStoreAdapter
- `safar-app/lib/stores/useAuthStore.ts` — Email confirmation (null session) handling
- `safar-app/lib/hooks/useAuth.ts` — Error handling for getSession failures
- `safar-app/__tests__/lib/supabase.test.ts` — Updated mock to expo-secure-store
- `safar-app/package.json` — Added @testing-library/react-native devDependency
- `safar-app/package-lock.json` — Lockfile updated

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5 (adversarial code review) on 2026-01-29

### Review Findings (7 total: 1 HIGH, 4 MEDIUM, 2 LOW)

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | Dual navigation race condition: sign-up.tsx and useProtectedRoute both called router.replace after signup | Fixed: removed navigation from sign-up.tsx, centralized in useProtectedRoute redirecting to /onboarding |
| 2 | MEDIUM | No component-level test for sign-up.tsx | Fixed: created __tests__/app/sign-up.test.tsx with 7 tests |
| 3 | MEDIUM | useAuthInit getSession() had no .catch() — corrupt storage = permanent loading | Fixed: added .catch() that calls setSession(null) |
| 4 | MEDIUM | No KeyboardAvoidingView — keyboard overlaps form on iOS | Fixed: wrapped form in KeyboardAvoidingView + ScrollView |
| 5 | MEDIUM | signUp returned true when session was null (email confirmation case) | Fixed: returns false with "Please check your email" message |
| 6 | LOW | package-lock.json not in File List | Documented in File List |
| 7 | LOW | Missing onboarding/_layout.tsx per architecture | Acceptable for placeholder — deferred to Epic 2 |

All HIGH and MEDIUM issues fixed. 64 tests passing across 7 suites.
