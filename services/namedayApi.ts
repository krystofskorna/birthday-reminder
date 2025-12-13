/**
 * Service for fetching nameday data from nameday.abalin.net API
 * API documentation: https://github.com/xnekv03/nameday-api
 */

export interface NamedayApiResult {
  day: number;
  month: number;
  name: string;
}

export interface NamedayApiResponse {
  calendar: string;
  results: NamedayApiResult[];
}

// Map internal country codes to API country codes
const COUNTRY_CODE_MAP: Record<string, string> = {
  'cs_CZ': 'cz',
  'sk_SK': 'sk',
  'pl_PL': 'pl',
  'us_US': 'us',
  'fr_FR': 'fr',
  'hu_HU': 'hu',
  'hr_HR': 'hr',
  'se_SE': 'se',
  'at_AT': 'at',
  'it_IT': 'it',
  'de_DE': 'de',
  'es_ES': 'es',
};

/**
 * Convert internal country code to API country code
 */
function getApiCountryCode(internalCode: string | null | undefined): string | null {
  if (!internalCode) return null;
  return COUNTRY_CODE_MAP[internalCode] || null;
}

/**
 * Search for nameday by name using nameday.abalin.net API
 * @param name - First name to search for
 * @param countryCode - Internal country code (e.g., 'cs_CZ')
 * @returns Promise with nameday date or null if not found
 */
export async function searchNamedayByName(
  name: string,
  countryCode: string | null | undefined
): Promise<Date | null> {
  if (!name || !countryCode) return null;

  const apiCountryCode = getApiCountryCode(countryCode);
  if (!apiCountryCode) return null;

  try {
    // API endpoint based on nameday.abalin.net API
    // Format: https://nameday.abalin.net/api/v1/namedays?name={name}&country={country}
    const normalizedName = name.trim();
    // Try different possible endpoint formats
    const url = `https://nameday.abalin.net/api/v1/namedays?name=${encodeURIComponent(normalizedName)}&country=${apiCountryCode}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BirthdayReminder/1.0',
      },
    });

    if (!response.ok) {
      console.warn(`Nameday API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: NamedayApiResponse = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Return the first result (most common nameday for this name)
    const firstResult = data.results[0];
    const now = new Date();
    const year = now.getFullYear();
    
    // Create date for this year
    const namedayDate = new Date(year, firstResult.month - 1, firstResult.day);
    
    // If the date has already passed this year, return next year's date
    if (namedayDate < now) {
      return new Date(year + 1, firstResult.month - 1, firstResult.day);
    }
    
    return namedayDate;
  } catch (error) {
    console.error('Failed to fetch nameday from API:', error);
    return null;
  }
}

/**
 * Get all available countries for nameday API
 */
export function getAvailableNamedayCountries() {
  return [
    { code: 'cs_CZ', name: 'Czech Republic', flag: '🇨🇿', apiCode: 'cz' },
    { code: 'sk_SK', name: 'Slovakia', flag: '🇸🇰', apiCode: 'sk' },
    { code: 'pl_PL', name: 'Poland', flag: '🇵🇱', apiCode: 'pl' },
    { code: 'us_US', name: 'United States', flag: '🇺🇸', apiCode: 'us' },
    { code: 'fr_FR', name: 'France', flag: '🇫🇷', apiCode: 'fr' },
    { code: 'hu_HU', name: 'Hungary', flag: '🇭🇺', apiCode: 'hu' },
    { code: 'hr_HR', name: 'Croatia', flag: '🇭🇷', apiCode: 'hr' },
    { code: 'se_SE', name: 'Sweden', flag: '🇸🇪', apiCode: 'se' },
    { code: 'at_AT', name: 'Austria', flag: '🇦🇹', apiCode: 'at' },
    { code: 'it_IT', name: 'Italy', flag: '🇮🇹', apiCode: 'it' },
    { code: 'de_DE', name: 'Germany', flag: '🇩🇪', apiCode: 'de' },
    { code: 'es_ES', name: 'Spain', flag: '🇪🇸', apiCode: 'es' },
  ];
}

