import React, { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { Person, ReminderLeadTime } from '@/types/events';
import { toISODate } from '@/lib/date';
import { scheduleEventNotification, cancelEventNotification } from '@/services/notifications';
import { scheduleCallReminders, updateCallReminderForPerson } from '@/services/callReminders';
import { useSettings } from '@/contexts/SettingsContext';
import { loadPeople, savePeople } from '@/services/storage';
import { showInterstitialAfterAction } from '@/services/ads';
import { savePeopleToICloud } from '@/services/icloudSync';

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
  name?: string; // Full name (if firstName/lastName not provided)
  firstName?: string; // First name (křestní jméno)
  lastName?: string; // Last name (příjmení)
  date: string;
  type: Person['type'];
  note?: string;
  profileImageUri?: string;
  phoneNumber?: string; // For contact integration and one-tap actions
  reminderEnabled?: boolean;
  reminderLeadTime?: ReminderLeadTime;
  reminderTime?: string;
  checklist?: import('@/types/checklist').Checklist; // Premium feature (optional)
  linkedNamedayId?: string; // ID of linked nameday person
}

const PeopleContext = React.createContext<PeopleContextValue | undefined>(undefined);

export function PeopleProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { settings } = useSettings();

  useEffect(() => {
    // Load people from persistent storage
    loadPeople().then((people) => {
      dispatch({ type: 'load', payload: people });
    });
  }, []);

  // Save to storage and sync to iCloud whenever people change (after initial load)
  useEffect(() => {
    if (state.hasLoaded && state.people.length >= 0) {
      savePeople(state.people).catch(console.error);
      // Sync to iCloud if enabled
      if (settings?.icloudSyncEnabled) {
        savePeopleToICloud(state.people).catch(console.error);
      }
      // Schedule call reminders
      scheduleCallReminders(state.people, settings.language).catch(console.error);
    }
  }, [state.people, state.hasLoaded, settings?.icloudSyncEnabled, settings?.language]);

  const addPerson = useCallback((input: PersonInput): Person => {
    const now = new Date();
    
    // Combine firstName + lastName or use name
    let fullName: string;
    if (input.firstName || input.lastName) {
      const parts = [input.firstName?.trim(), input.lastName?.trim()].filter(Boolean);
      fullName = parts.join(' ');
    } else {
      fullName = input.name?.trim() || '';
    }
    
    const person: Person = {
      id: generatePersonId(),
      name: fullName,
      firstName: input.firstName?.trim() || undefined,
      lastName: input.lastName?.trim() || undefined,
      date: input.date,
      type: input.type,
      note: input.note?.trim() || undefined,
      profileImageUri: input.profileImageUri,
      phoneNumber: input.phoneNumber?.trim() || undefined,
      checklist: input.checklist,
      linkedNamedayId: input.linkedNamedayId,
      reminderEnabled: input.reminderEnabled ?? true,
      reminderLeadTime: input.reminderLeadTime ?? 1,
      reminderTime: input.reminderTime ?? '09:00',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    dispatch({ type: 'add', payload: person });
    scheduleEventNotification(person, settings.language).catch(console.error);
    // Show interstitial ad occasionally after adding a person
    showInterstitialAfterAction().catch(console.error);
    return person;
  }, [settings.language]);

  const updatePerson = useCallback((id: string, updates: PersonInput) => {
    const existing = state.people.find(p => p.id === id);
    if (!existing) return;

    // Combine firstName + lastName or use name
    let fullName: string;
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      const firstName = updates.firstName?.trim() ?? existing.firstName;
      const lastName = updates.lastName?.trim() ?? existing.lastName;
      const parts = [firstName, lastName].filter(Boolean);
      fullName = parts.join(' ');
    } else if (updates.name !== undefined) {
      fullName = updates.name.trim();
    } else {
      fullName = existing.name;
    }

    const updatedPerson: Person = {
      ...existing,
      name: fullName,
      firstName: updates.firstName?.trim() ?? existing.firstName,
      lastName: updates.lastName?.trim() ?? existing.lastName,
      date: updates.date,
      type: updates.type,
      note: updates.note?.trim() ?? existing.note,
      profileImageUri: updates.profileImageUri ?? existing.profileImageUri,
      phoneNumber: updates.phoneNumber?.trim() ?? existing.phoneNumber,
      checklist: updates.checklist !== undefined ? updates.checklist : existing.checklist,
      linkedNamedayId: updates.linkedNamedayId ?? existing.linkedNamedayId,
      reminderEnabled: updates.reminderEnabled ?? existing.reminderEnabled ?? true,
      reminderLeadTime: updates.reminderLeadTime ?? existing.reminderLeadTime ?? 1,
      reminderTime: updates.reminderTime ?? existing.reminderTime ?? '09:00',
      updatedAt: new Date().toISOString(),
    };

    dispatch({
      type: 'update',
      payload: updatedPerson,
    });
    
    scheduleEventNotification(updatedPerson, settings.language).catch(console.error);
    // Update call reminder if phone number changed
    if (updatedPerson.phoneNumber) {
      updateCallReminderForPerson(updatedPerson, settings.language).catch(console.error);
    }
  }, [state.people, settings.language]);

  const removePerson = useCallback((id: string) => {
    dispatch({ type: 'remove', payload: id });
    cancelEventNotification(id).catch(console.error);
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
    reminderTime: '09:00',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

