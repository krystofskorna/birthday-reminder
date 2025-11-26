import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: Props) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.85}>
          <View style={[styles.button, { backgroundColor: `${colors.primaryAccent}20` }]}>
            <Text style={[styles.buttonLabel, { color: colors.primaryAccent }]}>{actionLabel}</Text>
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    shadowOpacity: 0.2,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});


