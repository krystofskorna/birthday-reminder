// Widget data sharing service
// This service shares data between the main app and WidgetKit extension
// Uses App Group UserDefaults or SharedPreferences

import { Person } from '@/types/events';
import { loadPeople } from './storage';

const APP_GROUP_IDENTIFIER = 'group.com.yourcompany.birthdayreminder'; // Update with your app group ID
const WIDGET_DATA_KEY = 'people';

/**
 * Share people data with WidgetKit extension
 * This should be called whenever people data changes
 */
export async function updateWidgetData(): Promise<void> {
  try {
    const people = await loadPeople();
    
    // For iOS, we need to use App Group UserDefaults
    // For Expo, this requires a native module or config plugin
    
    // Native implementation would be:
    // const { WidgetData } = require('./native/WidgetData');
    // await WidgetData.saveToAppGroup(APP_GROUP_IDENTIFIER, WIDGET_DATA_KEY, people);
    
    // For now, log that we would update widget data
    console.log('Widget data would be updated with', people.length, 'people');
    
    // In production, implement native module to:
    // 1. Get UserDefaults with suiteName = APP_GROUP_IDENTIFIER
    // 2. Save people array as JSON
    // 3. Widget extension reads from same App Group
  } catch (error) {
    console.error('Failed to update widget data:', error);
  }
}

/**
 * Format people data for widget display
 */
export function formatPeopleForWidget(people: Person[]): any[] {
  const now = new Date();
  const upcoming = people
    .map((person) => {
      const eventDate = new Date(person.date);
      const nextOccurrence = getNextYearlyOccurrence(eventDate, now);
      const daysUntil = Math.floor((nextOccurrence.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil >= 0 && daysUntil <= 7) {
        return {
          name: person.name,
          date: person.date,
          type: person.type,
          daysUntil,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5); // Limit to 5 events
  
  return upcoming;
}

function getNextYearlyOccurrence(eventDate: Date, fromDate: Date): Date {
  const currentYear = fromDate.getFullYear();
  const eventMonth = eventDate.getMonth();
  const eventDay = eventDate.getDate();
  
  let nextDate = new Date(currentYear, eventMonth, eventDay);
  
  if (nextDate < fromDate) {
    nextDate = new Date(currentYear + 1, eventMonth, eventDay);
  }
  
  return nextDate;
}

