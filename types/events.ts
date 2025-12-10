export type EventType = 'birthday' | 'nameday' | 'other';

export type ReminderLeadTime = number;

export interface Person {
  id: string;
  name: string; // Full name (computed from firstName + lastName or stored directly)
  firstName?: string; // First name (křestní jméno)
  lastName?: string; // Last name (příjmení)
  date: string; // ISO yyyy-mm-dd
  type: EventType | string; // EventType or custom type ID
  note?: string;
  profileImageUri?: string;
  phoneNumber?: string; // For contact integration and one-tap actions
  reminderEnabled: boolean;
  reminderLeadTime: ReminderLeadTime; // days before event
  reminderTime?: string; // HH:mm format, defaults to 09:00
  linkedNamedayId?: string; // ID of linked nameday person (if birthday and nameday are linked)
  createdAt: string;
  updatedAt: string;
}

export type Language = 'en' | 'cs';
export type ThemeName = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal';

export interface Settings {
  birthdayRemindersEnabled: boolean;
  nameDayRemindersEnabled: boolean;
  preferredCountryCode?: string | null;
  icloudSyncEnabled: boolean;
  lastBackupDate?: string | null;
  language: Language;
  theme: ThemeName;
  isPremium: boolean; // Premium subscription status
}



