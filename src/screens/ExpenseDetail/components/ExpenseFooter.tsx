// src/screens/ExpenseDetailScreen/components/ExpenseFooter.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  notes?: string;
  total: number;
  colors: any;
}

export default function ExpenseFooter({ notes, total, colors }: Props) {
  return (
    <View style={{
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.muted,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <View style={{ marginRight: 20, flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.foreground }}>Notes</Text>
        <Text style={{ fontSize: 13, lineHeight: 18, color: colors.mutedForeground }}>
          {notes || "No notes for this purchase."}
        </Text>
      </View>

      <View>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>Total</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
          ₹{total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
