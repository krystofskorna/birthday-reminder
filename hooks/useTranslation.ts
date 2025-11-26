import { useSettings } from '@/contexts/SettingsContext';
import { getTranslation, TranslationKey } from '@/lib/translations';

export function useTranslation() {
  const { settings } = useSettings();
  const language = settings.language;

  return (key: TranslationKey, ...args: any[]): string => {
    return getTranslation(language, key, ...args);
  };
}

