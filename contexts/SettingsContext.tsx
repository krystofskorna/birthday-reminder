import React, { PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { ReminderLeadTime, Settings, Language, ThemeName } from '@/types/events';

const defaultSettings: Settings = {
  birthdayRemindersEnabled: true,
  nameDayRemindersEnabled: true,
  preferredLeadTime: 1,
  preferredCountryCode: 'cs_CZ',
  icloudSyncEnabled: false,
  lastBackupDate: null,
  language: 'en' as Language,
  theme: 'blue' as ThemeName,
};

interface SettingsContextValue {
  settings: Settings;
  setBirthdayRemindersEnabled: (value: boolean) => void;
  setNameDayRemindersEnabled: (value: boolean) => void;
  setPreferredLeadTime: (value: ReminderLeadTime) => void;
  setPreferredCountryCode: (code: string | null) => void;
  setIcloudSyncEnabled: (value: boolean) => void;
  markBackupComplete: (date: Date) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeName) => void;
}

const SettingsContext = React.createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const setBirthdayRemindersEnabled = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, birthdayRemindersEnabled: value }));
  }, []);

  const setNameDayRemindersEnabled = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, nameDayRemindersEnabled: value }));
  }, []);

  const setPreferredLeadTime = useCallback((value: ReminderLeadTime) => {
    setSettings((prev) => ({ ...prev, preferredLeadTime: value }));
  }, []);

  const setPreferredCountryCode = useCallback((code: string | null) => {
    setSettings((prev) => ({ ...prev, preferredCountryCode: code ?? undefined }));
  }, []);

  const setIcloudSyncEnabled = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, icloudSyncEnabled: value }));
  }, []);

  const markBackupComplete = useCallback((date: Date) => {
    setSettings((prev) => ({ ...prev, lastBackupDate: date.toISOString() }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setSettings((prev) => ({ ...prev, language }));
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setBirthdayRemindersEnabled,
      setNameDayRemindersEnabled,
      setPreferredLeadTime,
      setPreferredCountryCode,
      setIcloudSyncEnabled,
      markBackupComplete,
      setLanguage,
      setTheme,
    }),
    [
      settings,
      setBirthdayRemindersEnabled,
      setNameDayRemindersEnabled,
      setPreferredLeadTime,
      setPreferredCountryCode,
      setIcloudSyncEnabled,
      markBackupComplete,
      setLanguage,
      setTheme,
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




