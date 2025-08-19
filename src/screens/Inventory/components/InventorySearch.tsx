import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';

export default function InventorySearch({ searchTerm, onSearch, colors }: any) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchRow}>
        <Search size={18} color={colors.mutedForeground} style={styles.searchIcon} />
        <TextInput
          placeholder="Search parts by name, number, supplier..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.foreground
          }]}
          value={searchTerm}
          onChangeText={onSearch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: 16,
  },
  searchRow: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 13,
    zIndex: 1,
  },
  searchInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 16,
    width: '100%',
  },
});
