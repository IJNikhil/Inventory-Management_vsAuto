// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   BackHandler,
//   ToastAndroid,
//   Platform,
// } from "react-native";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import FeatherIcon from "react-native-vector-icons/Feather";
// import { CreditCard, TrendingUp } from "lucide-react-native";

// // Theme imports
// import { useTheme, useColors } from "../context/ThemeContext";

// // Your existing imports
// import { Invoice, InvoiceItem, Part, Transaction } from "../types";
// import { getInvoices } from "../services/invoice-service";
// import { getTransactions } from "../services/transaction-service";
// import { getParts } from "../services/part-service";
// import StatCard from "../components/StatCard";

// type TabType = "overview" | "sales" | "expenses";

// type SalesByShopkeeperItem = {
//   name: string;
//   total: number;
//   invoiceCount: number;
// };

// type TopSellingItem = {
//   part: Part;
//   quantity: number;
// };

// interface DashboardData {
//   todayRevenue: number;
//   todayProfit: number;
//   todayInvoiceCount: number;
//   monthRevenue: number;
//   monthProfit: number;
//   monthInvoiceCount: number;
//   salesByShopkeeper: SalesByShopkeeperItem[];
//   overdueInvoices: Invoice[];
//   outOfStockParts: Part[];
//   lowStockParts: Part[];
//   topSellingWeekly: TopSellingItem[];
//   recentSales: Invoice[];
//   recentExpenses: Transaction[];
//   pendingPayables: Transaction[];
// }

// export default function DashboardScreen() {
//   const navigation = useNavigation<any>();
//   const colors = useColors();
//   const { isDark } = useTheme();
  
//   const [tab, setTab] = useState<TabType>("overview");
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [backPressedOnce, setBackPressedOnce] = useState<boolean>(false);

//   // Back button handler
//   useFocusEffect(
//     React.useCallback(() => {
//       const onBackPress = () => {
//         if (backPressedOnce) {
//           BackHandler.exitApp();
//           return true;
//         } else {
//           setBackPressedOnce(true);
          
//           if (Platform.OS === 'android') {
//             ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
//           }
          
//           setTimeout(() => {
//             setBackPressedOnce(false);
//           }, 2000);
          
//           return true;
//         }
//       };

//       const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//       return () => backHandler.remove();
//     }, [backPressedOnce])
//   );

//   useEffect(() => {
//     async function fetchStats() {
//       setLoading(true);
//       try {
//         const [invoices, manualTransactions, allParts]: [
//           Invoice[],
//           Transaction[],
//           Part[]
//         ] = await Promise.all([
//           getInvoices(),
//           getTransactions(),
//           getParts(),
//         ]);
//         const today = new Date();
//         const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//         const todayStr = today.toISOString().split("T")[0];

//         const paidInvoices = invoices.filter(inv => inv.status === "Paid");
//         const todayInvoices = paidInvoices.filter(inv =>
//           (inv.paymentDate ?? inv.date ?? "") === todayStr,
//         );
//         const currentMonthInvoices = paidInvoices.filter(inv => {
//           const date = inv.paymentDate ?? inv.date;
//           return date ? new Date(date) >= thisMonthStart : false;
//         });

//         function invoiceFlatItems(invArr: Invoice[]): InvoiceItem[] {
//           return invArr.flatMap(inv => inv.items ?? []);
//         }
//         function safeNumber(n: number | undefined): number { return typeof n === "number" ? n : 0; }

//         function calculateProfit(items: InvoiceItem[], allParts: Part[]) {
//           return items.reduce((profit, item) => {
//             if (!item?.partId) return profit;
//             const part = allParts.find(p => String(p.id) === String(item.partId));
//             if (part && typeof part.purchasePrice === "number" && typeof item.price === "number" && typeof item.quantity === "number") {
//               return profit + (item.price - part.purchasePrice) * item.quantity;
//             }
//             return profit;
//           }, 0);
//         }

//         const todayRevenue = todayInvoices.reduce((sum, inv) => sum + safeNumber(inv.total), 0);
//         const todayProfit = calculateProfit(invoiceFlatItems(todayInvoices), allParts);
//         const monthRevenue = currentMonthInvoices.reduce((sum, inv) => sum + safeNumber(inv.total), 0);
//         const monthProfit = calculateProfit(invoiceFlatItems(currentMonthInvoices), allParts);

//         const salesByShopkeeper: SalesByShopkeeperItem[] = [];
//         currentMonthInvoices.forEach(inv => {
//           const generatedBy = inv.collectedBy ?? inv.generatedBy;
//           if (!generatedBy) return;
//           const found = salesByShopkeeper.find(s => s.name === generatedBy);
//           if (found) {
//             found.total += safeNumber(inv.total);
//             found.invoiceCount += 1;
//           } else {
//             salesByShopkeeper.push({ name: generatedBy, total: safeNumber(inv.total), invoiceCount: 1 });
//           }
//         });
//         salesByShopkeeper.sort((a, b) => b.total - a.total);

//         const overdueInvoices = invoices.filter(inv => inv.status === "Overdue");
//         const outOfStockParts = allParts.filter(
//           p => p.status === "active" && safeNumber(p.quantity) === 0
//         );
//         const lowStockParts = allParts.filter(
//           p => p.status === "active" && !!p.isLowStock && safeNumber(p.quantity) > 0
//         );

//         const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
//         const weeklyInvoices = invoices.filter(
//           inv => inv.status === "Paid" &&
//                 (() => {
//                   const dateRaw = inv.paymentDate ?? inv.date;
//                   return dateRaw ? new Date(dateRaw) >= oneWeekAgo : false;
//                 })()
//         );
//         const partsSoldWeekly: Record<string, number> = {};
//         weeklyInvoices.forEach(inv => {
//           (inv.items ?? []).forEach(item => {
//             if (!item?.partId || typeof item.quantity !== "number") return;
//             const key = String(item.partId);
//             partsSoldWeekly[key] = (partsSoldWeekly[key] ?? 0) + item.quantity;
//           });
//         });
//         const topSellingWeekly: TopSellingItem[] = Object.entries(partsSoldWeekly)
//           .sort(([, a], [, b]) => (b as number) - (a as number))
//           .slice(0, 5)
//           .map(([partId, quantity]) => {
//             const part = allParts.find(p => String(p.id) === partId);
//             if (!part) return null;
//             return { part, quantity: Number(quantity) };
//           })
//           .filter(Boolean) as TopSellingItem[];

//         const recentSales = paidInvoices.slice(0, 5);
//         const recentExpenses = manualTransactions
//           .filter(t => t.status === "Paid" && t.amount < 0)
//           .slice(0, 5);
//         const pendingPayables = manualTransactions.filter(t => t.status === "Pending" && t.amount < 0);

//         setData({
//           todayRevenue,
//           todayProfit,
//           todayInvoiceCount: todayInvoices.length,
//           monthRevenue,
//           monthProfit,
//           monthInvoiceCount: currentMonthInvoices.length,
//           salesByShopkeeper,
//           overdueInvoices,
//           outOfStockParts,
//           lowStockParts,
//           topSellingWeekly,
//           recentSales,
//           recentExpenses,
//           pendingPayables,
//         });
//       } catch (err) {
//         // Optionally: set error state
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchStats();
//   }, []);

//   // Create dynamic styles based on theme
//   const dynamicStyles = StyleSheet.create({
//     bodyContainer: {
//       flex: 1,
//       backgroundColor: colors.background,
//       padding: 5,
//     },
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//       paddingHorizontal: 10,
//       paddingTop: 5,
//     },
//     center: {
//       flex: 1,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: colors.background,
//     },
//     loadingText: {
//       color: colors.primary,
//       fontWeight: "600",
//       marginTop: 12,
//       fontSize: 18,
//     },
//     title: {
//       fontSize: 28,
//       fontWeight: "bold",
//       color: colors.foreground,
//     },
//     headerButton: {
//       flexDirection: "row",
//       alignItems: "center",
//       backgroundColor: colors.primary,
//       borderRadius: 8,
//       paddingVertical: 7,
//       paddingHorizontal: 14,
//     },
//     headerButtonText: {
//       color: colors.primaryForeground,
//       fontWeight: "bold",
//       fontSize: 15,
//       marginLeft: 7,
//     },
//     tabButton: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingVertical: 9,
//       paddingHorizontal: 18,
//       borderRadius: 9,
//       backgroundColor: colors.card,
//       marginRight: 8,
//     },
//     tabButtonActive: {
//       backgroundColor: colors.foreground,
//     },
//     tabButtonText: {
//       fontWeight: "bold",
//       fontSize: 15,
//       color: colors.mutedForeground,
//     },
//     actionBoard: {
//       backgroundColor: colors.card,
//       borderRadius: 12,
//       marginTop: 4,
//       padding: 17,
//       marginBottom: 32,
//     },
//     actionBoardTitle: {
//       fontWeight: "bold",
//       fontSize: 17,
//       marginLeft: 7,
//       color: colors.cardForeground,
//     },
//     actionBoardDesc: {
//       color: colors.mutedForeground,
//       fontSize: 14,
//       marginBottom: 8,
//       marginTop: 3,
//     },
//     card: {
//       backgroundColor: colors.card,
//       borderRadius: 10,
//       marginTop: 15,
//       marginBottom: 19,
//       padding: 12,
//     },
//     innerCard: {
//       backgroundColor: colors.card,
//       borderRadius: 10,
//       padding: 12,
//       flex: 1,
//       marginRight: 12,
//       minWidth: 180,
//       marginBottom: 15,
//     },
//     innerCardTitle: {
//       fontWeight: "bold",
//       fontSize: 15,
//       color: colors.cardForeground,
//       marginBottom: 11,
//     },
//     blankAlert: {
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: colors.primaryBackground,
//       borderRadius: 10,
//       padding: 50,
//       marginTop: 7,
//     },
//     blankAlertTitle: {
//       fontWeight: "600",
//       fontSize: 16,
//       marginTop: 6,
//       color: colors.primary,
//     },
//     subtleText: {
//       color: colors.mutedForeground,
//       fontSize: 13,
//       marginTop: 6,
//     },
//     alertBox: {
//       backgroundColor: colors.card,
//       borderRadius: 9,
//       marginTop: 9,
//       padding: 11,
//       shadowColor: isDark ? colors.background : "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.05,
//       shadowRadius: 3,
//       elevation: 1,
//     },
//     alertHeaderText: {
//       fontWeight: "bold",
//       fontSize: 15,
//       marginLeft: 4,
//     },
//     alertItem: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       backgroundColor: colors.muted,
//       borderRadius: 7,
//       marginBottom: 6,
//       paddingVertical: 9,
//       paddingHorizontal: 9,
//     },
//     alertItemTitle: {
//       fontWeight: "bold",
//       fontSize: 15,
//       color: colors.cardForeground,
//     },
//     alertItemValue: {
//       fontWeight: "bold",
//       fontSize: 15,
//       minWidth: 77,
//       textAlign: "right",
//     },
//     link: {
//       color: colors.primary,
//       textDecorationLine: "underline",
//       fontSize: 13,
//       fontWeight: "bold",
//     },
//     alertGroupLabel: {
//       fontWeight: "bold",
//       fontSize: 14,
//       marginBottom: 2,
//     },
//     alertStockItem: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       backgroundColor: colors.muted,
//       borderRadius: 8,
//       padding: 9,
//       marginBottom: 5,
//     },
//     outOfStockBadge: {
//       paddingVertical: 2,
//       paddingHorizontal: 9,
//       backgroundColor: isDark ? '#4c1d1d' : '#fef2f2',
//       color: colors.destructive,
//       borderRadius: 8,
//       fontWeight: "bold",
//       fontSize: 12,
//       overflow: "hidden",
//     },
//     lowStockBadge: {
//       paddingVertical: 2,
//       paddingHorizontal: 9,
//       backgroundColor: isDark ? '#422006' : '#fef3c7',
//       color: colors.accent,
//       borderRadius: 8,
//       fontWeight: "bold",
//       fontSize: 12,
//       overflow: "hidden",
//     },
//     topSellingItem: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       borderBottomWidth: StyleSheet.hairlineWidth,
//       borderColor: colors.border,
//       paddingVertical: 7,
//     },
//     topSellingQty: {
//       fontWeight: "bold",
//       fontSize: 15,
//       color: colors.cardForeground,
//     },
//     recentRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       paddingVertical: 7,
//       borderBottomWidth: StyleSheet.hairlineWidth,
//       borderColor: colors.border,
//     },
//     shopkeeperRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       paddingVertical: 8,
//       borderBottomWidth: StyleSheet.hairlineWidth,
//       borderColor: colors.border,
//     },
//     shopkeeperValue: {
//       fontWeight: "bold",
//       fontSize: 15,
//       color: colors.cardForeground,
//       minWidth: 77,
//       textAlign: "right",
//     },
//   });

//   if (loading || !data) {
//     return (
//       <View style={dynamicStyles.center}>
//         <ActivityIndicator size="large" color={colors.primary} />
//         <Text style={dynamicStyles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={dynamicStyles.bodyContainer}>
//       <View style={[styles.headerRow, dynamicStyles.container]}>
//         <Text style={dynamicStyles.title}>Dashboard</Text>
//         <TouchableOpacity
//           style={dynamicStyles.headerButton}
//           onPress={() => navigation.navigate("InvoiceNewScreen")}
//         >
//           <FeatherIcon name="plus" size={18} color={colors.primaryForeground} />
//           <Text style={dynamicStyles.headerButtonText}>New Invoice</Text>
//         </TouchableOpacity>
//       </View>
      
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.tabRow}
//         style={[{ marginBottom: 16 }, styles.container]}
//       >
//         {tabButton("overview", tab, setTab, "Overview", "home", colors)}
//         {tabButton("sales", tab, setTab, "Sales & Revenue", "trending-up", colors)}
//         {tabButton("expenses", tab, setTab, "Expenses", "credit-card", colors)}
//       </ScrollView>

//       {/* OVERVIEW */}
//       {tab === "overview" && (
//         <View style={dynamicStyles.container}>
//           <View style={[styles.statCards, dynamicStyles.container]}>
//             <StatCard
//               title="Today's Sales"
//               value={`₹${data.todayRevenue.toLocaleString()}`}
//               icon={CreditCard}
//               helperText={`from ${data.todayInvoiceCount} invoices`}
//             />
//             <StatCard
//               title="Today's Profit"
//               value={`₹${data.todayProfit.toLocaleString()}`}
//               icon={TrendingUp}
//             />
//             <StatCard
//               title="This Month's Sales"
//               value={`₹${data.monthRevenue.toLocaleString()}`}
//               icon={CreditCard}
//               helperText={`from ${data.monthInvoiceCount} invoices`}
//             />
//             <StatCard
//               title="This Month's Profit"
//               value={`₹${data.monthProfit.toLocaleString()}`}
//               icon={TrendingUp}
//             />
//           </View>
          
//           <View style={dynamicStyles.actionBoard}>
//             <View style={styles.actionBoardTitleRow}>
//               <FeatherIcon name="alert-triangle" size={20} color={colors.destructive} />
//               <Text style={dynamicStyles.actionBoardTitle}>Action Board</Text>
//             </View>
//             <Text style={dynamicStyles.actionBoardDesc}>
//               Urgent tasks that require your attention to keep the business running smoothly.
//             </Text>
//             <View style={styles.rowWrap}>
//               <View style={{ flex: 1, minWidth: 220 }}>
//                 <PaymentList
//                   type="Overdue"
//                   items={data.overdueInvoices}
//                   onViewAll={() => navigation.navigate("Cashflow")}
//                   onViewItem={(id) => navigation.navigate("InvoiceView", { id })}
//                   colors={colors}
//                   dynamicStyles={dynamicStyles}
//                 />
//               </View>
//               <View style={{ flex: 1, minWidth: 220 }}>
//                 <InventoryAlertList
//                   outOfStock={data.outOfStockParts}
//                   lowStock={data.lowStockParts}
//                   onViewAll={() => navigation.navigate("Inventory")}
//                   colors={colors}
//                   dynamicStyles={dynamicStyles}
//                 />
//               </View>
//             </View>
//           </View>
//         </View>
//       )}

//       {/* SALES */}
//       {tab === "sales" && (
//         <View style={[dynamicStyles.bodyContainer, dynamicStyles.container]}>
//           <View style={styles.salesRow}>
//             <View style={dynamicStyles.innerCard}>
//               <Text style={dynamicStyles.innerCardTitle}>Sales by Shopkeeper</Text>
//               <SalesByShopkeeperList items={data.salesByShopkeeper} colors={colors} dynamicStyles={dynamicStyles} />
//             </View>
//             <View style={dynamicStyles.innerCard}>
//               <Text style={dynamicStyles.innerCardTitle}>Top Selling Items</Text>
//               <TopSellingList items={data.topSellingWeekly} colors={colors} dynamicStyles={dynamicStyles} />
//             </View>
//           </View>
//           <View style={dynamicStyles.card}>
//             <Text style={dynamicStyles.innerCardTitle}>Recent Sales</Text>
//             <RecentList items={data.recentSales} colors={colors} dynamicStyles={dynamicStyles} />
//             <View style={styles.rightLinkWrap}>
//               <TouchableOpacity onPress={() => navigation.navigate("Invoices")}>
//                 <Text style={dynamicStyles.link}>View All Sales</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       )}

//       {/* EXPENSES */}
//       {tab === "expenses" && (
//         <View style={[styles.salesRow, dynamicStyles.container]}>
//           <View style={dynamicStyles.innerCard}>
//             <Text style={dynamicStyles.innerCardTitle}>Pending Payables</Text>
//             <PaymentList
//               type="Pending"
//               items={data.pendingPayables}
//               onViewAll={() => navigation.navigate("Cashflow")}
//               colors={colors}
//               dynamicStyles={dynamicStyles}
//             />
//           </View>
//           <View style={dynamicStyles.innerCard}>
//             <Text style={dynamicStyles.innerCardTitle}>Recent Expenses</Text>
//             <RecentList items={data.recentExpenses} colors={colors} dynamicStyles={dynamicStyles} />
//             <View style={styles.rightLinkWrap}>
//               <TouchableOpacity onPress={() => navigation.navigate("Cashflow")}>
//                 <Text style={dynamicStyles.link}>View All Expenses</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// function tabButton(
//   tabKey: TabType,
//   activeTab: TabType,
//   setTab: (tab: TabType) => void,
//   label: string,
//   icon?: string,
//   colors?: any
// ) {
//   const isActive = tabKey === activeTab;
//   return (
//     <TouchableOpacity
//       style={[
//         {
//           flexDirection: "row",
//           alignItems: "center",
//           paddingVertical: 9,
//           paddingHorizontal: 18,
//           borderRadius: 9,
//           backgroundColor: colors?.card,
//           marginRight: 8,
//         },
//         isActive && { backgroundColor: colors?.foreground },
//       ]}
//       onPress={() => setTab(tabKey)}
//     >
//       {icon ? (
//         <FeatherIcon
//           name={icon}
//           size={16}
//           color={isActive ? colors?.background : colors?.mutedForeground}
//           style={{ marginRight: 5 }}
//         />
//       ) : null}
//       <Text style={[
//         {
//           fontWeight: "bold",
//           fontSize: 15,
//           color: colors?.mutedForeground,
//         },
//         isActive && { color: colors?.background }
//       ]}>
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// function PaymentList({
//   type,
//   items,
//   onViewAll,
//   onViewItem,
//   colors,
//   dynamicStyles,
// }: {
//   type: "Overdue" | "Pending";
//   items: Invoice[] | Transaction[];
//   onViewAll?: () => void;
//   onViewItem?: (id: string | number) => void;
//   colors: any;
//   dynamicStyles: any;
// }) {
//   if (!items.length) {
//     return (
//       <View style={dynamicStyles.blankAlert}>
//         <FeatherIcon name="check-circle" size={32} color={colors.primary} />
//         <Text style={dynamicStyles.blankAlertTitle}>
//           No {type === "Overdue" ? "overdue" : "pending"} payments!
//         </Text>
//         <Text style={dynamicStyles.subtleText}>
//           {type === "Overdue" ? "All accounts are settled." : "All bills are paid."}
//         </Text>
//       </View>
//     );
//   }
//   return (
//     <View style={dynamicStyles.alertBox}>
//       <View style={styles.alertHeaderRow}>
//         <FeatherIcon 
//           name="alert-triangle" 
//           size={16} 
//           color={type === "Overdue" ? colors.destructive : colors.accent} 
//         />
//         <Text style={[
//           dynamicStyles.alertHeaderText, 
//           { color: type === "Overdue" ? colors.destructive : colors.accent }
//         ]}>
//           {type === "Overdue" ? "Overdue Payments" : "Pending Payments"}
//         </Text>
//       </View>
//       {items.map((item, idx) => {
//         const isInvoice = (item as Invoice)?.customer !== undefined;
//         return (
//           <TouchableOpacity
//             key={String(item.id)}
//             style={dynamicStyles.alertItem}
//             disabled={!onViewItem}
//             onPress={() => onViewItem && onViewItem(item.id)}
//           >
//             <View>
//               <Text style={dynamicStyles.alertItemTitle}>
//                 {isInvoice
//                   ? (item as Invoice).customer?.name ?? "Customer"
//                   : (item as Transaction).description}
//               </Text>
//               <Text style={dynamicStyles.subtleText}>
//                 {isInvoice
//                   ? `Invoice: ${(item as Invoice).id}`
//                   : `Due: ${(item as Transaction).date ?? ""}`}
//               </Text>
//             </View>
//             <Text
//               style={[
//                 dynamicStyles.alertItemValue,
//                 { color: type === "Overdue" ? colors.destructive : colors.accent },
//               ]}
//             >
//               ₹
//               {isInvoice
//                 ? ((item as Invoice).total ?? 0).toLocaleString()
//                 : Math.abs((item as Transaction).amount ?? 0).toLocaleString()}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//       {onViewAll ? (
//         <TouchableOpacity style={styles.rightLinkWrap} onPress={onViewAll}>
//           <Text style={dynamicStyles.link}>
//             {type === "Overdue" ? "View All Receivables" : "View All Payables"}
//           </Text>
//         </TouchableOpacity>
//       ) : null}
//     </View>
//   );
// }

// function InventoryAlertList({
//   outOfStock,
//   lowStock,
//   onViewAll,
//   colors,
//   dynamicStyles,
// }: {
//   outOfStock: Part[];
//   lowStock: Part[];
//   onViewAll?: () => void;
//   colors: any;
//   dynamicStyles: any;
// }) {
//   if (!outOfStock.length && !lowStock.length) {
//     return (
//       <View style={dynamicStyles.blankAlert}>
//         <FeatherIcon name="check" size={32} color={colors.primary} />
//         <Text style={dynamicStyles.blankAlertTitle}>Inventory is healthy!</Text>
//         <Text style={dynamicStyles.subtleText}>No stock alerts to show.</Text>
//       </View>
//     );
//   }
//   return (
//     <View style={dynamicStyles.alertBox}>
//       {outOfStock.length > 0 && (
//         <View style={styles.alertGroup}>
//           <Text style={[dynamicStyles.alertGroupLabel, { color: colors.destructive }]}>Out of Stock</Text>
//           {outOfStock.map(part => (
//             <View style={dynamicStyles.alertStockItem} key={"out-" + part.id}>
//               <Text style={dynamicStyles.alertItemTitle}>{part.name}</Text>
//               <Text style={dynamicStyles.outOfStockBadge}>Out of Stock</Text>
//             </View>
//           ))}
//         </View>
//       )}
//       {lowStock.length > 0 && (
//         <View style={styles.alertGroup}>
//           <Text style={[dynamicStyles.alertGroupLabel, { color: colors.accent }]}>Low Stock</Text>
//           {lowStock.map(part => (
//             <View style={dynamicStyles.alertStockItem} key={"low-" + part.id}>
//               <Text style={dynamicStyles.alertItemTitle}>{part.name}</Text>
//               <Text style={dynamicStyles.lowStockBadge}>Qty: {part.quantity}</Text>
//             </View>
//           ))}
//         </View>
//       )}
//       {onViewAll && (
//         <TouchableOpacity style={styles.rightLinkWrap} onPress={onViewAll}>
//           <Text style={dynamicStyles.link}>View Full Inventory</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// function TopSellingList({ 
//   items, 
//   colors, 
//   dynamicStyles 
// }: { 
//   items: TopSellingItem[];
//   colors: any;
//   dynamicStyles: any;
// }) {
//   if (!items.length) {
//     return (
//       <View style={dynamicStyles.blankAlert}>
//         <Text style={dynamicStyles.subtleText}>No sales recorded yet this week.</Text>
//       </View>
//     );
//   }
//   return (
//     <View>
//       {items.map(({ part, quantity }) => (
//         <View style={dynamicStyles.topSellingItem} key={part.id}>
//           <View>
//             <Text style={dynamicStyles.alertItemTitle}>{part.name}</Text>
//             <Text style={dynamicStyles.subtleText}>{part.partNumber}</Text>
//           </View>
//           <Text style={dynamicStyles.topSellingQty}>{quantity} units</Text>
//         </View>
//       ))}
//     </View>
//   );
// }

// function RecentList({ 
//   items, 
//   colors, 
//   dynamicStyles 
// }: { 
//   items: (Invoice | Transaction)[];
//   colors: any;
//   dynamicStyles: any;
// }) {
//   if (!items.length) {
//     return (
//       <View style={dynamicStyles.blankAlert}>
//         <Text style={dynamicStyles.subtleText}>No recent activity.</Text>
//       </View>
//     );
//   }
//   return (
//     <View>
//       {items.map((tx, i) => {
//         const isInvoice = (tx as Invoice)?.customer !== undefined;
//         const label = isInvoice
//           ? `Invoice to ${(tx as Invoice).customer?.name ?? "Customer"}`
//           : (tx as Transaction).description;
//         const amount = isInvoice
//           ? (tx as Invoice).total ?? 0
//           : (tx as Transaction).amount ?? 0;
//         const date = isInvoice
//           ? (tx as Invoice).date ?? ""
//           : (tx as Transaction).date ?? "";
//         return (
//           <View style={dynamicStyles.recentRow} key={i}>
//             <View>
//               <Text style={dynamicStyles.alertItemTitle}>{label}</Text>
//               <Text style={dynamicStyles.subtleText}>{date}</Text>
//             </View>
//             <Text
//               style={[
//                 dynamicStyles.alertItemValue,
//                 { color: amount > 0 ? colors.primary : colors.destructive },
//               ]}
//             >
//               {amount > 0 ? "↓" : "↑"} ₹{Math.abs(amount).toLocaleString()}
//             </Text>
//           </View>
//         );
//       })}
//     </View>
//   );
// }

// function SalesByShopkeeperList({
//   items,
//   colors,
//   dynamicStyles,
// }: {
//   items: SalesByShopkeeperItem[];
//   colors: any;
//   dynamicStyles: any;
// }) {
//   if (!items.length) {
//     return (
//       <View style={dynamicStyles.blankAlert}>
//         <Text style={dynamicStyles.subtleText}>No sales recorded yet this month.</Text>
//       </View>
//     );
//   }
//   return (
//     <View>
//       {items.map(item => (
//         <View style={dynamicStyles.shopkeeperRow} key={item.name}>
//           <View style={styles.shopkeeperLeft}>
//             <FeatherIcon name="user" size={18} color={colors.mutedForeground} style={{ marginRight: 8 }} />
//             <View>
//               <Text style={dynamicStyles.alertItemTitle}>{item.name}</Text>
//               <Text style={dynamicStyles.subtleText}>{item.invoiceCount} invoices</Text>
//             </View>
//           </View>
//           <Text style={dynamicStyles.shopkeeperValue}>₹{item.total.toLocaleString()}</Text>
//         </View>
//       ))}
//     </View>
//   );
// }

// // Static styles that don't need theme
// const styles = StyleSheet.create({
//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   tabRow: {
//     flexDirection: "row",
//     gap: 10 as any,
//     marginBottom: 16,
//     backgroundColor: "transparent",
//   },
//   container: {
//     paddingHorizontal: 15,
//   },
//   statCards: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginBottom: 17,
//   },
//   actionBoardTitleRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 2,
//   },
//   rowWrap: {
//     flexDirection: "row",
//     gap: 14 as any,
//     flexWrap: "wrap",
//   },
//   salesRow: {
//     flexDirection: "row",
//     gap: 15 as any,
//     flexWrap: "wrap",
//     marginBottom: 12,
//     paddingHorizontal:6,
//   },
//   alertHeaderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   rightLinkWrap: {
//     alignItems: "flex-end",
//     marginTop: 9,
//   },
//   alertGroup: {
//     marginBottom: 7,
//   },
//   shopkeeperLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
// });
