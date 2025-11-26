import React, { PropsWithChildren } from 'react';
import { PeopleProvider } from '@/contexts/PeopleContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CustomTypesProvider } from '@/contexts/CustomTypesContext';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SettingsProvider>
      <CustomTypesProvider>
        <PeopleProvider>{children}</PeopleProvider>
      </CustomTypesProvider>
    </SettingsProvider>
  );
}



