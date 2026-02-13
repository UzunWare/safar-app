# Story 6.7: Subscription Management

Status: done

## Story

As a subscriber,
I want to view and manage my subscription,
so that I can cancel or change my plan if needed.

## Acceptance Criteria

1. **Given** I am a subscribed user, **When** I navigate to Profile > Subscription, **Then** I see my current plan (Monthly/Annual), my renewal date, and a "Manage Subscription" button
2. **Given** I tap "Manage Subscription", **When** the action is triggered, **Then** I am deep-linked to the native subscription management: iOS goes to App Store subscription settings, Android goes to Play Store subscription settings
3. **Given** I cancel my subscription externally, **When** my current period ends, **Then** the app detects the status change and my access reverts to free/trial-expired state

## Tasks / Subtasks

- [x] Task 1: Create subscription status screen (AC: #1)
  - [x] Create subscription section in profile
  - [x] Display current plan name
  - [x] Display renewal/expiration date

- [x] Task 2: Display subscription details (AC: #1)
  - [x] Show "Monthly" or "Annual" plan
  - [x] Show price per period
  - [x] Show next billing date

- [x] Task 3: Implement "Manage Subscription" button (AC: #2)
  - [x] Add button to subscription screen
  - [x] Deep link to native subscription settings

- [x] Task 4: Handle iOS deep link (AC: #2)
  - [x] Open Settings > Apple ID > Subscriptions
  - [x] Use Linking.openURL with appropriate scheme

- [x] Task 5: Handle Android deep link (AC: #2)
  - [x] Open Play Store subscription management
  - [x] Use Linking.openURL with Play Store URL

- [x] Task 6: Detect subscription status changes (AC: #3)
  - [x] Listen for customer info updates
  - [x] Check on app foreground
  - [x] Update local state on change

- [x] Task 7: Handle subscription cancellation (AC: #3)
  - [x] Detect when subscription expires
  - [x] Update isPremium state to false
  - [x] Show appropriate UI

## Dev Notes

### Architecture Patterns

- **Native Management**: Platform rules require native subscription management
- **Status Syncing**: RevenueCat syncs status automatically
- **Graceful Downgrade**: Handle expiration without data loss

### Code Patterns

```typescript
// Subscription status view
function SubscriptionStatusView() {
  const { customerInfo, isPremium } = useSubscription();

  if (!isPremium) {
    return <SubscribePrompt />;
  }

  const entitlement = customerInfo?.entitlements.active['premium'];
  const plan = getPlanName(entitlement?.productIdentifier);
  const renewalDate = entitlement?.expirationDate
    ? new Date(entitlement.expirationDate)
    : null;

  return (
    <View className="p-4 bg-white rounded-xl">
      <Text className="text-sm text-gray-500">Current Plan</Text>
      <Text className="text-xl font-bold">{plan}</Text>

      {renewalDate && (
        <>
          <Text className="text-sm text-gray-500 mt-4">
            {entitlement?.willRenew ? 'Renews' : 'Expires'}
          </Text>
          <Text className="text-lg">
            {format(renewalDate, 'MMMM d, yyyy')}
          </Text>
        </>
      )}

      <Pressable
        onPress={openSubscriptionManagement}
        className="mt-6 py-3 border border-blue-600 rounded-lg"
      >
        <Text className="text-blue-600 text-center font-medium">
          Manage Subscription
        </Text>
      </Pressable>
    </View>
  );
}
```

```typescript
// Deep link to native subscription management
import { Linking, Platform } from 'react-native';

async function openSubscriptionManagement() {
  if (Platform.OS === 'ios') {
    // iOS: Open App Store subscription settings
    await Linking.openURL('https://apps.apple.com/account/subscriptions');
  } else {
    // Android: Open Play Store subscription management
    await Linking.openURL(
      'https://play.google.com/store/account/subscriptions'
    );
  }
}
```

### Subscription Status Detection

```typescript
// In app root or subscription hook
useEffect(() => {
  // Listen for customer info updates from RevenueCat
  const listener = Purchases.addCustomerInfoUpdateListener((info) => {
    const isPremium = info.entitlements.active['premium'] !== undefined;
    useSubscriptionStore.getState().setPremium(isPremium);

    if (!isPremium) {
      // Subscription lapsed
      showSubscriptionExpiredToast();
    }
  });

  return () => listener.remove();
}, []);

// Also check on app foreground
useEffect(() => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      refreshSubscriptionStatus();
    }
  });

  return () => subscription.remove();
}, []);
```

### Plan Name Mapping

```typescript
function getPlanName(productId: string | undefined): string {
  if (!productId) return 'Unknown';

  if (productId.includes('monthly')) return 'Monthly';
  if (productId.includes('annual')) return 'Annual';

  return 'Premium';
}
```

### References

- [Source: epics.md#Story 6.7: Subscription Management]
- [Source: prd.md#FR46-FR47: View and manage subscription]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Node.js toLocaleDateString() unreliable in Jest - switched to manual UTC month name formatter for consistent date display.
- AppState.addEventListener returns undefined in default React Native Jest mock - added optional chaining (?.remove()) for cleanup safety.

### Completion Notes List

- Task 1: Enhanced CurrentPlanView in subscription.tsx with renewal/expiration date display. Exposed expirationDate from useSubscription hook (sourced from subscription store). Added formatRenewalDate() helper using UTC month names for reliable formatting across environments. 3 new tests added.
- Task 2: Added price per period display ($34.99/year, $4.99/month) and next billing date to CurrentPlanView. Computed currentPriceString from packages matching current plan via useMemo. 4 new tests added.
- Tasks 3-5: Already fully implemented in prior stories (6.3/6.4/6.6). Manage Subscription button with platform deep links (iOS App Store, Android Play Store) via safeOpenURL helper. Verified by existing tests.
- Task 6: Added AppState foreground listener to useSubscription hook - calls checkEntitlements() when app returns to foreground. Combined with existing Purchases.addCustomerInfoUpdateListener. 3 new tests added.
- Task 7: Added subscription expiration banner to non-premium view when entitlementStatus === expired. Shows "Your subscription has expired" with "Re-subscribe to continue learning" prompt. Uses Divine Geometry error palette. 3 new tests added.
- Total new tests: 13 tests across 2 test files
- Regression: 77 suites, 937 tests passing (excluding 6 pre-existing screen test failures unrelated to subscription)

### Senior Developer Review (AI)

Reviewer: Emrek
Date: 2026-02-12
Outcome: Changes requested and fixed in-place (YOLO mode)

Findings
- [HIGH] Restore Purchases was hidden when offerings failed to load (packages.length === 0), blocking restore path in degraded states and weakening App Store compliance expectations. Evidence: safar-app/app/subscription.tsx.
- [MEDIUM] Renewal date formatting accepted invalid date strings and could render broken UI text (undefined NaN, NaN) instead of a safe fallback. Evidence: safar-app/app/subscription.tsx.
- [LOW] Unused useRef import introduced avoidable lint noise and reduced code hygiene. Evidence: safar-app/lib/hooks/useSubscription.ts.

Fixes Applied
- Always render restore action for non-premium users when not loading; keep subscribe button conditional on available packages.
- Hardened renewal date formatter with invalid-date guard and hid renewal row when date is invalid.
- Added regression tests for restore availability with empty packages and invalid expiration-date handling.
- Removed unused useRef import from useSubscription hook.

Verification
- Ran: npm test -- __tests__/subscription/SubscriptionScreen.test.tsx __tests__/subscription/useSubscription.test.ts
- Result: 2 passed suites, 77 passed tests.
- Ran: npx eslint app/subscription.tsx lib/hooks/useSubscription.ts __tests__/subscription/SubscriptionScreen.test.tsx
- Result: 0 warnings, 0 errors.

### Change Log

- 2026-02-12: Story 6.7 implementation complete - subscription management with renewal dates, price display, AppState foreground refresh, and expiration handling
- 2026-02-12: Senior review fixes applied - restore availability when plans are unavailable, invalid renewal-date guard, and regression test additions

### File List

- safar-app/lib/hooks/useSubscription.ts (modified - added expirationDate return, AppState foreground listener, removed unused import in review pass)
- safar-app/app/subscription.tsx (modified - added renewal date/price display/expiration banner, plus restore-availability and invalid-date hardening in review pass)
- safar-app/__tests__/subscription/SubscriptionScreen.test.tsx (modified - subscription management coverage including review regression tests)
- safar-app/__tests__/subscription/useSubscription.test.ts (modified - 3 new tests for Task 6)
