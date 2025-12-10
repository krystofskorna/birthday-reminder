import React, { PropsWithChildren } from 'react';
import { PeopleProvider } from '@/contexts/PeopleContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CustomTypesProvider } from '@/contexts/CustomTypesContext';
import { PremiumProvider } from '@/contexts/PremiumContext';
import { ChecklistTemplatesProvider } from '@/contexts/ChecklistTemplatesContext';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SettingsProvider>
      <PremiumProvider>
        <CustomTypesProvider>
          <ChecklistTemplatesProvider>
            <PeopleProvider>{children}</PeopleProvider>
          </ChecklistTemplatesProvider>
        </CustomTypesProvider>
      </PremiumProvider>
    </SettingsProvider>
  );
}



