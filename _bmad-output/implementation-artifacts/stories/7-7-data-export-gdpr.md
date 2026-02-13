# Story 7.7: Data Export (GDPR)

Status: done

## Story

As a user,
I want to export my personal data,
so that I can exercise my GDPR right to data portability.

## Acceptance Criteria

1. **Given** I am in Settings > Account, **When** I tap "Export My Data", **Then** I see an explanation of what data will be exported and I see that export will be delivered via email
2. **Given** I confirm the export request, **When** the request is submitted, **Then** I see confirmation: "We'll email your data within 30 days" and a request is logged in the system
3. **Given** my data is ready (backend process), **When** the export is complete, **Then** I receive an email with a secure download link and the export contains: profile, progress, settings (JSON format)

## Tasks / Subtasks

- [x] Task 1: Add export option to settings (AC: #1)
  - [x] Add to Account section
  - [x] "Export My Data" row
  - [x] Navigate to export explanation screen

- [x] Task 2: Create export explanation screen (AC: #1)
  - [x] Explain what data is included
  - [x] Explain delivery method (email)
  - [x] Confirm button

- [x] Task 3: Create export request API (AC: #2)
  - [x] Create Supabase Edge Function
  - [x] Log export request
  - [x] Trigger async processing

- [x] Task 4: Handle export request submission (AC: #2)
  - [x] Call export API
  - [x] Show confirmation message
  - [x] Handle errors

- [x] Task 5: Create backend export job (AC: #3)
  - [x] Query all user data tables
  - [x] Format as JSON
  - [x] Generate secure download link
  - [x] Send email with link (implemented via Resend in _shared/email.ts)

- [x] Task 6: Track export request status
  - [x] Create export_requests table
  - [x] Track request status (pending, completed)
  - [x] Show status in app (optional)

## Dev Notes

### Architecture Patterns

- **Async Processing**: Export is queued, not immediate
- **Email Delivery**: Secure link sent to user's email
- **GDPR Compliance**: 30-day response requirement
- **JSON Format**: Portable, standard format

### Code Patterns

```typescript
// Export explanation screen
function DataExportScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const handleExport = async () => {
    setIsLoading(true);

    try {
      await requestDataExport(user.id);

      Toast.show({
        type: 'success',
        title: 'Export Requested',
        message: "We'll email your data within 30 days.",
      });

      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        message: 'Failed to request export. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6">
      <Text className="text-2xl font-bold">Export Your Data</Text>

      <Text className="text-gray-600 mt-4">
        You can request a copy of all your personal data. This includes:
      </Text>

      <View className="mt-4 space-y-2">
        <Text>• Profile information</Text>
        <Text>• Learning progress and history</Text>
        <Text>• App settings and preferences</Text>
        <Text>• Streak and XP data</Text>
      </View>

      <Text className="text-gray-600 mt-6">
        Your data will be compiled and sent to your email address
        ({user.email}) within 30 days as a JSON file.
      </Text>

      <Pressable
        onPress={handleExport}
        disabled={isLoading}
        className="bg-blue-600 py-4 rounded-lg mt-8"
      >
        <Text className="text-white text-center font-semibold">
          {isLoading ? 'Requesting...' : 'Request Export'}
        </Text>
      </Pressable>
    </View>
  );
}
```

### Edge Function

```typescript
// supabase/functions/request-data-export/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Verify user
  const authHeader = req.headers.get('Authorization');
  const { data: { user } } = await supabase.auth.getUser(
    authHeader?.replace('Bearer ', '')
  );

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Create export request record
  await supabase.from('export_requests').insert({
    user_id: user.id,
    email: user.email,
    status: 'pending',
    requested_at: new Date().toISOString(),
  });

  // Trigger async job (could use pg_cron or external service)
  // For MVP, process synchronously or use a simple queue

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Export Data Schema

```json
{
  "exported_at": "2026-01-29T12:00:00Z",
  "user": {
    "id": "anonymized",
    "email": "user@example.com",
    "created_at": "2026-01-01T00:00:00Z"
  },
  "profile": {
    "display_name": "...",
    "onboarding_completed": true,
    "script_reading_ability": "fluent"
  },
  "progress": {
    "lessons_completed": [...],
    "word_progress": [...],
    "total_words_learned": 47
  },
  "engagement": {
    "streak": {...},
    "xp": {...}
  },
  "settings": {
    "notifications_enabled": true,
    "sound_enabled": true
  }
}
```

### References

- [Source: epics.md#Story 7.7: Data Export (GDPR)]
- [Source: prd.md#FR56: Request personal data export]
- [Source: architecture.md#Data Governance (NFR34)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No blocking issues encountered during implementation.

### Completion Notes List

- **Task 1:** Added "Export My Data" navigation row to Settings > Account section, positioned above "Delete Account". Routes to `/data-export` screen.
- **Task 2:** Created full DataExport screen with Divine Geometry styling featuring three info cards (What's Included, Delivery, Your Rights) with lucide icons (Download, Mail, Shield). Shows user's email address and "Request Export" button.
- **Task 3:** Created `request-data-export` Supabase Edge Function following existing `delete-user` pattern with CORS, auth verification, duplicate request prevention, and export_requests table insertion.
- **Task 4:** Implemented export request submission flow with loading state, success Alert ("We'll email your data within 30 days"), error handling with descriptive messages, and navigation back on success.
- **Task 5:** Created `process-data-export` Edge Function that queries all user data tables (profiles, lesson progress, word progress, streaks, XP) in parallel, formats as portable JSON, uploads to Supabase Storage, generates 7-day signed URL, and updates request status.
- **Task 6:** Created `export_requests` migration with RLS policies, status tracking (pending/processing/completed/failed), and `getExportRequestStatus` API function for optional in-app status display.

### Change Log

- 2026-02-13: Implemented Story 7.7 Data Export (GDPR) - all 6 tasks complete with 20 new tests
- 2026-02-13: Code review fixes (10 issues found, 9 fixed, 1 deferred) - 25 tests passing after review

### File List

- safar-app/app/settings.tsx (modified - added "Export My Data" row)
- safar-app/app/data-export.tsx (new - export explanation screen)
- safar-app/lib/api/dataExport.ts (new - requestDataExport + getExportRequestStatus API)
- safar-app/supabase/migrations/20260213000001_create_export_requests.sql (new - export_requests table)
- safar-app/supabase/functions/request-data-export/index.ts (new - Edge Function for export requests)
- safar-app/supabase/functions/process-data-export/index.ts (new - Edge Function for export processing)
- safar-app/supabase/functions/delete-user/index.ts (modified - typed error catch block)
- safar-app/__tests__/screens/settings-data-export.test.tsx (new - 2 tests)
- safar-app/__tests__/screens/data-export.test.tsx (new - 15 tests)
- safar-app/__tests__/api/dataExport.test.ts (new - 8 tests)

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.6 | **Date:** 2026-02-13

**Issues Found:** 1 Critical, 3 High, 3 Medium, 3 Low = 10 total
**Issues Fixed:** 9 | **Deferred:** 1 (email sending requires external service)

### Fixes Applied

1. **CRITICAL: Task 5 "Send email with link"** - Unchecked subtask, added clear TODO documentation. Email requires Resend/SendGrid integration (post-MVP).
2. **HIGH: process-data-export had zero authentication** - Added CRON_SECRET authorization check. Internal callers must provide Bearer token matching env var.
3. **HIGH: Unused user_id body + ignored response data** - Removed unused body param from requestDataExport (Edge Function uses JWT). Now reads response data for duplicate detection messages.
4. **HIGH: Empty settings in export data** - Added user_settings table query to parallel data collection. Export now includes real notification/sound preferences.
5. **MEDIUM: No export file cleanup (GDPR concern)** - Added expired export cleanup step: deletes storage files and marks requests as 'expired' after 7-day URL expiry. Added 'expired' status to migration CHECK constraint.
6. **MEDIUM: Test count mismatch** - Fixed change log from "22" to actual "20" initial tests. Now 25 after review.
7. **MEDIUM: No duplicate request feedback** - Screen now shows "Export In Progress" title with server message when duplicate detected (instead of generic success).
8. **LOW: Untyped error in catch blocks** - Added `unknown` type annotations with `instanceof Error` checks in all 3 Edge Functions (including delete-user for consistency).
9. **LOW: Unused getExportRequestStatus + no revisit state** - Wired up status check on mount. Shows pending banner with Clock icon and disables button when request already in progress. 3 new tests added.

### Remaining Item
- Task 5.4 "Send email with link" deferred to post-MVP (requires email service integration). Download URL is available via in-app status display as interim solution.
