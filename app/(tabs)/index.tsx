import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePeople } from '@/contexts/PeopleContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { EventCard } from '@/components/EventCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionGroup, SectionHeader } from '@/components/SectionHeader';
import { TodayCelebrations } from '@/components/TodayCelebrations';
import { AdBanner } from '@/components/AdBanner';
import { Person } from '@/types/events';
import { daysUntil, nextOccurrence, parseISODate } from '@/lib/date';

type DecoratedPerson = Person & {
  upcoming: Date;
  daysUntil: number;
};

export default function UpcomingScreen() {
  const router = useRouter();
  const { people } = usePeople();
  const colors = useThemeColors();
  const t = useTranslation();

  const decorated = useMemo<DecoratedPerson[]>(
    () =>
      [...people]
        .map((person) => {
          const baseDate = parseISODate(person.date);
          const upcoming = nextOccurrence(baseDate);
          return { ...person, upcoming, daysUntil: daysUntil(upcoming) };
        })
        .sort((a, b) => a.upcoming.getTime() - b.upcoming.getTime()),
    [people],
  );

  const today = decorated.filter((person) => person.daysUntil === 0);
  const sections = useMemo(() => groupPeople(decorated), [decorated]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView 
          contentContainerStyle={styles.scroll}
          style={styles.scrollView}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={[styles.titleIconContainer, { backgroundColor: `${colors.primaryAccent}15` }]}>
                <Text style={styles.titleEmoji}>🎉</Text>
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{t('upcomingCelebrations')}</Text>
                <View style={[styles.titleUnderline, { backgroundColor: colors.primaryAccent }]} />
              </View>
            </View>
            <View style={[styles.subtitleContainer, { backgroundColor: `${colors.primaryAccent}08`, borderLeftColor: colors.primaryAccent }]}>
              <Feather name="heart" size={16} color={colors.primaryAccent} />
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {people.length === 0 
                  ? t('startAddingCelebrations')
                  : people.length === 1
                  ? t('youHaveOneCelebration')
                  : t('youHaveCelebrations', people.length)}
              </Text>
            </View>
          </View>

          {today.length ? (
            <TodayCelebrations people={today} onSelect={(person) => router.push(`/person/${person.id}`)} />
          ) : null}

          {sections.length ? (
            sections.map((section) => (
              <SectionGroup key={section.title}>
                <SectionHeader title={section.title} subtitle={section.subtitle} />
                {section.people.map((person) => (
                  <EventCard key={person.id} person={person} onPress={() => router.push(`/person/${person.id}`)} />
                ))}
              </SectionGroup>
            ))
          ) : (
            <EmptyState
              title={t('noBirthdaysYet')}
              message={t('noCelebrationsToDisplay')}
            />
          )}
          
          {/* Ad Banner - Hidden until AdMob is configured */}
          {/* <View style={styles.adContainer}>
            <AdBanner />
          </View> */}
        </ScrollView>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primaryAccent, shadowColor: colors.cardShadow }]}
          activeOpacity={0.8}
          onPress={() => router.push('/add')}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{t('addCelebration')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

interface Section {
  title: string;
  subtitle?: string;
  people: DecoratedPerson[];
}

function groupPeople(people: DecoratedPerson[]): Section[] {
  const now = new Date();
  const thisWeek: DecoratedPerson[] = [];
  const thisMonth: DecoratedPerson[] = [];
  const laterMap = new Map<string, DecoratedPerson[]>();

  people.forEach((person) => {
    if (person.daysUntil <= 0) {
      return;
    }
    if (person.daysUntil <= 7) {
      thisWeek.push(person);
      return;
    }
    if (
      person.upcoming.getMonth() === now.getMonth() &&
      person.upcoming.getFullYear() === now.getFullYear()
    ) {
      thisMonth.push(person);
      return;
    }

    const monthLabel = person.upcoming.toLocaleDateString(undefined, {
      month: 'long',
      year: person.upcoming.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });

    if (!laterMap.has(monthLabel)) {
      laterMap.set(monthLabel, []);
    }
    laterMap.get(monthLabel)!.push(person);
  });

  const sections: Section[] = [];

  // Note: Section titles will be translated in the component that uses them
  if (thisWeek.length) {
    sections.push({
      title: 'This Week', // Will be translated in component
      subtitle: labelForRange(thisWeek),
      people: thisWeek,
    });
  }

  if (thisMonth.length) {
    sections.push({
      title: 'This Month', // Will be translated in component
      subtitle: labelForRange(thisMonth),
      people: thisMonth,
    });
  }

  const laterKeys = Array.from(laterMap.keys()).sort((a, b) => {
    const aDate = new Date(a);
    const bDate = new Date(b);
    return aDate.getTime() - bDate.getTime();
  });

  laterKeys.forEach((key) => {
    const group = laterMap.get(key)!;
    sections.push({
      title: key,
      subtitle: labelForRange(group),
      people: group,
    });
  });

  return sections;
}

function labelForRange(people: DecoratedPerson[]) {
  if (!people.length) return undefined;
  const first = people[0].upcoming;
  const last = people[people.length - 1].upcoming;
  const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();

  const format = (date: Date) =>
    date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

  if (sameMonth) {
    if (first.getDate() === last.getDate()) {
      return format(first);
    }
    return `${format(first)} – ${format(last)}`;
  }

  return `${format(first)} → ${format(last)}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 28,
    marginTop: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  titleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  titleEmoji: {
    fontSize: 28,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  titleUnderline: {
    height: 3,
    width: 60,
    borderRadius: 2,
    marginTop: 2,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderLeftWidth: 3,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    shadowOpacity: 0.25,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  adContainer: {
    marginTop: 24,
    marginBottom: 8,
    alignItems: 'center',
  },
});



