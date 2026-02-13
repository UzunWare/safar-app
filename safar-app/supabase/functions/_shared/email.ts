/**
 * Shared email utility for Supabase Edge Functions
 * Uses Resend (https://resend.com) for transactional emails
 *
 * Required environment variables:
 * - RESEND_API_KEY: API key from Resend dashboard
 * - RESEND_FROM_EMAIL: Verified sender address
 *     - Testing (no domain): "onboarding@resend.dev" (only sends to your Resend account email)
 *     - Production (with domain): "Safar App <noreply@safar.app>"
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev';

  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured — email not sent');
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Resend API error (${response.status}): ${errorBody}`);
      return false;
    }

    console.log(`Email sent to ${params.to.substring(0, 3)}***`);
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Email send failed: ${msg}`);
    return false;
  }
}

/**
 * Send email notifying user their data export is ready for download.
 * Non-blocking: returns false on failure instead of throwing.
 */
export async function sendExportReadyEmail(
  to: string,
  downloadUrl: string,
  expiresAt: string
): Promise<boolean> {
  const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return sendEmail({
    to,
    subject: 'Your Safar Data Export is Ready',
    text: [
      'Your data export is ready for download.',
      '',
      `Download your data: ${downloadUrl}`,
      '',
      `This link expires on ${expiryDate}. After that, you can request a new export from the app.`,
      '',
      'Your export includes: profile information, learning progress, streak and XP data, and app settings.',
      '',
      'If you did not request this export, please contact us at support@safar.app.',
      '',
      '— The Safar Team',
    ].join('\n'),
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <h2 style="color: #0d5c4b;">Your Data Export is Ready</h2>
  <p>Your data export has been prepared and is ready for download.</p>
  <p style="margin: 24px 0;">
    <a href="${downloadUrl}" style="background-color: #0d5c4b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Download Your Data</a>
  </p>
  <p style="color: #666; font-size: 14px;">This link expires on <strong>${expiryDate}</strong>. After that, you can request a new export from the app.</p>
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
  <p style="font-size: 13px; color: #888;">Your export includes: profile information, learning progress, streak and XP data, and app settings.</p>
  <p style="font-size: 13px; color: #888;">If you did not request this export, please contact us at <a href="mailto:support@safar.app" style="color: #0d5c4b;">support@safar.app</a>.</p>
  <p style="font-size: 13px; color: #888;">— The Safar Team</p>
</body>
</html>`.trim(),
  });
}

/**
 * Send email confirming user's personal data has been deleted.
 * Non-blocking: returns false on failure instead of throwing.
 */
export async function sendDeletionConfirmationEmail(to: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Your Safar Data Has Been Deleted',
    text: [
      'Your personal data has been permanently deleted from Safar.',
      '',
      'The following data was removed:',
      '- Learning progress and history',
      '- Streak and XP data',
      '- Review schedules',
      '- App preferences and settings',
      '',
      'Your account remains active. You can sign in and start fresh as a new learner at any time.',
      '',
      'If you did not request this deletion, please contact us immediately at support@safar.app.',
      '',
      '— The Safar Team',
    ].join('\n'),
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <h2 style="color: #0d5c4b;">Your Data Has Been Deleted</h2>
  <p>Your personal data has been permanently deleted from Safar.</p>
  <p><strong>The following data was removed:</strong></p>
  <ul style="color: #444; line-height: 1.8;">
    <li>Learning progress and history</li>
    <li>Streak and XP data</li>
    <li>Review schedules</li>
    <li>App preferences and settings</li>
  </ul>
  <div style="background-color: #f0fdf4; border-left: 4px solid #0d5c4b; padding: 12px 16px; margin: 24px 0; border-radius: 4px;">
    <p style="margin: 0; color: #0d5c4b;"><strong>Your account remains active.</strong> You can sign in and start fresh as a new learner at any time.</p>
  </div>
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
  <p style="font-size: 13px; color: #888;">If you did not request this deletion, please contact us immediately at <a href="mailto:support@safar.app" style="color: #0d5c4b;">support@safar.app</a>.</p>
  <p style="font-size: 13px; color: #888;">— The Safar Team</p>
</body>
</html>`.trim(),
  });
}
