import React, { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CustomEventType } from '@/types/customTypes';
import { loadCustomTypes, saveCustomTypes } from '@/services/storage';

interface CustomTypesContextValue {
  customTypes: CustomEventType[];
  addCustomType: (name: string, icon: string, color: string) => CustomEventType;
  removeCustomType: (id: string) => void;
  getCustomType: (id: string) => CustomEventType | undefined;
}

const CustomTypesContext = React.createContext<CustomTypesContextValue | undefined>(undefined);

export function CustomTypesProvider({ children }: PropsWithChildren) {
  const [customTypes, setCustomTypes] = useState<CustomEventType[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Load custom types from persistent storage
    loadCustomTypes().then((types) => {
      setCustomTypes(types);
      setHasLoaded(true);
    });
  }, []);

  const addCustomType = useCallback((name: string, icon: string, color: string): CustomEventType => {
    const newType: CustomEventType = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      icon,
      color,
      createdAt: new Date().toISOString(),
    };
    setCustomTypes((prev) => {
      const updated = [...prev, newType];
      if (hasLoaded) saveCustomTypes(updated).catch(console.error);
      return updated;
    });
    return newType;
  }, [hasLoaded]);

  const removeCustomType = useCallback((id: string) => {
    setCustomTypes((prev) => {
      const updated = prev.filter((type) => type.id !== id);
      if (hasLoaded) saveCustomTypes(updated).catch(console.error);
      return updated;
    });
  }, [hasLoaded]);

  const getCustomType = useCallback(
    (id: string) => customTypes.find((type) => type.id === id),
    [customTypes],
  );

  const value = useMemo<CustomTypesContextValue>(
    () => ({
      customTypes,
      addCustomType,
      removeCustomType,
      getCustomType,
    }),
    [customTypes, addCustomType, removeCustomType, getCustomType],
  );

  return <CustomTypesContext.Provider value={value}>{children}</CustomTypesContext.Provider>;
}

export function useCustomTypes() {
  const context = useContext(CustomTypesContext);
  if (!context) {
    throw new Error('useCustomTypes must be used within a CustomTypesProvider');
  }
  return context;
}


