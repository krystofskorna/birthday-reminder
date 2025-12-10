import { useColorScheme } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { themes } from '@/lib/themes';

export function useThemeColors() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  let settings;
  try {
    settings = useSettings().settings;
  } catch (error) {
    // Fallback if SettingsProvider is not available yet
    settings = { theme: 'blue' as const };
  }
  const themeColors = themes[settings.theme];

  return {
    isDark,
    background: isDark ? '#1C1C1E' : '#FFFFFF',
    surface: isDark ? '#2C2C2E' : '#F8F8F8',
    primaryAccent: themeColors.primaryAccent,
    namedayAccent: themeColors.namedayAccent,
    otherAccent: themeColors.otherAccent,
    textPrimary: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#B0B0B0' : '#7A7A7A',
    cardShadow: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.08)',
    muted: isDark ? '#666A70' : '#9AA0A6',
    success: '#4CAF50',
    danger: '#EF5350',
  };
}



