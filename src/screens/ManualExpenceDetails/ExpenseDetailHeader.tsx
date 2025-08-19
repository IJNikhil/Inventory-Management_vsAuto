import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Download, Wallet, Printer } from 'lucide-react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './ExpenseDetailStyles';

interface ExpenseDetailHeaderProps {
  onBackPress: () => void;
  onReceiptPress?: () => void;
  onMarkPaidPress: () => void;
  onPrintPress: () => void;
  hasReceipt: boolean;
  isPending: boolean;
}

export function ExpenseDetailHeader({
  onBackPress,
  onReceiptPress,
  onMarkPaidPress,
  onPrintPress,
  hasReceipt,
  isPending,
}: ExpenseDetailHeaderProps) {
  const colors = useColors();

  return (
    <View style={[styles.header, { 
      backgroundColor: colors.card,
      borderBottomColor: colors.border 
    }]}>
      <TouchableOpacity
        onPress={onBackPress}
        style={[styles.backBtn, {
          backgroundColor: colors.background,
          borderColor: colors.border
        }]}
        activeOpacity={0.7}
      >
        <ArrowLeft size={18} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.backBtnText, { color: colors.primary }]}>Back to Cash Flow</Text>
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        {hasReceipt && (
          <TouchableOpacity
            onPress={onReceiptPress}
            style={[styles.actionButton, {
              backgroundColor: colors.background,
              borderColor: colors.border
            }]}
            activeOpacity={0.7}
          >
            <Download size={16} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Receipt</Text>
          </TouchableOpacity>
        )}
        
        {isPending && (
          <TouchableOpacity
            onPress={onMarkPaidPress}
            style={[styles.markPaidBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Wallet size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
            <Text style={[styles.markPaidBtnText, { color: colors.primaryForeground }]}>
              Mark as Paid
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={onPrintPress}
          style={[styles.actionButton, {
            backgroundColor: colors.background,
            borderColor: colors.border
          }]}
          activeOpacity={0.7}
        >
          <Printer size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
