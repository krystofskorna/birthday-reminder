import React, { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ReminderLeadTime, Settings, Language, ThemeName } from '@/types/events';
import { loadSettings, saveSettings } from '@/services/storage';
import { setCloudKitEnabled, performFullSync, initializeICloud } from '@/services/icloudSync';

const defaultSettings: Settings = {
  birthdayRemindersEnabled: true,
  nameDayRemindersEnabled: true,
  preferredCountryCode: 'cs_CZ',
  icloudSyncEnabled: false,
  lastBackupDate: null,
  language: 'en' as Language,
  theme: 'blue' as ThemeName,
  isPremium: false, // Default to free tier
};

interface SettingsContextValue {
  settings: Settings;
  setBirthdayRemindersEnabled: (value: boolean) => void;
  setNameDayRemindersEnabled: (value: boolean) => void;
  setPreferredCountryCode: (code: string | null) => void;
  setIcloudSyncEnabled: (value: boolean) => void;
  markBackupComplete: (date: Date) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeName) => void;
  setIsPremium: (value: boolean) => void;
}

const SettingsContext = React.createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Load settings from persistent storage
    loadSettings().then((loadedSettings) => {
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
      setHasLoaded(true);
    });
  }, []);

  const setBirthdayRemindersEnabled = useCallback((value: boolean) => {
    setSettings((prev) => {
      const updated = { ...prev, birthdayRemindersEnabled: value };
      if (hasLoaded) saveSettings(updated).catch(console.error);
      return updated;
    });
  }, [hasLoaded]);

  const setNameDayRemindersEnabled = useCallback((value: boolean) => {
    setSettings((prev) => {
      const updated = { ...prev, nameDayRemindersEnabled: value };
      if (hasLoaded) saveSettings(updated).catch(console.error);
      return updated;
    });
  }, [hasLoaded]);

  const setPreferredCountryCode = useCallback((code: string | null) => {
    setSettings((prev) => {
      const updated = { ...prev, preferredCountryCode: code ?? undefined };
      if (hasLoaded) saveSettings(updated).catch(console.error);
      return updated;
    });
  }, [hasLoaded]);

  const setIcloudSyncEnabled = useCallback(async (value: boolean) => {
    setSettings((prev) => {
      const updated = { ...prev, icloudSyncEnabled: value };
      if (hasLoaded) {
        saveSettings(updated).catch(console.error);
        // Enable/disable iCloud sync
        setCloudKitEnabled(value);
        // Perform initial sync if enabling
        if (value) {
          // Initialize iCloud and perform sync
          initializeICloud().then((initialized) => {
            if (initialized) {
              performFullSync().catch(console.error);
            } else {
              console.warn('iCloud sync failed to initialize');
            }
          }).catch(console.error);
        }
      }
      return updated;
    });
  }, [hasLoaded]);

  const markBackupComplete = useCallback((date: Date) => {
    setSettings((prev) => {
      const updated = { ...prev, lastBackupDate: date.toISOString() };
      if (hasLoaded) saveSettings(updated).catch(console.error);
      return updated;
    });
  }, [hasLoaded]);

  const setLanguage = useCallback((language: Language) => {
    setSettings((prev) => {
      const updated = { ...prev, language };
      if (hasLoaded) saveSettings(updated).catch(console.error);
      return updated;
    });
  }, [hasLoaded]);

  const setTheme = useCallback((theme: ThemeName) => {
    setSettings((prev) => {
      const updated = { ...prev, theme };
      if (hasLoaded) saveSettings(updated).catch(console.error);
      return updated;
    });
  }, [hasLoaded]);

  const setIsPremium = useCallback((value: boolean) => {
    setSettings((prev) => {
      const updated = { ...prev, isPremium: value };
      if (hasLoaded) saveSettings(updated).catch(console.error);
      return updated;
    });
  }, [hasLoaded]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setBirthdayRemindersEnabled,
      setNameDayRemindersEnabled,
      setPreferredCountryCode,
      setIcloudSyncEnabled,
      markBackupComplete,
      setLanguage,
      setTheme,
      setIsPremium,
    }),
    [
      settings,
      setBirthdayRemindersEnabled,
      setNameDayRemindersEnabled,
      setPreferredCountryCode,
      setIcloudSyncEnabled,
      markBackupComplete,
      setLanguage,
      setTheme,
      setIsPremium,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}




