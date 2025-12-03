import { ReminderLeadTime, Language } from '@/types/events';
import { getTranslation } from '@/lib/translations';

export function getReminderOptions(language: Language = 'en'): { label: string; value: ReminderLeadTime; description: string }[] {
  return [
    { label: getTranslation(language, 'onDayLabel'), value: 0, description: getTranslation(language, 'onDayDesc') },
    { label: getTranslation(language, 'oneDayBeforeLabel'), value: 1, description: getTranslation(language, 'oneDayBeforeDesc') },
    { label: getTranslation(language, 'threeDaysBeforeLabel'), value: 3, description: getTranslation(language, 'threeDaysBeforeDesc') },
    { label: getTranslation(language, 'oneWeekBeforeLabel'), value: 7, description: getTranslation(language, 'oneWeekBeforeDesc') },
  ];
}




