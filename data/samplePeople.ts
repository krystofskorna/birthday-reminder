import { Person } from '@/types/events';
import { toISODate } from '@/lib/date';

const today = new Date();

function createPerson(id: string, partial: Partial<Person>): Person {
  const now = new Date();
  return {
    id,
    name: 'Unknown',
    date: toISODate(today),
    type: 'birthday',
    reminderEnabled: true,
    reminderLeadTime: 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...partial,
  };
}

export const samplePeople: Person[] = [
  createPerson('sample-anna', {
    name: 'Anna Nováková',
    date: `${today.getFullYear()}-07-26`,
    type: 'nameday',
    note: 'Loves lilac flowers 🌸',
    reminderLeadTime: 7,
  }),
  createPerson('sample-petr', {
    name: 'Petr Svoboda',
    date: `${today.getFullYear() - 30}-10-12`,
    type: 'birthday',
    note: 'Favorite café: Misto',
    reminderLeadTime: 7,
  }),
  createPerson('sample-lucie', {
    name: 'Lucie Černá',
    date: `${today.getFullYear()}-12-13`,
    type: 'nameday',
    note: 'Bring her almond croissants 🥐',
    reminderLeadTime: 1,
  }),
];

