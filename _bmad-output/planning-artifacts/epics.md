---
stepsCompleted: [1, 2, 3, 4]
workflowStatus: complete
completedAt: '2026-02-05'
lastRefactored: '2026-02-05'
refactoringReason: 'Removed technical stories, distributed database table creation to just-in-time stories'
inputDocuments:
  - planning-artifacts/prd.md
  - planning-artifacts/architecture.md
  - planning-artifacts/ux-design-specification.md
refactoringChanges:
  - Removed Story 1.1 (Project Initialization) - moved to prerequisites
  - Removed Story 1.2 (Database Schema) - merged into Story 1.1 (Email Registration)
  - Removed Story 2.3 (Learning Content Schema) - distributed to Stories 2.2 and 3.2
  - Merged Story 6.1 (RevenueCat Setup) into Story 6.1 (Free Trial)
  - Renumbered all subsequent stories in affected epics
---

# safar-project - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for safar-project, decomposing the requirements from the PRD, UX Design, and Architecture documents into implementable stories.

## Requirements Inventory

### Functional Requirements

**User Management (FR1-FR8):**
- FR1: Users can create an account using email and password
- FR2: Users can create an account using Apple Sign-In
- FR3: Users can create an account using Google Sign-In
- FR4: Users can sign in to an existing account
- FR5: Users can sign out of their account
- FR6: Users can reset their password via email
- FR7: Users can delete their account and associated data
- FR8: System persists user identity across app sessions

**Onboarding (FR9-FR12):**
- FR9: New users can answer a script assessment question to indicate Arabic reading ability
- FR10: Users can view the available learning pathway (Salah First)
- FR11: Users can begin the learning pathway from the first lesson
- FR12: System tracks onboarding completion status

**Learning Content (FR13-FR19):**
- FR13: Users can view lessons organized into units within a pathway
- FR14: Users can access vocabulary words within each lesson
- FR15: Each vocabulary word displays Arabic text, transliteration, and English meaning
- FR16: Each vocabulary word displays its 3-letter Arabic root
- FR17: Users can tap a root to preview other words sharing that root
- FR18: Users can hear audio pronunciation of each vocabulary word
- FR19: System tracks which lessons and units have been completed

**Learning Experience (FR20-FR26):**
- FR20: Users can view word cards in a lesson learning mode
- FR21: Users can flip word cards to reveal meaning
- FR22: Users can progress through all words in a lesson
- FR23: Users can complete a multiple-choice quiz after viewing lesson words
- FR24: Quiz questions present Arabic word with multiple English meaning choices
- FR25: System provides immediate feedback on quiz answer correctness
- FR26: Users can rate their recall difficulty after viewing a review card (4-button rating)

**Spaced Repetition & Progress (FR27-FR33):**
- FR27: System schedules word reviews using SM-2 spaced repetition algorithm
- FR28: Users can access their review queue of due words
- FR29: System adjusts review intervals based on user difficulty ratings
- FR30: System tracks words across learning states (new, learning, review, mastered)
- FR31: Users can view their total words learned count
- FR32: Users can view their pathway completion percentage
- FR33: Users can view their mastered words count (interval ≥7 days)

**Engagement & Motivation (FR34-FR40):**
- FR34: System tracks consecutive daily learning streak
- FR35: Users can view their current streak count
- FR36: Users can use one free streak freeze per week
- FR37: System awards XP points for completing lessons and reviews
- FR38: Users can view their total XP earned
- FR39: System sends push notifications for streak reminders (if permitted)
- FR40: System sends push notifications for due reviews (if permitted)

**Subscription & Monetization (FR41-FR47):**
- FR41: New users receive a 7-day free trial period
- FR42: Users can view subscription options (monthly and annual)
- FR43: Users can purchase a subscription via in-app purchase
- FR44: System enforces paywall after trial expiration
- FR45: Users can restore previous purchases
- FR46: Users can view their current subscription status
- FR47: Users can manage their subscription (cancel, change plan)

**Settings & Preferences (FR48-FR52):**
- FR48: Users can toggle push notification preferences
- FR49: Users can toggle sound effects
- FR50: Users can access the privacy policy
- FR51: Users can access terms of service
- FR52: Users can contact support

**Data & Privacy (FR53-FR57):**
- FR53: System syncs learning progress to cloud when online
- FR54: System queues progress updates locally when offline
- FR55: System syncs queued updates when connectivity restored
- FR56: Users can request export of their personal data
- FR57: Users can request deletion of their personal data

### NonFunctional Requirements

**Performance (NFR1-NFR7):**
- NFR1: Cold app launch under 2 seconds
- NFR2: Lesson content load under 1 second
- NFR3: Audio playback start under 500ms
- NFR4: Screen transitions under 300ms
- NFR5: Quiz answer feedback under 100ms
- NFR6: API response time under 200ms (p95)
- NFR7: Memory footprint under 150MB

**Security (NFR8-NFR13):**
- NFR8: All API calls over HTTPS (TLS 1.2+)
- NFR9: Authentication tokens in secure storage (Keychain/Keystore)
- NFR10: Password requirements minimum 8 characters
- NFR11: Session management with token refresh and secure logout
- NFR12: No card data stored; RevenueCat PCI compliant
- NFR13: No PII in crash logs (email redacted)

**Reliability (NFR14-NFR17):**
- NFR14: Crash-free sessions above 99.5%
- NFR15: Data sync reliability - no progress loss
- NFR16: Offline tolerance with graceful degradation
- NFR17: Backend availability 99.9% uptime (Supabase SLA)

**Scalability (NFR18-NFR21):**
- NFR18: Support 10,000 DAU for MVP
- NFR19: Database growth to 100,000 users (12-month plan)
- NFR20: API rate limits 100 req/min/user
- NFR21: CDN asset delivery for global audio

**Accessibility (NFR22-NFR26):**
- NFR22: Color contrast WCAG 2.1 AA (4.5:1 for normal text)
- NFR23: Touch targets minimum 44x44pt
- NFR24: Support system font scaling 100-200%
- NFR25: Screen reader compatibility (VoiceOver/TalkBack)
- NFR26: Respect reduce motion system setting

**Integration (NFR27-NFR32):**
- NFR27: Supabase Auth with Email, Apple, Google providers
- NFR28: Supabase PostgreSQL with real-time subscriptions
- NFR29: RevenueCat for iOS/Android subscription handling
- NFR30: Mixpanel for event tracking, funnels, retention
- NFR31: Sentry for crash capture and session replay
- NFR32: Expo Notifications for FCM (Android) + APNs (iOS)

**Data Governance (NFR33-NFR36):**
- NFR33: Learning progress retained until account deletion
- NFR34: JSON data export within 30 days of request
- NFR35: Complete data deletion within 30 days of request
- NFR36: Analytics anonymization - user ID hashed, no email in events

### Additional Requirements

**From Architecture - Starter Template (CRITICAL for Epic 1 Story 1):**
- Initialize project using `create-expo-stack` with flags: --expo-router, --nativewind, --supabase, --typescript, --pnpm
- This provides pre-configured NativeWind v4, Supabase integration, Expo Router, and TypeScript

**From Architecture - Infrastructure Requirements:**
- EAS Build for CI/CD and production builds
- Expo Updates for OTA delivery of JS-only changes
- Environment configuration with .env files for development, preview, production
- GitHub Actions for PR validation (lint, type check, unit tests)

**From Architecture - State Management:**
- Zustand for client-only state (UI, preferences, session state)
- TanStack Query for server state (vocabulary, user progress from API)
- AsyncStorage + MMKV for local data persistence
- expo-secure-store for authentication tokens

**From Architecture - Database Schema:**
- Reference data tables: pathways, units, lessons, words, roots, word_roots (read-only, seeded)
- User data tables: user_progress, user_streaks, user_xp, user_settings
- Row Level Security (RLS) policies for user data isolation
- Sync metadata with is_synced flags and updated_at timestamps

**From Architecture - SM-2 Implementation:**
- Client-side SM-2 algorithm implementation
- 4-button rating mapping (0=Again, 1=Hard, 2=Good, 3=Easy)
- Local calculation with background sync on session complete
- Ease factor adjustment with minimum 1.3

**From Architecture - Offline Sync:**
- Local-first pattern with background sync queue
- Last-write-wins conflict resolution with timestamps
- Queue stored in AsyncStorage with retry logic (3 retries with exponential backoff)
- Sync triggers: app foreground, connectivity change

**From UX - Custom Component Requirements:**
- WordCard: High complexity (Arabic, transliteration, meaning, root indicator, audio)
- RootExplorer: High complexity (animated inline reveal of connected words)
- QuizCard: Medium complexity (multiple choice with feedback animation)
- ProgressRing: Medium complexity (SVG-based circular progress)
- StreakCounter: Low complexity (flame icon + count)
- DifficultyRating: Low complexity (4-button Anki-style)

**From UX - Animation Requirements:**
- Card transitions: <200ms using react-native-reanimated with ease-out
- Root reveal: spring animation with damping: 15
- Celebration animations: Lottie animation files
- Respect system "Reduce Motion" setting

**From UX - Arabic Typography:**
- Fonts: Amiri or KFGQPC Uthmanic Script
- Arabic word display: 32-48pt
- Root display: 24pt
- Line height: 1.8x for Arabic readability
- RTL layout for Arabic text containers

**From UX - Accessibility (WCAG 2.1 AA):**
- Color contrast 4.5:1 minimum for all text
- Touch targets 44x44pt minimum for all interactive elements
- Support system font size 100-200%
- VoiceOver/TalkBack labels for all elements
- Visible focus indicators for all interactive elements
- Dark mode support (system preference + manual toggle)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Account creation with email/password |
| FR2 | Epic 1 | Account creation with Apple Sign-In |
| FR3 | Epic 1 | Account creation with Google Sign-In |
| FR4 | Epic 1 | Sign in to existing account |
| FR5 | Epic 1 | Sign out of account |
| FR6 | Epic 1 | Password reset via email |
| FR7 | Epic 1 | Account and data deletion |
| FR8 | Epic 1 | User identity persistence across sessions |
| FR9 | Epic 2 | Script assessment question |
| FR10 | Epic 2 | View available learning pathway |
| FR11 | Epic 2 | Begin learning pathway from first lesson |
| FR12 | Epic 2 | Onboarding completion tracking |
| FR13 | Epic 3 | Lessons organized into units within pathway |
| FR14 | Epic 3 | Access vocabulary words within lessons |
| FR15 | Epic 3 | Word display: Arabic, transliteration, meaning |
| FR16 | Epic 3 | Word display: 3-letter Arabic root |
| FR17 | Epic 3 | Tap root to preview connected words |
| FR18 | Epic 3 | Audio pronunciation playback |
| FR19 | Epic 3 | Lesson and unit completion tracking |
| FR20 | Epic 3 | Word cards in lesson learning mode |
| FR21 | Epic 3 | Flip word cards to reveal meaning |
| FR22 | Epic 3 | Progress through all words in lesson |
| FR23 | Epic 4 | Multiple-choice quiz after lesson words |
| FR24 | Epic 4 | Quiz: Arabic word with English choices |
| FR25 | Epic 4 | Immediate feedback on quiz answers |
| FR26 | Epic 4 | 4-button difficulty rating for review cards |
| FR27 | Epic 4 | SM-2 spaced repetition scheduling |
| FR28 | Epic 4 | Access review queue of due words |
| FR29 | Epic 4 | Adjust intervals based on difficulty ratings |
| FR30 | Epic 4 | Track words across learning states |
| FR31 | Epic 5 | View total words learned count |
| FR32 | Epic 5 | View pathway completion percentage |
| FR33 | Epic 5 | View mastered words count (interval ≥7 days) |
| FR34 | Epic 5 | Track consecutive daily learning streak |
| FR35 | Epic 5 | View current streak count |
| FR36 | Epic 5 | Use one free streak freeze per week |
| FR37 | Epic 5 | Award XP for lessons and reviews |
| FR38 | Epic 5 | View total XP earned |
| FR39 | Epic 5 | Push notifications for streak reminders |
| FR40 | Epic 5 | Push notifications for due reviews |
| FR41 | Epic 6 | 7-day free trial period |
| FR42 | Epic 6 | View subscription options |
| FR43 | Epic 6 | Purchase subscription via in-app purchase |
| FR44 | Epic 6 | Paywall enforcement after trial |
| FR45 | Epic 6 | Restore previous purchases |
| FR46 | Epic 6 | View current subscription status |
| FR47 | Epic 6 | Manage subscription (cancel, change) |
| FR48 | Epic 7 | Toggle push notification preferences |
| FR49 | Epic 7 | Toggle sound effects |
| FR50 | Epic 7 | Access privacy policy |
| FR51 | Epic 7 | Access terms of service |
| FR52 | Epic 7 | Contact support |
| FR53 | Epic 7 | Sync learning progress to cloud |
| FR54 | Epic 7 | Queue progress updates locally when offline |
| FR55 | Epic 7 | Sync queued updates when connectivity restored |
| FR56 | Epic 7 | Request personal data export |
| FR57 | Epic 7 | Request personal data deletion |

## Epic List

### Epic 1: User Authentication
Users can create accounts, sign in securely, and have their identity persist across sessions. This epic implements complete authentication with Supabase Auth supporting Apple, Google, and email providers.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8

### Epic 2: Onboarding & Learning Pathway
Users can assess their Arabic reading ability and begin their personalized learning journey with the Salah First pathway. The script gate question routes users appropriately, and the pathway introduction shows the 6-week promise.

**FRs covered:** FR9, FR10, FR11, FR12

### Epic 3: Core Learning Experience
Users can learn Quranic vocabulary through interactive word cards featuring Arabic roots, audio pronunciation, and the "aha moment" of discovering connected words. This is the heart of Safar's pedagogical innovation.

**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22

### Epic 4: Knowledge Assessment & Spaced Repetition
Users can test their learning through quizzes and have the system intelligently schedule reviews using the SM-2 spaced repetition algorithm to maximize long-term retention.

**FRs covered:** FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR30

### Epic 5: Progress Tracking & Engagement
Users can track their learning progress, maintain streaks, earn XP, and receive reminders to stay motivated on their journey toward prayer comprehension.

**FRs covered:** FR31, FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR39, FR40

### Epic 6: Subscription & Monetization
Users can access premium content through a 7-day free trial and then subscribe monthly ($4.99/mo) or annually ($34.99/yr) via RevenueCat integration.

**FRs covered:** FR41, FR42, FR43, FR44, FR45, FR46, FR47

### Epic 7: Settings & Data Management
Users can customize their app experience, manage notifications, and exercise control over their personal data with GDPR-compliant export and deletion capabilities.

**FRs covered:** FR48, FR49, FR50, FR51, FR52, FR53, FR54, FR55, FR56, FR57

---

## Epic 1: Project Foundation & User Authentication

Users can create accounts, sign in securely, and have their identity persist across sessions. This epic implements complete authentication with Supabase Auth supporting Apple, Google, and email providers.

**Prerequisites (Before Epic 1 Stories):**

Before starting Epic 1 stories, the development environment must be initialized:
- Run: `npx create-expo-stack@latest safar-app --expo-router --nativewind --supabase --typescript --pnpm`
- Install additional deps: `pnpm add zustand @tanstack/react-query expo-secure-store react-native-reanimated`
- Configure .env.local with Supabase URL and anon key
- Verify app launches in Expo Go with NativeWind styling working
- Verify TypeScript strict mode compiles without errors

### Story 1.1: Email Registration & User Profile

As a new user,
I want to create an account using my email and password,
So that I can access the app and have my progress saved.

**Acceptance Criteria:**

**Given** I am on the sign-up screen
**When** I enter a valid email address and password (minimum 8 characters)
**Then** my account is created in Supabase Auth
**And** a user_profiles record is created with my user_id
**And** I am automatically signed in
**And** my auth token is stored securely using expo-secure-store
**And** I am navigated to the onboarding flow

**Given** I enter an email that is already registered
**When** I attempt to sign up
**Then** I see an error message "An account with this email already exists"
**And** I am offered a link to sign in instead

**Given** I enter a password shorter than 8 characters
**When** I attempt to sign up
**Then** I see a validation error "Password must be at least 8 characters"
**And** the form is not submitted

**Given** I enter an invalid email format
**When** I attempt to sign up
**Then** I see a validation error "Please enter a valid email address"

**Technical Notes:**
- Create user_profiles table migration (user_id, display_name, avatar_url, onboarding_completed, created_at, updated_at)
- Enable RLS on user_profiles table (users can only read/write their own profile)
- Configure Supabase Auth providers (Apple, Google, Email) in dashboard before starting
- Create Supabase client singleton in lib/api/supabase.ts
- Use Zod for form validation
- Create useAuthStore with Zustand for auth state
- Implement AuthProvider context wrapper

---

### Story 1.2: Social Authentication (Apple & Google)

As a new user,
I want to sign up using my Apple or Google account,
So that I can create an account quickly without remembering another password.

**Acceptance Criteria:**

**Given** I am on the sign-up or sign-in screen
**When** I tap "Continue with Apple"
**Then** the Apple Sign-In native flow is initiated
**And** upon successful authentication, my account is created/linked in Supabase
**And** my auth token is stored securely
**And** I am navigated to onboarding (new user) or home (returning user)

**Given** I am on the sign-up or sign-in screen
**When** I tap "Continue with Google"
**Then** the Google Sign-In flow is initiated
**And** upon successful authentication, my account is created/linked in Supabase
**And** my auth token is stored securely
**And** I am navigated appropriately based on user status

**Given** I cancel the social auth flow
**When** I dismiss the native auth prompt
**Then** I remain on the sign-up/sign-in screen
**And** no error is shown (graceful cancellation)

**Given** social auth fails due to network error
**When** the authentication attempt fails
**Then** I see an error message "Sign in failed. Please check your connection and try again."

**Technical Notes:**
- Use expo-apple-authentication for Apple Sign-In
- Use expo-auth-session for Google OAuth
- Handle both new users and returning users

---

### Story 1.3: User Sign In

As a returning user,
I want to sign in to my existing account,
So that I can access my saved progress and continue learning.

**Acceptance Criteria:**

**Given** I have an existing account
**When** I enter my correct email and password on the sign-in screen
**Then** I am authenticated successfully
**And** my auth token is stored securely in expo-secure-store
**And** I am navigated to the home screen

**Given** I enter incorrect credentials
**When** I attempt to sign in
**Then** I see an error message "Invalid email or password"
**And** I can retry signing in

**Given** I have a valid session token stored
**When** I launch the app
**Then** my session is automatically restored
**And** I am navigated directly to the home screen (bypassing auth screens)

**Given** my session token has expired
**When** I launch the app
**Then** the token is silently refreshed if possible
**And** if refresh fails, I am navigated to the sign-in screen

**Technical Notes:**
- Implement session persistence check on app launch
- Use Supabase's built-in token refresh mechanism
- Create protected route wrapper for authenticated screens

---

### Story 1.4: Sign Out

As a signed-in user,
I want to sign out of my account,
So that I can secure my account or switch to a different account.

**Acceptance Criteria:**

**Given** I am signed in
**When** I tap "Sign Out" in the profile/settings screen
**Then** I see a confirmation dialog "Are you sure you want to sign out?"

**Given** I confirm sign out
**When** the sign out process completes
**Then** my session is terminated in Supabase
**And** my auth tokens are removed from secure storage
**And** local cached data remains (for potential re-login)
**And** I am navigated to the sign-in screen

**Given** I cancel the sign out confirmation
**When** I tap "Cancel"
**Then** the dialog is dismissed
**And** I remain signed in

**Technical Notes:**
- Clear auth state in useAuthStore
- Keep vocabulary cache for faster re-login experience
- Clear user-specific sensitive data only

---

### Story 1.5: Password Reset

As a user who forgot my password,
I want to reset my password via email,
So that I can regain access to my account.

**Acceptance Criteria:**

**Given** I am on the sign-in screen
**When** I tap "Forgot Password?"
**Then** I am navigated to the password reset screen

**Given** I am on the password reset screen
**When** I enter my registered email and tap "Send Reset Link"
**Then** a password reset email is sent via Supabase
**And** I see a confirmation message "Check your email for a reset link"
**And** I am offered a button to return to sign-in

**Given** I enter an email that is not registered
**When** I tap "Send Reset Link"
**Then** I still see the same confirmation message (security: don't reveal if email exists)

**Given** I receive the reset email and tap the link
**When** the app opens via deep link
**Then** I am navigated to a "Set New Password" screen
**And** I can enter and confirm my new password
**And** upon success, I am signed in automatically

**Technical Notes:**
- Configure deep linking for password reset callback
- Use Supabase's resetPasswordForEmail method
- Implement the password update flow

---

### Story 1.6: Account Deletion

As a user,
I want to delete my account and all associated data,
So that I can exercise my right to data removal (GDPR compliance).

**Acceptance Criteria:**

**Given** I am signed in and on the settings screen
**When** I tap "Delete Account"
**Then** I see a warning dialog explaining that all data will be permanently deleted
**And** I am asked to type "DELETE" to confirm

**Given** I confirm deletion by typing "DELETE"
**When** the deletion process completes
**Then** my user record is deleted from Supabase Auth
**And** all my associated data (progress, streaks, settings) is cascade deleted
**And** my local cached data is cleared
**And** I am navigated to the sign-up screen
**And** I see a confirmation "Your account has been deleted"

**Given** I cancel the deletion
**When** I dismiss the dialog or tap "Cancel"
**Then** no data is deleted
**And** I remain on the settings screen

**Technical Notes:**
- Implement cascade delete via Supabase RLS policies or Edge Function
- Clear all local storage (AsyncStorage, SecureStore)
- Log deletion for audit purposes (without PII)

---

## Epic 2: Onboarding & Learning Pathway

Users can assess their Arabic reading ability and begin their personalized learning journey with the Salah First pathway. The script gate question routes users appropriately, and the pathway introduction shows the 6-week promise.

### Story 2.1: Onboarding Flow & Script Assessment

As a new user,
I want to answer a question about my Arabic reading ability,
So that the app can customize my learning experience appropriately.

**Acceptance Criteria:**

**Given** I have just completed registration/sign-in for the first time
**When** I am navigated to the onboarding flow
**Then** I see a welcome screen with the Safar value proposition
**And** I can proceed to the script assessment question

**Given** I am on the script assessment screen
**When** I see the question "Can you read Arabic script?"
**Then** I have two options: "Yes, I can read Arabic" and "I'm still learning"
**And** each option has a brief description of what it means

**Given** I select "Yes, I can read Arabic"
**When** I proceed
**Then** my preference is saved to my user profile
**And** I am navigated to the pathway introduction

**Given** I select "I'm still learning"
**When** I proceed
**Then** my preference is saved
**And** I see a message that transliteration support is coming (Phase 2)
**And** I can still proceed to the pathway with Arabic script

**Technical Notes:**
- Create user_preferences table or add to user_profiles
- Store script_reading_ability: 'fluent' | 'learning'
- Design for Phase 2 transliteration toggle

---

### Story 2.2: Pathway Introduction & Selection

As a new user,
I want to see the Salah First learning pathway,
So that I understand what I will learn and can begin my journey.

**Acceptance Criteria:**

**Given** I have completed the script assessment
**When** I arrive at the pathway introduction screen
**Then** I see the "Salah First" pathway prominently displayed
**And** I see the promise: "Understand your daily prayers in 6 weeks"
**And** I see the pathway contains ~120 words across 6 units
**And** I see a preview of what I'll learn (Al-Fatiha, common prayer phrases)

**Given** I am viewing the pathway introduction
**When** I tap "Start Learning" or "Begin Pathway"
**Then** I am navigated to the first lesson of Unit 1
**And** my onboarding is marked as complete

**Given** I am viewing the pathway
**When** I see the unit breakdown
**Then** I see 6 units listed with their titles and word counts
**And** all units except Unit 1 show as locked (visual only, no actual gating in MVP)

**Technical Notes:**
- Create pathways table migration (id, name, description, word_count, unit_count, order)
- Create units table migration (id, pathway_id, name, description, order, word_count)
- Create lessons table migration (id, unit_id, name, order, word_count)
- Seed with Salah First pathway (1 pathway, 6 units with names/descriptions)
- Seed Unit 1 lessons only (defer other units until later development)
- Foreign key relationships: units.pathway_id → pathways.id, lessons.unit_id → units.id
- Add indexes on pathway_id and unit_id for query performance

---

### Story 2.3: Onboarding Completion Tracking

As a returning user,
I want the app to remember I completed onboarding,
So that I go directly to the home screen on subsequent launches.

**Acceptance Criteria:**

**Given** I am a new user who has not completed onboarding
**When** I launch the app after signing in
**Then** I am navigated to the onboarding flow

**Given** I have completed onboarding (script gate + pathway start)
**When** my onboarding completion is saved
**Then** a flag is set in my user profile (onboarding_completed: true)
**And** the completion timestamp is recorded

**Given** I am a returning user who has completed onboarding
**When** I launch the app
**Then** I bypass onboarding entirely
**And** I am navigated directly to the home screen

**Given** I want to redo onboarding (edge case)
**When** this feature is needed
**Then** a setting exists to reset onboarding (low priority, can be hidden)

**Technical Notes:**
- Add onboarding_completed and onboarding_completed_at to user_profiles
- Check onboarding status in root layout navigation logic
- Cache onboarding status locally for faster launch

---

## Epic 3: Core Learning Experience

Users can learn Quranic vocabulary through interactive word cards featuring Arabic roots, audio pronunciation, and the "aha moment" of discovering connected words. This is the heart of Safar's pedagogical innovation.

### Story 3.1: Pathway & Unit Navigation

As a learner,
I want to navigate through the pathway structure,
So that I can see my progress and choose what to learn.

**Acceptance Criteria:**

**Given** I am on the Learn tab
**When** the screen loads
**Then** I see the current pathway (Salah First) with my progress
**And** I see all 6 units listed in order
**And** each unit shows: title, lesson count, and completion status
**And** completed units show a checkmark, in-progress shows progress bar

**Given** I tap on a unit
**When** the unit expands or navigates
**Then** I see all lessons within that unit
**And** each lesson shows: title, word count, completion status
**And** I can tap on any lesson to enter it

**Given** I want to continue where I left off
**When** I see a "Continue" button
**Then** tapping it takes me directly to my next incomplete lesson

**Technical Notes:**
- Create pathway view with TanStack Query for data fetching
- Cache pathway structure for offline access
- Track user's current position in useLearningStore

---

### Story 3.2: Word Card Display

As a learner,
I want to see vocabulary words displayed beautifully,
So that I can learn the Arabic word, its meaning, and its root.

**Acceptance Criteria:**

**Given** I am in a lesson
**When** a word card is displayed
**Then** I see the Arabic word prominently (32-48pt, Amiri/KFGQPC font)
**And** I see the transliteration below (18pt, gray)
**And** I see the English meaning (24pt, primary color)
**And** I see the root indicator showing the 3-letter root (e.g., "Root: ح-م-د")
**And** the root indicator is clearly tappable (44x44pt minimum)
**And** I see an audio play button

**Given** the word card is displayed
**When** I view the Arabic text
**Then** it renders correctly with proper diacritics (tashkeel)
**And** the text direction is RTL within its container
**And** the font scales appropriately with system font size settings

**Given** accessibility is enabled
**When** VoiceOver/TalkBack reads the card
**Then** it announces: "Arabic word [transliteration], meaning [meaning], from root [root letters]"

**Technical Notes:**
- Create words table migration (id, lesson_id, arabic, transliteration, meaning, audio_url, order)
- Create roots table migration (id, letters, meaning, transliteration)
- Create word_roots junction table (word_id, root_id) for many-to-many relationships
- Seed Unit 1 Lesson 1 words (5-10 words minimum) with corresponding roots
- Add indexes on lesson_id for query performance
- Arabic text must be properly encoded (UTF-8)
- Audio URLs can be placeholders initially
- Create WordCard component in components/learning/
- Load custom Arabic font (Amiri) via expo-font
- Implement proper RTL text handling
- Test with various Arabic diacritics

---

### Story 3.3: Root Explorer - The "Aha Moment"

As a learner,
I want to tap on a root to see other words from the same root,
So that I understand how Arabic words are connected (the core differentiator).

**Acceptance Criteria:**

**Given** I am viewing a word card with a root indicator
**When** I tap on the root (e.g., "Root: ح-م-د")
**Then** an inline panel expands with a spring animation (damping: 15)
**And** I see the root meaning displayed (e.g., "praise, commendation")
**And** I see 2-4 related words that share this root
**And** each related word shows: Arabic, transliteration, brief meaning

**Given** the root explorer is expanded
**When** I tap on a related word
**Then** nothing happens in MVP (future: navigate to that word's lesson)

**Given** the root explorer is expanded
**When** I tap the root indicator again or tap outside
**Then** the panel collapses with a smooth animation

**Given** "Reduce Motion" is enabled in system settings
**When** the root explorer expands/collapses
**Then** the animation is instant (no spring effect)

**Technical Notes:**
- Create RootExplorer component with react-native-reanimated
- Query word_roots junction table to find related words
- Limit to 2-4 related words for clean display
- Track root_tap analytics event (critical for measuring "aha moment")

---

### Story 3.4: Audio Pronunciation Playback

As a learner,
I want to hear the pronunciation of each word,
So that I can learn how to say it correctly.

**Acceptance Criteria:**

**Given** I am viewing a word card with an audio button
**When** I tap the audio button
**Then** the pronunciation audio plays within 500ms
**And** the button shows a playing state (visual feedback)
**And** the audio plays to completion

**Given** audio is already playing
**When** I tap the audio button again
**Then** the audio restarts from the beginning

**Given** the device is in silent mode
**When** I tap the audio button
**Then** audio still plays (educational content exception)

**Given** audio fails to load (network error, missing file)
**When** I tap the audio button
**Then** the button shows an error state briefly
**And** no crash occurs (graceful degradation)

**Given** sound effects are disabled in settings
**When** I tap the audio button
**Then** word pronunciation still plays (setting only affects UI sounds)

**Technical Notes:**
- Use expo-av for audio playback
- Preload audio for current + next few words
- Cache audio files locally after first play
- Audio URLs from words.audio_url column

---

### Story 3.5: Lesson Learning Mode

As a learner,
I want to progress through all words in a lesson,
So that I can complete my learning session.

**Acceptance Criteria:**

**Given** I enter a lesson
**When** the lesson starts
**Then** I see the first word card
**And** I see a progress indicator (e.g., "1 of 10")
**And** I see navigation controls (Next, or swipe)

**Given** I am viewing a word card
**When** I tap "Next" or swipe left
**Then** the current card animates out (<200ms, ease-out)
**And** the next card animates in
**And** the progress indicator updates

**Given** I am on the last word
**When** I tap "Next"
**Then** I am navigated to the lesson quiz (Epic 4)
**Or** if no quiz, I see lesson completion

**Given** I want to go back to a previous word
**When** I tap "Previous" or swipe right
**Then** I navigate to the previous word
**And** this is not possible on the first word

**Given** I exit the lesson mid-way
**When** I return to the lesson later
**Then** I can choose to resume or restart

**Technical Notes:**
- Create useLearningStore to track current lesson, card index
- Implement gesture handling for swipe navigation
- Save lesson progress locally
- Card transition animations with Reanimated

---

### Story 3.6: Lesson & Unit Completion Tracking

As a learner,
I want the system to track which lessons and units I've completed,
So that I can see my progress through the pathway.

**Acceptance Criteria:**

**Given** I complete all words in a lesson (view all cards)
**When** the lesson is marked complete
**Then** a record is created in user_lesson_progress table
**And** the lesson shows as "completed" in the unit view
**And** the completion is synced to the server

**Given** I complete all lessons in a unit
**When** the last lesson is marked complete
**Then** the unit is automatically marked as complete
**And** the unit shows a completion badge/checkmark

**Given** I view the pathway
**When** looking at my progress
**Then** I see accurate completion percentages for each unit
**And** I see overall pathway completion percentage

**Given** I am offline
**When** I complete a lesson
**Then** the completion is saved locally
**And** it syncs when connectivity is restored

**Technical Notes:**
- Create user_lesson_progress table (user_id, lesson_id, completed_at)
- Create user_unit_progress table or derive from lessons
- Implement progress calculation in useProgress hook
- Queue completions for offline sync

---

## Epic 4: Knowledge Assessment & Spaced Repetition

Users can test their learning through quizzes and have the system intelligently schedule reviews using the SM-2 spaced repetition algorithm to maximize long-term retention.

### Story 4.1: Multiple Choice Quiz

As a learner,
I want to take a quiz after learning words,
So that I can test my understanding and reinforce my memory.

**Acceptance Criteria:**

**Given** I complete viewing all words in a lesson
**When** the quiz begins
**Then** I see a quiz card with an Arabic word
**And** I see 4 English meaning options (1 correct, 3 distractors)
**And** the options are randomly ordered each time

**Given** I am viewing a quiz question
**When** I tap on an answer option
**Then** I receive immediate visual feedback (<100ms)
**And** correct answers show green highlight
**And** incorrect answers show red highlight with correct answer revealed

**Given** I answer correctly
**When** the feedback is shown
**Then** I see a brief success animation
**And** after 1 second, I automatically proceed to the next question

**Given** I answer incorrectly
**When** the feedback is shown
**Then** I see the correct answer highlighted
**And** I must tap "Continue" to proceed
**And** this word is flagged for additional review

**Technical Notes:**
- Create QuizCard component in components/learning/
- Generate distractors from other words in the pathway
- Track quiz results for analytics
- Immediate feedback with Reanimated animations

---

### Story 4.2: Quiz Completion & Results

As a learner,
I want to see my quiz results,
So that I understand how well I learned the words.

**Acceptance Criteria:**

**Given** I complete all quiz questions
**When** the quiz ends
**Then** I see a results screen showing:
  - Total score (e.g., "8/10 correct")
  - Percentage (e.g., "80%")
  - Brief feedback based on score
**And** I see a "Complete Lesson" button

**Given** my score is 80% or higher
**When** viewing results
**Then** I see encouraging feedback (e.g., "Excellent work!")
**And** I see a celebration animation (Lottie)

**Given** my score is below 80%
**When** viewing results
**Then** I see constructive feedback (e.g., "Good effort! These words will appear in your reviews.")
**And** no shame messaging

**Given** I tap "Complete Lesson"
**When** the action is processed
**Then** the lesson is marked complete
**And** words are added to my review queue based on quiz performance
**And** I am navigated back to the unit view

**Technical Notes:**
- Create QuizResults component
- Use Lottie for celebration animation
- Words answered incorrectly get shorter initial intervals
- Calculate and display lesson stats

---

### Story 4.3: Difficulty Rating (4-Button)

As a learner,
I want to rate how difficult each word was to recall,
So that the system can optimize my review schedule.

**Acceptance Criteria:**

**Given** I am in a review session viewing a word
**When** I am ready to rate my recall
**Then** I see 4 rating buttons: "Again", "Hard", "Good", "Easy"
**And** each button has a color indication (Again=red, Hard=orange, Good=green, Easy=blue)
**And** each button shows the next review interval (e.g., "1d", "3d", "7d", "14d")

**Given** I tap a difficulty rating
**When** the rating is processed
**Then** the SM-2 algorithm calculates the new interval
**And** the word's next review date is updated
**And** I proceed to the next review card

**Given** I rate a word as "Again"
**When** the algorithm processes this
**Then** the interval resets to 1 day
**And** the ease factor is decreased (but not below 1.3)

**Given** I rate a word as "Easy"
**When** the algorithm processes this
**Then** the interval increases significantly
**And** the ease factor is increased

**Technical Notes:**
- Create DifficultyRating component
- Implement SM-2 algorithm in lib/utils/sm2.ts
- Display calculated intervals on buttons
- Map: Again=0, Hard=1, Good=2, Easy=3 (converted to SM-2 scale)

---

### Story 4.4: SM-2 Spaced Repetition Algorithm

As a learner,
I want the system to schedule my reviews optimally,
So that I remember words long-term with minimal effort.

**Acceptance Criteria:**

**Given** a new word is learned
**When** it enters the review system
**Then** it has default values: ease_factor=2.5, interval=1, repetitions=0

**Given** a word is rated during review
**When** the SM-2 algorithm runs
**Then** the ease_factor is adjusted based on rating
**And** the interval is calculated:
  - First review: interval=1
  - Second review: interval=6
  - Subsequent: interval = previous_interval × ease_factor
**And** the next_review date is set to today + interval

**Given** a word is rated "Again" (quality < 3)
**When** the algorithm processes this
**Then** repetitions resets to 0
**And** interval resets to 1 day
**And** ease_factor decreases but stays ≥1.3

**Given** I am offline
**When** the algorithm runs
**Then** all calculations happen locally
**And** results are queued for sync

**Technical Notes:**
- Implement in lib/utils/sm2.ts exactly as specified in Architecture
- Store in user_word_progress table
- Client-side execution for immediate feedback
- Sync on session complete or connectivity change

---

### Story 4.5: Review Queue

As a learner,
I want to access my due reviews,
So that I can maintain my vocabulary knowledge.

**Acceptance Criteria:**

**Given** I have words due for review
**When** I navigate to the Review tab
**Then** I see the count of due reviews (e.g., "15 words ready")
**And** I see a "Start Review" button
**And** I see a preview of due words (optional)

**Given** I start a review session
**When** the session loads
**Then** I see review cards one at a time
**And** each card shows: Arabic word (front), then meaning (after tap/reveal)
**And** after revealing, I see the 4-button difficulty rating

**Given** I have no words due for review
**When** I navigate to the Review tab
**Then** I see "No reviews due" message
**And** I see when my next review is scheduled
**And** I am encouraged to continue learning new words

**Given** I complete all due reviews
**When** the session ends
**Then** I see a completion message
**And** I see stats (words reviewed, accuracy if applicable)

**Technical Notes:**
- Query user_word_progress WHERE next_review <= today
- Order reviews by next_review (oldest first)
- Create Review tab in app/(tabs)/review.tsx
- Track review session in useLearningStore

---

### Story 4.6: Word Learning States

As a learner,
I want to see which words are new, learning, or mastered,
So that I understand my progress with each word.

**Acceptance Criteria:**

**Given** I have learned words
**When** viewing my progress or word list
**Then** each word shows its learning state:
  - **New**: Never reviewed (repetitions = 0)
  - **Learning**: Reviewed 1-2 times (repetitions 1-2)
  - **Review**: Reviewed 3+ times, interval < 7 days
  - **Mastered**: Interval ≥ 7 days

**Given** I master a word (interval ≥ 7 days)
**When** viewing my stats
**Then** it counts toward my "words mastered" metric
**And** this is the North Star metric

**Given** a mastered word is rated "Again"
**When** the state is recalculated
**Then** it moves back to "Learning" state
**And** the mastered count decreases

**Technical Notes:**
- Derive state from user_word_progress fields
- Create useWordState hook for state calculation
- Display states with color coding or icons
- Mastered threshold: interval >= 7 days

---

## Epic 5: Progress Tracking & Engagement

Users can track their learning progress, maintain streaks, earn XP, and receive reminders to stay motivated on their journey toward prayer comprehension.

### Story 5.1: Progress Dashboard

As a learner,
I want to see my learning progress at a glance,
So that I feel motivated and informed about my journey.

**Acceptance Criteria:**

**Given** I am on the Home tab
**When** the dashboard loads
**Then** I see my total words learned count
**And** I see my mastered words count (interval ≥7 days)
**And** I see my pathway completion percentage with a ProgressRing visual
**And** I see my current streak count with flame icon

**Given** I tap on any progress metric
**When** the detail view opens (optional for MVP)
**Then** I see more detailed breakdown

**Given** my progress data is cached locally
**When** I open the app offline
**Then** I still see my progress (from cache)
**And** a subtle indicator shows "last synced" time

**Technical Notes:**
- Create ProgressRing component (SVG-based circular progress)
- Aggregate progress from user_word_progress and user_lesson_progress
- Cache progress stats in useProgressStore
- Display on Home tab prominently

---

### Story 5.2: Streak Tracking

As a learner,
I want my daily learning streak tracked,
So that I am motivated to learn every day.

**Acceptance Criteria:**

**Given** I complete at least one learning session (lesson or review)
**When** the day ends (midnight local time)
**Then** my streak increments by 1 if I had activity today
**Or** my streak resets to 0 if I had no activity

**Given** I am on a streak
**When** viewing the Home screen
**Then** I see my streak count with a flame icon
**And** I see "Day X" or "X day streak" text

**Given** my streak is at risk (no activity today, evening time)
**When** viewing the app
**Then** I see a subtle reminder (not guilt-tripping)

**Given** I break my streak
**When** I return to the app
**Then** I see "Welcome back!" message
**And** I see "Your knowledge is still here. X words ready for review."
**And** no shame messaging
**And** my new streak starts at 1 after completing a session

**Technical Notes:**
- Create user_streaks table (user_id, current_streak, longest_streak, last_activity_date, freeze_used_at)
- Calculate streak based on last_activity_date vs today
- Use device local timezone for day boundaries
- Create StreakCounter component

---

### Story 5.3: Streak Freeze

As a learner,
I want to use a streak freeze when I can't learn,
So that I don't lose my streak due to life circumstances.

**Acceptance Criteria:**

**Given** I have not used a streak freeze this week
**When** I view my streak and haven't learned today
**Then** I see an option to "Use Streak Freeze"
**And** the freeze icon shows as available

**Given** I tap "Use Streak Freeze"
**When** confirming the action
**Then** my streak is preserved for today
**And** the freeze is marked as used (freeze_used_at = today)
**And** I see confirmation "Streak preserved! Learn tomorrow to continue."

**Given** I have already used a freeze this week
**When** viewing the freeze option
**Then** it shows as unavailable
**And** I see "Next freeze available [date]"

**Given** a new week begins (Monday)
**When** the reset occurs
**Then** my freeze becomes available again

**Technical Notes:**
- Track freeze_used_at in user_streaks table
- One freeze per calendar week (Monday reset)
- Freeze can be used preemptively or reactively
- Don't auto-use freeze; require user action

---

### Story 5.4: XP Points System

As a learner,
I want to earn XP for my learning activities,
So that I have a sense of progression and achievement.

**Acceptance Criteria:**

**Given** I complete a lesson
**When** XP is awarded
**Then** I earn 10 XP per lesson completed
**And** I see a brief XP animation (+10 XP)

**Given** I complete a review session
**When** XP is awarded
**Then** I earn 1 XP per word reviewed
**And** bonus 5 XP if I review 10+ words in a session

**Given** I earn XP
**When** viewing my profile or Home
**Then** I see my total XP count
**And** XP is a cumulative lifetime number (no spending)

**Given** XP updates
**When** syncing occurs
**Then** XP is stored in user_xp table
**And** XP syncs correctly (sum of all activities)

**Technical Notes:**
- Create user_xp table (user_id, total_xp, updated_at)
- Award XP at completion points (not per card)
- Create XpDisplay component with animation
- MVP: flat XP only, no levels (Phase 2)

---

### Story 5.5: Push Notifications - Streak Reminders

As a learner,
I want to receive streak reminders,
So that I don't forget to maintain my daily learning habit.

**Acceptance Criteria:**

**Given** I have enabled push notifications
**When** my usual learning time approaches and I haven't learned today
**Then** I receive a notification: "Don't lose your X-day streak!"

**Given** it's 1 hour before midnight and I haven't learned
**When** my streak is at risk
**Then** I receive a notification: "Your streak ends in 1 hour!"

**Given** I tap the notification
**When** the app opens
**Then** I am deep-linked to the Continue/Review screen

**Given** I have disabled notifications
**When** notification time arrives
**Then** no notification is sent

**Technical Notes:**
- Use Expo Notifications with scheduling
- Schedule based on user's typical session time (learn from behavior)
- Respect notification preferences in settings
- Max 1 notification per day

---

### Story 5.6: Push Notifications - Review Reminders

As a learner,
I want to be notified when I have reviews due,
So that I review words at optimal times for retention.

**Acceptance Criteria:**

**Given** I have reviews due and notifications enabled
**When** morning arrives (configurable, default 9 AM)
**Then** I receive a notification: "X words ready for review"

**Given** I tap the review notification
**When** the app opens
**Then** I am deep-linked directly to the Review tab

**Given** I have no reviews due
**When** notification time arrives
**Then** no notification is sent

**Given** I complete my reviews earlier
**When** the scheduled notification time arrives
**Then** notification is canceled or shows different message

**Technical Notes:**
- Calculate due reviews for notification content
- Schedule daily morning notification
- Cancel/update if reviews completed
- Use badge count for due reviews (iOS)

---

## Epic 6: Subscription & Monetization

Users can access premium content through a 7-day free trial and then subscribe monthly ($4.99/mo) or annually ($34.99/yr) via RevenueCat integration.

### Story 6.1: Free Trial & RevenueCat Setup

As a new user,
I want a 7-day free trial,
So that I can experience the full app before committing to pay.

**Acceptance Criteria:**

**Given** I am a new user who has never subscribed
**When** I complete onboarding
**Then** my 7-day free trial begins automatically
**And** I have full access to all content during trial
**And** I see trial status: "Trial: X days remaining"

**Given** I am in my free trial
**When** viewing my subscription status
**Then** I see trial end date
**And** I see a CTA to "Subscribe now" to avoid interruption

**Given** my trial period ends
**When** I have not subscribed
**Then** I see the paywall
**And** learning content is restricted

**Given** the user has a previous purchase
**When** the app launches
**Then** entitlement status is checked automatically
**And** premium access is granted if entitled

**Technical Notes:**
- Install react-native-purchases package
- Configure RevenueCat in app/_layout.tsx with API key from environment variables
- Set up RevenueCat dashboard with subscription products ($4.99/mo, $34.99/yr)
- Configure 7-day free trial as introductory offer in App Store Connect and Google Play Console
- Create useSubscription hook for entitlement checks
- Trial logic handled by RevenueCat entitlement check (not custom code)
- Track trial_started_at in user profile for analytics
- Verify SDK syncs with App Store Connect and Google Play Console
- Ensure products are fetchable and prices display correctly based on locale

---

### Story 6.2: Subscription Options Display

As a user,
I want to see subscription options clearly,
So that I can choose the plan that works for me.

**Acceptance Criteria:**

**Given** I tap "Subscribe" or encounter the paywall
**When** the subscription screen displays
**Then** I see both subscription options:
  - Monthly: $4.99/month
  - Annual: $34.99/year (with "Save 42%" badge)
**And** annual is highlighted as the recommended option
**And** I see what's included (all pathways, unlimited reviews, etc.)

**Given** I view the subscription screen
**When** looking at the terms
**Then** I see clear auto-renewal disclosure
**And** I see links to Terms of Service and Privacy Policy
**And** this meets App Store/Play Store requirements

**Given** I am already subscribed
**When** opening the subscription screen
**Then** I see my current plan
**And** I see "Manage Subscription" option

**Technical Notes:**
- Create Paywall component
- Fetch prices dynamically from RevenueCat
- Highlight savings for annual plan
- Required disclosures for app store compliance

---

### Story 6.3: Purchase Flow

As a user,
I want to purchase a subscription seamlessly,
So that I can continue learning without interruption.

**Acceptance Criteria:**

**Given** I tap on a subscription option
**When** initiating purchase
**Then** the native App Store/Play Store purchase flow appears
**And** I can authenticate (Face ID, password, etc.)

**Given** I complete the purchase successfully
**When** returning to the app
**Then** my entitlement is updated immediately
**And** I see "Welcome to Safar Premium!" confirmation
**And** full content access is granted
**And** the paywall is dismissed

**Given** I cancel the purchase
**When** dismissing the native purchase dialog
**Then** I return to the subscription screen
**And** no error is shown (graceful cancellation)

**Given** the purchase fails (payment declined, etc.)
**When** the error occurs
**Then** I see an error message with guidance
**And** I can retry the purchase

**Technical Notes:**
- Use RevenueCat's purchasePackage method
- Handle all purchase states (success, cancel, error)
- Update entitlement state in useSubscription
- Log purchase events to analytics

---

### Story 6.4: Paywall Enforcement

As a business,
I want content gated after trial expiration,
So that users subscribe to continue learning.

**Acceptance Criteria:**

**Given** my trial has expired and I have not subscribed
**When** I try to access a lesson
**Then** I see the paywall screen
**And** I can preview the lesson content (first 2 words)
**And** I am prompted to subscribe to continue

**Given** I am on the paywall
**When** I tap "Start Subscription"
**Then** I am taken to the subscription options screen

**Given** I am a subscribed user
**When** I access any content
**Then** no paywall is shown
**And** I have full access to all features

**Given** my subscription lapses (canceled, payment failed)
**When** I try to access content
**Then** I see the paywall with renewal/resubscribe options

**Technical Notes:**
- Check entitlement in navigation guards or screen wrappers
- Allow limited preview (grace UX)
- Create PaywallGate component for protected screens
- Cache entitlement for offline access (with expiry)

---

### Story 6.5: Purchase Restoration

As a returning user,
I want to restore my previous purchase,
So that I can access premium content on a new device.

**Acceptance Criteria:**

**Given** I previously subscribed on another device or after reinstall
**When** I tap "Restore Purchases" on the subscription screen
**Then** RevenueCat syncs my purchase history
**And** if I have an active subscription, my entitlement is restored
**And** I see "Subscription restored!" confirmation

**Given** I tap "Restore Purchases" with no previous subscription
**When** the restore completes
**Then** I see "No active subscription found"
**And** I am offered subscription options

**Given** restore fails due to network error
**When** the error occurs
**Then** I see "Couldn't restore purchases. Check your connection and try again."

**Technical Notes:**
- Use RevenueCat's restorePurchases method
- Required for App Store review compliance
- Include restore option prominently

---

### Story 6.6: Subscription Management

As a subscriber,
I want to view and manage my subscription,
So that I can cancel or change my plan if needed.

**Acceptance Criteria:**

**Given** I am a subscribed user
**When** I navigate to Profile > Subscription
**Then** I see my current plan (Monthly/Annual)
**And** I see my renewal date
**And** I see a "Manage Subscription" button

**Given** I tap "Manage Subscription"
**When** the action is triggered
**Then** I am deep-linked to the native subscription management:
  - iOS: App Store subscription settings
  - Android: Play Store subscription settings

**Given** I cancel my subscription externally
**When** my current period ends
**Then** the app detects the status change
**And** my access reverts to free/trial-expired state

**Technical Notes:**
- RevenueCat handles subscription status syncing
- Deep link to native subscription management
- No in-app cancellation (platform requirement)
- Listen for subscription status changes

---

## Epic 7: Settings & Data Management

Users can customize their app experience, manage notifications, and exercise control over their personal data with GDPR-compliant export and deletion capabilities.

### Story 7.1: Settings Screen

As a user,
I want to access app settings,
So that I can customize my experience.

**Acceptance Criteria:**

**Given** I am on the Profile tab
**When** I tap "Settings"
**Then** I see the settings screen with organized sections:
  - Notifications
  - Sound
  - Account
  - Legal
  - Support

**Given** I am on the settings screen
**When** I view each section
**Then** settings are displayed with appropriate controls (toggles, buttons)
**And** current values are shown

**Technical Notes:**
- Create Settings screen in app/(tabs)/profile/settings.tsx
- Use useSettingsStore for preference state
- Persist settings in AsyncStorage
- Sync settings to server for cross-device consistency

---

### Story 7.2: Notification Preferences

As a user,
I want to control my notification settings,
So that I receive only the notifications I want.

**Acceptance Criteria:**

**Given** I am in Settings > Notifications
**When** I view notification options
**Then** I see toggles for:
  - Streak reminders (on/off)
  - Review reminders (on/off)
  - Learning reminders (on/off)
**And** current states are shown

**Given** I toggle a notification setting
**When** the toggle changes
**Then** the preference is saved immediately
**And** notification scheduling is updated accordingly

**Given** I haven't granted notification permissions
**When** I try to enable notifications
**Then** I am prompted to grant permission
**And** if denied, I see guidance to enable in system settings

**Technical Notes:**
- Request notification permissions when first enabling
- Store preferences in user_settings table
- Update Expo Notifications scheduling based on preferences
- Handle permission denied gracefully

---

### Story 7.3: Sound Settings

As a user,
I want to control sound settings,
So that I can use the app in different environments.

**Acceptance Criteria:**

**Given** I am in Settings > Sound
**When** I view sound options
**Then** I see a toggle for "Sound Effects" (UI sounds like button taps, success chimes)
**And** the current state is shown

**Given** I toggle "Sound Effects" off
**When** using the app
**Then** UI sounds are muted
**And** word pronunciation audio still plays (separate from sound effects)

**Given** I toggle "Sound Effects" on
**When** completing an action (correct answer, level up)
**Then** appropriate sound effect plays

**Technical Notes:**
- Sound effects are separate from pronunciation audio
- Store in useSettingsStore
- Implement sound utility in lib/utils/sound.ts
- Use expo-av for sound effects

---

### Story 7.4: Legal Documents Access

As a user,
I want to access the privacy policy and terms of service,
So that I can understand how my data is used.

**Acceptance Criteria:**

**Given** I am in Settings > Legal
**When** I view the legal section
**Then** I see links to:
  - Privacy Policy
  - Terms of Service

**Given** I tap "Privacy Policy"
**When** the action is triggered
**Then** I am navigated to the privacy policy (in-app webview or external browser)
**And** the policy is up-to-date and accessible

**Given** I tap "Terms of Service"
**When** the action is triggered
**Then** I am navigated to the terms of service
**And** the terms are up-to-date and accessible

**Technical Notes:**
- Link to hosted privacy policy and ToS pages
- Can use expo-web-browser for external links
- URLs stored in constants/config.ts
- Required for App Store/Play Store compliance

---

### Story 7.5: Contact Support

As a user,
I want to contact support,
So that I can get help with issues or provide feedback.

**Acceptance Criteria:**

**Given** I am in Settings > Support
**When** I tap "Contact Support"
**Then** I can send an email to support
**And** the email is pre-filled with:
  - To: support@safar-app.com (or configured email)
  - Subject: "Safar App Support"
  - Body: App version, device info, user ID (anonymized)

**Given** no email client is configured
**When** I tap "Contact Support"
**Then** I see the support email address to copy
**And** guidance to email manually

**Technical Notes:**
- Use expo-mail-composer or Linking.openURL('mailto:')
- Include diagnostic info for easier support
- Don't include PII automatically (user can add details)

---

### Story 7.6: Offline Sync Queue

As a user,
I want my progress saved when offline,
So that I don't lose learning progress due to connectivity issues.

**Acceptance Criteria:**

**Given** I am offline
**When** I complete learning activities (lessons, reviews, quiz)
**Then** my progress is saved locally
**And** changes are added to a sync queue
**And** I see an "Offline" indicator in the UI

**Given** I have pending sync items
**When** connectivity is restored
**Then** the sync queue is processed automatically
**And** items are sent to the server in order
**And** successful items are removed from queue

**Given** a sync item fails (server error)
**When** the failure occurs
**Then** the item remains in queue with retry count incremented
**And** after 3 failures, item is moved to failed queue
**And** error is logged to Sentry (without PII)

**Given** I return online after being offline
**When** sync completes
**Then** I see a brief confirmation "Progress synced"
**And** the "Offline" indicator is removed

**Technical Notes:**
- Implement sync queue in lib/api/sync.ts
- Store queue in AsyncStorage
- Use NetInfo to detect connectivity changes
- Exponential backoff: 1s, 2s, 4s + jitter
- Create useSyncStore for queue state

---

### Story 7.7: Data Export (GDPR)

As a user,
I want to export my personal data,
So that I can exercise my GDPR right to data portability.

**Acceptance Criteria:**

**Given** I am in Settings > Account
**When** I tap "Export My Data"
**Then** I see an explanation of what data will be exported
**And** I see that export will be delivered via email

**Given** I confirm the export request
**When** the request is submitted
**Then** I see confirmation: "We'll email your data within 30 days"
**And** a request is logged in the system

**Given** my data is ready (backend process)
**When** the export is complete
**Then** I receive an email with a secure download link
**And** the export contains: profile, progress, settings (JSON format)

**Technical Notes:**
- Create export request endpoint (Supabase Edge Function)
- Queue export request for async processing
- Data format: JSON with all user tables
- Secure, expiring download link
- GDPR requires response within 30 days

---

### Story 7.8: Data Deletion Request (GDPR)

As a user,
I want to request deletion of my personal data,
So that I can exercise my GDPR right to be forgotten.

**Acceptance Criteria:**

**Given** I am in Settings > Account
**When** I tap "Delete My Data"
**Then** I see a warning about permanent deletion
**And** I see this is different from account deletion (data only vs full account)

**Given** I confirm data deletion
**When** the request is submitted
**Then** I see confirmation: "Your data will be deleted within 30 days"
**And** a deletion request is logged

**Given** the deletion is processed (backend)
**When** deletion completes
**Then** all my personal data is removed from the database
**And** my account remains but progress is reset
**And** I receive email confirmation

**Note:** Full account deletion (Story 1.8) includes data deletion. This story allows data deletion while keeping the account.

**Technical Notes:**
- Create deletion request endpoint
- Queue for async processing
- Soft delete first, hard delete after confirmation
- Keep audit log of deletion (without PII)
- GDPR requires completion within 30 days
