// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// interface AnalyticsTabProps {
//   stats: any;
//   transactions: any[];
//   colors: any;
//   isDark: boolean;
// }

// export default function AnalyticsTab({ stats, transactions, colors, isDark }: AnalyticsTabProps) {
//   const styles = createStyles(colors, isDark);
  
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Financial Analytics</Text>
      
//       {/* Cash Flow Trends */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Cash Flow Trends</Text>
//         <View style={styles.trendCard}>
//           <Text style={styles.trendValue}>₹{stats.netFlow?.toLocaleString() || '0'}</Text>
//           <Text style={styles.trendLabel}>Net Cash Flow This Month</Text>
//           <Text style={[
//             styles.trendChange,
//             { color: stats.netFlow >= 0 ? colors.primary : colors.destructive }
//           ]}>
//             {stats.netFlow >= 0 ? '+' : ''}
//             {((stats.netFlow / Math.max(stats.totalIncome, 1)) * 100).toFixed(1)}% vs last month
//           </Text>
//         </View>
//       </View>

//       {/* Key Metrics */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
//         <View style={styles.metricsGrid}>
//           <View style={styles.metricCard}>
//             <Text style={styles.metricValue}>
//               {stats.totalIncome > 0 ? ((stats.netFlow / stats.totalIncome) * 100).toFixed(1) : '0'}%
//             </Text>
//             <Text style={styles.metricLabel}>Profit Margin</Text>
//           </View>
//           <View style={styles.metricCard}>
//             <Text style={styles.metricValue}>
//               ₹{transactions.length > 0 ? (stats.totalIncome / transactions.filter(t => t.type === 'Income').length || 1).toFixed(0) : '0'}
//             </Text>
//             <Text style={styles.metricLabel}>Avg Transaction</Text>
//           </View>
//           <View style={styles.metricCard}>
//             <Text style={styles.metricValue}>
//               {transactions.filter(t => t.type === 'Income').length}
//             </Text>
//             <Text style={styles.metricLabel}>Total Sales</Text>
//           </View>
//           <View style={styles.metricCard}>
//             <Text style={styles.metricValue}>
//               {transactions.filter(t => t.type === 'Expense').length}
//             </Text>
//             <Text style={styles.metricLabel}>Total Expenses</Text>
//           </View>
//         </View>
//       </View>

//       {/* Insights */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Business Insights</Text>
//         <View style={styles.insightCard}>
//           <Text style={styles.insightText}>
//             {stats.netFlow > 0 
//               ? "💰 Your business is profitable this month. Consider investing in growth opportunities."
//               : stats.netFlow < 0 
//                 ? "⚠️ Your expenses exceed income. Review your cost structure and focus on increasing sales."
//                 : "📊 Your business is breaking even. Look for opportunities to increase profitability."
//             }
//           </Text>
//         </View>
        
//         <View style={styles.insightCard}>
//           <Text style={styles.insightText}>
//             📈 Revenue trend: Your business has processed {transactions.filter(t => t.type === 'Income').length} income transactions 
//             and {transactions.filter(t => t.type === 'Expense').length} expense transactions this period.
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// }

// const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
//   container: {
//     flex: 1,
//     gap: 24,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: colors.foreground,
//   },
//   section: {
//     gap: 12,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.foreground,
//   },
//   trendCard: {
//     backgroundColor: colors.card,
//     borderRadius: 12,
//     padding: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   trendValue: {
//     fontSize: 32,
//     fontWeight: '700',
//     color: colors.primary,
//     marginBottom: 8,
//   },
//   trendLabel: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: colors.foreground,
//     marginBottom: 4,
//   },
//   trendChange: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   metricsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   metricCard: {
//     flex: 1,
//     minWidth: 150,
//     backgroundColor: colors.card,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   metricValue: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: colors.primary,
//     marginBottom: 4,
//   },
//   metricLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: colors.mutedForeground,
//     textAlign: 'center',
//   },
//   insightCard: {
//     backgroundColor: colors.card,
//     borderRadius: 12,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   insightText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: colors.foreground,
//   },
// });
