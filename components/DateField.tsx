import { useState, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSettings } from '@/contexts/SettingsContext';
import { DatePickerModal } from '@/components/DatePickerModal';
import { formatLong } from '@/lib/date';

interface Props {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export function DateField({ label, value, onChange }: Props) {
  const colors = useThemeColors();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);

  // Memoize the formatted date to prevent unnecessary re-renders
  const formattedDate = useMemo(() => formatLong(value, settings.language), [value, settings.language]);

  const handleSelect = (date: Date) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setOpen(true)}>
        <View style={[styles.field, { borderColor: `${colors.primaryAccent}33`, backgroundColor: colors.surface }]}>
          <View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>{formattedDate}</Text>
          </View>
          <Feather name="calendar" size={20} color={colors.primaryAccent} />
        </View>
      </TouchableOpacity>
      <DatePickerModal 
        visible={open} 
        initialDate={value} 
        onClose={() => setOpen(false)} 
        onSelect={handleSelect} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
});

