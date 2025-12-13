import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { usePremium } from '@/contexts/PremiumContext';

// Lazy import to avoid errors if module is not available
let BannerAdComponent: any = null;
let BannerAdSizeEnum: any = null;
let TestIdsEnum: any = null;

function loadAdsModule() {
  // Temporarily disable ads until native module is properly linked
  // TODO: Re-enable after fixing native module linking
  return false;
  
  /* Original code - disabled until native module is fixed
  if (BannerAdComponent) return true;
  
  // Check if module is available before requiring
  try {
    // Use a more defensive approach - check if we're in a native environment
    if (typeof require === 'undefined') {
      return false;
    }
    
    // Try to require the module
    const adsModule = require('react-native-google-mobile-ads');
    
    // Check if required module has the expected exports
    if (!adsModule || !adsModule.BannerAd) {
      console.warn('Google Mobile Ads module missing expected exports');
      return false;
    }
    
    BannerAdComponent = adsModule.BannerAd;
    BannerAdSizeEnum = adsModule.BannerAdSize;
    TestIdsEnum = adsModule.TestIds;
    return true;
  } catch (error: any) {
    // Silently fail - ads are optional
    if (error?.message?.includes('RNGoogleMobileAdsModule')) {
      console.warn('Google Mobile Ads native module not linked. Ads will be disabled.');
    }
    return false;
  }
  */
}

interface AdBannerProps {
  adUnitId?: string;
  size?: any; // BannerAdSize - loaded dynamically
  style?: any;
}

export function AdBanner({ 
  adUnitId, 
  size,
  style 
}: AdBannerProps) {
  const colors = useThemeColors();
  const { shouldShowAds } = usePremium();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adsModuleLoaded, setAdsModuleLoaded] = useState(false);

  useEffect(() => {
    // Try to load ads module with error handling
    try {
      if (loadAdsModule()) {
        setAdsModuleLoaded(true);
      }
    } catch (error) {
      // Silently fail - ads are optional
      console.warn('Failed to load ads module:', error);
      setAdsModuleLoaded(false);
    }
  }, []);

  // Hide ads for premium users or if module not available
  if (!shouldShowAds || !adsModuleLoaded || !BannerAdComponent) {
    return null;
  }

  // Use test ad unit ID in development, actual ad unit ID in production
  const unitId = __DEV__ 
    ? TestIdsEnum?.BANNER 
    : (adUnitId || 'ca-app-pub-7020548231542184/5813119287'); // Your actual Banner ad unit ID

  const bannerSize = size || BannerAdSizeEnum?.BANNER;

  if (!unitId || !bannerSize) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAdComponent
        unitId={unitId}
        size={bannerSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          setAdLoaded(true);
        }}
        onAdFailedToLoad={(error: any) => {
          console.error('Ad failed to load:', error);
          setAdLoaded(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

