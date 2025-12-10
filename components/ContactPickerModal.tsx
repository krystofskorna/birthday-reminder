import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { getAllContacts, contactToContactData, findExistingPerson, ContactData } from '@/services/contacts';
import { Person } from '@/types/events';
import { usePeople } from '@/contexts/PeopleContext';
import { useRouter } from 'expo-router';

interface ContactPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (contactData: ContactData) => void;
}

export function ContactPickerModal({ visible, onClose, onSelect }: ContactPickerModalProps) {
  const colors = useThemeColors();
  const t = useTranslation();
  const { people } = usePeople();
  const router = useRouter();
  const [contacts, setContacts] = useState<Awaited<ReturnType<typeof getAllContacts>>>([]);
  const [filteredContacts, setFilteredContacts] = useState<Awaited<ReturnType<typeof getAllContacts>>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadContacts();
    } else {
      setSearchQuery('');
      setContacts([]);
      setFilteredContacts([]);
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = contacts.filter((contact) => {
        const name = (contact.name || '').toLowerCase();
        const phone = (contact.phoneNumbers?.[0]?.number || '').toLowerCase();
        return name.includes(query) || phone.includes(query);
      });
      // Keep alphabetical order even when filtered
      const sorted = [...filtered].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setFilteredContacts(sorted);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const allContacts = await getAllContacts();
      // Sort contacts alphabetically by name
      const sortedContacts = [...allContacts].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setContacts(sortedContacts);
      setFilteredContacts(sortedContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      Alert.alert(t('error'), t('failedToLoadContacts'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contact: Awaited<ReturnType<typeof getAllContacts>>[number]) => {
    const contactData = contactToContactData(contact);
    const existingPerson = findExistingPerson(contactData, people);

    if (existingPerson) {
      // Person already exists, open edit screen
      Alert.alert(
        t('contactAlreadyExists'),
        t('contactAlreadyExistsDesc'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('edit'),
            onPress: () => {
              onClose();
              router.push(`/edit/${existingPerson.id}`);
            },
          },
        ]
      );
    } else {
      // New person, pass data to form
      onSelect(contactData);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('importFromContacts')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={t('searchContacts')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryAccent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t('loadingContacts')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const contactData = contactToContactData(item);
              return (
                <TouchableOpacity
                  style={[styles.contactItem, { backgroundColor: colors.surface }]}
                  onPress={() => handleSelectContact(item)}
                >
                  <View style={[styles.avatar, { backgroundColor: `${colors.primaryAccent}20` }]}>
                    <Text style={[styles.avatarText, { color: colors.primaryAccent }]}>
                      {contactData.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: colors.textPrimary }]}>
                      {contactData.name}
                    </Text>
                    {contactData.phoneNumber && (
                      <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>
                        {contactData.phoneNumber}
                      </Text>
                    )}
                    {contactData.birthday && (
                      <Text style={[styles.contactBirthday, { color: colors.primaryAccent }]}>
                        🎂 {contactData.birthday}
                      </Text>
                    )}
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="users" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {searchQuery ? t('noContactsFound') : t('noContacts')}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  contactInfo: {
    flex: 1,
    gap: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
  },
  contactBirthday: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

