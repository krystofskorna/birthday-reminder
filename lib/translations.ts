import { Language } from '@/types/events';

export const translations = {
  en: {
    // Home screen
    upcomingCelebrations: 'Upcoming Celebrations',
    startAddingCelebrations: 'Start adding celebrations to never miss a special day',
    youHaveOneCelebration: 'You have 1 celebration coming up',
    youHaveCelebrations: (count: number) => `You have ${count} celebrations to look forward to`,
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    noBirthdaysYet: 'No birthdays yet 🎈',
    noCelebrationsToDisplay: 'No celebrations to display.',
    addCelebration: 'Add Celebration',
    
    // Event types
    birthday: 'Birthday',
    nameDay: 'Name Day',
    other: 'Other',
    celebration: 'Celebration',
    
    // Event card
    turns: (age: number) => `Turns ${age}`,
    turnsLabel: 'Turns',
    today: 'Today',
    tomorrow: 'Tomorrow',
    inDays: (days: number) => `In ${days} days`,
    passed: 'Passed',
    
    // Today celebrations
    todaysCelebrations: "Today's Celebrations",
    
    // Date picker
    selectDate: 'Select Date',
    cancel: 'Cancel',
    done: 'Done',
    
    // Add/Edit screen
    addCelebrationTitle: 'Add Celebration',
    editCelebrationTitle: 'Edit Celebration',
    name: 'Name',
    nameRequired: 'Name *',
    date: 'Date',
    dateRequired: 'Date *',
    type: 'Type',
    typeRequired: 'Type *',
    note: 'Note (Optional)',
    addNote: 'Add a note...',
    reminder: 'Reminder',
    save: 'Save',
    enterName: 'Enter name',
    celebrationDate: 'Celebration Date',
    validationError: 'Validation Error',
    pleaseEnterName: 'Please enter a name.',
    
    // Person detail
    deleteCelebration: 'Delete celebration',
    deletePerson: (name: string) => `Delete ${name}?`,
    editCelebration: 'Edit celebration',
    deleteCelebrationLabel: 'Delete celebration',
    countdown: 'Countdown',
    celebration: 'Celebration',
    notes: 'Notes',
    weWillRemindYou: (time: string) => `We'll remind you ${time}.`,
    
    // Reminder labels
    onTheMorning: 'on the morning of the celebration',
    oneDayBefore: '1 day before',
    oneWeekInAdvance: '1 week in advance',
    twoWeeksInAdvance: '2 weeks in advance',
    oneMonthInAdvance: '1 month in advance',
    aheadOfTime: 'ahead of time',
    
    // Reminder options
    oneDayBeforeLabel: '1 day before',
    oneDayBeforeDesc: 'Perfect for last-minute prep.',
    oneWeekBeforeLabel: '1 week before',
    oneWeekBeforeDesc: 'Great for coordinating with friends.',
    oneMonthBeforeLabel: '1 month before',
    oneMonthBeforeDesc: 'Plenty of time for planning and gifts.',
    
    // Settings
    settings: 'Settings',
    notifications: 'Notifications',
    birthdayReminders: 'Birthday reminders',
    birthdayRemindersDesc: 'Get a ping for every birthday you track.',
    nameDayReminders: 'Name day reminders',
    nameDayRemindersDesc: 'Celebrate name days with a friendly nudge.',
    reminderTiming: 'Reminder timing',
    nameDaySettings: 'Name day settings',
    country: 'Country',
    selectCountryForNameDay: 'Select country for name day lookup',
    tapToCycleCountries: 'Tap to cycle through supported countries. More regions coming soon.',
    language: 'Language',
    theme: 'Theme',
    about: 'About',
    birthdayReminder: 'Birthday Reminder',
    aboutDescription: 'Never miss a birthday or name day again. Keep track of all your important celebrations in one place.',
    aboutPrivacy: 'All your data is stored locally on your device for maximum privacy.',
    
    // Custom type modal
    addCustomType: 'Add Custom Type',
    add: 'Add',
    icon: 'Icon',
    color: 'Color',
    typeName: 'Type Name',
    enterTypeName: 'Enter type name',
    
    // Section headers
    today: 'Today',
    
    // Not found
    notFound: "This screen doesn't exist.",
    goHome: 'Go to home screen',
    
    // Data management
    dataManagement: 'Data Management',
    exportData: 'Export Data',
    clearAllData: 'Clear All Data',
    clear: 'Clear',
    dataManagementDesc: 'Export your data as a backup or clear all celebrations.',
    exportSuccess: 'Export Successful',
    exportSuccessDesc: 'Your data has been exported successfully.',
    exportError: 'Export Failed',
    exportErrorDesc: 'There was an error exporting your data.',
    clearAllDataWarning: 'Are you sure you want to delete all celebrations? This action cannot be undone.',
    dataCleared: 'Data Cleared',
    dataClearedDesc: 'All celebrations have been removed.',
    version: 'Version',
  },
  cs: {
    // Home screen
    upcomingCelebrations: 'Nadcházející oslavy',
    startAddingCelebrations: 'Začněte přidávat oslavy, abyste nezmeškali žádný významný den',
    youHaveOneCelebration: 'Máte 1 nadcházející oslavu',
    youHaveCelebrations: (count: number) => `Máte ${count} oslav, na které se můžete těšit`,
    thisWeek: 'Tento týden',
    thisMonth: 'Tento měsíc',
    noBirthdaysYet: 'Zatím žádné narozeniny 🎈',
    noCelebrationsToDisplay: 'Žádné oslavy k zobrazení.',
    addCelebration: 'Přidat oslavu',
    
    // Event types
    birthday: 'Narozeniny',
    nameDay: 'Svátek',
    other: 'Jiné',
    celebration: 'Oslava',
    
    // Event card
    turns: (age: number) => `Dozví se ${age} let`,
    turnsLabel: 'Dozví se',
    today: 'Dnes',
    tomorrow: 'Zítra',
    inDays: (days: number) => `Za ${days} ${days === 1 ? 'den' : days < 5 ? 'dny' : 'dní'}`,
    passed: 'Uplynulo',
    
    // Today celebrations
    todaysCelebrations: 'Dnešní oslavy',
    
    // Date picker
    selectDate: 'Vyberte datum',
    cancel: 'Zrušit',
    done: 'Hotovo',
    
    // Add/Edit screen
    addCelebrationTitle: 'Přidat oslavu',
    editCelebrationTitle: 'Upravit oslavu',
    name: 'Jméno',
    nameRequired: 'Jméno *',
    date: 'Datum',
    dateRequired: 'Datum *',
    type: 'Typ',
    typeRequired: 'Typ *',
    note: 'Poznámka (volitelné)',
    addNote: 'Přidat poznámku...',
    reminder: 'Připomínka',
    save: 'Uložit',
    enterName: 'Zadejte jméno',
    celebrationDate: 'Datum oslavy',
    validationError: 'Chyba ověření',
    pleaseEnterName: 'Prosím zadejte jméno.',
    
    // Person detail
    deleteCelebration: 'Smazat oslavu',
    deletePerson: (name: string) => `Smazat ${name}?`,
    editCelebration: 'Upravit oslavu',
    deleteCelebrationLabel: 'Smazat oslavu',
    countdown: 'Odpočítávání',
    celebration: 'Oslava',
    notes: 'Poznámky',
    weWillRemindYou: (time: string) => `Připomeneme vám ${time}.`,
    
    // Reminder labels
    onTheMorning: 'ráno v den oslavy',
    oneDayBefore: '1 den předem',
    oneWeekInAdvance: '1 týden předem',
    twoWeeksInAdvance: '2 týdny předem',
    oneMonthInAdvance: '1 měsíc předem',
    aheadOfTime: 'předem',
    
    // Reminder options
    oneDayBeforeLabel: '1 den předem',
    oneDayBeforeDesc: 'Ideální pro poslední přípravu.',
    oneWeekBeforeLabel: '1 týden předem',
    oneWeekBeforeDesc: 'Skvělé pro koordinaci s přáteli.',
    oneMonthBeforeLabel: '1 měsíc předem',
    oneMonthBeforeDesc: 'Dostatek času na plánování a dárky.',
    
    // Settings
    settings: 'Nastavení',
    notifications: 'Oznámení',
    birthdayReminders: 'Připomínky narozenin',
    birthdayRemindersDesc: 'Dostávejte upozornění na každé narozeniny, které sledujete.',
    nameDayReminders: 'Připomínky svátků',
    nameDayRemindersDesc: 'Oslavte svátky s přátelským upozorněním.',
    reminderTiming: 'Načasování připomínky',
    nameDaySettings: 'Nastavení svátků',
    country: 'Země',
    selectCountryForNameDay: 'Vyberte zemi pro vyhledávání svátků',
    tapToCycleCountries: 'Klepněte pro procházení podporovaných zemí. Další regiony brzy.',
    language: 'Jazyk',
    theme: 'Téma',
    about: 'O aplikaci',
    birthdayReminder: 'Připomínka narozenin',
    aboutDescription: 'Už nikdy nezmeškejte narozeniny nebo svátek. Sledujte všechny své důležité oslavy na jednom místě.',
    aboutPrivacy: 'Všechna vaše data jsou uložena lokálně na vašem zařízení pro maximální soukromí.',
    
    // Custom type modal
    addCustomType: 'Přidat vlastní typ',
    add: 'Přidat',
    icon: 'Ikona',
    color: 'Barva',
    typeName: 'Název typu',
    enterTypeName: 'Zadejte název typu',
    
    // Section headers
    today: 'Dnes',
    
    // Not found
    notFound: 'Tato obrazovka neexistuje.',
    goHome: 'Přejít na domovskou obrazovku',
    
    // Data management
    dataManagement: 'Správa dat',
    exportData: 'Exportovat data',
    clearAllData: 'Vymazat všechna data',
    clear: 'Vymazat',
    dataManagementDesc: 'Exportujte svá data jako zálohu nebo vymažte všechny oslavy.',
    exportSuccess: 'Export úspěšný',
    exportSuccessDesc: 'Vaše data byla úspěšně exportována.',
    exportError: 'Export selhal',
    exportErrorDesc: 'Při exportu dat došlo k chybě.',
    clearAllDataWarning: 'Opravdu chcete smazat všechny oslavy? Tuto akci nelze vrátit zpět.',
    dataCleared: 'Data vymazána',
    dataClearedDesc: 'Všechny oslavy byly odstraněny.',
    version: 'Verze',
  },
};

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(language: Language, key: TranslationKey, ...args: any[]): string {
  const translation = translations[language][key];
  if (typeof translation === 'function') {
    return translation(...args);
  }
  return translation as string;
}

