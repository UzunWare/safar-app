---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowStatus: complete
completedAt: '2026-01-29'
inputDocuments:
  - planning-artifacts/prd.md
  - planning-artifacts/ux-design-specification.md
  - planning-artifacts/product-brief-safar-project-2026-01-29.md
workflowType: 'architecture'
project_name: 'safar-project'
user_name: 'uzunware'
date: '2026-01-29'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines 57 functional requirements organized across 8 capability domains:

| Domain | FR Count | Architectural Implication |
|--------|----------|--------------------------|
| User Management (FR1-FR8) | 8 | Auth system with OAuth providers (Apple, Google, Email) |
| Onboarding (FR9-FR12) | 4 | Script assessment gate, pathway initialization |
| Learning Content (FR13-FR19) | 7 | Vocabulary database, root-word relationships, audio storage |
| Learning Experience (FR20-FR26) | 7 | Card UI state machine, quiz engine, difficulty rating |
| Spaced Repetition (FR27-FR33) | 7 | SM-2 algorithm implementation, review scheduling, progress tracking |
| Engagement (FR34-FR40) | 7 | Streak calculation, XP system, push notification service |
| Monetization (FR41-FR47) | 7 | Subscription state management, paywall enforcement, purchase restoration |
| Data & Privacy (FR48-FR57) | 10 | Sync queue, offline storage, GDPR compliance (export/delete) |

**Non-Functional Requirements:**

36 NFRs define quality constraints that drive architectural decisions:

| Category | Key Constraints | Architecture Impact |
|----------|----------------|---------------------|
| Performance | <2s cold start, <500ms audio, <300ms transitions | Aggressive caching, preloading, CDN for audio |
| Security | HTTPS, secure token storage, no PII in logs | Keychain/Keystore for tokens, Sentry configuration |
| Reliability | 99.5% crash-free, no progress loss | Local queue with retry, conflict resolution |
| Scalability | 10K DAU MVP, 100K 12-month | Supabase managed tier, horizontal read replicas |
| Accessibility | WCAG 2.1 AA, RTL support, font scaling | Custom Arabic components, system font respect |
| Integration | Supabase, RevenueCat, Mixpanel, Sentry | Service abstraction layer for testability |

**Scale & Complexity:**

- Primary domain: Cross-platform mobile application
- Complexity level: Medium
- Estimated architectural components: ~15-20 modules
- Solo developer, 6-week timeline constrains architectural complexity

### Technical Constraints & Dependencies

**Framework Constraints:**
- React Native with Expo managed workflow (enables OTA updates)
- Single codebase targeting iOS 14.0+ and Android 8.0+ (API 26)
- NativeWind for styling (Tailwind CSS syntax)
- react-native-reanimated for animations

**Service Dependencies:**
- Supabase: Auth, PostgreSQL database, real-time subscriptions
- RevenueCat: Cross-platform subscription management (StoreKit 2, Google Play Billing)
- Mixpanel: Event analytics, funnels, retention tracking
- Sentry: Crash reporting, performance monitoring
- Expo Notifications: Push via FCM (Android) + APNs (iOS)

**Content Dependencies:**
- Arabic typography: Amiri or KFGQPC Uthmanic Script fonts
- Audio files: Quranic recitation from verified Qaris
- Vocabulary database: Curated word set with root relationships

### Cross-Cutting Concerns Identified

| Concern | Scope | Architecture Approach |
|---------|-------|----------------------|
| Authentication | All protected screens | Auth context/provider wrapping app |
| Offline Support | Learning, review, progress | Local-first with sync queue |
| Subscription Gating | Content access, features | Paywall middleware checking entitlements |
| Analytics | All user interactions | Event tracking layer abstraction |
| Error Handling | All network operations | Centralized error boundary + retry logic |
| Arabic RTL | Learning screens | RTL layout containers, bidirectional text |
| Accessibility | Entire app | Global accessibility provider, semantic markup |

### UX-Driven Architecture Requirements

From UX Specification analysis:

**Custom Component Complexity:**
- WordCard: High complexity (Arabic, transliteration, meaning, root indicator, audio)
- RootExplorer: High complexity (animated inline reveal of connected words)
- QuizCard: Medium complexity (multiple choice with feedback animation)
- ProgressRing: Medium complexity (SVG-based circular progress)
- StreakCounter: Low complexity (flame icon + count)
- DifficultyRating: Low complexity (4-button Anki-style)

**Animation Requirements:**
- Card transitions: <200ms (Reanimated, ease-out)
- Root reveal: spring animation (damping: 15)
- Celebration: Lottie animation files

**State Management Implications:**
- Learning session state (current card, progress through lesson)
- Review queue state (due cards, completed ratings)
- User progress state (words learned, streak, XP)
- Subscription state (trial status, entitlements)
- Sync state (online/offline, pending queue)

## Starter Template Evaluation

### Primary Technology Domain

**Cross-platform mobile application** using React Native with Expo managed workflow, as specified in the PRD. This enables:
- Single codebase for iOS and Android
- OTA updates via Expo Updates
- Access to native APIs via Expo modules
- Rapid iteration during MVP development

### Starter Options Considered

| Starter | Pros | Cons | Fit |
|---------|------|------|-----|
| `create-expo-app` | Official, minimal, latest SDK | Manual NativeWind/Supabase setup | Medium |
| `create-expo-stack` | Pre-configured NativeWind + Supabase + Expo Router | Slightly opinionated structure | **Best** |
| `create-t3-turbo` | Monorepo, type-safe, tRPC | Overkill for mobile-only MVP | Low |
| Manual Expo + config | Full control | More setup time, 6-week constraint | Low |

### Selected Starter: create-expo-stack

**Rationale for Selection:**

1. **Pre-configured NativeWind** — Matches PRD requirement for Tailwind-based styling without manual Metro/Babel configuration
2. **Supabase integration option** — Provides auth scaffolding aligned with our backend choice
3. **Expo Router** — File-based routing matches modern React patterns and simplifies navigation
4. **TypeScript by default** — Type safety for complex state management (SR algorithm, sync queue)
5. **Active maintenance** — Community-driven, regular updates aligned with Expo SDK releases
6. **Solo developer friendly** — Reduces boilerplate setup, allowing focus on business logic

**Initialization Command:**

```bash
npx create-expo-stack@latest safar-app \
  --expo-router \
  --nativewind \
  --supabase \
  --typescript \
  --npm
```

**Post-Initialization Steps:**

```bash
# Install additional dependencies
npm install @react-native-async-storage/async-storage
npm install react-native-reanimated
npm install expo-av
npm install expo-notifications
npm install expo-secure-store
npm install lottie-react-native
npm install react-native-purchases  # RevenueCat
npm install @sentry/react-native
npm install mixpanel-react-native
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript 5.9.2 with strict mode
- React 19.x with concurrent features
- Expo SDK 54 (latest stable)

**Styling Solution:**
- NativeWind v4 (Tailwind CSS for React Native)
- tailwind.config.js with mobile-optimized defaults
- Global CSS file for custom utilities
- Dark mode support via Tailwind's `dark:` prefix

**Build Tooling:**
- Metro bundler with NativeWind transformer
- Babel preset configured for Expo + NativeWind JSX
- EAS Build for production builds
- Expo Updates for OTA delivery

**Routing & Navigation:**
- Expo Router (file-based routing)
- Tab navigator structure (maps to our 4-tab design)
- Stack navigator for modal flows
- Deep linking configured automatically

**Code Organization:**
```
app/                    # Expo Router file-based routes
├── (tabs)/            # Tab navigator group
│   ├── index.tsx      # Home tab
│   ├── learn.tsx      # Learn tab
│   ├── review.tsx     # Review tab
│   └── profile.tsx    # Profile tab
├── lesson/[id].tsx    # Dynamic lesson route
├── onboarding/        # Onboarding flow
└── _layout.tsx        # Root layout

components/            # Reusable UI components
lib/                   # Utilities, hooks, services
constants/             # Design tokens, config
assets/               # Images, fonts, audio
```

**Development Experience:**
- Hot reload with Fast Refresh
- TypeScript IntelliSense
- Expo Dev Tools for debugging
- Console logging to terminal

**Note:** Project initialization using this command should be the first implementation story in Epic 1.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- State management approach
- Offline-first sync strategy
- SM-2 algorithm implementation location
- Authentication flow architecture
- Subscription entitlement checking

**Important Decisions (Shape Architecture):**
- Data validation approach
- Error handling patterns
- Audio caching strategy
- Analytics abstraction layer

**Deferred Decisions (Post-MVP):**
- Full offline mode with downloadable content
- Real-time sync (WebSocket vs polling)
- Advanced caching with background refresh

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary Database | Supabase PostgreSQL | PRD requirement; managed service reduces ops burden |
| Local Storage | AsyncStorage + MMKV | AsyncStorage for compatibility; MMKV for performance-critical data |
| Data Validation | Zod schemas | Runtime validation, TypeScript integration, shared client/server schemas |
| Migration Approach | Supabase migrations | Version-controlled SQL migrations via Supabase CLI |
| Cache Strategy | Stale-while-revalidate | Show cached data immediately, refresh in background |

**Database Schema Principles:**
- Vocabulary and roots are read-only reference data (seeded, not user-modifiable)
- User progress data is write-heavy, needs conflict resolution
- Soft deletes with `deleted_at` timestamp for sync safety
- `synced_at` and `is_synced` flags on user data tables

**Local Data Model:**
```typescript
// User progress stored locally with sync metadata
interface LocalWordProgress {
  word_id: string;
  ease_factor: number;      // SM-2
  interval: number;         // Days until next review
  repetitions: number;
  next_review: string;      // ISO date
  last_review: string;
  is_synced: boolean;
  updated_at: string;
}
```

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth Provider | Supabase Auth | Integrated with database; supports Apple, Google, Email |
| Token Storage | expo-secure-store | Native Keychain (iOS) / Keystore (Android) |
| Session Management | Supabase session with auto-refresh | Built-in token refresh, offline grace period |
| API Security | Row Level Security (RLS) | Database-level authorization; users only see own data |
| Payment Security | RevenueCat handles all payment data | PCI compliant; no card data touches our code |

**Auth Flow Architecture:**
```
App Launch
    ↓
Check Secure Store for session
    ├── Valid session → Refresh token → Home
    ├── Expired session → Silent refresh → Home
    └── No session → Onboarding/Auth
```

**Security Middleware Pattern:**
- `AuthProvider` wraps app, exposes `useAuth()` hook
- Protected routes check auth state before rendering
- Supabase client auto-injects auth headers
- RLS policies enforce data isolation at database level

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API Style | Supabase REST + RPC | Direct database access for CRUD; RPC for complex operations |
| Data Fetching | TanStack Query (React Query) | Caching, background refresh, offline support, devtools |
| Real-time | Supabase Realtime (deferred) | Not needed for MVP; review queue doesn't need live sync |
| Error Handling | Centralized error boundary + toast notifications | Consistent UX; non-blocking for non-critical errors |
| Retry Strategy | Exponential backoff with jitter | 3 retries: 1s, 2s, 4s + random jitter |

**API Layer Structure:**
```typescript
// Service abstraction for testability
lib/
├── api/
│   ├── supabase.ts       // Supabase client singleton
│   ├── vocabulary.ts     // Read-only content queries
│   ├── progress.ts       // User progress mutations
│   └── sync.ts           // Offline sync queue
├── hooks/
│   ├── useVocabulary.ts  // TanStack Query wrapper
│   └── useProgress.ts    // Progress with optimistic updates
```

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Management | Zustand | Minimal boilerplate, 3KB, excellent React Native support |
| Server State | TanStack Query | Separate server state from UI state; built-in caching |
| Form State | React Hook Form + Zod | Type-safe forms; minimal re-renders |
| Component Architecture | Compound components + hooks | Flexible composition; logic separation |
| Animation Library | react-native-reanimated | 60fps native animations; worklet architecture |

**Zustand Store Structure:**
```typescript
// Separate stores by domain for modularity
stores/
├── useAuthStore.ts       // User session, profile
├── useLearningStore.ts   // Current session, card index
├── useProgressStore.ts   // Words learned, streaks, XP
├── useSettingsStore.ts   // Preferences, notifications
└── useSyncStore.ts       // Online status, pending queue
```

**State Management Philosophy:**
- Zustand for client-only state (UI, preferences, session state)
- TanStack Query for server state (vocabulary, user progress from API)
- Local component state for ephemeral UI (form inputs, modals)
- No global state for data that belongs in TanStack Query cache

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build Service | EAS Build | Expo's managed build service; iOS and Android |
| CI/CD | GitHub Actions + EAS | PR previews, automated builds on merge |
| OTA Updates | Expo Updates | Critical for hotfixes without App Store review |
| Crash Monitoring | Sentry | Industry standard; React Native SDK; performance monitoring |
| Analytics | Mixpanel | Event-based; funnels; retention analysis |
| Push Notifications | Expo Notifications | Unified API for FCM + APNs |

**Environment Configuration:**
```
.env.local              # Local development (gitignored)
.env.development        # Development build
.env.preview            # TestFlight/Internal Testing
.env.production         # Production release

# Required variables
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_MIXPANEL_TOKEN=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_REVENUECAT_API_KEY=
```

**Deployment Pipeline:**
```
PR Created
    ↓
GitHub Actions: Lint + Type Check + Unit Tests
    ↓
EAS Build: Preview build for testing
    ↓
Merge to main
    ↓
EAS Build: Production build
    ↓
Manual submission to App Store / Play Store
```

### SM-2 Algorithm Implementation

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Implementation Location | Client-side (local) | Immediate feedback; works offline; no latency |
| Storage | Zustand + AsyncStorage persistence | Fast reads; survives app restart |
| Sync Strategy | Background sync on session complete | Batch updates; reduces API calls |

**SM-2 Core Logic:**
```typescript
// Simplified SM-2 implementation
function calculateNextReview(
  quality: 0 | 1 | 2 | 3,  // Again, Hard, Good, Easy
  card: CardProgress
): CardProgress {
  // Quality mapping: 0=Again, 1=Hard, 2=Good, 3=Easy
  const q = quality + 2;  // Convert to SM-2 scale (2-5)

  let { easeFactor, interval, repetitions } = card;

  if (q < 3) {
    // Failed - reset
    repetitions = 0;
    interval = 1;
  } else {
    // Passed
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);

    repetitions += 1;
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReview: addDays(new Date(), interval).toISOString(),
    lastReview: new Date().toISOString(),
    is_synced: false,
  };
}
```

### Offline-First Sync Strategy

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary Pattern | Local-first with background sync | Instant UX; no network dependency for core loop |
| Conflict Resolution | Last-write-wins with timestamp | Simple; acceptable for single-user data |
| Queue Storage | AsyncStorage with `pendingSync` array | Persists across app restarts |
| Sync Trigger | On app foreground + connectivity change | Opportunistic sync; battery-friendly |

**Sync Queue Architecture:**
```typescript
interface SyncQueueItem {
  id: string;
  type: 'progress_update' | 'streak_update' | 'settings_change';
  payload: unknown;
  created_at: string;
  retry_count: number;
}

// Sync process
async function processQueue() {
  const queue = await getQueue();
  for (const item of queue) {
    try {
      await syncItem(item);
      await removeFromQueue(item.id);
    } catch (error) {
      if (item.retry_count < 3) {
        await updateRetryCount(item.id);
      } else {
        await moveToFailedQueue(item);
        reportToSentry(error);
      }
    }
  }
}
```

**Graceful Degradation (MVP):**
- App launches with cached vocabulary data
- Learning and review sessions work fully offline
- Progress updates queue locally
- Clear "Offline" indicator in UI
- Sync automatically when connectivity restored

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization with create-expo-stack
2. Supabase setup (database schema, RLS policies, auth config)
3. Core state management (Zustand stores, TanStack Query setup)
4. Auth flow implementation
5. Vocabulary data layer (read-only, cacheable)
6. Learning session UI with SM-2
7. Progress tracking with offline queue
8. RevenueCat integration
9. Analytics and error tracking
10. Push notifications

**Cross-Component Dependencies:**
- Auth → All protected features
- Supabase client → All data operations
- Zustand stores → UI components
- TanStack Query → Server data display
- Sync queue → Progress persistence
- RevenueCat → Content access (paywall)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 25+ areas where AI agents could make different choices without explicit guidance. These patterns ensure consistent, compatible code across all implementation work.

### Naming Patterns

**Database Naming Conventions:**

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `words`, `user_progress`, `root_relationships` |
| Columns | snake_case | `word_id`, `ease_factor`, `next_review` |
| Foreign Keys | `{table}_id` | `word_id`, `user_id`, `pathway_id` |
| Indexes | `idx_{table}_{columns}` | `idx_user_progress_user_id` |
| Constraints | `{table}_{type}_{columns}` | `user_progress_pk_id`, `words_fk_root_id` |
| Timestamps | `created_at`, `updated_at`, `deleted_at` | Always use these exact names |

**API Naming Conventions:**

| Element | Convention | Example |
|---------|------------|---------|
| Supabase tables | Direct access via client | `supabase.from('words').select()` |
| RPC functions | snake_case verb_noun | `get_due_reviews`, `update_progress` |
| Query keys | Array with entity + params | `['words', pathwayId]`, `['progress', 'user', userId]` |

**Code Naming Conventions:**

| Element | Convention | Example |
|---------|------------|---------|
| Files - Components | PascalCase.tsx | `WordCard.tsx`, `ProgressRing.tsx` |
| Files - Hooks | camelCase.ts | `useVocabulary.ts`, `useProgress.ts` |
| Files - Utils | camelCase.ts | `formatDate.ts`, `calculateSm2.ts` |
| Files - Types | camelCase.types.ts | `word.types.ts`, `progress.types.ts` |
| Files - Stores | use{Name}Store.ts | `useAuthStore.ts`, `useLearningStore.ts` |
| Components | PascalCase | `WordCard`, `QuizOption`, `StreakCounter` |
| Hooks | use{Action/Resource} | `useVocabulary`, `useAuth`, `useProgress` |
| Functions | camelCase verb | `calculateNextReview`, `formatArabicText` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_EASE_FACTOR` |
| Types/Interfaces | PascalCase | `Word`, `UserProgress`, `SyncQueueItem` |
| Enums | PascalCase + PascalCase members | `DifficultyRating.Easy` |

### Structure Patterns

**Project Organization:**

```
safar-app/
├── app/                      # Expo Router pages (file-based routing)
│   ├── (tabs)/              # Tab navigator group
│   │   ├── _layout.tsx      # Tab bar configuration
│   │   ├── index.tsx        # Home tab
│   │   ├── learn.tsx        # Learn tab
│   │   ├── review.tsx       # Review tab
│   │   └── profile.tsx      # Profile tab
│   ├── lesson/
│   │   └── [id].tsx         # Dynamic lesson screen
│   ├── onboarding/
│   │   ├── _layout.tsx
│   │   ├── index.tsx        # Welcome
│   │   ├── script-gate.tsx  # Script assessment
│   │   └── pathway.tsx      # Pathway selection
│   ├── auth/
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── _layout.tsx          # Root layout (providers)
│   └── +not-found.tsx       # 404 handler
│
├── components/              # Reusable UI components
│   ├── ui/                  # Generic UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── learning/            # Learning-specific components
│   │   ├── WordCard.tsx
│   │   ├── RootExplorer.tsx
│   │   ├── QuizCard.tsx
│   │   └── DifficultyRating.tsx
│   ├── progress/            # Progress-related components
│   │   ├── ProgressRing.tsx
│   │   ├── StreakCounter.tsx
│   │   └── XpDisplay.tsx
│   └── layout/              # Layout components
│       ├── SafeArea.tsx
│       └── TabBar.tsx
│
├── lib/                     # Business logic & utilities
│   ├── api/                 # API service layer
│   │   ├── supabase.ts      # Supabase client
│   │   ├── vocabulary.ts    # Word/root queries
│   │   ├── progress.ts      # Progress mutations
│   │   └── sync.ts          # Offline sync
│   ├── hooks/               # Custom React hooks
│   │   ├── useVocabulary.ts
│   │   ├── useProgress.ts
│   │   ├── useAuth.ts
│   │   └── useSubscription.ts
│   ├── stores/              # Zustand stores
│   │   ├── useAuthStore.ts
│   │   ├── useLearningStore.ts
│   │   ├── useProgressStore.ts
│   │   └── useSyncStore.ts
│   ├── utils/               # Pure utility functions
│   │   ├── sm2.ts           # SM-2 algorithm
│   │   ├── date.ts          # Date formatting
│   │   └── arabic.ts        # Arabic text helpers
│   └── validation/          # Zod schemas
│       ├── word.schema.ts
│       └── progress.schema.ts
│
├── constants/               # App-wide constants
│   ├── colors.ts            # Color tokens
│   ├── typography.ts        # Font configuration
│   ├── spacing.ts           # Spacing scale
│   └── config.ts            # Feature flags, limits
│
├── assets/                  # Static assets
│   ├── fonts/               # Custom fonts (Amiri, etc.)
│   ├── images/              # Images and icons
│   ├── audio/               # Cached audio files
│   └── animations/          # Lottie files
│
├── types/                   # TypeScript type definitions
│   ├── word.types.ts
│   ├── progress.types.ts
│   ├── navigation.types.ts
│   └── supabase.types.ts    # Generated from Supabase
│
└── __tests__/               # Test files (mirrors src structure)
    ├── components/
    ├── lib/
    └── utils/
```

**File Structure Patterns:**

| Pattern | Rule |
|---------|------|
| Co-located tests | `Component.test.tsx` next to `Component.tsx` OR in `__tests__/` mirror |
| Index exports | Each folder has `index.ts` for clean imports |
| Type co-location | Types in same file if <30 lines, else `{name}.types.ts` |
| Component structure | Exports at bottom, hooks at top, JSX in middle |

### Format Patterns

**API Response Formats:**

TanStack Query handles Supabase responses. For RPC functions:

```typescript
// Success response
{ data: T, error: null }

// Error response
{ data: null, error: { message: string, code: string } }
```

**Error Response Structure:**

```typescript
interface AppError {
  message: string;        // User-friendly message
  code: string;           // Machine-readable code (e.g., 'AUTH_EXPIRED')
  details?: unknown;      // Debug info (not shown to users)
}

// Error codes follow pattern: DOMAIN_ERROR_TYPE
// Examples: AUTH_EXPIRED, SYNC_FAILED, PAYMENT_DECLINED
```

**Date/Time Formats:**

| Context | Format | Example |
|---------|--------|---------|
| API/Storage | ISO 8601 string | `2026-01-29T10:30:00.000Z` |
| Display - Date | Localized | `29 Jan 2026` or `Jan 29, 2026` |
| Display - Relative | Human readable | `2 hours ago`, `Tomorrow` |
| SR Intervals | Integer days | `7` (for 7-day interval) |

**JSON Field Naming:**

| Layer | Convention | Reason |
|-------|------------|--------|
| Database | snake_case | PostgreSQL convention |
| API responses | snake_case | Matches database |
| TypeScript | camelCase | JavaScript convention |
| Transform | On API boundary | `lib/api/*.ts` handles conversion |

### Communication Patterns

**Analytics Event Naming:**

```typescript
// Pattern: domain_action_detail
// All lowercase with underscores

// Examples:
'lesson_started'
'lesson_completed'
'word_learned'
'root_tapped'
'quiz_answered'
'streak_achieved'
'subscription_started'
'onboarding_completed'
```

**Analytics Event Payload Structure:**

```typescript
interface AnalyticsEvent {
  event: string;           // Event name (snake_case)
  properties: {
    // Always include
    timestamp: string;     // ISO 8601
    session_id: string;

    // Event-specific (snake_case keys)
    word_id?: string;
    lesson_id?: string;
    pathway_id?: string;
    difficulty_rating?: number;
    is_correct?: boolean;
    // ...
  };
}
```

**State Update Patterns:**

```typescript
// Zustand - Always use set() with function form for derived state
useStore.getState().set((state) => ({
  ...state,
  count: state.count + 1,
}));

// Never mutate directly
// ❌ state.count = state.count + 1;
// ✅ set((s) => ({ count: s.count + 1 }))
```

### Process Patterns

**Error Handling Patterns:**

```typescript
// 1. API errors - handled in hooks with React Query
const { data, error, isError } = useQuery(...);
if (isError) {
  // Error boundary catches, shows toast
}

// 2. Sync errors - silent retry with Sentry logging
try {
  await syncProgress();
} catch (error) {
  Sentry.captureException(error);
  // Queue for retry, don't show user
}

// 3. Critical errors - show error screen
// Auth failure, payment failure, data corruption
// Use error boundary with recovery option

// 4. User errors - inline validation feedback
// Form validation, quiz answers
// Show immediately, don't block
```

**Loading State Patterns:**

```typescript
// TanStack Query states
interface QueryState {
  isLoading: boolean;      // Initial load, no data yet
  isFetching: boolean;     // Refreshing, has stale data
  isError: boolean;
  data: T | undefined;
}

// Loading UI patterns
// 1. Skeleton for initial loads (isLoading)
// 2. Show stale data + refresh indicator (isFetching)
// 3. No loading for mutations (optimistic updates)

// Naming convention for custom loading states
const [isSubmitting, setIsSubmitting] = useState(false);
const [isSyncing, setIsSyncing] = useState(false);
```

**Toast Notification Patterns:**

```typescript
// Success - brief, dismissible
toast.success('Progress saved');

// Error - actionable when possible
toast.error('Sync failed', { action: { label: 'Retry', onClick: retry } });

// Info - non-blocking
toast.info('You\'re offline. Progress will sync when connected.');

// Never use toast for:
// - Form validation (use inline errors)
// - Critical errors (use error screen)
// - Background operations (silent)
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow naming conventions exactly as documented (no variations)
2. Place files in designated directories (no new top-level folders without approval)
3. Use established patterns for error handling, loading states, and API calls
4. Include TypeScript types for all functions and components
5. Follow the state management philosophy (Zustand vs TanStack Query vs local)
6. Use existing utility functions before creating new ones
7. Match existing code style in adjacent files

**Pattern Verification:**

- ESLint rules enforce naming conventions
- TypeScript strict mode catches type violations
- PR review checklist includes pattern compliance
- Automated tests verify API response formats

**Pattern Evolution:**

- Patterns can be updated via architecture document revision
- Breaking changes require migration plan
- New patterns documented before use

### Pattern Examples

**Good Examples:**

```typescript
// ✅ Correct hook naming and structure
// lib/hooks/useVocabulary.ts
export function useVocabulary(pathwayId: string) {
  return useQuery({
    queryKey: ['words', pathwayId],
    queryFn: () => getWordsByPathway(pathwayId),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// ✅ Correct component naming and file structure
// components/learning/WordCard.tsx
interface WordCardProps {
  word: Word;
  onRootTap: (rootId: string) => void;
}

export function WordCard({ word, onRootTap }: WordCardProps) {
  // ...
}

// ✅ Correct store pattern
// lib/stores/useProgressStore.ts
interface ProgressState {
  wordsLearned: number;
  streak: number;
  incrementStreak: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  wordsLearned: 0,
  streak: 0,
  incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),
}));
```

**Anti-Patterns:**

```typescript
// ❌ Wrong: PascalCase for hook file
// hooks/UseVocabulary.ts

// ❌ Wrong: Mixing snake_case in TypeScript
// const word_id = word.word_id;  // Should be wordId

// ❌ Wrong: Server state in Zustand
// useStore.setState({ words: fetchedWords });  // Use TanStack Query

// ❌ Wrong: Generic file names
// utils/helpers.ts  // Be specific: utils/dateHelpers.ts

// ❌ Wrong: Inline error handling without pattern
// catch (e) { alert(e.message); }  // Use toast pattern

// ❌ Wrong: camelCase database columns
// SELECT wordId FROM words  // Should be word_id
```

## Project Structure & Boundaries

### Architectural Boundaries

**API Boundaries:**

| Boundary | Location | Responsibility |
|----------|----------|---------------|
| Supabase Client | `lib/api/supabase.ts` | Single point of database access |
| Auth Layer | `lib/api/auth.ts` + `lib/hooks/useAuth.ts` | All authentication operations |
| Vocabulary API | `lib/api/vocabulary.ts` | Read-only content queries |
| Progress API | `lib/api/progress.ts` | User progress mutations |
| Sync Layer | `lib/api/sync.ts` | Offline queue management |

**Component Boundaries:**

```
┌─────────────────────────────────────────────────────────┐
│                    App (_layout.tsx)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Providers Layer                       │  │
│  │  AuthProvider → QueryProvider → SyncProvider       │  │
│  │  → SubscriptionProvider → ThemeProvider            │  │
│  └───────────────────────────────────────────────────┘  │
│                           │                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Navigation Layer                      │  │
│  │  Expo Router (file-based)                         │  │
│  │  Tab Navigator → Stack Navigator                   │  │
│  └───────────────────────────────────────────────────┘  │
│                           │                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Screen Layer                          │  │
│  │  app/(tabs)/*.tsx, app/lesson/*.tsx, etc.         │  │
│  │  Orchestrates components, handles navigation       │  │
│  └───────────────────────────────────────────────────┘  │
│                           │                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Component Layer                       │  │
│  │  components/ui/* (primitives)                     │  │
│  │  components/learning/* (domain components)        │  │
│  │  components/progress/* (progress display)         │  │
│  └───────────────────────────────────────────────────┘  │
│                           │                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Data Layer                            │  │
│  │  lib/hooks/* (TanStack Query wrappers)            │  │
│  │  lib/stores/* (Zustand stores)                    │  │
│  │  lib/api/* (Supabase queries)                     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Data Boundaries:**

| Boundary | What Crosses | Direction |
|----------|--------------|-----------|
| Supabase → App | Vocabulary, progress, auth tokens | Read |
| App → Supabase | Progress updates, auth requests | Write |
| App → AsyncStorage | Sync queue, settings, cached data | Read/Write |
| App → SecureStore | Auth tokens only | Read/Write |
| App → RevenueCat | Subscription status | Read |
| App → Mixpanel | Analytics events | Write |
| App → Sentry | Errors, performance | Write |

### Requirements to Structure Mapping

**FR Categories to Directories:**

| FR Category | Primary Directory | Related Files |
|-------------|-------------------|---------------|
| User Management (FR1-FR8) | `app/auth/`, `lib/api/auth.ts` | `useAuthStore.ts`, `useAuth.ts` |
| Onboarding (FR9-FR12) | `app/onboarding/` | `script-gate.tsx`, `pathway.tsx` |
| Learning Content (FR13-FR19) | `lib/api/vocabulary.ts`, `components/learning/` | `WordCard.tsx`, `RootExplorer.tsx` |
| Learning Experience (FR20-FR26) | `app/lesson/`, `components/learning/` | `QuizCard.tsx`, `DifficultyRating.tsx` |
| Spaced Repetition (FR27-FR33) | `lib/utils/sm2.ts`, `lib/stores/useProgressStore.ts` | `useProgress.ts` |
| Engagement (FR34-FR40) | `components/progress/`, `lib/stores/` | `StreakCounter.tsx`, `XpDisplay.tsx` |
| Monetization (FR41-FR47) | `lib/hooks/useSubscription.ts`, `app/(tabs)/profile.tsx` | `Paywall.tsx` |
| Settings (FR48-FR52) | `app/(tabs)/profile.tsx`, `lib/stores/useSettingsStore.ts` | Settings components |
| Data & Privacy (FR53-FR57) | `lib/api/sync.ts`, `lib/stores/useSyncStore.ts` | Sync queue logic |

**Cross-Cutting Concerns Mapping:**

| Concern | Implementation Location |
|---------|------------------------|
| Authentication | `lib/hooks/useAuth.ts` + `AuthProvider` in `_layout.tsx` |
| Error Handling | `components/layout/ErrorBoundary.tsx` + `lib/utils/error.ts` |
| Loading States | TanStack Query built-in + `components/ui/Skeleton.tsx` |
| Offline Detection | `lib/hooks/useNetworkStatus.ts` + `useSyncStore.ts` |
| Analytics | `lib/utils/analytics.ts` + hooks integration |
| Accessibility | Per-component + `constants/accessibility.ts` |

### Integration Points

**Internal Communication:**

```
Screen (app/*.tsx)
    │
    ├── useQuery() ──────────► TanStack Query Cache
    │                               │
    │                               ▼
    │                         lib/api/*.ts ────► Supabase
    │
    ├── useStore() ──────────► Zustand Store
    │                               │
    │                               ▼
    │                         AsyncStorage (persistence)
    │
    └── Component Props ─────► components/*.tsx
```

**External Integrations:**

| Service | Integration Point | SDK/Method |
|---------|------------------|------------|
| Supabase Auth | `lib/api/supabase.ts` | `@supabase/supabase-js` |
| Supabase DB | `lib/api/*.ts` | Supabase REST client |
| RevenueCat | `lib/hooks/useSubscription.ts` | `react-native-purchases` |
| Mixpanel | `lib/utils/analytics.ts` | `mixpanel-react-native` |
| Sentry | `app/_layout.tsx` (init) | `@sentry/react-native` |
| Expo Notifications | `lib/hooks/useNotifications.ts` | `expo-notifications` |

**Data Flow:**

```
User Action (tap word card)
    │
    ▼
Component Event Handler
    │
    ├──► Update Local State (useState)
    │
    ├──► Trigger Analytics (Mixpanel)
    │         analytics.track('word_learned', { word_id })
    │
    ├──► Update Progress Store (Zustand)
    │         useProgressStore.getState().addWordLearned()
    │
    └──► Queue Sync (if progress change)
              useSyncStore.getState().addToQueue({ type: 'progress_update', ... })
                    │
                    ▼
              Background Sync (on foreground / connectivity)
                    │
                    ▼
              Supabase upsert (lib/api/progress.ts)
```

### File Organization Patterns

**Configuration Files:**

| File | Purpose | Location |
|------|---------|----------|
| `app.json` | Expo app config | Root |
| `eas.json` | EAS Build config | Root |
| `tailwind.config.js` | NativeWind config | Root |
| `tsconfig.json` | TypeScript config | Root |
| `.env.*` | Environment variables | Root (gitignored) |
| `constants/config.ts` | Runtime config | `constants/` |

**Source Organization Principles:**

1. **Feature-based grouping** for screens (`app/onboarding/`, `app/lesson/`)
2. **Domain-based grouping** for components (`components/learning/`, `components/progress/`)
3. **Type-based grouping** for utilities (`lib/api/`, `lib/hooks/`, `lib/stores/`)
4. **Co-location** of closely related files (types with schemas, tests with source)

**Test Organization:**

| Test Type | Location | Naming |
|-----------|----------|--------|
| Unit tests | `__tests__/` mirror or co-located | `*.test.ts` |
| Component tests | `__tests__/components/` | `Component.test.tsx` |
| Hook tests | `__tests__/hooks/` | `useHook.test.ts` |
| Integration tests | `__tests__/integration/` | `feature.integration.test.ts` |
| E2E tests | `__tests__/e2e/` | `flow.e2e.test.ts` (Detox) |

**Asset Organization:**

| Asset Type | Location | Naming |
|------------|----------|--------|
| Custom fonts | `assets/fonts/` | `FontName-Weight.ttf` |
| App icons | `assets/images/` | `icon.png`, `splash.png` |
| UI icons | `assets/icons/` | `icon-name.svg` |
| Audio files | `assets/audio/` | `word_id.mp3` |
| Lottie animations | `assets/animations/` | `animation-name.json` |

### Development Workflow Integration

**Development Server:**

```bash
# Start development
npx expo start

# Platform-specific
npx expo start --ios
npx expo start --android

# Clear cache
npx expo start --clear
```

**Build Process:**

```bash
# Development build (Expo Go compatible)
npx expo prebuild

# Preview build (TestFlight/Internal Testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all
```

**Environment Workflow:**

| Environment | Build Profile | API Target | Debug |
|-------------|---------------|------------|-------|
| Local | `development` | Local/staging Supabase | Yes |
| Preview | `preview` | Staging Supabase | Yes |
| Production | `production` | Production Supabase | No |

**Deployment Pipeline:**

```
Feature Branch
    │
    ├── PR Created
    │       │
    │       ▼
    │   GitHub Actions
    │   - Lint (ESLint)
    │   - Type Check (tsc)
    │   - Unit Tests (Jest)
    │       │
    │       ▼
    │   EAS Build (preview profile)
    │       │
    │       ▼
    │   TestFlight / Internal Testing
    │
    ├── PR Merged to main
    │       │
    │       ▼
    │   EAS Build (production profile)
    │       │
    │       ▼
    │   Manual App Store / Play Store submission
    │
    └── Hotfix Path
            │
            ▼
        OTA Update (Expo Updates)
        - JS-only changes
        - No binary change needed
```

### Database Schema Overview

**Core Tables:**

```sql
-- Reference data (read-only, seeded)
pathways (id, name, description, order)
units (id, pathway_id, name, order)
lessons (id, unit_id, name, order)
words (id, lesson_id, arabic, transliteration, meaning, audio_url)
roots (id, letters, meaning)
word_roots (word_id, root_id)

-- User data (write-heavy, synced)
users (id, email, created_at, ...)  -- Managed by Supabase Auth
user_progress (id, user_id, word_id, ease_factor, interval, repetitions, next_review, last_review, updated_at)
user_streaks (id, user_id, current_streak, longest_streak, last_activity_date, freeze_used_at)
user_xp (id, user_id, total_xp, updated_at)
user_settings (id, user_id, notifications_enabled, sound_enabled, ...)

-- Sync metadata
sync_queue (id, user_id, type, payload, created_at, synced_at)
```

**Row Level Security (RLS):**

```sql
-- Users can only see/modify their own data
CREATE POLICY "Users can view own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

All technology choices are validated to work together:

| Stack Element | Compatible With | Verified |
|---------------|----------------|----------|
| Expo SDK 54 | React Native 0.81+, NativeWind v4 | ✅ |
| NativeWind v4 | Tailwind 3.4+, Metro bundler | ✅ |
| Supabase | Expo, React Native, RLS | ✅ |
| TanStack Query | React 19, TypeScript 5.9 | ✅ |
| Zustand | React 19, AsyncStorage | ✅ |
| RevenueCat | Expo, iOS 14+, Android 8+ | ✅ |
| Sentry | Expo, React Native | ✅ |
| react-native-reanimated | Expo, NativeWind | ✅ |

No version conflicts detected. All packages are maintained and have recent releases.

**Pattern Consistency:**

- Naming conventions are consistent: snake_case for DB, camelCase for TS, PascalCase for components
- File structure follows Expo Router conventions with clear domain separation
- State management philosophy is clear: Zustand for client, TanStack Query for server
- Error handling patterns are uniform across all layers

**Structure Alignment:**

- Project structure supports all architectural decisions
- Boundaries are well-defined (API layer, hooks layer, stores layer)
- Integration points are explicit and documented
- No orphaned components or unclear responsibilities

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| FR Category | Count | Architecture Support | Coverage |
|-------------|-------|---------------------|----------|
| User Management (FR1-FR8) | 8 | Supabase Auth + OAuth providers | ✅ 100% |
| Onboarding (FR9-FR12) | 4 | Expo Router onboarding flow | ✅ 100% |
| Learning Content (FR13-FR19) | 7 | Vocabulary API + WordCard components | ✅ 100% |
| Learning Experience (FR20-FR26) | 7 | Learning components + quiz engine | ✅ 100% |
| Spaced Repetition (FR27-FR33) | 7 | SM-2 implementation + progress store | ✅ 100% |
| Engagement (FR34-FR40) | 7 | Streak/XP stores + notifications | ✅ 100% |
| Monetization (FR41-FR47) | 7 | RevenueCat integration | ✅ 100% |
| Settings (FR48-FR52) | 5 | Settings store + profile screen | ✅ 100% |
| Data & Privacy (FR53-FR57) | 5 | Sync queue + GDPR endpoints | ✅ 100% |

**All 57 FRs are architecturally supported.**

**Non-Functional Requirements Coverage:**

| NFR Category | Count | Architecture Support | Coverage |
|--------------|-------|---------------------|----------|
| Performance (NFR1-NFR7) | 7 | Caching, preloading, CDN | ✅ 100% |
| Security (NFR8-NFR13) | 6 | Secure storage, HTTPS, RLS | ✅ 100% |
| Reliability (NFR14-NFR17) | 4 | Local queue, retry logic | ✅ 100% |
| Scalability (NFR18-NFR21) | 4 | Supabase managed, CDN | ✅ 100% |
| Accessibility (NFR22-NFR26) | 5 | WCAG patterns, RTL support | ✅ 100% |
| Integration (NFR27-NFR32) | 6 | Service abstraction layer | ✅ 100% |
| Data Governance (NFR33-NFR36) | 4 | Retention policies, export/delete | ✅ 100% |

**All 36 NFRs are architecturally supported.**

### Implementation Readiness Validation ✅

**Decision Completeness:**

| Aspect | Status | Notes |
|--------|--------|-------|
| Technology versions documented | ✅ | All major dependencies versioned |
| Rationale provided | ✅ | Each decision includes why |
| Alternatives considered | ✅ | Starter options, state management |
| Cascading impacts noted | ✅ | Cross-component dependencies mapped |

**Structure Completeness:**

| Aspect | Status | Notes |
|--------|--------|-------|
| Complete directory tree | ✅ | All folders and key files defined |
| File naming patterns | ✅ | Consistent conventions documented |
| Component boundaries | ✅ | Clear layer separation |
| Integration points | ✅ | All external services mapped |

**Pattern Completeness:**

| Pattern Category | Status | Examples Provided |
|------------------|--------|-------------------|
| Database naming | ✅ | Tables, columns, indexes |
| API naming | ✅ | Endpoints, query keys |
| Code naming | ✅ | Files, components, functions |
| Error handling | ✅ | Four-tier approach |
| Loading states | ✅ | TanStack Query patterns |
| State updates | ✅ | Zustand patterns |

### Gap Analysis Results

**Critical Gaps:** None identified ✅

All critical architectural decisions are documented with sufficient detail for implementation.

**Important Gaps (Addressable post-MVP):**

| Gap | Priority | Mitigation |
|-----|----------|------------|
| Full offline mode | Phase 2 | Graceful degradation covers MVP |
| Real-time sync | Phase 2 | Polling on foreground sufficient |
| Advanced analytics | Post-MVP | Basic Mixpanel covers MVP needs |

**Nice-to-Have (Future Enhancement):**

- Storybook for component documentation
- Automated accessibility testing
- Performance monitoring dashboards
- A/B testing infrastructure

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed (57 FRs, 36 NFRs)
- [x] Scale and complexity assessed (medium, 10K DAU target)
- [x] Technical constraints identified (6-week MVP, solo dev)
- [x] Cross-cutting concerns mapped (7 concerns)

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established (25+ patterns)
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

The architecture provides comprehensive guidance for AI agents to implement the Safar MVP consistently. All functional and non-functional requirements are covered, technology choices are verified, and implementation patterns are well-documented.

**Key Strengths:**

1. **Clear technology stack** — No ambiguity about what to use
2. **Comprehensive patterns** — Agents will write consistent code
3. **Strong boundaries** — Clear separation of concerns
4. **Offline-first design** — Core learning loop works without network
5. **Scalable foundation** — Can grow from MVP to 100K users

**Areas for Future Enhancement:**

1. Full offline mode with downloadable content (Phase 2)
2. Real-time collaboration features (Phase 3)
3. Advanced analytics and experimentation (Post-MVP)
4. Performance monitoring and optimization tooling

### Implementation Handoff

**AI Agent Guidelines:**

1. Follow all architectural decisions exactly as documented
2. Use implementation patterns consistently across all components
3. Respect project structure and boundaries
4. Refer to this document for all architectural questions
5. Match existing code style in adjacent files
6. Use existing utility functions before creating new ones

**First Implementation Priority:**

```bash
# Step 1: Initialize project
npx create-expo-stack@latest safar-app \
  --expo-router \
  --nativewind \
  --supabase \
  --typescript \
  --npm

# Step 2: Install additional dependencies
cd safar-app
npm install @react-native-async-storage/async-storage
npm install react-native-reanimated
npm install expo-av expo-notifications expo-secure-store
npm install lottie-react-native
npm install react-native-purchases
npm install @sentry/react-native
npm install mixpanel-react-native
npm install zustand @tanstack/react-query
npm install zod react-hook-form @hookform/resolvers

# Step 3: Set up Supabase database schema
# Step 4: Configure environment variables
# Step 5: Implement auth flow
```

**Implementation Sequence:**

1. Project initialization and dependency setup
2. Supabase database schema and RLS policies
3. Authentication flow (sign-up, sign-in, OAuth)
4. Core state management (Zustand stores, TanStack Query)
5. Vocabulary data layer and caching
6. Learning session UI (WordCard, RootExplorer, Quiz)
7. Progress tracking with SM-2 and offline sync
8. Engagement features (streaks, XP, notifications)
9. Subscription integration (RevenueCat)
10. Analytics and error tracking (Mixpanel, Sentry)

