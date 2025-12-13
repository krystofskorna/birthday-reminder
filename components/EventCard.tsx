import { memo, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Person } from '@/types/events';
import { Checklist } from '@/types/checklist';
import { ageTurning, daysUntil, nextOccurrence, parseISODate } from '@/lib/date';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomTypes } from '@/contexts/CustomTypesContext';
import { useSettings } from '@/contexts/SettingsContext';
import { usePremium } from '@/contexts/PremiumContext';
import { usePeople } from '@/contexts/PeopleContext';
import { makeCall, sendSMS } from '@/services/actions';
import { LinearGradient } from 'expo-linear-gradient';
import { QuickChecklistModal } from './QuickChecklistModal';

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
  const { canUseOneTapActions } = usePremium();
  const { updatePerson } = usePeople();
  const t = useTranslation();
  const [showChecklistModal, setShowChecklistModal] = useState(false);
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

  const isToday = remainingDays === 0;
  const isUpcoming = remainingDays > 0 && remainingDays <= 3;

  const handleSaveChecklist = (checklist: Checklist) => {
    updatePerson(person.id, { checklist });
  };

  const checklistProgress = person.checklist
    ? `${person.checklist.items.filter((i) => i.completed).length}/${person.checklist.items.length}`
    : null;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={
            isToday
              ? [`${accentColor}30`, `${accentColor}15`]
              : isUpcoming
              ? [`${accentColor}20`, `${accentColor}08`]
              : [colors.surface, colors.surface]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            { shadowColor: colors.cardShadow },
            isToday && { borderColor: accentColor, borderWidth: 2 },
            isUpcoming && { borderColor: `${accentColor}60`, borderWidth: 1 },
          ]}
        >
          {/* Badge for today or urgent */}
          {(isToday || isUpcoming) && (
            <View style={[styles.badge, { backgroundColor: accentColor }]}>
              <Feather name={isToday ? 'zap' : 'alert-circle'} size={12} color="#FFFFFF" />
            </View>
          )}

          <View style={[styles.avatar, { backgroundColor: `${accentColor}33` }]}>
            <Feather name={iconName} size={24} color={accentColor} />
          </View>
          <View style={styles.info}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                {person.name}
              </Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
              {buildSubtitle(person, upcomingDate, turningAge, customType || null, t, settings.language)}
            </Text>
            {person.note && (
              <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>
                💬 {person.note}
              </Text>
            )}
          </View>
          <View style={styles.meta}>
            <View style={[styles.pill, { backgroundColor: `${accentColor}26` }]}>
              <Text style={[styles.pillText, { color: accentColor }]}>{formatCountdown(remainingDays, t)}</Text>
            </View>
            {/* Checklist Button - compact version */}
            <TouchableOpacity
              style={[styles.checklistButton, { backgroundColor: `${accentColor}20` }]}
              onPress={(e) => {
                e.stopPropagation();
                setShowChecklistModal(true);
              }}
            >
              <Feather name="check-square" size={16} color={accentColor} />
              {checklistProgress && (
                <Text style={[styles.checklistButtonText, { color: accentColor }]}>{checklistProgress}</Text>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Actions - Only phone/SMS */}
      {canUseOneTapActions && person.phoneNumber && (isToday || isUpcoming) && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${accentColor}20` }]}
            onPress={() => makeCall(person.phoneNumber!)}
          >
            <Feather name="phone" size={16} color={accentColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${accentColor}20` }]}
            onPress={() => sendSMS(person.phoneNumber!, `${t('happyBirthday')} ${person.name}! 🎉`)}
          >
            <Feather name="message-circle" size={16} color={accentColor} />
          </TouchableOpacity>
        </View>
      )}

      {/* Checklist Modal */}
      <QuickChecklistModal
        visible={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        onSave={handleSaveChecklist}
        initialChecklist={person.checklist}
        personName={person.name}
      />
    </View>
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
  container: {
    marginVertical: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.12,
    elevation: 5,
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
    zIndex: 10,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  note: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  meta: {
    marginLeft: 12,
    alignItems: 'flex-end',
    gap: 8,
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
  checklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    minWidth: 36,
    justifyContent: 'center',
  },
  checklistButtonText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
