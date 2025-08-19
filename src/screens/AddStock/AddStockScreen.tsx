// src/screens/AddStock/AddStockScreen.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useToast } from '../../hooks/use-toast';
import { useAppSelector } from '../../lib/redux/hooks';
import { selectAuth } from '../../lib/redux/slices/auth-slice';
import { useColors, useTheme } from '../../context/ThemeContext';
import { useStockData } from './hooks/useStockData';
import { useStockPurchase } from './hooks/useStockPurchase';
import type { StockPurchaseItemCreate, Supplier, Part } from '../../types/database';

interface FormData {
  date: Date;
  status: 'Pending' | 'Paid';
  payment_method: 'Cash' | 'UPI' | 'Bank Transfer';
  notes: string;
}

// ✅ FIXED: Use creation type for items
const INITIAL_ITEM: StockPurchaseItemCreate = {
  id: `item-${Date.now()}`,
  name: '',
  part_number: '',
  quantity: 1,
  purchase_price: 0,
  mrp: 0,
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 100,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.foreground,
      marginBottom: 10,
    },
    supplierButton: {
      paddingHorizontal: 12,
      paddingVertical: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    supplierButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.muted,
    },
    supplierContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    supplierInfo: {
      flex: 1,
    },
    supplierName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foreground,
      marginBottom: 3,
    },
    supplierDetails: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    supplierPlaceholder: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    supplierPlaceholderText: {
      fontSize: 14,
      color: colors.mutedForeground,
      flex: 1,
    },
    formGroup: {
      marginBottom: 14,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.foreground,
      marginBottom: 6,
    },
    input: {
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      fontSize: 13,
      color: colors.foreground,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    dateText: {
      fontSize: 13,
      color: colors.foreground,
      flex: 1,
      marginLeft: 6,
    },
    optionsRow: {
      flexDirection: 'row',
      gap: 6,
    },
    optionButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    optionButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.foreground,
    },
    optionButtonTextActive: {
      color: colors.primaryForeground,
    },
    paymentRow: {
      flexDirection: 'row',
      gap: 6,
    },
    paymentButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    paymentButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    paymentButtonText: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.foreground,
      marginTop: 2,
    },
    paymentButtonTextActive: {
      color: colors.primaryForeground,
    },
    itemsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    addItemButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.muted,
      gap: 4,
    },
    addItemButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.foreground,
    },
    itemRow: {
      padding: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      marginBottom: 10,
    },
    itemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    itemNumber: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.foreground,
    },
    removeButton: {
      padding: 4,
      borderRadius: 4,
      backgroundColor: colors.muted,
    },
    partButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      marginBottom: 10,
    },
    partButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.muted,
    },
    partText: {
      fontSize: 13,
      color: colors.foreground,
      flex: 1,
    },
    partPlaceholder: {
      fontSize: 13,
      color: colors.mutedForeground,
      flex: 1,
    },
    formRow: {
      flexDirection: 'row',
      gap: 10,
    },
    formHalf: {
      flex: 1,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 16,
      borderRadius: 6,
      backgroundColor: colors.muted,
      marginTop: 16,
    },
    totalLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foreground,
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    notesInput: {
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      fontSize: 13,
      color: colors.foreground,
      minHeight: 70,
      textAlignVertical: 'top',
    },
    saveContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingVertical: 10,
      paddingBottom: Platform.OS === 'ios' ? 24 : 14,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
      gap: 5,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primaryForeground,
    },
    modal: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.foreground,
    },
    modalCloseButton: {
      padding: 8,
    },
    modalItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalItemTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.foreground,
    },
    modalItemDetails: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 32,
    },
    emptyStateText: {
      fontSize: 15,
      color: colors.mutedForeground,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.foreground,
      marginTop: 8,
    },
  });

export default function AddStockScreen({ navigation }: any) {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const { toast } = useToast();
  const colors = useColors();
  const { isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  
  const { availableParts, availableSuppliers, isLoading, error, refresh } = useStockData();
  const { handleSubmit, isSaving } = useStockPurchase();
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  // ✅ FIXED: Use creation type for items state
  const [items, setItems] = useState<StockPurchaseItemCreate[]>([{ ...INITIAL_ITEM }]);
  const [formData, setFormData] = useState<FormData>({
    date: new Date(),
    status: 'Pending',
    payment_method: 'Cash',
    notes: '',
  });
  
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fadeAnim = useSharedValue(0);
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 200 });
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: fadeAnim.value }));

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.purchase_price || 0) * item.quantity, 0);
  }, [items]);

  const filteredPartsForSupplier = useMemo(() => {
    return supplier ? availableParts.filter(p => p.supplier_id === supplier.id) : [];
  }, [supplier, availableParts]);

  const handleSupplierSelect = useCallback((selectedSupplier: Supplier) => {
    setSupplier(selectedSupplier);
    setItems([{ ...INITIAL_ITEM, id: `item-${Date.now()}` }]);
    setShowSupplierModal(false);
  }, []);

  const handlePartSelect = useCallback(
    (part: Part) => {
      if (selectedItemId) {
        setItems(prev => 
          prev.map(item => 
            item.id === selectedItemId
              ? {
                  ...item,
                  part_id: part.id,
                  name: part.name,
                  part_number: part.part_number || '',
                  purchase_price: part.purchase_price || 0,
                  mrp: part.mrp || 0,
                }
              : item
          )
        );
        setSelectedItemId(null);
        setShowPartModal(false);
      }
    },
    [selectedItemId]
  );

  // ✅ FIXED: Use creation type for callback
  const handleItemUpdate = useCallback((id: string, field: keyof StockPurchaseItemCreate, value: any) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  }, []);

  const handleAddItem = useCallback(() => {
    setItems(prev => [...prev, { ...INITIAL_ITEM, id: `item-${Date.now()}` }]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems(prev => (prev.length > 1 ? prev.filter(item => item.id !== id) : prev));
  }, []);

  const handleDateChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  }, []);

  const handleSubmitPurchase = useCallback(async () => {
    if (!supplier) {
      toast({ title: 'Supplier Required', description: 'Please select a supplier.', variant: 'destructive' });
      return;
    }
    if (items.some(i => !i.name || i.quantity <= 0 || i.purchase_price <= 0)) {
      toast({ title: 'Invalid Items', description: 'Please fill all item details correctly.', variant: 'destructive' });
      return;
    }
    
    const success = await handleSubmit({
      supplier: {
        id: supplier.id,
        name: supplier.name,
        contact_person: supplier.contact_person,
        phone: supplier.phone,
        address: supplier.address,
      },
      items,
      total,
      formData,
      user: 'Shop Owner',
    });
    
    if (success) {
      navigation.navigate('Inventory');
    }
  }, [supplier, items, total, formData, handleSubmit, navigation, toast]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading suppliers and parts...</Text>
      </View>
    );
  }

  if (!isLoading && (availableSuppliers.length === 0 || availableParts.length === 0)) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No suppliers or parts available to add purchase.</Text>
        <TouchableOpacity onPress={refresh} style={[styles.addItemButton, { alignSelf: 'center' }]}>
          <FeatherIcon name="refresh-ccw" size={20} color={colors.primary} />
          <Text style={[styles.addItemButtonText, { marginLeft: 8 }]}>Try Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Reanimated.View style={[styles.contentContainer, animatedStyle]}>
          {/* Supplier Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supplier</Text>
            <TouchableOpacity
              style={[styles.supplierButton, supplier && styles.supplierButtonSelected]}
              onPress={() => setShowSupplierModal(true)}
              activeOpacity={0.7}
            >
              {supplier ? (
                <View style={styles.supplierContent}>
                  <View style={styles.supplierInfo}>
                    <Text style={styles.supplierName}>{supplier.name}</Text>
                    <Text style={styles.supplierDetails}>
                      Contact: {supplier.contact_person ?? '-'} • Phone: {supplier.phone ?? '-'}
                    </Text>
                  </View>
                  <FeatherIcon name="chevron-right" size={16} color={colors.mutedForeground} />
                </View>
              ) : (
                <View style={styles.supplierPlaceholder}>
                  <Text style={styles.supplierPlaceholderText}>Select supplier</Text>
                  <FeatherIcon name="chevron-down" size={14} color={colors.mutedForeground} />
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Purchase Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Purchase Details</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Date</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <FeatherIcon name="calendar" size={14} color={colors.primary} />
                <Text style={styles.dateText}>{format(formData.date, 'dd/MM/yyyy')}</Text>
                <FeatherIcon name="chevron-down" size={12} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.optionsRow}>
                {(['Pending', 'Paid'] as const).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.optionButton, formData.status === status && styles.optionButtonActive]}
                    onPress={() => setFormData(f => ({ ...f, status }))}
                  >
                    <Text style={[styles.optionButtonText, formData.status === status && styles.optionButtonTextActive]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {formData.status === 'Paid' && (
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Payment Method</Text>
                <View style={styles.paymentRow}>
                  {(['Cash', 'UPI', 'Bank Transfer'] as const).map(method => (
                    <TouchableOpacity
                      key={method}
                      style={[styles.paymentButton, formData.payment_method === method && styles.paymentButtonActive]}
                      onPress={() => setFormData(f => ({ ...f, payment_method: method }))}
                    >
                      <FeatherIcon
                        name="credit-card"
                        size={10}
                        color={formData.payment_method === method ? colors.primaryForeground : colors.foreground}
                      />
                      <Text style={[styles.paymentButtonText, formData.payment_method === method && styles.paymentButtonTextActive]}>
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
          
          {/* Items */}
          <View style={styles.section}>
            <View style={styles.itemsHeader}>
              <Text style={styles.sectionTitle}>Items</Text>
              <TouchableOpacity onPress={handleAddItem} style={styles.addItemButton} disabled={!supplier} activeOpacity={0.7}>
                <FeatherIcon name="plus" size={12} color={colors.foreground} />
                <Text style={styles.addItemButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {items.map((item, index) => {
              const selectedPart = filteredPartsForSupplier.find(p => p.id === item.part_id);
              return (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemNumber}>Item {index + 1}</Text>
                    {items.length > 1 && (
                      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item.id)}>
                        <FeatherIcon name="trash-2" size={12} color={colors.destructive} />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>Part</Text>
                    <TouchableOpacity
                      style={[styles.partButton, selectedPart && styles.partButtonSelected]}
                      onPress={() => {
                        setSelectedItemId(item.id);
                        setShowPartModal(true);
                      }}
                      disabled={!supplier}
                    >
                      {selectedPart ? (
                        <Text style={styles.partText}>{selectedPart.name}</Text>
                      ) : (
                        <Text style={styles.partPlaceholder}>{supplier ? 'Select part' : 'Select supplier first'}</Text>
                      )}
                      <FeatherIcon name="chevron-down" size={12} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>Part Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter part number"
                      value={item.part_number || ''}
                      onChangeText={v => handleItemUpdate(item.id, 'part_number', v)}
                      placeholderTextColor={colors.mutedForeground}
                    />
                  </View>
                  
                  <View style={styles.formRow}>
                    <View style={styles.formHalf}>
                      <Text style={styles.fieldLabel}>Quantity</Text>
                      <TextInput
                        keyboardType="numeric"
                        style={styles.input}
                        value={item.quantity.toString()}
                        onChangeText={v => handleItemUpdate(item.id, 'quantity', Number(v) || 1)}
                        placeholder="Quantity"
                      />
                    </View>
                    <View style={styles.formHalf}>
                      <Text style={styles.fieldLabel}>Purchase Price</Text>
                      <TextInput
                        keyboardType="numeric"
                        style={styles.input}
                        value={item.purchase_price.toString()}
                        onChangeText={v => handleItemUpdate(item.id, 'purchase_price', Number(v) || 0)}
                        placeholder="Price"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>MRP</Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.input}
                      value={item.mrp.toString()}
                      onChangeText={v => handleItemUpdate(item.id, 'mrp', Number(v) || 0)}
                      placeholder="MRP"
                    />
                  </View>
                </View>
              );
            })}
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>₹{total.toLocaleString('en-IN')}</Text>
            </View>
          </View>
          
          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="Notes (optional)"
              placeholderTextColor={colors.mutedForeground}
              style={styles.notesInput}
              value={formData.notes}
              onChangeText={notes => setFormData(f => ({ ...f, notes }))}
            />
          </View>
        </Reanimated.View>
      </ScrollView>
      
      {/* Save Button */}
      <View style={styles.saveContainer}>
        <TouchableOpacity
          style={[styles.saveButton, (isSaving || !supplier) && styles.saveButtonDisabled]}
          onPress={handleSubmitPurchase}
          disabled={isSaving || !supplier}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <>
              <FeatherIcon name="save" size={18} color={colors.primaryForeground} />
              <Text style={styles.saveButtonText}>Save Purchase</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Supplier Modal */}
      <Modal 
        visible={showSupplierModal} 
        animationType="slide" 
        presentationStyle="pageSheet" 
        onRequestClose={() => setShowSupplierModal(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Supplier</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowSupplierModal(false)}>
              <FeatherIcon name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={availableSuppliers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => handleSupplierSelect(item)}>
                <Text style={styles.modalItemTitle}>{item.name}</Text>
                <Text style={styles.modalItemDetails}>Contact: {item.contact_person ?? '-'}</Text>
                <Text style={styles.modalItemDetails}>Phone: {item.phone ?? '-'}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No suppliers available.</Text>
                <TouchableOpacity onPress={refresh} style={[styles.addItemButton, { alignSelf: 'center' }]}>
                  <FeatherIcon name="refresh-ccw" size={24} color={colors.primary} />
                  <Text style={[styles.addItemButtonText, { marginLeft: 8 }]}>Refresh</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </Modal>
      
      {/* Part Modal */}
      <Modal 
        visible={showPartModal} 
        animationType="slide" 
        presentationStyle="pageSheet" 
        onRequestClose={() => setShowPartModal(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Part</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowPartModal(false)}>
              <FeatherIcon name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredPartsForSupplier}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => handlePartSelect(item)}>
                <Text style={styles.modalItemTitle}>{item.name}</Text>
                <Text style={styles.modalItemDetails}>
                  {item.part_number ?? '-'} • Stock: {item.quantity}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No parts available for selected supplier.</Text>
              </View>
            }
          />
        </View>
      </Modal>
      
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}
