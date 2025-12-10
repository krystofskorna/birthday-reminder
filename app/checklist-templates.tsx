import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useChecklistTemplates } from '@/contexts/ChecklistTemplatesContext';
import { usePremium } from '@/contexts/PremiumContext';
import { ChecklistTemplate } from '@/types/checklist';

export default function ChecklistTemplatesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const t = useTranslation();
  const { templates, addTemplate, updateTemplate, removeTemplate } = useChecklistTemplates();
  const { canUseChecklists } = usePremium();
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [newItems, setNewItems] = useState<{ text: string }[]>([]);

  if (!canUseChecklists) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('checklistTemplates')}</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.premiumRequired}>
          <Feather name="lock" size={48} color={colors.primaryAccent} />
          <Text style={[styles.premiumRequiredTitle, { color: colors.textPrimary }]}>
            {t('premiumRequired')}
          </Text>
          <Text style={[styles.premiumRequiredText, { color: colors.textSecondary }]}>
            {t('checklistPremiumDesc')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddItem = () => {
    if (newItemText.trim()) {
      setNewItems([...newItems, { text: newItemText.trim() }]);
      setNewItemText('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      Alert.alert(t('validationError'), t('pleaseEnterTemplateName'));
      return;
    }
    if (newItems.length === 0) {
      Alert.alert(t('validationError'), t('pleaseAddAtLeastOneItem'));
      return;
    }

    addTemplate(newTemplateName.trim(), newItems.map(item => ({ text: item.text })));

    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewItems([]);
    Alert.alert(t('success'), t('templateCreated'));
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    Alert.alert(
      t('deleteTemplate'),
      t('deleteTemplateConfirm', name),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => removeTemplate(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('checklistTemplates')}</Text>
          <View style={styles.iconButton} />
        </View>

        {/* Create New Template */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('createNewTemplate')}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: `${colors.primaryAccent}33` }]}
            value={newTemplateName}
            onChangeText={setNewTemplateName}
            placeholder={t('templateName')}
            placeholderTextColor={colors.textSecondary}
          />
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: `${colors.primaryAccent}33` }]}
            value={newTemplateDescription}
            onChangeText={setNewTemplateDescription}
            placeholder={t('templateDescription')}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={2}
          />
          <View style={styles.itemsSection}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('templateItems')}</Text>
            {newItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={[styles.itemText, { color: colors.textPrimary }]}>{item.text}</Text>
                <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                  <Feather name="x" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addItemRow}>
              <TextInput
                style={[styles.input, styles.itemInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: `${colors.primaryAccent}33` }]}
                value={newItemText}
                onChangeText={setNewItemText}
                placeholder={t('addItem')}
                placeholderTextColor={colors.textSecondary}
                onSubmitEditing={handleAddItem}
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primaryAccent }]}
                onPress={handleAddItem}
              >
                <Feather name="plus" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primaryAccent }]}
            onPress={handleSaveTemplate}
          >
            <Text style={styles.saveButtonText}>{t('createTemplate')}</Text>
          </TouchableOpacity>
        </View>

        {/* Existing Templates */}
        <View style={styles.templatesSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('existingTemplates')}
          </Text>
          {templates.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('noTemplates')}
            </Text>
          ) : (
            templates.map((template) => (
              <View key={template.id} style={[styles.templateCard, { backgroundColor: colors.surface }]}>
                <View style={styles.templateHeader}>
                  <View>
                    <Text style={[styles.templateName, { color: colors.textPrimary }]}>
                      {template.name}
                    </Text>
                    {template.description && (
                      <Text style={[styles.templateDescription, { color: colors.textSecondary }]}>
                        {template.description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteTemplate(template.id, template.name)}
                  >
                    <Feather name="trash-2" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
                <View style={styles.templateItems}>
                  {template.items.map((item, index) => (
                    <View key={item.id} style={styles.templateItemRow}>
                      <Text style={[styles.templateItemText, { color: colors.textSecondary }]}>
                        {index + 1}. {item.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
    width: 42,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  premiumRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  premiumRequiredTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  premiumRequiredText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemsSection: {
    marginTop: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
  },
  addItemRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  itemInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  templatesSection: {
    marginTop: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 40,
  },
  templateCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700',
  },
  templateDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  templateItems: {
    gap: 6,
  },
  templateItemRow: {
    paddingVertical: 4,
  },
  templateItemText: {
    fontSize: 14,
  },
});

