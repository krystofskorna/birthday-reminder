import { ReminderLeadTime, Language } from '@/types/events';
import { getTranslation } from '@/lib/translations';

export function getReminderOptions(language: Language = 'en', isPremium: boolean = false): { label: string; value: ReminderLeadTime; description: string }[] {
  const allOptions = [
    { label: getTranslation(language, 'onDayLabel'), value: 0, description: getTranslation(language, 'onDayDesc') },
    { label: getTranslation(language, 'oneDayBeforeLabel'), value: 1, description: getTranslation(language, 'oneDayBeforeDesc') },
    { label: getTranslation(language, 'threeDaysBeforeLabel'), value: 3, description: getTranslation(language, 'threeDaysBeforeDesc') },
    { label: getTranslation(language, 'oneWeekBeforeLabel'), value: 7, description: getTranslation(language, 'oneWeekBeforeDesc') },
  ];

  // Free users: only 0 and 1 day options
  // Premium users: all options (0, 1, 3, 7 days)
  if (isPremium) {
    return allOptions;
  } else {
    return allOptions.filter(option => option.value <= 1);
  }
}




