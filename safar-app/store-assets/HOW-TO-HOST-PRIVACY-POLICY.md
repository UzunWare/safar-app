# How to Host Your Privacy Policy

You need to host `privacy-policy.html` online so you can give Google Play the URL.

## Option 1: GitHub Pages (Recommended - Free & Easy)

### Steps:

1. **Create a new GitHub repository**
   - Go to https://github.com/new
   - Name: `safar-privacy` (or any name)
   - Public repository
   - Click "Create repository"

2. **Upload the HTML file**
   - Click "uploading an existing file"
   - Drag `privacy-policy.html` from `/safar-app/store-assets/`
   - Rename it to `index.html` (so it's the default page)
   - Click "Commit changes"

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
   - Click "Save"

4. **Get your URL**
   - After 1-2 minutes, your page will be live at:
   - `https://your-username.github.io/safar-privacy/`
   - Example: `https://uzunware.github.io/safar-privacy/`

5. **Use this URL in Google Play Console**
   - Copy the URL
   - Paste it in Play Console → App content → Privacy policy

---

## Option 2: Host on Your Own Website

If you have a website (e.g., `sekine.app`):

1. Upload `privacy-policy.html` to your web server
2. Access it at `https://yoursite.com/privacy-policy.html`
3. Use that URL in Google Play Console

---

## Option 3: Use a Free Privacy Policy Generator

If you don't want to use GitHub:

1. Go to https://app.termly.io/ or https://www.freeprivacypolicy.com/
2. Use their wizard to generate a policy
3. Host it on their platform (they give you a URL)
4. Use that URL in Google Play Console

**Note:** Our drafted policy (`privacy-policy.md` / `privacy-policy.html`) is already compliant and specific to Safar, so GitHub Pages is the easiest option.

---

## Quick Command (if using GitHub CLI)

If you have `gh` CLI installed:

```bash
cd safar-app/store-assets
gh repo create safar-privacy --public
cp privacy-policy.html index.html
git init
git add index.html
git commit -m "Add privacy policy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/safar-privacy.git
git push -u origin main

# Then enable Pages in repo settings
```

---

## Verification

After hosting, verify:
- [ ] Privacy policy URL loads in browser
- [ ] All sections are visible
- [ ] No broken links
- [ ] HTTPS is enabled (GitHub Pages does this automatically)

Then add the URL to Google Play Console.
