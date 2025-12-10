import { memo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Person } from '@/types/events';
import { ageTurning, nextOccurrence, parseISODate } from '@/lib/date';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomTypes } from '@/contexts/CustomTypesContext';
import { useSettings } from '@/contexts/SettingsContext';
import { usePremium } from '@/contexts/PremiumContext';
import { Feather } from '@expo/vector-icons';
import { makeCall, sendSMS, openWhatsApp } from '@/services/actions';

interface Props {
  people: Person[];
  onSelect: (person: Person) => void;
}

export const TodayCelebrations = memo(function TodayCelebrations({ people, onSelect }: Props) {
  const colors = useThemeColors();
  const { getCustomType } = useCustomTypes();
  const { settings } = useSettings();
  const { canUseOneTapActions } = usePremium();
  const t = useTranslation();

  if (!people.length) return null;

  // Filter to show only people in current month
  const now = new Date();
  const currentMonthPeople = people.filter((person) => {
    const upcoming = nextOccurrence(parseISODate(person.date));
    return upcoming.getMonth() === now.getMonth() && upcoming.getFullYear() === now.getFullYear();
  });

  if (!currentMonthPeople.length) return null;

  const getEventTypeLabel = (type: 'birthday' | 'nameday' | 'other'): string => {
    switch (type) {
      case 'birthday':
        return t('birthday');
      case 'nameday':
        return t('nameDay');
      default:
        return t('other');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.textPrimary }]}>
        {settings.language === 'cs' ? 'Měsíční oslavy' : 'Monthly Celebrations'}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroller}>
        {currentMonthPeople.map((person) => {
          const upcoming = nextOccurrence(parseISODate(person.date));
          const age = ageTurning(person);
          const customType = person.type === 'birthday' || person.type === 'nameday' || person.type === 'other'
            ? null
            : getCustomType(person.type);
          
          const accent =
            customType
              ? customType.color
              : person.type === 'birthday'
                ? colors.primaryAccent
                : person.type === 'nameday'
                  ? colors.namedayAccent
                  : colors.otherAccent;
          
          const iconName = customType
            ? (customType.icon as keyof typeof Feather.glyphMap)
            : iconFor(person.type);
          
          const locale = settings.language === 'cs' ? 'cs-CZ' : 'en-US';
          
          return (
            <View key={person.id} style={styles.cardWrapper}>
              <TouchableOpacity activeOpacity={0.85} onPress={() => onSelect(person)}>
                <View style={[styles.card, { backgroundColor: `${accent}22`, borderColor: `${accent}66` }]}>
                  <View style={[styles.iconWrap, { backgroundColor: `${accent}33` }]}>
                    <Feather name={iconName} size={24} color={accent} />
                  </View>
                  <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
                    {person.name}
                  </Text>
                  <Text style={[styles.caption, { color: colors.textSecondary }]}>
                    {age && person.type === 'birthday'
                      ? t('turns', age)
                      : `${customType ? customType.name : getEventTypeLabel(person.type as 'birthday' | 'nameday' | 'other')} • ${upcoming.toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                        })}`}
                  </Text>
                </View>
              </TouchableOpacity>
              {canUseOneTapActions && person.phoneNumber && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${accent}33` }]}
                    onPress={() => makeCall(person.phoneNumber!)}
                  >
                    <Feather name="phone" size={14} color={accent} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${accent}33` }]}
                    onPress={() => sendSMS(person.phoneNumber!, `Hi ${person.name}! `)}
                  >
                    <Feather name="message-circle" size={14} color={accent} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
});

function iconFor(type: Person['type']): keyof typeof Feather.glyphMap {
  switch (type) {
    case 'birthday':
      return 'gift';
    case 'nameday':
      return 'calendar';
    default:
      return 'sparkles';
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  scroller: {
    paddingVertical: 4,
  },
  cardWrapper: {
    marginRight: 16,
  },
  card: {
    width: 200,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    justifyContent: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  caption: {
    fontSize: 14,
    marginTop: 6,
  },
});



