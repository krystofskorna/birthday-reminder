import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useChecklistTemplates } from '@/contexts/ChecklistTemplatesContext';
import { usePremium } from '@/contexts/PremiumContext';
import { ChecklistTemplate, Checklist } from '@/types/checklist';

interface ChecklistTemplateSelectorProps {
  onSelect: (checklist: Checklist | undefined) => void;
  currentChecklist?: Checklist;
}

export function ChecklistTemplateSelector({ onSelect, currentChecklist }: ChecklistTemplateSelectorProps) {
  const colors = useThemeColors();
  const t = useTranslation();
  const { templates } = useChecklistTemplates();
  const { canUseChecklists } = usePremium();
  const [showModal, setShowModal] = useState(false);

  if (!canUseChecklists) {
    return (
      <TouchableOpacity
        style={[styles.container, { backgroundColor: `${colors.primaryAccent}10`, borderColor: colors.primaryAccent }]}
        onPress={() => Alert.alert(t('premiumRequired'), t('checklistPremiumDesc'))}
      >
        <Feather name="lock" size={18} color={colors.primaryAccent} />
        <Text style={[styles.text, { color: colors.primaryAccent }]}>
          {t('addChecklistTemplate')} (Premium)
        </Text>
      </TouchableOpacity>
    );
  }

  const handleSelectTemplate = (template: ChecklistTemplate) => {
    // Instantiate template - copy items and set all to incomplete
    const checklist: Checklist = {
      templateId: template.id,
      items: template.items.map((item, index) => ({
        id: item.id || `item_${template.id}_${Date.now()}_${index}`,
        text: item.text,
        completed: false,
      })),
    };
    onSelect(checklist);
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.surface, borderColor: `${colors.primaryAccent}33` }]}
        onPress={() => setShowModal(true)}
      >
        <Feather name="check-square" size={18} color={colors.primaryAccent} />
        <Text style={[styles.text, { color: colors.textPrimary }]}>
          {currentChecklist ? t('changeChecklistTemplate') : t('addChecklistTemplate')}
        </Text>
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t('selectTemplate')}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={templates}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <TouchableOpacity
                style={[styles.templateItem, styles.noChecklistItem, { backgroundColor: colors.surface }]}
                onPress={() => {
                  onSelect(undefined);
                  setShowModal(false);
                }}
              >
                <View style={styles.templateItemLeft}>
                  <Feather name="x-circle" size={20} color={colors.textSecondary} />
                  <Text style={[styles.templateItemName, { color: colors.textPrimary }]}>
                    {t('noChecklist') || 'Bez kontrolního seznamu'}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="file-text" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('noTemplates')}
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  {t('createTemplateInSettings')}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.templateItem, { backgroundColor: colors.surface }]}
                onPress={() => handleSelectTemplate(item)}
              >
                <View style={styles.templateItemLeft}>
                  <Feather name="file-text" size={20} color={colors.primaryAccent} />
                  <View style={styles.templateItemText}>
                    <Text style={[styles.templateItemName, { color: colors.textPrimary }]}>
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text style={[styles.templateItemDesc, { color: colors.textSecondary }]}>
                        {item.description}
                      </Text>
                    )}
                    <Text style={[styles.templateItemCount, { color: colors.textSecondary }]}>
                      {item.items.length} {t('items')}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  templateItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  templateItemText: {
    flex: 1,
  },
  templateItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateItemDesc: {
    fontSize: 14,
    marginBottom: 2,
  },
  templateItemCount: {
    fontSize: 12,
  },
  noChecklistItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 8,
  },
});

