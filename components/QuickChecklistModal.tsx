import { memo, useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { Checklist, ChecklistItem } from '@/types/checklist';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (checklist: Checklist) => void;
  initialChecklist?: Checklist;
  personName: string;
}

export const QuickChecklistModal = memo(function QuickChecklistModal({
  visible,
  onClose,
  onSave,
  initialChecklist,
  personName,
}: Props) {
  const colors = useThemeColors();
  const t = useTranslation();
  const [items, setItems] = useState<ChecklistItem[]>(initialChecklist?.items || []);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    if (visible) {
      setItems(initialChecklist?.items || []);
      setNewItemText('');
    }
  }, [visible, initialChecklist]);

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false,
    };
    
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const handleToggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      t('delete'),
      t('deleteItemConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => setItems(items.filter(item => item.id !== id)),
        },
      ]
    );
  };

  const handleSave = () => {
    const checklist: Checklist = {
      items,
      templateId: initialChecklist?.templateId,
    };
    
    onSave(checklist);
    onClose();
  };

  const handleClear = () => {
    Alert.alert(
      t('clear'),
      t('clearChecklistConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: () => {
            onSave({ items: [] });
            setItems([]);
            onClose();
          },
        },
      ]
    );
  };

  const completedCount = items.filter(item => item.completed).length;
  const hasItems = items.length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: `${colors.primaryAccent}15` }]}>
              <Feather name="check-square" size={20} color={colors.primaryAccent} />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('checklist')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {personName}
            </Text>
          </View>
          {hasItems && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Feather name="trash-2" size={18} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        {hasItems && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { backgroundColor: `${colors.primaryAccent}20` }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primaryAccent,
                      width: `${(completedCount / items.length) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {completedCount} / {items.length} {t('completed')}
            </Text>
          </View>
        )}

        {/* Items List */}
        <ScrollView 
          style={styles.listContainer} 
          contentContainerStyle={[
            styles.listContent,
            !hasItems && styles.emptyListContent
          ]}
          showsVerticalScrollIndicator={false}
        >
          {hasItems ? (
            items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: item.completed ? `${colors.primaryAccent}40` : `${colors.textSecondary}15`,
                    shadowColor: colors.cardShadow
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { 
                      borderColor: colors.primaryAccent,
                      backgroundColor: item.completed ? colors.primaryAccent : 'transparent',
                    },
                  ]}
                  onPress={() => handleToggleItem(item.id)}
                  activeOpacity={0.7}
                >
                  {item.completed && <Feather name="check" size={14} color="#FFFFFF" />}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.itemText,
                    { color: colors.textPrimary },
                    item.completed && { 
                      textDecorationLine: 'line-through', 
                      color: colors.textSecondary,
                      opacity: 0.6,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.text}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteItem(item.id)}
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: `${colors.primaryAccent}15` }]}>
                <Feather name="check-square" size={32} color={colors.primaryAccent} />
              </View>
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                {t('noChecklistItems')}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {t('addItemsBelow')}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Add Item Input - Always visible */}
        <View style={[styles.inputSection, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder={t('addItem')}
              placeholderTextColor={colors.textSecondary}
              value={newItemText}
              onChangeText={setNewItemText}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                { 
                  backgroundColor: colors.primaryAccent,
                  opacity: newItemText.trim() ? 1 : 0.5,
                },
              ]}
              onPress={handleAddItem}
              disabled={!newItemText.trim()}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        {hasItems && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primaryAccent }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.08,
    elevation: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
