// src/screens/ExpenseDetailScreen/components/StatusBadge.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  status: string;
  colors: any;
}

export default function StatusBadge({ status, colors }: Props) {
  const isPaid = status === 'Paid';

  return (
    <View style={{
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      alignSelf: 'flex-start',
      backgroundColor: isPaid ? colors.primary + '20' : colors.accent + '20',
      borderColor: isPaid ? colors.primary : colors.accent,
    }}>
      <Text style={{
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
        color: isPaid ? colors.primary : colors.accent,
      }}>
        {status}
      </Text>
    </View>
  );
}
