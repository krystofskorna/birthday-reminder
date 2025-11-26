import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomTypes } from '@/contexts/CustomTypesContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (typeId: string) => void;
}

const ICONS = [
  'heart',
  'star',
  'gift',
  'music',
  'camera',
  'coffee',
  'book',
  'film',
  'zap',
  'bell',
  'flag',
  'help-circle',
  'smile',
  'sun',
  'moon',
  'home',
  'compass',
  'map',
  'globe',
  'phone',
  'mail',
  'message-circle',
  'users',
  'user',
  'briefcase',
  'shopping-bag',
  'credit-card',
  'dollar-sign',
  'calendar',
  'clock',
  'target',
  'award',
  'box',
  'package',
  'droplet',
  'layers',
  'truck',
  'send',
  'navigation',
  'activity',
] as const;

const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA15E',
  '#BC6C25',
  '#6C5CE7',
  '#A29BFE',
  '#FD79A8',
  '#FDCB6E',
  '#E17055',
  '#00B894',
  '#00CEC9',
  '#0984E3',
];

export function AddCustomTypeModal({ visible, onClose, onSelect }: Props) {
  const colors = useThemeColors();
  const { addCustomType } = useCustomTypes();
  const t = useTranslation();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }
    const customType = addCustomType(name, selectedIcon, selectedColor);
    onSelect(customType.id);
    setName('');
    setSelectedIcon(ICONS[0]);
    setSelectedColor(COLORS[0]);
    onClose();
  };

  const handleClose = () => {
    setName('');
    setSelectedIcon(ICONS[0]);
    setSelectedColor(COLORS[0]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{t('cancel')}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('addCustomType')}</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.doneButton}
            disabled={!name.trim()}
          >
            <Text
              style={[
                styles.doneText,
                { color: name.trim() ? colors.primaryAccent : colors.textSecondary },
              ]}
            >
              {t('add')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('nameRequired')}</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.textPrimary, borderColor: `${colors.primaryAccent}33` },
              ]}
              value={name}
              onChangeText={setName}
              placeholder={t('enterTypeName')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('icon')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor:
                        selectedIcon === icon ? `${selectedColor}33` : colors.background,
                      borderColor: selectedIcon === icon ? selectedColor : `${colors.primaryAccent}33`,
                    },
                  ]}
                >
                  <Feather
                    name={icon as keyof typeof Feather.glyphMap}
                    size={24}
                    color={selectedIcon === icon ? selectedColor : colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('color')}</Text>
            <View style={styles.colorGrid}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderColor: selectedColor === color ? colors.textPrimary : 'transparent',
                      borderWidth: selectedColor === color ? 3 : 0,
                    },
                  ]}
                >
                  {selectedColor === color && (
                    <Feather name="check" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.preview, { backgroundColor: `${selectedColor}22`, borderColor: `${selectedColor}66` }]}>
            <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}33` }]}>
              <Feather
                name={selectedIcon as keyof typeof Feather.glyphMap}
                size={32}
                color={selectedColor}
              />
            </View>
            <Text style={[styles.previewText, { color: colors.textPrimary }]}>
              {name.trim() || t('typeName')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '400',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  iconScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 2,
    gap: 16,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

