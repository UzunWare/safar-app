# Google Play Store Upload Checklist

## Before You Start

Make sure you have:
- [ ] Production AAB file downloaded from EAS
- [ ] Google Play Developer account created ($25 paid)
- [ ] App created in Google Play Console (name: "Safar")

## Assets Needed (all in `/safar-app/store-assets/`)

- [ ] `play-store-icon-512.png` (512x512) — High-res icon
- [ ] `play-store-feature-graphic.png` (1024x500) — Feature banner
- [ ] Screenshots (at least 2) — **You need to take these from the app**
- [ ] Privacy policy hosted online — See `privacy-policy.md`

## Step-by-Step Upload Process

### 1. Upload AAB to Internal Testing

**Path:** Google Play Console → Safar → Testing → Internal testing

- [ ] Click **"Create new release"**
- [ ] Upload the `.aab` file from EAS build
- [ ] Release name: Auto-generated (e.g., `1.0.0 (4)`)
- [ ] Release notes: `Initial release`
- [ ] Click **"Next"** → **"Save"**

### 2. Complete Store Listing

**Path:** Grow → Store listing

- [ ] **App name:** `Safar`
- [ ] **Short description:** (from `google-play-listing.md`)
- [ ] **Full description:** (from `google-play-listing.md`)
- [ ] **App icon:** Upload `play-store-icon-512.png`
- [ ] **Feature graphic:** Upload `play-store-feature-graphic.png`
- [ ] **Phone screenshots:** Upload at least 2 screenshots (see below)
- [ ] **Category:** Education
- [ ] **Tags:** quran, islam, arabic, learning (optional)
- [ ] **Contact email:** `emre@sekine.app`
- [ ] Click **"Save"**

### 3. Set Up App Content (Policies)

**Path:** Policy → App content

#### Content Rating
- [ ] Click **"Start questionnaire"**
- [ ] Select **"Education"** as category
- [ ] Answer questions (all "No" for violence, drugs, etc.)
- [ ] Complete and get rating (likely **Everyone/PEGI 3**)

#### Target Audience
- [ ] Click **"Start"**
- [ ] Select **"18 and older"** (to avoid children's app requirements)
- [ ] Click **"Save"**

#### Privacy Policy
- [ ] Host `privacy-policy.md` online (GitHub Pages, your website, or use https://www.privacypolicies.com/live/)
- [ ] Enter the URL in Google Play Console
- [ ] Click **"Save"**

#### Data Safety
- [ ] Click **"Start"**
- [ ] **Does your app collect user data?** → Yes
- [ ] Data types collected:
  - [ ] Email address (for account creation)
  - [ ] User progress (learning data)
- [ ] **Is data encrypted in transit?** → Yes
- [ ] **Can users request data deletion?** → Yes
- [ ] Click **"Save"**

### 4. Pricing & Distribution

**Path:** Grow → Pricing & distribution (or "Countries/regions")

- [ ] **Pricing:** Free
- [ ] **Countries:** Select all (or your target regions)
- [ ] **Content guidelines:** Check "Complies with guidelines"
- [ ] **US export laws:** Check "Not applicable" (or review if you have encryption)
- [ ] Click **"Save"**

### 5. Review & Publish to Internal Testing

- [ ] Go back to **Internal testing** → Review release
- [ ] Click **"Roll out release"**
- [ ] Add yourself as an internal tester (use your email)
- [ ] Install the app from Play Store (internal testing link) and verify it works

### 6. Promote to Production (Optional — when ready)

Once internal testing is successful:
- [ ] Go to **Production** → Create new release
- [ ] Select the same AAB from internal testing (or upload the same file)
- [ ] Release notes: See `google-play-listing.md`
- [ ] Submit for review (Google review takes 1-3 days)

---

## Screenshots Guide

You need at least **2 phone screenshots** (recommended 4-8). Take screenshots of:

1. **Onboarding screen** — Welcome/pathway selection
2. **Lesson view** — Word card with translation
3. **Quiz screen** — Active quiz question
4. **Dashboard** — Progress overview with XP/streak
5. **Root explorer** — (optional) Word family view

**Format:**
- Size: 1080x1920 (portrait) or similar 16:9 ratio
- Format: PNG or JPEG

**How to take:**
- Run the app in Expo Go or on a physical device
- Take screenshots using device screenshot tool
- Transfer to computer and upload to Play Console

---

## Common Issues

### "You need to complete all required sections"
Check:
- Store listing (icon, description, screenshots)
- Content rating questionnaire
- Privacy policy URL
- Data safety form

### "Your app uses permissions that require a privacy policy"
- Make sure privacy policy URL is entered in App content section

### "This release is not ready to publish"
- Ensure AAB is uploaded
- Complete all sections marked with red "!" icons
- Save each section after filling

---

## After Upload

1. **Internal testing link** will be generated
2. Add testers (yourself, friends) via email
3. Test the app from Play Store internal track
4. Once verified, promote to Production
5. Google review: 1-3 days for approval

---

## Need Help?

- Google Play Console docs: https://support.google.com/googleplay/android-developer
- Contact: emre@sekine.app
