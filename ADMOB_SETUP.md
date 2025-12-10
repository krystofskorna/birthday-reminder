# AdMob Setup Instructions

## Overview
AdMob integration has been set up with placeholder components. To enable actual ads, you need to complete the following steps.

## Steps to Enable AdMob

### 1. Create AdMob Account
- Go to https://admob.google.com/
- Create an account and add your app
- Get your AdMob App ID

### 2. Install AdMob Package

For Expo managed workflow, you have two options:

#### Option A: Use Expo Config Plugin (Recommended for Expo SDK 50+)
```bash
npm install react-native-google-mobile-ads
```

Then add to `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx",
          "iosAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"
        }
      ]
    ]
  }
}
```

#### Option B: Use Expo Development Build
You'll need to create a development build after adding the plugin.

### 3. Configure Ad Unit IDs

Update the following files with your actual ad unit IDs:

- `components/AdBanner.tsx` - Replace placeholder with actual BannerAd component
- `services/ads.ts` - Replace placeholder with actual InterstitialAd component

### 4. Test Ad Unit IDs

For testing, use Google's test ad unit IDs:
- Banner: `ca-app-pub-3940256099942544/6300978111`
- Interstitial: `ca-app-pub-3940256099942544/1033173712`

### 5. Update Components

Uncomment and configure the AdMob code in:
- `components/AdBanner.tsx`
- `services/ads.ts`

### 6. Build Native App

After configuration, you'll need to create a new development build:
```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

## Current Implementation

- ✅ AdBanner component structure created
- ✅ Interstitial ad service created
- ✅ Ad initialization in app root
- ✅ Interstitial triggers on person add
- ⚠️ Placeholder components (need actual AdMob integration)

## Notes

- The current implementation uses placeholder components that won't show ads until properly configured
- In development mode, a placeholder banner is shown
- In production, ads are hidden until AdMob is properly configured
- Make sure to comply with AdMob policies and test thoroughly before release

