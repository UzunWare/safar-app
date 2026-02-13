# Story 6.3: Subscription Options Display

Status: done

## Story

As a user,
I want to see subscription options clearly,
so that I can choose the plan that works for me.

## Acceptance Criteria

1. **Given** I tap "Subscribe" or encounter the paywall, **When** the subscription screen displays, **Then** I see both subscription options: Monthly ($4.99/month) and Annual ($34.99/year with "Save 42%" badge), annual is highlighted as the recommended option, and I see what's included (all pathways, unlimited reviews, etc.)
2. **Given** I view the subscription screen, **When** looking at the terms, **Then** I see clear auto-renewal disclosure, links to Terms of Service and Privacy Policy, and this meets App Store/Play Store requirements
3. **Given** I am already subscribed, **When** opening the subscription screen, **Then** I see my current plan and a "Manage Subscription" option

## Tasks / Subtasks

- [x] Task 1: Create subscription screen (AC: #1)
  - [x] Create `app/subscription.tsx` screen
  - [x] Design layout for plan options
  - [x] Fetch packages from RevenueCat

- [x] Task 2: Display subscription options (AC: #1)
  - [x] Create SubscriptionOption component
  - [x] Show monthly: $4.99/mo
  - [x] Show annual: $34.99/yr with savings badge

- [x] Task 3: Calculate and display savings (AC: #1)
  - [x] Calculate savings percentage (42%)
  - [x] Display "Save 42%" badge on annual
  - [x] Highlight annual as recommended

- [x] Task 4: List included features (AC: #1)
  - [x] "All learning pathways"
  - [x] "Unlimited reviews"
  - [x] "Offline access"
  - [x] "No ads"

- [x] Task 5: Add required disclosures (AC: #2)
  - [x] Auto-renewal disclosure text
  - [x] Link to Terms of Service
  - [x] Link to Privacy Policy
  - [x] Text required by App Store/Play Store

- [x] Task 6: Handle already subscribed state (AC: #3)
  - [x] Check current subscription status
  - [x] Show current plan
  - [x] Show "Manage Subscription" button

- [x] Task 7: Create Paywall component
  - [x] Reusable paywall that includes subscription options
  - [x] Can be shown as modal or full screen
  - [x] Dismiss option

## Dev Notes

### Architecture Patterns

- **RevenueCat Packages**: Fetch real prices dynamically
- **Localized Prices**: RevenueCat provides localized pricing
- **App Store Compliance**: Required disclosures and links

### Code Patterns

```typescript
// Subscription screen
function SubscriptionScreen() {
  const { packages, isPremium, customerInfo } = useSubscription();
  const router = useRouter();

  const monthlyPackage = packages.find(p => p.packageType === 'MONTHLY');
  const annualPackage = packages.find(p => p.packageType === 'ANNUAL');

  // Calculate savings
  const monthlyPrice = monthlyPackage?.product.price || 4.99;
  const annualPrice = annualPackage?.product.price || 34.99;
  const annualMonthlyPrice = annualPrice / 12;
  const savingsPercent = Math.round((1 - annualMonthlyPrice / monthlyPrice) * 100);

  if (isPremium) {
    return <CurrentPlanView customerInfo={customerInfo} />;
  }

  return (
    <ScrollView className="flex-1 p-6">
      {/* Header */}
      <Text className="text-3xl font-bold text-center">
        Unlock All Content
      </Text>

      {/* Features */}
      <View className="mt-6 space-y-3">
        <FeatureItem icon="📚" text="All learning pathways" />
        <FeatureItem icon="🔄" text="Unlimited reviews" />
        <FeatureItem icon="📴" text="Offline access" />
        <FeatureItem icon="🚫" text="No advertisements" />
      </View>

      {/* Subscription options */}
      <View className="mt-8 space-y-4">
        {/* Annual - Recommended */}
        <SubscriptionOption
          title="Annual"
          price={annualPackage?.product.priceString || '$34.99'}
          priceDetail="per year"
          badge={`Save ${savingsPercent}%`}
          isRecommended={true}
          onSelect={() => handlePurchase(annualPackage)}
        />

        {/* Monthly */}
        <SubscriptionOption
          title="Monthly"
          price={monthlyPackage?.product.priceString || '$4.99'}
          priceDetail="per month"
          onSelect={() => handlePurchase(monthlyPackage)}
        />
      </View>

      {/* Legal disclosures */}
      <View className="mt-8">
        <Text className="text-xs text-gray-500 text-center">
          Subscription automatically renews unless canceled at least 24 hours
          before the end of the current period. Your account will be charged
          for renewal within 24 hours prior to the end of the current period.
        </Text>

        <View className="flex-row justify-center space-x-4 mt-4">
          <Pressable onPress={() => openUrl(TERMS_URL)}>
            <Text className="text-xs text-blue-600">Terms of Service</Text>
          </Pressable>
          <Pressable onPress={() => openUrl(PRIVACY_URL)}>
            <Text className="text-xs text-blue-600">Privacy Policy</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
```

```typescript
// Subscription option component
interface SubscriptionOptionProps {
  title: string;
  price: string;
  priceDetail: string;
  badge?: string;
  isRecommended?: boolean;
  onSelect: () => void;
}

function SubscriptionOption({
  title,
  price,
  priceDetail,
  badge,
  isRecommended,
  onSelect,
}: SubscriptionOptionProps) {
  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        'p-4 rounded-xl border-2',
        isRecommended
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200'
      )}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center">
            <Text className="text-lg font-semibold">{title}</Text>
            {badge && (
              <View className="ml-2 bg-green-500 px-2 py-0.5 rounded">
                <Text className="text-xs text-white font-medium">{badge}</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-500">{priceDetail}</Text>
        </View>
        <Text className="text-2xl font-bold">{price}</Text>
      </View>
      {isRecommended && (
        <Text className="text-blue-600 text-sm mt-2">
          Recommended
        </Text>
      )}
    </Pressable>
  );
}
```

### Required Disclosures

Apple and Google require:
- Clear subscription terms
- Auto-renewal notice
- Price and billing period
- Link to Terms of Service
- Link to Privacy Policy

### References

- [Source: epics.md#Story 6.3: Subscription Options Display]
- [Source: prd.md#FR42: View subscription options]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed pre-existing `removeCustomerInfoUpdateListener` mock gap in jest.setup.ts
- Linking mock required `jest.spyOn(Linking, 'openURL')` approach instead of module path mock
- Router mock required inline function wrappers to avoid hoisting issues with `const` declarations

### Completion Notes List

- **Task 1**: Rewrote `app/subscription.tsx` from basic scaffold to full subscription display with header, features, options, disclosures, and subscribed state handling. Uses `useSubscription` hook to fetch RevenueCat packages.
- **Task 2**: Created `SubscriptionOption` component with Divine Geometry styling — gold/cream/emerald palette, Fraunces headings, Outfit body text. Supports `badge`, `isRecommended`, `isSelected` props. 9 tests.
- **Task 3**: Dynamic savings calculation via `calculateSavingsPercent()` — computes monthly-equivalent annual price and derives percent savings. Displays "Save 42%" badge on annual option. "Recommended" label below annual.
- **Task 4**: Four-item features list (All learning pathways, Unlimited reviews, Offline access, No ads) with gold checkmark icons. 5 tests.
- **Task 5**: Full App Store/Play Store compliance: auto-renewal disclosure text, payment charge notice, Terms of Service and Privacy Policy links using `Linking.openURL`. Platform-specific "Apple ID" / "Google Play" text. 6 tests.
- **Task 6**: `CurrentPlanView` component shows plan label, trial status, and "Manage Subscription" button linking to platform-specific subscription management URLs. Premium users see this instead of subscription options. 5 tests.
- **Task 7**: `Paywall` component with `variant="fullscreen"|"modal"` prop. Includes subscription options, features, dismiss button, and subscribe CTA. Modal mode wraps in React Native Modal. 12 tests.
- **Mock fix**: Added `removeCustomerInfoUpdateListener` to global jest.setup.ts RevenueCat mock, fixing 8 pre-existing `useSubscription.test.ts` failures.
- **AI Review fixes (2026-02-12)**: Fixed subscribed-user fallback rendering when plan identifier is unknown, added safe external URL opening guards (`canOpenURL` + error handling), clamped savings calculation to prevent negative badge values, expanded plan detection to cover yearly/month aliases, and strengthened tests for URL targets and subscribe plan selection.

### Change Log

- 2026-02-12: Story 6.3 implemented — subscription options display with 51 new tests, plus 8 pre-existing test fixes
- 2026-02-12: Senior code review fixes applied - subscribed fallback bug, URL safety, savings edge cases, and test coverage gaps

### File List

**New files:**
- `safar-app/components/subscription/SubscriptionOption.tsx`
- `safar-app/components/subscription/Paywall.tsx`
- `safar-app/__tests__/subscription/SubscriptionScreen.test.tsx`
- `safar-app/__tests__/subscription/SubscriptionOption.test.tsx`
- `safar-app/__tests__/subscription/Paywall.test.tsx`

**Modified files:**
- `safar-app/app/subscription.tsx`
- `safar-app/components/subscription/Paywall.tsx`
- `safar-app/lib/subscription/entitlementService.ts`
- `safar-app/__tests__/subscription/entitlementService.test.ts`
- `safar-app/__tests__/setup/jest.setup.ts`

## Senior Developer Review (AI)

### Reviewer

Emrek

### Date

2026-02-12

### Outcome

Changes Requested -> Fixed

### Findings Summary

- **INFO:** Git discrepancy audit could not be performed because no `.git` repository is present in this workspace snapshot.
- **HIGH (fixed):** Subscribed users could fall back to paywall options when entitlement was active but `currentPlan` could not be inferred from product ID.
- **MEDIUM (fixed):** External links (`Terms`, `Privacy`, `Manage Subscription`) used raw `Linking.openURL` without guard/error handling, risking unhandled promise rejections.
- **MEDIUM (fixed):** Savings badge could render invalid negative percentages when annual pricing was not actually discounted.
- **MEDIUM (fixed):** Tests did not verify critical behaviors (exact link targets, subscribe plan callback behavior, and yearly plan identifier detection).

### Validation Performed

- Ran: `npm test -- --runInBand __tests__/subscription/SubscriptionScreen.test.tsx __tests__/subscription/Paywall.test.tsx __tests__/subscription/entitlementService.test.ts`
- Result: 3 test suites passed, 58 tests passed.
