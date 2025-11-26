import { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Person } from '@/types/events';
import { ageTurning, daysUntil, nextOccurrence, parseISODate } from '@/lib/date';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomTypes } from '@/contexts/CustomTypesContext';
import { useSettings } from '@/contexts/SettingsContext';

interface Props {
  person: Person;
  onPress?: () => void;
}

const iconByType: Record<Person['type'], keyof typeof Feather.glyphMap> = {
  birthday: 'gift',
  nameday: 'sun',
  other: 'star',
};

export const EventCard = memo(function EventCard({ person, onPress }: Props) {
  const colors = useThemeColors();
  const { getCustomType } = useCustomTypes();
  const { settings } = useSettings();
  const t = useTranslation();
  const baseDate = useMemo(() => parseISODate(person.date), [person.date]);
  const upcomingDate = useMemo(() => nextOccurrence(baseDate), [baseDate]);
  const remainingDays = useMemo(() => daysUntil(upcomingDate), [upcomingDate]);
  const turningAge = useMemo(() => ageTurning(person), [person]);

  const customType = useMemo(() => {
    if (person.type === 'birthday' || person.type === 'nameday' || person.type === 'other') {
      return null;
    }
    return getCustomType(person.type);
  }, [person.type, getCustomType]);

  const accentColor = useMemo(() => {
    if (customType) return customType.color;
    if (person.type === 'birthday') return colors.primaryAccent;
    if (person.type === 'nameday') return colors.namedayAccent;
    return colors.otherAccent;
  }, [customType, person.type, colors]);

  const iconName = useMemo(() => {
    if (customType) return customType.icon as keyof typeof Feather.glyphMap;
    return iconByType[person.type as 'birthday' | 'nameday' | 'other'];
  }, [customType, person.type]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <View style={[styles.avatar, { backgroundColor: `${accentColor}33` }]}>
          <Feather name={iconName} size={24} color={accentColor} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {person.name}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
            {buildSubtitle(person, upcomingDate, turningAge, customType || null, t, settings.language)}
          </Text>
        </View>
        <View style={styles.meta}>
          <View style={[styles.pill, { backgroundColor: `${accentColor}26` }]}>
            <Text style={[styles.pillText, { color: accentColor }]}>{formatCountdown(remainingDays, t)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

function buildSubtitle(
  person: Person,
  upcoming: Date,
  turningAge: number | null,
  customType: { name: string } | null,
  t: (key: string, ...args: any[]) => string,
  language: 'en' | 'cs',
): string {
  const label = customType ? customType.name : getEventTypeLabel(person.type as 'birthday' | 'nameday' | 'other', t);
  const locale = language === 'cs' ? 'cs-CZ' : 'en-US';
  const date = upcoming.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  if (person.type === 'birthday' && turningAge) {
    return `${label} • ${date} • ${t('turns', turningAge)}`;
  }
  return `${label} • ${date}`;
}

function getEventTypeLabel(type: 'birthday' | 'nameday' | 'other', t: (key: string) => string): string {
  switch (type) {
    case 'birthday':
      return t('birthday');
    case 'nameday':
      return t('nameDay');
    default:
      return t('other');
  }
}

function formatCountdown(days: number, t: (key: string, ...args: any[]) => string) {
  if (days < 0) return t('passed');
  if (days === 0) return t('today');
  if (days === 1) return t('tomorrow');
  return t('inDays', days);
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    marginVertical: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    shadowOpacity: 0.15,
    elevation: 6,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  meta: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});



