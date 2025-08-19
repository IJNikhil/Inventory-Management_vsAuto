import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../../context/ThemeContext';

interface SummaryProps {
  subtotal: number;
  total: number;
}

export default function Summary({ subtotal, total }: SummaryProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Subtotal (from MRP)</Text>
        <Text style={[styles.value, { color: colors.foreground }]}>₹{subtotal.toFixed(2)}</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.row}>
        <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
        <Text style={[styles.totalValue, { color: colors.foreground }]}>₹{total.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '500' },
  divider: { height: 2, marginVertical: 8 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 20, fontWeight: 'bold' },
});
