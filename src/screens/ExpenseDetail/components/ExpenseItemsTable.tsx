// src/screens/ExpenseDetailScreen/components/ExpenseItemsTable.tsx
import React from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';

const COLUMN_WIDTHS = {
  item: 180,
  quantity: 80,
  price: 120,
  total: 120,
};

interface Item {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  purchasePrice: number;
}

interface Props {
  items?: Item[];
  colors: any;
}

export default function ExpenseItemsTable({ items, colors }: Props) {
  const totalTableWidth = Object.values(COLUMN_WIDTHS).reduce((sum, w) => sum + w, 0);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16, color: colors.foreground }}>Items</Text>

      {/* Table Header */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, backgroundColor: colors.muted, width: totalTableWidth }}>
          <View style={{ paddingHorizontal: 8, justifyContent: 'center', width: COLUMN_WIDTHS.item }}>
            <Text style={{ fontWeight: '600', fontSize: 12, textTransform: 'uppercase', color: colors.foreground }}>Item</Text>
          </View>
          <View style={{ paddingHorizontal: 8, justifyContent: 'center', width: COLUMN_WIDTHS.quantity, alignItems: 'center' }}>
            <Text style={{ fontWeight: '600', fontSize: 12, textTransform: 'uppercase', color: colors.foreground }}>Qty</Text>
          </View>
          <View style={{ paddingHorizontal: 8, justifyContent: 'center', width: COLUMN_WIDTHS.price, alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: '600', fontSize: 12, textTransform: 'uppercase', color: colors.foreground }}>Price</Text>
          </View>
          <View style={{ paddingHorizontal: 8, justifyContent: 'center', width: COLUMN_WIDTHS.total, alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: '600', fontSize: 12, textTransform: 'uppercase', color: colors.foreground }}>Total</Text>
          </View>
        </View>
      </ScrollView>

      {/* Table Rows */}
      {items && items.length ? (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
              <View style={{
                flexDirection: 'row',
                paddingVertical: 12,
                paddingHorizontal: 8,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                width: totalTableWidth,
              }}>
                <View style={{ paddingHorizontal: 8, justifyContent: 'center', width: COLUMN_WIDTHS.item }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 2, color: colors.foreground }} numberOfLines={1}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }} numberOfLines={1}>{item.partNumber}</Text>
                </View>

                <View style={{ paddingHorizontal: 8, justifyContent: 'center', width: COLUMN_WIDTHS.quantity, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: colors.foreground }}>{item.quantity}</Text>
                </View>

                <View style={{ paddingHorizontal: 8, justifyContent: 'center', width: COLUMN_WIDTHS.price, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 13, color: colors.foreground }}>₹{item.purchasePrice.toFixed(2)}</Text>
                </View>

                <View style={{ paddingHorizontal: 8, justifyContent: 'center', width: COLUMN_WIDTHS.total, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
                    ₹{(item.quantity * item.purchasePrice).toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
        />
      ) : (
        <Text style={{ textAlign: 'center', fontSize: 14, fontStyle: 'italic', marginVertical: 20, color: colors.mutedForeground }}>
          No items found.
        </Text>
      )}
    </View>
  );
}
