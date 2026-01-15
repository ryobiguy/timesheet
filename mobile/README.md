# Clockly Mobile App

Mobile app for contractors to track GPS location and automatically clock in/out when entering/exiting jobsite geofences.

## Features

- **GPS Tracking**: Continuous location tracking with background support
- **Geofence Detection**: Automatically detects when entering/exiting jobsite boundaries
- **Auto Clock In/Out**: Automatically creates time entries when geofence events occur
- **Assigned Jobsites**: View all jobsites you're assigned to
- **Current Status**: See if you're currently clocked in and which jobsite

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variable:
```bash
# Create .env file
EXPO_PUBLIC_API_URL=https://timesheet-6uuv.onrender.com
```

3. Start the app:
```bash
npm start
```

Then scan the QR code with Expo Go app on your phone, or:
- `npm run android` for Android emulator
- `npm run ios` for iOS simulator (macOS only)

## Permissions

The app requires location permissions:
- **Foreground**: To track location while app is open
- **Background**: To continue tracking when app is in background

## Usage

1. **Login**: Use your worker credentials
2. **Start Tracking**: Tap "Start Tracking" to begin GPS monitoring
3. **Automatic Clock In/Out**: When you enter a jobsite geofence, you'll be automatically clocked in. When you exit, you'll be clocked out.
4. **View Status**: See your current clock status and assigned jobsites on the home screen

## Development

Built with:
- React Native (Expo)
- TypeScript
- React Navigation
- Expo Location
- Axios for API calls
