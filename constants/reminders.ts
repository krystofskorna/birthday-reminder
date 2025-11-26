import { ReminderLeadTime, Language } from '@/types/events';
import { getTranslation } from '@/lib/translations';

export function getReminderOptions(language: Language = 'en'): { label: string; value: ReminderLeadTime; description: string }[] {
  return [
    { label: getTranslation(language, 'oneDayBeforeLabel'), value: 1, description: getTranslation(language, 'oneDayBeforeDesc') },
    { label: getTranslation(language, 'oneWeekBeforeLabel'), value: 7, description: getTranslation(language, 'oneWeekBeforeDesc') },
    { label: getTranslation(language, 'oneMonthBeforeLabel'), value: 30, description: getTranslation(language, 'oneMonthBeforeDesc') },
  ];
}




