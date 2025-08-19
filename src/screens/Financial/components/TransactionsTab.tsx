import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";

const { width: screenWidth } = Dimensions.get('window');

interface TransactionsTabProps {
  transactions: any[];
  filters: any;
  onFilterChange: (filters: any) => void;
  colors: any;
  isDark: boolean;
  isLoading: boolean;
}

export default function TransactionsTab({ 
  transactions, 
  filters, 
  onFilterChange, 
  colors, 
  isDark, 
  isLoading 
}: TransactionsTabProps) {
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const styles = createStyles(colors, isDark);

  const typeFilterOptions = [
    { key: 'all', label: 'All' },
    { key: 'income', label: 'Income' },
    { key: 'expense', label: 'Expense' },
  ];

  const statusFilterOptions = [
    { key: 'all', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
    { key: 'overdue', label: 'Overdue' },
  ];

  const handleTypeFilterPress = (filterKey: string) => {
    setActiveTypeFilter(filterKey);
    const newFilters = {
      type: filterKey === 'all' ? 'all' : filterKey,
      status: activeStatusFilter === 'all' ? 'all' : activeStatusFilter
    };
    onFilterChange(newFilters);
  };

  const handleStatusFilterPress = (filterKey: string) => {
    setActiveStatusFilter(filterKey);
    const newFilters = {
      type: activeTypeFilter === 'all' ? 'all' : activeTypeFilter,
      status: filterKey === 'all' ? 'all' : filterKey
    };
    onFilterChange(newFilters);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return colors.primary;
      case 'Pending': return colors.accent;
      case 'Overdue': return colors.destructive;
      default: return colors.mutedForeground;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
      });
    } catch (error) {
      return dateString;
    }
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <FeatherIcon name="inbox" size={40} color={colors.mutedForeground} />
      <Text style={styles.emptyTitle}>No Transactions</Text>
      <Text style={styles.emptySubtitle}>No transactions match your filters</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Compact Side-by-Side Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Type:</Text>
          <View style={styles.filterButtons}>
            {typeFilterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterButton,
                  activeTypeFilter === option.key && styles.activeFilterButton
                ]}
                onPress={() => handleTypeFilterPress(option.key)}
              >
                <Text style={[
                  styles.filterText,
                  { color: activeTypeFilter === option.key ? colors.background : colors.foreground }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.filterButtons}>
            {statusFilterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterButton,
                  activeStatusFilter === option.key && styles.activeFilterButton
                ]}
                onPress={() => handleStatusFilterPress(option.key)}
              >
                <Text style={[
                  styles.filterText,
                  { color: activeStatusFilter === option.key ? colors.background : colors.foreground }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Results Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryText}>
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Horizontally Scrollable Table */}
      {transactions.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollContainer}>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.dateColumn]}>Date</Text>
              <Text style={[styles.tableHeaderText, styles.descriptionColumn]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.sourceColumn]}>Source</Text>
              <Text style={[styles.tableHeaderText, styles.typeColumn]}>Type</Text>
              <Text style={[styles.tableHeaderText, styles.amountColumn]}>Amount</Text>
              <Text style={[styles.tableHeaderText, styles.statusColumn]}>Status</Text>
            </View>

            {/* Table Body */}
            <View style={styles.tableBody}>
              {transactions.map((tx, index) => {
                const isIncome = tx.type === 'Income';
                const statusColor = getStatusColor(tx.status);
                
                return (
                  <View key={tx.id} style={[
                    styles.tableRow,
                    index === transactions.length - 1 && styles.lastRow
                  ]}>
                    <Text style={[styles.tableCellText, styles.dateColumn]}>
                      {formatDate(tx.date)}
                    </Text>
                    <Text style={[styles.tableCellText, styles.descriptionColumn]} numberOfLines={2}>
                      {tx.description || 'No description'}
                    </Text>
                    <Text style={[styles.tableCellText, styles.sourceColumn]}>
                      {tx.source}
                    </Text>
                    <Text style={[styles.tableCellText, styles.typeColumn]}>
                      {tx.type}
                    </Text>
                    <Text style={[
                      styles.tableCellText, 
                      styles.amountColumn,
                      { color: isIncome ? colors.primary : colors.destructive }
                    ]}>
                      {isIncome ? '+' : '-'}₹{Math.abs(tx.amount || 0).toLocaleString()}
                    </Text>
                    <View style={[styles.tableCell, styles.statusColumn]}>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {tx.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      ) : (
        <EmptyState />
      )}
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Compact Filters
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 16,
  },
  
  filterGroup: {
    flex: 1,
  },
  
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 6,
  },
  
  filterButtons: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  activeFilterButton: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  
  filterText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Summary
  summarySection: {
    marginBottom: 12,
  },
  
  summaryText: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontWeight: '500',
  },

  // Horizontally Scrollable Table
  tableScrollContainer: {
    flex: 1,
  },
  
  tableContainer: {
    minWidth: screenWidth * 1.4, // Make table wider than screen
  },
  
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.muted,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.foreground,
    textTransform: 'uppercase',
  },
  
  tableBody: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
  },
  
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 48,
  },
  
  lastRow: {
    borderBottomWidth: 0,
  },
  
  tableCell: {
    justifyContent: 'center',
  },
  
  tableCellText: {
    fontSize: 12,
    color: colors.foreground,
  },

  // Fixed Column Widths for horizontal scroll
  dateColumn: {
    width: 80,
  },
  descriptionColumn: {
    width: 160,
  },
  sourceColumn: {
    width: 100,
  },
  typeColumn: {
    width: 70,
  },
  amountColumn: {
    width: 100,
    textAlign: 'right',
  },
  statusColumn: {
    width: 80,
    alignItems: 'center',
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 45,
    alignItems: 'center',
  },
  
  statusText: {
    fontSize: 9,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    marginTop: 8,
    marginBottom: 2,
  },
  
  emptySubtitle: {
    fontSize: 11,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
