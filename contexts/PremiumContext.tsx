import React, { PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { useSettings } from './SettingsContext';

interface PremiumContextValue {
  isPremium: boolean;
  canUseAdvancedNotifications: boolean; // 0-7 days vs 0-1 days
  canUseAllThemes: boolean; // All 6 vs 2 themes
  canUseCloudSync: boolean;
  canUseChecklists: boolean;
  canUseOneTapActions: boolean;
  shouldShowAds: boolean;
}

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

export function PremiumProvider({ children }: PropsWithChildren) {
  const { settings } = useSettings();
  const isPremium = settings.isPremium ?? false;

  const value = useMemo<PremiumContextValue>(
    () => ({
      isPremium,
      canUseAdvancedNotifications: isPremium, // Premium: 0-7 days, Free: 0-1 days
      canUseAllThemes: isPremium, // Premium: All 6, Free: 2 themes (blue, purple)
      canUseCloudSync: isPremium, // Premium only
      canUseChecklists: isPremium, // Premium only
      canUseOneTapActions: isPremium, // Premium only
      shouldShowAds: !isPremium, // Hide ads for premium
    }),
    [isPremium],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}


