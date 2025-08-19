// import React, { useEffect, useMemo, useState } from 'react'
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   ScrollView,
//   Modal,
//   StyleSheet,
//   ActivityIndicator,
//   Platform,
//   RefreshControl,
// } from 'react-native'
// import {
//   ArrowDown,
//   ArrowUp,
//   DollarSign,
//   TrendingUp,
//   TrendingDown,
//   Banknote,
//   PlusCircle,
//   FileText,
//   Search,
//   X,
//   CheckCircle,
// } from 'lucide-react-native'
// import { format, differenceInDays, startOfMonth } from 'date-fns'

// import { useAppSelector } from '../lib/redux/hooks'
// import { selectAuth } from '../lib/redux/slices/auth-slice'
// import { useToast } from '../hooks/use-toast'
// import { getInvoices } from '../services/invoice-service'
// import { getStockPurchases } from '../services/stock-service'
// import { getTransactions, addTransaction } from '../services/transaction-service'
// import { Skeleton } from '../components/ui/Skeleton'
// import { useColors, useTheme } from '../context/ThemeContext'
// import type { Transaction, Invoice, StockPurchase } from '../types'

// // For options in select-like UI
// const categories = [
//   'Rent', 'Salaries', 'Utilities', 'Office Supplies', 'Marketing', 'Repairs', 'Miscellaneous'
// ] as const
// const paymentMethods = ['Cash', 'Card', 'Bank Transfer'] as const
// const statusOptions = ['Paid', 'Pending'] as const

// // Table column widths for horizontal scrolling
// const COLUMN_WIDTHS = {
//   description: 180,
//   type: 80,
//   status: 90,
//   amount: 120,
//   actions: 80,
// }

// type CombinedTransaction = {
//   id: string
//   date: string
//   description: string
//   amount: number
//   type: 'Income' | 'Expense'
//   status: 'Paid' | 'Pending' | 'Overdue'
//   source: 'Invoice' | 'Manual' | 'Stock Purchase'
//   sourceId?: string
// }

// type StatCardProps = {
//   title: string
//   value: string
//   icon: React.ComponentType<{ size: number; color?: string }>
//   helperText: string
//   variant?: 'default' | 'destructive' | 'warning'
// }

// type BadgeProps = {
//   label: string
//   isIncome: boolean
//   colors: any
// }

// type StatusBadgeProps = {
//   status: 'Paid' | 'Pending' | 'Overdue' | string
//   colors: any
// }

// type AddTransactionFormProps = {
//   onSave: (transaction: Omit<Transaction, 'id'>) => void
//   onCancel: () => void
//   currentUser: string
//   colors: any
// }

// // ----------- COMPONENTS -----------

// function StatCard({ title, value, icon: Icon, helperText, variant = 'default', colors }: StatCardProps & { colors: any }) {
//   let borderColor, iconColor
//   if (variant === "destructive") {
//     borderColor = colors.destructive
//     iconColor = colors.destructive
//   } else if (variant === "warning") {
//     borderColor = colors.accent
//     iconColor = colors.accent
//   } else {
//     borderColor = 'transparent'
//     iconColor = colors.primary
//   }
//   return (
//     <View style={[styles.statCard, { 
//       backgroundColor: colors.card,
//       borderColor 
//     }]}>
//       <View style={styles.statCardHeader}>
//         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{title}</Text>
//         <Icon size={20} color={iconColor} />
//       </View>
//       <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
//       <Text style={[styles.statHelper, { color: colors.mutedForeground }]}>{helperText}</Text>
//     </View>
//   )
// }

// function StatCardSkeleton({ colors }: { colors: any }) {
//   return (
//     <View style={[styles.statCard, { 
//       backgroundColor: colors.card,
//       borderColor: 'transparent' 
//     }]}>
//       <Skeleton style={{ height: 20, width: "50%", marginBottom: 6 }} />
//       <Skeleton style={{ height: 30, width: "70%", marginBottom: 4 }} />
//       <Skeleton style={{ height: 15, width: "45%" }} />
//     </View>
//   )
// }

// function TransactionRow({ 
//   tx, 
//   colors, 
//   navigation 
// }: { 
//   tx: CombinedTransaction
//   colors: any
//   navigation?: any
// }) {
//   const isIncome = tx.type === 'Income'
//   const totalTableWidth = Object.values(COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0)

//   return (
//     <ScrollView 
//       horizontal 
//       showsHorizontalScrollIndicator={false}
//       style={styles.tableScrollView}
//     >
//       <View style={[
//         styles.transactionRow,
//         { 
//           backgroundColor: colors.card,
//           borderBottomColor: colors.border,
//           width: totalTableWidth
//         }
//       ]}>
//         <View style={[styles.tableCell, { width: COLUMN_WIDTHS.description }]}>
//           <Text style={[styles.transactionDescription, { color: colors.foreground }]} numberOfLines={1}>
//             {tx.description}
//           </Text>
//           <Text style={[styles.transactionDate, { color: colors.mutedForeground }]}>
//             {format(new Date(tx.date), "dd MMM yyyy")}
//           </Text>
//         </View>
        
//         <View style={[styles.tableCell, { width: COLUMN_WIDTHS.type }]}>
//           <Badge label={tx.type} isIncome={isIncome} colors={colors} />
//         </View>
        
//         <View style={[styles.tableCell, { width: COLUMN_WIDTHS.status }]}>
//           <StatusBadge status={tx.status} colors={colors} />
//         </View>
        
//         <View style={[styles.tableCell, styles.tableCellAmount, { width: COLUMN_WIDTHS.amount }]}>
//           <Text style={[
//             styles.transactionAmount,
//             { color: isIncome ? colors.primary : colors.destructive }
//           ]}>
//             {isIncome ? "+" : "-"} ₹{tx.amount.toFixed(2)}
//           </Text>
//         </View>
        
//         <View style={[styles.tableCell, styles.tableCellAction, { width: COLUMN_WIDTHS.actions }]}>
//           {tx.sourceId && (
//             <TouchableOpacity
//               onPress={() => {
//                 // navigation.navigate(...)
//               }}
//               style={[styles.viewBtn, { 
//                 backgroundColor: colors.primaryBackground,
//                 borderColor: colors.border 
//               }]}
//               activeOpacity={0.7}
//             >
//               <FileText size={14} color={colors.primary} />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </ScrollView>
//   )
// }

// function Badge({ label, isIncome, colors }: BadgeProps) {
//   return (
//     <View style={[
//       styles.badge,
//       {
//         backgroundColor: isIncome ? colors.primary + '20' : colors.destructive + '20',
//         borderColor: isIncome ? colors.primary : colors.destructive,
//       }
//     ]}>
//       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//         {isIncome ? 
//           <ArrowDown size={10} color={colors.primary} /> : 
//           <ArrowUp size={10} color={colors.destructive} />
//         }
//         <Text style={[
//           styles.badgeText,
//           { color: isIncome ? colors.primary : colors.destructive }
//         ]}> {label}</Text>
//       </View>
//     </View>
//   )
// }

// function StatusBadge({ status, colors }: StatusBadgeProps) {
//   let textColor, backgroundColor, borderColor
//   switch (status) {
//     case "Paid":
//       textColor = colors.primary
//       backgroundColor = colors.primary + '20'
//       borderColor = colors.primary
//       break
//     case "Pending":
//       textColor = colors.accent
//       backgroundColor = colors.accent + '20'
//       borderColor = colors.accent
//       break
//     case "Overdue":
//       textColor = colors.destructive
//       backgroundColor = colors.destructive + '20'
//       borderColor = colors.destructive
//       break
//     default:
//       textColor = colors.mutedForeground
//       backgroundColor = colors.muted
//       borderColor = colors.border
//   }
//   return (
//     <View style={[
//       styles.statusBadge,
//       { backgroundColor, borderColor }
//     ]}>
//       <Text style={[styles.statusBadgeText, { color: textColor }]}>{status}</Text>
//     </View>
//   )
// }

// function AddTransactionForm({ onSave, onCancel, currentUser, colors }: AddTransactionFormProps) {
//   const [category, setCategory] = useState<typeof categories[number]>("Miscellaneous")
//   const [description, setDescription] = useState("")
//   const [amount, setAmount] = useState("")
//   const [status, setStatus] = useState<typeof statusOptions[number]>("Paid")
//   const [paymentMethod, setPaymentMethod] = useState<typeof paymentMethods[number]>("Cash")
//   const { toast } = useToast()

//   const handleSubmit = () => {
//     const numericAmount = parseFloat(amount)
//     if (!category || !description || isNaN(numericAmount)) {
//       toast({ title: "Invalid Data", description: "Please fill all fields correctly.", variant: 'destructive' })
//       return
//     }
//     onSave({
//       date: new Date().toISOString().split("T")[0],
//       amount: -Math.abs(numericAmount),
//       category,
//       paymentMethod,
//       description,
//       recordedBy: currentUser,
//       ...(status === 'Paid' && { paidBy: currentUser }),
//       status
//     })
//   }

//   return (
//     <View>
//       {/* Category */}
//       <View style={styles.formBlock}>
//         <Text style={[styles.formLabel, { color: colors.foreground }]}>Category</Text>
//         <ScrollView horizontal style={{ marginBottom: 8 }} showsHorizontalScrollIndicator={false}>
//           {categories.map((cat) => (
//             <TouchableOpacity
//               key={cat}
//               style={[
//                 styles.selectorButton,
//                 {
//                   backgroundColor: category === cat ? colors.primary : colors.card,
//                   borderColor: category === cat ? colors.primary : colors.border,
//                 }
//               ]}
//               onPress={() => setCategory(cat)}
//               activeOpacity={0.7}
//             >
//               <Text style={[
//                 styles.selectorButtonText,
//                 { color: category === cat ? colors.primaryForeground : colors.foreground }
//               ]}>{cat}</Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
      
//       {/* Description */}
//       <View style={styles.formBlock}>
//         <Text style={[styles.formLabel, { color: colors.foreground }]}>Description</Text>
//         <TextInput
//           style={[styles.input, {
//             backgroundColor: colors.background,
//             borderColor: colors.border,
//             color: colors.foreground
//           }]}
//           value={description}
//           onChangeText={setDescription}
//           multiline
//           placeholder="e.g., Monthly office rent, October salaries"
//           placeholderTextColor={colors.mutedForeground}
//         />
//       </View>
      
//       {/* Amount & Status */}
//       <View style={[styles.rowGap, { marginBottom: 8 }]}>
//         <View style={{ flex: 1 }}>
//           <Text style={[styles.formLabel, { color: colors.foreground }]}>Amount (₹)</Text>
//           <TextInput
//             style={[styles.input, {
//               backgroundColor: colors.background,
//               borderColor: colors.border,
//               color: colors.foreground
//             }]}
//             value={amount}
//             onChangeText={setAmount}
//             keyboardType="decimal-pad"
//             placeholder="e.g., 500.00"
//             placeholderTextColor={colors.mutedForeground}
//           />
//         </View>
//         <View style={{ flex: 1 }}>
//           <Text style={[styles.formLabel, { color: colors.foreground }]}>Status</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {statusOptions.map((opt) => (
//               <TouchableOpacity
//                 key={opt}
//                 style={[
//                   styles.selectorButton,
//                   {
//                     backgroundColor: status === opt ? colors.primary : colors.card,
//                     borderColor: status === opt ? colors.primary : colors.border,
//                   }
//                 ]}
//                 onPress={() => setStatus(opt)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={[
//                   styles.selectorButtonText,
//                   { color: status === opt ? colors.primaryForeground : colors.foreground }
//                 ]}>{opt}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       </View>
      
//       {/* Payment Method */}
//       {status === 'Paid' && (
//         <View style={styles.formBlock}>
//           <Text style={[styles.formLabel, { color: colors.foreground }]}>Payment Method</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {paymentMethods.map((method) => (
//               <TouchableOpacity
//                 key={method}
//                 style={[
//                   styles.selectorButton,
//                   {
//                     backgroundColor: paymentMethod === method ? colors.primary : colors.card,
//                     borderColor: paymentMethod === method ? colors.primary : colors.border,
//                   }
//                 ]}
//                 onPress={() => setPaymentMethod(method)}
//                 activeOpacity={0.7}
//               >
//                 {paymentMethod === method && (
//                   <CheckCircle size={14} color={colors.primaryForeground} style={{ marginRight: 6 }} />
//                 )}
//                 <Text style={[
//                   styles.selectorButtonText,
//                   { color: paymentMethod === method ? colors.primaryForeground : colors.foreground }
//                 ]}>{method}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       )}
      
//       <View style={styles.formActions}>
//         <TouchableOpacity 
//           onPress={onCancel} 
//           style={[styles.cancelBtn, styles.formBtn, { backgroundColor: colors.muted }]}
//           activeOpacity={0.7}
//         >
//           <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           onPress={handleSubmit} 
//           style={[styles.addBtn, styles.formBtn, { backgroundColor: colors.primary }]}
//           activeOpacity={0.8}
//         >
//           <Text style={[styles.addBtnText, { color: colors.primaryForeground }]}>Add Expense</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   )
// }

// // ================ MAIN =================
// export default function CashFlowScreen({ navigation }: any) {
//   const [isLoading, setIsLoading] = useState<boolean>(true)
//   const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
//   const [manualTransactions, setManualTransactions] = useState<Transaction[]>([])
//   const [invoices, setInvoices] = useState<Invoice[]>([])
//   const [stockPurchases, setStockPurchases] = useState<StockPurchase[]>([])
//   const [searchTerm, setSearchTerm] = useState('')
//   const { user } = useAppSelector(selectAuth)
//   const { toast } = useToast()
//   const [filters, setFilters] = useState<{ 
//     type: 'all' | 'income' | 'expense', 
//     status: 'all' | 'paid' | 'pending' | 'overdue' 
//   }>({ type: 'all', status: 'all' })
//   const [transactionModal, setTransactionModal] = useState<boolean>(false)
  
//   // Theme hooks
//   const colors = useColors()
//   const { isDark } = useTheme()

//   const fetchData = React.useCallback(async (showLoading = true) => {
//     if (showLoading) setIsLoading(true)
//     try {
//       const [fetchedInvoices, fetchedStockPurchases, fetchedTransactions] = await Promise.all([
//         getInvoices(),
//         getStockPurchases(),
//         getTransactions()
//       ])
//       setInvoices(fetchedInvoices)
//       setStockPurchases(fetchedStockPurchases)
//       setManualTransactions(fetchedTransactions.filter((t: Transaction) => t.category !== 'Stock Purchase'))
//     } catch {
//       toast({ title: 'Error', description: 'Failed to fetch financial data.', variant: 'destructive' })
//     } finally {
//       if (showLoading) setIsLoading(false)
//     }
//   }, [toast])

//   useEffect(() => {
//     fetchData(true)
//   }, [fetchData])

//   // Refresh function
//   const onRefresh = React.useCallback(async () => {
//     setIsRefreshing(true)
//     try {
//       await fetchData(false)
//       toast({ title: 'Refreshed', description: 'Financial data updated successfully.' })
//     } catch (error) {
//       console.error('Error refreshing data:', error)
//     } finally {
//       setIsRefreshing(false)
//     }
//   }, [fetchData, toast])

//   const handleAddTransaction = async (t: Omit<Transaction, "id">) => {
//     try {
//       const addedTransaction = await addTransaction(t)
//       setManualTransactions((prev: Transaction[]) => [addedTransaction, ...prev])
//       toast({ title: "Success", description: "New transaction added successfully." })
//       setTransactionModal(false)
//     } catch {
//       toast({ title: 'Error', description: 'Failed to add transaction.', variant: 'destructive' })
//     }
//   }

//   const combinedTransactions: CombinedTransaction[] = useMemo(() => {
//     const incomeFromInvoices: CombinedTransaction[] = invoices.map((inv: Invoice) => {
//       let displayStatus: CombinedTransaction['status'] = inv.status
//       if (inv.status === 'Pending' && differenceInDays(new Date(), new Date(inv.date)) > 15) {
//         displayStatus = 'Overdue'
//       }
//       return {
//         id: inv.id,
//         date: inv.date,
//         description: `Invoice to ${inv.customer.name}`,
//         amount: inv.total,
//         type: 'Income',
//         status: displayStatus,
//         source: 'Invoice',
//         sourceId: inv.id,
//       }
//     })

//     const expensesFromStock: CombinedTransaction[] = stockPurchases.map((sp: StockPurchase) => ({
//       id: `sp-${sp.id}`,
//       date: sp.date,
//       description: `Stock from ${sp.supplier.name}`,
//       amount: Math.abs(sp.total),
//       type: 'Expense',
//       status: sp.status,
//       source: 'Stock Purchase',
//       sourceId: sp.id,
//     }))

//     const manualEntries: CombinedTransaction[] = manualTransactions.map((t: Transaction) => ({
//       id: t.id,
//       date: t.date,
//       description: t.description,
//       amount: Math.abs(t.amount),
//       type: (t.amount > 0 ? 'Income' : 'Expense') as 'Income' | 'Expense',
//       status: t.status as CombinedTransaction['status'],
//       source: 'Manual',
//     }))

//     return [...incomeFromInvoices, ...expensesFromStock, ...manualEntries].sort(
//       (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
//     )
//   }, [invoices, stockPurchases, manualTransactions])

//   const filteredTransactions = useMemo(() => {
//     return combinedTransactions.filter((t: CombinedTransaction) => {
//       const typeMatch = filters.type === 'all' || t.type.toLowerCase() === filters.type
//       const statusMatch = filters.status === 'all' || t.status.toLowerCase() === filters.status
//       const searchMatch = searchTerm === '' || 
//         t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         t.status.toLowerCase().includes(searchTerm.toLowerCase())
//       return typeMatch && statusMatch && searchMatch
//     })
//   }, [combinedTransactions, filters, searchTerm])

//   const stats = useMemo(() => {
//     const currentMonthStart = startOfMonth(new Date())
//     const monthlyTx = combinedTransactions.filter((t: CombinedTransaction) => new Date(t.date) >= currentMonthStart)
//     const totalIncome = monthlyTx.filter(t => t.type === 'Income' && t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0)
//     const totalExpenses = monthlyTx.filter(t => t.type === 'Expense' && t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0)
//     const netFlow = totalIncome - totalExpenses
//     const totalReceivables = combinedTransactions.filter(t => t.type === 'Income' && (t.status === 'Pending' || t.status === 'Overdue')).reduce((sum, t) => sum + t.amount, 0)
//     return { totalIncome, totalExpenses, netFlow, totalReceivables }
//   }, [combinedTransactions])

//   const totalTableWidth = Object.values(COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0)

//   // --- Render ---
//   return (
//     <View style={[styles.screen, { backgroundColor: colors.background }]}>
//       {/* Header */}
//       <View style={[styles.topRow, { 
//         backgroundColor: colors.card,
//         borderBottomColor: colors.border 
//       }]}>
//         <Text style={[styles.header, { color: colors.foreground }]}>Cash Flow</Text>
//         <TouchableOpacity
//           onPress={() => setTransactionModal(true)}
//           style={[styles.addExpenseBtn, { backgroundColor: colors.primary }]}
//           activeOpacity={0.8}
//         >
//           <PlusCircle size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//           <Text style={[styles.addExpenseBtnText, { color: colors.primaryForeground }]}>
//             Add Manual Expense
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         style={{ flex: 1 }}
//         contentContainerStyle={{ paddingBottom: 32 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         {/* Stat cards */}
//         <View style={styles.statCardsRow}>
//           {isLoading ? (
//             <>
//               <StatCardSkeleton colors={colors} />
//               <StatCardSkeleton colors={colors} />
//               <StatCardSkeleton colors={colors} />
//               <StatCardSkeleton colors={colors} />
//             </>
//           ) : (
//             <>
//               <StatCard
//                 title="This Month's Income"
//                 value={`₹${stats.totalIncome.toFixed(2)}`}
//                 icon={TrendingUp}
//                 helperText="Based on paid invoices"
//                 variant="default"
//                 colors={colors}
//               />
//               <StatCard
//                 title="This Month's Expenses"
//                 value={`₹${stats.totalExpenses.toFixed(2)}`}
//                 icon={TrendingDown}
//                 helperText="Based on paid expenses"
//                 variant="destructive"
//                 colors={colors}
//               />
//               <StatCard
//                 title="Net Cash Flow"
//                 value={`₹${stats.netFlow.toFixed(2)}`}
//                 icon={DollarSign}
//                 helperText="This month's profit/loss"
//                 variant={stats.netFlow >= 0 ? "default" : "destructive"}
//                 colors={colors}
//               />
//               <StatCard
//                 title="Total Receivables"
//                 value={`₹${stats.totalReceivables.toFixed(2)}`}
//                 icon={Banknote}
//                 helperText="Pending & overdue payments"
//                 variant="warning"
//                 colors={colors}
//               />
//             </>
//           )}
//         </View>

//         {/* Search Bar - Full Width */}
//         <View style={[styles.searchSection, { backgroundColor: colors.background }]}>
//           <View style={[styles.searchContainer, { 
//             backgroundColor: colors.card, 
//             borderColor: colors.border 
//           }]}>
//             <Search size={18} color={colors.mutedForeground} style={styles.searchIcon} />
//             <TextInput
//               placeholder="Search transactions..."
//               placeholderTextColor={colors.mutedForeground}
//               value={searchTerm}
//               onChangeText={setSearchTerm}
//               style={[styles.searchInput, { color: colors.foreground }]}
//               autoCorrect={false}
//             />
//           </View>
//         </View>

//         {/* Filters */}
//         <View style={styles.filtersSection}>
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.filtersRow}
//           >
//             {(['all', 'income', 'expense'] as const).map(type => (
//               <TouchableOpacity
//                 key={type}
//                 onPress={() => setFilters(f => ({ ...f, type }))}
//                 style={[
//                   styles.selectorButton,
//                   {
//                     backgroundColor: filters.type === type ? colors.primary : colors.card,
//                     borderColor: filters.type === type ? colors.primary : colors.border,
//                   }
//                 ]}
//                 activeOpacity={0.7}
//               >
//                 <Text style={[
//                   styles.selectorButtonText,
//                   { color: filters.type === type ? colors.primaryForeground : colors.foreground }
//                 ]}>
//                   {type.charAt(0).toUpperCase() + type.slice(1)}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//             {(['all', 'paid', 'pending', 'overdue'] as const).map(status => (
//               <TouchableOpacity
//                 key={status}
//                 onPress={() => setFilters(f => ({ ...f, status }))}
//                 style={[
//                   styles.selectorButton,
//                   {
//                     backgroundColor: filters.status === status ? colors.primary : colors.card,
//                     borderColor: filters.status === status ? colors.primary : colors.border,
//                   }
//                 ]}
//                 activeOpacity={0.7}
//               >
//                 <Text style={[
//                   styles.selectorButtonText,
//                   { color: filters.status === status ? colors.primaryForeground : colors.foreground }
//                 ]}>
//                   {status.charAt(0).toUpperCase() + status.slice(1)}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Horizontally Scrollable Table */}
//         <View style={styles.tableContainer}>
//           {/* Table Header */}
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             style={styles.tableScrollView}
//           >
//             <View style={[styles.tableHeader, { 
//               backgroundColor: colors.muted, 
//               borderBottomColor: colors.border,
//               width: totalTableWidth
//             }]}>
//               <View style={[styles.staticHeader, { width: COLUMN_WIDTHS.description }]}>
//                 <Text style={[styles.staticHeaderText, { color: colors.foreground }]}>Description</Text>
//               </View>
//               <View style={[styles.staticHeader, { width: COLUMN_WIDTHS.type }]}>
//                 <Text style={[styles.staticHeaderText, { color: colors.foreground }]}>Type</Text>
//               </View>
//               <View style={[styles.staticHeader, { width: COLUMN_WIDTHS.status }]}>
//                 <Text style={[styles.staticHeaderText, { color: colors.foreground }]}>Status</Text>
//               </View>
//               <View style={[styles.staticHeader, { width: COLUMN_WIDTHS.amount }]}>
//                 <Text style={[styles.staticHeaderText, { color: colors.foreground }]}>Amount</Text>
//               </View>
//               <View style={[styles.staticHeader, { width: COLUMN_WIDTHS.actions }]}>
//                 <Text style={[styles.staticHeaderText, { color: 'transparent' }]}>•</Text>
//               </View>
//             </View>
//           </ScrollView>

//           {/* Transactions */}
//           <View style={[styles.transactionsCard, { backgroundColor: colors.card }]}>
//             <Text style={[styles.transactionsCardTitle, { color: colors.foreground }]}>
//               Transaction History
//             </Text>
//             <Text style={[styles.transactionsCardHelper, { color: colors.mutedForeground }]}>
//               A complete log of all income and expenses.
//             </Text>
            
//             {isLoading ? (
//               Array(5)
//                 .fill(0)
//                 .map((_, i) => <Skeleton key={i} style={{ height: 64, width: "100%", marginBottom: 12 }} />)
//             ) : filteredTransactions.length === 0 ? (
//               <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
//                 No transactions match the current filters.
//               </Text>
//             ) : (
//               <FlatList
//                 data={filteredTransactions}
//                 keyExtractor={tx => `${tx.source}-${tx.id}`}
//                 renderItem={({ item }) => (
//                   <TransactionRow 
//                     tx={item} 
//                     colors={colors}
//                     navigation={navigation}
//                   />
//                 )}
//                 style={{ width: '100%' }}
//                 scrollEnabled={false}
//                 showsVerticalScrollIndicator={false}
//               />
//             )}
//           </View>
//         </View>
//       </ScrollView>

//       {/* Add Manual Transaction Modal */}
//       <Modal visible={transactionModal} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
//             <View style={styles.modalHeader}>
//               <Text style={[styles.addExpenseTitle, { color: colors.foreground }]}>
//                 Add Manual Expense
//               </Text>
//               <TouchableOpacity 
//                 onPress={() => setTransactionModal(false)}
//                 style={styles.modalCloseButton}
//                 activeOpacity={0.7}
//               >
//                 <X size={24} color={colors.mutedForeground} />
//               </TouchableOpacity>
//             </View>
//             <AddTransactionForm
//               onSave={handleAddTransaction}
//               onCancel={() => setTransactionModal(false)}
//               currentUser={user?.name ?? "User"}
//               colors={colors}
//             />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   )
// }

// // ------------- Styles ---------------

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//   },
//   topRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 18,
//     paddingVertical: 16,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: '800',
//   },
//   addExpenseBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 12,
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//   },
//   addExpenseBtnText: {
//     fontWeight: "600",
//     fontSize: 15,
//   },
//   statCardsRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 14,
//     marginBottom: 18,
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },
//   statCard: {
//     borderRadius: 14,
//     padding: 18,
//     flex: 1,
//     minWidth: 170,
//     marginBottom: 10,
//     borderWidth: 1,
//     marginHorizontal: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.07,
//     shadowRadius: 7,
//     elevation: 2,
//   },
//   statCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 6,
//   },
//   statLabel: {
//     fontWeight: '500',
//     fontSize: 14,
//   },
//   statValue: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 3,
//   },
//   statHelper: {
//     fontSize: 13,
//   },
//   // Search Section
//   searchSection: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 10,
//     borderWidth: 1,
//     paddingHorizontal: 12,
//     height: 44,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//   },
//   // Filters Section
//   filtersSection: {
//     paddingHorizontal: 16,
//     paddingBottom: 8,
//   },
//   filtersRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   selectorButton: {
//     borderRadius: 16,
//     paddingHorizontal: 18,
//     paddingVertical: 7,
//     borderWidth: 1,
//     marginRight: 4,
//   },
//   selectorButtonText: {
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   // Table Container
//   tableContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   tableScrollView: {
//     flexGrow: 0,
//   },
//   // Table Header
//   tableHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   staticHeader: {
//     paddingHorizontal: 8,
//     justifyContent: 'center',
//   },
//   staticHeaderText: {
//     fontWeight: 'bold',
//     fontSize: 13,
//   },
//   transactionsCard: {
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     minHeight: 180,
//     shadowColor: '#000',
//     shadowRadius: 7,
//     shadowOpacity: 0.07,
//     shadowOffset: { width: 0, height: 1 },
//     elevation: 1,
//   },
//   transactionsCardTitle: {
//     fontWeight: 'bold',
//     fontSize: 17,
//     marginBottom: 4,
//   },
//   transactionsCardHelper: {
//     marginBottom: 12,
//     fontSize: 13,
//   },
//   // Table Rows
//   transactionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   tableCell: {
//     paddingHorizontal: 8,
//     justifyContent: 'center',
//   },
//   tableCellAmount: {
//     alignItems: 'flex-end',
//   },
//   tableCellAction: {
//     alignItems: 'center',
//   },
//   transactionDescription: {
//     fontWeight: '500',
//     fontSize: 14,
//     marginBottom: 2,
//   },
//   transactionDate: {
//     fontSize: 12,
//   },
//   transactionAmount: {
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   viewBtn: {
//     padding: 8,
//     borderRadius: 6,
//     borderWidth: 1,
//   },
//   badge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 10,
//     borderWidth: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     minWidth: 65,
//   },
//   badgeText: {
//     fontSize: 11,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 10,
//     borderWidth: 1,
//     alignSelf: 'flex-start',
//   },
//   statusBadgeText: {
//     fontWeight: '600',
//     fontSize: 11,
//     textTransform: 'capitalize',
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginVertical: 36,
//     fontSize: 15,
//   },
//   // Form Styles
//   formBlock: {
//     marginBottom: 16,
//   },
//   formLabel: {
//     fontWeight: '600',
//     fontSize: 14,
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 16,
//     minHeight: 44,
//   },
//   rowGap: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: 12,
//   },
//   formActions: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 12,
//   },
//   formBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   cancelBtn: {},
//   cancelBtnText: {
//     fontWeight: '600',
//   },
//   addBtn: {},
//   addBtnText: {
//     fontWeight: '600',
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   modalContent: {
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: "#000",
//     shadowRadius: 20,
//     shadowOpacity: 0.25,
//     elevation: 8,
//     width: '100%',
//     maxWidth: 400,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   addExpenseTitle: {
//     fontSize: 19,
//     fontWeight: 'bold',
//   },
// })
