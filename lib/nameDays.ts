const datasets: Record<string, Record<string, string>> = {
  cs_CZ: require('@/data/nameDays/cs_CZ.json'),
  sk_SK: require('@/data/nameDays/sk_SK.json'),
};

export function suggestNameDayDate(name: string, countryCode?: string | null): Date | null {
  if (!name || !countryCode) return null;
  const data = datasets[countryCode];
  if (!data) return null;
  const normalized = normalize(name);
  const entry = Object.entries(data).find(([rawName]) => normalize(rawName) === normalized);
  if (!entry) return null;
  const date = parseMonthDay(entry[1]);
  return date;
}

export function availableNameDayCountries() {
  return [
    { code: 'cs_CZ', name: 'Czech Republic', flag: '🇨🇿' },
    { code: 'sk_SK', name: 'Slovakia', flag: '🇸🇰' },
  ];
}

function parseMonthDay(monthDay: string): Date | null {
  const [month, day] = monthDay.split('-').map(Number);
  if (!month || !day) return null;
  const now = new Date();
  return new Date(now.getFullYear(), month - 1, day);
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}




