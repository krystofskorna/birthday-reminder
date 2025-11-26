import { useState, useMemo } from 'react';
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
import { DateField } from '@/components/DateField';
import { AddCustomTypeModal } from '@/components/AddCustomTypeModal';
import { EventType, ReminderLeadTime } from '@/types/events';
import { getReminderOptions } from '@/constants/reminders';
import { toISODate } from '@/lib/date';

export default function AddScreen() {
  const router = useRouter();
  const { addPerson } = usePeople();
  const colors = useThemeColors();
  const { customTypes } = useCustomTypes();
  const { settings } = useSettings();
  const t = useTranslation();

  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<EventType | string>('birthday');
  const [note, setNote] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderLeadTime, setReminderLeadTime] = useState<ReminderLeadTime>(1);
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false);

  const reminderOptions = useMemo(() => getReminderOptions(settings.language), [settings.language]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('validationError'), t('pleaseEnterName'));
      return;
    }

    addPerson({
      name: name.trim(),
      date: toISODate(date),
      type,
      note: note.trim() || undefined,
      reminderEnabled,
      reminderLeadTime,
    });

    router.back();
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
          {/* Name Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('nameRequired')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: `${colors.primaryAccent}33` }]}
              value={name}
              onChangeText={setName}
              placeholder={t('enterName')}
              placeholderTextColor={colors.textSecondary}
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
                {reminderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.reminderOption,
                      {
                        backgroundColor:
                          reminderLeadTime === option.value
                            ? `${colors.primaryAccent}26`
                            : 'transparent',
                        borderColor:
                          reminderLeadTime === option.value
                            ? colors.primaryAccent
                            : `${colors.primaryAccent}33`,
                      },
                    ]}
                    onPress={() => setReminderLeadTime(option.value)}
                  >
                    <View style={styles.reminderOptionContent}>
                      <Text style={[styles.reminderOptionLabel, { color: colors.textPrimary }]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.reminderOptionDescription, { color: colors.textSecondary }]}>
                        {option.description}
                      </Text>
                    </View>
                    {reminderLeadTime === option.value && (
                      <Feather name="check" size={20} color={colors.primaryAccent} />
                    )}
                  </TouchableOpacity>
                ))}
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
});
