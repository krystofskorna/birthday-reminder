import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { usePremium } from '@/contexts/PremiumContext';
import { makeCall, sendSMS } from '@/services/actions';

interface ActionButtonsProps {
  phoneNumber?: string;
  personName?: string;
}

export function ActionButtons({ phoneNumber, personName }: ActionButtonsProps) {
  const colors = useThemeColors();
  const t = useTranslation();
  const { canUseOneTapActions, isPremium } = usePremium();

  if (!canUseOneTapActions) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Feather name="phone" size={20} color={colors.textPrimary} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('quickActions')}</Text>
          <View style={[styles.premiumBadge, { backgroundColor: `${colors.primaryAccent}15` }]}>
            <Feather name="lock" size={12} color={colors.primaryAccent} />
            <Text style={[styles.premiumBadgeText, { color: colors.primaryAccent }]}>Premium</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.upgradeButton, { backgroundColor: `${colors.primaryAccent}10`, borderColor: colors.primaryAccent }]}
          onPress={() => Alert.alert(t('premiumRequired'), t('oneTapActionsPremiumDesc'))}
        >
          <Text style={[styles.upgradeButtonText, { color: colors.primaryAccent }]}>
            {t('upgradeToPremium')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!phoneNumber) {
    return null; // Don't show if no phone number
  }

  const handleCall = () => makeCall(phoneNumber);
  const handleSMS = () => sendSMS(phoneNumber, personName ? `Hi ${personName}! ` : '');

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Feather name="phone" size={20} color={colors.textPrimary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('quickActions')}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: `${colors.primaryAccent}15` }]}
          onPress={handleCall}
        >
          <Feather name="phone" size={20} color={colors.primaryAccent} />
          <Text style={[styles.actionButtonText, { color: colors.primaryAccent }]}>{t('call')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: `${colors.primaryAccent}15` }]}
          onPress={handleSMS}
        >
          <Feather name="message-circle" size={20} color={colors.primaryAccent} />
          <Text style={[styles.actionButtonText, { color: colors.primaryAccent }]}>{t('sms')}</Text>
        </TouchableOpacity>
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
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

