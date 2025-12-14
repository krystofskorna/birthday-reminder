import { memo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { Person } from '@/types/events';

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  types: Set<Person['type']>;
  sortBy: 'date' | 'name' | 'type';
}

export const FilterModal = memo(function FilterModal({
  visible,
  onClose,
  onApply,
  currentFilters,
}: Props) {
  const colors = useThemeColors();
  const t = useTranslation();
  const [types, setTypes] = useState<Set<Person['type']>>(currentFilters.types);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>(currentFilters.sortBy);

  const handleApply = () => {
    onApply({ types, sortBy });
    onClose();
  };

  const handleReset = () => {
    setTypes(new Set(['birthday', 'nameday', 'other']));
    setSortBy('date');
  };

  const toggleType = (type: Person['type']) => {
    const newTypes = new Set(types);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setTypes(newTypes);
  };

  const typeOptions: Array<{ value: Person['type']; label: string; icon: keyof typeof Feather.glyphMap }> = [
    { value: 'birthday', label: t('birthday'), icon: 'gift' },
    { value: 'nameday', label: t('nameDay'), icon: 'sun' },
    { value: 'other', label: t('other'), icon: 'star' },
  ];

  const sortOptions: Array<{ value: 'date' | 'name' | 'type'; label: string; icon: keyof typeof Feather.glyphMap }> = [
    { value: 'date', label: t('byDate'), icon: 'calendar' },
    { value: 'name', label: t('byName'), icon: 'type' },
    { value: 'type', label: t('byType'), icon: 'grid' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('filterAndSort')}</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={[styles.resetText, { color: colors.primaryAccent }]}>{t('reset')}</Text>
          </TouchableOpacity>
        </View>

        {/* Filter by Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('celebrationType')}</Text>
          <View style={styles.optionsGrid}>
            {typeOptions.map((option) => {
              const isSelected = types.has(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    { backgroundColor: colors.surface, borderColor: colors.surface },
                    isSelected && { backgroundColor: `${colors.primaryAccent}20`, borderColor: colors.primaryAccent, borderWidth: 2 },
                  ]}
                  onPress={() => toggleType(option.value)}
                >
                  <Feather
                    name={option.icon}
                    size={24}
                    color={isSelected ? colors.primaryAccent : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? colors.primaryAccent : colors.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sort by */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('sortBy')}</Text>
          <View style={styles.optionsList}>
            {sortOptions.map((option) => {
              const isSelected = sortBy === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.listOption,
                    { backgroundColor: colors.surface },
                    isSelected && { backgroundColor: `${colors.primaryAccent}15` },
                  ]}
                  onPress={() => setSortBy(option.value)}
                >
                  <Feather
                    name={option.icon}
                    size={20}
                    color={isSelected ? colors.primaryAccent : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.listOptionText,
                      { color: isSelected ? colors.primaryAccent : colors.textPrimary },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && <Feather name="check" size={20} color={colors.primaryAccent} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: colors.primaryAccent }]}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>{t('applyFilters')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    marginTop: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionsList: {
    gap: 12,
  },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  listOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  applyButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});


