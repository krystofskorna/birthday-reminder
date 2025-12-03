// AdMob service for managing ads
// This file provides utilities for showing interstitial ads

// Note: For Expo, you'll need to configure AdMob properly:
// 1. Add AdMob app ID to app.json
// 2. Install and configure react-native-google-mobile-ads or expo-ads-admob
// 3. Set up ad unit IDs in your AdMob account

let interstitialAd: any = null;
let isInitialized = false;

export async function initializeAds() {
  if (isInitialized) return;
  
  try {
    // Initialize AdMob
    // Example:
    // import mobileAds from 'react-native-google-mobile-ads';
    // await mobileAds().initialize();
    // 
    // Load interstitial ad
    // import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
    // interstitialAd = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
    //   requestNonPersonalizedAdsOnly: true,
    // });
    
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize ads:', error);
  }
}

export async function showInterstitialAd(): Promise<boolean> {
  try {
    if (!interstitialAd) {
      await initializeAds();
    }
    
    // Show interstitial ad
    // if (interstitialAd && await interstitialAd.load()) {
    //   await interstitialAd.show();
    //   return true;
    // }
    
    return false;
  } catch (error) {
    console.error('Failed to show interstitial ad:', error);
    return false;
  }
}

// Show interstitial ad after certain actions (e.g., adding a person)
export async function showInterstitialAfterAction() {
  // Show ad with some probability or after N actions
  const shouldShow = Math.random() < 0.3; // 30% chance
  if (shouldShow) {
    await showInterstitialAd();
  }
}

