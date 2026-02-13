# Story 6.6: Purchase Restoration

Status: done

## Story

As a returning user,
I want to restore my previous purchase,
so that I can access premium content on a new device.

## Acceptance Criteria

1. **Given** I previously subscribed on another device or after reinstall, **When** I tap "Restore Purchases" on the subscription screen, **Then** RevenueCat syncs my purchase history; if I have an active subscription, my entitlement is restored; and I see "Subscription restored!" confirmation
2. **Given** I tap "Restore Purchases" with no previous subscription, **When** the restore completes, **Then** I see "No active subscription found" and I am offered subscription options
3. **Given** restore fails due to network error, **When** the error occurs, **Then** I see "Couldn't restore purchases. Check your connection and try again."

## Tasks / Subtasks

- [x] Task 1: Add "Restore Purchases" button (AC: #1)
  - [x] Add to subscription screen
  - [x] Add to paywall
  - [x] Style appropriately (secondary action)

- [x] Task 2: Implement restore functionality (AC: #1)
  - [x] Call Purchases.restorePurchases()
  - [x] Wait for result
  - [x] Update entitlement state

- [x] Task 3: Handle successful restore (AC: #1)
  - [x] Check if premium entitlement restored
  - [x] Show success message
  - [x] Update UI to reflect premium status

- [x] Task 4: Handle no subscription found (AC: #2)
  - [x] Detect empty restore result
  - [x] Show "No active subscription found"
  - [x] Keep user on subscription screen

- [x] Task 5: Handle restore errors (AC: #3)
  - [x] Catch network errors
  - [x] Show user-friendly error message
  - [x] Offer retry option

- [x] Task 6: Show loading state during restore
  - [x] Disable button during restore
  - [x] Show loading indicator
  - [x] Indicate progress

## Dev Notes

### Architecture Patterns

- **App Store Requirement**: Restore is required for iOS approval
- **RevenueCat**: Handles sync with App Store/Play Store
- **User Feedback**: Clear messaging for all outcomes

### Code Patterns

```typescript
// Restore purchases
async function restorePurchases() {
  setIsRestoring(true);

  try {
    const customerInfo = await Purchases.restorePurchases();

    if (customerInfo.entitlements.active['premium']) {
      // Subscription restored
      useSubscriptionStore.getState().setPremium(true);

      Toast.show({
        type: 'success',
        title: 'Subscription restored!',
        message: 'Welcome back to Safar Premium.',
      });

      // Navigate away from paywall
      router.back();
    } else {
      // No active subscription
      Toast.show({
        type: 'info',
        title: 'No active subscription',
        message: 'No previous subscription was found for your account.',
      });
    }
  } catch (error: any) {
    // Network or other error
    Toast.show({
      type: 'error',
      title: 'Restore failed',
      message: "Couldn't restore purchases. Check your connection and try again.",
      action: {
        label: 'Retry',
        onPress: restorePurchases,
      },
    });
  } finally {
    setIsRestoring(false);
  }
}
```

```typescript
// Restore button component
function RestorePurchasesButton() {
  const [isRestoring, setIsRestoring] = useState(false);

  return (
    <Pressable
      onPress={() => restorePurchases()}
      disabled={isRestoring}
      className="py-4"
    >
      {isRestoring ? (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator size="small" />
          <Text className="text-gray-600 ml-2">Restoring...</Text>
        </View>
      ) : (
        <Text className="text-blue-600 text-center">
          Restore Purchases
        </Text>
      )}
    </Pressable>
  );
}
```

### Placement

Restore button should appear:
1. On subscription options screen (bottom)
2. On paywall screen
3. Accessible from settings

### App Store Compliance

Apple requires a visible way to restore purchases. The button must:
- Be clearly labeled
- Be accessible without purchase
- Work as expected

### References

- [Source: epics.md#Story 6.6: Purchase Restoration]
- [Source: prd.md#FR45: Restore previous purchases]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- 2026-02-12: Senior review YOLO auto-fix pass completed.
- `npm run test -- --runTestsByPath __tests__/subscription/useRestore.test.ts __tests__/subscription/SubscriptionScreen.test.tsx __tests__/subscription/Paywall.test.tsx __tests__/subscription/PaywallScreen.test.tsx __tests__/subscription/PaywallGate.test.tsx` passed (5 suites, 108 tests).

### Completion Notes List

- Task 1: Added "Restore Purchases" button to subscription screen (below subscribe button) and Paywall component. Styled as secondary text action using Divine Geometry palette (muted cream text).
- Task 2: Created `useRestore` hook (`lib/hooks/useRestore.ts`) following same pattern as `usePurchase`. Calls `Purchases.restorePurchases()` and updates entitlement state via `checkEntitlements()`.
- Task 3: Hook returns `restored=true` on successful premium entitlement restore. Subscription screen shows "Subscription restored!" success message with emerald/teal banner.
- Task 4: Hook returns `noSubscription=true` when no active entitlement found. Subscription screen shows "No active subscription found" with gold-accent info banner.
- Task 5: Hook catches all errors and returns user-friendly message. Subscription screen shows error banner with "Retry" button that clears error and retries restore.
- Task 6: `isRestoring` state disables button, shows ActivityIndicator spinner with "Restoring..." text during restore operation.
- All 3 Acceptance Criteria verified through 16 hook unit tests + 11 subscription screen integration tests + 3 paywall component tests.
- Full regression: 77 suites, 920 tests passing (0 regressions).
- Senior review auto-fixes resolved missing paywall restore wiring, ensured visible success confirmation in subscribed view after restore, hardened entitlement ID usage in hook logic, and added regression coverage for paywall-route restore handling.

### Change Log

- 2026-02-12: Story 6.6 implementation complete. Created useRestore hook, added restore button to subscription screen and paywall, integrated all restore states (success, no sub, error, loading).
- 2026-02-12: Senior review YOLO auto-fixes applied. Wired paywall route restore action/state, surfaced restore success in current-plan view, improved restore hook entitlement handling, and expanded regression tests.

### File List

**New files:**
- `safar-app/lib/hooks/useRestore.ts` - Restore purchases hook
- `safar-app/__tests__/subscription/useRestore.test.ts` - useRestore hook tests (16 tests)

**Modified files:**
- `safar-app/lib/hooks/useRestore.ts` - Uses shared `ENTITLEMENT_ID` and tolerates non-fatal entitlement refresh failures after restore success
- `safar-app/app/subscription.tsx` - Shows restore confirmation in subscribed/current-plan view
- `safar-app/components/subscription/Paywall.tsx` - Restore UX/state support (loading, disabled state, status messaging, retry)
- `safar-app/app/paywall.tsx` - Wired paywall restore button to `useRestore` runtime flow and retry behavior
- `safar-app/__tests__/subscription/useRestore.test.ts` - Updated entitlement service mock with shared entitlement ID constant
- `safar-app/__tests__/subscription/SubscriptionScreen.test.tsx` - Added subscribed-view restore confirmation regression test
- `safar-app/__tests__/subscription/Paywall.test.tsx` - Added restore loading/disabled-state regression tests
- `safar-app/__tests__/subscription/PaywallScreen.test.tsx` - Added restore interaction regression test

### Senior Developer Review (AI)

**Outcome:** Approved after auto-fixes.

**Findings fixed:**

1. **CRITICAL** - `Restore Purchases` on paywall route was a no-op because no runtime restore handler was wired from `app/paywall.tsx`.
2. **HIGH** - Successful restore confirmation was not visible in subscribed mode because `SubscriptionScreen` switched to current-plan view before rendering the success state.
3. **MEDIUM** - Restore flow relied on a hardcoded entitlement key and lacked paywall-route regression coverage, increasing risk of silent entitlement regressions.

**Validation:**

- Targeted subscription/paywall suite passed: 5 suites, 108 tests.
- Git discrepancy audit unavailable in this workspace snapshot because `.git` metadata is not present at project root.
