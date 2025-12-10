import { useState, useMemo, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePeople } from '@/contexts/PeopleContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomTypes } from '@/contexts/CustomTypesContext';
import { useSettings } from '@/contexts/SettingsContext';
import { usePremium } from '@/contexts/PremiumContext';
import { DateField } from '@/components/DateField';
import { AddCustomTypeModal } from '@/components/AddCustomTypeModal';
import { TimePickerModal } from '@/components/TimePickerModal';
import { ContactPickerModal } from '@/components/ContactPickerModal';
import { EventType, ReminderLeadTime } from '@/types/events';
import { getReminderOptions } from '@/constants/reminders';
import { toISODate, parseISODate } from '@/lib/date';
import { ContactData } from '@/services/contacts';
import { suggestNameDayDate } from '@/lib/nameDays';

export default function AddScreen() {
  const router = useRouter();
  const { addPerson: addPersonContext } = usePeople();
  const colors = useThemeColors();
  const { customTypes } = useCustomTypes();
  const { settings } = useSettings();
  const { isPremium } = usePremium();
  const t = useTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<EventType | string>('birthday');
  const [note, setNote] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderLeadTime, setReminderLeadTime] = useState<ReminderLeadTime>(1);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [customLeadTime, setCustomLeadTime] = useState('');
  const [showAddNamedayPrompt, setShowAddNamedayPrompt] = useState(false);

  const reminderOptions = useMemo(() => getReminderOptions(settings.language, isPremium), [settings.language, isPremium]);

  // Auto-suggest nameday when firstName changes and type is birthday
  useEffect(() => {
    if (firstName.trim() && type === 'birthday' && settings.preferredCountryCode) {
      const suggestedDate = suggestNameDayDate(firstName.trim(), settings.preferredCountryCode);
      if (suggestedDate && !showAddNamedayPrompt) {
        setShowAddNamedayPrompt(true);
      }
    } else {
      setShowAddNamedayPrompt(false);
    }
  }, [firstName, type, settings.preferredCountryCode]);

  const handleSave = () => {
    if (!firstName.trim() && !lastName.trim()) {
      Alert.alert(t('validationError'), t('pleaseEnterName'));
      return;
    }

    addPersonContext({
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      date: toISODate(date),
      type,
      note: note.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      reminderEnabled,
      reminderLeadTime: customLeadTime ? (parseInt(customLeadTime, 10) as ReminderLeadTime) : reminderLeadTime,
      reminderTime,
    });

    router.back();
  };

  const handleContactSelect = (contactData: ContactData) => {
    // Try to split name into first and last name
    const nameParts = contactData.name.trim().split(/\s+/);
    if (nameParts.length > 1) {
      setFirstName(nameParts[0]);
      setLastName(nameParts.slice(1).join(' '));
    } else {
      setFirstName(nameParts[0] || '');
      setLastName('');
    }
    if (contactData.phoneNumber) {
      setPhoneNumber(contactData.phoneNumber);
    }
    if (contactData.birthday) {
      setDate(parseISODate(contactData.birthday));
    }
  };

  const handleAddNameday = () => {
    if (!firstName.trim() || !settings.preferredCountryCode) return;
    const suggestedDate = suggestNameDayDate(firstName.trim(), settings.preferredCountryCode);
    if (suggestedDate) {
      // Create birthday person first
      const birthdayPerson = addPersonContext({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        date: toISODate(date),
        type: 'birthday',
        note: note.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        reminderEnabled,
        reminderLeadTime: customLeadTime ? (parseInt(customLeadTime, 10) as ReminderLeadTime) : reminderLeadTime,
        reminderTime,
      });
      
      // Create nameday person linked to birthday
      addPersonContext({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        date: toISODate(suggestedDate),
        type: 'nameday',
        note: note.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        reminderEnabled,
        reminderLeadTime: customLeadTime ? (parseInt(customLeadTime, 10) as ReminderLeadTime) : reminderLeadTime,
        reminderTime,
        linkedNamedayId: birthdayPerson.id, // Link back to birthday
      });
      
      router.back();
    }
    setShowAddNamedayPrompt(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} accessibilityLabel={t('cancel')}>
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('addCelebrationTitle')}</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.form}>
          {/* Import from Contacts Button */}
          <TouchableOpacity
            style={[styles.importButton, { backgroundColor: colors.surface, borderColor: colors.primaryAccent }]}
            onPress={() => setShowContactPicker(true)}
          >
            <Feather name="users" size={20} color={colors.primaryAccent} />
            <Text style={[styles.importButtonText, { color: colors.primaryAccent }]}>
              {t('importFromContacts')}
            </Text>
          </TouchableOpacity>

          {/* First Name Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {settings.language === 'cs' ? 'Jméno *' : 'First Name *'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: `${colors.primaryAccent}33` }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={settings.language === 'cs' ? 'Zadejte křestní jméno' : 'Enter first name'}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Last Name Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {settings.language === 'cs' ? 'Příjmení' : 'Last Name'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: `${colors.primaryAccent}33` }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder={settings.language === 'cs' ? 'Zadejte příjmení' : 'Enter last name'}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Auto-suggest nameday prompt */}
          {showAddNamedayPrompt && type === 'birthday' && (
            <View style={[styles.section, styles.namedayPrompt]}>
              <View style={[styles.namedayPromptCard, { backgroundColor: `${colors.namedayAccent}15`, borderColor: colors.namedayAccent }]}>
                <View style={styles.namedayPromptContent}>
                  <Feather name="info" size={18} color={colors.namedayAccent} />
                  <Text style={[styles.namedayPromptText, { color: colors.textPrimary }]}>
                    {settings.language === 'cs' 
                      ? `Chcete přidat i svátek pro ${firstName.trim()}?`
                      : `Would you like to add a name day for ${firstName.trim()}?`}
                  </Text>
                </View>
                <View style={styles.namedayPromptButtons}>
                  <TouchableOpacity
                    style={[styles.namedayPromptButton, { backgroundColor: colors.namedayAccent }]}
                    onPress={handleAddNameday}
                  >
                    <Text style={styles.namedayPromptButtonText}>
                      {settings.language === 'cs' ? 'Ano, přidat' : 'Yes, add'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.namedayPromptButton, styles.namedayPromptButtonSecondary, { borderColor: colors.textSecondary }]}
                    onPress={() => setShowAddNamedayPrompt(false)}
                  >
                    <Text style={[styles.namedayPromptButtonText, { color: colors.textSecondary }]}>
                      {t('cancel')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Phone Number Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('phoneNumber')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: `${colors.primaryAccent}33` }]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder={t('enterPhoneNumber')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          {/* Date Picker */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('dateRequired')}</Text>
            <DateField label={t('celebrationDate')} value={date} onChange={setDate} />
          </View>

          {/* Type Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('typeRequired')}</Text>
            <View style={styles.typeContainer}>
              {(['birthday', 'nameday'] as EventType[]).map((eventType) => {
                const isSelected = type === eventType;
                const iconName = eventType === 'birthday' ? 'gift' : 'sun';
                const accentColor = eventType === 'birthday' ? colors.primaryAccent : colors.namedayAccent;
                return (
                  <TouchableOpacity
                    key={eventType}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: isSelected ? accentColor : colors.surface,
                        borderColor: isSelected ? accentColor : `${accentColor}33`,
                      },
                    ]}
                    onPress={() => setType(eventType)}
                  >
                    <Feather
                      name={iconName as keyof typeof Feather.glyphMap}
                      size={18}
                      color={isSelected ? '#FFFFFF' : accentColor}
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {eventType === 'birthday' ? t('birthday') : t('nameDay')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  {
                    backgroundColor: type === 'other' ? colors.primaryAccent : colors.surface,
                    borderColor: type === 'other' ? colors.primaryAccent : `${colors.primaryAccent}33`,
                  },
                ]}
                onPress={() => setShowCustomTypeModal(true)}
              >
                <Feather
                  name="star"
                  size={18}
                  color={type === 'other' ? '#FFFFFF' : colors.otherAccent}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    { color: type === 'other' ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {t('other')}
                </Text>
              </TouchableOpacity>
            </View>
            {customTypes.length > 0 && (
              <View style={styles.customTypesContainer}>
                {customTypes.map((customType) => {
                  const isSelected = type === customType.id;
                  return (
                    <TouchableOpacity
                      key={customType.id}
                      style={[
                        styles.customTypeOption,
                        {
                          backgroundColor: isSelected ? customType.color : colors.surface,
                          borderColor: isSelected ? customType.color : `${customType.color}33`,
                        },
                      ]}
                      onPress={() => setType(customType.id)}
                    >
                      <Feather
                        name={customType.icon as keyof typeof Feather.glyphMap}
                        size={18}
                        color={isSelected ? '#FFFFFF' : customType.color}
                      />
                      <Text
                        style={[
                          styles.customTypeText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {customType.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Note Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('note')}</Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: `${colors.primaryAccent}33` },
              ]}
              value={note}
              onChangeText={setNote}
              placeholder={t('addNote')}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>


          {/* Reminder Settings */}
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('reminder')}</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ true: colors.primaryAccent }}
              />
            </View>
            {reminderEnabled && (
              <View style={styles.reminderOptions}>
                <TouchableOpacity
                  style={[
                    styles.reminderOption,
                    { borderColor: `${colors.primaryAccent}33` }
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <View style={styles.reminderOptionContent}>
                    <Text style={[styles.reminderOptionLabel, { color: colors.textPrimary }]}>
                      {t('reminderTime')}
                    </Text>
                    <Text style={[styles.reminderOptionDescription, { color: colors.textSecondary }]}>
                      {reminderTime}
                    </Text>
                  </View>
                  <Feather name="clock" size={20} color={colors.primaryAccent} />
                </TouchableOpacity>

                {reminderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.reminderOption,
                      {
                        backgroundColor:
                          reminderLeadTime === option.value && !customLeadTime
                            ? `${colors.primaryAccent}26`
                            : 'transparent',
                        borderColor:
                          reminderLeadTime === option.value && !customLeadTime
                            ? colors.primaryAccent
                            : `${colors.primaryAccent}33`,
                      },
                    ]}
                    onPress={() => {
                      setReminderLeadTime(option.value);
                      setCustomLeadTime('');
                    }}
                  >
                    <View style={styles.reminderOptionContent}>
                      <Text style={[styles.reminderOptionLabel, { color: colors.textPrimary }]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.reminderOptionDescription, { color: colors.textSecondary }]}>
                        {option.description}
                      </Text>
                    </View>
                    {reminderLeadTime === option.value && !customLeadTime && (
                      <Feather name="check" size={20} color={colors.primaryAccent} />
                    )}
                  </TouchableOpacity>
                ))}

                <View style={styles.customLeadTimeContainer}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 8 }]}>
                    {t('customLeadTime')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: customLeadTime ? `${colors.primaryAccent}15` : colors.background,
                        borderColor: customLeadTime ? colors.primaryAccent : `${colors.primaryAccent}33`,
                        color: colors.textPrimary 
                      }
                    ]}
                    value={customLeadTime}
                    onChangeText={(text) => {
                      // Only allow numbers
                      if (/^\d*$/.test(text)) {
                        setCustomLeadTime(text);
                        if (text) {
                          // We don't strictly need to update reminderLeadTime state visually if we prioritize customLeadTime
                        }
                      }
                    }}
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primaryAccent, shadowColor: colors.cardShadow }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>{t('save')}</Text>
        </TouchableOpacity>
      </View>

      <AddCustomTypeModal
        visible={showCustomTypeModal}
        onClose={() => setShowCustomTypeModal(false)}
        onSelect={(typeId) => setType(typeId)}
      />
      <TimePickerModal
        visible={showTimePicker}
        initialTime={reminderTime}
        onClose={() => setShowTimePicker(false)}
        onSelect={setReminderTime}
      />
      <ContactPickerModal
        visible={showContactPicker}
        onClose={() => setShowContactPicker(false)}
        onSelect={handleContactSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
    width: 42,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  form: {
    gap: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    minHeight: 100,
    fontWeight: '500',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  customTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  customTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  reminderOptions: {
    gap: 12,
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  reminderOptionContent: {
    flex: 1,
  },
  reminderOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderOptionDescription: {
    fontSize: 13,
  },
  customLeadTimeContainer: {
    marginTop: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 20,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  namedayPrompt: {
    marginTop: -8,
  },
  namedayPromptCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  namedayPromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  namedayPromptText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  namedayPromptButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  namedayPromptButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  namedayPromptButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  namedayPromptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeChecklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  removeChecklistText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  premiumBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumBadgeTextInline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
