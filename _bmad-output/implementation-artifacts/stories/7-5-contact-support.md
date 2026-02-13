# Story 7.5: Contact Support

Status: done

## Story

As a user,
I want to contact support,
so that I can get help with issues or provide feedback.

## Acceptance Criteria

1. **Given** I am in Settings > Support, **When** I tap "Contact Support", **Then** I can send an email to support and the email is pre-filled with: To: support@safar-app.com (or configured email), Subject: "Safar App Support", Body: App version, device info, user ID (anonymized)
2. **Given** no email client is configured, **When** I tap "Contact Support", **Then** I see the support email address to copy and guidance to email manually

## Tasks / Subtasks

- [x] Task 1: Create support section in settings (AC: #1)
  - [x] Add Support section to settings screen
  - [x] Add "Contact Support" row
  - [x] Add app version display

- [x] Task 2: Configure support email (AC: #1)
  - [x] Add SUPPORT_EMAIL to constants/config.ts
  - [x] Configure email subject line
  - [x] Set up body template

- [x] Task 3: Implement email composition (AC: #1)
  - [x] Use expo-mail-composer or Linking
  - [x] Pre-fill recipient, subject, body
  - [x] Include diagnostic info

- [x] Task 4: Gather diagnostic info (AC: #1)
  - [x] Get app version from app.json
  - [x] Get device info (platform, OS version)
  - [x] Get anonymized user ID (first 8 chars)
  - [x] Don't include PII

- [x] Task 5: Handle no email client (AC: #2)
  - [x] Detect if email client available
  - [x] Show fallback modal with email address
  - [x] Allow copying email address

## Dev Notes

### Architecture Patterns

- **Linking.openURL with mailto:** Used `Linking.openURL` with mailto: URL including query params for subject and body — simpler than expo-mail-composer, no extra dependency needed
- **Fallback Modal**: When email client unavailable, shows a styled modal with the support email and a copy-to-clipboard button using `expo-clipboard`
- **Diagnostic Info**: Gathers app version (from expo-constants), platform, OS version, and anonymized user ID (first 8 chars only) — no PII exposed

### Code Patterns

```typescript
// constants/config.ts - centralized support config
export const config = {
  supportEmail: 'support@safar.app',
  supportSubject: 'Safar App Support',
} as const;
```

```typescript
// getDiagnosticInfo() in settings.tsx
// Builds email body with diagnostic info using:
// - Constants.expoConfig?.version for app version
// - Platform.OS and Platform.Version for device info
// - userId.substring(0, 8) for anonymized user ID

// handleContactSupport() constructs mailto: URL:
// mailto:{email}?subject={encoded_subject}&body={encoded_body}
// Falls back to modal with copy button if Linking.canOpenURL fails
```

### Diagnostic Info (No PII)

| Info | Included | Reason |
|------|----------|--------|
| App version | Yes | Debugging |
| Device platform | Yes | Debugging |
| OS version | Yes | Debugging |
| User ID (truncated) | Yes (first 8 chars) | Account lookup without full ID |
| Email | No | User can add if they want |
| Progress data | No | Not needed for support |

### References

- [Source: epics.md#Story 7.5: Contact Support]
- [Source: prd.md#FR52: Contact support]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No blocking issues encountered during implementation.

### Completion Notes List

- Task 1: Support section already existed from Story 7.1 — verified rendering with tests (section title, Contact Support row, App Version row)
- Task 2: Added `supportSubject: 'Safar App Support'` to `config` object in `constants/config.ts`. Email address (`supportEmail`) was already configured from Story 7.4.
- Task 3: Replaced basic `handleContactSupport` (which used `safeOpenUrl` with bare `mailto:`) with enhanced version that constructs a full `mailto:` URL with `subject` and `body` query params containing diagnostic info. Used `Linking.openURL` instead of `expo-mail-composer` to avoid unnecessary dependency.
- Task 4: Implemented `getDiagnosticInfo()` function that gathers app version from `Constants.expoConfig`, platform from `Platform.OS`, OS version from `Platform.Version`, and anonymized user ID (first 8 chars). Full user ID is never included.
- Task 5: Added email fallback modal with Divine Geometry styling. When `Linking.canOpenURL` returns false or throws, a modal appears showing the support email address with a tap-to-copy button (using `expo-clipboard`). Modal includes guidance text and a "Done" dismiss button. Installed `expo-clipboard` as the only new dependency (required for copy functionality specified in AC#2).
- Updated existing `SettingsScreen.test.tsx` (Story 7.1) to match new mailto URL format (with query params) and modal-based fallback (instead of Alert).

### Change Log

- 2026-02-13: Implemented Story 7.5 Contact Support — enhanced email composition with diagnostic info, added email fallback modal with clipboard copy, added 15 new tests
- 2026-02-13: Code review fixes (8 issues: 4M, 4L) — added onRequestClose to modals, clipboard error handling, accessibility labels, DRY version logic, removed duplicate tests, fixed mock inconsistency, fixed userId empty string edge case, added clipboard failure test

### File List

- safar-app/app/settings.tsx (modified) — enhanced handleContactSupport with getDiagnosticInfo, added email fallback modal with clipboard copy, added onRequestClose/accessibility/error handling
- safar-app/constants/config.ts (modified) — added supportSubject config value
- safar-app/__tests__/screens/settings-contact-support.test.tsx (new) — 16 tests covering AC#1 and AC#2 (including clipboard failure)
- safar-app/__tests__/settings/SettingsScreen.test.tsx (modified) — removed duplicate contact support tests (covered by dedicated test file)
- safar-app/package.json (modified) — added expo-clipboard dependency
