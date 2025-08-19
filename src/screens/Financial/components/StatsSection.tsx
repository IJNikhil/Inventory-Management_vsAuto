// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
// import Reanimated from 'react-native-reanimated';
// import MetricCard from './MetricCard';

// const { width: screenWidth } = Dimensions.get('window');

// interface StatsSectionProps {
//   stats: {
//     totalIncome: number;
//     totalExpenses: number;
//     netFlow: number;
//     totalReceivables: number;
//   };
//   isLoading: boolean;
//   colors: any;
//   isDark: boolean;
// }

// // Loading Card Component - Dashboard Style
// const LoadingCard = ({ colors, isDark }: { colors: any; isDark: boolean }) => {
//   const styles = createStyles(colors, isDark);
  
//   return (
//     <View style={styles.metricCard}>
//       <View style={styles.loadingLine} />
//       <View style={[styles.loadingLine, { width: '70%' }]} />
//       <View style={[styles.loadingLine, { width: '50%' }]} />
//     </View>
//   );
// };

// export default function StatsSection({ stats, isLoading, colors, isDark }: StatsSectionProps) {
//   const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('month');
//   const styles = createStyles(colors, isDark);

//   // Calculate progress for the current period
//   const progress = Math.min(stats.totalIncome / 100000, 1);

//   // Calculate growth percentages (you can customize this logic)
//   const monthGrowth = 12; // Example growth percentage
//   const incomeGrowth = stats.totalIncome > stats.totalExpenses ? 8 : -3;
//   const expenseGrowth = -5; // Negative is good for expenses
//   const receivablesGrowth = stats.totalReceivables > 0 ? 15 : 0;

//   if (isLoading) {
//     return (
//       <View style={styles.statsContainer}>
//         {/* Metrics Grid Loading */}
//         <View style={styles.metricsGrid}>
//           <LoadingCard colors={colors} isDark={isDark} />
//           <LoadingCard colors={colors} isDark={isDark} />
//           <LoadingCard colors={colors} isDark={isDark} />
//           <LoadingCard colors={colors} isDark={isDark} />
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.statsContainer}>
//       {/* Metrics Grid - Dashboard Style */}
//       <View style={styles.metricsGrid}>
//         <MetricCard
//           title="Monthly Sales"
//           value={`₹${stats.totalIncome.toLocaleString()}`}
//           change={incomeGrowth > 0 ? `+${incomeGrowth}%` : `${incomeGrowth}%`}
//           colors={colors}
//         />
//         <MetricCard
//           title="Monthly Profit"
//           value={`₹${stats.netFlow.toLocaleString()}`}
//           change={monthGrowth > 0 ? `+${Math.round(monthGrowth * 0.6)}%` : `${Math.round(monthGrowth * 0.6)}%`}
//           colors={colors}
//         />
//         <MetricCard
//           title="Total Expenses"
//           value={`₹${stats.totalExpenses.toLocaleString()}`}
//           change={expenseGrowth > 0 ? `+${expenseGrowth}%` : `${expenseGrowth}%`}
//           colors={colors}
//         />
//         <MetricCard
//           title="Receivables"
//           value={`₹${stats.totalReceivables.toLocaleString()}`}
//           change={receivablesGrowth > 0 ? `+${receivablesGrowth}%` : undefined}
//           colors={colors}
//         />
//       </View>
//     </View>
//   );
// }

// const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
//   // Stats Container
//   statsContainer: {
//     marginBottom: 24,
//   },

//   // Metrics grid (Dashboard style)
//   metricsGrid: { 
//     flexDirection: 'row', 
//     flexWrap: 'wrap', 
//     justifyContent: 'space-between', 
//   },
//   metricCard: { 
//     width: (screenWidth - 60) / 2, 
//     backgroundColor: colors.card, 
//     borderRadius: 12, 
//     padding: 20, 
//     marginBottom: 12, 
//     borderWidth: 1, 
//     borderColor: colors.border,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: isDark ? 0.3 : 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   loadingLine: {
//     height: 12,
//     backgroundColor: colors.muted,
//     borderRadius: 6,
//     marginBottom: 8,
//   },
// });
