import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";

interface OverviewTabProps {
  stats: any;
  filteredTransactions: any[];
  colors: any;
  isDark: boolean;
  isLoading: boolean;
}

export default function OverviewTab({ 
  stats, 
  filteredTransactions, 
  colors, 
  isDark, 
  isLoading 
}: OverviewTabProps) {
  const styles = createStyles(colors, isDark);
  
  return (
    <View style={styles.container}>
      {/* Balance Section */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>
          ₹{stats.netFlow?.toLocaleString() || '0'}
        </Text>
        <Text style={[
          styles.balanceStatus,
          { color: stats.netFlow >= 0 ? colors.primary : colors.destructive }
        ]}>
          {stats.netFlow >= 0 ? 'Positive Flow' : 'Negative Flow'}
        </Text>
      </View>

      {/* Simple Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={styles.statValue}>₹{stats.totalIncome?.toLocaleString() || '0'}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={styles.statValue}>₹{stats.totalExpenses?.toLocaleString() || '0'}</Text>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        {filteredTransactions.slice(0, 5).map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <Text style={styles.transactionDesc} numberOfLines={1}>
                {transaction.description || 'Transaction'}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              { color: transaction.type === 'Income' ? colors.primary : colors.destructive }
            ]}>
              {transaction.type === 'Income' ? '+' : '-'}₹{Math.abs(transaction.amount || 0).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    gap: 20,
  },
  
  // Balance Section
  balanceSection: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  
  balanceLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 4,
  },
  
  balanceStatus: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  statLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },

  // Recent Section
  recentSection: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 12,
  },
  
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  transactionLeft: {
    flex: 1,
  },
  
  transactionDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 2,
  },
  
  transactionDate: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
