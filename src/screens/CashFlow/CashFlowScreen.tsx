// import React, { useState, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text as RNText,
//   ScrollView,
//   StatusBar,
//   RefreshControl,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import FeatherIcon from "react-native-vector-icons/Feather";
// import Reanimated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
// } from "react-native-reanimated";
// import { useColors, useTheme } from '../../context/ThemeContext';
// import { useCashFlowData } from './hooks/useCashFlowData';
// import { useTransactionOperations } from './hooks/useTransactionOperations';
// import { filterTransactions, calculateStats } from './utils/helpers';

// // Components
// import StatsSection from './components/StatsSection';
// import EmptyState from './components/EmptyState';
// import ModernTransactionModal from './components/ModernTransactionModal';

// const { width: screenWidth } = Dimensions.get('window');

// export type FilterType = {
//   type: 'all' | 'income' | 'expense';
//   status: 'all' | 'paid' | 'pending' | 'overdue';
// };

// type CombinedTransaction = {
//   id: string;
//   date: string;
//   description: string;
//   amount: number;
//   type: 'Income' | 'Expense';
//   status: 'Paid' | 'Pending' | 'Overdue';
//   source: 'Invoice' | 'Manual' | 'Stock Purchase';
//   sourceId?: string;
// };

// // Filter Dropdown Component
// const FilterDropdown = ({ 
//   label, 
//   value, 
//   options, 
//   onSelect, 
//   colors 
// }: { 
//   label: string; 
//   value: string; 
//   options: string[]; 
//   onSelect: (value: string) => void; 
//   colors: any;
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const styles = createFilterStyles(colors);

//   return (
//     <View style={styles.dropdownContainer}>
//       <RNText style={styles.dropdownLabel}>{label}:</RNText>
//       <TouchableOpacity 
//         style={styles.dropdown} 
//         onPress={() => setIsOpen(!isOpen)}
//         activeOpacity={0.7}
//       >
//         <RNText style={styles.dropdownText}>
//           {value.charAt(0).toUpperCase() + value.slice(1)}
//         </RNText>
//         <FeatherIcon 
//           name={isOpen ? "chevron-up" : "chevron-down"} 
//           size={16} 
//           color={colors.mutedForeground} 
//         />
//       </TouchableOpacity>
      
//       {isOpen && (
//         <View style={styles.dropdownMenu}>
//           {options.map((option) => (
//             <TouchableOpacity
//               key={option}
//               style={[
//                 styles.dropdownItem,
//                 value === option && styles.dropdownItemActive
//               ]}
//               onPress={() => {
//                 onSelect(option);
//                 setIsOpen(false);
//               }}
//               activeOpacity={0.7}
//             >
//               <RNText style={[
//                 styles.dropdownItemText,
//                 value === option && styles.dropdownItemTextActive
//               ]}>
//                 {option.charAt(0).toUpperCase() + option.slice(1)}
//               </RNText>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}
//     </View>
//   );
// };

// export default function CashFlowScreen({ navigation }: any) {
//   const colors = useColors();
//   const { isDark } = useTheme();
  
//   const {
//     combinedTransactions,
//     isLoading,
//     isRefreshing,
//     error,
//     onRefresh,
//     refetch,
//   } = useCashFlowData();
  
//   const { handleAddTransaction, isProcessing } = useTransactionOperations();
  
//   const [filters, setFilters] = useState<FilterType>({
//     type: 'all',
//     status: 'all',
//   });
//   const [transactionModal, setTransactionModal] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);

//   const styles = createStyles(colors, isDark);

//   // FAB Animation
//   const fabRotation = useSharedValue(0);
//   const animatedFabStyle = useAnimatedStyle(() => ({ 
//     transform: [{ rotate: `${fabRotation.value}deg` }] 
//   }));

//   const animatedMenuStyle = useAnimatedStyle(() => ({
//     opacity: menuOpen ? 1 : 0,
//     transform: [{ scale: menuOpen ? 1 : 0.5 }],
//     pointerEvents: menuOpen ? 'auto' : 'none',
//   }));

//   const toggleMenu = () => {
//     setMenuOpen(!menuOpen);
//     fabRotation.value = withSpring(menuOpen ? 0 : 45);
//   };

//   const handleMenuItemPress = (onPress: () => void) => {
//     toggleMenu();
//     setTimeout(() => onPress(), 200);
//   };

//   // Memoized calculations
//   const stats = useMemo(() => calculateStats(combinedTransactions), [combinedTransactions]);
//   const filteredTransactions = useMemo(
//     () => filterTransactions(combinedTransactions, filters, ''),
//     [combinedTransactions, filters]
//   );

//   const handleFilterChange = useCallback((newFilters: Partial<FilterType>) => {
//     setFilters((prev: FilterType) => ({ ...prev, ...newFilters }));
//   }, []);

//   const handleAddTransactionSuccess = useCallback(() => {
//     setTransactionModal(false);
//     refetch(true);
//   }, [refetch]);

//   const onAddTransaction = useCallback(
//     async (transaction: any) => {
//       try {
//         const success = await handleAddTransaction(transaction);
//         if (success) {
//           handleAddTransactionSuccess();
//         }
//       } catch (error) {
//         console.error('Error adding transaction:', error);
//       }
//     },
//     [handleAddTransaction, handleAddTransactionSuccess]
//   );

//   // Format transaction data for display
//   const formatDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', { 
//         month: 'short', 
//         day: 'numeric',
//         year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
//       });
//     } catch (error) {
//       return dateString;
//     }
//   };

//   // Error handling
//   if (error && !isLoading && combinedTransactions.length === 0) {
//     return (
//       <View style={styles.container}>
//         <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
//         <View style={styles.loadingContainer}>
//           <FeatherIcon name="alert-circle" size={24} color={colors.destructive} />
//           <RNText style={[styles.loadingText, { color: colors.destructive }]}>
//             Failed to load cash flow data
//           </RNText>
//           <TouchableOpacity onPress={() => refetch(true)} style={styles.retryButton}>
//             <RNText style={styles.retryButtonText}>Retry</RNText>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   if (isLoading && !combinedTransactions.length) {
//     return (
//       <View style={styles.container}>
//         <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={colors.primary} />
//           <RNText style={styles.loadingText}>Loading Cash Flow...</RNText>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
      
//       <ScrollView 
//         style={styles.scrollContainer} 
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.contentContainer}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         {/* Stats Section */}
//         <StatsSection 
//           stats={stats} 
//           isLoading={isLoading} 
//           colors={colors} 
//           isDark={isDark}
//         />

//         {/* Compact Filter Section */}
//         <View style={styles.filterSection}>
//           <View style={styles.filterRow}>
//             <FilterDropdown
//               label="Type"
//               value={filters.type}
//               options={['all', 'income', 'expense']}
//               onSelect={(value) => handleFilterChange({ type: value as FilterType['type'] })}
//               colors={colors}
//             />
//             <FilterDropdown
//               label="Status"
//               value={filters.status}
//               options={['all', 'paid', 'pending', 'overdue']}
//               onSelect={(value) => handleFilterChange({ status: value as FilterType['status'] })}
//               colors={colors}
//             />
//           </View>
//         </View>

//         {/* Transaction History Section */}
//         <View style={styles.historySection}>
//           <View style={styles.historyHeader}>
//             <RNText style={styles.historyTitle}>
//               Transaction History ({filteredTransactions.length})
//             </RNText>
//             {filteredTransactions.length > 10 && (
//               <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.7}>
//                 <RNText style={styles.viewAllText}>View All</RNText>
//               </TouchableOpacity>
//             )}
//           </View>

//           {isLoading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="small" color={colors.primary} />
//               <RNText style={styles.loadingText}>Loading transactions...</RNText>
//             </View>
//           ) : filteredTransactions.length > 0 ? (
//             <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollContainer}>
//               <View style={styles.tableContainer}>
//                 {/* Table Header */}
//                 <View style={styles.tableHeader}>
//                   <RNText style={[styles.tableHeaderText, styles.dateColumn]}>Date</RNText>
//                   <RNText style={[styles.tableHeaderText, styles.descriptionColumn]}>Description</RNText>
//                   <RNText style={[styles.tableHeaderText, styles.sourceColumn]}>Source</RNText>
//                   <RNText style={[styles.tableHeaderText, styles.typeColumn]}>Type</RNText>
//                   <RNText style={[styles.tableHeaderText, styles.amountColumn]}>Amount</RNText>
//                   <RNText style={[styles.tableHeaderText, styles.statusColumn]}>Status</RNText>
//                 </View>

//                 {/* Table Rows */}
//                 <View style={styles.tableBody}>
//                   {filteredTransactions.slice(0, 10).map((tx, index) => {
//                     const isIncome = tx.type === 'Income';
//                     const statusColor = 
//                       tx.status === 'Paid' ? colors.primary :
//                       tx.status === 'Pending' ? colors.accent :
//                       colors.destructive;
                    
//                     return (
//                       <View key={tx.id} style={styles.tableRow}>
//                         <RNText style={[styles.tableCellText, styles.dateColumn]}>
//                           {formatDate(tx.date)}
//                         </RNText>
//                         <RNText style={[styles.tableCellText, styles.descriptionColumn]} numberOfLines={2}>
//                           {tx.description || 'No description'}
//                         </RNText>
//                         <RNText style={[styles.tableCellText, styles.sourceColumn]}>
//                           {tx.source}
//                         </RNText>
//                         <RNText style={[styles.tableCellText, styles.typeColumn]}>
//                           {tx.type}
//                         </RNText>
//                         <RNText style={[
//                           styles.tableCellText, 
//                           styles.amountColumn,
//                           { color: isIncome ? colors.primary : colors.destructive }
//                         ]}>
//                           {isIncome ? '+' : '-'}₹{Math.abs(tx.amount || 0).toLocaleString()}
//                         </RNText>
//                         <View style={[styles.tableCell, styles.statusColumn]}>
//                           <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
//                             <RNText style={[styles.statusText, { color: statusColor }]}>
//                               {tx.status}
//                             </RNText>
//                           </View>
//                         </View>
//                       </View>
//                     );
//                   })}
//                 </View>

//                 {filteredTransactions.length > 10 && (
//                   <TouchableOpacity style={styles.showMoreButton} activeOpacity={0.7}>
//                     <RNText style={styles.showMoreText}>
//                       Show {filteredTransactions.length - 10} more transactions
//                     </RNText>
//                     <FeatherIcon name="chevron-down" size={16} color={colors.mutedForeground} />
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </ScrollView>
//           ) : (
//             <EmptyState 
//               icon="activity" 
//               title="No Transactions Found" 
//               description="No transactions match your current filters" 
//               colors={colors}
//               isDark={isDark}
//             />
//           )}
//         </View>
//       </ScrollView>

//       {/* Floating Action Button with Menu */}
//       <View style={styles.fabContainer}>
//         {menuOpen && (
//           <TouchableWithoutFeedback onPress={toggleMenu}>
//             <View style={styles.fabOverlay} />
//           </TouchableWithoutFeedback>
//         )}
//         <Reanimated.View style={[styles.fabMenu, animatedMenuStyle]}>
//           {[
//             { icon: 'refresh-cw', label: 'Refresh', onPress: () => refetch(true) },
//             { icon: 'plus-circle', label: 'Add Expense', onPress: () => setTransactionModal(true) },
//             { icon: 'file-text', label: 'New Invoice', onPress: () => navigation.navigate("InvoiceNewScreen") },
//             { icon: 'bar-chart', label: 'Analytics', onPress: () => {} },
//           ].map(item => (
//             <View key={item.label} style={styles.fabMenuItem}>
//               <View style={styles.fabMenuLabel}>
//                 <RNText style={styles.fabMenuLabelText}>{item.label}</RNText>
//               </View>
//               <TouchableOpacity 
//                 style={styles.fabMenuButton} 
//                 onPress={() => handleMenuItemPress(item.onPress)} 
//                 activeOpacity={0.7}
//               >
//                 <FeatherIcon name={item.icon} size={20} color={colors.background} />
//               </TouchableOpacity>
//             </View>
//           ))}
//         </Reanimated.View>
//         <TouchableOpacity style={styles.fab} onPress={toggleMenu} activeOpacity={0.8}>
//           <Reanimated.View style={animatedFabStyle}>
//             <FeatherIcon name={menuOpen ? "x" : "plus"} size={24} color={colors.background} />
//           </Reanimated.View>
//         </TouchableOpacity>
//       </View>

//       {/* Modern Transaction Modal */}
//       <ModernTransactionModal
//         visible={transactionModal}
//         onClose={() => setTransactionModal(false)}
//         onSave={onAddTransaction}
//         currentUser="Shop Owner"
//         colors={colors}
//         isDark={isDark}
//         isProcessing={isProcessing}
//       />
//     </View>
//   );
// }

// // Filter Dropdown Styles
// const createFilterStyles = (colors: any) => StyleSheet.create({
//   dropdownContainer: {
//     position: 'relative',
//     zIndex: 1000,
//     minWidth: 120,
//   },
//   dropdownLabel: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: colors.foreground,
//     marginBottom: 4,
//   },
//   dropdown: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     backgroundColor: colors.background,
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 6,
//     minHeight: 36,
//   },
//   dropdownText: {
//     fontSize: 14,
//     color: colors.foreground,
//     flex: 1,
//   },
//   dropdownMenu: {
//     position: 'absolute',
//     top: '100%',
//     left: 0,
//     right: 0,
//     backgroundColor: colors.card,
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 6,
//     marginTop: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 5,
//     zIndex: 1001,
//   },
//   dropdownItem: {
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//   },
//   dropdownItemActive: {
//     backgroundColor: colors.primary + '20',
//   },
//   dropdownItemText: {
//     fontSize: 14,
//     color: colors.foreground,
//   },
//   dropdownItemTextActive: {
//     color: colors.primary,
//     fontWeight: '500',
//   },
// });

// const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: colors.background 
//   },
//   scrollContainer: { 
//     flex: 1 
//   },
//   contentContainer: { 
//     padding: 24, 
//     paddingBottom: 120 
//   },

//   // Compact Filter Section
//   filterSection: {
//     marginBottom: 24,
//     paddingVertical: 8,
//   },
//   filterRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 16,
//   },

//   // History Section
//   historySection: {
//     marginBottom: 16,
//   },
//   historyHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 4,
//   },
//   historyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: colors.foreground,
//   },
//   viewAllButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   viewAllText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: colors.primary,
//   },

//   // Horizontally Scrollable Table
//   tableScrollContainer: {
//     flex: 1,
//   },
//   tableContainer: {
//     minWidth: screenWidth * 1.5, // Make table wider than screen
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: colors.muted,
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
//   tableHeaderText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: colors.foreground,
//     textTransform: 'uppercase',
//   },
//   tableBody: {
//     backgroundColor: colors.card,
//     borderBottomLeftRadius: 8,
//     borderBottomRightRadius: 8,
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderTopWidth: 0,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     minHeight: 56,
//   },
//   tableCell: {
//     justifyContent: 'center',
//   },
//   tableCellText: {
//     fontSize: 14,
//     color: colors.foreground,
//   },

//   // Fixed Column Widths (wider for horizontal scroll)
//   dateColumn: {
//     width: 100,
//   },
//   descriptionColumn: {
//     width: 200,
//   },
//   sourceColumn: {
//     width: 120,
//   },
//   typeColumn: {
//     width: 80,
//   },
//   amountColumn: {
//     width: 120,
//     textAlign: 'right',
//   },
//   statusColumn: {
//     width: 100,
//     alignItems: 'center',
//   },

//   // Status Badge
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     minWidth: 60,
//     alignItems: 'center',
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: '600',
//   },

//   // Show More Button
//   showMoreButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//     gap: 8,
//   },
//   showMoreText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: colors.mutedForeground,
//   },

//   // FAB (Dashboard style)
//   fabContainer: { 
//     position: 'absolute', 
//     bottom: 24, 
//     right: 24, 
//     zIndex: 1000 
//   },
//   fabOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 999,
//   },
//   fab: { 
//     width: 56, 
//     height: 56, 
//     borderRadius: 28, 
//     backgroundColor: colors.foreground, 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     elevation: 8, 
//     shadowColor: '#000', 
//     shadowOffset: { width: 0, height: 4 }, 
//     shadowOpacity: 0.25, 
//     shadowRadius: 8, 
//     zIndex: 1002 
//   },
//   fabMenu: { 
//     position: 'absolute', 
//     bottom: 70, 
//     right: 0, 
//     zIndex: 1001, 
//     backgroundColor: 'transparent' 
//   },
//   fabMenuItem: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     marginBottom: 12, 
//     justifyContent: 'flex-end' 
//   },
//   fabMenuButton: { 
//     width: 48, 
//     height: 48, 
//     borderRadius: 24, 
//     backgroundColor: colors.card, 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     borderWidth: 1, 
//     borderColor: colors.border, 
//     elevation: 6, 
//     shadowColor: '#000', 
//     shadowOffset: { width: 0, height: 3 }, 
//     shadowOpacity: 0.2, 
//     shadowRadius: 6 
//   },
//   fabMenuLabel: { 
//     backgroundColor: colors.card, 
//     paddingHorizontal: 16, 
//     paddingVertical: 10, 
//     borderRadius: 8, 
//     marginRight: 12, 
//     borderWidth: 1, 
//     borderColor: colors.border, 
//     elevation: 4, 
//     shadowColor: '#000', 
//     shadowOffset: { width: 0, height: 2 }, 
//     shadowOpacity: 0.15, 
//     shadowRadius: 4, 
//     minWidth: 100 
//   },
//   fabMenuLabelText: { 
//     fontSize: 14, 
//     fontWeight: '500', 
//     color: colors.foreground, 
//     textAlign: 'center' 
//   },

//   // Loading and error states
//   loadingContainer: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     paddingVertical: 32,
//     gap: 8,
//   },
//   loadingText: { 
//     fontSize: 14, 
//     color: colors.mutedForeground, 
//   },
//   retryButton: { 
//     marginTop: 16, 
//     paddingHorizontal: 24, 
//     paddingVertical: 12, 
//     backgroundColor: colors.primary, 
//     borderRadius: 8 
//   },
//   retryButtonText: { 
//     color: colors.primaryForeground, 
//     fontWeight: '600', 
//     fontSize: 14 
//   },
// });
