# Debugging Guide

## Viewing Metro Bundler Console

The Metro bundler console is displayed in the **terminal where you started the Expo server**.

### Steps:
1. Look at the terminal window where you ran `npm start` or `expo start`
2. You'll see logs like:
   - `Metro waiting on exp://...`
   - `Bundling JavaScript...`
   - Any errors or warnings

### To see more detailed logs:
- Press `j` in the Metro terminal to open the debugger
- Press `r` to reload the app
- Press `m` to toggle menu
- Check for red error messages in the terminal

## Viewing Device Logs

### Android:
```bash
npx react-native log-android
# or
adb logcat
```

### iOS:
```bash
npx react-native log-ios
```

### Expo Go:
- Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to open the developer menu
- Select "Debug Remote JS" to see console logs in Chrome DevTools

## Common Issues

### Boolean Casting Error
If you see "java.lang.String cannot be cast to java.lang.Boolean":
- Check all boolean props are explicitly set (e.g., `disabled={true}` not `disabled="true"`)
- Check TextInput props like `secureTextEntry={true}`
- Check Navigation props like `headerShown={false}`

### Clear Cache
```bash
npx expo start -c
```
