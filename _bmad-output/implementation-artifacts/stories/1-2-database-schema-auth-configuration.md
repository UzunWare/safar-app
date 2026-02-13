# Story 1.2: Database Schema & Auth Configuration

Status: done

## Story

As a developer,
I want the Supabase database schema and auth providers configured,
so that user authentication and data storage are ready for the application.

## Acceptance Criteria

1. **Given** a Supabase project is created, **When** the database migrations are applied, **Then** the users table extends Supabase auth.users with profile fields (display_name, avatar_url, created_at, updated_at)
2. **Given** the schema is created, **When** checking security, **Then** Row Level Security (RLS) is enabled on all user tables
3. **Given** RLS is enabled, **When** testing policies, **Then** policies allow users to only read/write/delete their own data
4. ~~**Given** Supabase Auth settings are accessed, **When** configuring providers, **Then** Apple OAuth provider is configured~~ **[DEFERRED → Story 1-4]**
5. ~~**Given** Supabase Auth settings are accessed, **When** configuring providers, **Then** Google OAuth provider is configured~~ **[DEFERRED → Story 1-4]**
6. ~~**Given** Supabase Auth settings are accessed, **When** configuring providers, **Then** Email provider is enabled with email confirmation disabled (for MVP speed)~~ **[DEFERRED → Story 1-3]**
7. **Given** the project is configured, **When** checking client setup, **Then** the Supabase client singleton is created in lib/api/supabase.ts

## Tasks / Subtasks

- [x] Task 1: Create Supabase project (AC: #1) **[MANUAL - completed by user]**
  - [x] Create new Supabase project at supabase.com
  - [x] Note project URL and anon key
  - [x] Update .env.local with actual Supabase credentials

- [x] Task 2: Create user_profiles migration (AC: #1)
  - [x] Create `supabase/migrations/` directory
  - [x] Create migration file for user_profiles table
  - [x] Include fields: id (FK to auth.users), display_name, avatar_url, onboarding_completed, onboarding_completed_at, script_reading_ability, created_at, updated_at
  - [x] Apply migration via Supabase dashboard or CLI **[MANUAL - applied by user]**

- [x] Task 3: Enable RLS and create policies (AC: #2, #3)
  - [x] Enable RLS on user_profiles table (in migration SQL)
  - [x] Create SELECT policy: users can read own profile
  - [x] Create UPDATE policy: users can update own profile
  - [x] Create INSERT policy: users can create own profile (on signup)
  - [x] Policies applied via migration SQL **[MANUAL - applied by user]**

- [ ] Task 4: Configure Apple OAuth (AC: #4) **[DEFERRED - requires Apple Developer account]**
  - [ ] Navigate to Supabase Auth settings
  - [ ] Enable Apple provider
  - [ ] Document required App Store Connect configuration
  - [ ] Note: Full Apple Sign-In requires Apple Developer account setup

- [ ] Task 5: Configure Google OAuth (AC: #5) **[DEFERRED - requires Google Cloud setup]**
  - [ ] Navigate to Supabase Auth settings
  - [ ] Enable Google provider
  - [ ] Create Google Cloud OAuth credentials
  - [ ] Add client ID and secret to Supabase

- [ ] Task 6: Configure Email provider (AC: #6) **[DEFERRED - user will configure later]**
  - [ ] Verify Email provider is enabled
  - [ ] Disable email confirmation for MVP
  - [ ] Set minimum password length to 8 characters

- [x] Task 7: Create Supabase client singleton (AC: #7)
  - [x] Create `lib/api/supabase.ts` (already exists from story 1-1, updated with Database type)
  - [x] Initialize Supabase client with environment variables (via APP_CONFIG)
  - [x] Export typed client for use throughout app (Database generic)
  - [x] Add AsyncStorage for session persistence

## Dev Notes

### Architecture Patterns

- **Database Naming**: Tables use snake_case, plural (user_profiles)
- **Columns**: snake_case (display_name, created_at)
- **Foreign Keys**: {table}_id pattern (user_id references auth.users.id)
- **Timestamps**: Always include created_at, updated_at

### Database Schema

```sql
-- user_profiles table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  script_reading_ability TEXT CHECK (script_reading_ability IN ('fluent', 'learning')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = id);
```

### Supabase Client Setup

```typescript
// lib/api/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '@/types/supabase.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### References

- [Source: architecture.md#Database Schema Overview]
- [Source: architecture.md#Authentication & Security]
- [Source: architecture.md#Row Level Security (RLS)]
- [Source: epics.md#Story 1.2: Database Schema & Auth Configuration]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 22 tests pass (3 test suites) — verified after code review fixes
- TypeScript compiles without errors (`npx tsc --noEmit`)

### Completion Notes List

1. ✅ Created SQL migration for user_profiles table with all required columns
2. ✅ Migration includes RLS enablement and all 4 policies (SELECT, UPDATE, INSERT, DELETE)
3. ✅ Added updated_at trigger for automatic timestamp management
4. ✅ Added handle_new_user trigger to auto-create profile on auth signup (captures display_name from OAuth metadata)
5. ✅ Created Database type definitions in types/supabase.types.ts (manual, to be replaced by generated types)
6. ✅ Updated lib/api/supabase.ts with Database generic type and env var error guard
7. ✅ Installed jest + jest-expo, configured test runner, added test script
8. ✅ Created 22 tests across 3 test suites (migration schema, types, client)
9. ✅ Task 1 completed: Supabase project created, credentials configured, migration applied by user
10. ✅ ACs #4, #5, #6 deferred to Stories 1-4 and 1-3 (OAuth providers and Email provider configuration)

### Manual Steps Required

**Task 1: Create Supabase Project**
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy **Project URL** and **anon key** from Settings → API
3. Update `safar-app/.env.local` with real values
4. Apply the migration SQL from `supabase/migrations/20260129000001_create_user_profiles.sql` via SQL Editor

**Task 4: Configure Apple OAuth**
1. Supabase Dashboard → Authentication → Providers → Apple
2. Enable Apple provider
3. Requires Apple Developer Account → Certificates, Identifiers & Profiles → Service IDs

**Task 5: Configure Google OAuth**
1. Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID
2. Copy Client ID and Secret
3. Supabase Dashboard → Authentication → Providers → Google → Add credentials

**Task 6: Configure Email Provider**
1. Supabase Dashboard → Authentication → Providers → Email
2. Ensure enabled, disable "Confirm email" toggle
3. Set minimum password length to 8 characters

### Change Log

- 2026-01-29: Created migration SQL, Database types, updated Supabase client with typing, installed Jest, created 18 tests
- 2026-01-29: Code review fixes — added DELETE RLS policy, handle_new_user captures OAuth metadata, client throws on missing env vars, improved test coverage (18→22 tests), deferred ACs #4-6 to Stories 1-3/1-4

### File List

**New Files Created:**
- safar-app/supabase/migrations/20260129000001_create_user_profiles.sql
- safar-app/types/supabase.types.ts
- safar-app/jest.config.js
- safar-app/__tests__/lib/supabase.test.ts
- safar-app/__tests__/lib/supabase-types.test.ts
- safar-app/__tests__/lib/migration-schema.test.ts

**Modified Files:**
- safar-app/lib/api/supabase.ts (added Database type import and generic; changed console.warn to throw on missing env vars)
- safar-app/package.json (added jest, jest-expo, @types/jest devDeps; added test script)

### Review Follow-ups (AI)

- [x] [AI-Review][HIGH] Missing DELETE RLS policy on user_profiles [migration SQL:35]
- [x] [AI-Review][MEDIUM] ACs #4, #5, #6 deferred but story in review — marked deferred in ACs, will be addressed in Stories 1-3/1-4
- [x] [AI-Review][MEDIUM] handle_new_user() ignores OAuth metadata — now captures display_name from raw_user_meta_data
- [x] [AI-Review][MEDIUM] Client test doesn't verify createClient arguments — added argument verification test
- [x] [AI-Review][MEDIUM] Console.warn noise in test suite — mocked APP_CONFIG with test values
- [x] [AI-Review][MEDIUM] Client created with empty strings on missing env — changed to throw Error

### Senior Developer Review (AI)

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| 1 | HIGH | Missing DELETE RLS policy | Added DELETE policy to migration SQL |
| 2 | MEDIUM | 3 of 7 ACs deferred/unmet | Marked ACs #4-6 as deferred to Stories 1-3/1-4 |
| 3 | MEDIUM | handle_new_user() ignores OAuth metadata | Updated trigger to capture display_name from raw_user_meta_data |
| 4 | MEDIUM | Client test doesn't verify createClient args | Added new test verifying URL and anon key |
| 5 | MEDIUM | Console.warn noise in test suite | Mocked APP_CONFIG with test values |
| 6 | MEDIUM | Client created with empty strings | Changed console.warn to throw Error |
| 7 | LOW | No explicit transaction in migration | Accepted — Supabase handles implicitly |
| 8 | LOW | Migration tests are string assertions only | Accepted — best available without live DB |

_Reviewer: uzunware on 2026-01-29_
