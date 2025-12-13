import { memo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Person } from '@/types/events';
import { Checklist } from '@/types/checklist';
import { ageTurning, nextOccurrence, parseISODate } from '@/lib/date';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomTypes } from '@/contexts/CustomTypesContext';
import { usePremium } from '@/contexts/PremiumContext';
import { usePeople } from '@/contexts/PeopleContext';
import { makeCall, sendSMS } from '@/services/actions';
import { LinearGradient } from 'expo-linear-gradient';
import { QuickChecklistModal } from './QuickChecklistModal';

interface Props {
  people: Person[];
  onSelect: (person: Person) => void;
}

export const TodayHighlight = memo(function TodayHighlight({ people, onSelect }: Props) {
  const colors = useThemeColors();
  const t = useTranslation();
  const { getCustomType } = useCustomTypes();
  const { canUseOneTapActions } = usePremium();
  const { updatePerson } = usePeople();
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  if (!people.length) return null;

  const person = people[0];
  const upcoming = nextOccurrence(parseISODate(person.date));
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
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Feather name="star" size={18} color={accent} />
        <Text style={[styles.heading, { color: colors.textPrimary }]}>
          🎉 {t('todayCelebration')}
        </Text>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={() => onSelect(person)}>
        <LinearGradient
          colors={[`${accent}30`, `${accent}15`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { borderColor: accent }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${accent}40` }]}>
            <Feather name={iconName as any} size={32} color={accent} />
          </View>
          <View style={styles.content}>
            <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
              {person.name}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {age && person.type === 'birthday'
                ? t('turnsToday', age)
                : customType
                ? customType.name
                : t(person.type)}
            </Text>
            {person.note && (
              <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={2}>
                💬 {person.note}
              </Text>
            )}
            {person.checklist && person.checklist.items.length > 0 && (
              <View style={[styles.checklistPill, { backgroundColor: `${accent}40` }]}>
                <Feather name="check-square" size={14} color={accent} />
                <Text style={[styles.checklistPillText, { color: accent }]}>
                  {person.checklist.items.filter(i => i.completed).length}/{person.checklist.items.length} {t('completed')}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}
          onPress={() => setShowChecklistModal(true)}
        >
          <Feather name="check-square" size={20} color={accent} />
          <Text style={[styles.actionText, { color: colors.textPrimary }]}>{t('checklist')}</Text>
        </TouchableOpacity>
        {canUseOneTapActions && person.phoneNumber && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}
              onPress={() => makeCall(person.phoneNumber!)}
            >
              <Feather name="phone" size={20} color={accent} />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>{t('call')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}
              onPress={() => sendSMS(person.phoneNumber!, `${t('happyBirthday')} ${person.name}! 🎉`)}
            >
              <Feather name="message-circle" size={20} color={accent} />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>{t('message')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <QuickChecklistModal
        visible={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        onSave={(checklist) => updatePerson(person.id, { checklist })}
        initialChecklist={person.checklist}
        personName={person.name}
      />
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    gap: 16,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  note: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  checklistPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
  },
  checklistPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

