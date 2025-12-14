// AdMob service for managing ads
// This file provides utilities for showing interstitial ads

// Lazy import to avoid errors if module is not available
let mobileAdsModule: any = null;
let InterstitialAdClass: any = null;
let AdEventTypeEnum: any = null;
let TestIdsEnum: any = null;
let moduleChecked = false;

function checkAdsModule() {
  if (moduleChecked) return mobileAdsModule !== null;
  
  moduleChecked = true;
  
  // Check if module is available before requiring
  try {
    if (typeof require === 'undefined') {
      return false;
    }
    
    // Try to require the module
    const adsModule = require('react-native-google-mobile-ads');
    
    // Check if required module has the expected exports
    if (!adsModule) {
      return false;
    }
    
    mobileAdsModule = adsModule.default || adsModule;
    InterstitialAdClass = adsModule.InterstitialAd;
    AdEventTypeEnum = adsModule.AdEventType;
    TestIdsEnum = adsModule.TestIds;
    
    // Verify we got the expected classes
    if (!mobileAdsModule || !InterstitialAdClass) {
      return false;
    }
    
    return true;
  } catch (error: any) {
    // Silently fail - ads are optional
    if (error?.message?.includes('RNGoogleMobileAdsModule')) {
      console.warn('Google Mobile Ads native module not linked. Ads will be disabled.');
    }
    return false;
  }
}

let interstitialAd: any = null;
let isInitialized = false;
let isAdLoaded = false;

export async function initializeAds() {
  if (isInitialized) return;
  
  // Don't initialize in Expo Go - native module not available
  if (__DEV__ && typeof require !== 'undefined') {
    try {
      // Test if we're in Expo Go by checking for native module
      require('react-native-google-mobile-ads');
    } catch {
      // In Expo Go - skip initialization silently
      console.log('AdMob: Skipping initialization in Expo Go (native module not available)');
      return;
    }
  }
  
  // Check if module is available (lazy load)
  if (!checkAdsModule() || !mobileAdsModule || !InterstitialAdClass) {
    console.warn('Google Mobile Ads module not available, skipping initialization');
    return;
  }
  
  try {
    // Initialize AdMob
    await mobileAdsModule().initialize();
    
    // Create and load interstitial ad
    // Use test ad unit ID in development, actual ad unit ID in production
    const adUnitId = __DEV__ 
      ? TestIdsEnum?.INTERSTITIAL 
      : 'ca-app-pub-7020548231542184/5813119287'; // TODO: Create separate interstitial ad unit in AdMob
    
    if (!adUnitId) {
      console.warn('Ad unit ID not available');
      return;
    }
    
    interstitialAd = InterstitialAdClass.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Set up event listeners
    const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventTypeEnum?.LOADED, () => {
      isAdLoaded = true;
    });

    const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventTypeEnum?.CLOSED, () => {
      isAdLoaded = false;
      // Reload the ad for next time
      interstitialAd?.load();
    });

    const unsubscribeError = interstitialAd.addAdEventListener(AdEventTypeEnum?.ERROR, (error: any) => {
      // Only log non-critical errors (no-fill is expected sometimes)
      if (error?.code !== 'googleMobileAds/no-fill') {
        console.error('Interstitial ad error:', error);
      }
      isAdLoaded = false;
    });

    // Load the ad
    interstitialAd.load();
    
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize ads:', error);
  }
}

export async function showInterstitialAd(): Promise<boolean> {
  try {
    // Check if module is available (lazy load)
    if (!checkAdsModule() || !mobileAdsModule || !InterstitialAdClass) {
      return false;
    }
    
    if (!interstitialAd) {
      await initializeAds();
      // Wait a bit for the ad to load
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Check if ad is loaded and show it
    if (interstitialAd && isAdLoaded) {
      await interstitialAd.show();
      isAdLoaded = false; // Mark as shown, will be reloaded by event listener
      return true;
    } else {
      // Try to load if not loaded
      if (interstitialAd && !isAdLoaded) {
        interstitialAd.load();
      }
      return false;
    }
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

