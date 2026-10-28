import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = COLORS.primary,
  subtitle,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        <View style={styles.textColumn}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>

        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 130,
    flex: 1,
    ...SHADOWS.sm,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
