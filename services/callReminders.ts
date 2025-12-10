// Call Reminder Notifications
// Sends notifications if user hasn't called someone in 25+ days

import * as Notifications from 'expo-notifications';
import { Person } from '@/types/events';
import { getDaysSinceLastCall, shouldSendCallReminder } from './callHistory';
import { parseISODate } from '@/lib/date';
import { translations } from '@/lib/translations';

const CALL_REMINDER_DAYS = 25;

/**
 * Schedule call reminder notifications for all people with phone numbers
 */
export async function scheduleCallReminders(people: Person[], language: 'en' | 'cs' = 'en'): Promise<void> {
  try {
    // Cancel all existing call reminders
    await cancelAllCallReminders();

    for (const person of people) {
      if (!person.phoneNumber) {
        continue; // Skip people without phone numbers
      }

      // Check if we should send a reminder
      const shouldRemind = await shouldSendCallReminder(person.phoneNumber);
      
      if (!shouldRemind) {
        continue; // Don't schedule if not needed
      }

      // Get days since last call
      const daysSince = await getDaysSinceLastCall(person.phoneNumber);
      
      if (daysSince === null || daysSince < CALL_REMINDER_DAYS) {
        continue; // Not enough days passed
      }

      // Schedule notification
      await scheduleCallReminderNotification(person, daysSince, language);
    }
  } catch (error) {
    console.error('Failed to schedule call reminders:', error);
  }
}

/**
 * Schedule a single call reminder notification
 */
async function scheduleCallReminderNotification(
  person: Person,
  daysSince: number,
  language: 'en' | 'cs'
): Promise<void> {
  try {
    const t = translations[language];
    const notificationId = `call_reminder_${person.id}`;

    // Schedule for tomorrow at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const trigger: Notifications.CalendarNotificationTrigger = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      month: tomorrow.getMonth() + 1,
      day: tomorrow.getDate(),
      hour: 10,
      minute: 0,
      repeats: false, // One-time notification
    };

    const title = language === 'cs' 
      ? `📞 Zavolejte ${person.name}`
      : `📞 Call ${person.name}`;

    const body = language === 'cs'
      ? `Už ${daysSince} dní jste s ${person.name} nemluvili. Možná je čas zavolat!`
      : `You haven't talked to ${person.name} in ${daysSince} days. Maybe it's time to call!`;

    const content: Notifications.NotificationContentInput = {
      title,
      body,
      data: { 
        personId: person.id, 
        screen: 'personDetail',
        type: 'callReminder'
      },
      sound: true,
      color: '#FF231F7C',
    };

    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content,
      trigger,
    });
  } catch (error) {
    console.error('Failed to schedule call reminder:', error);
  }
}

/**
 * Cancel all call reminder notifications
 */
export async function cancelAllCallReminders(): Promise<void> {
  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const callReminderIds = allNotifications
      .filter(n => n.identifier.startsWith('call_reminder_'))
      .map(n => n.identifier);

    for (const id of callReminderIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (error) {
    console.error('Failed to cancel call reminders:', error);
  }
}

/**
 * Cancel call reminder for a specific person
 */
export async function cancelCallReminder(personId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`call_reminder_${personId}`);
  } catch (error) {
    console.error('Failed to cancel call reminder:', error);
  }
}

/**
 * Check and update call reminders for a person
 * Should be called after recording a call
 */
export async function updateCallReminderForPerson(person: Person, language: 'en' | 'cs' = 'en'): Promise<void> {
  if (!person.phoneNumber) {
    return;
  }

  // Cancel existing reminder
  await cancelCallReminder(person.id);

  // Check if we need a new reminder
  const shouldRemind = await shouldSendCallReminder(person.phoneNumber);
  
  if (shouldRemind) {
    const daysSince = await getDaysSinceLastCall(person.phoneNumber);
    if (daysSince !== null && daysSince >= CALL_REMINDER_DAYS) {
      await scheduleCallReminderNotification(person, daysSince, language);
    }
  }
}


