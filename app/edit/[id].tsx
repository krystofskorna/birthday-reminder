import { useState, useEffect, useMemo } from 'react';
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
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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
import { QuickChecklistModal } from '@/components/QuickChecklistModal';
import { EventType, ReminderLeadTime } from '@/types/events';
import { Checklist } from '@/types/checklist';
import { getReminderOptions } from '@/constants/reminders';
import { toISODate, parseISODate } from '@/lib/date';

export default function EditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPerson, updatePerson } = usePeople();
  const colors = useThemeColors();
  const { customTypes } = useCustomTypes();
  const { settings } = useSettings();
  const { isPremium } = usePremium();
  const t = useTranslation();

  const person = id ? getPerson(id) : undefined;

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
  const [customLeadTime, setCustomLeadTime] = useState('');
  const [checklist, setChecklist] = useState<Checklist | undefined>(person?.checklist);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  const reminderOptions = useMemo(() => getReminderOptions(settings.language, isPremium), [settings.language, isPremium]);

  useEffect(() => {
    if (person) {
      setFirstName(person.firstName || person.name.split(' ')[0] || '');
      setLastName(person.lastName || person.name.split(' ').slice(1).join(' ') || '');
      setDate(parseISODate(person.date));
      setType(person.type);
      setNote(person.note || '');
      setPhoneNumber(person.phoneNumber || '');
      setReminderEnabled(person.reminderEnabled);
      setReminderLeadTime(person.reminderLeadTime);
      setReminderTime(person.reminderTime || '09:00');
      setChecklist(person.checklist);
      // If the current lead time is not in the standard options, set customLeadTime
      const isStandard = reminderOptions.some(opt => opt.value === person.reminderLeadTime);
      if (!isStandard) {
        setCustomLeadTime(person.reminderLeadTime.toString());
      }
    }
  }, [person, reminderOptions]);

  if (!person) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>{t('celebration')} {t('notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    if (!firstName.trim() && !lastName.trim()) {
      Alert.alert(t('validationError'), t('pleaseEnterName'));
      return;
    }

    updatePerson(person.id, {
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      date: toISODate(date),
      type,
      note: note.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      reminderEnabled,
      reminderLeadTime: customLeadTime ? parseInt(customLeadTime, 10) : reminderLeadTime,
      reminderTime,
      checklist,
    });

    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Go back">
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('editCelebrationTitle')}</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.form}>
          {/* Name Inputs Card */}
          <View style={[styles.nameCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
            <View style={[styles.nameCardHeader, { borderBottomColor: `${colors.textSecondary}15` }]}>
              <View style={[styles.nameIconContainer, { backgroundColor: `${colors.primaryAccent}15` }]}>
                <Feather name="user" size={20} color={colors.primaryAccent} />
              </View>
              <Text style={[styles.nameCardTitle, { color: colors.textPrimary }]}>
                {settings.language === 'cs' ? 'Jméno a příjmení' : 'Name'}
              </Text>
            </View>
            
            {/* First Name Input */}
            <View style={styles.nameInputGroup}>
              <View style={styles.nameInputWrapper}>
                <View style={[styles.inputIconContainer, { backgroundColor: `${colors.primaryAccent}10` }]}>
                  <Feather name="smile" size={16} color={colors.primaryAccent} />
                </View>
                <View style={styles.inputContent}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {settings.language === 'cs' ? 'Jméno *' : 'First Name *'}
                  </Text>
                  <TextInput
                    style={[styles.modernInput, { color: colors.textPrimary }]}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder={settings.language === 'cs' ? 'např. Jan' : 'e.g. John'}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            {/* Last Name Input */}
            <View style={styles.nameInputGroup}>
              <View style={styles.nameInputWrapper}>
                <View style={[styles.inputIconContainer, { backgroundColor: `${colors.primaryAccent}10` }]}>
                  <Feather name="users" size={16} color={colors.primaryAccent} />
                </View>
                <View style={styles.inputContent}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {settings.language === 'cs' ? 'Příjmení' : 'Last Name'}
                  </Text>
                  <TextInput
                    style={[styles.modernInput, { color: colors.textPrimary }]}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder={settings.language === 'cs' ? 'např. Novák' : 'e.g. Smith'}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </View>
          </View>

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

          {/* Checklist Section */}
          <View style={styles.section}>
            <View style={styles.checklistHeader}>
              <View style={styles.checklistHeaderLeft}>
                <View style={[styles.checklistIcon, { backgroundColor: `${colors.primaryAccent}15` }]}>
                  <Feather name="check-square" size={18} color={colors.primaryAccent} />
                </View>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('checklist')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowChecklistModal(true)}
                style={[styles.checklistButton, { backgroundColor: `${colors.primaryAccent}15` }]}
              >
                <Feather name={checklist ? "edit-2" : "plus"} size={16} color={colors.primaryAccent} />
                <Text style={[styles.checklistButtonText, { color: colors.primaryAccent }]}>
                  {checklist ? t('edit') : t('addChecklist')}
                </Text>
              </TouchableOpacity>
            </View>
            {checklist && checklist.items.length > 0 && (
              <View style={[styles.checklistPreview, { backgroundColor: colors.surface }]}>
                <Text style={[styles.checklistPreviewText, { color: colors.textSecondary }]}>
                  {checklist.items.filter(i => i.completed).length}/{checklist.items.length} {t('completed')}
                </Text>
              </View>
            )}
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
                      {t('reminderTime') || 'Reminder Time'}
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
                    {t('customLeadTime') || 'Custom Days Before'}
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
      <QuickChecklistModal
        visible={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        onSave={(newChecklist) => setChecklist(newChecklist)}
        initialChecklist={checklist}
        personName={firstName.trim() || lastName.trim() || person?.name || t('celebration')}
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
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
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  checklistHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checklistIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  checklistButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  checklistPreview: {
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  checklistPreviewText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nameCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  nameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  nameIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameCardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  nameInputGroup: {
    marginBottom: 16,
  },
  nameInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modernInput: {
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 8,
  },
});
