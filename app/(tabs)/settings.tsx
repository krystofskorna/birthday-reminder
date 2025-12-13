import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/contexts/SettingsContext';
import { usePeople } from '@/contexts/PeopleContext';
import { useCustomTypes } from '@/contexts/CustomTypesContext';
import { usePremium } from '@/contexts/PremiumContext';
import { themes, themeNames, ThemeName } from '@/lib/themes';
import { useRouter } from 'expo-router';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { PremiumOnboardingModal } from '@/components/PremiumOnboardingModal';

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const t = useTranslation();
  const {
    settings,
    setBirthdayRemindersEnabled,
    setNameDayRemindersEnabled,
    setLanguage,
    setTheme,
    setIcloudSyncEnabled,
    setIsPremium,
  } = useSettings();
  const { people, removePerson } = usePeople();
  const { customTypes } = useCustomTypes();
  const { canUseAllThemes, isPremium, canUseChecklists } = usePremium();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'cs' as const, name: 'Čeština', flag: '🇨🇿' },
  ];

  const selectedLanguage = languages.find((lang) => lang.code === settings.language) || languages[0];

  const handleExportData = async () => {
    try {
      const data = {
        people,
        customTypes,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      const jsonString = JSON.stringify(data, null, 2);
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `birthday-reminder-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert(t('exportSuccess'), t('exportSuccessDesc'));
      } else {
        // For mobile, use Share API
        try {
          await Share.share({
            message: jsonString,
            title: t('exportData'),
          });
        } catch (shareError) {
          // User cancelled or error occurred
        }
      }
    } catch (error) {
      Alert.alert(t('exportError'), t('exportErrorDesc'));
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      t('clearAllData'),
      t('clearAllDataWarning'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: () => {
            people.forEach((person) => removePerson(person.id));
            Alert.alert(t('dataCleared'), t('dataClearedDesc'));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={[styles.headerIconContainer, { backgroundColor: `${colors.primaryAccent}15` }]}>
            <Feather name="settings" size={28} color={colors.primaryAccent} />
          </View>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>{t('settings')}</Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('notifications')} icon="bell" colors={colors} />
          <SettingRow
            label={t('birthdayReminders')}
            description={t('birthdayRemindersDesc')}
            value={settings.birthdayRemindersEnabled}
            onValueChange={setBirthdayRemindersEnabled}
            icon="gift"
            colors={colors}
          />
          <SettingRow
            label={t('nameDayReminders')}
            description={t('nameDayRemindersDesc')}
            value={settings.nameDayRemindersEnabled}
            onValueChange={setNameDayRemindersEnabled}
            icon="calendar"
            colors={colors}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('language')} icon="globe" colors={colors} />
          <TouchableOpacity
            style={[styles.languageSelector, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}
            onPress={() => setShowLanguagePicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.languageSelectorLeft}>
              <Text style={styles.languageFlag}>{selectedLanguage.flag}</Text>
              <View style={styles.languageSelectorText}>
                <Text style={[styles.languageSelectorName, { color: colors.textPrimary }]}>
                  {selectedLanguage.name}
                </Text>
                <Text style={[styles.languageSelectorSubtext, { color: colors.textSecondary }]}>
                  {settings.language === 'cs' ? t('tapToChange') : 'Tap to change language'}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('theme')} icon="palette" colors={colors} />
          {!canUseAllThemes && (
            <View style={[styles.premiumBanner, { backgroundColor: `${colors.primaryAccent}15`, borderColor: colors.primaryAccent }]}>
              <Feather name="lock" size={16} color={colors.primaryAccent} />
              <Text style={[styles.premiumBannerText, { color: colors.primaryAccent }]}>
                {t('premiumThemes')}
              </Text>
            </View>
          )}
          <View style={styles.themeGrid}>
            {(Object.keys(themes) as ThemeName[]).map((themeKey) => {
              const isSelected = settings.theme === themeKey;
              const theme = themes[themeKey];
              const themeInfo = themeNames[themeKey];
              const themeLabel = settings.language === 'cs' ? themeInfo.cs : themeInfo.en;
              const isLocked = !canUseAllThemes && themeKey !== 'blue' && themeKey !== 'purple';
              
              return (
                <TouchableOpacity
                  key={themeKey}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: isSelected ? `${colors.primaryAccent}17` : colors.surface,
                      borderColor: isSelected ? colors.primaryAccent : `${colors.textSecondary}33`,
                      opacity: isLocked ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => {
                    if (isLocked) {
                      Alert.alert(t('premiumRequired'), t('premiumThemesDesc'));
                    } else {
                      setTheme(themeKey);
                    }
                  }}
                  activeOpacity={0.7}
                  disabled={isLocked}
                >
                  <View style={styles.themePreview}>
                    <View style={[styles.themeColorDot, { backgroundColor: theme.primaryAccent }]} />
                    <View style={[styles.themeColorDot, { backgroundColor: theme.namedayAccent }]} />
                    <View style={[styles.themeColorDot, { backgroundColor: theme.otherAccent }]} />
                  </View>
                  <Text style={styles.themeEmoji}>{themeInfo.icon}</Text>
                  <Text style={[styles.themeName, { color: isSelected ? colors.primaryAccent : colors.textPrimary }]}>
                    {themeLabel}
                  </Text>
                  {isLocked && (
                    <View style={[styles.lockIcon, { backgroundColor: colors.textSecondary }]}>
                      <Feather name="lock" size={10} color="#FFFFFF" />
                    </View>
                  )}
                  {isSelected && !isLocked && (
                    <View style={[styles.themeCheck, { backgroundColor: colors.primaryAccent }]}>
                      <Feather name="check" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Premium Section - Simplified */}
        {isPremium && (
          <View style={styles.section}>
            <SectionHeader title="Premium" icon="star" colors={colors} />
            <View style={[styles.premiumActiveCard, { backgroundColor: `${colors.primaryAccent}15`, borderColor: colors.primaryAccent }]}>
              <Feather name="check-circle" size={24} color={colors.primaryAccent} />
              <Text style={[styles.premiumActiveText, { color: colors.primaryAccent }]}>
                {settings.language === 'cs' ? 'Premium aktivní' : 'Premium Active'}
              </Text>
            </View>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.actionRow, { backgroundColor: colors.surface }]}
                onPress={async () => {
                  try {
                    const purchasesModule = await import('@/services/purchases');
                    const { restorePurchases } = purchasesModule;
                    const restored = await restorePurchases();
                    if (restored) {
                      setIsPremium(true);
                      Alert.alert(t('success'), t('purchasesRestored'));
                    } else {
                      Alert.alert(t('noPurchases'), t('noPurchasesFound'));
                    }
                  } catch (error: any) {
                    Alert.alert(t('error'), error.message || t('restoreFailed'));
                  }
                }}
              >
                <View style={styles.actionRowLeft}>
                  <Feather name="refresh-cw" size={20} color={colors.primaryAccent} />
                  <View style={styles.actionRowText}>
                    <Text style={[styles.actionRowLabel, { color: colors.textPrimary }]}>
                      {t('restorePurchases')}
                    </Text>
                    <Text style={[styles.actionRowDescription, { color: colors.textSecondary }]}>
                      {t('restorePurchasesDesc')}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title={t('dataManagement')} icon="database" colors={colors} />
          <View style={[styles.settingCard, styles.row, { backgroundColor: colors.surface, shadowColor: colors.cardShadow, opacity: !isPremium ? 0.5 : 1 }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primaryAccent}15` }]}>
                <Feather name="cloud" size={18} color={colors.primaryAccent} />
              </View>
              <View style={styles.rowText}>
                <View style={styles.rowTitleContainer}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>iCloud Sync</Text>
                  {!isPremium && (
                    <View style={[styles.premiumBadgeInline, { backgroundColor: `${colors.primaryAccent}15` }]}>
                      <Feather name="star" size={10} color={colors.primaryAccent} />
                      <Text style={[styles.premiumBadgeTextInline, { color: colors.primaryAccent }]}>Premium</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                  {isPremium ? "Sync your data across all your devices using iCloud" : "Premium feature - Upgrade to enable"}
                </Text>
              </View>
            </View>
            <Switch 
              value={settings.icloudSyncEnabled} 
              onValueChange={(value) => {
                if (!isPremium && value) {
                  Alert.alert(t('premiumRequired'), t('cloudSyncPremiumDesc'));
                  return;
                }
                setIcloudSyncEnabled(value);
              }} 
              trackColor={{ true: colors.primaryAccent, false: colors.muted }}
              thumbColor={settings.icloudSyncEnabled ? '#FFFFFF' : '#FFFFFF'}
              disabled={!isPremium}
            />
          </View>
          <View style={styles.rowButtons}>
            <ActionButton
              label={t('exportData')}
              icon="download"
              onPress={handleExportData}
              colors={colors}
            />
            <ActionButton
              label={t('clearAllData')}
              icon="trash-2"
              onPress={handleClearAllData}
              colors={colors}
              variant="danger"
            />
          </View>
          <Text style={[styles.helper, { color: colors.textSecondary, marginTop: 8 }]}>
            {t('dataManagementDesc')}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('about')} icon="info" colors={colors} />
          <View style={[styles.aboutCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
            <View style={[styles.aboutIconContainer, { backgroundColor: `${colors.primaryAccent}22` }]}>
              <Feather name="gift" size={32} color={colors.primaryAccent} />
            </View>
            <Text style={[styles.aboutTitle, { color: colors.textPrimary }]}>{t('birthdayReminder')}</Text>
            <Text style={[styles.aboutDescription, { color: colors.textSecondary }]}>
              {t('aboutDescription')}
            </Text>
            <View style={[styles.privacyBadge, { backgroundColor: `${colors.primaryAccent}15`, borderColor: `${colors.primaryAccent}33` }]}>
              <Feather name="lock" size={14} color={colors.primaryAccent} />
              <Text style={[styles.privacyText, { color: colors.primaryAccent }]}>
                {t('aboutPrivacy')}
              </Text>
            </View>
            <View style={[styles.versionContainer, { borderTopColor: `${colors.textSecondary}15` }]}>
              <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                {t('version')} 1.0.0
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <LanguagePickerModal
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
        selectedLanguage={settings.language}
        onSelect={setLanguage}
      />

      <PremiumOnboardingModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </SafeAreaView>
  );
}

function SectionHeader({ 
  title, 
  icon, 
  colors 
}: { 
  title: string; 
  icon?: keyof typeof Feather.glyphMap;
  colors: ReturnType<typeof useThemeColors> 
}) {
  return (
    <View style={styles.sectionHeaderContainer}>
      {icon && (
        <View style={[styles.sectionIconContainer, { backgroundColor: `${colors.primaryAccent}15` }]}>
          <Feather name={icon} size={18} color={colors.primaryAccent} />
        </View>
      )}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
    </View>
  );
}

function SettingRow({
  label,
  description,
  value,
  onValueChange,
  icon,
  colors,
  disabled,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  icon?: keyof typeof Feather.glyphMap;
  colors: ReturnType<typeof useThemeColors>;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.settingCard, styles.row, { backgroundColor: colors.surface, shadowColor: colors.cardShadow, opacity: disabled ? 0.5 : 1 }]}>
      {icon && (
        <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primaryAccent}15` }]}>
          <Feather name={icon} size={18} color={colors.primaryAccent} />
        </View>
      )}
      <View style={styles.rowText}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ true: colors.primaryAccent, false: colors.muted }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        disabled={disabled}
      />
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  colors,
  disabled,
  variant = 'primary',
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
  disabled?: boolean;
  variant?: 'primary' | 'danger';
}) {
  const isDanger = variant === 'danger';
  const bgColor = disabled 
    ? `${colors.textSecondary}15` 
    : isDanger 
      ? `${colors.danger}20` 
      : `${colors.primaryAccent}20`;
  const borderColor = disabled 
    ? `${colors.textSecondary}25` 
    : isDanger 
      ? `${colors.danger}55` 
      : `${colors.primaryAccent}55`;
  const iconColor = disabled 
    ? colors.textSecondary 
    : isDanger 
      ? colors.danger 
      : colors.primaryAccent;
  const textColor = disabled 
    ? colors.textSecondary 
    : isDanger 
      ? colors.danger 
      : colors.primaryAccent;

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.actionLabel, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  settingCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  timingCard: {
    padding: 20,
    borderRadius: 20,
    marginTop: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  timingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  aboutIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  aboutDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  privacyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowText: {
    flex: 1,
  },
  helper: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  reminderOptions: {
    gap: 10,
  },
  reminderOption: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
  },
  reminderContent: {
    flex: 1,
    marginLeft: 4,
  },
  reminderLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
          languageSelector: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 18,
            borderRadius: 16,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          },
          languageSelectorLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            flex: 1,
          },
          languageSelectorText: {
            flex: 1,
          },
          languageSelectorName: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 2,
          },
          languageSelectorSubtext: {
            fontSize: 14,
          },
          languageFlag: {
            fontSize: 32,
          },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeOption: {
    width: '47%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  themePreview: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  themeColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  themeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  premiumBannerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  lockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    width: '100%',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionRowText: {
    flex: 1,
  },
  actionRowLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionRowDescription: {
    fontSize: 13,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  rowTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  premiumBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumBadgeTextInline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  premiumCardContainer: {
    marginBottom: 32,
  },
  premiumCard: {
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  premiumCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  premiumCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumCardText: {
    flex: 1,
  },
  premiumCardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  premiumCardSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  premiumActiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  premiumActiveText: {
    fontSize: 16,
    fontWeight: '700',
  },
});



