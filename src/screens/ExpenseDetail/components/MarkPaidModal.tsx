// src/screens/ExpenseDetailScreen/components/MarkPaidModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { X, CheckCircle, Wallet } from 'lucide-react-native';

const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer'] as const;
type PaymentMethod = typeof PAYMENT_METHODS[number];

interface Props {
  visible: boolean;
  onClose: () => void;
  expenseId: string;
  selectedPaymentMethod: PaymentMethod;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  handleUpdateStatus: () => Promise<void>;
  isSavingStatus: boolean;
  colors: any;
}

export default function MarkPaidModal({
  visible,
  onClose,
  expenseId,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  handleUpdateStatus,
  isSavingStatus,
  colors,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}>
        <View style={{
          borderRadius: 16,
          width: '100%',
          maxWidth: 400,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          backgroundColor: colors.card,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 8,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>Mark Expense as Paid</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }} activeOpacity={0.7}>
              <X size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 14, paddingHorizontal: 20, marginBottom: 20, lineHeight: 20, color: colors.mutedForeground }}>
            Select the payment method used for expense{' '}
            <Text style={{
              color: colors.primary,
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
              fontWeight: '600',
            }}>
              {expenseId}
            </Text>:
          </Text>

          <View style={{ paddingHorizontal: 20, gap: 12, marginBottom: 24 }}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                onPress={() => setSelectedPaymentMethod(method)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  backgroundColor: selectedPaymentMethod === method ? colors.primary : colors.background,
                  borderColor: selectedPaymentMethod === method ? colors.primary : colors.border,
                }}
                activeOpacity={0.7}
              >
                {selectedPaymentMethod === method && (
                  <CheckCircle size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
                )}
                <Text style={{
                  fontSize: 15,
                  fontWeight: '500',
                  color: selectedPaymentMethod === method ? colors.primaryForeground : colors.foreground,
                }}>
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: colors.muted,
              }}
              disabled={isSavingStatus}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.mutedForeground }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUpdateStatus}
              style={{
                flex: 2,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 8,
                gap: 8,
                backgroundColor: colors.primary,
                opacity: isSavingStatus ? 0.7 : 1,
              }}
              disabled={isSavingStatus}
              activeOpacity={0.8}
            >
              {isSavingStatus ? (
                <ActivityIndicator size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
              ) : (
                <Wallet size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
              )}
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primaryForeground }}>
                {isSavingStatus ? 'Processing...' : 'Confirm Payment'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
