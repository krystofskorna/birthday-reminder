export type ThemeName = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal';

export interface ThemeColors {
  primaryAccent: string;
  namedayAccent: string;
  otherAccent: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  blue: {
    primaryAccent: '#6CA8F1',      // Blue for birthday
    namedayAccent: '#FF6B6B',      // Coral red for name day
    otherAccent: '#D8B4FE',        // Light purple for other
  },
  purple: {
    primaryAccent: '#9B59B6',      // Purple for birthday
    namedayAccent: '#E74C3C',      // Red for name day
    otherAccent: '#BB8FCE',        // Light purple for other
  },
  green: {
    primaryAccent: '#52C41A',      // Green for birthday
    namedayAccent: '#1890FF',      // Blue for name day
    otherAccent: '#95DE64',        // Light green for other
  },
  orange: {
    primaryAccent: '#FF7A45',      // Orange for birthday
    namedayAccent: '#722ED1',      // Purple for name day
    otherAccent: '#FFB896',        // Light orange for other
  },
  pink: {
    primaryAccent: '#EB2F96',      // Pink for birthday
    namedayAccent: '#13C2C2',      // Teal for name day
    otherAccent: '#FFADD2',        // Light pink for other
  },
  teal: {
    primaryAccent: '#13C2C2',      // Teal for birthday
    namedayAccent: '#F5222D',      // Red for name day
    otherAccent: '#5CDBD3',        // Light teal for other
  },
};

export const themeNames: Record<ThemeName, { en: string; cs: string; icon: string }> = {
  blue: { en: 'Ocean Blue', cs: 'Oceánská modř', icon: '🌊' },
  purple: { en: 'Royal Purple', cs: 'Královská fialová', icon: '👑' },
  green: { en: 'Forest Green', cs: 'Lesní zelená', icon: '🌲' },
  orange: { en: 'Sunset Orange', cs: 'Západ slunce', icon: '🌅' },
  pink: { en: 'Blossom Pink', cs: 'Květinová růžová', icon: '🌸' },
  teal: { en: 'Mint Teal', cs: 'Mátová tyrkysová', icon: '🌿' },
};

