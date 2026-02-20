# Google Play Console Upload Guide

**All assets are ready!** Follow these steps to upload Safar to Google Play.

---

## ✅ Pre-Upload Checklist

All items below are complete and ready:

- [x] **Production AAB built** → `store-assets/safar-v1.0.0-build5.aab` (63 MB)
- [x] **Screenshots captured** → `store-assets/screenshots/` (15 PNG files)
- [x] **App icon ready** → `store-assets/play-store-icon-512.png` (512×512)
- [x] **Feature graphic ready** → `store-assets/play-store-feature-graphic.png` (1024×500)
- [x] **Store listing written** → `store-assets/google-play-listing.md`
- [x] **Privacy policy live** → http://sekine.app (HTTP only — HTTPS pending)
- [x] **Supabase backend configured** → kyrtakuulovhxbednprs.supabase.co
- [x] **Email templates configured** → Resend SMTP with custom templates

---

## 📱 Step 1: Create App in Play Console

1. Go to: https://play.google.com/console
2. Click **"Create app"**
3. Fill in:
   - **App name**: Safar
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
4. Accept declarations and click **"Create app"**

---

## 🎨 Step 2: Set Up Store Listing

Navigate to **"Store presence" → "Main store listing"** in the left sidebar.

### App Details

- **App name**: Safar
- **Short description** (80 chars max):
  ```
  Learn Quran recitation for Salah — guided lessons, quizzes & spaced repetition
  ```

- **Full description** (4000 chars max):
  Copy from `store-assets/google-play-listing.md` (lines 10-72)

### Graphics

- **App icon**: Upload `store-assets/play-store-icon-512.png`
- **Feature graphic**: Upload `store-assets/play-store-feature-graphic.png`

### Phone Screenshots

Upload all 15 screenshots from `store-assets/screenshots/`:
- screenshot-001.png through screenshot-015.png
- Google Play requires minimum 2, maximum 8 screenshots
- **Recommendation**: Upload screenshots 001-008 (the most important flows)

### Categorization

- **App category**: Education
- **Tags** (optional): quran, islam, arabic, salah, prayer, learning

### Contact Details

- **Email**: emre@sekine.app
- **Website**: https://github.com/UzunWare/safar-app
- **Privacy policy**: http://sekine.app

Click **"Save"**

---

## 📋 Step 3: Complete App Content

Navigate to **"Policy" → "App content"** in the left sidebar.

### Privacy Policy

- **Privacy policy URL**: http://sekine.app
- Click **"Save"**

### App Access

- Select: **"All functionality is available without special access"**
- Click **"Save"**

### Ads

- Select: **"No, my app does not contain ads"**
- Click **"Save"**

### Content Ratings

1. Click **"Start questionnaire"**
2. **Email**: emre@sekine.app
3. **Category**: Reference, News, or Educational
4. Answer questions:
   - Violence: No
   - Sexual content: No
   - Language: No
   - Controlled substances: No
   - Interactive elements: No
   - Shares user location: No
   - Unrestricted web access: No
5. Click **"Submit"**
6. Rating: **Everyone (PEGI 3)**

### Target Audience

- **Target age group**: 13+ (or "All ages")
- Click **"Save"**

### Data Safety

1. Click **"Start"**
2. **Does your app collect or share user data?**: Yes
3. Data collected:
   - **Account info**: Email address (for authentication)
   - **App activity**: In-app actions (lesson progress, quiz results)
   - Purpose: App functionality, Account management
   - All data is encrypted in transit (HTTPS, TLS)
   - Users can request deletion via email: emre@sekine.app
4. Click **"Submit"**

---

## 📦 Step 4: Upload Production AAB

Navigate to **"Release" → "Production"** in the left sidebar.

1. Click **"Create new release"**
2. **Upload AAB**:
   - Click **"Upload"**
   - Select `store-assets/safar-v1.0.0-build5.aab`
   - Wait for upload to complete
3. **Release name**: 1.0.0 (5) — Production
4. **Release notes** (What's new):
   ```
   🌙 Welcome to Safar v1.0

   Initial release featuring:
   • Salah First pathway with Al-Fatiha, Al-Ikhlas, Al-Falaq, An-Nas
   • 145 essential Quranic words with roots and meanings
   • Interactive quizzes with spaced repetition
   • Audio recitation for Quranic surahs
   • Offline learning support
   • XP tracking and daily streaks

   Understand what you recite. Start your journey today!
   ```
5. Click **"Save"**

---

## 🚀 Step 5: Review and Submit

1. Navigate to **"Release" → "Production"** → **"Review release"**
2. Check all sections are complete (green checkmarks)
3. If any issues appear:
   - Yellow warnings: Review but can proceed
   - Red errors: Must fix before submitting
4. Click **"Start rollout to Production"**
5. **Rollout percentage**: 100% (or start with staged rollout like 10%)
6. Confirm submission

---

## ⏱️ What Happens Next?

1. **Review in progress** (1-7 days typical, up to 14 days possible)
   - Google reviews your app for policy compliance
   - You'll receive email updates on status
2. **Approved & Published**
   - App goes live on Google Play Store
   - Users can search and download
3. **Post-Launch Monitoring**
   - Check Google Play Console for crash reports
   - Monitor user reviews and ratings
   - Track installations and retention

---

## 🔧 Troubleshooting

### SSL Certificate Issue (sekine.app)

The privacy policy is currently accessible via **HTTP only** (http://sekine.app). The HTTPS certificate is being provisioned by GitHub Pages, which can take up to 24 hours.

- **For Google Play submission**: Use `http://sekine.app` (Google accepts HTTP privacy policy URLs)
- **Status**: GitHub Pages build is successful, DNS is configured correctly
- **Next step**: GitHub will automatically provision the SSL certificate within 24 hours
- **To check status**: Visit https://sekine.app — once certificate is ready, it will load without error

### Build Verification

If Google Play rejects the AAB:
- **Version code**: 5 (auto-incremented by EAS)
- **Version name**: 1.0.0
- **Minimum SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (matches Play Store requirements)
- **Signing**: Managed by EAS (Google Play App Signing enabled)

### Content Policy Concerns

If flagged for review:
- **No ads**: App is completely free
- **No in-app purchases**: FREE_MODE is enabled (RevenueCat disabled)
- **Data collection**: Minimal (email, progress data)
- **Privacy compliance**: GDPR-ready (data export/deletion functions implemented)

---

## 📊 Post-Launch Setup

After approval, consider:

1. **Enable pre-registration** for future updates
2. **Set up app campaigns** (optional)
3. **Monitor crash reports** in Play Console
4. **Respond to user reviews** within 24-48 hours
5. **Plan update schedule** (monthly recommended)

---

## 🆘 Need Help?

- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **EAS Build Logs**: https://expo.dev/accounts/emrekrkmz/projects/safar-app/builds
- **Supabase Dashboard**: https://supabase.com/dashboard/project/kyrtakuulovhxbednprs
- **Support Email**: emre@sekine.app

---

**Good luck with your launch! 🚀**

The app is production-ready. All backend services are configured and tested.
