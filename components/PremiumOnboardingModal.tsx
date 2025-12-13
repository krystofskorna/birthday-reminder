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
  const { setIsPremium, settings } = useSettings();
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

  const handleUpgrade = async (type: 'weekly' | 'yearly' | 'lifetime') => {
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
              {t('unlockPremium')}
            </Text>
          </View>

          {/* Benefits List */}
          <View style={styles.benefitsSection}>
            <Text style={[styles.benefitsTitle, { color: colors.textPrimary }]}>
              {t('everythingYouGet')}
            </Text>
            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <View key={index} style={[styles.benefitRow, { backgroundColor: colors.surface }]}>
                  <View style={[styles.benefitIconCircle, { backgroundColor: `${colors.primaryAccent}15` }]}>
                    <Text style={styles.benefitEmoji}>{benefit.emoji}</Text>
                  </View>
                  <View style={styles.benefitTextContainer}>
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
          </View>

          {/* Choose Your Plan Header */}
          <View style={styles.choosePlanSection}>
            <Text style={[styles.choosePlanTitle, { color: colors.textPrimary }]}>
              {t('chooseYourPlan')}
            </Text>
          </View>

          {/* Pricing Plans */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pricingSection}
            style={styles.pricingScrollView}
          >
            {/* Yearly Plan - Featured */}
            <TouchableOpacity
              style={[styles.planCard, styles.planCardFeatured, { 
                backgroundColor: colors.surface, 
                borderColor: colors.primaryAccent,
                shadowColor: colors.cardShadow
              }]}
              onPress={() => handleUpgrade('yearly')}
              activeOpacity={0.7}
            >
              <View style={styles.planBadgeContainer}>
                <View style={[styles.planBadge, { backgroundColor: colors.primaryAccent }]}>
                  <Text style={styles.planBadgeText}>{t('popular')}</Text>
                </View>
              </View>
              <View style={styles.planContent}>
                <Text style={[styles.planName, { color: colors.textPrimary }]}>
                  {t('yearlyPlan')}
                </Text>
                <View style={styles.planPriceRow}>
                  <Text style={[styles.planPrice, { color: colors.primaryAccent }]}>
                    {settings.language === 'cs' ? '349 Kč' : '$14.99'}
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>
                    /{t('year')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.upgradeButton, { backgroundColor: colors.primaryAccent }]}
                  onPress={() => handleUpgrade('yearly')}
                  activeOpacity={0.8}
                >
                  {Platform.OS === 'ios' && (
                    <Text style={styles.appleLogo}></Text>
                  )}
                  <Text style={styles.upgradeButtonText}>
                    {settings.language === 'cs' ? 'Odebírat' : 'Subscribe'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Weekly Plan */}
            <TouchableOpacity
              style={[styles.planCard, { 
                backgroundColor: colors.surface, 
                borderColor: `${colors.textSecondary}15`,
                shadowColor: colors.cardShadow
              }]}
              onPress={() => handleUpgrade('weekly')}
              activeOpacity={0.7}
            >
              <View style={styles.planBadgeContainer}>
                {/* Empty space for symmetry */}
              </View>
              <View style={styles.planContent}>
                <Text style={[styles.planName, { color: colors.textPrimary }]}>
                  {settings.language === 'cs' ? 'Týdenní' : 'Weekly'}
                </Text>
                <View style={styles.planPriceRow}>
                  <Text style={[styles.planPrice, { color: colors.textPrimary }]}>
                    {settings.language === 'cs' ? '29 Kč' : '$0.99'}
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.textPrimary }]}>
                    /{settings.language === 'cs' ? 'týden' : 'week'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.upgradeButton, styles.upgradeButtonSecondary, { 
                    backgroundColor: 'transparent',
                    borderColor: colors.primaryAccent,
                    borderWidth: 1.5
                  }]}
                  onPress={() => handleUpgrade('weekly')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.upgradeButtonTextSecondary, { color: colors.primaryAccent }]}>
                    {settings.language === 'cs' ? 'Odebírat' : 'Subscribe'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Divider with text */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.textSecondary }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              {settings.language === 'cs' ? 'Nebo' : 'Or'}
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.textSecondary }]} />
          </View>

          {/* Lifetime Plan - Best Value */}
          <View style={styles.lifetimeSection}>
            <TouchableOpacity
              style={[styles.lifetimeCard, { 
                backgroundColor: colors.surface, 
                borderColor: '#FFD700',
                shadowColor: colors.cardShadow
              }]}
              onPress={() => handleUpgrade('lifetime')}
              activeOpacity={0.7}
            >
              <View style={styles.lifetimeBadgeContainer}>
                <View style={[styles.lifetimeBadge, { backgroundColor: '#FFD700' }]}>
                  <Feather name="star" size={12} color="#000" />
                  <Text style={styles.lifetimeBadgeText}>{t('bestValue')}</Text>
                </View>
              </View>
              <View style={styles.lifetimeContent}>
                <Text style={[styles.lifetimeName, { color: colors.textPrimary }]}>
                  🏆 {t('lifetimePlan')}
                </Text>
                <Text style={[styles.lifetimeSubtitle, { color: colors.textSecondary }]}>
                  {t('oneTimePurchase')}
                </Text>
                <View style={styles.lifetimePriceRow}>
                  <Text style={[styles.lifetimePrice, { color: '#FFD700' }]}>
                    {settings.language === 'cs' ? '999 Kč' : '$39.99'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.lifetimeButton, { backgroundColor: '#FFD700' }]}
                  onPress={() => handleUpgrade('lifetime')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.lifetimeButtonText}>
                    {settings.language === 'cs' ? 'Koupit jednou navždy' : 'Buy Once, Own Forever'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustSection}>
            <View style={[styles.trustBadge, { backgroundColor: colors.surface }]}>
              <Feather name="shield" size={20} color={colors.primaryAccent} />
              <Text style={[styles.trustText, { color: colors.textPrimary }]}>
                {t('cancelAnytime')}
              </Text>
            </View>
            <View style={[styles.trustBadge, { backgroundColor: colors.surface }]}>
              <Feather name="lock" size={20} color={colors.primaryAccent} />
              <Text style={[styles.trustText, { color: colors.textPrimary }]}>
                {t('securePayment')}
              </Text>
            </View>
          </View>

          {/* Skip Button */}
          <View style={styles.skipButtonContainer}>
            <TouchableOpacity 
              onPress={onClose} 
              style={[styles.skipButton, { backgroundColor: colors.primaryAccent }]}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.7,
  },
  choosePlanSection: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 20,
  },
  choosePlanTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  pricingScrollView: {
    marginBottom: 40,
  },
  pricingSection: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    width: 280,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  planCardFeatured: {
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  planBadgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  planContent: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  planName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  planPeriod: {
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 6,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonSecondary: {
    paddingVertical: 14,
  },
  appleLogo: {
    color: '#FFFFFF',
    fontSize: 18,
    marginRight: 4,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  upgradeButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  lifetimeSection: {
    paddingHorizontal: 20,
    marginBottom: 36,
  },
  lifetimeCard: {
    borderRadius: 24,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    shadowOpacity: 0.25,
    elevation: 10,
  },
  lifetimeBadgeContainer: {
    position: 'absolute',
    top: -12,
    right: 20,
    zIndex: 1,
  },
  lifetimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  lifetimeBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lifetimeContent: {
    padding: 28,
    alignItems: 'center',
  },
  lifetimeName: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  lifetimeSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  lifetimePriceRow: {
    marginBottom: 24,
  },
  lifetimePrice: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  lifetimeButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  lifetimeButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 36,
  },
  benefitsTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  benefitsList: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  benefitIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  benefitEmoji: {
    fontSize: 28,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 20,
  },
  benefitDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  trustSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
    alignItems: 'center',
    gap: 12,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    width: '100%',
    maxWidth: 320,
  },
  trustText: {
    fontSize: 15,
    fontWeight: '600',
  },
  skipButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  skipButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
