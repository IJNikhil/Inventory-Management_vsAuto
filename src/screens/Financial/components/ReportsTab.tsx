import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";
import type { Invoice, Transaction, StockPurchase } from '../../../types/database';

interface ReportsTabProps {
  invoices: Invoice[];
  transactions: Transaction[];
  stockPurchases: StockPurchase[];
  reportData: any;
  generateReport: (dateRange: any) => void;
  isGeneratingReport: boolean;
  colors: any;
  isDark: boolean;
}

export default function ReportsTab(props: ReportsTabProps) {
  const { colors, isDark } = props;
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const styles = createStyles(colors, isDark);

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'year', label: 'Year' },
  ];

  const mockData = {
    revenue: 125000,
    expenses: 85000,
    profit: 40000,
    growth: 12.5,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Period Selector */}
      <View style={styles.periodSection}>
        <Text style={styles.sectionTitle}>Report Period</Text>
        <View style={styles.periodContainer}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.activePeriodButton
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodText,
                { color: selectedPeriod === period.key ? colors.background : colors.foreground }
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Financial Overview */}
      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        
        {/* Main Revenue Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <FeatherIcon name="trending-up" size={20} color={colors.foreground} />
            <Text style={styles.revenueLabel}>Total Revenue</Text>
          </View>
          <Text style={styles.revenueAmount}>₹{mockData.revenue.toLocaleString()}</Text>
          <Text style={styles.revenueGrowth}>+{mockData.growth}% from last period</Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <FeatherIcon name="arrow-up-right" size={18} color={colors.destructive} />
              <Text style={styles.metricValue}>₹{mockData.expenses.toLocaleString()}</Text>
            </View>
            <Text style={styles.metricLabel}>Total Expenses</Text>
            <Text style={styles.metricChange}>+5.2% vs last period</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <FeatherIcon name="dollar-sign" size={18} color={colors.primary} />
              <Text style={styles.metricValue}>₹{mockData.profit.toLocaleString()}</Text>
            </View>
            <Text style={styles.metricLabel}>Net Profit</Text>
            <Text style={styles.metricChange}>+15.8% vs last period</Text>
          </View>
        </View>
      </View>

      {/* Performance Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Performance Summary</Text>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <FeatherIcon name="bar-chart" size={18} color={colors.foreground} />
            <Text style={styles.summaryTitle}>Key Metrics</Text>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Profit Margin</Text>
              <Text style={styles.summaryItemValue}>32%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Average Order</Text>
              <Text style={styles.summaryItemValue}>₹5,000</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Total Transactions</Text>
              <Text style={styles.summaryItemValue}>25</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Export Section */}
      <View style={styles.exportSection}>
        <Text style={styles.sectionTitle}>Export Reports</Text>
        <View style={styles.exportGrid}>
          <TouchableOpacity style={styles.exportButton}>
            <FeatherIcon name="file-text" size={20} color={colors.foreground} />
            <Text style={styles.exportText}>PDF Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exportButton}>
            <FeatherIcon name="download" size={20} color={colors.foreground} />
            <Text style={styles.exportText}>CSV Export</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 12,
  },

  // Period Section
  periodSection: {
    marginBottom: 20,
  },
  
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  
  activePeriodButton: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  
  periodText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Overview Section
  overviewSection: {
    marginBottom: 20,
  },
  
  revenueCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  
  revenueLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  
  revenueAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: 8,
  },
  
  revenueGrowth: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
  },
  
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  
  metricChange: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.mutedForeground,
  },

  // Summary Section
  summarySection: {
    marginBottom: 20,
  },
  
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  
  summaryContent: {
    gap: 12,
  },
  
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  summaryItemLabel: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  
  summaryItemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },

  // Export Section
  exportSection: {
    marginBottom: 20,
  },
  
  exportGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  
  exportButton: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 8,
  },
  
  exportText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
});
