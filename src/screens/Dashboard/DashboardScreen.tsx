import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Dimensions,
    StyleSheet, // ✅ ADDED: Missing StyleSheet import

} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FeatherIcon from "react-native-vector-icons/Feather";
import { useTheme, useColors } from "../../context/ThemeContext";
import useDashboardData from "./hooks/useDashboardData";
import { RootStackParamList, DrawerParamList } from "../../navigation/AppNavigator";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import type { Part } from "../../types/database"; // ✅ FIXED: Import from database types

const { width: screenWidth } = Dimensions.get('window');

type DashboardNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const MetricCard = ({ title, value, change }: { title: string; value: string; change?: string }) => {
  const colors = useColors();
  const styles = createStyles(colors, useTheme().isDark);
  const isPositive = change && (change.startsWith('+') || !change.startsWith('-'));
  
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {change && (
        <Text style={[styles.metricChange, isPositive ? styles.metricChangePositive : styles.metricChangeNegative]}>
          {change}
        </Text>
      )}
    </View>
  );
};

const CollapsibleSection = ({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colors = useColors();
  const styles = createStyles(colors, useTheme().isDark);
  const rotation = useSharedValue(defaultOpen ? 180 : 0);
  const height = useSharedValue(defaultOpen ? 1 : 0);

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    transform: [{ scaleY: height.value }],
  }));

  const toggle = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    rotation.value = withSpring(newOpen ? 180 : 0);
    height.value = withTiming(newOpen ? 1 : 0, { duration: 200 });
  };

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggle} activeOpacity={0.7}>
        <View style={styles.sectionHeaderLeft}>
          <FeatherIcon name={icon} size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
          <Text style={styles.sectionTitleText}>{title}</Text>
        </View>
        <Reanimated.View style={animatedChevronStyle}>
          <FeatherIcon name="chevron-down" size={18} color={colors.mutedForeground} />
        </Reanimated.View>
      </TouchableOpacity>
      <Reanimated.View style={animatedContentStyle}>
        {isOpen && <View style={styles.sectionContent}>{children}</View>}
      </Reanimated.View>
    </View>
  );
};

const EmptyState = ({ icon, title, description }: { icon: string; title: string; description: string }) => {
  const colors = useColors();
  const styles = createStyles(colors, useTheme().isDark);
  
  return (
    <View style={styles.emptyState}>
      <FeatherIcon name={icon} size={24} color={colors.mutedForeground} style={styles.emptyStateIcon} />
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDescription}>{description}</Text>
    </View>
  );
};

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const colors = useColors();
  const { isDark } = useTheme();
  const { data, loading, error, lastFetch, refresh } = useDashboardData();
  const styles = createStyles(colors, isDark);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fabRotation = useSharedValue(0);
  const animatedFabStyle = useAnimatedStyle(() => ({ 
    transform: [{ rotate: `${fabRotation.value}deg` }] 
  }));

  const animatedMenuStyle = useAnimatedStyle(() => ({
    opacity: menuOpen ? 1 : 0,
    transform: [{ scale: menuOpen ? 1 : 0.5 }],
    pointerEvents: menuOpen ? 'auto' : 'none',
  }));

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    fabRotation.value = withSpring(menuOpen ? 0 : 45);
  };

  const handleMenuItemPress = (onPress: () => void) => {
    toggleMenu();
    setTimeout(() => onPress(), 200);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const totalStockIssues = (data?.outStock?.length ?? 0) + (data?.lowStock?.length ?? 0);
  const totalRecentActivities = (data?.recentSales?.length ?? 0) + (data?.recentExpenses?.length ?? 0);

  if (error && !data) {
    return (
      <View style={styles.loadingContainer}>
        <FeatherIcon name="alert-circle" size={24} color={colors.destructive} />
        <Text style={[styles.loadingText, { color: colors.destructive }]}>
          Failed to load dashboard data
        </Text>
        <TouchableOpacity onPress={() => refresh()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No data available</Text>
      </View>
    );
  }

  const getCurrentPeriodData = () => {
    switch (selectedPeriod) {
      case 'today':
        return { revenue: data.todayRevenue, profit: data.todayProfit };
      case 'week':
        return { revenue: data.weekRevenue, profit: data.weekProfit };
      case 'month':
        return { revenue: data.monthRevenue, profit: data.monthProfit };
      default:
        return { revenue: data.todayRevenue, profit: data.todayProfit };
    }
  };

  const currentData = getCurrentPeriodData();
  const progress = Math.min(currentData.revenue / 100000, 1);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.contentContainer}>
          {/* Revenue Card */}
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <Text style={styles.revenueTitle}>Revenue</Text>
              <View style={styles.periodSelector}>
                {(['today', 'week', 'month'] as const).map(period => (
                  <TouchableOpacity
                    key={period}
                    style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={[styles.periodButtonText, selectedPeriod === period && styles.periodButtonTextActive]}>
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Text style={styles.revenueAmount}>₹{currentData.revenue.toLocaleString()}</Text>
            <Text style={styles.revenueSubtext}>
              Profit: ₹{currentData.profit.toLocaleString()}
              {currentData.profit === 0 && currentData.revenue > 0 && (
                <Text style={styles.profitWarning}> • Check part prices</Text>
              )}
            </Text>
            <View style={styles.progressContainer}>
              <Reanimated.View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Monthly Sales"
              value={`₹${data.monthRevenue.toLocaleString()}`}
              change={data.monthGrowth > 0 ? `+${data.monthGrowth}%` : `${data.monthGrowth}%`}
            />
            <MetricCard
              title="Monthly Profit"
              value={`₹${data.monthProfit.toLocaleString()}`}
              change={data.monthGrowth > 0 ? `+${Math.round(data.monthGrowth * 0.6)}%` : `${Math.round(data.monthGrowth * 0.6)}%`}
            />
            <MetricCard
              title="Total Items"
              value={data.totalItems.toLocaleString()}
              change={data.totalItemsGrowth > 0 ? `+${data.totalItemsGrowth}%` : `${data.totalItemsGrowth}%`}
            />
            <MetricCard title="Low Stock" value={data.lowStock.length.toString()} />
          </View>

          {/* Overdue Payments */}
          <CollapsibleSection 
            title={`Overdue Payments (${data.overdueInvoices.length})`} 
            icon="alert-circle" 
            defaultOpen={data.overdueInvoices.length > 0}
          >
            {data.overdueInvoices.length > 0 ? (
              data.overdueInvoices.slice(0, 5).map((invoice, index) => (
                <View key={invoice.id} style={[styles.listItem, index === Math.min(4, data.overdueInvoices.length - 1) && styles.listItemLast]}>
                  <View style={styles.listItemLeft}>
                    <Text style={styles.listItemTitle}>{invoice.customer?.name ?? 'Unknown Customer'}</Text>
                    <Text style={styles.listItemSubtitle}>Invoice #{invoice.id.slice(-6)}</Text>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text style={styles.listItemValue}>₹{invoice.total?.toLocaleString()}</Text>
                    <View style={styles.listItemBadge}>
                      <Text style={styles.badgeText}>OVERDUE</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState icon="check-circle" title="All Clear" description="No overdue payments" />
            )}
          </CollapsibleSection>

          {/* Inventory Alerts */}
          <CollapsibleSection 
            title={`Inventory Alerts (${totalStockIssues})`} 
            icon="package" 
            defaultOpen={totalStockIssues > 0}
          >
            {totalStockIssues === 0 ? (
              <EmptyState icon="check-circle" title="Stock Levels Good" description="All items are well stocked" />
            ) : (
              <>
                {data.outStock.slice(0, 3).map((part: Part, index: number) => (
                  <View
                    key={`out-${part.id}`}
                    style={[
                      styles.listItem,
                      (index === 2 || index === data.outStock.length - 1) && data.lowStock.length === 0 && styles.listItemLast,
                    ]}
                  >
                    <View style={styles.listItemLeft}>
                      <Text style={styles.listItemTitle}>{part.name}</Text>
                      <Text style={styles.listItemSubtitle}>Inventory Item</Text>
                    </View>
                    <View style={styles.listItemRight}>
                      <View style={[styles.listItemBadge, { backgroundColor: colors.destructive + '15' }]}>
                        <Text style={[styles.badgeText, { color: colors.destructive }]}>OUT OF STOCK</Text>
                      </View>
                    </View>
                  </View>
                ))}
                {data.lowStock.slice(0, 3).map((part: Part, index: number) => (
                  <View
                    key={`low-${part.id}`}
                    style={[styles.listItem, index === Math.min(2, data.lowStock.length - 1) && styles.listItemLast]}
                  >
                    <View style={styles.listItemLeft}>
                      <Text style={styles.listItemTitle}>{part.name}</Text>
                      <Text style={styles.listItemSubtitle}>Inventory Item</Text>
                    </View>
                    <View style={styles.listItemRight}>
                      <Text style={styles.listItemValue}>{part.quantity} left</Text>
                      <View style={[styles.listItemBadge, { backgroundColor: colors.accent + '15' }]}>
                        <Text style={[styles.badgeText, { color: colors.accent }]}>LOW STOCK</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </CollapsibleSection>

          {/* Top Selling Items */}
          <CollapsibleSection title={`Top Selling Items (${data.topSellingWeekly.length})`} icon="trending-up">
            {data.topSellingWeekly.length > 0 ? (
              data.topSellingWeekly.slice(0, 5).map((item, index) => (
                <View key={item.part.id} style={[styles.listItem, index === Math.min(4, data.topSellingWeekly.length - 1) && styles.listItemLast]}>
                  <View style={styles.listItemLeft}>
                    <Text style={styles.listItemTitle}>{item.part.name}</Text>
                    <Text style={styles.listItemSubtitle}>This week</Text>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text style={styles.listItemValue}>{item.quantity} units</Text>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState icon="trending-up" title="No Sales Data" description="Sales data will appear here" />
            )}
          </CollapsibleSection>

          {/* Recent Activity */}
          <CollapsibleSection title={`Recent Activity (${totalRecentActivities})`} icon="activity">
            {totalRecentActivities > 0 ? (
              <>
                {data.recentSales.slice(0, 3).map(sale => (
                  <View key={`sale-${sale.id}`} style={styles.listItem}>
                    <View style={styles.listItemLeft}>
                      <Text style={styles.listItemTitle}>Sale to {sale.customer?.name ?? 'Customer'}</Text>
                      <Text style={styles.listItemSubtitle}>Transaction</Text>
                    </View>
                    <View style={styles.listItemRight}>
                      <Text style={styles.listItemValue}>₹{sale.total?.toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
                {data.recentExpenses.slice(0, 2).map((expense, index) => (
                  <View key={`expense-${expense.id}`} style={[styles.listItem, index === 1 && styles.listItemLast]}>
                    <View style={styles.listItemLeft}>
                      <Text style={styles.listItemTitle}>{expense.description}</Text>
                      <Text style={styles.listItemSubtitle}>Expense</Text>
                    </View>
                    <View style={styles.listItemRight}>
                      <Text style={styles.listItemValue}>₹{Math.abs(expense.amount).toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <EmptyState icon="activity" title="No Recent Activity" description="Transactions will appear here" />
            )}
          </CollapsibleSection>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        {menuOpen && (
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View />
          </TouchableWithoutFeedback>
        )}
        <Reanimated.View style={[styles.fabMenu, animatedMenuStyle]}>
          {[
            { icon: 'refresh-cw', label: 'Refresh', onPress: () => refresh() },
            { icon: 'file-plus', label: 'New Invoice', onPress: () => navigation.navigate("InvoiceNewScreen") },
            { icon: 'package', label: 'Inventory', onPress: () => navigation.navigate("Inventory") },
            // { icon: 'dollar-sign', label: 'Cash Flow', onPress: () => navigation.navigate("CashFlow") },
          ].map(item => (
            <View key={item.label} style={styles.fabMenuItem}>
              <View style={styles.fabMenuLabel}>
                <Text style={styles.fabMenuLabelText}>{item.label}</Text>
              </View>
              <TouchableOpacity 
                style={styles.fabMenuButton} 
                onPress={() => handleMenuItemPress(item.onPress)} 
                activeOpacity={0.7}
              >
                <FeatherIcon name={item.icon} size={20} color={colors.background} />
              </TouchableOpacity>
            </View>
          ))}
        </Reanimated.View>
        <TouchableOpacity style={styles.fab} onPress={toggleMenu} activeOpacity={0.8}>
          <Reanimated.View style={animatedFabStyle}>
            <FeatherIcon name={menuOpen ? "x" : "plus"} size={24} color={colors.background} />
          </Reanimated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}


// *** ENHANCED: Complete styles with all new components ***
const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 120 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.foreground, marginBottom: 16, marginTop: 8 },
  
  // Revenue card
  revenueCard: { backgroundColor: colors.card, borderRadius: 12, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  revenueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  revenueTitle: { fontSize: 16, fontWeight: '600', color: colors.foreground },
  periodSelector: { flexDirection: 'row', backgroundColor: colors.muted, borderRadius: 8, padding: 2 },
  periodButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  periodButtonActive: { backgroundColor: colors.background },
  periodButtonText: { fontSize: 12, fontWeight: '500', color: colors.mutedForeground },
  periodButtonTextActive: { color: colors.foreground },
  revenueAmount: { fontSize: 32, fontWeight: '700', color: colors.foreground, textAlign: 'center', marginBottom: 8 },
  revenueSubtext: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: 16 },
  progressContainer: { height: 6, backgroundColor: colors.muted, borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: colors.foreground, borderRadius: 3 },
  
  // Metrics grid
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  metricCard: { width: (screenWidth - 60) / 2, backgroundColor: colors.card, borderRadius: 12, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  metricTitle: { fontSize: 14, color: colors.mutedForeground, fontWeight: '500', marginBottom: 8 },
  metricValue: { fontSize: 20, fontWeight: '600', color: colors.foreground, marginBottom: 4 },
  metricChange: { fontSize: 12, fontWeight: '500' },
  metricChangePositive: { color: colors.accent },
  metricChangeNegative: { color: colors.destructive },
  
  // Sections
  sectionCard: { backgroundColor: colors.card, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sectionIcon: { marginRight: 12 },
  sectionTitleText: { fontSize: 16, fontWeight: '600', color: colors.foreground, flex: 1 },
  sectionContent: { padding: 20 },
  
  // List items
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  listItemLast: { borderBottomWidth: 0 },
  listItemLeft: { flex: 1 },
  listItemTitle: { fontSize: 15, fontWeight: '500', color: colors.foreground, marginBottom: 2 },
  listItemSubtitle: { fontSize: 13, color: colors.mutedForeground },
  listItemRight: { alignItems: 'flex-end' },
  listItemValue: { fontSize: 15, fontWeight: '600', color: colors.foreground },
  listItemBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4, backgroundColor: colors.muted },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  
  // FAB
  fabContainer: { position: 'absolute', bottom: 24, right: 24, zIndex: 1000 },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.foreground, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, zIndex: 1002 },
  fabMenu: { position: 'absolute', bottom: 70, right: 0, zIndex: 1001, backgroundColor: 'transparent' },
  fabMenuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'flex-end' },
  fabMenuButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
  fabMenuLabel: { backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 12, borderWidth: 1, borderColor: colors.border, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, minWidth: 100 },
  fabMenuLabelText: { fontSize: 14, fontWeight: '500', color: colors.foreground, textAlign: 'center' },
  
  // Loading and empty states
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { fontSize: 16, color: colors.foreground, marginTop: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyStateIcon: { marginBottom: 12 },
  emptyStateTitle: { fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  emptyStateDescription: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center' },
  
  // Status bars
  offlineBar: { backgroundColor: colors.muted, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  offlineText: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  offlineSubtext: { fontSize: 10, color: colors.mutedForeground, marginTop: 2 },
  
  // *** NEW: Sync status bar styles ***
  syncBar: {
    backgroundColor: colors.muted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  syncBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBarText: {
    fontSize: 14,
    color: colors.foreground,
    textAlign: 'center',
  },
  
  // *** NEW: Local data indicator styles ***
  localDataBar: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  localDataText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // *** NEW: Profit warning styles ***
  profitWarning: {
    fontSize: 12,
    color: colors.destructive,
    fontStyle: 'italic',
  },
  
  // Retry button
  retryButton: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 8 },
  retryButtonText: { color: colors.primaryForeground, fontWeight: '600', fontSize: 14 },
});