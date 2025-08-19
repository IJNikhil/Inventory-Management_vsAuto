import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { Part, Supplier } from '../types/database';
import { supplierService } from '../services/supplier-service';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Partial<Omit<Part, 'id' | 'created_at' | 'updated_at' | 'version'>>) => void;
  part?: Part;
  supplier?: Supplier | null;
  isAddNew?: boolean;
};

export default function PartDialog({
  visible,
  onClose,
  onSave,
  part,
  supplier,
  isAddNew = false,
}: Props) {
  const [name, setName] = useState(part?.name ?? '');
  const [part_number, setPartNumber] = useState(part?.part_number ?? '');
  const [purchase_price, setPurchasePrice] = useState(part?.purchase_price || 0);
  const [mrp, setMrp] = useState(part?.mrp || 0);
  const [selling_price, setSellingPrice] = useState(part?.selling_price || 0);
  const [discount, setDiscount] = useState(0);
  const [supplier_id, setSupplierId] = useState(part?.supplier_id ?? supplier?.id ?? '');
  const [supplierName, setSupplierName] = useState(supplier?.name ?? '');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAddNew) {
      loadSuppliers();
    }
  }, [isAddNew]);

  useEffect(() => {
    if (part?.mrp && part.selling_price) {
      const calculated = ((part.mrp - part.selling_price) / part.mrp) * 100;
      setDiscount(Number(calculated.toFixed(2)));
    }
  }, [part]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const suppliersList = await supplierService.findAll();
      setSuppliers(suppliersList);
      setError(null);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
      setError('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (): boolean => {
    if (!name.trim()) {
      setError('Part name is required');
      return false;
    }
    if (!supplier_id) {
      setError('Please select a supplier');
      return false;
    }
    if (purchase_price <= 0) {
      setError('Purchase price must be greater than 0');
      return false;
    }
    if (mrp <= 0) {
      setError('MRP must be greater than 0');
      return false;
    }
    if (selling_price <= 0) {
      setError('Selling price must be greater than 0');
      return false;
    }
    if (selling_price > mrp) {
      setError('Selling price cannot be greater than MRP');
      return false;
    }
    
    const minPrice = purchase_price * 1.1; // Minimum 10% profit margin
    if (selling_price < minPrice) {
      setError(`Selling price should be at least ₹${minPrice.toFixed(2)} (10% above purchase price)`);
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleMRPChange = (value: string) => {
    const mrpValue = parseFloat(value) || 0;
    setMrp(mrpValue);
    
    // Auto-calculate selling price if discount is set
    if (discount > 0 && mrpValue > 0) {
      const newSellingPrice = mrpValue * (1 - discount / 100);
      setSellingPrice(Number(newSellingPrice.toFixed(2)));
    }
  };

  const handleDiscountChange = (value: string) => {
    const discountValue = parseFloat(value) || 0;
    
    if (discountValue > 100) {
      setError('Discount cannot be more than 100%');
      return;
    }
    
    setDiscount(discountValue);
    
    if (mrp > 0 && discountValue >= 0) {
      const newSellingPrice = mrp * (1 - discountValue / 100);
      setSellingPrice(Number(newSellingPrice.toFixed(2)));
    }
  };

  const handleSellingPriceChange = (value: string) => {
    const sellingValue = parseFloat(value) || 0;
    setSellingPrice(sellingValue);
    
    // Auto-calculate discount
    if (mrp > 0 && sellingValue <= mrp) {
      const newDiscount = ((mrp - sellingValue) / mrp) * 100;
      setDiscount(Number(newDiscount.toFixed(2)));
    }
  };

  const handleSupplierSelect = (selectedSupplier: Supplier) => {
    setSupplierId(selectedSupplier.id);
    setSupplierName(selectedSupplier.name);
  };

  const handleSave = () => {
    if (!validateInput()) return;

    // ✅ FIXED: Removed low_stock_threshold property that doesn't exist in Part type
    onSave({
      name: name.trim(),
      part_number: part_number.trim(),
      purchase_price,
      mrp,
      selling_price,
      supplier_id,
      quantity: part?.quantity || 0, // Keep existing quantity or default to 0
      status: 'active',
    });
    
    onClose();
  };

  const resetForm = () => {
    setName('');
    setPartNumber('');
    setPurchasePrice(0);
    setMrp(0);
    setSellingPrice(0);
    setDiscount(0);
    setSupplierId('');
    setSupplierName('');
    setError(null);
  };

  const handleClose = () => {
    if (isAddNew) {
      resetForm();
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.dialog}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>
              {isAddNew ? 'Add New Part' : 'Edit Part'}
            </Text>

            {/* Part Name */}
            <Text style={styles.label}>Part Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter part name"
              maxLength={100}
              autoCapitalize="words"
            />

            {/* Part Number */}
            <Text style={styles.label}>Part Number</Text>
            <TextInput
              style={styles.input}
              value={part_number}
              onChangeText={setPartNumber}
              placeholder="Enter part number (optional)"
              maxLength={50}
              autoCapitalize="characters"
            />

            {/* Supplier Selection */}
            {isAddNew && (
              <>
                <Text style={styles.label}>Supplier *</Text>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading suppliers...</Text>
                  </View>
                ) : suppliers.length > 0 ? (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.supplierContainer}
                  >
                    {suppliers.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        onPress={() => handleSupplierSelect(s)}
                        style={[
                          styles.supplierButton,
                          supplier_id === s.id ? styles.supplierButtonActive : styles.supplierButtonInactive,
                        ]}
                      >
                        <Text 
                          style={[
                            styles.supplierButtonText,
                            supplier_id === s.id ? styles.supplierButtonTextActive : styles.supplierButtonTextInactive,
                          ]}
                          numberOfLines={1}
                        >
                          {s.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.noSuppliersContainer}>
                    <Text style={styles.noSuppliersText}>No suppliers found. Please add suppliers first.</Text>
                  </View>
                )}
              </>
            )}

            {/* Purchase Price */}
            <Text style={styles.label}>Purchase Price *</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={purchase_price > 0 ? purchase_price.toString() : ''}
              onChangeText={(v) => setPurchasePrice(parseFloat(v) || 0)}
              placeholder="0.00"
            />

            {/* MRP */}
            <Text style={styles.label}>MRP *</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={mrp > 0 ? mrp.toString() : ''}
              onChangeText={handleMRPChange}
              placeholder="0.00"
            />

            {/* Discount */}
            <Text style={styles.label}>Discount (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={discount > 0 ? discount.toString() : ''}
              onChangeText={handleDiscountChange}
              placeholder="0"
            />

            {/* Selling Price */}
            <Text style={styles.label}>Selling Price *</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={selling_price > 0 ? selling_price.toString() : ''}
              onChangeText={handleSellingPriceChange}
              placeholder="0.00"
            />

            {/* Error Message */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Profit Margin Info */}
            {purchase_price > 0 && selling_price > 0 && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Profit Margin: ₹{(selling_price - purchase_price).toFixed(2)} 
                  ({(((selling_price - purchase_price) / purchase_price) * 100).toFixed(1)}%)
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSave} 
                style={[
                  styles.saveButton,
                  (!name || !supplier_id || purchase_price <= 0 || selling_price <= 0 || mrp <= 0 || loading) && styles.saveButtonDisabled
                ]}
                disabled={!name || !supplier_id || purchase_price <= 0 || selling_price <= 0 || mrp <= 0 || loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Loading...' : 'Save Part'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
    maxWidth: 400,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    marginBottom: 4,
  },
  supplierContainer: {
    marginBottom: 8,
  },
  supplierButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    maxWidth: 120,
  },
  supplierButtonActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  supplierButtonInactive: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  supplierButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  supplierButtonTextActive: {
    color: '#ffffff',
  },
  supplierButtonTextInactive: {
    color: '#374151',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 8,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  noSuppliersContainer: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  noSuppliersText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  infoText: {
    color: '#065f46',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
