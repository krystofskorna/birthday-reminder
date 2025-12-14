import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Person } from '@/types/events';
import { ageTurning, daysUntil, nextOccurrence, parseISODate } from '@/lib/date';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomTypes } from '@/contexts/CustomTypesContext';

interface Props {
  people: Person[];
  onSelect: (person: Person) => void;
}

export const UpcomingAlert = memo(function UpcomingAlert({ people, onSelect }: Props) {
  const colors = useThemeColors();
  const t = useTranslation();
  const { getCustomType } = useCustomTypes();

  // Filter celebrations happening in next 1-3 days
  const upcomingPeople = people.filter((person) => {
    const upcoming = nextOccurrence(parseISODate(person.date));
    const days = daysUntil(upcoming);
    return days > 0 && days <= 3;
  });

  if (!upcomingPeople.length) return null;

  return (
    <View style={styles.container}>
      {upcomingPeople.map((person) => {
        const upcoming = nextOccurrence(parseISODate(person.date));
        const days = daysUntil(upcoming);
        const age = ageTurning(person);
        const customType =
          person.type === 'birthday' || person.type === 'nameday' || person.type === 'other'
            ? null
            : getCustomType(person.type);

        const accent =
          customType?.color ||
          (person.type === 'birthday'
            ? colors.primaryAccent
            : person.type === 'nameday'
            ? colors.namedayAccent
            : colors.otherAccent);

        const iconName =
          customType?.icon ||
          (person.type === 'birthday' ? 'gift' : person.type === 'nameday' ? 'sun' : 'star');

        return (
          <TouchableOpacity
            key={person.id}
            activeOpacity={0.8}
            onPress={() => onSelect(person)}
            style={[
              styles.alert,
              { backgroundColor: `${accent}15`, borderColor: `${accent}40` },
            ]}
          >
            <View style={[styles.badge, { backgroundColor: accent }]}>
              <Feather name="alert-circle" size={16} color="#FFFFFF" />
            </View>
            <View style={[styles.iconContainer, { backgroundColor: `${accent}30` }]}>
              <Feather name={iconName as any} size={20} color={accent} />
            </View>
            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                {person.name}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {age && person.type === 'birthday'
                  ? `${t('turns', age)} • ${t('inDays', days)}`
                  : t('inDays', days)}
              </Text>
            </View>
            <View style={[styles.daysContainer, { backgroundColor: accent }]}>
              <Text style={styles.daysText}>{days}</Text>
              <Text style={styles.daysLabel}>{days === 1 ? t('day') : t('days')}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    gap: 12,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    gap: 12,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  daysContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 50,
  },
  daysText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  daysLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});


