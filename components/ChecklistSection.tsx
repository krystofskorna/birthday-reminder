import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { Checklist, ChecklistItem } from '@/types/checklist';
import { usePremium } from '@/contexts/PremiumContext';

interface ChecklistSectionProps {
  checklist?: Checklist;
  onToggleItem: (itemId: string) => void;
  onEdit?: () => void;
}

export function ChecklistSection({ checklist, onToggleItem, onEdit }: ChecklistSectionProps) {
  const colors = useThemeColors();
  const t = useTranslation();
  const { canUseChecklists, isPremium } = usePremium();

  if (!canUseChecklists) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Feather name="check-square" size={20} color={colors.textPrimary} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('checklist')}</Text>
          </View>
          <View style={[styles.premiumBadge, { backgroundColor: `${colors.primaryAccent}15` }]}>
            <Feather name="lock" size={12} color={colors.primaryAccent} />
            <Text style={[styles.premiumBadgeText, { color: colors.primaryAccent }]}>Premium</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.upgradeButton, { backgroundColor: `${colors.primaryAccent}10`, borderColor: colors.primaryAccent }]}
          onPress={() => Alert.alert(t('premiumRequired'), t('checklistPremiumDesc'))}
        >
          <Text style={[styles.upgradeButtonText, { color: colors.primaryAccent }]}>
            {t('upgradeToPremium')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!checklist || checklist.items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Feather name="check-square" size={20} color={colors.textPrimary} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('checklist')}</Text>
          </View>
          {onEdit && (
            <TouchableOpacity onPress={onEdit}>
              <Feather name="edit-2" size={18} color={colors.primaryAccent} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('noChecklistItems')}
        </Text>
      </View>
    );
  }

  const completedCount = checklist.items.filter(item => item.completed).length;
  const totalCount = checklist.items.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="check-square" size={20} color={colors.textPrimary} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('checklist')}</Text>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {completedCount}/{totalCount}
          </Text>
        </View>
        {onEdit && (
          <TouchableOpacity onPress={onEdit}>
            <Feather name="edit-2" size={18} color={colors.primaryAccent} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.progressBar, { backgroundColor: `${colors.primaryAccent}20` }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primaryAccent, width: `${progress * 100}%` },
          ]}
        />
      </View>

      <View style={styles.itemsContainer}>
        {checklist.items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => onToggleItem(item.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: item.completed ? colors.primaryAccent : 'transparent',
                  borderColor: item.completed ? colors.primaryAccent : colors.textSecondary,
                },
              ]}
            >
              {item.completed && <Feather name="check" size={14} color="#FFFFFF" />}
            </View>
            <Text
              style={[
                styles.itemText,
                {
                  color: item.completed ? colors.textSecondary : colors.textPrimary,
                  textDecorationLine: item.completed ? 'line-through' : 'none',
                },
              ]}
            >
              {item.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  upgradeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  itemsContainer: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});





