# Building the Clockly Mobile App

This guide walks you through building an installable APK (Android) or IPA (iOS) for your Clockly app.

## Prerequisites

1. **Expo Account** (free)
   - Sign up at: https://expo.dev/signup
   - Or login if you already have one

2. **EAS CLI** (Expo Application Services)
   - We'll install this in the steps below

---

## Step 1: Install EAS CLI

Open your terminal in the `mobile/` directory and run:

```bash
npm install -g eas-cli
```

Or if you prefer using npx (no global install):
```bash
npx eas-cli@latest
```

---

## Step 2: Login to Expo

```bash
eas login
```

This will open a browser window for you to login to your Expo account.

---

## Step 3: Configure EAS Project

```bash
eas build:configure
```

This will:
- Create/update `eas.json` (already created)
- Link your project to Expo's servers
- Generate a project ID (will be added to `app.json`)

---

## Step 4: Build for Android (APK)

### Option A: Build APK for Direct Installation

```bash
eas build --platform android --profile preview
```

This creates an APK file that you can:
- Download directly to Android phones
- Install without Google Play Store
- Share with testers easily

### Option B: Build Production AAB (for Google Play Store)

```bash
eas build --platform android --profile production
```

This creates an AAB (Android App Bundle) file for:
- Uploading to Google Play Store
- Distribution through Play Store

**What happens:**
1. EAS will upload your code to Expo's build servers
2. Build will take 10-20 minutes
3. You'll get a download link when it's done
4. You can check progress at: https://expo.dev/accounts/[your-username]/projects/clockly-mobile/builds

---

## Step 5: Build for iOS (IPA)

**Note:** iOS builds require an Apple Developer account ($99/year)

```bash
eas build --platform ios --profile production
```

This will:
- Prompt you to set up credentials (or use Expo's managed credentials)
- Create an IPA file for TestFlight or App Store

---

## Step 6: Download and Install

### Android APK:

1. After build completes, you'll get a download link
2. Download the APK file to your Android device
3. Enable "Install from Unknown Sources" in Android settings
4. Tap the APK file to install
5. Open the Clockly app!

### iOS:

1. Download the IPA
2. Install via TestFlight (recommended) or Xcode
3. Or submit to App Store

---

## Build Profiles Explained

From `eas.json`:

- **`preview`**: APK for testing (no signing required)
- **`production`**: AAB/IPA for store distribution (requires signing)
- **`development`**: Development build with dev tools

---

## Environment Variables in Builds

Your `.env` file with `EXPO_PUBLIC_API_URL` will be automatically included in the build.

Make sure your `.env` file exists:
```env
EXPO_PUBLIC_API_URL=https://timesheet-6uuv.onrender.com
```

---

## Updating the App

When you make changes and want a new build:

1. Update version in `app.json`:
   ```json
   "version": "1.0.1"  // Increment this
   ```

2. For Android, also increment `versionCode`:
   ```json
   "android": {
     "versionCode": 2  // Increment this
   }
   ```

3. Run build again:
   ```bash
   eas build --platform android --profile preview
   ```

---

## Troubleshooting

### "Project not found"
- Run `eas build:configure` again
- Make sure you're logged in: `eas whoami`

### Build fails
- Check the build logs at expo.dev
- Common issues:
  - Missing assets (icon.png, splash-icon.png)
  - Invalid app.json configuration
  - Network issues

### APK won't install on Android
- Enable "Install from Unknown Sources"
- Make sure you downloaded the APK (not AAB)
- Check Android version compatibility

### Need to change package name
- Update `android.package` in `app.json`
- Update `ios.bundleIdentifier` in `app.json`
- Run `eas build:configure` again

---

## Quick Commands Reference

```bash
# Login
eas login

# Configure project
eas build:configure

# Build Android APK (testing)
eas build --platform android --profile preview

# Build Android AAB (Play Store)
eas build --platform android --profile production

# Build iOS (App Store)
eas build --platform ios --profile production

# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

---

## Next Steps After Building

1. **Test the APK** on multiple Android devices
2. **Set up Google Play Console** (if distributing via Play Store)
3. **Create app store listings** (screenshots, descriptions)
4. **Set up app signing** for production builds
5. **Configure app updates** (OTA updates with EAS Update)

---

## Cost

- **EAS Build**: Free tier includes limited builds per month
- **Paid plans**: Start at $29/month for more builds
- **Apple Developer**: $99/year (required for iOS)
- **Google Play**: $25 one-time fee (for Play Store)

For testing, the free tier should be sufficient!

---

Need help? Check:
- EAS Docs: https://docs.expo.dev/build/introduction/
- Expo Forums: https://forums.expo.dev/
