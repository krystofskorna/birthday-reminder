import AsyncStorage from '@react-native-async-storage/async-storage';
import { Person, Settings } from '@/types/events';

const STORAGE_KEYS = {
  PEOPLE: '@birthday_reminder:people',
  SETTINGS: '@birthday_reminder:settings',
  CUSTOM_TYPES: '@birthday_reminder:custom_types',
} as const;

// People storage
export async function loadPeople(): Promise<Person[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PEOPLE);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading people:', error);
    return [];
  }
}

export async function savePeople(people: Person[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
  } catch (error) {
    console.error('Error saving people:', error);
    throw error;
  }
}

// Settings storage
export async function loadSettings(): Promise<Settings | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// Custom types storage
export async function loadCustomTypes(): Promise<any[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_TYPES);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading custom types:', error);
    return [];
  }
}

export async function saveCustomTypes(customTypes: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_TYPES, JSON.stringify(customTypes));
  } catch (error) {
    console.error('Error saving custom types:', error);
    throw error;
  }
}

// Clear all data
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PEOPLE,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.CUSTOM_TYPES,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

