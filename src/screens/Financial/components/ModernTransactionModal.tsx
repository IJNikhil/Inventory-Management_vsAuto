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
      transaction_date: new Date().toISOString().split("T")[0],
      amount: -Math.abs(numericAmount),
      transaction_type: 'expense',
      category,
      payment_method: paymentMethod.toLowerCase().replace(' ', '_'),
      description,
      recorded_by: currentUser,
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Simple Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Expense</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
              disabled={isProcessing}
            >
              <FeatherIcon name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Category */}
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsRow}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.option,
                        category === cat && styles.optionActive
                      ]}
                      onPress={() => setCategory(cat)}
                      disabled={isProcessing}
                    >
                      <Text style={[
                        styles.optionText,
                        category === cat && styles.optionTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                placeholder="Enter expense description"
                placeholderTextColor={colors.mutedForeground}
                editable={!isProcessing}
              />
            </View>
            
            {/* Amount */}
            <View style={styles.field}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.mutedForeground}
                editable={!isProcessing}
              />
            </View>
              
            {/* Status */}
            <View style={styles.field}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusRow}>
                {statusOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.statusButton,
                      status === opt && styles.statusButtonActive
                    ]}
                    onPress={() => setStatus(opt)}
                    disabled={isProcessing}
                  >
                    <Text style={[
                      styles.statusText,
                      status === opt && styles.statusTextActive
                    ]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Payment Method */}
            {status === 'Paid' && (
              <View style={styles.field}>
                <Text style={styles.label}>Payment Method</Text>
                <View style={styles.optionsRow}>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.option,
                        paymentMethod === method && styles.optionActive
                      ]}
                      onPress={() => setPaymentMethod(method)}
                      disabled={isProcessing}
                    >
                      <Text style={[
                        styles.optionText,
                        paymentMethod === method && styles.optionTextActive
                      ]}>
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
          
          {/* Simple Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.cancelButton}
              disabled={isProcessing}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleSubmit} 
              style={[styles.saveButton, isProcessing && { opacity: 0.5 }]}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.saveText}>Add Expense</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // Modal Structure
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    minHeight: '50%',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    flex: 1,
    padding: 20,
  },
  
  field: {
    marginBottom: 20,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
  
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.card,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Options
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  optionActive: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.foreground,
  },
  
  optionTextActive: {
    color: colors.background,
  },

  // Status
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  statusButtonActive: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.foreground,
  },
  
  statusTextActive: {
    color: colors.background,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  
  saveButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.foreground,
  },
  
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
});
