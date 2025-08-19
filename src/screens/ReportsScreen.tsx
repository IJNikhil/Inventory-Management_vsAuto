
// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import { 
//   View, 
//   Text, 
//   TouchableOpacity, 
//   ActivityIndicator, 
//   FlatList, 
//   ScrollView, 
//   Modal,
//   TextInput,
//   StyleSheet,
//   RefreshControl,
// } from 'react-native';
// import { format, startOfMonth, endOfMonth, addDays, startOfWeek, endOfWeek, subMonths } from 'date-fns';
// import { 
//   DollarSign, 
//   TrendingUp, 
//   TrendingDown, 
//   Award, 
//   ThumbsDown, 
//   Loader2, 
//   Calendar as CalendarIcon, 
//   Package,
//   Search,
//   X,
// } from 'lucide-react-native';
// import { useToast } from '../hooks/use-toast';
// import { useColors, useTheme } from '../context/ThemeContext';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { invoiceService } from '../services/invoice-service'; // ✅ FIXED: Use service objects
// import { transactionService } from '../services/transaction-service'; // ✅ FIXED: Use service objects
// import { partService } from '../services/part-service'; // ✅ FIXED: Use service objects
// import type { Invoice, Part, Transaction } from '../types/database'; // ✅ FIXED: Use database types

// // Table column widths
// const PRODUCT_COLUMN_WIDTHS = {
//   product: 150,
//   partNumber: 100,
//   quantity: 70,
//   profit: 100,
// };

// const SALES_COLUMN_WIDTHS = {
//   shopkeeper: 150,
//   invoices: 70,
//   sales: 100,
// };

// type ProductPerformance = {
//   name: string;
//   partNumber: string;
//   quantitySold: number;
//   totalRevenue: number;
//   totalCost: number;
//   totalProfit: number;
//   profitMargin: number;
// };

// type ReportData = {
//   totalRevenue: number;
//   grossProfit: number;
//   totalOperatingExpenses: number;
//   netProfit: number;
//   invoiceCount: number;
//   partsSoldCount: number;
//   grossProfitMargin: number;
//   avgRevenuePerInvoice: number;
//   salesByShopkeeper: { name: string; totalSales: number; invoiceCount: number }[];
//   topSellingParts: { name: string; partNumber: string; quantity: number }[];
//   expenseBreakdown: { category: string, total: number }[];
//   productPerformance: ProductPerformance[];
// };

// // ✅ FIXED: Business Logic for calculating ReportData with database field names
// const calculateReportData = (
//   dateRange: { from: Date; to: Date },
//   allInvoices: Invoice[],
//   allTransactions: Transaction[],
//   allParts: Part[]
// ): ReportData | null => {
//   const { from, to } = dateRange;
//   if (!from || !to) return null;

//   const paidInvoicesInRange = allInvoices.filter(inv => {
//     if (!inv.payment_date) return false; // ✅ FIXED: payment_date
//     const invDate = new Date(inv.payment_date);
//     return inv.status === 'paid' && invDate >= from && invDate <= to; // ✅ FIXED: 'paid' status
//   });

//   const manualExpensesInRange = allTransactions.filter(t => {
//     const tDate = new Date(t.transaction_date); // ✅ FIXED: transaction_date
//     return t.amount < 0 && t.status === 'completed' && t.category !== 'Stock Purchase' && tDate >= from && tDate <= to; // ✅ FIXED: 'completed' status
//   });

//   const hasData = paidInvoicesInRange.length > 0 || manualExpensesInRange.length > 0;
//   if (!hasData) return null;

//   const totalRevenue = paidInvoicesInRange.reduce((sum, inv) => sum + inv.total, 0);

//   const productPerformanceMap = new Map<string, ProductPerformance>();
  
//   // ✅ FIXED: Handle normalized invoice items
//   const costOfGoodsSold = paidInvoicesInRange.reduce((cogs, inv) => {
//     // Since invoice items are now normalized, we'll need to fetch them separately
//     // For now, assuming items are still embedded or fetched with the invoice
//     const invoiceItems = (inv as any).items || [];
    
//     return cogs + invoiceItems.reduce((itemCogs: number, item: any) => {
//       const part = allParts.find(p => p.id === item.part_id); // ✅ FIXED: part_id
//       if (!part) return itemCogs;
      
//       const revenue = item.unit_price * item.quantity; // ✅ FIXED: unit_price
//       const cost = part.purchase_price * item.quantity; // ✅ FIXED: purchase_price
//       const profit = revenue - cost;
      
//       const current = productPerformanceMap.get(part.id) || {
//         name: part.name,
//         partNumber: part.part_number, // ✅ FIXED: part_number
//         quantitySold: 0,
//         totalRevenue: 0,
//         totalCost: 0,
//         totalProfit: 0,
//         profitMargin: 0
//       };
      
//       current.quantitySold += item.quantity;
//       current.totalRevenue += revenue;
//       current.totalCost += cost;
//       current.totalProfit += profit;
//       productPerformanceMap.set(part.id, current);
      
//       return itemCogs + cost;
//     }, 0);
//   }, 0);

//   const productPerformance = Array.from(productPerformanceMap.values()).map(p => ({
//     ...p,
//     profitMargin: p.totalRevenue > 0 ? (p.totalProfit / p.totalRevenue) * 100 : 0,
//   }));

//   const grossProfit = totalRevenue - costOfGoodsSold;
//   const totalOperatingExpenses = manualExpensesInRange.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
//   const netProfit = grossProfit - totalOperatingExpenses;
//   const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
//   const invoiceCount = paidInvoicesInRange.length;
//   const avgRevenuePerInvoice = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;
  
//   const partsSoldCount = paidInvoicesInRange.reduce((sum, inv) => {
//     const invoiceItems = (inv as any).items || [];
//     return sum + invoiceItems.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
//   }, 0);
  
//   const salesByShopkeeper = paidInvoicesInRange.reduce((acc, inv) => {
//     const generatedBy = inv.generated_by; // ✅ FIXED: generated_by (removed collectedBy as it doesn't exist)
//     if (!generatedBy) return acc;
    
//     const existing = acc.find(s => s.name === generatedBy);
//     if (existing) {
//       existing.totalSales += inv.total;
//       existing.invoiceCount += 1;
//     } else {
//       acc.push({ name: generatedBy, totalSales: inv.total, invoiceCount: 1 });
//     }
//     return acc;
//   }, [] as { name: string; totalSales: number; invoiceCount: number }[]).sort((a, b) => b.totalSales - a.totalSales);
  
//   const topSellingParts = [...productPerformance].sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5).map(p => ({
//     name: p.name,
//     partNumber: p.partNumber,
//     quantity: p.quantitySold
//   }));
  
//   const expenseBreakdown = manualExpensesInRange.reduce((acc, t) => {
//     const existing = acc.find(e => e.category === t.category);
//     if (existing) {
//       existing.total += Math.abs(t.amount);
//     } else {
//       acc.push({ category: t.category, total: Math.abs(t.amount) });
//     }
//     return acc;
//   }, [] as { category: string, total: number }[]).sort((a, b) => b.total - a.total);

//   return {
//     totalRevenue, grossProfit, totalOperatingExpenses, netProfit,
//     invoiceCount, partsSoldCount,
//     grossProfitMargin,
//     avgRevenuePerInvoice,
//     salesByShopkeeper, topSellingParts,
//     expenseBreakdown, productPerformance
//   };
// };

// // Preset options
// const presets = [
//   { label: 'Today', value: 'today' },
//   { label: 'Last 7 Days', value: 'last7' },
//   { label: 'This Week', value: 'this_week' },
//   { label: 'This Month', value: 'this_month' },
//   { label: 'Last Month', value: 'last_month' },
// ] as const;

// function getPresetRange(preset: string) {
//   const today = new Date();
//   switch (preset) {
//     case 'today': return { from: today, to: today };
//     case 'last7': return { from: addDays(today, -6), to: today };
//     case 'this_week': return { from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) };
//     case 'this_month': return { from: startOfMonth(today), to: endOfMonth(today) };
//     case 'last_month': {
//       const lastMonth = subMonths(today, 1);
//       return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
//     }
//     default: return { from: startOfMonth(today), to: endOfMonth(today) }
//   }
// }

// // Main Screen
// export default function ReportsScreen() {
//   const [fromPickerOpen, setFromPickerOpen] = useState(false);
//   const [toPickerOpen, setToPickerOpen] = useState(false);
//   const today = new Date();
//   const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>(() => ({
//     from: startOfMonth(today),
//     to: endOfMonth(today),
//   }));
//   const [reportData, setReportData] = useState<ReportData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
//   const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
//   const [allParts, setAllParts] = useState<Part[]>([]);
//   const [controlsOpen, setControlsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeTab, setActiveTab] = useState<'summary' | 'products' | 'sales' | 'expenses'>('summary');
//   const { toast } = useToast();
//   const [preset, setPreset] = useState<string>('this_month');
  
//   const colors = useColors();
//   const { isDark } = useTheme();

//   // ✅ FIXED: Updated service method calls
//   const fetchAllData = useCallback(async (showLoading = true) => {
//     if (showLoading) setIsLoading(true);
//     try {
//       const [invoices, transactions, parts] = await Promise.all([
//         invoiceService.findAll(), // ✅ FIXED: Use service objects
//         transactionService.findAll(), // ✅ FIXED: Use service objects
//         partService.findAll(), // ✅ FIXED: Use service objects
//       ]);
//       setAllInvoices(invoices);
//       setAllTransactions(transactions);
//       setAllParts(parts);
//     } catch (error) {
//       console.error('Error fetching reports data:', error);
//       toast({ title: "Error", description: "Failed to fetch necessary data for reports.", variant: "destructive" });
//     } finally {
//       if (showLoading) setIsLoading(false);
//     }
//   }, [toast]);

//   useEffect(() => {
//     fetchAllData(true);
//   }, [fetchAllData]);

//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     try {
//       await fetchAllData(false);
//       toast({ title: 'Refreshed', description: 'Reports data updated successfully.' });
//     } catch (error) {
//       console.error('Error refreshing data:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   }, [fetchAllData, toast]);

//   const handleGenerateReport = useCallback(() => {
//     if (!dateRange.from || !dateRange.to) {
//       toast({
//         title: "Invalid Date Range",
//         description: "Please select a valid start and end date.",
//         variant: "destructive"
//       });
//       return;
//     }
//     setIsGenerating(true);
//     setTimeout(() => {
//       const data = calculateReportData(dateRange, allInvoices, allTransactions, allParts);
//       setReportData(data);
//       setIsGenerating(false);
//     }, 500);
//   }, [dateRange, allInvoices, allTransactions, allParts, toast]);

//   useEffect(() => {
//     if (!isLoading) handleGenerateReport();
//   }, [isLoading, handleGenerateReport]);

//   const filteredData = useMemo(() => {
//     if (!reportData || !searchTerm) return reportData;
    
//     const filteredProductPerformance = reportData.productPerformance.filter(product =>
//       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
//     );
    
//     const filteredSalesByShopkeeper = reportData.salesByShopkeeper.filter(shopkeeper =>
//       shopkeeper.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
    
//     const filteredExpenseBreakdown = reportData.expenseBreakdown.filter(expense =>
//       expense.category.toLowerCase().includes(searchTerm.toLowerCase())
//     );
    
//     return {
//       ...reportData,
//       productPerformance: filteredProductPerformance,
//       salesByShopkeeper: filteredSalesByShopkeeper,
//       expenseBreakdown: filteredExpenseBreakdown,
//     };
//   }, [reportData, searchTerm]);

//   const topPerformingParts = useMemo(
//     () => (filteredData?.productPerformance?.slice()
//       .sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 5) ?? []), [filteredData]);
//   const leastPerformingParts = useMemo(
//     () => (filteredData?.productPerformance?.slice()
//       .sort((a, b) => a.totalProfit - b.totalProfit).slice(0, 5) ?? []), [filteredData]);

//   function onPresetSelect(presetValue: string) {
//     setPreset(presetValue);
//     setDateRange(getPresetRange(presetValue));
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* Header */}
//       <View style={[styles.header, { backgroundColor: colors.card }]}>
//         <Text style={[styles.headerTitle, { color: colors.foreground }]}>Reports</Text>
//         <View style={styles.searchContainer}>
//           <Search size={18} color={colors.mutedForeground} style={styles.searchIcon} />
//           <TextInput
//             placeholder="Search reports..."
//             placeholderTextColor={colors.mutedForeground}
//             value={searchTerm}
//             onChangeText={setSearchTerm}
//             style={[styles.searchInput, { color: colors.foreground }]}
//             autoCorrect={false}
//           />
//         </View>
//       </View>

//       {/* Tabs */}
//       <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'summary' && { borderBottomColor: colors.primary }]}
//           onPress={() => setActiveTab('summary')}
//         >
//           <Text style={[styles.tabText, { color: activeTab === 'summary' ? colors.primary : colors.mutedForeground }]}>
//             Summary
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'products' && { borderBottomColor: colors.primary }]}
//           onPress={() => setActiveTab('products')}
//         >
//           <Text style={[styles.tabText, { color: activeTab === 'products' ? colors.primary : colors.mutedForeground }]}>
//             Products
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'sales' && { borderBottomColor: colors.primary }]}
//           onPress={() => setActiveTab('sales')}
//         >
//           <Text style={[styles.tabText, { color: activeTab === 'sales' ? colors.primary : colors.mutedForeground }]}>
//             Sales
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'expenses' && { borderBottomColor: colors.primary }]}
//           onPress={() => setActiveTab('expenses')}
//         >
//           <Text style={[styles.tabText, { color: activeTab === 'expenses' ? colors.primary : colors.mutedForeground }]}>
//             Expenses
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Content */}
//       <ScrollView
//         style={styles.content}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         {(isLoading || isGenerating) ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={colors.primary} />
//             <Text style={[styles.loadingText, { color: colors.foreground }]}>Loading Reports...</Text>
//           </View>
//         ) : filteredData ? (
//           <View style={styles.contentContainer}>
//             {activeTab === 'summary' && (
//               <>
//                 <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
//                   Business Summary
//                 </Text>
//                 <View style={styles.summaryGrid}>
//                   <StatCard
//                     title="Total Revenue"
//                     value={`₹${filteredData.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
//                     helper={`${filteredData.invoiceCount} invoices`}
//                     icon={DollarSign}
//                     color={colors.primary}
//                     colors={colors}
//                   />
//                   <StatCard
//                     title="Gross Profit"
//                     value={`₹${filteredData.grossProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
//                     helper="Revenue - COGS"
//                     icon={TrendingUp}
//                     color={colors.primary}
//                     colors={colors}
//                   />
//                   <StatCard
//                     title="Operating Expenses"
//                     value={`₹${filteredData.totalOperatingExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
//                     helper="e.g., Rent, Salaries"
//                     icon={TrendingDown}
//                     color={colors.destructive}
//                     colors={colors}
//                   />
//                   <StatCard
//                     title="Net Profit"
//                     value={`₹${filteredData.netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
//                     helper="Gross Profit - OpEx"
//                     icon={DollarSign}
//                     color={filteredData.netProfit >= 0 ? colors.primary : colors.destructive}
//                     colors={colors}
//                   />
//                 </View>
//                 <View style={[styles.card, { backgroundColor: colors.card }]}>
//                   <Text style={[styles.cardTitle, { color: colors.foreground }]}>Financial Metrics</Text>
//                   <MiniStatRow 
//                     label="Gross Profit Margin" 
//                     value={`${filteredData.grossProfitMargin.toFixed(2)}%`} 
//                     positive={filteredData.grossProfit >= 0}
//                     colors={colors}
//                   />
//                   <MiniStatRow 
//                     label="Avg. Revenue/Invoice" 
//                     value={`₹${filteredData.avgRevenuePerInvoice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
//                     colors={colors}
//                   />
//                   <MiniStatRow 
//                     label="Total Parts Sold" 
//                     value={String(filteredData.partsSoldCount)}
//                     colors={colors}
//                   />
//                 </View>
//               </>
//             )}
//             {activeTab === 'products' && (
//               <>
//                 <View style={[styles.card, { backgroundColor: colors.card }]}>
//                   <View style={styles.cardHeader}>
//                     <Award size={18} color={colors.primary} />
//                     <Text style={[styles.cardTitle, { color: colors.foreground }]}>Top Products</Text>
//                   </View>
//                   <ProductPerformanceTable products={topPerformingParts} colors={colors} />
//                 </View>
//                 <View style={[styles.card, { backgroundColor: colors.card }]}>
//                   <View style={styles.cardHeader}>
//                     <ThumbsDown size={18} color={colors.destructive} />
//                     <Text style={[styles.cardTitle, { color: colors.foreground }]}>Underperforming Products</Text>
//                   </View>
//                   <ProductPerformanceTable products={leastPerformingParts} colors={colors} />
//                 </View>
//               </>
//             )}
//             {activeTab === 'sales' && (
//               <View style={[styles.card, { backgroundColor: colors.card }]}>
//                 <Text style={[styles.cardTitle, { color: colors.foreground }]}>Sales by Team</Text>
//                 {filteredData.salesByShopkeeper.length > 0 ? (
//                   <SalesByShopkeeperTable data={filteredData.salesByShopkeeper} colors={colors} />
//                 ) : (
//                   <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No sales data available.</Text>
//                 )}
//               </View>
//             )}
//             {activeTab === 'expenses' && (
//               <View style={[styles.card, { backgroundColor: colors.card }]}>
//                 <Text style={[styles.cardTitle, { color: colors.foreground }]}>Expense Breakdown</Text>
//                 {filteredData.expenseBreakdown.length > 0 ? (
//                   <FlatList
//                     data={filteredData.expenseBreakdown}
//                     renderItem={({ item }) => (
//                       <View style={styles.expenseRow}>
//                         <Text style={[styles.expenseCategory, { color: colors.foreground }]}>{item.category}</Text>
//                         <Text style={[styles.expenseAmount, { color: colors.foreground }]}>₹{item.total.toLocaleString()}</Text>
//                       </View>
//                     )}
//                     keyExtractor={item => item.category}
//                     scrollEnabled={false}
//                   />
//                 ) : (
//                   <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No expenses recorded.</Text>
//                 )}
//               </View>
//             )}
//           </View>
//         ) : (
//           <View style={styles.noDataContainer}>
//             <Package size={48} color={colors.mutedForeground} />
//             <Text style={[styles.noDataText, { color: colors.foreground }]}>No Data Available</Text>
//             <Text style={[styles.noDataSubText, { color: colors.mutedForeground }]}>Select a different date range to view reports.</Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* Floating Action Button */}
//       <TouchableOpacity
//         style={[styles.fab, { backgroundColor: colors.primary }]}
//         onPress={() => setControlsOpen(true)}
//       >
//         <CalendarIcon size={24} color={colors.primaryForeground} />
//       </TouchableOpacity>

//       {/* Controls Bottom Sheet */}
//       <Modal visible={controlsOpen} transparent animationType="slide">
//         <View style={styles.bottomSheetOverlay}>
//           <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}>
//             <View style={styles.bottomSheetHeader}>
//               <Text style={[styles.bottomSheetTitle, { color: colors.foreground }]}>Report Settings</Text>
//               <TouchableOpacity onPress={() => setControlsOpen(false)}>
//                 <X size={24} color={colors.mutedForeground} />
//               </TouchableOpacity>
//             </View>
//             <ScrollView>
//               <View style={styles.presetContainer}>
//                 <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Presets</Text>
//                 <View style={styles.presetGrid}>
//                   {presets.map(p => (
//                     <TouchableOpacity
//                       key={p.value}
//                       style={[
//                         styles.presetButton,
//                         { backgroundColor: preset === p.value ? colors.primary : colors.muted }
//                       ]}
//                       onPress={() => onPresetSelect(p.value)}
//                     >
//                       <Text style={[
//                         styles.presetButtonText,
//                         { color: preset === p.value ? colors.primaryForeground : colors.foreground }
//                       ]}>
//                         {p.label}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>
//               <View style={styles.datePickerSection}>
//                 <Text style={[styles.dateLabel, { color: colors.foreground }]}>From</Text>
//                 <TouchableOpacity 
//                   onPress={() => setFromPickerOpen(true)}
//                   style={[styles.dateButton, { borderColor: colors.border }]}
//                 >
//                   <Text style={[styles.dateButtonText, { color: colors.foreground }]}>
//                     {format(dateRange.from, 'yyyy-MM-dd')}
//                   </Text>
//                 </TouchableOpacity>
//                 {fromPickerOpen && (
//                   <DateTimePicker
//                     value={dateRange.from}
//                     mode="date"
//                     onChange={(_, date) => {
//                       setFromPickerOpen(false);
//                       if (date) setDateRange(r => ({...r, from: date}));
//                     }}
//                   />
//                 )}
//                 <Text style={[styles.dateLabel, { color: colors.foreground }]}>To</Text>
//                 <TouchableOpacity 
//                   onPress={() => setToPickerOpen(true)}
//                   style={[styles.dateButton, { borderColor: colors.border }]}
//                 >
//                   <Text style={[styles.dateButtonText, { color: colors.foreground }]}>
//                     {format(dateRange.to, 'yyyy-MM-dd')}
//                   </Text>
//                 </TouchableOpacity>
//                 {toPickerOpen && (
//                   <DateTimePicker
//                     value={dateRange.to}
//                     mode="date"
//                     onChange={(_, date) => {
//                       setToPickerOpen(false);
//                       if (date) setDateRange(r => ({...r, to: date}));
//                     }}
//                   />
//                 )}
//               </View>
//               <TouchableOpacity
//                 style={[styles.generateButton, { 
//                   backgroundColor: colors.primary,
//                   opacity: (isGenerating || isLoading) ? 0.6 : 1,
//                 }]}
//                 onPress={() => {
//                   handleGenerateReport();
//                   setControlsOpen(false);
//                 }}
//                 disabled={isGenerating || isLoading}
//               >
//                 <Text style={[styles.generateButtonText, { color: colors.primaryForeground }]}>
//                   Generate Report
//                 </Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// // Components
// function StatCard({ title, value, helper, icon: Icon, color, colors }: {
//   title: string;
//   value: string;
//   helper: string;
//   icon: any;
//   color: string;
//   colors: any;
// }) {
//   return (
//     <View style={[styles.statCard, { backgroundColor: colors.muted }]}>
//       <Icon size={20} color={color} style={styles.statIcon} />
//       <Text style={[styles.statTitle, { color: colors.foreground }]}>{title}</Text>
//       <Text style={[styles.statValue, { color: color }]}>{value}</Text>
//       <Text style={[styles.statHelper, { color: colors.mutedForeground }]}>{helper}</Text>
//     </View>
//   );
// }

// function MiniStatRow({ label, value, positive = true, colors }: {
//   label: string;
//   value: string;
//   positive?: boolean;
//   colors: any;
// }) {
//   return (
//     <View style={styles.miniStatRow}>
//       <Text style={[styles.miniStatLabel, { color: colors.foreground }]}>{label}</Text>
//       <Text style={[styles.miniStatValue, { color: positive ? colors.primary : colors.destructive }]}>{value}</Text>
//     </View>
//   );
// }

// function ProductPerformanceTable({ products, colors }: { 
//   products: ProductPerformance[];
//   colors: any;
// }) {
//   if (!products?.length) {
//     return <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No product data.</Text>;
//   }

//   const totalTableWidth = Object.values(PRODUCT_COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0);

//   return (
//     <View>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//         <View style={[styles.tableHeader, { width: totalTableWidth, backgroundColor: colors.muted }]}>
//           <View style={[styles.tableHeaderCell, { width: PRODUCT_COLUMN_WIDTHS.product }]}>
//             <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Product</Text>
//           </View>
//           <View style={[styles.tableHeaderCell, { width: PRODUCT_COLUMN_WIDTHS.partNumber }]}>
//             <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Part #</Text>
//           </View>
//           <View style={[styles.tableHeaderCell, { width: PRODUCT_COLUMN_WIDTHS.quantity }]}>
//             <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Qty</Text>
//           </View>
//           <View style={[styles.tableHeaderCell, { width: PRODUCT_COLUMN_WIDTHS.profit }]}>
//             <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Profit</Text>
//           </View>
//         </View>
//       </ScrollView>
//       <FlatList
//         data={products}
//         renderItem={({ item }) => (
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             <View style={[styles.tableRow, { width: totalTableWidth, borderBottomColor: colors.border }]}>
//               <View style={[styles.tableCell, { width: PRODUCT_COLUMN_WIDTHS.product }]}>
//                 <Text style={[styles.tableCellText, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
//               </View>
//               <View style={[styles.tableCell, { width: PRODUCT_COLUMN_WIDTHS.partNumber }]}>
//                 <Text style={[styles.tableCellSubText, { color: colors.mutedForeground }]} numberOfLines={1}>{item.partNumber}</Text>
//               </View>
//               <View style={[styles.tableCell, { width: PRODUCT_COLUMN_WIDTHS.quantity }]}>
//                 <Text style={[styles.tableCellText, { color: colors.foreground }]}>{item.quantitySold}</Text>
//               </View>
//               <View style={[styles.tableCell, { width: PRODUCT_COLUMN_WIDTHS.profit }]}>
//                 <Text style={[styles.tableCellText, { color: item.totalProfit >= 0 ? colors.primary : colors.destructive }]}>
//                   ₹{item.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
//                 </Text>
//               </View>
//             </View>
//           </ScrollView>
//         )}
//         keyExtractor={item => item.partNumber}
//         scrollEnabled={false}
//       />
//     </View>
//   );
// }

// function SalesByShopkeeperTable({ data, colors }: { 
//   data: { name: string; totalSales: number; invoiceCount: number }[];
//   colors: any;
// }) {
//   const totalTableWidth = Object.values(SALES_COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0);

//   return (
//     <View>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//         <View style={[styles.tableHeader, { width: totalTableWidth, backgroundColor: colors.muted }]}>
//           <View style={[styles.tableHeaderCell, { width: SALES_COLUMN_WIDTHS.shopkeeper }]}>
//             <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Shopkeeper</Text>
//           </View>
//           <View style={[styles.tableHeaderCell, { width: SALES_COLUMN_WIDTHS.invoices }]}>
//             <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Invoices</Text>
//           </View>
//           <View style={[styles.tableHeaderCell, { width: SALES_COLUMN_WIDTHS.sales }]}>
//             <Text style={[styles.tableHeaderText, { color: colors.foreground }]}>Sales</Text>
//           </View>
//         </View>
//       </ScrollView>
//       <FlatList
//         data={data}
//         renderItem={({ item }) => (
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             <View style={[styles.tableRow, { width: totalTableWidth, borderBottomColor: colors.border }]}>
//               <View style={[styles.tableCell, { width: SALES_COLUMN_WIDTHS.shopkeeper }]}>
//                 <Text style={[styles.tableCellText, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
//               </View>
//               <View style={[styles.tableCell, { width: SALES_COLUMN_WIDTHS.invoices }]}>
//                 <Text style={[styles.tableCellText, { color: colors.foreground }]}>{item.invoiceCount}</Text>
//               </View>
//               <View style={[styles.tableCell, { width: SALES_COLUMN_WIDTHS.sales }]}>
//                 <Text style={[styles.tableCellText, { color: colors.primary }]}>₹{item.totalSales.toLocaleString()}</Text>
//               </View>
//             </View>
//           </ScrollView>
//         )}
//         keyExtractor={item => item.name}
//         scrollEnabled={false}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0,0,0,0.1)',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     height: 40,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     fontWeight: '400',
//   },
//   tabBar: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0,0,0,0.1)',
//     paddingHorizontal: 16,
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderBottomWidth: 2,
//     borderBottomColor: 'transparent',
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   content: {
//     flex: 1,
//   },
//   contentContainer: {
//     padding: 16,
//     paddingBottom: 80, // Space for FAB
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   card: {
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   cardTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   summaryGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//     marginBottom: 12,
//   },
//   statCard: {
//     flex: 1,
//     minWidth: 160,
//     borderRadius: 8,
//     padding: 12,
//     alignItems: 'center',
//   },
//   statIcon: {
//     marginBottom: 8,
//   },
//   statTitle: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom: 4,
//   },
//   statValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   statHelper: {
//     fontSize: 12,
//     fontWeight: '400',
//   },
//   miniStatRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//   },
//   miniStatLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   miniStatValue: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   expenseRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 6,
//   },
//   expenseCategory: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   expenseAmount: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   emptyText: {
//     fontSize: 14,
//     fontWeight: '400',
//     textAlign: 'center',
//     padding: 12,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   tableHeaderCell: {
//     paddingHorizontal: 8,
//     justifyContent: 'center',
//   },
//   tableHeaderText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   tableRow: {
//     flexDirection: 'row',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//   },
//   tableCell: {
//     paddingHorizontal: 8,
//     justifyContent: 'center',
//   },
//   tableCellText: {
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   tableCellSubText: {
//     fontSize: 12,
//     fontWeight: '400',
//   },
//   loadingContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   loadingText: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginTop: 12,
//   },
//   noDataContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 40,
//   },
//   noDataText: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginTop: 12,
//   },
//   noDataSubText: {
//     fontSize: 13,
//     fontWeight: '400',
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 16,
//     right: 16,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 4,
//   },
//   bottomSheetOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'flex-end',
//   },
//   bottomSheet: {
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     padding: 16,
//     maxHeight: '80%',
//   },
//   bottomSheetHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   bottomSheetTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   presetContainer: {
//     marginBottom: 16,
//   },
//   presetGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginTop: 8,
//   },
//   presetButton: {
//     borderRadius: 6,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     minWidth: 100,
//   },
//   presetButtonText: {
//     fontSize: 14,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   datePickerSection: {
//     marginBottom: 16,
//   },
//   dateLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom: 8,
//   },
//   dateButton: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     marginBottom: 8,
//   },
//   dateButtonText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   generateButton: {
//     borderRadius: 8,
//     paddingVertical: 12,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   generateButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });