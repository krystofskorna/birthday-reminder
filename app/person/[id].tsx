import { useMemo } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { usePeople } from '@/contexts/PeopleContext';
import { daysUntil, formatLong, nextOccurrence, parseISODate, ageTurning } from '@/lib/date';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomTypes } from '@/contexts/CustomTypesContext';
import { useSettings } from '@/contexts/SettingsContext';

export default function PersonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPerson, updatePerson, removePerson } = usePeople();
  const person = id ? getPerson(id) : undefined;
  const router = useRouter();
  const colors = useThemeColors();
  const { getCustomType } = useCustomTypes();
  const { settings } = useSettings();
  const t = useTranslation();

  const details = useMemo(() => {
    if (!person) return null;
    const baseDate = parseISODate(person.date);
    const upcoming = nextOccurrence(baseDate);
    const remaining = daysUntil(upcoming);
    const age = ageTurning(person);
    return {
      upcoming,
      remaining,
      age,
      formattedDate: formatLong(baseDate, settings.language),
    };
  }, [person, settings.language]);

  if (!person || !details) {
    return (
      <SafeAreaView style={[styles.safeFallback, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary, fontSize: 18, textAlign: 'center' }}>Celebration not found.</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(t('deleteCelebration'), t('deletePerson', person.name), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteCelebration'),
        style: 'destructive',
        onPress: () => {
          removePerson(person.id);
          router.back();
        },
      },
    ]);
  };

  const handleReminderToggle = (value: boolean) => {
    updatePerson(person.id, { ...person, reminderEnabled: value });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Go back">
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.iconGroup}>
            <TouchableOpacity 
              onPress={() => router.push(`/edit/${person.id}`)} 
              style={styles.iconButton} 
              accessibilityLabel={t('editCelebration')}
            >
              <Feather name="edit-2" size={20} color={colors.primaryAccent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton} accessibilityLabel={t('deleteCelebrationLabel')}>
              <Feather name="trash-2" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <View style={[styles.heroIcon, { backgroundColor: `${accentFor(person.type, colors, getCustomType)}22` }]}>
            <Feather name={iconFor(person.type, getCustomType)} size={30} color={accentFor(person.type, colors, getCustomType)} />
          </View>
          <Text style={[styles.heroName, { color: colors.textPrimary }]}>{person.name}</Text>
          <Text style={[styles.heroType, { color: colors.textSecondary }]}>{labelFor(person.type, getCustomType, t)}</Text>
          <View style={styles.heroMeta}>
            <MetaRow label={t('celebration')} value={details.formattedDate} colors={colors} />
            <MetaRow label={t('countdown')} value={formatCountdown(details.remaining, t)} colors={colors} />
            {details.age ? (
              <MetaRow label={t('turnsLabel')} value={`${details.age}`} colors={colors} />
            ) : null}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('reminder')}</Text>
            <Switch value={person.reminderEnabled} onValueChange={handleReminderToggle} trackColor={{ true: colors.primaryAccent }} />
          </View>
          {person.reminderEnabled && (
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            {t('weWillRemindYou', leadTimeLabel(person.reminderLeadTime, t))}
              {person.reminderTime && ` at ${person.reminderTime}`}
          </Text>
          )}
        </View>

        {person.note ? (
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('notes')}</Text>
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>{person.note}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

function labelFor(
  type: string, 
  getCustomType: (id: string) => import('@/types/customTypes').CustomEventType | undefined,
  t: (key: string) => string
) {
  if (type === 'birthday') return t('birthday');
  if (type === 'nameday') return t('nameDay');
  const customType = getCustomType(type);
  return customType ? customType.name : t('celebration');
}

function iconFor(type: string, getCustomType: (id: string) => import('@/types/customTypes').CustomEventType | undefined): keyof typeof Feather.glyphMap {
  if (type === 'birthday') return 'gift';
  if (type === 'nameday') return 'calendar';
  const customType = getCustomType(type);
  return customType ? (customType.icon as keyof typeof Feather.glyphMap) : 'star';
}

function accentFor(type: string, colors: ReturnType<typeof useThemeColors>, getCustomType: (id: string) => import('@/types/customTypes').CustomEventType | undefined) {
  if (type === 'birthday') return colors.primaryAccent;
  if (type === 'nameday') return colors.namedayAccent;
  const customType = getCustomType(type);
  return customType ? customType.color : colors.otherAccent;
}

function leadTimeLabel(value: number, t: (key: string) => string) {
  switch (value) {
    case 0:
      return t('onTheMorning');
    case 1:
      return t('oneDayBefore');
    case 7:
      return t('oneWeekInAdvance');
    case 30:
      return t('oneMonthInAdvance');
    default:
      return `${value} days before`; // Simplified fallback
  }
}

function formatCountdown(value: number, t: (key: string, ...args: any[]) => string) {
  if (value < 0) return t('passed');
  if (value === 0) return t('today');
  if (value === 1) return t('tomorrow');
  return t('inDays', value);
}

const styles = StyleSheet.create({
  safeFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
  },
  hero: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '800',
  },
  heroType: {
    fontSize: 16,
    marginTop: 6,
  },
  heroMeta: {
    width: '100%',
    marginTop: 24,
    gap: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 14,
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
  },
});



