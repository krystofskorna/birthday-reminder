import React, { PropsWithChildren, useCallback, useContext, createContext, useEffect, useMemo, useState } from 'react';
import { ChecklistTemplate } from '@/types/checklist';
import { loadChecklistTemplates, saveChecklistTemplates } from '@/services/storage';

const ChecklistTemplatesContext = createContext<ChecklistTemplatesContextValue | undefined>(undefined);

interface ChecklistTemplatesContextValue {
  templates: ChecklistTemplate[];
  hasLoaded: boolean;
  addTemplate: (name: string, items: { text: string }[]) => ChecklistTemplate;
  updateTemplate: (id: string, name: string, items: { text: string }[]) => void;
  removeTemplate: (id: string) => void;
  getTemplate: (id: string) => ChecklistTemplate | undefined;
}

function generateTemplateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function ChecklistTemplatesProvider({ children }: PropsWithChildren) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Load templates from storage
    loadChecklistTemplates().then((loadedTemplates) => {
      if (loadedTemplates) {
        setTemplates(loadedTemplates);
      }
      setHasLoaded(true);
    });
  }, []);

  // Save to storage whenever templates change (after initial load)
  useEffect(() => {
    if (hasLoaded) {
      saveChecklistTemplates(templates).catch(console.error);
    }
  }, [templates, hasLoaded]);

  const addTemplate = useCallback((name: string, items: { text: string }[]): ChecklistTemplate => {
    const newTemplate: ChecklistTemplate = {
      id: generateTemplateId(),
      name,
      items: items.map((item, index) => ({ id: `item_${Date.now()}_${index}`, text: item.text })),
    };
    setTemplates((prev) => [...prev, newTemplate]);
    return newTemplate;
  }, []);

  const updateTemplate = useCallback((id: string, name: string, items: { text: string }[]) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === id
          ? { ...template, name, items: items.map((item, index) => ({ id: item.id || `item_${Date.now()}_${index}`, text: item.text })) }
          : template
      )
    );
  }, []);

  const removeTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id));
  }, []);

  const getTemplate = useCallback(
    (id: string) => templates.find((template) => template.id === id),
    [templates]
  );

  const value = useMemo<ChecklistTemplatesContextValue>(
    () => ({
      templates,
      hasLoaded,
      addTemplate,
      updateTemplate,
      removeTemplate,
      getTemplate,
    }),
    [templates, hasLoaded, addTemplate, updateTemplate, removeTemplate, getTemplate]
  );

  return (
    <ChecklistTemplatesContext.Provider value={value}>
      {children}
    </ChecklistTemplatesContext.Provider>
  );
}

export function useChecklistTemplates() {
  const context = useContext(ChecklistTemplatesContext);
  if (!context) {
    throw new Error('useChecklistTemplates must be used within a ChecklistTemplatesProvider');
  }
  return context;
}

