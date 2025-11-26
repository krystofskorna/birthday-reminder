import { Person, EventType, Language } from '@/types/events';

export function parseISODate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function nextOccurrence(originalDate: Date, reference: Date = new Date()): Date {
  const month = originalDate.getMonth();
  const day = originalDate.getDate();
  const candidate = new Date(reference.getFullYear(), month, day);
  if (candidate < startOfDay(reference)) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }
  return candidate;
}

export function daysUntil(target: Date, reference: Date = new Date()): number {
  const diff = startOfDay(target).getTime() - startOfDay(reference).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function ageTurning(person: Person, reference: Date = new Date()): number | null {
  if (person.type !== 'birthday') return null;
  const birthDate = parseISODate(person.date);
  const next = nextOccurrence(birthDate, reference);
  return next.getFullYear() - birthDate.getFullYear();
}

export function formatLong(date: Date, language: Language = 'en'): string {
  const locale = language === 'cs' ? 'cs-CZ' : 'en-US';
  const calendar = new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return calendar.format(date);
}

// This function is deprecated - use translations instead
export function eventTypeLabel(type: EventType): string {
  switch (type) {
    case 'birthday':
      return 'Birthday';
    case 'nameday':
      return 'Name Day';
    default:
      return 'Other';
  }
}




