// src/screens/ExpenseDetailScreen/components/ExpenseHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Download, Printer, Wallet } from 'lucide-react-native';

interface Props {
  expense?: {
    receiptUrl?: string;
    status: string;
  }
  navigation?: any;
  colors: any;
  onOpenReceipt?: () => void;
  onMarkPaid?: () => void;
  onPrint?: () => void;
  isLoading?: boolean;
}

export default function ExpenseHeader({ expense, navigation, colors, onOpenReceipt, onMarkPaid, onPrint, isLoading }: Props) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    }}>
      <TouchableOpacity
        onPress={() => navigation?.goBack()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 8,
          borderWidth: 1,
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
        activeOpacity={0.7}
      >
        <ArrowLeft size={18} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.primary }}>Back to Cash Flow</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {expense?.receiptUrl && (
          <TouchableOpacity
            onPress={onOpenReceipt}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 8,
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 10,
              gap: 6,
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
            activeOpacity={0.7}
          >
            <Download size={16} color={colors.primary} />
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primary }}>Receipt</Text>
          </TouchableOpacity>
        )}

        {expense?.status === 'Pending' && (
          <TouchableOpacity
            onPress={onMarkPaid}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: colors.primary,
            }}
            activeOpacity={0.8}
          >
            <Wallet size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
            <Text style={{ fontWeight: '600', fontSize: 14, color: colors.primaryForeground }}>Mark as Paid</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onPrint}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 8,
            borderWidth: 1,
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 6,
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
          activeOpacity={0.7}
        >
          <Printer size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
