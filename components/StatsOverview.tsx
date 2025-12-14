import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  totalCelebrations: number;
  thisMonth: number;
  thisWeek: number;
  nextInDays: number | null;
}

export const StatsOverview = memo(function StatsOverview({ 
  totalCelebrations, 
  thisMonth, 
  thisWeek, 
  nextInDays 
}: Props) {
  const colors = useThemeColors();
  const t = useTranslation();

  const stats = [
    {
      icon: 'calendar' as const,
      value: totalCelebrations.toString(),
      label: t('totalCelebrations'),
      color: colors.primaryAccent,
    },
    {
      icon: 'clock' as const,
      value: thisMonth.toString(),
      label: t('thisMonth'),
      color: colors.namedayAccent,
    },
    {
      icon: 'zap' as const,
      value: thisWeek.toString(),
      label: t('thisWeek'),
      color: colors.otherAccent,
    },
    {
      icon: 'gift' as const,
      value: nextInDays !== null ? `${nextInDays}d` : '-',
      label: t('nextCelebration'),
      color: '#FF6B6B',
    },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View
          key={index}
          style={[
            styles.statCard,
            { backgroundColor: colors.surface, shadowColor: colors.cardShadow },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
            <Feather name={stat.icon} size={20} color={stat.color} />
          </View>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{stat.value}</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});


