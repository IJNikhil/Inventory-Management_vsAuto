import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import DatePicker from 'react-native-date-picker';

// Theme
import { useColors, useTheme } from '../../context/ThemeContext';

// Types
import type { InvoiceCustomer, Part } from '../../types/database';

// Hooks
import useCreateInvoice from './hooks/useCreateInvoice';

// Components
import MobilePartPicker from './components/MobilePartPicker';

const { width: screenWidth } = Dimensions.get('window');

type PaymentMethod = 'cash' | 'upi' | 'bank_transfer';

// ✅ ADDED: Safe text rendering utility
const SafeText = ({ children, style, ...props }: any) => {
  const safeText = children === null || children === undefined ? '' : String(children);
  return <Text style={style} {...props}>{safeText}</Text>;
};

// ✅ ADDED: Safe number formatting
const formatCurrency = (value: any): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
};

const formatNumber = (value: any): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? '0' : Math.round(numValue).toString();
};

export default function InvoiceNewScreen({ navigation }: any) {
  const colors = useColors();
  const { isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  
  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const {
    // Loading states
    isLoading,
    isSaving,
    
    // Data
    availableParts,
    shopDetails,
    
    // Form data
    customerData,
    setCustomerData,
    items,
    date,
    setDate,
    status,
    setStatus,
    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes,
    errors,
    
    // Calculated values
    subtotal,
    total,
    isSaveDisabled,
    
    // Functions
    loadInitialData,
    handleDiscountChange,
    handlePriceChange,
    onSelectPart,
    addItem,
    removeItem,
    handleSave,
    updateItem,
    
    // Constants
    STATUS_OPTIONS,
  } = useCreateInvoice();

  // Load data on mount and focus
  useEffect(() => {
    loadInitialData(true);
  }, [loadInitialData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[InvoiceNewScreen] Screen focused');
    });
    return unsubscribe;
  }, [navigation]);

  // ✅ FIXED: Safe access to part IDs
  const selectedPartIds = new Set(
    items
      .map(item => item.part_id)
      .filter(id => id && typeof id === 'string')
  );
  
  // ✅ FIXED: Improved quantity handling with proper validation
  const handleQuantityChange = (itemId: string, value: string) => {
    const item = items.find(i => i.id === itemId);
    
    // Don't allow editing if no part selected
    if (!item?.part_id) {
      return;
    }
    
    // Allow empty string and valid numbers during editing
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = value === '' ? 1 : parseInt(value, 10);
      updateItem(itemId, { quantity: numValue });
    }
  };

  // ✅ FIXED: Handle quantity blur to ensure minimum value
  const handleQuantityBlur = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item?.part_id) return;
    
    const currentQuantity = item.quantity;
    if (!currentQuantity || currentQuantity < 1) {
      updateItem(itemId, { quantity: 1 });
    }
  };
  
  // Auto-add new item when user starts editing the last item
  const handleItemFieldChange = (itemId: string, field: string, value: any) => {
    const itemIndex = items.findIndex(item => item.id === itemId);
    const isLastItem = itemIndex === items.length - 1;
    const isLastItemEmpty = items[items.length - 1] && 
      !items[items.length - 1].part_id && 
      !items[items.length - 1].description;

    // If user is editing the last item and it's currently empty, add a new item
    if (isLastItem && isLastItemEmpty && field === 'part_id') {
      setTimeout(() => addItem(), 100);
    }
  };

  // Phone number validation (10 digits only)
  const handlePhoneChange = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    const limitedDigits = digitsOnly.slice(0, 10);
    setCustomerData(prev => ({ ...prev, phone: limitedDigits }));
  };

  // ✅ FIXED: Handle part selection with database schema compatibility
  const handlePartSelect = useCallback((itemId: string, part: Part) => {
    console.log('🎯 Part Selected:', { itemId, part: part.name });
    onSelectPart(itemId, part);
    handleItemFieldChange(itemId, 'part_id', part.id);
  }, [onSelectPart]);

  // ✅ FIXED: Handle discount change only if part selected
  const handleDiscountChangeWithValidation = (itemId: string, value: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item?.part_id) return;
    
    handleDiscountChange(itemId, value);
  };

  // ✅ FIXED: Handle price change only if part selected
  const handlePriceChangeWithValidation = (itemId: string, value: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item?.part_id) return;
    
    handlePriceChange(itemId, value);
  };

  const onSave = async () => {
    console.log('[InvoiceNewScreen] Generate button clicked');
    const success = await handleSave();
    if (success) {
      console.log('[InvoiceNewScreen] Invoice saved successfully, navigating back');
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.foreground} />
        <Text style={styles.loadingText}>Loading Invoice Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Style matching DrawerHeader */}
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <FeatherIcon name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <FeatherIcon name="file-plus" size={20} color={colors.primary} />
            <Text style={[styles.title, { color: colors.foreground }]}>
              New Invoice
            </Text>
          </View>
          
          <View style={styles.rightSection} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Shop Details Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <FeatherIcon name="building" size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Bill From</Text>
            </View>
            <View style={styles.cardContent}>
              {/* ✅ FIXED: Safe text rendering for shop details */}
              <SafeText style={styles.shopName}>
                {shopDetails?.shop_name || 'VS Auto'}
              </SafeText>
              <SafeText style={styles.shopAddress}>
                {shopDetails?.address || 'Auto Parts Store'}
              </SafeText>
            </View>
          </View>

          {/* Customer Details Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <FeatherIcon name="user" size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Customer Details</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Customer Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter customer name"
                  placeholderTextColor={colors.mutedForeground}
                  value={customerData.name || ''} // ✅ FIXED: Safe fallback
                  onChangeText={(name) => setCustomerData(prev => ({ ...prev, name }))}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Phone (10 digits)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      customerData.phone && customerData.phone.length !== 10 && styles.inputError
                    ]}
                    placeholder="1234567890"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    maxLength={10}
                    value={customerData.phone || ''} // ✅ FIXED: Safe fallback
                    onChangeText={handlePhoneChange}
                  />
                  {/* ✅ FIXED: Safe conditional rendering */}
                  {customerData.phone && customerData.phone.length !== 10 && (
                    <Text style={styles.validationText}>Please enter exactly 10 digits</Text>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setIsDatePickerOpen(true)}
                    activeOpacity={0.7}
                  >
                    <FeatherIcon name="calendar" size={16} color={colors.mutedForeground} />
                    <Text style={styles.dateText}>{format(date, 'MMM dd, yyyy')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Email field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="customer@example.com"
                  placeholderTextColor={colors.mutedForeground}
                  value={customerData.email || ''} // ✅ FIXED: Safe fallback
                  onChangeText={(email) => setCustomerData(prev => ({ ...prev, email }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.textAreaInput}
                  placeholder="Customer address"
                  placeholderTextColor={colors.mutedForeground}
                  value={customerData.address || ''} // ✅ FIXED: Safe fallback
                  onChangeText={(address) => setCustomerData(prev => ({ ...prev, address }))}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Invoice Items Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <FeatherIcon name="file-text" size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Invoice Items</Text>
            </View>

            <View style={styles.cardContent}>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tableScrollContainer}
                contentContainerStyle={styles.tableScrollContent}
              >
                <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.columnNumber]}>#</Text>
                    <Text style={[styles.tableHeaderText, styles.columnPart]}>Part</Text>
                    <Text style={[styles.tableHeaderText, styles.columnQty]}>Qty</Text>
                    <Text style={[styles.tableHeaderText, styles.columnMRP]}>MRP</Text>
                    <Text style={[styles.tableHeaderText, styles.columnDiscount]}>Disc%</Text>
                    <Text style={[styles.tableHeaderText, styles.columnPrice]}>Price</Text>
                    <Text style={[styles.tableHeaderText, styles.columnTotal]}>Total</Text>
                    <View style={styles.columnAction} />
                  </View>

                  {/* Items List */}
                  {items.map((item, idx) => {
                    const error = errors.find(e => e.itemId === item.id);
                    const isLastItem = idx === items.length - 1;
                    const isEmpty = !item.part_id && !item.description;
                    
                    // ✅ FIXED: Safe calculation with proper fallbacks
                    const quantity = item.quantity || 0;
                    const unitPrice = item.unit_price || 0;
                    const itemTotal = quantity * unitPrice;
                    const hasPartSelected = Boolean(item.part_id);
                    
                    return (
                      <View key={item.id}>
                        <View style={[
                          styles.tableRow,
                          isLastItem && isEmpty && styles.tableRowHint
                        ]}>
                          {/* ✅ FIXED: Safe number rendering */}
                          <Text style={[styles.tableRowNumber, styles.columnNumber]}>
                            {(idx + 1).toString()}
                          </Text>
                          
                          <View style={styles.columnPart}>
                            <MobilePartPicker
                              parts={availableParts.filter(part => 
                                !selectedPartIds.has(part.id) || part.id === item.part_id
                              )}
                              selectedPartId={item.part_id || ''} // ✅ FIXED: Safe fallback
                              onSelect={(part) => handlePartSelect(item.id, part)}
                              disabled={isLoading}
                              colors={colors}
                            />
                          </View>

                          {/* Quantity input */}
                          <View style={styles.columnQty}>
                            <TextInput
                              style={[
                                styles.tableInput,
                                !hasPartSelected && styles.tableInputDisabled
                              ]}
                              keyboardType="numeric"
                              value={hasPartSelected ? formatNumber(item.quantity) : ""} // ✅ FIXED: Safe formatting
                              onChangeText={v => handleQuantityChange(item.id, v)}
                              onBlur={() => handleQuantityBlur(item.id)}
                              placeholder={hasPartSelected ? "1" : ""}
                              placeholderTextColor={colors.mutedForeground}
                              editable={hasPartSelected}
                              selectTextOnFocus={true}
                            />
                          </View>
                          
                          <View style={styles.columnMRP}>
                            <TextInput
                              style={[styles.tableInput, styles.tableInputDisabled]}
                              value={formatCurrency(item.mrp)} // ✅ FIXED: Safe formatting
                              editable={false}
                              placeholder="0"
                              placeholderTextColor={colors.mutedForeground}
                            />
                          </View>
                          
                          {/* Discount input */}
                          <View style={styles.columnDiscount}>
                            <TextInput
                              style={[
                                styles.tableInput,
                                !hasPartSelected && styles.tableInputDisabled
                              ]}
                              keyboardType="numeric"
                              value={hasPartSelected ? formatNumber(item.discount_percentage) : ""}
                              onChangeText={v => handleDiscountChangeWithValidation(item.id, Number(v))}
                              placeholder={hasPartSelected ? "0" : ""}
                              placeholderTextColor={colors.mutedForeground}
                              editable={hasPartSelected}
                            />
                          </View>
                          
                          {/* Price input */}
                          <View style={styles.columnPrice}>
                            <TextInput
                              style={[
                                styles.tableInput,
                                !hasPartSelected && styles.tableInputDisabled,
                                error && { borderColor: colors.destructive }
                              ]}
                              keyboardType="numeric"
                              value={hasPartSelected ? formatCurrency(item.unit_price) : ""}
                              onChangeText={v => handlePriceChangeWithValidation(item.id, Number(v))}
                              placeholder={hasPartSelected ? "0" : ""}
                              placeholderTextColor={colors.mutedForeground}
                              editable={hasPartSelected}
                            />
                          </View>

                          {/* Total Column */}
                          <View style={styles.columnTotal}>
                            <Text style={styles.totalCell}>
                              ₹{formatCurrency(itemTotal)} {/* ✅ FIXED: Safe formatting */}
                            </Text>
                          </View>

                          <View style={styles.columnAction}>
                            {items.length > 1 && !isEmpty && (
                              <TouchableOpacity 
                                onPress={() => removeItem(item.id)}
                                style={styles.removeItemButton}
                                activeOpacity={0.7}
                              >
                                <FeatherIcon name="x" size={14} color={colors.destructive} />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>

                        {/* ✅ FIXED: Safe error rendering */}
                        {error && (
                          <View style={styles.errorRow}>
                            <FeatherIcon name="alert-circle" size={12} color={colors.destructive} />
                            <Text style={styles.errorText}>{error.message || 'Validation error'}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Payment Status Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <FeatherIcon name="credit-card" size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Payment Status</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.chipContainer}>
                {STATUS_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.chip,
                      { 
                        backgroundColor: status === option ? colors.foreground : colors.background,
                        borderColor: status === option ? colors.foreground : colors.border,
                      }
                    ]}
                    onPress={() => setStatus(option)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.chipText,
                      { color: status === option ? colors.background : colors.foreground }
                    ]}>
                      {/* ✅ FIXED: Safe string manipulation */}
                      {String(option).charAt(0).toUpperCase() + String(option).slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {status === "paid" && (
                <View style={styles.paymentMethodSection}>
                  <Text style={styles.inputLabel}>Payment Method</Text>
                  <View style={styles.chipContainer}>
                    {(['cash', 'upi', 'bank_transfer'] as PaymentMethod[]).map(method => (
                      <TouchableOpacity
                        key={method}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: paymentMethod === method ? colors.foreground : colors.background,
                            borderColor: paymentMethod === method ? colors.foreground : colors.border,
                          }
                        ]}
                        onPress={() => setPaymentMethod(method)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.chipText,
                          { color: paymentMethod === method ? colors.background : colors.foreground }
                        ]}>
                          {/* ✅ FIXED: Safe display text */}
                          {method === 'cash' ? 'Cash' : method === 'upi' ? 'UPI' : 'Bank Transfer'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Notes Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <FeatherIcon name="edit-3" size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            </View>
            <View style={styles.cardContent}>
              <TextInput
                multiline
                numberOfLines={4}
                value={notes || ''} // ✅ FIXED: Safe fallback
                onChangeText={setNotes}
                style={styles.notesInput}
                placeholder="Add invoice notes, warranty information, terms..."
                placeholderTextColor={colors.mutedForeground}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer with totals */}
        <View style={styles.totalFooter}>
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.subtotalLabel}>Subtotal (MRP):</Text>
              {/* ✅ FIXED: Safe currency formatting */}
              <Text style={styles.subtotalValue}>₹{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Amount:</Text>
              {/* ✅ FIXED: Safe currency formatting */}
              <Text style={styles.grandTotalValue}>₹{formatCurrency(total)}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={onSave}
            disabled={isSaveDisabled}
            style={[
              styles.generateButton,
              { opacity: isSaveDisabled ? 0.5 : 1 }
            ]}
            activeOpacity={0.7}
          >
            {isSaving && (
              <ActivityIndicator 
                size="small" 
                color={colors.background} 
                style={styles.buttonLoader} 
              />
            )}
            <FeatherIcon name="save" size={18} color={colors.background} />
            <Text style={styles.generateButtonText}>
              {isSaving ? "Generating..." : "Generate Invoice"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={isDatePickerOpen}
        date={date}
        mode="date"
        onConfirm={(selectedDate) => {
          setIsDatePickerOpen(false);
          setDate(selectedDate);
        }}
        onCancel={() => {
          setIsDatePickerOpen(false);
        }}
      />
    </View>
  );
}







const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  
  // Header Style matching DrawerHeader
  safeArea: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  rightSection: {
    width: 40,
  },
  
  keyboardView: { 
    flex: 1 
  },
  scrollContainer: { 
    flex: 1 
  },
  contentContainer: { 
    padding: 20,
    paddingBottom: 20,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.background 
  },
  loadingText: { 
    color: colors.foreground, 
    marginTop: 12,
    fontSize: 16
  },
  
  // Card styles
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    color: colors.foreground,
    fontWeight: '600',
    flex: 1,
  },
  cardContent: {
    padding: 20,
  },
  
  // Shop details
  shopName: {
    color: colors.foreground,
    fontWeight: '700',
    marginBottom: 4,
  },
  shopAddress: {
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  
  // Input styles
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputLabel: {
    color: colors.foreground,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
    color: colors.foreground,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  validationText: {
    color: colors.destructive,
    marginTop: 4,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
    color: colors.foreground,
    minHeight: 80,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: colors.foreground,
    marginLeft: 8,
    fontWeight: '500',
  },
  
  // Chip styles
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: '500',
  },
  paymentMethodSection: {
    marginTop: 8,
  },
  
  // Horizontal scrollable table styles
  tableScrollContainer: {
    marginBottom: 16,
  },
  tableScrollContent: {
    paddingRight: 20,
  },
  tableContainer: {
    minWidth: screenWidth + 190,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: colors.muted,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  tableHeaderText: {
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    minHeight: 60,
  },
  tableRowHint: {
    backgroundColor: colors.muted,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  tableRowNumber: {
    color: colors.foreground,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tableInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.background,
    color: colors.foreground,
    textAlign: 'center',
  },
  tableInputDisabled: {
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
  },
  
  // Column width styles
  columnNumber: {
    width: 40,
    minWidth: 40,
  },
  columnPart: {
    width: 180,
    minWidth: 180,
    marginHorizontal: 4,
  },
  columnQty: {
    width: 60,
    minWidth: 60,
    marginHorizontal: 4,
  },
  columnMRP: {
    width: 70,
    minWidth: 70,
    marginHorizontal: 4,
  },
  columnDiscount: {
    width: 60,
    minWidth: 60,
    marginHorizontal: 4,
  },
  columnPrice: {
    width: 80,
    minWidth: 80,
    marginHorizontal: 4,
  },
  columnTotal: {
    width: 90,
    minWidth: 90,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalCell: {
    color: colors.foreground,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  columnAction: {
    width: 40,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  removeItemButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.muted,
    borderRadius: 4,
    marginBottom: 4,
  },
  errorText: {
    color: colors.destructive,
    marginLeft: 6,
  },
  
  // Notes input
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
    color: colors.foreground,
    minHeight: 100,
  },
  
  // Fixed footer styles with proper spacing
  totalFooter: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subtotalLabel: {
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  subtotalValue: {
    color: colors.foreground,
    fontWeight: '600',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.muted,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.foreground,
    marginTop: 8,
  },
  grandTotalLabel: {
    color: colors.foreground,
    fontWeight: '700',
  },
  grandTotalValue: {
    color: colors.foreground,
    fontWeight: '800',
  },
  generateButton: {
    backgroundColor: colors.foreground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonLoader: {
    marginRight: 8,
  },
  generateButtonText: {
    color: colors.background,
    fontWeight: '700',
    marginLeft: 8,
  },
});



// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import FeatherIcon from 'react-native-vector-icons/Feather';
// import { format } from 'date-fns';
// import DatePicker from 'react-native-date-picker';

// // Theme
// import { useColors, useTheme } from '../../context/ThemeContext';

// // Types
// import type { InvoiceCustomer, Part } from '../../types/database';

// // Hooks
// import useCreateInvoice from './hooks/useCreateInvoice';

// // Components
// import MobilePartPicker from './components/MobilePartPicker';

// const { width: screenWidth } = Dimensions.get('window');

// type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer';

// export default function InvoiceNewScreen({ navigation }: any) {
//   const colors = useColors();
//   const { isDark } = useTheme();
//   const styles = createStyles(colors, isDark);
  
//   // Date picker state
//   const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
//   const {
//     // Loading states
//     isLoading,
//     isSaving,
    
//     // Data
//     availableParts,
//     shopDetails,
    
//     // Form data
//     customerData,
//     setCustomerData,
//     items,
//     date,
//     setDate,
//     status,
//     setStatus,
//     paymentMethod,
//     setPaymentMethod,
//     notes,
//     setNotes,
//     errors,
    
//     // Calculated values
//     subtotal,
//     total,
//     isSaveDisabled,
    
//     // Functions
//     loadInitialData,
//     handleDiscountChange,
//     handlePriceChange,
//     onSelectPart,
//     addItem,
//     removeItem,
//     handleSave,
//     updateItem,
    
//     // Constants
//     STATUS_OPTIONS,
//   } = useCreateInvoice();

//   // Load data on mount and focus
//   useEffect(() => {
//     loadInitialData(true);
//   }, [loadInitialData]);

//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       console.log('[InvoiceNewScreen] Screen focused');
//     });
//     return unsubscribe;
//   }, [navigation]);

//   // Get selected part IDs to prevent duplicates
//   const selectedPartIds = new Set(items.map(item => item.partId).filter(Boolean));
  
//   // FIXED: Improved quantity handling with proper validation
//   const handleQuantityChange = (itemId: string, value: string) => {
//     const item = items.find(i => i.id === itemId);
    
//     // Don't allow editing if no part selected
//     if (!item?.partId) {
//       return;
//     }
    
//     // Allow empty string and valid numbers during editing
//     if (value === '' || /^\d+$/.test(value)) {
//       const numValue = value === '' ? '' : parseInt(value, 10);
//       updateItem(itemId, { quantity: numValue as any });
//     }
//   };

//   // FIXED: Handle quantity blur to ensure minimum value
//   const handleQuantityBlur = (itemId: string) => {
//     const item = items.find(i => i.id === itemId);
//     if (!item?.partId) return;
    
//     const currentQuantity = item.quantity;
//     if (!currentQuantity || currentQuantity < 1) {
//       updateItem(itemId, { quantity: 1 });
//     }
//   };
  
//   // Auto-add new item when user starts editing the last item
//   const handleItemFieldChange = (itemId: string, field: string, value: any) => {
//     const itemIndex = items.findIndex(item => item.id === itemId);
//     const isLastItem = itemIndex === items.length - 1;
//     const isLastItemEmpty = items[items.length - 1] && 
//       !items[items.length - 1].partId && 
//       !items[items.length - 1].description;

//     // If user is editing the last item and it's currently empty, add a new item
//     if (isLastItem && isLastItemEmpty && field === 'partId') {
//       setTimeout(() => addItem(), 100);
//     }
//   };

//   // Phone number validation (10 digits only)
//   const handlePhoneChange = (phone: string) => {
//     const digitsOnly = phone.replace(/\D/g, '');
//     const limitedDigits = digitsOnly.slice(0, 10);
//     setCustomerData(prev => ({ ...prev, phone: limitedDigits }));
//   };

//   // Handle part selection with duplicate prevention
//   // const handlePartSelect = (itemId: string, part: any) => {
//   //   // Prevent selecting already selected parts (except current item's part)
//   //   const currentItem = items.find(item => item.id === itemId);
//   //   if (selectedPartIds.has(part.id) && currentItem?.partId !== part.id) {
//   //     return; // Don't allow duplicate selection
//   //   }
    
//   //   onSelectPart(itemId, part);
//   //   handleItemFieldChange(itemId, 'partId', part.id);
//   // };

//   // In InvoiceNewScreen.tsx
// const handlePartSelect = useCallback((itemId: string, part: Part) => {
//   console.log('🎯 Part Selected:', { itemId, part: part.name });
//   onSelectPart(itemId, part);
// }, [onSelectPart]);


//   // FIXED: Handle discount change only if part selected
//   const handleDiscountChangeWithValidation = (itemId: string, value: number) => {
//     const item = items.find(i => i.id === itemId);
//     if (!item?.partId) return;
    
//     handleDiscountChange(itemId, value);
//   };

//   // FIXED: Handle price change only if part selected
//   const handlePriceChangeWithValidation = (itemId: string, value: number) => {
//     const item = items.find(i => i.id === itemId);
//     if (!item?.partId) return;
    
//     handlePriceChange(itemId, value);
//   };

//   const onSave = async () => {
//     console.log('[InvoiceNewScreen] Generate button clicked');
//     const success = await handleSave();
//     if (success) {
//       console.log('[InvoiceNewScreen] Invoice saved successfully, navigating back');
//       navigation.goBack();
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={colors.foreground} />
//         <Text style={styles.loadingText}>Loading Invoice Data...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header Style matching DrawerHeader */}
//       <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
//         <View style={[styles.header, { borderBottomColor: colors.border }]}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backButton}
//             activeOpacity={0.7}
//           >
//             <FeatherIcon name="arrow-left" size={24} color={colors.foreground} />
//           </TouchableOpacity>
          
//           <View style={styles.titleContainer}>
//             <FeatherIcon name="file-plus" size={20} color={colors.primary} />
//             <Text style={[styles.title, { color: colors.foreground }]}>
//               New Invoice
//             </Text>
//           </View>
          
//           <View style={styles.rightSection} />
//         </View>
//       </SafeAreaView>

//       <KeyboardAvoidingView 
//         style={styles.keyboardView} 
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <ScrollView
//           style={styles.scrollContainer}
//           contentContainerStyle={styles.contentContainer}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//         >
//           {/* Shop Details Card */}
//           <View style={styles.card}>
//             <View style={styles.sectionHeader}>
//               <FeatherIcon name="building" size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
//               <Text style={styles.sectionTitle}>Bill From</Text>
//             </View>
//             <View style={styles.cardContent}>
//               <Text style={styles.shopName}>{shopDetails?.name || 'VS Auto'}</Text>
//               <Text style={styles.shopAddress}>{shopDetails?.address || 'Auto Parts Store'}</Text>
//             </View>
//           </View>

//           {/* Customer Details Card */}
//           <View style={styles.card}>
//             <View style={styles.sectionHeader}>
//               <FeatherIcon name="user" size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
//               <Text style={styles.sectionTitle}>Customer Details</Text>
//             </View>
//             <View style={styles.cardContent}>
//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Customer Name *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter customer name"
//                   placeholderTextColor={colors.mutedForeground}
//                   value={customerData.name}
//                   onChangeText={(name) => setCustomerData(prev => ({ ...prev, name }))}
//                 />
//               </View>

//               <View style={styles.inputRow}>
//                 <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
//                   <Text style={styles.inputLabel}>Phone (10 digits)</Text>
//                   <TextInput
//                     style={[
//                       styles.input,
//                       customerData.phone && customerData.phone.length !== 10 && styles.inputError
//                     ]}
//                     placeholder="1234567890"
//                     placeholderTextColor={colors.mutedForeground}
//                     keyboardType="numeric"
//                     maxLength={10}
//                     value={customerData.phone}
//                     onChangeText={handlePhoneChange}
//                   />
//                   {customerData.phone && customerData.phone.length !== 10 && (
//                     <Text style={styles.validationText}>Please enter exactly 10 digits</Text>
//                   )}
//                 </View>

//                 <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
//                   <Text style={styles.inputLabel}>Date</Text>
//                   <TouchableOpacity 
//                     style={styles.dateButton}
//                     onPress={() => setIsDatePickerOpen(true)}
//                     activeOpacity={0.7}
//                   >
//                     <FeatherIcon name="calendar" size={16} color={colors.mutedForeground} />
//                     <Text style={styles.dateText}>{format(date, 'MMM dd, yyyy')}</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Address</Text>
//                 <TextInput
//                   style={styles.textAreaInput}
//                   placeholder="Customer address"
//                   placeholderTextColor={colors.mutedForeground}
//                   value={customerData.address}
//                   onChangeText={(address) => setCustomerData(prev => ({ ...prev, address }))}
//                   multiline
//                   numberOfLines={3}
//                   textAlignVertical="top"
//                 />
//               </View>
//             </View>
//           </View>

//           {/* Invoice Items Card with Proper Input Validation */}
//           <View style={styles.card}>
//             <View style={styles.sectionHeader}>
//               <FeatherIcon name="file-text" size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
//               <Text style={styles.sectionTitle}>Invoice Items</Text>
//             </View>

//             <View style={styles.cardContent}>
//               {/* Horizontally Scrollable Table Container */}
//               <ScrollView 
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 style={styles.tableScrollContainer}
//                 contentContainerStyle={styles.tableScrollContent}
//               >
//                 <View style={styles.tableContainer}>
//                   {/* Table Header */}
//                   <View style={styles.tableHeader}>
//                     <Text style={[styles.tableHeaderText, styles.columnNumber]}>#</Text>
//                     <Text style={[styles.tableHeaderText, styles.columnPart]}>Part</Text>
//                     <Text style={[styles.tableHeaderText, styles.columnQty]}>Qty</Text>
//                     <Text style={[styles.tableHeaderText, styles.columnMRP]}>MRP</Text>
//                     <Text style={[styles.tableHeaderText, styles.columnDiscount]}>Disc%</Text>
//                     <Text style={[styles.tableHeaderText, styles.columnPrice]}>Price</Text>
//                     <Text style={[styles.tableHeaderText, styles.columnTotal]}>Total</Text>
//                     <View style={styles.columnAction} />
//                   </View>

//                   {/* Items List */}
//                   {items.map((item, idx) => {
//                     const error = errors.find(e => e.itemId === item.id);
//                     const isLastItem = idx === items.length - 1;
//                     const isEmpty = !item.partId && !item.description;
//                     const itemTotal = (item.quantity || 0) * (item.price || 0);
//                     const hasPartSelected = Boolean(item.partId);
                    
//                     return (
//                       <View key={item.id}>
//                         <View style={[
//                           styles.tableRow,
//                           isLastItem && isEmpty && styles.tableRowHint
//                         ]}>
//                           <Text style={[styles.tableRowNumber, styles.columnNumber]}>
//                             {idx + 1}
//                           </Text>
                          
//                           <View style={styles.columnPart}>
//                             <MobilePartPicker
//                               parts={availableParts.filter(part => 
//                                 !selectedPartIds.has(part.id) || part.id === item.partId
//                               )}
//                               selectedPartId={item.partId}
//                               onSelect={(part) => handlePartSelect(item.id, part)}
//                               disabled={isLoading}
//                               colors={colors}
//                             />
//                           </View>

//                           {/* FIXED: Quantity input - disabled if no part selected */}
//                           <View style={styles.columnQty}>
//                             <TextInput
//                               style={[
//                                 styles.tableInput,
//                                 !hasPartSelected && styles.tableInputDisabled
//                               ]}
//                               keyboardType="numeric"
//                               value={hasPartSelected ? (item.quantity?.toString() || "") : ""}
//                               onChangeText={v => handleQuantityChange(item.id, v)}
//                               onBlur={() => handleQuantityBlur(item.id)}
//                               placeholder={hasPartSelected ? "1" : ""}
//                               placeholderTextColor={colors.mutedForeground}
//                               editable={hasPartSelected}
//                               selectTextOnFocus={true}
//                             />
//                           </View>
                          
//                           <View style={styles.columnMRP}>
//                             <TextInput
//                               style={[styles.tableInput, styles.tableInputDisabled]}
//                               value={item.mrp?.toString() || ""}
//                               editable={false}
//                               placeholder="0"
//                               placeholderTextColor={colors.mutedForeground}
//                             />
//                           </View>
                          
//                           {/* FIXED: Discount input - disabled if no part selected */}
//                           <View style={styles.columnDiscount}>
//                             <TextInput
//                               style={[
//                                 styles.tableInput,
//                                 !hasPartSelected && styles.tableInputDisabled
//                               ]}
//                               keyboardType="numeric"
//                               value={hasPartSelected ? (item.discount?.toString() || "") : ""}
//                               onChangeText={v => handleDiscountChangeWithValidation(item.id, Number(v))}
//                               placeholder={hasPartSelected ? "0" : ""}
//                               placeholderTextColor={colors.mutedForeground}
//                               editable={hasPartSelected}
//                             />
//                           </View>
                          
//                           {/* FIXED: Price input - disabled if no part selected */}
//                           <View style={styles.columnPrice}>
//                             <TextInput
//                               style={[
//                                 styles.tableInput,
//                                 !hasPartSelected && styles.tableInputDisabled,
//                                 error && { borderColor: colors.destructive }
//                               ]}
//                               keyboardType="numeric"
//                               value={hasPartSelected ? (item.price?.toString() || "") : ""}
//                               onChangeText={v => handlePriceChangeWithValidation(item.id, Number(v))}
//                               placeholder={hasPartSelected ? "0" : ""}
//                               placeholderTextColor={colors.mutedForeground}
//                               editable={hasPartSelected}
//                             />
//                           </View>

//                           {/* Total Column - Non-editable */}
//                           <View style={styles.columnTotal}>
//                             <Text style={styles.totalCell}>
//                               ₹{itemTotal.toFixed(2)}
//                             </Text>
//                           </View>

//                           <View style={styles.columnAction}>
//                             {items.length > 1 && !isEmpty && (
//                               <TouchableOpacity 
//                                 onPress={() => removeItem(item.id)}
//                                 style={styles.removeItemButton}
//                                 activeOpacity={0.7}
//                               >
//                                 <FeatherIcon name="x" size={14} color={colors.destructive} />
//                               </TouchableOpacity>
//                             )}
//                           </View>
//                         </View>

//                         {error && (
//                           <View style={styles.errorRow}>
//                             <FeatherIcon name="alert-circle" size={12} color={colors.destructive} />
//                             <Text style={styles.errorText}>{error.message}</Text>
//                           </View>
//                         )}
//                       </View>
//                     );
//                   })}
//                 </View>
//               </ScrollView>
//             </View>
//           </View>

//           {/* Payment Status Card */}
//           <View style={styles.card}>
//             <View style={styles.sectionHeader}>
//               <FeatherIcon name="credit-card" size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
//               <Text style={styles.sectionTitle}>Payment Status</Text>
//             </View>
//             <View style={styles.cardContent}>
//               <View style={styles.chipContainer}>
//                 {STATUS_OPTIONS.map(option => (
//                   <TouchableOpacity
//                     key={option}
//                     style={[
//                       styles.chip,
//                       { 
//                         backgroundColor: status === option ? colors.foreground : colors.background,
//                         borderColor: status === option ? colors.foreground : colors.border,
//                       }
//                     ]}
//                     onPress={() => setStatus(option)}
//                     activeOpacity={0.7}
//                   >
//                     <Text style={[
//                       styles.chipText,
//                       { color: status === option ? colors.background : colors.foreground }
//                     ]}>
//                       {option}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               {status === "Paid" && (
//                 <View style={styles.paymentMethodSection}>
//                   <Text style={styles.inputLabel}>Payment Method</Text>
//                   <View style={styles.chipContainer}>
//                     {(['Cash', 'UPI', 'Bank Transfer'] as PaymentMethod[]).map(method => (
//                       <TouchableOpacity
//                         key={method}
//                         style={[
//                           styles.chip,
//                           {
//                             backgroundColor: paymentMethod === method ? colors.foreground : colors.background,
//                             borderColor: paymentMethod === method ? colors.foreground : colors.border,
//                           }
//                         ]}
//                         onPress={() => setPaymentMethod(method)}
//                         activeOpacity={0.7}
//                       >
//                         <Text style={[
//                           styles.chipText,
//                           { color: paymentMethod === method ? colors.background : colors.foreground }
//                         ]}>
//                           {method}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </View>
//               )}
//             </View>
//           </View>

//           {/* Notes Card */}
//           <View style={styles.card}>
//             <View style={styles.sectionHeader}>
//               <FeatherIcon name="edit-3" size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
//               <Text style={styles.sectionTitle}>Notes (Optional)</Text>
//             </View>
//             <View style={styles.cardContent}>
//               <TextInput
//                 multiline
//                 numberOfLines={4}
//                 value={notes}
//                 onChangeText={setNotes}
//                 style={styles.notesInput}
//                 placeholder="Add invoice notes, warranty information, terms..."
//                 placeholderTextColor={colors.mutedForeground}
//                 textAlignVertical="top"
//               />
//             </View>
//           </View>
//         </ScrollView>

//         {/* FIXED: Restored proper bottom spacing for footer */}
//         <View style={styles.totalFooter}>
//           <View style={styles.totalContainer}>
//             <View style={styles.totalRow}>
//               <Text style={styles.subtotalLabel}>Subtotal (MRP):</Text>
//               <Text style={styles.subtotalValue}>₹{subtotal.toLocaleString()}</Text>
//             </View>
//             <View style={styles.grandTotalRow}>
//               <Text style={styles.grandTotalLabel}>Total Amount:</Text>
//               <Text style={styles.grandTotalValue}>₹{total.toLocaleString()}</Text>
//             </View>
//           </View>
          
//           <TouchableOpacity
//             onPress={onSave}
//             disabled={isSaveDisabled}
//             style={[
//               styles.generateButton,
//               { opacity: isSaveDisabled ? 0.5 : 1 }
//             ]}
//             activeOpacity={0.7}
//           >
//             {isSaving && (
//               <ActivityIndicator 
//                 size="small" 
//                 color={colors.background} 
//                 style={styles.buttonLoader} 
//               />
//             )}
//             <FeatherIcon name="save" size={18} color={colors.background} />
//             <Text style={styles.generateButtonText}>
//               {isSaving ? "Generating..." : "Generate Invoice"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>

//       {/* Date Picker Modal */}
//       <DatePicker
//         modal
//         open={isDatePickerOpen}
//         date={date}
//         mode="date"
//         onConfirm={(selectedDate) => {
//           setIsDatePickerOpen(false);
//           setDate(selectedDate);
//         }}
//         onCancel={() => {
//           setIsDatePickerOpen(false);
//         }}
//       />
//     </View>
//   );
// }




// const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: colors.background 
//   },
  
//   // Header Style matching DrawerHeader
//   safeArea: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   header: {
//     height: 56,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   backButton: {
//     padding: 8,
//   },
//   titleContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   rightSection: {
//     width: 40,
//   },
  
//   keyboardView: { 
//     flex: 1 
//   },
//   scrollContainer: { 
//     flex: 1 
//   },
//   contentContainer: { 
//     padding: 20,
//     paddingBottom: 20,
//   },
//   loadingContainer: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     backgroundColor: colors.background 
//   },
//   loadingText: { 
//     color: colors.foreground, 
//     marginTop: 16,
//   },
  
//   // Card styles
//   card: {
//     backgroundColor: colors.card,
//     borderRadius: 12,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: colors.border,
//     overflow: 'hidden',
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//   },
//   sectionIcon: {
//     marginRight: 12,
//   },
//   sectionTitle: {
//     color: colors.foreground,
//     fontWeight: '600',
//     flex: 1,
//   },
//   cardContent: {
//     padding: 20,
//   },
  
//   // Shop details
//   shopName: {
//     color: colors.foreground,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   shopAddress: {
//     color: colors.mutedForeground,
//     lineHeight: 20,
//   },
  
//   // Input styles
//   inputGroup: {
//     marginBottom: 16,
//   },
//   inputRow: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   inputLabel: {
//     color: colors.foreground,
//     fontWeight: '500',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     backgroundColor: colors.background,
//     color: colors.foreground,
//   },
//   inputError: {
//     borderColor: colors.destructive,
//   },
//   validationText: {
//     color: colors.destructive,
//     marginTop: 4,
//   },
//   textAreaInput: {
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     backgroundColor: colors.background,
//     color: colors.foreground,
//     minHeight: 80,
//   },
//   dateButton: {
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     backgroundColor: colors.background,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   dateText: {
//     color: colors.foreground,
//     marginLeft: 8,
//     fontWeight: '500',
//   },
  
//   // Chip styles
//   chipContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginBottom: 16,
//   },
//   chip: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//   },
//   chipText: {
//     fontWeight: '500',
//   },
//   paymentMethodSection: {
//     marginTop: 8,
//   },
  
//   // Horizontal scrollable table styles
//   tableScrollContainer: {
//     marginBottom: 16,
//   },
//   tableScrollContent: {
//     paddingRight: 20,
//   },
//   tableContainer: {
//     minWidth: screenWidth + 190,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     paddingVertical: 12,
//     backgroundColor: colors.muted,
//     borderRadius: 8,
//     marginBottom: 8,
//     alignItems: 'center',
//   },
//   tableHeaderText: {
//     fontWeight: '600',
//     color: colors.foreground,
//     textAlign: 'center',
//     paddingHorizontal: 4,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     alignItems: 'center',
//     minHeight: 60,
//   },
//   tableRowHint: {
//     backgroundColor: colors.muted,
//     borderRadius: 8,
//     borderBottomWidth: 0,
//     marginBottom: 8,
//   },
//   tableRowNumber: {
//     color: colors.foreground,
//     fontWeight: '500',
//     textAlign: 'center',
//     paddingHorizontal: 4,
//   },
//   tableInput: {
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//     backgroundColor: colors.background,
//     color: colors.foreground,
//     textAlign: 'center',
//   },
//   tableInputDisabled: {
//     backgroundColor: colors.muted,
//     color: colors.mutedForeground,
//   },
  
//   // Column width styles
//   columnNumber: {
//     width: 40,
//     minWidth: 40,
//   },
//   columnPart: {
//     width: 180,
//     minWidth: 180,
//     marginHorizontal: 4,
//   },
//   columnQty: {
//     width: 60,
//     minWidth: 60,
//     marginHorizontal: 4,
//   },
//   columnMRP: {
//     width: 70,
//     minWidth: 70,
//     marginHorizontal: 4,
//   },
//   columnDiscount: {
//     width: 60,
//     minWidth: 60,
//     marginHorizontal: 4,
//   },
//   columnPrice: {
//     width: 80,
//     minWidth: 80,
//     marginHorizontal: 4,
//   },
//   columnTotal: {
//     width: 90,
//     minWidth: 90,
//     marginHorizontal: 4,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   totalCell: {
//     color: colors.foreground,
//     fontWeight: '600',
//     textAlign: 'center',
//     paddingHorizontal: 4,
//     paddingVertical: 8,
//   },
//   columnAction: {
//     width: 40,
//     minWidth: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
  
//   removeItemButton: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: colors.background,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   errorRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     backgroundColor: colors.muted,
//     borderRadius: 4,
//     marginBottom: 4,
//   },
//   errorText: {
//     color: colors.destructive,
//     marginLeft: 6,
//   },
  
//   // Notes input
//   notesInput: {
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     backgroundColor: colors.background,
//     color: colors.foreground,
//     minHeight: 100,
//   },
  
//   // Fixed footer styles with proper spacing
//   totalFooter: {
//     backgroundColor: colors.card,
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   totalContainer: {
//     marginBottom: 16,
//   },
//   totalRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   subtotalLabel: {
//     color: colors.mutedForeground,
//     fontWeight: '500',
//   },
//   subtotalValue: {
//     color: colors.foreground,
//     fontWeight: '600',
//   },
//   grandTotalRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 12,
//     backgroundColor: colors.muted,
//     borderRadius: 8,
//     borderWidth: 2,
//     borderColor: colors.foreground,
//     marginTop: 8,
//   },
//   grandTotalLabel: {
//     color: colors.foreground,
//     fontWeight: '700',
//   },
//   grandTotalValue: {
//     color: colors.foreground,
//     fontWeight: '800',
//   },
//   generateButton: {
//     backgroundColor: colors.foreground,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//     borderRadius: 8,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   buttonLoader: {
//     marginRight: 8,
//   },
//   generateButtonText: {
//     color: colors.background,
//     fontWeight: '700',
//     marginLeft: 8,
//   },
// });
