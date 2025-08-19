import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { SortKey, SortDirection } from '../hooks/useInventory';

export default function InventoryTableHeader({ sortConfig, setSortConfig, setCurrentPage, colors }: any) {
  const headerSort = (key: SortKey, label: string) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';

    return (
      <TouchableOpacity
        onPress={() => {
          setSortConfig({ key, direction });
          setCurrentPage(1);
        }}
        style={styles.sortHeader}
        activeOpacity={0.7}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{label}</Text>
        {sortConfig?.key === key && (
          <Text style={[styles.headerArrow, { color: colors.primary }]}>
            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
      <View style={styles.headerPart}>{headerSort('name', 'Part')}</View>
      <View style={styles.headerPartNumber}>{headerSort('part_number', 'Part #')}</View> {/* ✅ ADDED: Part number column */}
      <View style={styles.headerQty}>{headerSort('quantity', 'Qty')}</View>
      <View style={styles.headerPrice}>{headerSort('selling_price', 'Price')}</View> {/* ✅ FIXED: selling_price */}
      <View style={styles.headerStock}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Stock</Text> {/* ✅ ADDED: Stock status (non-sortable) */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  headerPart: { flex: 1.8 }, // ✅ ADJUSTED: Smaller to make room for part number
  headerPartNumber: { flex: 1.2 }, // ✅ ADDED: Part number column
  headerQty: { width: 60, alignItems: 'center' },
  headerPrice: { width: 80, alignItems: 'flex-end' },
  headerStock: { width: 70, alignItems: 'center' }, // ✅ ADDED: Stock status column
  sortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 13,
  },
  headerArrow: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
  },
});
