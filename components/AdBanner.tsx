import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

// Note: For Expo, you'll need to install and configure:
// - expo-ads-admob (deprecated) or
// - Use a config plugin for react-native-google-mobile-ads
// - Configure app.json with AdMob app ID

interface AdBannerProps {
  adUnitId?: string;
  size?: 'banner' | 'largeBanner' | 'mediumRectangle' | 'fullBanner' | 'leaderboard' | 'smartBannerPortrait' | 'smartBannerLandscape';
  style?: any;
}

export function AdBanner({ 
  adUnitId, 
  size = 'banner',
  style 
}: AdBannerProps) {
  const colors = useThemeColors();
  const [adLoaded, setAdLoaded] = useState(false);

  // Placeholder for AdMob integration
  // In production, replace this with actual AdMob banner component
  useEffect(() => {
    // Initialize AdMob here
    // Example:
    // import mobileAds from 'react-native-google-mobile-ads';
    // mobileAds().initialize();
  }, []);

  // For now, return a placeholder that can be replaced with actual AdMob component
  // Remove this in production and uncomment the AdMob code below
  
  if (__DEV__) {
    return (
      <View style={[styles.placeholder, { backgroundColor: colors.surface, borderColor: colors.primaryAccent }, style]}>
        {/* Placeholder - Replace with actual AdMob Banner */}
        {/* 
        <BannerAd
          unitId={adUnitId || 'ca-app-pub-3940256099942544/6300978111'} // Test ID
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => setAdLoaded(true)}
          onAdFailedToLoad={(error) => console.error('Ad failed to load:', error)}
        />
        */}
      </View>
    );
  }

  return null; // Hide in production until AdMob is configured
}

const styles = StyleSheet.create({
  placeholder: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 4,
  },
});

