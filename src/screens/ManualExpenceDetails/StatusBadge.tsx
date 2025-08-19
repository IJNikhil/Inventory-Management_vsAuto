import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './ExpenseDetailStyles';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = useColors();
  const isPaid = status === 'Paid';
  
  return (
    <View style={[
      styles.statusBadge,
      {
        backgroundColor: isPaid ? colors.primary + '20' : colors.accent + '20',
        borderColor: isPaid ? colors.primary : colors.accent,
      }
    ]}>
      <Text style={[
        styles.statusBadgeText,
        { color: isPaid ? colors.primary : colors.accent }
      ]}>
        {status}
      </Text>
    </View>
  );
}
