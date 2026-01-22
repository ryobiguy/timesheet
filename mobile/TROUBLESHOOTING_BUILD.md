# Troubleshooting EAS Build Issues

## Getting Detailed Error Logs

If you get a generic "build command failed" error, try these steps:

### 1. Check EAS CLI Version

```bash
npx eas-cli --version
```

Update to latest:
```bash
npm install --save-dev eas-cli@latest
```

### 2. View Build Logs Online

1. Go to https://expo.dev
2. Login to your account
3. Navigate to your project: `clockly-mobile`
4. Click on "Builds" in the sidebar
5. Click on the failed build
6. View the detailed logs

### 3. Run Build with Verbose Logging

```bash
npx eas-cli build --platform android --profile preview --non-interactive
```

### 4. Check Common Issues

#### Missing Assets
Make sure these files exist:
- `assets/icon.png` (1024x1024px recommended)
- `assets/adaptive-icon.png` (1024x1024px for Android)
- `assets/splash-icon.png` (any size, will be resized)

#### Invalid app.json
Check that:
- `android.package` is set (e.g., `com.clockly.mobile`)
- `ios.bundleIdentifier` is set (e.g., `com.clockly.mobile`)
- `version` is set (e.g., `1.0.0`)
- `android.versionCode` is set (e.g., `1`)

#### Environment Variables
Make sure `.env` file exists with:
```
EXPO_PUBLIC_API_URL=https://timesheet-6uuv.onrender.com
```

### 5. Try Local Build (Alternative)

If EAS builds keep failing, you can try a local build:

```bash
# Install Expo CLI
npm install -g @expo/cli

# Build locally (requires Android SDK)
npx expo run:android
```

**Note:** Local builds require Android Studio and Android SDK setup.

### 6. Check Build Status

```bash
npx eas-cli build:list
```

This shows all your builds and their status.

### 7. Common Error Messages

#### "Invalid UUID appId"
- Run `npm run eas:configure` again
- Make sure `app.json` doesn't have placeholder project IDs

#### "Build request failed"
- Check the build logs at expo.dev
- Usually indicates a configuration or asset issue

#### "Asset not found"
- Verify all asset files exist in `assets/` folder
- Check file paths in `app.json` are correct

#### "Package name already exists"
- Change `android.package` in `app.json` to something unique
- Format: `com.yourcompany.appname`

### 8. Reset and Retry

If nothing works, try:

```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
npx expo start -c

# Try build again
npm run build:android
```

### 9. Contact Support

If the issue persists:
1. Check build logs at https://expo.dev
2. Copy the error message
3. Check Expo forums: https://forums.expo.dev
4. Open an issue: https://github.com/expo/expo/issues
