import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './part-detail-styles';

interface BadgeProps {
  label: string;
}

export function Badge({ label }: BadgeProps) {
  const colors = useColors();

  return (
    <View style={[styles.badge, {
      backgroundColor: colors.muted,
      borderColor: colors.border,
    }]}>
      <Text style={[styles.badgeText, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}
