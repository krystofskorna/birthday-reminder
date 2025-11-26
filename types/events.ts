export type EventType = 'birthday' | 'nameday' | 'other';

export type ReminderLeadTime = 1 | 7 | 14 | 30;

export interface Person {
  id: string;
  name: string;
  date: string; // ISO yyyy-mm-dd
  type: EventType | string; // EventType or custom type ID
  note?: string;
  profileImageUri?: string;
  reminderEnabled: boolean;
  reminderLeadTime: ReminderLeadTime;
  createdAt: string;
  updatedAt: string;
}

export type Language = 'en' | 'cs';
export type ThemeName = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal';

export interface Settings {
  birthdayRemindersEnabled: boolean;
  nameDayRemindersEnabled: boolean;
  preferredLeadTime: ReminderLeadTime;
  preferredCountryCode?: string | null;
  icloudSyncEnabled: boolean;
  lastBackupDate?: string | null;
  language: Language;
  theme: ThemeName;
}



