import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: Props) {
  const colors = useThemeColors();
  const t = useTranslation();

  // Translate common section titles
  const translatedTitle = title === 'This Week' ? t('thisWeek') 
    : title === 'This Month' ? t('thisMonth')
    : title === 'Today' ? t('today')
    : title;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{translatedTitle}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionGroup({ children }: PropsWithChildren) {
  return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  group: {
    marginBottom: 24,
  },
});




