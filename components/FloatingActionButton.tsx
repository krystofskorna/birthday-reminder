import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  label?: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
}

export function FloatingActionButton({ label = 'Add', icon = 'plus', onPress }: Props) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.wrapper}>
      <View style={[styles.button, { backgroundColor: colors.primaryAccent }]}>
        <Feather name={icon} size={20} color="#fff" />
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});



