import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const STOCK_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Low Stock', value: 'low' },
  { label: 'Out of Stock', value: 'out-of-stock' },
];

export default function InventoryFilter({ activeFilter, onFilterChange, colors }: any) {
  return (
    <View style={styles.filtersContainer}>
      <View style={styles.stockFilterWrap}>
        {STOCK_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => onFilterChange(f.value)}
            style={[
              styles.filterBadge,
              {
                backgroundColor: activeFilter === f.value ? colors.primary : colors.card,
                borderColor: activeFilter === f.value ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText,
              { color: activeFilter === f.value ? colors.primaryForeground : colors.mutedForeground }
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    marginBottom: 20,
  },
  stockFilterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontWeight: '600',
    fontSize: 12,
  },
});
