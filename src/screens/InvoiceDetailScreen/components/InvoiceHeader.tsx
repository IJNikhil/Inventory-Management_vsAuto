import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import StatusBadge from './StatusBadge';
import { useColors } from '../../../context/ThemeContext';

interface InvoiceHeaderProps {
  invoiceId: string;
  status: string;
  totalAmount: number;
}

export default function InvoiceHeader({ invoiceId, status, totalAmount }: InvoiceHeaderProps) {
  const colors = useColors();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <Text style={[styles.invoiceTitle, { color: colors.primary }]}>
          INVOICE
        </Text>
        <Text style={[styles.invoiceId, { color: colors.foreground }]}>
          #{invoiceId}
        </Text>
        <StatusBadge status={status} colors={colors} />
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
          Total Amount
        </Text>
        <Text style={[styles.totalAmount, { color: colors.foreground }]}>
          ₹{totalAmount.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  leftSection: {
    flex: 1,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  invoiceId: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 12,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
