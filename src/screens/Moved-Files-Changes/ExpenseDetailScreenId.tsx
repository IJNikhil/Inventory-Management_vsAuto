// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   ScrollView,
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   FlatList,
//   StyleSheet,
//   ActivityIndicator,
//   Platform,
//   RefreshControl,
// } from 'react-native';
// import {
//   ArrowLeft,
//   Truck,
//   Wallet,
//   Printer,
//   Download,
//   CalendarDays,
//   User,
//   Loader2,
//   X,
//   CheckCircle,
// } from 'lucide-react-native';
// import { format } from 'date-fns';

// import { useToast } from '../hooks/use-toast';
// import { getStockPurchaseById, updateStockPurchaseStatus } from '../services/stock-service';
// import { getShopDetails } from '../services/shop-service';
// import { Skeleton } from '../components/ui/Skeleton';
// import { useAppSelector } from '../lib/redux/hooks';
// import { selectAuth } from '../lib/redux/slices/auth-slice';
// import { useColors, useTheme } from '../context/ThemeContext';
// import type { StockPurchase, ShopDetails } from '../types';
// import { Badge } from '../components/ui/Badge';

// // Table column widths for horizontal scrolling
// const COLUMN_WIDTHS = {
//   item: 180,
//   quantity: 80,
//   price: 120,
//   total: 120,
// };

// const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer'] as const;
// type PaymentMethod = typeof PAYMENT_METHODS[number];

// export default function ExpenseDetailScreenId({ route, navigation }: any) {
//   const expenseId = route?.params?.id as string;
//   const { user } = useAppSelector(selectAuth);
//   const { toast } = useToast();

//   // Theme hooks
//   const colors = useColors();
//   const { isDark } = useTheme();

//   const [expense, setExpense] = useState<StockPurchase | null>(null);
//   const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
//   const [isPaidDialog, setIsPaidDialog] = useState<boolean>(false);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Cash');
//   const [isSavingStatus, setIsSavingStatus] = useState<boolean>(false);

//   const loadExpenseData = useCallback(async (showLoading = true) => {
//     if (!expenseId) return;
//     if (showLoading) setIsLoading(true);
    
//     try {
//       const [fetchedExpense, shop] = await Promise.all([
//         getStockPurchaseById(expenseId), 
//         getShopDetails()
//       ]);
      
//       if (fetchedExpense) {
//         setExpense(fetchedExpense);
//         setShopDetails(shop);
//       } else {
//         toast({ title: 'Error', description: 'Expense not found.', variant: 'destructive' });
//         navigation.navigate('CashFlow');
//       }
//     } catch {
//       toast({ title: 'Error', description: 'Could not fetch required data.', variant: 'destructive' });
//     } finally {
//       if (showLoading) setIsLoading(false);
//     }
//   }, [expenseId, navigation, toast]);

//   useEffect(() => {
//     loadExpenseData(true);
//   }, [loadExpenseData]);

//   // Refresh function
//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     try {
//       await loadExpenseData(false);
//       toast({ title: 'Refreshed', description: 'Expense data updated successfully.' });
//     } catch (error) {
//       console.error('Error refreshing expense:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   }, [loadExpenseData, toast]);

//   const handlePrint = () => {
//     toast({ title: 'Print', description: 'Printing not supported in mobile app.' });
//   };

//   const handleUpdateStatus = async () => {
//     if (!expense) return;
//     setIsSavingStatus(true);
//     try {
//       const updatedExpense = await updateStockPurchaseStatus(
//         expense.id,
//         'Paid',
//         user?.name ?? 'System',
//         selectedPaymentMethod as StockPurchase['paymentMethod'],
//       );
//       if (updatedExpense) {
//         setExpense(updatedExpense);
//         setIsPaidDialog(false);
//         toast({ title: 'Success', description: `Expense ${expense.id} marked as Paid.` });
//       } else {
//         toast({ title: 'Error', description: 'Failed to update expense status.', variant: 'destructive' });
//       }
//     } catch (error) {
//       toast({ title: 'Error', description: 'Failed to update expense status.', variant: 'destructive' });
//     }
//     setIsSavingStatus(false);
//   };

//   const handleOpenReceipt = () => {
//     if (expense?.receiptUrl) {
//       toast({ title: 'External Link', description: 'Open attachment in browser.' });
//       // Or use Linking.openURL(expense.receiptUrl)
//     }
//   };

//   // Loading state
//   if (isLoading) {
//     return (
//       <View style={[styles.container, { backgroundColor: colors.background }]}>
//         <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
//           <Skeleton style={{ height: 36, width: 144 }} />
//           <View style={{ flexDirection: 'row', gap: 8 }}>
//             <Skeleton style={{ height: 36, width: 96 }} />
//             <Skeleton style={{ height: 36, width: 96 }} />
//           </View>
//         </View>
//         <View style={[styles.card, { backgroundColor: colors.card }]}>
//           <Skeleton style={{ height: 32, width: '50%', marginBottom: 16 }} />
//           <Skeleton style={{ height: 160, width: '100%' }} />
//         </View>
//       </View>
//     );
//   }

//   // Not found state
//   if (!expense || !shopDetails) {
//     return (
//       <View style={[styles.notFoundRoot, { backgroundColor: colors.background }]}>
//         <Text style={[styles.notFoundHeadline, { color: colors.foreground }]}>
//           Expense Record Not Found
//         </Text>
//         <Text style={[styles.notFoundSub, { color: colors.mutedForeground }]}>
//           The requested expense could not be found.
//         </Text>
//         <TouchableOpacity
//           onPress={() => navigation.navigate('CashFlow')}
//           style={[styles.backPrimaryBtn, { backgroundColor: colors.primary }]}
//           activeOpacity={0.8}
//         >
//           <ArrowLeft size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//           <Text style={[styles.backPrimaryBtnText, { color: colors.primaryForeground }]}>
//             Back to Cash Flow
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const totalTableWidth = Object.values(COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0);

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* Header */}
//       <View style={[styles.header, { 
//         backgroundColor: colors.card,
//         borderBottomColor: colors.border 
//       }]}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={[styles.backBtn, {
//             backgroundColor: colors.background,
//             borderColor: colors.border
//           }]}
//           activeOpacity={0.7}
//         >
//           <ArrowLeft size={18} color={colors.primary} style={{ marginRight: 8 }} />
//           <Text style={[styles.backBtnText, { color: colors.primary }]}>Back to Cash Flow</Text>
//         </TouchableOpacity>
        
//         <View style={styles.headerActions}>
//           {expense.receiptUrl && (
//             <TouchableOpacity
//               onPress={handleOpenReceipt}
//               style={[styles.actionButton, {
//                 backgroundColor: colors.background,
//                 borderColor: colors.border
//               }]}
//               activeOpacity={0.7}
//             >
//               <Download size={16} color={colors.primary} />
//               <Text style={[styles.actionButtonText, { color: colors.primary }]}>Receipt</Text>
//             </TouchableOpacity>
//           )}
          
//           {expense.status === 'Pending' && (
//             <TouchableOpacity
//               onPress={() => setIsPaidDialog(true)}
//               style={[styles.markPaidBtn, { backgroundColor: colors.primary }]}
//               activeOpacity={0.8}
//             >
//               <Wallet size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//               <Text style={[styles.markPaidBtnText, { color: colors.primaryForeground }]}>
//                 Mark as Paid
//               </Text>
//             </TouchableOpacity>
//           )}
          
//           <TouchableOpacity
//             onPress={handlePrint}
//             style={[styles.actionButton, {
//               backgroundColor: colors.background,
//               borderColor: colors.border
//             }]}
//             activeOpacity={0.7}
//           >
//             <Printer size={16} color={colors.primary} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView 
//         style={{ flex: 1 }}
//         contentContainerStyle={{ paddingBottom: 24 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         {/* Main Card */}
//         <View style={[styles.card, { backgroundColor: colors.card }]}>
//           {/* Header Section */}
//           <View style={[styles.cardSection, { borderBottomColor: colors.border }]}>
//             <View style={styles.headerInfo}>
//               <View style={styles.companyInfo}>
//                 <View style={styles.infoBlock}>
//                   <Text style={[styles.label, { color: colors.mutedForeground }]}>Purchased By</Text>
//                   <Text style={[styles.companyName, { color: colors.foreground }]}>
//                     {shopDetails.name}
//                   </Text>
//                   <Text style={[styles.address, { color: colors.mutedForeground }]}>
//                     {shopDetails.address}
//                   </Text>
//                 </View>
                
//                 <View style={styles.infoBlock}>
//                   <Text style={[styles.label, { color: colors.mutedForeground }]}>Supplier</Text>
//                   <Text style={[styles.supplierName, { color: colors.foreground }]}>
//                     {expense.supplier.name}
//                   </Text>
//                   <Text style={[styles.address, { color: colors.mutedForeground }]}>
//                     {expense.supplier.address}
//                   </Text>
//                   <Text style={[styles.address, { color: colors.mutedForeground }]}>
//                     {expense.supplier.phone}
//                   </Text>
//                 </View>
//               </View>
              
//               <View style={styles.expenseInfo}>
//                 <View style={styles.expenseHeader}>
//                   <Truck size={24} color={colors.primary} />
//                   <Text style={[styles.expenseTitle, { color: colors.primary }]}>
//                     STOCK EXPENSE
//                   </Text>
//                 </View>
                
//                 <View style={styles.expenseDetails}>
//                   <View style={styles.detailRow}>
//                     <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>#</Text>
//                     <Text style={[styles.detailValue, { 
//                       color: colors.foreground,
//                       fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' 
//                     }]}>
//                       {expense.id}
//                     </Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
//                       Date Issued:
//                     </Text>
//                     <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                       {format(new Date(expense.date), 'PPP')}
//                     </Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
//                       Payment Method:
//                     </Text>
//                     <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                       {expense.status === 'Paid' ? expense.paymentMethod : 'N/A'}
//                     </Text>
//                   </View>
//                 </View>
                
//                 <StatusBadge status={expense.status} colors={colors} />
//               </View>
//             </View>

//             {/* People & Payment Info */}
//             <View style={[styles.peopleSection, { borderTopColor: colors.border }]}>
//               <View style={styles.peopleInfo}>
//                 <User size={16} color={colors.primary} />
//                 <Text style={[styles.peopleText, { color: colors.foreground }]}>
//                   Recorded by: <Text style={[styles.highlight, { color: colors.primary }]}>
//                     {expense.createdBy}
//                   </Text>
//                 </Text>
//               </View>
              
//               {expense.paidBy && (
//                 <View style={styles.peopleInfo}>
//                   <User size={16} color={colors.primary} />
//                   <Text style={[styles.peopleText, { color: colors.foreground }]}>
//                     Paid by: <Text style={[styles.highlight, { color: colors.primary }]}>
//                       {expense.paidBy}
//                     </Text>
//                   </Text>
//                 </View>
//               )}
              
//               {expense.paymentDate && (
//                 <View style={styles.peopleInfo}>
//                   <CalendarDays size={16} color={colors.primary} />
//                   <Text style={[styles.peopleText, { color: colors.foreground }]}>
//                     Payment Date: <Text style={[styles.highlight, { color: colors.primary }]}>
//                       {format(new Date(expense.paymentDate), 'PPP')}
//                     </Text>
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </View>

//           {/* Items Table */}
//           <View style={styles.tableSection}>
//             <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Items</Text>
            
//             {/* Table Header */}
//             <ScrollView 
//               horizontal 
//               showsHorizontalScrollIndicator={false}
//               style={styles.tableScrollView}
//             >
//               <View style={[styles.tableHeader, { 
//                 backgroundColor: colors.muted,
//                 width: totalTableWidth
//               }]}>
//                 <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.item }]}>
//                   <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Item</Text>
//                 </View>
//                 <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.quantity }]}>
//                   <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Qty</Text>
//                 </View>
//                 <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.price }]}>
//                   <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Price</Text>
//                 </View>
//                 <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.total }]}>
//                   <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Total</Text>
//                 </View>
//               </View>
//             </ScrollView>

//             {/* Table Rows */}
//             {expense.items?.length ? (
//               <FlatList
//                 data={expense.items}
//                 keyExtractor={item => item.id}
//                 renderItem={({ item }) => (
//                   <ScrollView 
//                     horizontal 
//                     showsHorizontalScrollIndicator={false}
//                     style={styles.tableScrollView}
//                   >
//                     <View style={[styles.tableRow, { 
//                       borderBottomColor: colors.border,
//                       width: totalTableWidth
//                     }]}>
//                       <View style={[styles.tableCell, { width: COLUMN_WIDTHS.item }]}>
//                         <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>
//                           {item.name}
//                         </Text>
//                         <Text style={[styles.itemPartNumber, { color: colors.mutedForeground }]} numberOfLines={1}>
//                           {item.partNumber}
//                         </Text>
//                       </View>
                      
//                       <View style={[styles.tableCell, styles.centerAlign, { width: COLUMN_WIDTHS.quantity }]}>
//                         <Text style={[styles.cellText, { color: colors.foreground }]}>
//                           {item.quantity}
//                         </Text>
//                       </View>
                      
//                       <View style={[styles.tableCell, styles.rightAlign, { width: COLUMN_WIDTHS.price }]}>
//                         <Text style={[styles.cellText, { color: colors.foreground }]}>
//                           ₹{item.purchasePrice.toFixed(2)}
//                         </Text>
//                       </View>
                      
//                       <View style={[styles.tableCell, styles.rightAlign, { width: COLUMN_WIDTHS.total }]}>
//                         <Text style={[styles.totalText, { color: colors.foreground }]}>
//                           ₹{(item.quantity * item.purchasePrice).toFixed(2)}
//                         </Text>
//                       </View>
//                     </View>
//                   </ScrollView>
//                 )}
//                 scrollEnabled={false}
//               />
//             ) : (
//               <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
//                 No items found.
//               </Text>
//             )}
//           </View>

//           {/* Footer */}
//           <View style={[styles.cardFooter, { 
//             backgroundColor: colors.muted,
//             borderTopColor: colors.border 
//           }]}>
//             <View style={styles.notesSection}>
//               <Text style={[styles.notesTitle, { color: colors.foreground }]}>Notes</Text>
//               <Text style={[styles.notesText, { color: colors.mutedForeground }]}>
//                 {expense.notes || "No notes for this purchase."}
//               </Text>
//             </View>
            
//             <View style={styles.totalSection}>
//               <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
//               <Text style={[styles.totalAmount, { color: colors.foreground }]}>
//                 ₹{expense.total.toFixed(2)}
//               </Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Mark As Paid Modal */}
//       <Modal
//         visible={isPaidDialog}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setIsPaidDialog(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
//             <View style={styles.modalHeader}>
//               <Text style={[styles.modalTitle, { color: colors.foreground }]}>
//                 Mark Expense as Paid
//               </Text>
//               <TouchableOpacity 
//                 onPress={() => setIsPaidDialog(false)}
//                 style={styles.modalCloseButton}
//                 activeOpacity={0.7}
//               >
//                 <X size={24} color={colors.mutedForeground} />
//               </TouchableOpacity>
//             </View>
            
//             <Text style={[styles.modalText, { color: colors.mutedForeground }]}>
//               Select the payment method used for expense{' '}
//               <Text style={[styles.expenseCode, { 
//                 color: colors.primary,
//                 fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' 
//               }]}>
//                 {expense.id}
//               </Text>:
//             </Text>

//             <View style={styles.paymentMethodsContainer}>
//               {PAYMENT_METHODS.map((method) => (
//                 <TouchableOpacity
//                   key={method}
//                   onPress={() => setSelectedPaymentMethod(method as PaymentMethod)}
//                   style={[
//                     styles.paymentMethodOption,
//                     {
//                       backgroundColor: selectedPaymentMethod === method ? colors.primary : colors.background,
//                       borderColor: selectedPaymentMethod === method ? colors.primary : colors.border,
//                     }
//                   ]}
//                   activeOpacity={0.7}
//                 >
//                   {selectedPaymentMethod === method && (
//                     <CheckCircle size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//                   )}
//                   <Text style={[
//                     styles.paymentMethodText,
//                     { color: selectedPaymentMethod === method ? colors.primaryForeground : colors.foreground }
//                   ]}>
//                     {method}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 onPress={() => setIsPaidDialog(false)}
//                 style={[styles.modalCancelButton, { backgroundColor: colors.muted }]}
//                 disabled={isSavingStatus}
//                 activeOpacity={0.7}
//               >
//                 <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>
//                   Cancel
//                 </Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 onPress={handleUpdateStatus}
//                 style={[styles.modalConfirmButton, { 
//                   backgroundColor: colors.primary,
//                   opacity: isSavingStatus ? 0.7 : 1
//                 }]}
//                 disabled={isSavingStatus}
//                 activeOpacity={0.8}
//               >
//                 {isSavingStatus ? (
//                   <ActivityIndicator size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//                 ) : (
//                   <Wallet size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//                 )}
//                 <Text style={[styles.modalConfirmText, { color: colors.primaryForeground }]}>
//                   {isSavingStatus ? 'Processing...' : 'Confirm Payment'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// // Status Badge Component
// function StatusBadge({ status, colors }: { status: string; colors: any }) {
//   const isPaid = status === 'Paid';
  
//   return (
//     <View style={[
//       styles.statusBadge,
//       {
//         backgroundColor: isPaid ? colors.primary + '20' : colors.accent + '20',
//         borderColor: isPaid ? colors.primary : colors.accent,
//       }
//     ]}>
//       <Text style={[
//         styles.statusBadgeText,
//         { color: isPaid ? colors.primary : colors.accent }
//       ]}>
//         {status}
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   backBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 8,
//     borderWidth: 1,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//   },
//   backBtnText: {
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 8,
//     borderWidth: 1,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     gap: 6,
//   },
//   actionButtonText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   markPaidBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//   },
//   markPaidBtnText: {
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   // Card Styles
//   card: {
//     margin: 16,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 3,
//   },
//   cardSection: {
//     padding: 20,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   headerInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   companyInfo: {
//     flex: 1,
//     marginRight: 20,
//   },
//   infoBlock: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     marginBottom: 4,
//   },
//   companyName: {
//     fontSize: 16,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   supplierName: {
//     fontSize: 15,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   address: {
//     fontSize: 13,
//     lineHeight: 18,
//   },
//   expenseInfo: {
//     alignItems: 'flex-end',
//   },
//   expenseHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   expenseTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     marginLeft: 8,
//   },
//   expenseDetails: {
//     marginBottom: 16,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//     marginBottom: 4,
//     gap: 8,
//   },
//   detailLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   detailValue: {
//     fontSize: 13,
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     alignSelf: 'flex-start',
//   },
//   statusBadgeText: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'capitalize',
//   },
//   peopleSection: {
//     borderTopWidth: StyleSheet.hairlineWidth,
//     paddingTop: 16,
//   },
//   peopleInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     gap: 8,
//   },
//   peopleText: {
//     fontSize: 14,
//   },
//   highlight: {
//     fontWeight: '600',
//   },
//   // Table Styles
//   tableSection: {
//     padding: 20,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 16,
//   },
//   tableScrollView: {
//     flexGrow: 0,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   tableHeaderCell: {
//     paddingHorizontal: 8,
//     justifyContent: 'center',
//   },
//   tableHeaderText: {
//     fontWeight: '600',
//     fontSize: 12,
//     textTransform: 'uppercase',
//   },
//   tableRow: {
//     flexDirection: 'row',
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   tableCell: {
//     paddingHorizontal: 8,
//     justifyContent: 'center',
//   },
//   centerAlign: {
//     alignItems: 'center',
//   },
//   rightAlign: {
//     alignItems: 'flex-end',
//   },
//   itemName: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom: 2,
//   },
//   itemPartNumber: {
//     fontSize: 12,
//   },
//   cellText: {
//     fontSize: 13,
//   },
//   totalText: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   emptyText: {
//     textAlign: 'center',
//     fontSize: 14,
//     fontStyle: 'italic',
//     marginVertical: 20,
//   },
//   // Footer Styles
//   cardFooter: {
//     padding: 20,
//     borderTopWidth: StyleSheet.hairlineWidth,
//   },
//   notesSection: {
//     marginBottom: 20,
//   },
//   notesTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   notesText: {
//     fontSize: 13,
//     lineHeight: 18,
//   },
//   totalSection: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   totalLabel: {
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   totalAmount: {
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   // Not Found Styles
//   notFoundRoot: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//   },
//   notFoundHeadline: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   notFoundSub: {
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   backPrimaryBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 12,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//   },
//   backPrimaryBtnText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   modalCard: {
//     borderRadius: 16,
//     width: '100%',
//     maxWidth: 400,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 4 },
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 8,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   modalText: {
//     fontSize: 14,
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   expenseCode: {
//     fontWeight: '600',
//   },
//   paymentMethodsContainer: {
//     paddingHorizontal: 20,
//     gap: 12,
//     marginBottom: 24,
//   },
//   paymentMethodOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   paymentMethodText: {
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   modalActions: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     gap: 12,
//   },
//   modalCancelButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   modalCancelText: {
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   modalConfirmButton: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 8,
//     gap: 8,
//   },
//   modalConfirmText: {
//     fontSize: 15,
//     fontWeight: '600',
//   },
// });
