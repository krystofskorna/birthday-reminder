// Contact integration service for importing from native contacts
import * as Contacts from 'expo-contacts';
import { Person } from '@/types/events';
import { toISODate } from '@/lib/date';

export interface ContactData {
  name: string;
  phoneNumber?: string;
  birthday?: string; // ISO yyyy-mm-dd format
}

/**
 * Request contacts permission
 */
export async function requestContactsPermission(): Promise<boolean> {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to request contacts permission:', error);
    return false;
  }
}

/**
 * Check if contacts permission is granted
 */
export async function hasContactsPermission(): Promise<boolean> {
  try {
    const { status } = await Contacts.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to check contacts permission:', error);
    return false;
  }
}

/**
 * Get all contacts from device
 */
export async function getAllContacts(): Promise<Contacts.Contact[]> {
  try {
    const hasPermission = await requestContactsPermission();
    if (!hasPermission) {
      throw new Error('Contacts permission not granted');
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Birthday,
      ],
    });

    return data;
  } catch (error) {
    console.error('Failed to get contacts:', error);
    return [];
  }
}

/**
 * Convert native contact to ContactData
 */
export function contactToContactData(contact: Contacts.Contact): ContactData {
  const phoneNumber = contact.phoneNumbers?.[0]?.number;
  
  // Extract birthday if available
  let birthday: string | undefined;
  if (contact.birthday) {
    // Contact birthday format: { year, month, day }
    const { year, month, day } = contact.birthday;
    if (year && month && day) {
      // Month is 1-indexed in Contacts API
      const date = new Date(year, month - 1, day);
      birthday = toISODate(date);
    }
  }

  return {
    name: contact.name || '',
    phoneNumber,
    birthday,
  };
}

/**
 * Check if a contact already exists in the app's database
 * Compares by name and phone number
 */
export function findExistingPerson(
  contactData: ContactData,
  existingPeople: Person[]
): Person | undefined {
  return existingPeople.find((person) => {
    // Match by name (case-insensitive)
    const nameMatch = person.name.toLowerCase() === contactData.name.toLowerCase();
    
    // Match by phone number if both exist
    if (contactData.phoneNumber && person.phoneNumber) {
      // Normalize phone numbers (remove spaces, dashes, etc.)
      const normalize = (phone: string) => phone.replace(/[\s\-\(\)]/g, '');
      const phoneMatch = normalize(person.phoneNumber) === normalize(contactData.phoneNumber);
      return nameMatch || phoneMatch;
    }
    
    return nameMatch;
  });
}

