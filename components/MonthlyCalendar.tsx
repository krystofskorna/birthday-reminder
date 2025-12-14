import { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Person } from '@/types/events';
import { nextOccurrence, parseISODate } from '@/lib/date';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather } from '@expo/vector-icons';

interface Props {
  people: Person[];
  onDatePress?: (date: Date, people: Person[]) => void;
}

export const MonthlyCalendar = memo(function MonthlyCalendar({ people, onDatePress }: Props) {
  const colors = useThemeColors();
  const t = useTranslation();

  const { dates, currentMonth } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    // Map dates to celebrations
    const celebrationsByDate = new Map<number, Person[]>();
    people.forEach((person) => {
      const upcoming = nextOccurrence(parseISODate(person.date));
      if (upcoming.getMonth() === month && upcoming.getFullYear() === year) {
        const day = upcoming.getDate();
        if (!celebrationsByDate.has(day)) {
          celebrationsByDate.set(day, []);
        }
        celebrationsByDate.get(day)!.push(person);
      }
    });

    const dates: Array<{ day: number; people: Person[]; isToday: boolean }> = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === now.toDateString();
      dates.push({
        day,
        people: celebrationsByDate.get(day) || [],
        isToday,
      });
    }

    const currentMonth = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    return { dates, currentMonth };
  }, [people]);

  if (!dates.some((d) => d.people.length > 0)) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Feather name="calendar" size={18} color={colors.primaryAccent} />
        <Text style={[styles.heading, { color: colors.textPrimary }]}>
          📅 {currentMonth}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((dateInfo) => {
          const hasCelebrations = dateInfo.people.length > 0;
          const accent =
            dateInfo.people.length > 0
              ? dateInfo.people[0].type === 'birthday'
                ? colors.primaryAccent
                : dateInfo.people[0].type === 'nameday'
                ? colors.namedayAccent
                : colors.otherAccent
              : colors.textSecondary;

          return (
            <TouchableOpacity
              key={dateInfo.day}
              activeOpacity={hasCelebrations ? 0.7 : 1}
              disabled={!hasCelebrations}
              onPress={() => {
                if (hasCelebrations && onDatePress) {
                  const date = new Date(new Date().getFullYear(), new Date().getMonth(), dateInfo.day);
                  onDatePress(date, dateInfo.people);
                }
              }}
              style={[
                styles.dateCard,
                { backgroundColor: colors.surface, shadowColor: colors.cardShadow },
                dateInfo.isToday && { borderColor: accent, borderWidth: 2 },
                hasCelebrations && { backgroundColor: `${accent}15` },
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  { color: hasCelebrations ? accent : colors.textSecondary },
                  dateInfo.isToday && { fontWeight: '800' },
                ]}
              >
                {dateInfo.day}
              </Text>
              {hasCelebrations && (
                <View style={styles.dotContainer}>
                  {dateInfo.people.slice(0, 3).map((person, index) => (
                    <View
                      key={person.id}
                      style={[styles.dot, { backgroundColor: accent }]}
                    />
                  ))}
                  {dateInfo.people.length > 3 && (
                    <Text style={[styles.moreText, { color: accent }]}>
                      +{dateInfo.people.length - 3}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  dateCard: {
    width: 48,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  moreText: {
    fontSize: 8,
    fontWeight: '700',
    marginLeft: 2,
  },
});


