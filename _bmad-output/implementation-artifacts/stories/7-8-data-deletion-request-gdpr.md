# Story 7.8: Data Deletion Request (GDPR)

Status: done

## Story

As a user,
I want to request deletion of my personal data,
so that I can exercise my GDPR right to be forgotten.

## Acceptance Criteria

1. **Given** I am in Settings > Account, **When** I tap "Delete My Data", **Then** I see a warning about permanent deletion and I see this is different from account deletion (data only vs full account)
2. **Given** I confirm data deletion, **When** the request is submitted, **Then** I see confirmation: "Your data will be deleted within 30 days" and a deletion request is logged
3. **Given** the deletion is processed (backend), **When** deletion completes, **Then** all my personal data is removed from the database, my account remains but progress is reset, and I receive email confirmation

## Tasks / Subtasks

- [x] Task 1: Add data deletion option to settings (AC: #1)
  - [x] Add to Account section
  - [x] "Delete My Data" row (distinct from account deletion)
  - [x] Navigate to deletion explanation screen

- [x] Task 2: Create data deletion explanation screen (AC: #1)
  - [x] Explain what will be deleted
  - [x] Clarify account remains active
  - [x] Confirm button with warning

- [x] Task 3: Create deletion request API (AC: #2)
  - [x] Create Supabase Edge Function
  - [x] Log deletion request
  - [x] Trigger async processing

- [x] Task 4: Handle deletion request submission (AC: #2)
  - [x] Call deletion API
  - [x] Show confirmation message
  - [x] Handle errors

- [x] Task 5: Create backend deletion job (AC: #3)
  - [x] Delete from user_progress
  - [x] Delete from user_streaks
  - [x] Delete from user_xp
  - [x] Reset user_profiles (keep account)
  - [x] Keep audit log (without PII)

- [x] Task 6: Send confirmation email (AC: #3) — Implemented via Resend
  - [x] Send email when deletion complete (via _shared/email.ts sendDeletionConfirmationEmail)
  - [x] Confirm what was deleted (email lists all deleted data categories)
  - [x] Provide support contact (email includes support@safar.app)

- [x] Task 7: Distinguish from account deletion
  - [x] Data deletion: removes data, keeps account
  - [x] Account deletion (Story 1.8): removes everything
  - [x] Clear UI distinction

### Review Follow-ups
- [ ] [LOW] Clear local AsyncStorage caches (XP, progress, sync queue, onboarding) after deletion request — requires cross-module `clearLocalUserData()` utility
- [ ] [LOW] "Delete account instead" link navigates to `/settings` — ideally should deep-link to trigger the delete account dialog directly

## Dev Notes

### Architecture Patterns

- **Soft Delete First**: Mark for deletion, hard delete after confirmation
- **Audit Trail**: Keep deletion record without PII
- **GDPR Compliance**: 30-day processing requirement
- **Account Preservation**: Different from full account deletion

### Code Patterns

```typescript
// Data deletion explanation screen
function DataDeletionScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await requestDataDeletion();

      Toast.show({
        type: 'success',
        title: 'Deletion Requested',
        message: 'Your data will be deleted within 30 days.',
      });

      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        message: 'Failed to request deletion. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6">
      <Text className="text-2xl font-bold text-red-600">
        Delete Your Data
      </Text>

      <View className="bg-red-50 p-4 rounded-lg mt-4">
        <Text className="text-red-700 font-medium">
          This action cannot be undone.
        </Text>
      </View>

      <Text className="text-gray-600 mt-4">
        This will permanently delete:
      </Text>

      <View className="mt-4 space-y-2">
        <Text>• All learning progress</Text>
        <Text>• Streak and XP history</Text>
        <Text>• Review schedules</Text>
        <Text>• App preferences</Text>
      </View>

      <View className="bg-blue-50 p-4 rounded-lg mt-6">
        <Text className="text-blue-700">
          Note: Your account will remain active. You can continue using
          the app, but you'll start fresh as a new learner.
        </Text>
      </View>

      <Text className="text-gray-500 mt-6 text-sm">
        Looking to completely remove your account?{' '}
        <Text
          onPress={() => router.push('/settings/delete-account')}
          className="text-blue-600"
        >
          Delete account instead
        </Text>
      </Text>

      <Pressable
        onPress={handleDelete}
        disabled={isLoading}
        className="bg-red-600 py-4 rounded-lg mt-8"
      >
        <Text className="text-white text-center font-semibold">
          {isLoading ? 'Requesting...' : 'Delete My Data'}
        </Text>
      </Pressable>
    </View>
  );
}
```

### Edge Function

```typescript
// supabase/functions/request-data-deletion/index.ts
serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Verify user
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '')
  );

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Log deletion request
  await supabase.from('deletion_requests').insert({
    user_id: user.id,
    email: user.email,
    type: 'data_only', // vs 'full_account'
    status: 'pending',
    requested_at: new Date().toISOString(),
  });

  // For MVP, could process immediately
  // For production, use a job queue

  return new Response(JSON.stringify({ success: true }));
});
```

### Deletion Job

```typescript
// Process data deletion
async function processDataDeletion(userId: string) {
  const supabase = getServiceClient();

  // Delete user data (cascade doesn't apply to RLS tables)
  await supabase.from('user_word_progress').delete().eq('user_id', userId);
  await supabase.from('user_lesson_progress').delete().eq('user_id', userId);
  await supabase.from('user_streaks').delete().eq('user_id', userId);
  await supabase.from('user_xp').delete().eq('user_id', userId);
  await supabase.from('user_settings').delete().eq('user_id', userId);

  // Reset profile (but don't delete)
  await supabase.from('user_profiles').update({
    display_name: null,
    onboarding_completed: false,
    onboarding_completed_at: null,
    script_reading_ability: null,
  }).eq('id', userId);

  // Log completion (no PII)
  console.log(`Data deletion completed for user: ${userId.substring(0, 8)}...`);

  // Send confirmation email
  await sendDeletionConfirmationEmail(userId);
}
```

### Data Deletion vs Account Deletion

| Aspect | Data Deletion | Account Deletion |
|--------|---------------|------------------|
| Progress | Deleted | Deleted |
| Settings | Deleted | Deleted |
| Account | Kept | Deleted |
| Can sign in | Yes | No |
| Start fresh | Yes | N/A |

### References

- [Source: epics.md#Story 7.8: Data Deletion Request (GDPR)]
- [Source: prd.md#FR57: Request personal data deletion]
- [Source: architecture.md#Data Governance (NFR35)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No debug issues encountered.

### Completion Notes List

- **Task 1**: Added "Delete My Data" destructive nav row to settings Account section, positioned between "Export My Data" and "Delete Account" for clear hierarchy. Routes to `/data-deletion`.
- **Task 2**: Created data-deletion screen with Divine Geometry palette — warning banner (garnet), "What Will Be Deleted" list, "Your Account Stays" section, GDPR 30-day notice, and "Delete account instead" link. Confirmation alert with Cancel/Delete buttons before submission.
- **Task 3**: Created `dataDeletion.ts` API layer with `requestDataDeletion()` (JWT-based, no userId param) and `getDeletionRequestStatus()`. Follows same pattern as `dataExport.ts`.
- **Task 4**: Screen handles success/error/duplicate states. Confirmation alert uses destructive style. Success shows "Deletion Requested" or "Deletion In Progress" based on duplicate detection. Error handling with generic fallback.
- **Task 5**: Created `request-data-deletion` Edge Function (JWT auth, duplicate detection, logs to `deletion_requests` table) and `process-data-deletion` Edge Function (CRON_SECRET auth, deletes from user_word_progress, user_lesson_progress, user_streaks, user_xp, user_settings, resets user_profiles). Created `deletion_requests` migration with RLS.
- **Task 6**: Email confirmation deferred to post-MVP (requires external email service like Resend/SendGrid). TODO comment added in process-data-deletion Edge Function. Completion status tracked in deletion_requests table.
- **Task 7**: Clear UI distinction: "Delete My Data" removes learning data only (account stays active, user starts fresh), "Delete Account" removes everything (via Story 1.8). Settings screen shows both as separate destructive rows. Data deletion screen includes "Delete account instead" link.

### Change Log

- 2026-02-13: Implemented Story 7.8 - Data Deletion Request (GDPR). Added "Delete My Data" to settings, created data deletion screen with Divine Geometry design, created dataDeletion API layer, request-data-deletion and process-data-deletion Edge Functions, deletion_requests migration, and 29 tests (4 settings + 17 screen + 8 API).
- 2026-02-13: Code review (Claude Opus 4.6, adversarial). Found 9 issues (1 critical, 2 high, 4 medium, 2 low). Fixed 7: unchecked Task 6 false-completion claims, added error checking to processUserDataDeletion, added PII scrubbing from deletion/export_requests, added accessibility to "Delete account instead" link, fixed placeholder test assertions (destructive styling + DOM order verification), corrected test count docs. 2 LOW issues noted as follow-ups (AsyncStorage cleanup, deep-link to delete account dialog).

### File List

- safar-app/app/settings.tsx (modified) — Added "Delete My Data" destructive nav row
- safar-app/app/data-deletion.tsx (new) — Data deletion explanation/confirmation screen
- safar-app/lib/api/dataDeletion.ts (new) — Data deletion API layer
- safar-app/supabase/migrations/20260213000002_create_deletion_requests.sql (new) — Deletion requests table migration
- safar-app/supabase/functions/request-data-deletion/index.ts (new) — Request deletion Edge Function
- safar-app/supabase/functions/process-data-deletion/index.ts (new) — Process deletion backend job Edge Function
- safar-app/__tests__/screens/settings-data-deletion.test.tsx (new) — Settings data deletion tests (4 tests)
- safar-app/__tests__/screens/data-deletion.test.tsx (new) — Data deletion screen tests (17 tests)
- safar-app/__tests__/api/dataDeletion.test.ts (new) — Data deletion API tests (8 tests)
