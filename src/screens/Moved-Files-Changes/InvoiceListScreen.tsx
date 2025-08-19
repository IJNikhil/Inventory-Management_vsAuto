// import React, { useEffect, useState, useMemo, useCallback } from 'react'
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Modal,
//   ActivityIndicator,
//   StyleSheet,
//   RefreshControl,
//   Dimensions,
//   Alert,
// } from 'react-native'
// import { 
//   PlusCircle, 
//   Search, 
//   FileText, 
//   Wallet, 
//   Filter,
//   Inbox,
//   X,
//   CheckCircle,
//   Calendar,
//   User,
//   DollarSign,
//   Clock,
//   AlertCircle,
// } from 'lucide-react-native'
// import { format, differenceInDays } from 'date-fns'
// import type { Invoice } from '../types'
// import { getInvoices, updateInvoiceStatus } from '../services/invoice-service'
// import { useToast } from '../hooks/use-toast'
// import { useAppSelector } from '../lib/redux/hooks'
// import { selectAuth } from '../lib/redux/slices/auth-slice'
// import { useColors, useTheme } from '../context/ThemeContext'

// // --- Constants ---
// const ITEMS_PER_PAGE = 20
// const OVERDUE_DAYS = 15
// const { width: screenWidth } = Dimensions.get('window')

// const TABS = [
//   { key: 'all', label: 'All', icon: FileText },
//   { key: 'paid', label: 'Paid', icon: CheckCircle },
//   { key: 'pending', label: 'Pending', icon: Clock },
//   { key: 'overdue', label: 'Overdue', icon: AlertCircle },
// ] as const

// type TabKey = typeof TABS[number]['key']

// // --- Main Screen ---
// export default function InvoiceListScreen({ navigation }: any) {
//   const [invoices, setInvoices] = useState<Invoice[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [isRefreshing, setIsRefreshing] = useState(false)
//   const [isLoadingMore, setIsLoadingMore] = useState(false)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [currentPage, setCurrentPage] = useState(1)
//   const [activeTab, setActiveTab] = useState<TabKey>('all')
//   const [showFilters, setShowFilters] = useState(false)
  
//   const { toast } = useToast()
//   const { user } = useAppSelector(selectAuth)
//   const colors = useColors()
//   const { isDark } = useTheme()

//   // --- Data Loading ---
//   const loadInvoices = useCallback(async (showLoading = true) => {
//     if (showLoading) setIsLoading(true)
//     try {
//       const inv = await getInvoices()
//       setInvoices(inv)
//     } catch (err) {
//       toast({ title: 'Error', description: 'Failed to fetch invoices.', variant: 'destructive' })
//     } finally {
//       if (showLoading) setIsLoading(false)
//     }
//   }, [toast])

//   useEffect(() => {
//     loadInvoices(true)
//   }, [loadInvoices])

//   // Refresh function
//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true)
//     setCurrentPage(1)
//     try {
//       await loadInvoices(false)
//       toast({ title: 'Refreshed', description: 'Invoice data updated successfully.' })
//     } catch (error) {
//       console.error('Error refreshing invoices:', error)
//     } finally {
//       setIsRefreshing(false)
//     }
//   }, [loadInvoices, toast])

//   // --- Filtering and Processing ---
//   const processedInvoices = useMemo(() => {
//     // Add displayStatus for 'Overdue'
//     return invoices.map(inv => {
//       let displayStatus: Invoice['status'] = inv.status
//       if (inv.status === 'Pending') {
//         const daysDiff = differenceInDays(new Date(), new Date(inv.date))
//         if (daysDiff > OVERDUE_DAYS) displayStatus = 'Overdue'
//       }
//       return { ...inv, displayStatus }
//     })
//   }, [invoices])

//   const filteredInvoices = useMemo(() => {
//     let filtered = processedInvoices.filter(
//       (inv) =>
//         inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         inv.id?.toLowerCase().includes(searchTerm.toLowerCase())
//     )

//     if (activeTab !== 'all') {
//       filtered = filtered.filter(inv =>
//         inv.displayStatus.toLowerCase() === activeTab
//       )
//     }

//     // Sort by date (newest first)
//     return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
//   }, [processedInvoices, searchTerm, activeTab])

//   // Pagination
//   const paginatedInvoices = useMemo(() => {
//     return filteredInvoices.slice(0, currentPage * ITEMS_PER_PAGE)
//   }, [filteredInvoices, currentPage])

//   const hasMore = paginatedInvoices.length < filteredInvoices.length

//   // Load more function
//   const loadMore = useCallback(() => {
//     if (!isLoadingMore && hasMore) {
//       setIsLoadingMore(true)
//       setTimeout(() => {
//         setCurrentPage(prev => prev + 1)
//         setIsLoadingMore(false)
//       }, 500)
//     }
//   }, [isLoadingMore, hasMore])

//   // --- Invoice status update helper ---
//   const handleUpdateStatus = useCallback(
//     async (invoiceId: string, status: Invoice['status'], paymentMethod?: Invoice['paymentMethod']) => {
//       try {
//         const updatedInvoice = await updateInvoiceStatus(
//           invoiceId,
//           status,
//           user?.name ?? 'System',
//           paymentMethod
//         )
//         if (updatedInvoice) {
//           setInvoices(prev => prev.map(inv => (inv.id === invoiceId ? updatedInvoice : inv)))
//           toast({ title: 'Status Updated', description: `Invoice ${invoiceId} marked as ${status}.` })
//           return true
//         }
//         return false
//       } catch (error) {
//         toast({ title: 'Error', description: 'Failed to update invoice status', variant: 'destructive' })
//         return false
//       }
//     },
//     [user, toast]
//   )

//   // Get tab counts
//   const tabCounts = useMemo(() => {
//     const counts = { all: 0, paid: 0, pending: 0, overdue: 0 }
//     processedInvoices.forEach(inv => {
//       counts.all++
//       counts[inv.displayStatus.toLowerCase() as keyof typeof counts]++
//     })
//     return counts
//   }, [processedInvoices])

//   // --- Render Functions ---
//   const renderHeader = () => (
//     <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
//       <View style={styles.headerTop}>
//         <Text style={[styles.headerTitle, { color: colors.foreground }]}>Invoices</Text>
//         <TouchableOpacity
//           onPress={() => navigation.navigate('InvoiceNewScreen')}
//           style={[styles.createButton, { backgroundColor: colors.primary }]}
//           activeOpacity={0.8}
//         >
//           <PlusCircle size={20} color={colors.primaryForeground} />
//           <Text style={[styles.createButtonText, { color: colors.primaryForeground }]}>
//             New
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Search Bar */}
//       <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
//         <Search size={18} color={colors.mutedForeground} style={styles.searchIcon} />
//         <TextInput
//           placeholder="Search invoices..."
//           placeholderTextColor={colors.mutedForeground}
//           value={searchTerm}
//           onChangeText={(txt) => { setSearchTerm(txt); setCurrentPage(1) }}
//           style={[styles.searchInput, { color: colors.foreground }]}
//           autoCorrect={false}
//           returnKeyType="search"
//         />
//         {searchTerm.length > 0 && (
//           <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearSearch}>
//             <X size={16} color={colors.mutedForeground} />
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* Filter Tabs */}
//       <View style={styles.tabsContainer}>
//         {TABS.map((tab) => {
//           const IconComponent = tab.icon
//           const isActive = activeTab === tab.key
//           const count = tabCounts[tab.key]
          
//           return (
//             <TouchableOpacity
//               key={tab.key}
//               onPress={() => { setActiveTab(tab.key); setCurrentPage(1) }}
//               style={[
//                 styles.tab,
//                 {
//                   backgroundColor: isActive ? colors.primary : colors.background,
//                   borderColor: isActive ? colors.primary : colors.border,
//                 }
//               ]}
//               activeOpacity={0.7}
//             >
//               <IconComponent 
//                 size={16} 
//                 color={isActive ? colors.primaryForeground : colors.mutedForeground} 
//               />
//               <Text style={[
//                 styles.tabText,
//                 { color: isActive ? colors.primaryForeground : colors.foreground }
//               ]}>
//                 {tab.label}
//               </Text>
//               {count > 0 && (
//                 <View style={[
//                   styles.tabBadge,
//                   { backgroundColor: isActive ? colors.primaryForeground + '20' : colors.muted }
//                 ]}>
//                   <Text style={[
//                     styles.tabBadgeText,
//                     { color: isActive ? colors.primaryForeground : colors.mutedForeground }
//                   ]}>
//                     {count}
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           )
//         })}
//       </View>
//     </View>
//   )

//   const renderInvoiceCard = ({ item }: { item: Invoice & { displayStatus: Invoice['status'] } }) => (
//     <InvoiceCard
//       invoice={item}
//       onUpdateStatus={handleUpdateStatus}
//       navigation={navigation}
//       colors={colors}
//     />
//   )

//   const renderFooter = () => {
//     if (!isLoadingMore) return null
//     return (
//       <View style={styles.loadingMore}>
//         <ActivityIndicator size="small" color={colors.primary} />
//         <Text style={[styles.loadingMoreText, { color: colors.mutedForeground }]}>
//           Loading more...
//         </Text>
//       </View>
//     )
//   }

//   const renderEmpty = () => (
//     <View style={styles.emptyContainer}>
//       <Inbox size={64} color={colors.mutedForeground} />
//       <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
//         {searchTerm ? 'No matching invoices' : 'No invoices found'}
//       </Text>
//       <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
//         {searchTerm 
//           ? 'Try adjusting your search terms'
//           : 'Create your first invoice to get started'
//         }
//       </Text>
//       {!searchTerm && (
//         <TouchableOpacity
//           style={[styles.emptyAction, { backgroundColor: colors.primary }]}
//           onPress={() => navigation.navigate('InvoiceNewScreen')}
//           activeOpacity={0.8}
//         >
//           <PlusCircle size={18} color={colors.primaryForeground} />
//           <Text style={[styles.emptyActionText, { color: colors.primaryForeground }]}>
//             Create Invoice
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   )

//   // --- Main Render ---
//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <FlatList
//         data={paginatedInvoices}
//         keyExtractor={(item) => item.id}
//         renderItem={renderInvoiceCard}
//         ListHeaderComponent={renderHeader}
//         ListEmptyComponent={!isLoading ? renderEmpty : null}
//         ListFooterComponent={renderFooter}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//         onEndReached={loadMore}
//         onEndReachedThreshold={0.3}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContainer}
//         removeClippedSubviews={true}
//         maxToRenderPerBatch={10}
//         updateCellsBatchingPeriod={50}
//         initialNumToRender={10}
//       />

//       {/* Loading Overlay */}
//       {isLoading && (
//         <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
//           <ActivityIndicator size="large" color={colors.primary} />
//           <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
//             Loading invoices...
//           </Text>
//         </View>
//       )}
//     </View>
//   )
// }

// // --- Invoice Card Component ---
// function InvoiceCard({
//   invoice,
//   onUpdateStatus,
//   navigation,
//   colors,
// }: {
//   invoice: Invoice & { displayStatus: Invoice['status'] }
//   onUpdateStatus: (id: string, status: Invoice['status'], paymentMethod?: Invoice['paymentMethod']) => Promise<boolean>
//   navigation: any
//   colors: any
// }) {
//   const [showPaidModal, setShowPaidModal] = useState(false)

//   const handleCardPress = () => {
//     navigation.navigate('InvoiceDetailScreenId', { id: invoice.id })
//   }

//   const handleMarkAsPaid = (e: any) => {
//     e.stopPropagation()
//     setShowPaidModal(true)
//   }

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Paid': return { bg: colors.primary + '15', text: colors.primary, border: colors.primary }
//       case 'Pending': return { bg: colors.accent + '15', text: colors.accent, border: colors.accent }
//       case 'Overdue': return { bg: colors.destructive + '15', text: colors.destructive, border: colors.destructive }
//       default: return { bg: colors.muted, text: colors.mutedForeground, border: colors.border }
//     }
//   }

//   const statusStyle = getStatusColor(invoice.displayStatus)
//   const daysSinceInvoice = differenceInDays(new Date(), new Date(invoice.date))

//   return (
//     <>
//       <TouchableOpacity
//         style={[styles.invoiceCard, { 
//           backgroundColor: colors.card, 
//           borderColor: colors.border,
//           shadowColor: colors.foreground,
//         }]}
//         onPress={handleCardPress}
//         activeOpacity={0.7}
//       >
//         {/* Header Row */}
//         <View style={styles.cardHeader}>
//           <View style={styles.cardHeaderLeft}>
//             <Text style={[styles.invoiceId, { color: colors.primary }]}>
//               #{invoice.id}
//             </Text>
//             <View style={[styles.statusBadge, { 
//               backgroundColor: statusStyle.bg, 
//               borderColor: statusStyle.border 
//             }]}>
//               <Text style={[styles.statusText, { color: statusStyle.text }]}>
//                 {invoice.displayStatus}
//               </Text>
//             </View>
//           </View>
//           <Text style={[styles.invoiceAmount, { color: colors.foreground }]}>
//             ₹{invoice.total.toLocaleString('en-IN')}
//           </Text>
//         </View>

//         {/* Customer and Date */}
//         <View style={styles.cardDetails}>
//           <View style={styles.cardDetailRow}>
//             <User size={14} color={colors.mutedForeground} />
//             <Text style={[styles.customerName, { color: colors.foreground }]} numberOfLines={1}>
//               {invoice.customerName}
//             </Text>
//           </View>
//           <View style={styles.cardDetailRow}>
//             <Calendar size={14} color={colors.mutedForeground} />
//             <Text style={[styles.invoiceDate, { color: colors.mutedForeground }]}>
//               {format(new Date(invoice.date), 'dd MMM yyyy')}
//               {daysSinceInvoice > 0 && (
//                 <Text style={{ fontSize: 12 }}> • {daysSinceInvoice} days ago</Text>
//               )}
//             </Text>
//           </View>
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.cardActions}>
//           <TouchableOpacity
//             style={[styles.viewButton, { backgroundColor: colors.background, borderColor: colors.border }]}
//             onPress={handleCardPress}
//             activeOpacity={0.7}
//           >
//             <FileText size={14} color={colors.foreground} />
//             <Text style={[styles.viewButtonText, { color: colors.foreground }]}>View</Text>
//           </TouchableOpacity>
          
//           {invoice.status !== 'Paid' && (
//             <TouchableOpacity
//               style={[styles.paidButton, { backgroundColor: colors.primary }]}
//               onPress={handleMarkAsPaid}
//               activeOpacity={0.7}
//             >
//               <Wallet size={14} color={colors.primaryForeground} />
//               <Text style={[styles.paidButtonText, { color: colors.primaryForeground }]}>
//                 Mark Paid
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Additional Info */}
//         {(invoice.paymentMethod || invoice.collectedBy) && (
//           <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
//             {invoice.paymentMethod && (
//               <View style={styles.footerItem}>
//                 <DollarSign size={12} color={colors.mutedForeground} />
//                 <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
//                   {invoice.paymentMethod}
//                 </Text>
//               </View>
//             )}
//             {invoice.collectedBy && (
//               <View style={styles.footerItem}>
//                 <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
//                   by {invoice.collectedBy}
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* Mark as Paid Modal */}
//       {showPaidModal && (
//         <MarkAsPaidDialog
//           open={showPaidModal}
//           onClose={() => setShowPaidModal(false)}
//           onSave={async (status, pm) => {
//             const ok = await onUpdateStatus(invoice.id, status, pm)
//             if (ok) setShowPaidModal(false)
//           }}
//           colors={colors}
//         />
//       )}
//     </>
//   )
// }

// // ---- MODAL: MARK AS PAID ----
// function MarkAsPaidDialog({
//   open,
//   onClose,
//   onSave,
//   colors,
// }: {
//   open: boolean
//   onClose: () => void
//   onSave: (status: Invoice['status'], paymentMethod: 'Cash' | 'Card' | 'Bank Transfer') => Promise<void>
//   colors: any
// }) {
//   const [paymentMethod, setPaymentMethod] = useState<Invoice['paymentMethod']>('Cash')
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const paymentMethods = [
//     { value: 'Cash', icon: DollarSign, label: 'Cash Payment' },
//     { value: 'Card', icon: CheckCircle, label: 'Card Payment' },
//     { value: 'Bank Transfer', icon: FileText, label: 'Bank Transfer' },
//   ]

//   return (
//     <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
//       <View style={styles.modalOverlay}>
//         <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
//           <View style={styles.modalHeader}>
//             <Text style={[styles.modalTitle, { color: colors.foreground }]}>
//               Mark as Paid
//             </Text>
//             <TouchableOpacity onPress={onClose} style={styles.modalCloseButton} activeOpacity={0.7}>
//               <X size={24} color={colors.mutedForeground} />
//             </TouchableOpacity>
//           </View>
          
//           <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
//             Select the payment method used for this invoice.
//           </Text>

//           <View style={styles.paymentMethodsContainer}>
//             {paymentMethods.map((pm) => {
//               const IconComponent = pm.icon
//               const isSelected = paymentMethod === pm.value
              
//               return (
//                 <TouchableOpacity
//                   key={pm.value}
//                   style={[
//                     styles.paymentMethodOption,
//                     {
//                       backgroundColor: isSelected ? colors.primary + '10' : colors.background,
//                       borderColor: isSelected ? colors.primary : colors.border,
//                     }
//                   ]}
//                   onPress={() => setPaymentMethod(pm.value as Invoice['paymentMethod'])}
//                   activeOpacity={0.7}
//                 >
//                   <IconComponent 
//                     size={18} 
//                     color={isSelected ? colors.primary : colors.mutedForeground} 
//                   />
//                   <View style={styles.paymentMethodContent}>
//                     <Text style={[
//                       styles.paymentMethodText,
//                       { color: isSelected ? colors.primary : colors.foreground }
//                     ]}>
//                       {pm.label}
//                     </Text>
//                   </View>
//                   {isSelected && (
//                     <CheckCircle size={18} color={colors.primary} />
//                   )}
//                 </TouchableOpacity>
//               )
//             })}
//           </View>

//           <View style={styles.modalActions}>
//             <TouchableOpacity 
//               onPress={onClose} 
//               style={[styles.modalCancelButton, { backgroundColor: colors.muted }]}
//               activeOpacity={0.7}
//             >
//               <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>
//                 Cancel
//               </Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity
//               style={[styles.modalConfirmButton, { 
//                 backgroundColor: colors.primary,
//                 opacity: isSubmitting ? 0.7 : 1
//               }]}
//               onPress={async () => {
//                 setIsSubmitting(true)
//                 await onSave('Paid', paymentMethod)
//                 setIsSubmitting(false)
//               }}
//               disabled={isSubmitting}
//               activeOpacity={0.8}
//             >
//               {isSubmitting && (
//                 <ActivityIndicator 
//                   size={16} 
//                   color={colors.primaryForeground} 
//                   style={{ marginRight: 8 }} 
//                 />
//               )}
//               <Text style={[styles.modalConfirmText, { color: colors.primaryForeground }]}>
//                 {isSubmitting ? 'Processing...' : 'Confirm Payment'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   listContainer: {
//     flexGrow: 1,
//   },
  
//   // Header Styles
//   header: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   createButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     gap: 6,
//   },
//   createButtonText: {
//     fontWeight: '600',
//     fontSize: 14,
//   },
  
//   // Search Styles
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 12,
//     borderWidth: 1,
//     paddingHorizontal: 12,
//     height: 44,
//     marginBottom: 16,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//   },
//   clearSearch: {
//     padding: 4,
//   },
  
//   // Tabs Styles
//   tabsContainer: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   tab: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 8,
//     borderWidth: 1,
//     gap: 4,
//   },
//   tabText: {
//     fontWeight: '600',
//     fontSize: 12,
//   },
//   tabBadge: {
//     borderRadius: 10,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     minWidth: 18,
//     alignItems: 'center',
//   },
//   tabBadgeText: {
//     fontSize: 10,
//     fontWeight: '600',
//   },
  
//   // Invoice Card Styles
//   invoiceCard: {
//     marginHorizontal: 16,
//     marginVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     padding: 16,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   cardHeaderLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     gap: 8,
//   },
//   invoiceId: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 12,
//     borderWidth: 1,
//   },
//   statusText: {
//     fontSize: 11,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//   },
//   invoiceAmount: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
  
//   // Card Details
//   cardDetails: {
//     marginBottom: 16,
//     gap: 8,
//   },
//   cardDetailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   customerName: {
//     fontSize: 15,
//     fontWeight: '500',
//     flex: 1,
//   },
//   invoiceDate: {
//     fontSize: 13,
//   },
  
//   // Card Actions
//   cardActions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   viewButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 10,
//     paddingVertical: 10,
//     borderWidth: 1,
//     gap: 6,
//   },
//   viewButtonText: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   paidButton: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 10,
//     paddingVertical: 10,
//     gap: 6,
//   },
//   paidButtonText: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
  
//   // Card Footer
//   cardFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingTop: 12,
//     marginTop: 12,
//     borderTopWidth: StyleSheet.hairlineWidth,
//   },
//   footerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   footerText: {
//     fontSize: 12,
//   },
  
//   // Loading States
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 1000,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   loadingMore: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 20,
//     gap: 8,
//   },
//   loadingMoreText: {
//     fontSize: 14,
//   },
  
//   // Empty State
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 80,
//     paddingHorizontal: 32,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 15,
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 24,
//   },
//   emptyAction: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 12,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     gap: 8,
//   },
//   emptyActionText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
  
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalCard: {
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 24,
//     paddingTop: 24,
//     paddingBottom: 8,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   modalCloseButton: {
//     padding: 8,
//   },
//   modalSubtitle: {
//     fontSize: 15,
//     paddingHorizontal: 24,
//     marginBottom: 24,
//     lineHeight: 22,
//   },
  
//   // Payment Methods
//   paymentMethodsContainer: {
//     paddingHorizontal: 24,
//     marginBottom: 32,
//     gap: 12,
//   },
//   paymentMethodOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     borderRadius: 12,
//     borderWidth: 2,
//     gap: 12,
//   },
//   paymentMethodContent: {
//     flex: 1,
//   },
//   paymentMethodText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
  
//   // Modal Actions
//   modalActions: {
//     flexDirection: 'row',
//     paddingHorizontal: 24,
//     paddingBottom: 34,
//     gap: 12,
//   },
//   modalCancelButton: {
//     flex: 1,
//     paddingVertical: 16,
//     alignItems: 'center',
//     borderRadius: 12,
//   },
//   modalCancelText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   modalConfirmButton: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//     borderRadius: 12,
//     gap: 8,
//   },
//   modalConfirmText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// })
