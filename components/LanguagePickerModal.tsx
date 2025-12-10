import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { Language } from '@/types/events';

interface LanguagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLanguage: Language;
  onSelect: (language: Language) => void;
}

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'cs' as const, name: 'Čeština', flag: '🇨🇿', nativeName: 'Čeština' },
];

export function LanguagePickerModal({ visible, onClose, selectedLanguage, onSelect }: LanguagePickerModalProps) {
  const colors = useThemeColors();
  const t = useTranslation();

  const handleSelect = (language: Language) => {
    onSelect(language);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('selectLanguage')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {languages.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? `${colors.primaryAccent}15` : colors.surface,
                      borderColor: isSelected ? colors.primaryAccent : `${colors.textSecondary}20`,
                    },
                  ]}
                  onPress={() => handleSelect(lang.code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionName, { color: colors.textPrimary }]}>
                      {lang.nativeName}
                    </Text>
                    <Text style={[styles.optionEnglish, { color: colors.textSecondary }]}>
                      {lang.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <Feather name="check" size={24} color={colors.primaryAccent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
  },
  flag: {
    fontSize: 32,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionEnglish: {
    fontSize: 14,
  },
});


