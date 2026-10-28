import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getColors = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'confirmed':
      case 'available':
      case 'replied':
        return { bg: COLORS.successLight, text: '#059669', border: '#A7F3D0' };
      case 'pending':
        return { bg: COLORS.accentLight, text: '#D97706', border: '#FDE68A' };
      case 'rejected':
      case 'cancelled':
        return { bg: COLORS.dangerLight, text: '#DC2626', border: '#FECACA' };
      case 'rented':
      case 'sold':
        return { bg: COLORS.primaryLight, text: COLORS.primary, border: '#BFDBFE' };
      default:
        return { bg: COLORS.backgroundSubtle, text: COLORS.textMuted, border: COLORS.border };
    }
  };

  const colors = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 10,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSm ? 11 : 12,
          },
        ]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
