/**
 * Process Data Export Edge Function
 * Story 7.7 - GDPR data export backend job
 *
 * Triggered by: pg_cron, webhook, or manual invocation
 * Requires: Authorization header with CRON_SECRET for access control
 * Processes pending export requests by:
 * 1. Querying all user data tables
 * 2. Formatting as portable JSON
 * 3. Storing in Supabase Storage with secure signed URL
 * 4. Sending email notification with download link via Resend
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendExportReadyEmail } from '../_shared/email.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportData {
  exported_at: string;
  user: {
    email: string;
    created_at: string;
  };
  profile: Record<string, unknown>;
  progress: {
    lessons_completed: unknown[];
    word_progress: unknown[];
    total_words_learned: number;
  };
  engagement: {
    streaks: unknown;
    xp: unknown;
  };
  settings: Record<string, unknown>;
}

async function collectUserData(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  email: string
): Promise<ExportData> {
  // Query all user data tables in parallel
  const [profileResult, lessonsResult, wordsResult, streaksResult, xpResult, settingsResult] =
    await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', userId).single(),
      supabase.from('user_lesson_progress').select('*').eq('user_id', userId),
      supabase.from('user_word_progress').select('*').eq('user_id', userId),
      supabase.from('user_streaks').select('*').eq('user_id', userId).single(),
      supabase.from('user_xp').select('*').eq('user_id', userId).single(),
      supabase.from('user_settings').select('*').eq('user_id', userId).single(),
    ]);

  const wordProgress = wordsResult.data ?? [];
  const learnedWords = wordProgress.filter(
    (w: { status?: string }) => w.status === 'learned' || w.status === 'mastered'
  );

  return {
    exported_at: new Date().toISOString(),
    user: {
      email,
      created_at: profileResult.data?.created_at ?? '',
    },
    profile: {
      display_name: profileResult.data?.display_name ?? null,
      onboarding_completed: profileResult.data?.onboarding_completed ?? false,
      script_reading_ability: profileResult.data?.script_reading_ability ?? null,
    },
    progress: {
      lessons_completed: lessonsResult.data ?? [],
      word_progress: wordProgress,
      total_words_learned: learnedWords.length,
    },
    engagement: {
      streaks: streaksResult.data ?? {},
      xp: xpResult.data ?? {},
    },
    settings: settingsResult.data
      ? {
          streak_reminders: settingsResult.data.streak_reminders ?? true,
          review_reminders: settingsResult.data.review_reminders ?? true,
          learning_reminders: settingsResult.data.learning_reminders ?? true,
          sound_enabled: settingsResult.data.sound_enabled ?? true,
        }
      : { note: 'No server-side settings found; preferences may be stored locally on device' },
  };
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

    // Find pending export requests
    const { data: pendingRequests, error: fetchError } = await supabase
      .from('export_requests')
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
      return new Response(JSON.stringify({ message: 'No pending exports' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const request of pendingRequests) {
      try {
        // Mark as processing
        await supabase
          .from('export_requests')
          .update({ status: 'processing' })
          .eq('id', request.id);

        // Collect all user data
        const exportData = await collectUserData(supabase, request.user_id, request.email);

        // Store export as JSON in Supabase Storage
        const fileName = `exports/${request.user_id}/${request.id}.json`;
        const jsonContent = JSON.stringify(exportData, null, 2);

        const { error: uploadError } = await supabase.storage
          .from('data-exports')
          .upload(fileName, jsonContent, {
            contentType: 'application/json',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Generate signed URL (valid for 7 days)
        const { data: signedUrlData, error: signError } = await supabase.storage
          .from('data-exports')
          .createSignedUrl(fileName, 60 * 60 * 24 * 7);

        if (signError || !signedUrlData) {
          throw new Error(`Signed URL generation failed: ${signError?.message}`);
        }

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        // Update export request with download link
        await supabase
          .from('export_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            download_url: signedUrlData.signedUrl,
            expires_at: expiresAt,
          })
          .eq('id', request.id);

        // Send email with download link (non-blocking — failure is logged, not thrown)
        await sendExportReadyEmail(request.email, signedUrlData.signedUrl, expiresAt);
        console.log(`Export completed for user ${request.user_id.substring(0, 8)}...`);

        results.push({ id: request.id, status: 'completed' });
      } catch (processError: unknown) {
        const errMsg = processError instanceof Error ? processError.message : 'Unknown error';
        // Mark as failed
        await supabase
          .from('export_requests')
          .update({ status: 'failed' })
          .eq('id', request.id);

        console.error(`Export failed for request ${request.id}: ${errMsg}`);
        results.push({ id: request.id, status: 'failed', error: errMsg });
      }
    }

    // GDPR data minimization: clean up expired export files from storage
    try {
      const { data: expiredRequests } = await supabase
        .from('export_requests')
        .select('id, user_id, expires_at')
        .eq('status', 'completed')
        .lt('expires_at', new Date().toISOString())
        .limit(20);

      if (expiredRequests && expiredRequests.length > 0) {
        const filesToRemove = expiredRequests.map(
          (r: { user_id: string; id: string }) => `exports/${r.user_id}/${r.id}.json`
        );

        await supabase.storage.from('data-exports').remove(filesToRemove);

        const expiredIds = expiredRequests.map((r: { id: string }) => r.id);
        await supabase
          .from('export_requests')
          .update({ download_url: null, status: 'expired' })
          .in('id', expiredIds);

        console.log(`Cleaned up ${expiredRequests.length} expired export(s)`);
      }
    } catch (cleanupErr: unknown) {
      const msg = cleanupErr instanceof Error ? cleanupErr.message : 'Unknown error';
      console.error(`Export cleanup warning: ${msg}`);
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
