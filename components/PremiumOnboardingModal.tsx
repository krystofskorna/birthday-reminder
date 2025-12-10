import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/contexts/SettingsContext';
import { usePremium } from '@/contexts/PremiumContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const PREMIUM_ONBOARDING_KEY = '@birthday_reminder:premium_onboarding_shown';

interface PremiumOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PremiumOnboardingModal({ visible, onClose }: PremiumOnboardingModalProps) {
  const colors = useThemeColors();
  const t = useTranslation();
  const { setIsPremium } = useSettings();
  const { isPremium } = usePremium();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleUpgrade = async (type: 'monthly' | 'yearly') => {
    try {
      // Dynamically import purchases module
      const purchasesModule = await import('@/services/purchases');
      const { initializePurchases, purchaseSubscription } = purchasesModule;
      
      // Initialize purchases if not already done
      const initialized = await initializePurchases();
      if (!initialized) {
        Alert.alert(
          t('error'),
          Platform.OS === 'ios' 
            ? t('purchasesNotAvailable')
            : 'In-app purchases are only available on iOS'
        );
        return;
      }

      // Purchase the subscription
      const result = await purchaseSubscription(type);
      
      if (result.success) {
        // Enable premium after successful purchase
        setIsPremium(true);
        Alert.alert(t('success'), t('purchaseSuccessful'));
        onClose();
      } else {
        Alert.alert(t('error'), result.error || t('purchaseFailed'));
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert(t('error'), error.message || t('purchaseFailed'));
    }
  };

  const benefits = [
    { 
      icon: 'zap', 
      title: t('adFreeExperience'),
      description: t('adFreeExperienceDesc'),
      emoji: '✨'
    },
    { 
      icon: 'bell', 
      title: t('advancedNotificationControl'),
      description: t('advancedNotificationControlDesc'),
      emoji: '🔔'
    },
    { 
      icon: 'palette', 
      title: t('allThemesUnlocked'),
      description: t('allThemesUnlockedDesc'),
      emoji: '🎨'
    },
    { 
      icon: 'cloud', 
      title: t('iCloudSyncAndBackup'),
      description: t('iCloudSyncAndBackupDesc'),
      emoji: '☁️'
    },
    { 
      icon: 'check-square', 
      title: t('celebrationChecklists'),
      description: t('celebrationChecklistsDesc'),
      emoji: '✅'
    },
    { 
      icon: 'phone', 
      title: t('oneTapCallSmsWhatsapp'),
      description: t('oneTapCallSmsWhatsappDesc'),
      emoji: '📞'
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={[`${colors.primaryAccent}20`, `${colors.primaryAccent}05`]}
              style={styles.heroGradient}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primaryAccent}25` }]}>
                <Text style={styles.heroEmoji}>⭐</Text>
              </View>
              <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
                {t('unlockPremium')}
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                {t('unlockPremiumDesc')}
              </Text>
            </LinearGradient>
          </View>

          {/* Why Buy Section */}
          <View style={styles.whyBuySection}>
            <Text style={[styles.whyBuyTitle, { color: colors.textPrimary }]}>
              {t('whyUpgrade') || 'Why Upgrade to Premium?'}
            </Text>
            <Text style={[styles.whyBuyDescription, { color: colors.textSecondary }]}>
              {t('whyUpgradeDesc') || 'Never miss an important celebration again. Get advanced features, ad-free experience, and more control over your reminders.'}
            </Text>
          </View>

          {/* Pricing Section - Moved before benefits */}
          <View style={styles.pricingSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('chooseYourPlan')}
            </Text>
            
            {/* Yearly Plan - Highlighted */}
            <TouchableOpacity
              style={[styles.planCard, styles.planCardFeatured, { 
                backgroundColor: colors.surface, 
                borderColor: colors.primaryAccent,
                shadowColor: colors.cardShadow
              }]}
              onPress={() => handleUpgrade('yearly')}
              activeOpacity={0.8}
            >
              <View style={styles.planBadgeContainer}>
                <View style={[styles.planBadge, { backgroundColor: colors.primaryAccent }]}>
                  <Text style={styles.planBadgeText}>{t('bestValue')}</Text>
                </View>
              </View>
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: colors.textPrimary }]}>
                  {t('yearlyPlan')}
                </Text>
                <View style={styles.planPriceContainer}>
                  <Text style={[styles.planPrice, { color: colors.primaryAccent }]}>
                    $19.99
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>
                    /{t('year')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.planSavings, { color: colors.primaryAccent }]}>
                {t('save')} 44% • {t('just')} $1.67/{t('month')}
              </Text>
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: colors.primaryAccent }]}
                onPress={() => handleUpgrade('yearly')}
              >
                {Platform.OS === 'ios' && (
                  <Feather name="apple" size={20} color="#FFFFFF" style={styles.appleIcon} />
                )}
                <Text style={styles.upgradeButtonText}>
                  {Platform.OS === 'ios' ? t('subscribeWithApplePay') : t('subscribe')}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Monthly Plan */}
            <TouchableOpacity
              style={[styles.planCard, { 
                backgroundColor: colors.surface, 
                borderColor: `${colors.textSecondary}20`,
                shadowColor: colors.cardShadow
              }]}
              onPress={() => handleUpgrade('monthly')}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: colors.textPrimary }]}>
                  {t('monthlyPlan')}
                </Text>
                <View style={styles.planPriceContainer}>
                  <Text style={[styles.planPrice, { color: colors.textPrimary }]}>
                    $2.99
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>
                    /{t('month')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.upgradeButton, styles.upgradeButtonSecondary, { 
                  backgroundColor: 'transparent',
                  borderColor: colors.primaryAccent,
                  borderWidth: 2
                }]}
                onPress={() => handleUpgrade('monthly')}
              >
                <Text style={[styles.upgradeButtonText, { color: colors.primaryAccent }]}>
                  {t('subscribe')}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Benefits Section - Moved after pricing */}
          <View style={styles.benefitsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('everythingYouGet')}
            </Text>
            {benefits.map((benefit, index) => (
              <View key={index} style={[styles.benefitCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
                <View style={[styles.benefitIconContainer, { backgroundColor: `${colors.primaryAccent}15` }]}>
                  <Text style={styles.benefitEmoji}>{benefit.emoji}</Text>
                </View>
                <View style={styles.benefitContent}>
                  <Text style={[styles.benefitTitle, { color: colors.textPrimary }]}>
                    {benefit.title}
                  </Text>
                  <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                    {benefit.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Trust Section */}
          <View style={styles.trustSection}>
            <View style={styles.trustRow}>
              <Feather name="shield" size={20} color={colors.primaryAccent} />
              <Text style={[styles.trustText, { color: colors.textSecondary }]}>
                {t('cancelAnytime')}
              </Text>
            </View>
            <View style={styles.trustRow}>
              <Feather name="lock" size={20} color={colors.primaryAccent} />
              <Text style={[styles.trustText, { color: colors.textSecondary }]}>
                {t('securePayment')}
              </Text>
            </View>
            <View style={styles.trustRow}>
              <Feather name="refresh-cw" size={20} color={colors.primaryAccent} />
              <Text style={[styles.trustText, { color: colors.textSecondary }]}>
                {t('restorePurchases')}
              </Text>
            </View>
          </View>

          <View style={styles.skipButtonContainer}>
            <TouchableOpacity 
              onPress={onClose} 
              style={[styles.skipButton, { backgroundColor: `${colors.primaryAccent}15`, borderColor: colors.primaryAccent }]}
            >
              <Text style={[styles.skipButtonText, { color: colors.primaryAccent }]}>
                {t('maybeLater')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export async function shouldShowPremiumOnboarding(): Promise<boolean> {
  try {
    const shown = await AsyncStorage.getItem(PREMIUM_ONBOARDING_KEY);
    return !shown;
  } catch {
    return true;
  }
}

export async function markPremiumOnboardingShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(PREMIUM_ONBOARDING_KEY, 'true');
  } catch {
    // Ignore errors
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroEmoji: {
    fontSize: 50,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitCard: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitEmoji: {
    fontSize: 28,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  pricingSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  planCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  planCardFeatured: {
    borderWidth: 3,
    transform: [{ scale: 1.02 }],
  },
  planBadgeContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 22,
    fontWeight: '800',
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  planSavings: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  upgradeButtonSecondary: {
    paddingVertical: 14,
  },
  appleIcon: {
    marginRight: 4,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  trustSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  trustText: {
    fontSize: 14,
    fontWeight: '500',
  },
  whyBuySection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  whyBuyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  whyBuyDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  skipButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
