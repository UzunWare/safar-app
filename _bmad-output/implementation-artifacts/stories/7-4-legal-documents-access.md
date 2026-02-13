# Story 7.4: Legal Documents Access

Status: done

## Story

As a user,
I want to access the privacy policy and terms of service,
so that I can understand how my data is used.

## Acceptance Criteria

1. **Given** I am in Settings > Legal, **When** I view the legal section, **Then** I see links to: Privacy Policy and Terms of Service
2. **Given** I tap "Privacy Policy", **When** the action is triggered, **Then** I am navigated to the privacy policy (in-app webview or external browser) and the policy is up-to-date and accessible
3. **Given** I tap "Terms of Service", **When** the action is triggered, **Then** I am navigated to the terms of service and the terms are up-to-date and accessible

## Tasks / Subtasks

- [x] Task 1: Create legal section in settings (AC: #1)
  - [x] Add Legal section to settings screen
  - [x] Add Privacy Policy row
  - [x] Add Terms of Service row

- [x] Task 2: Configure legal URLs (AC: #2, #3)
  - [x] Add privacyPolicyUrl to constants/config.ts
  - [x] Add termsOfServiceUrl to constants/config.ts
  - [x] Use hosted URLs (website)

- [x] Task 3: Implement link opening (AC: #2, #3)
  - [x] Use Linking.openURL for external browser navigation
  - [x] Handle errors gracefully with Alert fallback

- [x] Task 4: Ensure documents are accessible (AC: #2, #3)
  - [x] Configure privacy policy URL (https://safar.app/privacy)
  - [x] Configure terms of service URL (https://safar.app/terms)
  - [x] Error handling for unreachable documents (Alert with fallback message)

## Dev Notes

### Architecture Patterns

- **External Browser**: Simplest approach, opens in Safari/Chrome
- **WebView**: Keeps user in app, but more complex
- **Hosted Documents**: Privacy/Terms on web for easy updates

### Code Patterns (Actual Implementation)

```typescript
// constants/config.ts - centralized URL config
export const config = {
  privacyPolicyUrl: 'https://safar.app/privacy',
  termsOfServiceUrl: 'https://safar.app/terms',
  supportEmail: 'support@safar.app',
} as const;
```

```typescript
// settings.tsx - safe URL opening with error handling
import { Linking, Alert } from 'react-native';
import { config } from '@/constants/config';

async function safeOpenUrl(url: string, title: string, fallbackMessage: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) { Alert.alert(title, fallbackMessage); return; }
    await Linking.openURL(url);
  } catch {
    Alert.alert(title, fallbackMessage);
  }
}

// Usage in Legal section
<SettingsNavRow
  label="Privacy Policy"
  onPress={() => handleOpenLegal(config.privacyPolicyUrl)}
/>
```

### Alternative: In-App WebView

```typescript
// If using in-app WebView
function LegalDocumentScreen() {
  const { type } = useLocalSearchParams<{ type: 'privacy' | 'terms' }>();
  const url = type === 'privacy'
    ? LEGAL_URLS.PRIVACY_POLICY
    : LEGAL_URLS.TERMS_OF_SERVICE;

  return (
    <WebView
      source={{ uri: url }}
      style={{ flex: 1 }}
    />
  );
}

// Navigate to in-app view
router.push(`/legal?type=privacy`);
```

### App Store Requirements

- Privacy policy must be accessible from within the app
- Must be current and accurately describe data practices
- Should be mobile-readable
- Required before app submission

### References

- [Source: epics.md#Story 7.4: Legal Documents Access]
- [Source: prd.md#FR50-FR51: Privacy policy and terms access]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None - implementation was straightforward with no blocking issues.

### Completion Notes List

- Legal section was already implemented in settings.tsx (Story 7.1 scaffold) with Privacy Policy and Terms of Service rows using SettingsNavRow components
- Refactored URL constants from inline settings.tsx definitions to centralized `constants/config.ts` (config.privacyPolicyUrl, config.termsOfServiceUrl, config.supportEmail)
- Link opening uses `Linking.openURL` (external browser) with `safeOpenUrl` wrapper that checks `Linking.canOpenURL` first and shows Alert on failure
- Chose Linking.openURL over expo-web-browser as it's simpler and uses the system default browser (Safari/Chrome) as recommended in Dev Notes
- Task 4 (hosting documents) is an infrastructure task outside code scope — URLs are configured and error handling is in place for unreachable documents
- All 15 new tests pass (11 screen integration + 4 config unit tests)
- No regressions introduced — 6 pre-existing test failures unrelated to this story (paywall subscription mock issues in learn, lesson, quiz, frequency-lesson, review-session, root-lesson tests)

### Change Log

- 2026-02-13: Story 7.4 implementation — moved legal URLs to config.ts, wrote 15 tests covering all 3 ACs plus error handling
- 2026-02-13: Code review fixes — removed redundant lucide mock, replaced hardcoded URLs with config imports in tests, removed redundant URL config tests, added openURL-throws test coverage, updated Dev Notes to match actual implementation

### File List

- `safar-app/constants/config.ts` (modified) — added privacyPolicyUrl, termsOfServiceUrl, supportEmail
- `safar-app/app/settings.tsx` (modified) — imported config, replaced inline URL constants with config references
- `safar-app/__tests__/screens/settings-legal.test.tsx` (new) — 11 tests for legal section rendering and URL opening
- `safar-app/__tests__/constants/config-legal.test.ts` (new) — 4 tests for URL configuration validation
