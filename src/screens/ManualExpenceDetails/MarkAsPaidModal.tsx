import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Platform } from 'react-native';
import { X, CheckCircle, Wallet } from 'lucide-react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './ExpenseDetailStyles';

// Match the exact types from your types file
const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer'] as const;
type PaymentMethod = typeof PAYMENT_METHODS[number];

interface MarkAsPaidModalProps {
  visible: boolean;
  expenseId: string;
  selectedPaymentMethod: PaymentMethod;
  isSaving: boolean;
  onClose: () => void;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  onConfirm: () => void;
}

export function MarkAsPaidModal({
  visible,
  expenseId,
  selectedPaymentMethod,
  isSaving,
  onClose,
  onPaymentMethodSelect,
  onConfirm,
}: MarkAsPaidModalProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Mark Expense as Paid
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.modalCloseButton}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.modalText, { color: colors.mutedForeground }]}>
            Select the payment method used for expense{' '}
            <Text style={[styles.expenseCode, { 
              color: colors.primary,
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' 
            }]}>
              {expenseId}
            </Text>:
          </Text>

          <View style={styles.paymentMethodsContainer}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                onPress={() => onPaymentMethodSelect(method)}
                style={[
                  styles.paymentMethodOption,
                  {
                    backgroundColor: selectedPaymentMethod === method ? colors.primary : colors.background,
                    borderColor: selectedPaymentMethod === method ? colors.primary : colors.border,
                  }
                ]}
                activeOpacity={0.7}
              >
                {selectedPaymentMethod === method && (
                  <CheckCircle size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
                )}
                <Text style={[
                  styles.paymentMethodText,
                  { color: selectedPaymentMethod === method ? colors.primaryForeground : colors.foreground }
                ]}>
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalCancelButton, { backgroundColor: colors.muted }]}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.modalConfirmButton, { 
                backgroundColor: colors.primary,
                opacity: isSaving ? 0.7 : 1
              }]}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
              ) : (
                <Wallet size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
              )}
              <Text style={[styles.modalConfirmText, { color: colors.primaryForeground }]}>
                {isSaving ? 'Processing...' : 'Confirm Payment'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
