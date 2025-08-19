import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';
import StockBadge from './StockBadge';

// ✅ ADDED: Safe formatting utility functions
const formatCurrency = (value: any, decimals: number = 2): string => {
  // Handle undefined, null, or non-numeric values
  if (value === undefined || value === null || value === '') {
    return '0.00';
  }
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue) || !isFinite(numValue)) {
    return '0.00';
  }
  
  return numValue.toFixed(decimals);
};

const formatNumber = (value: any, decimals: number = 0): string => {
  if (value === undefined || value === null || value === '') {
    return '0';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return '0';
  }
  
  return decimals > 0 ? numValue.toFixed(decimals) : Math.round(numValue).toString();
};

// ✅ ADDED: Safe property accessor
const safeGet = (obj: any, key: string, fallback: any = '') => {
  return obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : fallback;
};

export default function PartRow({ part, onActions, colors }: any) {
  // ✅ ADDED: Safe property extraction with fallbacks
  const partName = safeGet(part, 'name') || safeGet(part, 'part_name', 'Unknown Part');
  const partNumber = safeGet(part, 'partNumber') || safeGet(part, 'part_number', 'N/A');
  const supplierName = safeGet(part, 'supplierName') || safeGet(part, 'supplier_name', 'Unknown Supplier');
  const sellingPrice = safeGet(part, 'sellingPrice') || safeGet(part, 'selling_price', 0);
  const quantity = safeGet(part, 'quantity', 0);
  const minStockLevel = safeGet(part, 'min_stock_level') || safeGet(part, 'minStockLevel', 10);
  const status = safeGet(part, 'status', 'active');

  // ✅ ADDED: Safe stock status calculation
  const isLowStock = (typeof quantity === 'number' && typeof minStockLevel === 'number') 
    ? quantity > 0 && quantity <= minStockLevel 
    : safeGet(part, 'isLowStock', false);

  const getStockBadge = () => {
    if (status === 'deleted' || status === 'inactive') return <StockBadge color="gray" text="Inactive" colors={colors} />
    if (quantity === 0) return <StockBadge color="red" text="Out of Stock" colors={colors} />
    if (isLowStock) return <StockBadge color="amber" text="Low Stock" colors={colors} />
    return <StockBadge color="green" text="In Stock" colors={colors} />
  }

  return (
    <TouchableOpacity style={[styles.partRow, { backgroundColor: colors.card }]} onPress={onActions} activeOpacity={0.8}>
      <View style={styles.partRowHeader}>
        <View style={styles.partInfo}>
          <Text style={[styles.partName, { color: colors.foreground }]} numberOfLines={1}>
            {partName}
          </Text>
          <Text style={[styles.partNumber, { color: colors.mutedForeground }]} numberOfLines={1}>
            {partNumber}
          </Text>
          <Text style={[styles.partSupplier, { color: colors.mutedForeground }]} numberOfLines={1}>
            {supplierName}
          </Text>
        </View>
        <MoreHorizontal size={20} color={colors.mutedForeground} />
      </View>
      <View style={styles.partRowFooter}>
        <View style={styles.priceSection}>
          {/* ✅ FIXED: Use safe currency formatting */}
          <Text style={[styles.partPrice, { color: colors.foreground }]}>
            ₹{formatCurrency(sellingPrice)}
          </Text>
          {status === 'active' && (
            <Text style={[styles.qtyBadge, { color: colors.primary, borderColor: colors.primary, backgroundColor: colors.primaryBackground }]}>
              Qty: {formatNumber(quantity)}
            </Text>
          )}
        </View>
        {getStockBadge()}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  partRow: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  partRowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  partInfo: {
    flex: 1,
    marginRight: 12,
  },
  partName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  partNumber: {
    fontSize: 13,
    marginBottom: 2,
  },
  partSupplier: {
    fontSize: 13,
  },
  partRowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partPrice: {
    fontWeight: '600',
    fontSize: 16,
  },
  qtyBadge: {
    fontSize: 11,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
