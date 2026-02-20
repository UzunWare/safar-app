# Supabase Email Configuration

Your Supabase database is set up and ready! Now configure email for auth (password reset, magic links, etc.).

## Quick Setup (5 minutes)

### Option 1: Use Supabase Built-In SMTP (Easy)

Supabase provides free SMTP for development. It's already configured by default.

**No action needed** — emails will be sent from `noreply@mail.app.supabase.io`

**Limitations:**
- Generic "from" address
- Limited to 3 emails/hour in free tier
- May land in spam for some providers

### Option 2: Custom SMTP (Recommended for Production)

Use a custom email service for better deliverability and branding.

**Popular Options:**
- **Resend** (easiest, free tier: 3000 emails/month) — [resend.com](https://resend.com)
- **SendGrid** (free tier: 100 emails/day) — [sendgrid.com](https://sendgrid.com)
- **AWS SES** (cheapest at scale) — requires verification

---

## Configure Custom SMTP (Optional)

If you want emails from `noreply@sekine.app` instead of the default:

### Step 1: Get SMTP Credentials

**Using Resend (Recommended):**
1. Go to https://resend.com/signup
2. Sign up with your email
3. Add domain `sekine.app` and verify DNS records (they'll show you what to add)
4. Create an API key
5. SMTP credentials will be:
   - Host: `smtp.resend.com`
   - Port: `465` (SSL) or `587` (TLS)
   - Username: `resend`
   - Password: Your API key

### Step 2: Configure in Supabase

1. Go to https://supabase.com/dashboard/project/kyrtakuulovhxbednprs
2. Click **Settings** (left sidebar) → **Auth**
3. Scroll to **SMTP Settings**
4. Enable **Custom SMTP**
5. Fill in:
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **User:** `resend`
   - **Pass:** Your Resend API key
   - **Sender email:** `noreply@sekine.app`
   - **Sender name:** `Safar`
6. Click **Save**

### Step 3: Customize Email Templates (Optional)

1. In Supabase dashboard → **Auth** → **Email Templates**
2. Customize these templates:
   - **Confirm signup** — Welcome email with verification link
   - **Magic Link** — Passwordless login email
   - **Change Email Address** — Confirmation when user changes email
   - **Reset Password** — Password reset link

**Variables you can use:**
- `{{ .ConfirmationURL }}` — verification/magic link
- `{{ .Token }}` — 6-digit OTP code
- `{{ .SiteURL }}` — your app URL

---

## Test Email Setup

### Send a Test Email

1. Try signing up in your app with a real email
2. Check your inbox (and spam folder) for the confirmation email
3. If it doesn't arrive:
   - Check Supabase dashboard → **Logs** → **Auth**
   - Look for email sending errors

### Troubleshooting

**Emails not sending:**
- Check SMTP credentials are correct
- Verify sender email domain is verified (for custom SMTP)
- Check Supabase logs for errors

**Emails landing in spam:**
- Use custom SMTP with a verified domain
- Add SPF, DKIM, and DMARC DNS records (your SMTP provider will guide you)

---

## Current Status

✅ **Database:** Fully set up with migrations and seed data
✅ **API Keys:** Configured in `.env`
✅ **Auth:** Ready to use
⏳ **Email:** Using Supabase default SMTP (works but may land in spam)
⏳ **Custom SMTP:** Not configured (optional, but recommended for production)

---

## What's Next?

### For Development/Testing:
**No action needed** — the default SMTP works fine for testing.

### For Production:
1. Set up custom SMTP (Resend/SendGrid)
2. Verify your domain
3. Configure in Supabase dashboard
4. Test signup/password reset flows

---

## Support

**Supabase Auth Docs:** https://supabase.com/docs/guides/auth
**Email Templates Guide:** https://supabase.com/docs/guides/auth/auth-email-templates
**Resend Setup:** https://resend.com/docs/send-with-supabase-smtp
