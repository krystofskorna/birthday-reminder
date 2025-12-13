import { searchNamedayByName } from '@/services/namedayApi';

const datasets: Record<string, Record<string, string>> = {
  cs_CZ: require('@/data/nameDays/cs_CZ.json'),
  sk_SK: require('@/data/nameDays/sk_SK.json'),
};

/**
 * Suggest nameday date for a given name and country code
 * Uses local dataset (API integration disabled until correct endpoint is found)
 * Returns Promise for backward compatibility, but works synchronously
 */
export async function suggestNameDayDate(
  name: string,
  countryCode?: string | null,
  useApi: boolean = false // Disabled until API endpoint is fixed
): Promise<Date | null> {
  // Use synchronous version since we're not using API
  return Promise.resolve(suggestNameDayDateSync(name, countryCode));
}

/**
 * Synchronous version for backward compatibility (uses only local data)
 */
export function suggestNameDayDateSync(name: string, countryCode?: string | null): Date | null {
  if (!name || !countryCode) return null;
  const data = datasets[countryCode];
  if (!data) return null;
  const normalized = normalize(name);
  const entry = Object.entries(data).find(([rawName]) => normalize(rawName) === normalized);
  if (!entry) return null;
  const date = parseMonthDay(entry[1]);
  return date;
}

import { getAvailableNamedayCountries } from '@/services/namedayApi';

export function availableNameDayCountries() {
  // Use API countries list which includes more countries
  return getAvailableNamedayCountries();
}

function parseMonthDay(monthDay: string): Date | null {
  const [month, day] = monthDay.split('-').map(Number);
  if (!month || !day) return null;
  const now = new Date();
  return new Date(now.getFullYear(), month - 1, day);
}

/**
 * Normalize name for comparison - removes diacritics and converts to lowercase
 * This allows matching "Tomas" with "Tomáš", "Jan" with "Jan", etc.
 */
function normalize(value: string): string {
  if (!value) return '';
  
  return value
    .toLocaleLowerCase('cs-CZ') // Use Czech locale for proper normalization
    .normalize('NFD') // Decompose characters (é -> e + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[čć]/g, 'c') // Handle Czech-specific characters
    .replace(/[ď]/g, 'd')
    .replace(/[ě]/g, 'e')
    .replace(/[ň]/g, 'n')
    .replace(/[ř]/g, 'r')
    .replace(/[š]/g, 's')
    .replace(/[ť]/g, 't')
    .replace(/[ůú]/g, 'u')
    .replace(/[ý]/g, 'y')
    .replace(/[ž]/g, 'z')
    .trim();
}




