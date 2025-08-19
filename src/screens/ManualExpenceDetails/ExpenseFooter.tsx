import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './ExpenseDetailStyles';

interface ExpenseFooterProps {
  notes?: string;
  total: number;
}

export function ExpenseFooter({ notes, total }: ExpenseFooterProps) {
  const colors = useColors();

  return (
    <View style={[styles.cardFooter, { 
      backgroundColor: colors.muted,
      borderTopColor: colors.border 
    }]}>
      <View style={styles.notesSection}>
        <Text style={[styles.notesTitle, { color: colors.foreground }]}>Notes</Text>
        <Text style={[styles.notesText, { color: colors.mutedForeground }]}>
          {notes || "No notes for this purchase."}
        </Text>
      </View>
      
      <View style={styles.totalSection}>
        <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
        <Text style={[styles.totalAmount, { color: colors.foreground }]}>
          ₹{total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
