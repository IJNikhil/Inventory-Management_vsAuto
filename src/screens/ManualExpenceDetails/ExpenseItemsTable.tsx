import React from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './ExpenseDetailStyles';

interface ExpenseItem {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  purchasePrice: number;
}

interface ExpenseItemsTableProps {
  items: ExpenseItem[];
}

const COLUMN_WIDTHS = {
  item: 180,
  quantity: 80,
  price: 120,
  total: 120,
};

export function ExpenseItemsTable({ items }: ExpenseItemsTableProps) {
  const colors = useColors();
  const totalTableWidth = Object.values(COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0);

  return (
    <View style={styles.tableSection}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Items</Text>
      
      {/* Table Header */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tableScrollView}
      >
        <View style={[styles.tableHeader, { 
          backgroundColor: colors.muted,
          width: totalTableWidth
        }]}>
          <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.item }]}>
            <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Item</Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.quantity }]}>
            <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Qty</Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.price }]}>
            <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Price</Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.total }]}>
            <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Total</Text>
          </View>
        </View>
      </ScrollView>

      {/* Table Rows */}
      {items?.length ? (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tableScrollView}
            >
              <View style={[styles.tableRow, { 
                borderBottomColor: colors.border,
                width: totalTableWidth
              }]}>
                <View style={[styles.tableCell, { width: COLUMN_WIDTHS.item }]}>
                  <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemPartNumber, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.partNumber}
                  </Text>
                </View>
                
                <View style={[styles.tableCell, styles.centerAlign, { width: COLUMN_WIDTHS.quantity }]}>
                  <Text style={[styles.cellText, { color: colors.foreground }]}>
                    {item.quantity}
                  </Text>
                </View>
                
                <View style={[styles.tableCell, styles.rightAlign, { width: COLUMN_WIDTHS.price }]}>
                  <Text style={[styles.cellText, { color: colors.foreground }]}>
                    ₹{item.purchasePrice.toFixed(2)}
                  </Text>
                </View>
                
                <View style={[styles.tableCell, styles.rightAlign, { width: COLUMN_WIDTHS.total }]}>
                  <Text style={[styles.totalText, { color: colors.foreground }]}>
                    ₹{(item.quantity * item.purchasePrice).toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
          scrollEnabled={false}
        />
      ) : (
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          No items found.
        </Text>
      )}
    </View>
  );
}
