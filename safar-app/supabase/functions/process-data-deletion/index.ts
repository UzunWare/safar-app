/**
 * Process Data Deletion Edge Function
 * Story 7.8 - GDPR data deletion backend job
 *
 * Triggered by: pg_cron, webhook, or manual invocation
 * Requires: Authorization header with CRON_SECRET for access control
 * Processes pending deletion requests by:
 * 1. Deleting all user learning data from tables
 * 2. Resetting user profile (account preserved)
 * 3. Keeping audit log without PII
 * 4. Sending deletion confirmation email via Resend
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendDeletionConfirmationEmail } from '../_shared/email.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function processUserDataDeletion(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  // Delete user learning data (order matters for foreign key constraints)
  // Each operation is checked — GDPR requires complete deletion or failure
  const tables = [
    'user_word_progress',
    'user_lesson_progress',
    'user_streaks',
    'user_xp',
    'user_settings',
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) {
      throw new Error(`Failed to delete from ${table}: ${error.message}`);
    }
  }

  // Reset profile but preserve account
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({
      display_name: null,
      onboarding_completed: false,
      onboarding_completed_at: null,
      script_reading_ability: null,
    })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to reset user_profiles: ${profileError.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify caller is authorized (pg_cron, webhook, or admin)
    const cronSecret = Deno.env.get('CRON_SECRET');
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!cronSecret || token !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find pending deletion requests
    const { data: pendingRequests, error: fetchError } = await supabase
      .from('deletion_requests')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!pendingRequests || pendingRequests.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending deletions' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const request of pendingRequests) {
      try {
        // Mark as processing
        await supabase
          .from('deletion_requests')
          .update({ status: 'processing' })
          .eq('id', request.id);

        // Delete all user data
        await processUserDataDeletion(supabase, request.user_id);

        // Scrub PII from audit records (GDPR: keep audit log without PII)
        await supabase
          .from('deletion_requests')
          .update({ email: '[deleted]' })
          .eq('user_id', request.user_id);

        await supabase
          .from('export_requests')
          .update({ email: '[deleted]', download_url: null })
          .eq('user_id', request.user_id);

        // Mark as completed
        await supabase
          .from('deletion_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', request.id);

        // Send confirmation email (non-blocking — failure is logged, not thrown)
        // request.email was captured at request time, before PII scrub above
        await sendDeletionConfirmationEmail(request.email);
        console.log(`Data deletion completed for user ${request.user_id.substring(0, 8)}...`);

        results.push({ id: request.id, status: 'completed' });
      } catch (processError: unknown) {
        const errMsg = processError instanceof Error ? processError.message : 'Unknown error';
        // Mark as failed
        await supabase
          .from('deletion_requests')
          .update({ status: 'failed' })
          .eq('id', request.id);

        console.error(`Deletion failed for request ${request.id}: ${errMsg}`);
        results.push({ id: request.id, status: 'failed', error: errMsg });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
