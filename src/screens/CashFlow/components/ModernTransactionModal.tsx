import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";

interface ModernTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: any) => Promise<void>;
  currentUser: string;
  colors: any;
  isDark: boolean;
  isProcessing: boolean;
}

export default function ModernTransactionModal({
  visible,
  onClose,
  onSave,
  currentUser,
  colors,
  isDark,
  isProcessing
}: ModernTransactionModalProps) {
  const styles = createStyles(colors, isDark);
  
  const [category, setCategory] = useState("Miscellaneous");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Paid");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const categories = ['Rent', 'Salaries', 'Utilities', 'Office Supplies', 'Marketing', 'Repairs', 'Miscellaneous'];
  const paymentMethods = ['Cash', 'UPI', 'Bank Transfer'];
  const statusOptions = ['Paid', 'Pending'];

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);
    if (!category || !description || isNaN(numericAmount)) {
      Alert.alert("Invalid Data", "Please fill all fields correctly.");
      return;
    }

    const transactionData = {
      transaction_date: new Date().toISOString().split("T")[0], // ✅ FIXED: Remove backslashes
      amount: -Math.abs(numericAmount),
      transaction_type: 'expense', // ✅ FIXED: Remove backslashes
      category,
      payment_method: paymentMethod.toLowerCase().replace(' ', '_'), // ✅ FIXED: Remove backslashes
      description,
      recorded_by: currentUser, // ✅ FIXED: Remove backslashes
      status: status === 'Paid' ? 'completed' : 'pending',
    };

    try {
      await onSave(transactionData);
      // Reset form
      setCategory("Miscellaneous");
      setDescription("");
      setAmount("");
      setStatus("Paid");
      setPaymentMethod("Cash");
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modernModalOverlay}>
        <View style={styles.modernModalContent}>
          {/* Modern Header */}
          <View style={styles.modernModalHeader}>
            <View style={styles.modalHandleBar} />
            <View style={styles.modernModalTitleRow}>
              <View style={styles.modernModalIconContainer}>
                <FeatherIcon name="plus-circle" size={24} color={colors.primary} />
              </View>
              <View style={styles.modernModalTitleContainer}>
                <Text style={styles.modernModalTitle}>Add Expense</Text>
                <Text style={styles.modernModalSubtitle}>Record a new business expense</Text>
              </View>
              <TouchableOpacity 
                onPress={onClose}
                style={styles.modernModalCloseButton}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                <FeatherIcon name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modernModalBody} showsVerticalScrollIndicator={false}>
            {/* Category Selection */}
            <View style={styles.modernFormSection}>
              <Text style={styles.modernFormLabel}>
                <FeatherIcon name="tag" size={14} color={colors.mutedForeground} /> Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollContainer}>
                <View style={styles.chipContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.modernChip,
                        category === cat && styles.modernChipActive
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                      disabled={isProcessing}
                    >
                      <Text style={[
                        styles.modernChipText,
                        category === cat && styles.modernChipTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            {/* Description */}
            <View style={styles.modernFormSection}>
              <Text style={styles.modernFormLabel}>
                <FeatherIcon name="file-text" size={14} color={colors.mutedForeground} /> Description
              </Text>
              <TextInput
                style={styles.modernInput}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                placeholder="e.g., Monthly office rent for December"
                placeholderTextColor={colors.mutedForeground}
                editable={!isProcessing}
              />
            </View>
            
            {/* Amount & Status Row */}
            <View style={styles.modernFormRow}>
              <View style={styles.modernFormHalf}>
                <Text style={styles.modernFormLabel}>
                  <FeatherIcon name="dollar-sign" size={14} color={colors.mutedForeground} /> Amount
                </Text>
                <TextInput
                  style={styles.modernInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedForeground}
                  editable={!isProcessing}
                />
              </View>
              
              <View style={styles.modernFormHalf}>
                <Text style={styles.modernFormLabel}>
                  <FeatherIcon name="check-circle" size={14} color={colors.mutedForeground} /> Status
                </Text>
                <View style={styles.statusButtonContainer}>
                  {statusOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.statusToggleButton,
                        status === opt && styles.statusToggleButtonActive
                      ]}
                      onPress={() => setStatus(opt)}
                      activeOpacity={0.7}
                      disabled={isProcessing}
                    >
                      <Text style={[
                        styles.statusToggleText,
                        status === opt && styles.statusToggleTextActive
                      ]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            {/* Payment Method */}
            {status === 'Paid' && (
              <View style={styles.modernFormSection}>
                <Text style={styles.modernFormLabel}>
                  <FeatherIcon name="credit-card" size={14} color={colors.mutedForeground} /> Payment Method
                </Text>
                <View style={styles.chipContainer}>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.modernChip,
                        paymentMethod === method && styles.modernChipActive
                      ]}
                      onPress={() => setPaymentMethod(method)}
                      activeOpacity={0.7}
                      disabled={isProcessing}
                    >
                      <Text style={[
                        styles.modernChipText,
                        paymentMethod === method && styles.modernChipTextActive
                      ]}>
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
          
          {/* Modern Action Buttons */}
          <View style={styles.modernModalActions}>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.modernCancelButton}
              activeOpacity={0.7}
              disabled={isProcessing}
            >
              <Text style={styles.modernCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSubmit} 
              style={[
                styles.modernSaveButton,
                isProcessing && { opacity: 0.5 }
              ]}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <FeatherIcon name="plus" size={18} color={colors.primaryForeground} />
              )}
              <Text style={styles.modernSaveButtonText}>
                {isProcessing ? 'Adding...' : 'Add Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // Modal Styles
  modernModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modernModalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '50%',
  },
  modernModalHeader: {
    padding: 20,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.muted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modernModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernModalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modernModalTitleContainer: {
    flex: 1,
  },
  modernModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 2,
  },
  modernModalSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  modernModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernModalBody: {
    flex: 1,
    padding: 20,
  },
  modernFormSection: {
    marginBottom: 24,
  },
  modernFormLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.background,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  chipScrollContainer: {
    marginHorizontal: -4,
  },
  chipContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  modernChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.muted,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modernChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modernChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  modernChipTextActive: {
    color: colors.primaryForeground,
  },
  modernFormRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  modernFormHalf: {
    flex: 1,
  },
  statusButtonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusToggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.muted,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusToggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  statusToggleTextActive: {
    color: colors.primaryForeground,
  },
  modernModalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modernCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.muted,
  },
  modernCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  modernSaveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modernSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
});
