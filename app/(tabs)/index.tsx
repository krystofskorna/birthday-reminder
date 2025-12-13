import { useMemo, useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePeople } from '@/contexts/PeopleContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { EventCard } from '@/components/EventCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionGroup, SectionHeader } from '@/components/SectionHeader';
import { TodayCelebrations } from '@/components/TodayCelebrations';
import { StatsOverview } from '@/components/StatsOverview';
import { TodayHighlight } from '@/components/TodayHighlight';
import { UpcomingAlert } from '@/components/UpcomingAlert';
import { MonthlyCalendar } from '@/components/MonthlyCalendar';
import { SearchBar } from '@/components/SearchBar';
import { FilterModal, FilterOptions } from '@/components/FilterModal';
import { PremiumOnboardingModal, shouldShowPremiumOnboarding, markPremiumOnboardingShown } from '@/components/PremiumOnboardingModal';
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
  const [showPremiumOnboarding, setShowPremiumOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    types: new Set(['birthday', 'nameday', 'other']),
    sortBy: 'date',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPremiumOnboarding(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClosePremiumOnboarding = async () => {
    await markPremiumOnboardingShown();
    setShowPremiumOnboarding(false);
  };

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

  // Filter and sort people
  const filteredPeople = useMemo(() => {
    let result = decorated;

    // Apply type filter
    result = result.filter((person) => filters.types.has(person.type));

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((person) =>
        person.name.toLowerCase().includes(query) ||
        (person.note && person.note.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    if (filters.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'type') {
      result.sort((a, b) => a.type.localeCompare(b.type));
    }

    return result;
  }, [decorated, filters, searchQuery]);

  // Get today's celebrations
  const todayPeople = useMemo(() => {
    const now = new Date();
    return decorated.filter((person) => {
      return person.daysUntil === 0;
    });
  }, [decorated]);

  // Get current month celebrations
  const currentMonth = useMemo(() => {
    const now = new Date();
    return decorated.filter((person) => {
      return person.upcoming.getMonth() === now.getMonth() && 
             person.upcoming.getFullYear() === now.getFullYear();
    });
  }, [decorated]);

  // Get this week celebrations
  const thisWeek = useMemo(() => {
    return decorated.filter((person) => person.daysUntil > 0 && person.daysUntil <= 7);
  }, [decorated]);

  // Get next celebration in days
  const nextInDays = useMemo(() => {
    const next = decorated.find((person) => person.daysUntil > 0);
    return next ? next.daysUntil : null;
  }, [decorated]);

  const sections = useMemo(() => groupPeople(filteredPeople), [filteredPeople]);

  const handleDatePress = useCallback((date: Date, people: Person[]) => {
    if (people.length === 1) {
      router.push(`/person/${people[0].id}`);
    } else {
      // Show alert with list of people
      const names = people.map(p => p.name).join('\n');
      Alert.alert(
        `${date.getDate()}. ${date.toLocaleDateString(undefined, { month: 'long' })}`,
        names,
        people.map(person => ({
          text: person.name,
          onPress: () => router.push(`/person/${person.id}`),
        })).concat({ text: t('cancel'), style: 'cancel' })
      );
    }
  }, [router, t]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView 
          contentContainerStyle={styles.scroll}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={[styles.titleIconContainer, { backgroundColor: `${colors.primaryAccent}15` }]}>
                <Text style={styles.titleEmoji}>🎉</Text>
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{t('upcomingCelebrations')}</Text>
              </View>
            </View>
          </View>

          {/* Stats Overview */}
          {people.length > 0 && (
            <StatsOverview
              totalCelebrations={people.length}
              thisMonth={currentMonth.length}
              thisWeek={thisWeek.length}
              nextInDays={nextInDays}
            />
          )}

          {/* Today's Celebration Highlight */}
          {todayPeople.length > 0 && (
            <TodayHighlight
              people={todayPeople}
              onSelect={(person) => router.push(`/person/${person.id}`)}
            />
          )}

          {/* Upcoming Alerts (1-3 days) */}
          <UpcomingAlert
            people={decorated}
            onSelect={(person) => router.push(`/person/${person.id}`)}
          />

          {/* Monthly Calendar */}
          <MonthlyCalendar
            people={people}
            onDatePress={handleDatePress}
          />

          {/* Search Bar */}
          {people.length > 0 && (
            <SearchBar
              onSearch={setSearchQuery}
              onFilterPress={() => setShowFilterModal(true)}
            />
          )}

          {/* Current Month Celebrations */}
          {currentMonth.length > 0 && !todayPeople.length && (
            <TodayCelebrations people={currentMonth} onSelect={(person) => router.push(`/person/${person.id}`)} />
          )}

          {/* Sections */}
          {sections.length ? (
            sections.map((section) => (
              <SectionGroup key={section.title}>
                <SectionHeader title={section.title} subtitle={section.subtitle} />
                {section.people.map((person) => (
                  <EventCard key={person.id} person={person} onPress={() => router.push(`/person/${person.id}`)} />
                ))}
              </SectionGroup>
            ))
          ) : searchQuery || filters.types.size < 3 ? (
            <View style={styles.emptySearchContainer}>
              <Feather name="search" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptySearchText, { color: colors.textPrimary }]}>
                {t('noResults')}
              </Text>
              <Text style={[styles.emptySearchSubtext, { color: colors.textSecondary }]}>
                {t('tryDifferentSearch')}
              </Text>
            </View>
          ) : (
            <EmptyState
              title={t('noBirthdaysYet')}
              message={t('noCelebrationsToDisplay')}
            />
          )}
          
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

      {/* Modals */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={setFilters}
        currentFilters={filters}
      />
      <PremiumOnboardingModal
        visible={showPremiumOnboarding}
        onClose={handleClosePremiumOnboarding}
      />
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

  if (thisWeek.length) {
    sections.push({
      title: 'This Week',
      people: thisWeek,
    });
  }

  if (thisMonth.length) {
    sections.push({
      title: 'This Month',
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
      people: group,
    });
  });

  return sections;
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
    marginBottom: 24,
    marginTop: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  emptySearchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptySearchText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySearchSubtext: {
    fontSize: 15,
    textAlign: 'center',
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
});
