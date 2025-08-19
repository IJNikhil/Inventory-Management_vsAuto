import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";

// Define the CombinedTransaction type to match what's being passed
type CombinedTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  status: 'Paid' | 'Pending' | 'Overdue';
  source: 'Invoice' | 'Manual' | 'Stock Purchase';
  sourceId?: string;
};

interface InsightsTabProps {
  stats: any;
  transactions: CombinedTransaction[];
  colors: any;
  isDark: boolean;
}

export default function InsightsTab({ stats, transactions, colors, isDark }: InsightsTabProps) {
  const styles = createStyles(colors, isDark);
  
  const profitMargin = stats.totalIncome > 0 ? ((stats.netFlow / stats.totalIncome) * 100) : 0;
  const incomeTransactions = transactions.filter(t => t.type === 'Income').length;
  const expenseTransactions = transactions.filter(t => t.type === 'Expense').length;
  const avgTransaction = incomeTransactions > 0 ? (stats.totalIncome / incomeTransactions) : 0;
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Financial Health */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Health</Text>
        
        <View style={styles.healthCard}>
          <Text style={styles.healthScore}>
            {stats.netFlow >= 0 ? '85' : '65'}/100
          </Text>
          <Text style={styles.healthStatus}>
            {stats.netFlow >= 0 ? 'Good' : 'Needs Attention'}
          </Text>
        </View>
      </View>

      {/* Key Numbers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Numbers</Text>
        
        <View style={styles.numbersGrid}>
          <View style={styles.numberCard}>
            <Text style={styles.numberValue}>{Math.abs(profitMargin).toFixed(1)}%</Text>
            <Text style={styles.numberLabel}>Profit Margin</Text>
          </View>

          <View style={styles.numberCard}>
            <Text style={styles.numberValue}>₹{avgTransaction.toFixed(0)}</Text>
            <Text style={styles.numberLabel}>Avg Transaction</Text>
          </View>

          <View style={styles.numberCard}>
            <Text style={styles.numberValue}>{incomeTransactions}</Text>
            <Text style={styles.numberLabel}>Income Count</Text>
          </View>

          <View style={styles.numberCard}>
            <Text style={styles.numberValue}>{expenseTransactions}</Text>
            <Text style={styles.numberLabel}>Expense Count</Text>
          </View>
        </View>
      </View>

      {/* Business Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Insights</Text>
        
        <View style={styles.insightsList}>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Cash Flow</Text>
            <Text style={styles.insightText}>
              {stats.netFlow >= 0 
                ? "Your cash flow is positive. Good financial position."
                : "Your cash flow is negative. Focus on increasing income or reducing expenses."
              }
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Profit Analysis</Text>
            <Text style={styles.insightText}>
              {profitMargin > 15 
                ? "Your profit margin is healthy at " + profitMargin.toFixed(1) + "%."
                : "Consider improving profit margin. Current: " + profitMargin.toFixed(1) + "%."
              }
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Transaction Activity</Text>
            <Text style={styles.insightText}>
              {incomeTransactions > expenseTransactions 
                ? "More income transactions than expenses. Good business activity."
                : "Focus on increasing income-generating activities."
              }
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Business Volume</Text>
            <Text style={styles.insightText}>
              Total of {transactions.length} transactions processed.
              {avgTransaction > 1000 
                ? " Good average transaction value."
                : " Consider increasing transaction value."
              }
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 12,
  },

  // Health Section
  healthCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  
  healthScore: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 4,
  },
  
  healthStatus: {
    fontSize: 14,
    color: colors.mutedForeground,
  },

  // Numbers Section
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  numberCard: {
    width: '48%',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  
  numberValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  
  numberLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
  },

  // Insights Section
  insightsList: {
    gap: 12,
  },
  
  insightCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  
  insightText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.mutedForeground,
  },
});
