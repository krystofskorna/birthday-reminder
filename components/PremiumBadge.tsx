import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: any;
}

export function PremiumBadge({ size = 'small', showIcon = true, style }: PremiumBadgeProps) {
  const colors = useThemeColors();
  
  const sizeStyles = {
    small: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      fontSize: 10,
      iconSize: 10,
      borderRadius: 6,
    },
    medium: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 12,
      iconSize: 12,
      borderRadius: 8,
    },
    large: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontSize: 13,
      iconSize: 14,
      borderRadius: 10,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${colors.primaryAccent}15`,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
          borderRadius: currentSize.borderRadius,
        },
        style,
      ]}
    >
      {showIcon && (
        <Feather name="star" size={currentSize.iconSize} color={colors.primaryAccent} style={styles.icon} />
      )}
      <Text
        style={[
          styles.text,
          {
            color: colors.primaryAccent,
            fontSize: currentSize.fontSize,
          },
        ]}
      >
        Premium
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    marginRight: 0,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});


