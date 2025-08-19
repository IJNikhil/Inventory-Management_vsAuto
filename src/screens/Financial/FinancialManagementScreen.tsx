import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";
import { useColors, useTheme } from '../../context/ThemeContext';
import { useCashFlowData } from './hooks/useCashFlowData';
import { useTransactionOperations } from './hooks/useTransactionOperations';
import { useReportsData } from './hooks/useReportsData';
import { filterTransactions, calculateStats } from './utils/helpers';

// Simplified Tab Components
import OverviewTab from './components/OverviewTab';
import TransactionsTab from './components/TransactionsTab';
import ReportsTab from './components/ReportsTab';
import InsightsTab from './components/InsightsTab';
import ModernTransactionModal from './components/ModernTransactionModal';

export type FilterType = {
  type: 'all' | 'income' | 'expense';
  status: 'all' | 'paid' | 'pending' | 'overdue';
};

type TabType = 'overview' | 'transactions' | 'reports' | 'insights';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'home' },
  { key: 'transactions', label: 'Transactions', icon: 'list' },
  { key: 'reports', label: 'Reports', icon: 'bar-chart-2' },
  { key: 'insights', label: 'Insights', icon: 'trending-up' },
];

export default function FinancialManagementScreen({ navigation }: any) {
  const colors = useColors();
  const { isDark } = useTheme();
  
  // Data hooks
  const {
    combinedTransactions,
    isLoading,
    isRefreshing,
    error,
    onRefresh,
    refetch,
    invoices,
    manualTransactions,
    stockPurchases,
  } = useCashFlowData();
  
  const { handleAddTransaction, isProcessing } = useTransactionOperations();
  const { reportData, generateReport, isGeneratingReport } = useReportsData();
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [filters, setFilters] = useState<FilterType>({ type: 'all', status: 'all' });
  const [transactionModal, setTransactionModal] = useState(false);

  const styles = createStyles(colors, isDark);

  // Calculations
  const stats = useMemo(() => calculateStats(combinedTransactions), [combinedTransactions]);
  const filteredTransactions = useMemo(
    () => filterTransactions(combinedTransactions, filters, ''),
    [combinedTransactions, filters]
  );

  const handleFilterChange = useCallback((newFilters: Partial<FilterType>) => {
    setFilters((prev: FilterType) => ({ ...prev, ...newFilters }));
  }, []);

  const onAddTransaction = useCallback(async (transaction: any) => {
    try {
      const success = await handleAddTransaction(transaction);
      if (success) {
        setTransactionModal(false);
        refetch(true);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }, [handleAddTransaction, refetch]);

  if (isLoading && !combinedTransactions.length) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Simple Tab Navigation */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key as TabType)}
            activeOpacity={0.7}
          >
            <FeatherIcon 
              name={tab.icon} 
              size={16} 
              color={activeTab === tab.key ? colors.primary : colors.mutedForeground} 
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === tab.key ? colors.primary : colors.mutedForeground }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.tabContent}>
          {activeTab === 'overview' && (
            <OverviewTab 
              stats={stats}
              filteredTransactions={filteredTransactions}
              colors={colors}
              isDark={isDark}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab 
              transactions={filteredTransactions}
              filters={filters}
              onFilterChange={handleFilterChange}
              colors={colors}
              isDark={isDark}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab 
              invoices={invoices}
              transactions={manualTransactions}
              stockPurchases={stockPurchases}
              reportData={reportData}
              generateReport={generateReport}
              isGeneratingReport={isGeneratingReport}
              colors={colors}
              isDark={isDark}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsTab 
              stats={stats}
              transactions={combinedTransactions}
              colors={colors}
              isDark={isDark}
            />
          )}
        </View>
      </ScrollView>

      {/* Simple Add Button */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setTransactionModal(true)}
        activeOpacity={0.8}
      >
        <FeatherIcon name="plus" size={18} color={colors.background} />
      </TouchableOpacity>

      {/* Transaction Modal */}
      <ModernTransactionModal
        visible={transactionModal}
        onClose={() => setTransactionModal(false)}
        onSave={onAddTransaction}
        currentUser="Shop Owner"
        colors={colors}
        isDark={isDark}
        isProcessing={isProcessing}
      />
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Simple Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.muted,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Content
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    paddingBottom: 80,
  },

  // Simple Add Button
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.foreground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
});
