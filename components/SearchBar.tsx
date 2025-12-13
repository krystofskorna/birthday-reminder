import { memo, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  onSearch: (query: string) => void;
  onFilterPress: () => void;
}

export const SearchBar = memo(function SearchBar({ onSearch, onFilterPress }: Props) {
  const colors = useThemeColors();
  const t = useTranslation();
  const [query, setQuery] = useState('');

  const handleChange = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.surface, shadowColor: colors.cardShadow },
        ]}
      >
        <Feather name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder={t('searchCelebrations')}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleChange}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.filterButton,
          { backgroundColor: colors.surface, shadowColor: colors.cardShadow },
        ]}
        onPress={onFilterPress}
      >
        <Feather name="sliders" size={20} color={colors.primaryAccent} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.08,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  filterButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.08,
    elevation: 3,
  },
});

