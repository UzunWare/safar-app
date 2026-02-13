# Story 6.5: Paywall Enforcement

Status: done

## Story

As a business,
I want content gated after trial expiration,
so that users subscribe to continue learning.

## Acceptance Criteria

1. **Given** my trial has expired and I have not subscribed, **When** I try to access a lesson, **Then** I see the paywall screen, I can preview the lesson content (first 2 words), and I am prompted to subscribe to continue
2. **Given** I am on the paywall, **When** I tap "Start Subscription", **Then** I am taken to the subscription options screen
3. **Given** I am a subscribed user, **When** I access any content, **Then** no paywall is shown and I have full access to all features
4. **Given** my subscription lapses (canceled, payment failed), **When** I try to access content, **Then** I see the paywall with renewal/resubscribe options

## Tasks / Subtasks

- [x] Task 1: Create PaywallGate component (AC: #1, #3)
  - [x] Wrapper component for protected content
  - [x] Check entitlement status
  - [x] Show paywall or children

- [x] Task 2: Create Paywall screen (AC: #1, #2)
  - [x] Create `app/paywall.tsx` or modal
  - [x] Show subscription benefits
  - [x] "Start Subscription" button

- [x] Task 3: Implement content preview (AC: #1)
  - [x] Allow preview of first 2 words
  - [x] Blur or lock remaining content
  - [x] Show "Subscribe to continue"

- [x] Task 4: Navigate to subscription options (AC: #2)
  - [x] Button links to subscription screen
  - [x] Or embeds subscription options

- [x] Task 5: Check entitlement on content access (AC: #3)
  - [x] Before loading lesson content
  - [x] Check isPremium or isTrialActive
  - [x] Allow if entitled

- [x] Task 6: Handle lapsed subscription (AC: #4)
  - [x] Detect expired subscription
  - [x] Show paywall with appropriate messaging
  - [x] Offer renewal/resubscribe

- [x] Task 7: Cache entitlement for offline (AC: #3)
  - [x] Store entitlement status locally
  - [x] Allow offline access if cached
  - [x] Expire cache after reasonable time

## Dev Notes

### Architecture Patterns

- **PaywallGate**: Wrapper component for protected screens
- **Entitlement Check**: RevenueCat as source of truth
- **Offline Caching**: Allow offline access for paying users

### Code Patterns

```typescript
// PaywallGate component
interface PaywallGateProps {
  children: React.ReactNode;
  preview?: React.ReactNode; // Content to show before paywall
}

export function PaywallGate({ children, preview }: PaywallGateProps) {
  const { isPremium, isTrialActive, isLoading } = useSubscription();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const hasAccess = isPremium || isTrialActive;

  if (!hasAccess) {
    return (
      <View className="flex-1">
        {preview}
        <PaywallOverlay />
      </View>
    );
  }

  return <>{children}</>;
}
```

```typescript
// Paywall screen
function PaywallScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white p-6">
      {/* Locked content indicator */}
      <View className="items-center py-8">
        <LockIcon className="w-16 h-16 text-gray-400" />
        <Text className="text-2xl font-bold mt-4">
          Subscribe to Continue
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Unlock all lessons and features with a subscription.
        </Text>
      </View>

      {/* Benefits */}
      <View className="mt-6 space-y-3">
        <BenefitItem text="All 120+ vocabulary words" />
        <BenefitItem text="Unlimited reviews" />
        <BenefitItem text="Progress synced across devices" />
        <BenefitItem text="Offline learning" />
      </View>

      {/* CTA */}
      <Pressable
        onPress={() => router.push('/subscription')}
        className="bg-blue-600 py-4 rounded-full mt-8"
      >
        <Text className="text-white text-center text-lg font-semibold">
          View Subscription Options
        </Text>
      </Pressable>

      {/* Restore purchases */}
      <Pressable
        onPress={() => router.push('/subscription?restore=true')}
        className="py-4 mt-4"
      >
        <Text className="text-blue-600 text-center">
          Restore Purchases
        </Text>
      </Pressable>
    </View>
  );
}
```

### Lesson Screen with PaywallGate

```typescript
// app/lesson/[id].tsx
function LessonScreen() {
  const { id } = useLocalSearchParams();
  const { data: lesson } = useLesson(id as string);

  // Preview: first 2 words
  const previewContent = (
    <View className="p-4">
      {lesson?.words.slice(0, 2).map(word => (
        <WordCard key={word.id} word={word} />
      ))}
      <BlurredContent />
    </View>
  );

  return (
    <PaywallGate preview={previewContent}>
      <LessonContent lesson={lesson} />
    </PaywallGate>
  );
}
```

### Lapsed Subscription Handling

```typescript
function PaywallOverlay() {
  const { customerInfo } = useSubscription();

  // Check if previously subscribed
  const wasSubscribed = customerInfo?.allPurchasedProductIdentifiers.length > 0;

  return (
    <View className="absolute inset-0 bg-white/95 justify-center p-6">
      <Text className="text-2xl font-bold text-center">
        {wasSubscribed ? 'Welcome Back!' : 'Subscribe to Continue'}
      </Text>

      <Text className="text-gray-600 text-center mt-2">
        {wasSubscribed
          ? 'Renew your subscription to continue learning.'
          : 'Start your subscription to unlock all content.'}
      </Text>

      {/* Subscription options */}
    </View>
  );
}
```

### References

- [Source: epics.md#Story 6.5: Paywall Enforcement]
- [Source: prd.md#FR44: Paywall enforcement after trial]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- 2026-02-12 senior review auto-fix pass completed.
- `npm test -- __tests__/subscription/PaywallGate.test.tsx __tests__/subscription/PaywallScreen.test.tsx __tests__/subscription/ContentPreview.test.tsx __tests__/subscription/useContentAccess.test.ts __tests__/subscription/entitlementService.test.ts __tests__/hooks/useLesson.test.ts --runInBand` passed (47 tests).
- `npx tsc --noEmit` passed.

### Completion Notes List

- **Task 1**: `PaywallGate` now supports preview rendering in both wrapper mode and standalone mode, so lesson paywall flow can show preview content before CTA.
- **Task 2**: `app/paywall.tsx` route wraps existing `Paywall` component in fullscreen mode and routes users to `/subscription`.
- **Task 3**: `ContentPreview` renders first two words plus locked remainder message. Lesson paywall flow now uses preview query data and displays it in standalone `PaywallGate`.
- **Task 4**: Paywall CTA copy is now "Start Subscription" and routes to `/subscription`.
- **Task 5**: Full lesson content fetch is now gated by entitlement state. Paywalled users only fetch limited preview words; full lesson query runs only when access is granted.
- **Task 6**: Lapsed subscription detection now checks RevenueCat entitlement history (`entitlements.all`) and sets `expired` state to trigger renewal messaging.
- **Task 7**: Entitlement cache behavior remains in place with 24-hour TTL and offline fallback.
- **Senior Review Auto-Fixes**: 4 findings fixed (preview rendering path, pre-gate full content fetch, missing expired detection path, missing regression coverage).

### Change Log

- 2026-02-12: Story 6.5 Paywall Enforcement implemented. 23 new tests across 3 test files. PaywallGate enhanced with wrapper/preview/lapsed support, paywall route created, ContentPreview component added, lesson screen updated with preview integration.
- 2026-02-12: Senior review YOLO auto-fixes applied. Added standalone preview rendering in `PaywallGate`, gated full lesson fetch behind entitlement, introduced `useLessonPreview` for limited paywall preview data, and implemented expired-entitlement detection from RevenueCat entitlement history. Added regression tests for standalone preview and expired detection.

### File List

**New files:**
- `safar-app/app/paywall.tsx` - Paywall screen route
- `safar-app/components/subscription/ContentPreview.tsx` - Word preview with blur overlay
- `safar-app/__tests__/subscription/PaywallGate.test.tsx` - PaywallGate tests (11)
- `safar-app/__tests__/subscription/PaywallScreen.test.tsx` - Paywall screen tests (6)
- `safar-app/__tests__/subscription/ContentPreview.test.tsx` - Content preview tests (7)

**Modified files:**
- `safar-app/components/subscription/PaywallGate.tsx` - Standalone preview rendering and "Start Subscription" CTA copy
- `safar-app/app/lesson/[id].tsx` - Full lesson fetch now gated by entitlement; paywall preview powered by limited preview query
- `safar-app/lib/hooks/useLesson.ts` - Added optional `enabled` control and new `useLessonPreview` query for limited word preview
- `safar-app/lib/subscription/entitlementService.ts` - Added expired entitlement detection using RevenueCat entitlement history
- `safar-app/__tests__/subscription/PaywallGate.test.tsx` - Added standalone preview regression test
- `safar-app/__tests__/subscription/entitlementService.test.ts` - Added expired entitlement regression test

### Senior Developer Review (AI)

**Outcome:** Approved after auto-fixes.

**Findings fixed:**

1. **HIGH** - Preview content was not rendered in standalone paywall mode, so AC #1 "first 2 words preview" failed in lesson gating flow.
   - Fixed in `safar-app/components/subscription/PaywallGate.tsx`.
2. **HIGH** - Full lesson content query executed before entitlement gating, violating Task 5 requirement to check access before loading lesson content.
   - Fixed in `safar-app/app/lesson/[id].tsx` and `safar-app/lib/hooks/useLesson.ts`.
3. **HIGH** - Lapsed subscription path was unreachable because entitlement service never set `entitlementStatus: expired` from RevenueCat responses.
   - Fixed in `safar-app/lib/subscription/entitlementService.ts`.
4. **MEDIUM** - Missing regression coverage for standalone preview and expired-entitlement branch allowed the above gaps to ship.
   - Fixed in `safar-app/__tests__/subscription/PaywallGate.test.tsx` and `safar-app/__tests__/subscription/entitlementService.test.ts`.

**Validation:**

- Git discrepancy audit was not available in this workspace snapshot because no `.git` repository metadata was present.
- Targeted Jest suites passed (47 tests).
- TypeScript check passed (`npx tsc --noEmit`).
