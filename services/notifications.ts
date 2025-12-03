import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Person, ReminderLeadTime } from '@/types/events';
import { parseISODate, nextOccurrence, ageTurning } from '@/lib/date';
import { translations } from '@/lib/translations';

// Configure how notifications behave when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return null;
  }
  
  return finalStatus;
}

export async function scheduleEventNotification(person: Person, language: 'en' | 'cs' = 'en') {
  // 1. Cancel any existing notification for this person to avoid duplicates
  await cancelEventNotification(person.id);

  if (!person.reminderEnabled) {
    return;
  }

  // 2. Calculate the trigger date
  const eventDate = parseISODate(person.date);
  const nextDate = nextOccurrence(eventDate);
  
  // Subtract lead time
  const triggerDate = new Date(nextDate);
  triggerDate.setDate(triggerDate.getDate() - person.reminderLeadTime);
  
  const now = new Date();
  if (triggerDate < now) {
    // Move to next year
    triggerDate.setFullYear(triggerDate.getFullYear() + 1);
  }

  const [hour, minute] = (person.reminderTime || '09:00').split(':').map(Number);

  // 3. Schedule
  // We use a calendar trigger so it repeats yearly
  const trigger: Notifications.CalendarNotificationTrigger = {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    month: triggerDate.getMonth() + 1, // Expo uses 1-12
    day: triggerDate.getDate(),
    hour: hour || 9,
    minute: minute || 0,
    repeats: true,
  };

  // Localize title/body
  const t = translations[language];
  let title = '';
  let body = '';
  let subtitle = '';

  const age = ageTurning(person, triggerDate);

  if (person.type === 'birthday') {
      title = `🎉 ${t.birthdayReminder}`;
      if (age) {
        body = language === 'cs' 
          ? `${person.name} brzy dosáhne ${age} let!`
          : `${person.name} will be ${age} soon!`;
        subtitle = language === 'cs'
          ? `${age}. narozeniny`
          : `${age}th Birthday`;
      } else {
        body = language === 'cs'
          ? `Blíží se narozeniny ${person.name}!`
          : `It's ${person.name}'s birthday coming up!`;
      }
  } else if (person.type === 'nameday') {
      title = `🗓️ ${t.nameDayReminders}`;
      body = language === 'cs'
        ? `Dnes má svátek ${person.name}!`
        : `It's ${person.name}'s name day!`;
  } else {
      title = language === 'cs' ? `🔔 Připomínka` : `🔔 Reminder`;
      body = language === 'cs'
        ? `Blíží se oslava ${person.name}.`
        : `${person.name}'s event is coming up.`;
  }

  const content: Notifications.NotificationContentInput = {
    title,
    body,
    subtitle, // iOS only
    data: { personId: person.id },
    sound: true,
    color: '#FF231F7C', // Android accent color
  };

  // Add profile image as attachment if available (iOS primarily)
  if (person.profileImageUri) {
    content.attachments = [
      {
        url: person.profileImageUri,
        identifier: 'profile-image',
        typeHint: Notifications.AndroidNotificationPriority.HIGH as any, // typeHint is not exactly priority but using what's available
      }
    ];
  }

  await Notifications.scheduleNotificationAsync({
    identifier: person.id,
    content,
    trigger,
  });
}

export async function cancelEventNotification(personId: string) {
  await Notifications.cancelScheduledNotificationAsync(personId);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
