import React, { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { Person, ReminderLeadTime } from '@/types/events';
import { samplePeople } from '@/data/samplePeople';
import { toISODate } from '@/lib/date';

type PeopleAction =
  | { type: 'load'; payload: Person[] }
  | { type: 'add'; payload: Person }
  | { type: 'update'; payload: Person }
  | { type: 'remove'; payload: string };

interface PeopleState {
  people: Person[];
  hasLoaded: boolean;
}

const initialState: PeopleState = {
  people: [],
  hasLoaded: false,
};

function reducer(state: PeopleState, action: PeopleAction): PeopleState {
  switch (action.type) {
    case 'load':
      return { people: action.payload, hasLoaded: true };
    case 'add':
      return { ...state, people: [...state.people, action.payload] };
    case 'update':
      return {
        ...state,
        people: state.people.map((person) =>
          person.id === action.payload.id ? { ...person, ...action.payload } : person
        ),
      };
    case 'remove':
      return { ...state, people: state.people.filter((person) => person.id !== action.payload) };
    default:
      return state;
  }
}

interface PeopleContextValue {
  people: Person[];
  hasLoaded: boolean;
  addPerson: (input: PersonInput) => Person;
  updatePerson: (id: string, updates: PersonInput) => void;
  removePerson: (id: string) => void;
  getPerson: (id: string) => Person | undefined;
}

export interface PersonInput {
  name: string;
  date: string;
  type: Person['type'];
  note?: string;
  profileImageUri?: string;
  reminderEnabled?: boolean;
  reminderLeadTime?: ReminderLeadTime;
}

const PeopleContext = React.createContext<PeopleContextValue | undefined>(undefined);

export function PeopleProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Initial load can be replaced with persistent storage later
    dispatch({ type: 'load', payload: samplePeople });
  }, []);

  const addPerson = useCallback((input: PersonInput): Person => {
    const now = new Date();
    const person: Person = {
      id: generatePersonId(),
      name: input.name.trim(),
      date: input.date,
      type: input.type,
      note: input.note?.trim() || undefined,
      profileImageUri: input.profileImageUri,
      reminderEnabled: input.reminderEnabled ?? true,
      reminderLeadTime: input.reminderLeadTime ?? 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    dispatch({ type: 'add', payload: person });
    return person;
  }, []);

  const updatePerson = useCallback((id: string, updates: PersonInput) => {
    dispatch({
      type: 'update',
      payload: {
        id,
        name: updates.name.trim(),
        date: updates.date,
        type: updates.type,
        note: updates.note?.trim() || undefined,
        profileImageUri: updates.profileImageUri,
        reminderEnabled: updates.reminderEnabled ?? true,
        reminderLeadTime: updates.reminderLeadTime ?? 1,
        updatedAt: new Date().toISOString(),
      } as Person,
    });
  }, []);

  const removePerson = useCallback((id: string) => {
    dispatch({ type: 'remove', payload: id });
  }, []);

  const getPerson = useCallback(
    (id: string) => state.people.find((person) => person.id === id),
    [state.people],
  );

  const value = useMemo<PeopleContextValue>(
    () => ({
      people: state.people,
      hasLoaded: state.hasLoaded,
      addPerson,
      updatePerson,
      removePerson,
      getPerson,
    }),
    [state.people, state.hasLoaded, addPerson, updatePerson, removePerson, getPerson],
  );

  return <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>;
}

export function usePeople() {
  const context = useContext(PeopleContext);
  if (!context) {
    throw new Error('usePeople must be used within a PeopleProvider');
  }
  return context;
}

function generatePersonId() {
  const datePart = toISODate(new Date()).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `person-${datePart}-${randomPart}`;
}

function createFallbackPerson(): Person {
  const now = new Date();
  return {
    id: generatePersonId(),
    name: 'Unknown',
    date: toISODate(now),
    type: 'birthday',
    reminderEnabled: true,
    reminderLeadTime: 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

