# How to Add Email Templates to Supabase

I've created 4 professionally designed email templates with Safar branding (Divine Geometry colors - emerald/gold/cream).

## Templates Created:

1. **confirm-signup.html** - Welcome email with email verification
2. **magic-link.html** - Passwordless login email
3. **reset-password.html** - Password reset email
4. **change-email.html** - Email change confirmation

All templates include:
- ✅ Safar branding (Divine Geometry palette)
- ✅ Mobile-responsive design
- ✅ Professional layout with gradient headers
- ✅ Clear CTAs (Call-to-Action buttons)
- ✅ Security notices
- ✅ Quranic verse footer
- ✅ Links to privacy policy and support

---

## How to Add to Supabase:

### Step 1: Go to Email Templates

1. Open: **https://supabase.com/dashboard/project/kyrtakuulovhxbednprs**
2. Click **"Authentication"** in left sidebar
3. Click **"Email Templates"** tab at the top

### Step 2: Update Each Template

For each template below, follow these steps:

#### Template 1: Confirm Signup

1. Click **"Confirm signup"** in the list
2. **Subject line:** `Welcome to Safar - Confirm Your Email`
3. Click **"Edit HTML"** or the HTML tab
4. **Delete all existing content**
5. Open `email-templates/confirm-signup.html` in a text editor
6. **Copy the entire HTML** and paste it into Supabase
7. Click **"Save"**

#### Template 2: Magic Link

1. Click **"Magic Link"** in the list
2. **Subject line:** `Sign In to Your Safar Account`
3. Click **"Edit HTML"**
4. Delete existing content
5. Copy and paste from `email-templates/magic-link.html`
6. Click **"Save"**

#### Template 3: Reset Password

1. Click **"Reset Password"** (or "Change Email Password")
2. **Subject line:** `Reset Your Safar Password`
3. Click **"Edit HTML"**
4. Delete existing content
5. Copy and paste from `email-templates/reset-password.html`
6. Click **"Save"**

#### Template 4: Change Email Address

1. Click **"Change Email Address"**
2. **Subject line:** `Confirm Your New Email - Safar`
3. Click **"Edit HTML"**
4. Delete existing content
5. Copy and paste from `email-templates/change-email.html`
6. Click **"Save"**

---

## Important Variables

The templates use these Supabase variables (already included):
- `{{ .ConfirmationURL }}` - The verification/magic link/reset link
- `{{ .Token }}` - 6-digit OTP code (if using OTP mode)
- `{{ .SiteURL }}` - Your app URL

**Do NOT remove these variables** - Supabase replaces them dynamically.

---

## Preview & Test

After adding templates:

1. Click **"Preview"** in Supabase to see how they look
2. Test by:
   - Creating a new account in your app
   - Requesting a password reset
   - Using magic link login

---

## Branding Details

These templates use your Divine Geometry design system:

**Colors:**
- Emerald: `#0D7C66` (primary brand color)
- Midnight: `#1A3A33` (dark accent)
- Gold: `#D4AF37` (accent/highlight)
- Cream: `#F5F1E8` (background)
- Light Emerald: `#B4E4D3` (subtle text)

**Typography:**
- System fonts for maximum compatibility
- Professional spacing and line heights
- Clear hierarchy (headings, body, captions)

**Layout:**
- 600px max width (optimal for email clients)
- Inline CSS (required for email compatibility)
- Responsive design (works on mobile)
- Gradient header with SAFAR branding

---

## Troubleshooting

**Variables not working?**
- Make sure you didn't delete `{{ .ConfirmationURL }}` or other Supabase variables
- Check that variables are wrapped in double curly braces

**Emails look broken?**
- Make sure you pasted the **entire** HTML (including `<!DOCTYPE html>` at the top)
- Check that you selected "HTML" mode, not "Rich Text"

**Still having issues?**
- Contact: emre@sekine.app
- Check Supabase logs: Dashboard → Logs → Auth
