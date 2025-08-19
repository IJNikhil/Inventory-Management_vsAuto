// import React, { useEffect, useMemo, useState } from 'react'
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Modal,
//   StyleSheet,
//   ActivityIndicator,
//   Dimensions,
// } from 'react-native'
// import {
//   PlusCircle,
//   Search,
//   Inbox,
//   Trash2,
//   ArchiveRestore,
//   Eye,
//   Edit,
//   MoreHorizontal,
// } from 'lucide-react-native'
// import { getParts, deletePart, restorePart } from '../services/part-service'
// import { useToast } from '../hooks/use-toast'
// import { useColors, useTheme } from '../context/ThemeContext'
// import type { Part } from '../types'

// const { width: screenWidth } = Dimensions.get('window')
// const ITEMS_PER_PAGE = 8
// type SortKey = keyof Part
// type SortDirection = 'ascending' | 'descending'

// const STOCK_FILTERS = [
//   { label: 'All', value: 'all' },
//   { label: 'In Stock', value: 'in-stock' },
//   { label: 'Low Stock', value: 'low' },
//   { label: 'Out of Stock', value: 'out-of-stock' },
// ]

// export default function InventoryScreen({ navigation }: any) {
//   const [parts, setParts] = useState<Part[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState('')
//   const { toast } = useToast()
//   const [activeView, setActiveView] = useState<'active' | 'deleted'>('active')
//   const [activeStockFilter, setActiveStockFilter] = useState<'all' | 'in-stock' | 'low' | 'out-of-stock'>('all')
//   const [currentPage, setCurrentPage] = useState(1)
//   const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({
//     key: 'name',
//     direction: 'ascending',
//   })
//   const [rowActionModal, setRowActionModal] = useState<{ part: Part | null; visible: boolean }>({ part: null, visible: false })
//   const [deleteModal, setDeleteModal] = useState<{ part: Part | null; visible: boolean }>({ part: null, visible: false })

//   // Theme hooks
//   const colors = useColors()
//   const { isDark } = useTheme()

//   useEffect(() => {
//     let stale = false
//     const loadParts = async () => {
//       setIsLoading(true)
//       try {
//         const fetchedParts = await getParts()
//         if (!stale) setParts(fetchedParts)
//       } catch (error) {
//         toast({ title: 'Error', description: 'Could not fetch inventory.', variant: 'destructive' })
//       } finally {
//         if (!stale) setIsLoading(false)
//       }
//     }
//     loadParts()
//     return () => { stale = true }
//   }, [toast])

//   const sortedAndFilteredParts = useMemo(() => {
//     let filtered = parts.filter((p) => p.status === activeView)
//     filtered = filtered.filter(
//       (part) =>
//         part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         part.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//     if (activeView === 'active') {
//       if (activeStockFilter === 'low') filtered = filtered.filter((part) => part.isLowStock && part.quantity > 0)
//       else if (activeStockFilter === 'in-stock') filtered = filtered.filter((part) => !part.isLowStock && part.quantity > 0)
//       else if (activeStockFilter === 'out-of-stock') filtered = filtered.filter((part) => part.quantity === 0)
//     }
//     if (sortConfig !== null) {
//       filtered.sort((a, b) => {
//         const aValue = a[sortConfig.key]
//         const bValue = b[sortConfig.key]
//         if (typeof aValue === 'number' && typeof bValue === 'number') {
//           if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1
//           if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1
//         } else if (typeof aValue === 'string' && typeof bValue === 'string') {
//           if (aValue.toLowerCase() < bValue.toLowerCase()) return sortConfig.direction === 'ascending' ? -1 : 1
//           if (aValue.toLowerCase() > bValue.toLowerCase()) return sortConfig.direction === 'ascending' ? 1 : -1
//         }
//         return 0
//       })
//     }
//     return filtered
//   }, [parts, searchTerm, activeView, activeStockFilter, sortConfig])

//   const totalPages = Math.ceil(sortedAndFilteredParts.length / ITEMS_PER_PAGE)
//   const paginatedParts = sortedAndFilteredParts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

//   const headerSort = (key: SortKey, label: string) => (
//     <TouchableOpacity
//       onPress={() => {
//         let direction: SortDirection = 'ascending'
//         if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending'
//         setSortConfig({ key, direction })
//         setCurrentPage(1)
//       }}
//       style={styles.sortHeader}
//       activeOpacity={0.7}
//     >
//       <Text style={[styles.headerTitle, { color: colors.foreground }]}>{label}</Text>
//       {sortConfig?.key === key && (
//         <Text style={[styles.headerArrow, { color: colors.primary }]}>
//           {sortConfig.direction === 'ascending' ? '↑' : '↓'}
//         </Text>
//       )}
//     </TouchableOpacity>
//   )

//   // Service handlers
//   const handleDeletePart = async (partId: string) => {
//     try {
//       await deletePart(partId)
//       setParts((prev) => prev.map((p) => (p.id === partId ? { ...p, status: 'deleted' } : p)))
//       toast({ title: 'Part Deleted', description: 'Part has been moved to the deleted items list.', variant: 'destructive' })
//     } catch {
//       toast({ title: 'Error', description: 'Failed to delete part.', variant: 'destructive' })
//     }
//   }

//   const handleRestorePart = async (partId: string) => {
//     try {
//       await restorePart(partId)
//       setParts((prev) => prev.map((p) => (p.id === partId ? { ...p, status: 'active' } : p)))
//       toast({ title: 'Part Restored', description: 'Part has been restored to active inventory.' })
//     } catch {
//       toast({ title: 'Error', description: 'Failed to restore part.', variant: 'destructive' })
//     }
//   }

//   return (
//     <View style={[styles.screen, { backgroundColor: colors.background }]}>
//       {/* Header */}
//       <View style={styles.headerRow}>
//         <Text style={[styles.header, { color: colors.foreground }]}>Inventory</Text>
//         <TouchableOpacity
//           style={[styles.addStockBtn, { backgroundColor: colors.primary }]}
//           onPress={() => navigation.navigate('AddStock')}
//           activeOpacity={0.8}
//         >
//           <PlusCircle size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//           <Text style={[styles.addStockText, { color: colors.primaryForeground }]}>Add Stock</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabRow}>
//         <TouchableOpacity
//           onPress={() => { setActiveView('active'); setCurrentPage(1) }}
//           style={[
//             styles.tabBtn,
//             { backgroundColor: activeView === 'active' ? colors.primary : colors.card }
//           ]}
//           activeOpacity={0.8}
//         >
//           <Text style={[
//             styles.tabText,
//             { color: activeView === 'active' ? colors.primaryForeground : colors.mutedForeground }
//           ]}>
//             Active Inventory
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => { setActiveView('deleted'); setCurrentPage(1) }}
//           style={[
//             styles.tabBtn,
//             { backgroundColor: activeView === 'deleted' ? colors.primary : colors.card }
//           ]}
//           activeOpacity={0.8}
//         >
//           <Text style={[
//             styles.tabText,
//             { color: activeView === 'deleted' ? colors.primaryForeground : colors.mutedForeground }
//           ]}>
//             Deleted Items
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <View style={styles.searchRow}>
//           <Search 
//             size={18} 
//             color={colors.mutedForeground} 
//             style={styles.searchIcon} 
//           />
//           <TextInput
//             placeholder="Search parts by name, number, supplier..."
//             placeholderTextColor={colors.mutedForeground}
//             style={[styles.searchInput, {
//               backgroundColor: colors.card,
//               borderColor: colors.border,
//               color: colors.foreground
//             }]}
//             value={searchTerm}
//             onChangeText={(txt) => { setSearchTerm(txt); setCurrentPage(1) }}
//           />
//         </View>
//       </View>

//       {/* Stock Filters (only for active inventory) */}
//       {activeView === 'active' && (
//         <View style={styles.filtersContainer}>
//           <View style={styles.stockFilterWrap}>
//             {STOCK_FILTERS.map((f) => (
//               <TouchableOpacity
//                 key={f.value}
//                 onPress={() => { setActiveStockFilter(f.value as any); setCurrentPage(1) }}
//                 style={[
//                   styles.filterBadge,
//                   {
//                     backgroundColor: activeStockFilter === f.value ? colors.primary : colors.card,
//                     borderColor: activeStockFilter === f.value ? colors.primary : colors.border,
//                   }
//                 ]}
//                 activeOpacity={0.7}
//               >
//                 <Text style={[
//                   styles.filterText,
//                   { color: activeStockFilter === f.value ? colors.primaryForeground : colors.mutedForeground }
//                 ]}>
//                   {f.label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       )}

//       {/* Mobile Table Headers - Hide on small screens */}
//       {screenWidth > 400 && (
//         <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
//           <View style={styles.headerPart}>{headerSort('name', 'Part')}</View>
//           <View style={styles.headerSupplier}>{headerSort('supplierName', 'Supplier')}</View>
//           <View style={styles.headerQty}>{headerSort('quantity', 'Qty')}</View>
//           <View style={styles.headerPrice}>{headerSort('sellingPrice', 'Price')}</View>
//         </View>
//       )}

//       {/* List Content */}
//       <View style={styles.listContainer}>
//         {isLoading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={colors.primary} />
//             <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading inventory...</Text>
//           </View>
//         ) : paginatedParts.length === 0 ? (
//           <View style={styles.emptyListRoot}>
//             <Inbox size={48} color={colors.mutedForeground} />
//             <Text style={[styles.emptyListTitle, { color: colors.foreground }]}>No Parts Found</Text>
//             <Text style={[styles.emptyListSub, { color: colors.mutedForeground }]}>
//               There are no parts that match your current search and filter criteria.
//             </Text>
//           </View>
//         ) : (
//           <FlatList
//             data={paginatedParts}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <PartRow
//                 part={item}
//                 onActions={() => setRowActionModal({ part: item, visible: true })}
//                 colors={colors}
//               />
//             )}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.listContent}
//           />
//         )}
//       </View>

//       {/* Pagination */}
//       {totalPages > 1 && !isLoading && (
//         <View style={styles.pagingRow}>
//           <TouchableOpacity
//             onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             style={[styles.pagingBtn, {
//               backgroundColor: colors.card,
//               borderColor: colors.border,
//               opacity: currentPage === 1 ? 0.5 : 1
//             }]}
//             activeOpacity={0.7}
//           >
//             <Text style={[styles.pagingBtnText, { color: colors.foreground }]}>Previous</Text>
//           </TouchableOpacity>
//           <Text style={[styles.pagingStat, { color: colors.foreground }]}>
//             {currentPage} / {totalPages}
//           </Text>
//           <TouchableOpacity
//             onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages}
//             style={[styles.pagingBtn, {
//               backgroundColor: colors.card,
//               borderColor: colors.border,
//               opacity: currentPage === totalPages ? 0.5 : 1
//             }]}
//             activeOpacity={0.7}
//           >
//             <Text style={[styles.pagingBtnText, { color: colors.foreground }]}>Next</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Actions Modal */}
//       <Modal
//         visible={rowActionModal.visible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setRowActionModal({ part: null, visible: false })}
//       >
//         <ActionModal
//           part={rowActionModal.part}
//           colors={colors}
//           onView={() => {
//             if (rowActionModal.part) navigation.navigate('PartDetailScreenId', { id: rowActionModal.part.id })
//             setRowActionModal({ part: null, visible: false })
//           }}
//           onEdit={() => {
//             if (rowActionModal.part) navigation.navigate('EditPartScreen', { id: rowActionModal.part.id })
//             setRowActionModal({ part: null, visible: false })
//           }}
//           onDelete={() => {
//             setDeleteModal({ part: rowActionModal.part, visible: true })
//             setRowActionModal({ part: null, visible: false })
//           }}
//           onRestore={() => {
//             if (rowActionModal.part) handleRestorePart(rowActionModal.part.id)
//             setRowActionModal({ part: null, visible: false })
//           }}
//           onClose={() => setRowActionModal({ part: null, visible: false })}
//         />
//       </Modal>

//       {/* Delete Confirmation Modal */}
//       <Modal
//         visible={deleteModal.visible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setDeleteModal({ part: null, visible: false })}
//       >
//         <DeleteConfirmationDialog
//           colors={colors}
//           onConfirm={() => {
//             if (deleteModal.part) handleDeletePart(deleteModal.part.id)
//             setDeleteModal({ part: null, visible: false })
//           }}
//           onCancel={() => setDeleteModal({ part: null, visible: false })}
//           itemName={deleteModal.part?.name ?? ''}
//         />
//       </Modal>
//     </View>
//   )
// }

// function PartRow({ part, onActions, colors }: { part: Part; onActions: () => void; colors: any }) {
//   const getStockBadge = () => {
//     if (part.status === 'deleted') return <StockBadge color="gray" text="Deleted" colors={colors} />
//     if (part.quantity === 0) return <StockBadge color="red" text="Out of Stock" colors={colors} />
//     if (part.isLowStock) return <StockBadge color="amber" text="Low Stock" colors={colors} />
//     return <StockBadge color="green" text="In Stock" colors={colors} />
//   }

//   return (
//     <TouchableOpacity
//       style={[styles.partRow, { backgroundColor: colors.card }]}
//       onPress={onActions}
//       activeOpacity={0.8}
//     >
//       <View style={styles.partRowHeader}>
//         <View style={styles.partInfo}>
//           <Text style={[styles.partName, { color: colors.foreground }]} numberOfLines={1}>
//             {part.name}
//           </Text>
//           <Text style={[styles.partNumber, { color: colors.mutedForeground }]} numberOfLines={1}>
//             {part.partNumber}
//           </Text>
//           <Text style={[styles.partSupplier, { color: colors.mutedForeground }]} numberOfLines={1}>
//             {part.supplierName}
//           </Text>
//         </View>
//         <MoreHorizontal size={20} color={colors.mutedForeground} />
//       </View>
      
//       <View style={styles.partRowFooter}>
//         <View style={styles.priceSection}>
//           <Text style={[styles.partPrice, { color: colors.foreground }]}>
//             ₹{part.sellingPrice.toFixed(2)}
//           </Text>
//           {part.status === 'active' && (
//             <Text style={[styles.qtyBadge, {
//               color: colors.primary,
//               borderColor: colors.primary,
//               backgroundColor: colors.primaryBackground
//             }]}>
//               Qty: {part.quantity}
//             </Text>
//           )}
//         </View>
//         {getStockBadge()}
//       </View>
//     </TouchableOpacity>
//   )
// }

// function StockBadge({ color, text, colors }: { color: string; text: string; colors: any }) {
//   let bg, fg
//   if (color === 'gray') {
//     bg = { backgroundColor: colors.muted, borderColor: colors.muted }
//     fg = { color: colors.mutedForeground }
//   } else if (color === 'red') {
//     bg = { backgroundColor: colors.destructive + '20', borderColor: colors.destructive }
//     fg = { color: colors.destructive }
//   } else if (color === 'amber') {
//     bg = { backgroundColor: colors.accent + '20', borderColor: colors.accent }
//     fg = { color: colors.accent }
//   } else {
//     bg = { backgroundColor: colors.primary + '20', borderColor: colors.primary }
//     fg = { color: colors.primary }
//   }
//   return (
//     <View style={[styles.stockBadge, bg]}>
//       <Text style={[styles.stockBadgeText, fg]}>{text}</Text>
//     </View>
//   )
// }

// function ActionModal({
//   part, colors, onView, onEdit, onDelete, onRestore, onClose,
// }: {
//   part: Part | null,
//   colors: any,
//   onView: () => void,
//   onEdit: () => void,
//   onDelete: () => void,
//   onRestore: () => void,
//   onClose: () => void,
// }) {
//   if (!part) return null
//   return (
//     <View style={styles.modalOverlay}>
//       <View style={[styles.actionModalCard, { backgroundColor: colors.card }]}>
//         <Text style={[styles.modalTitle, { color: colors.primary }]}>{part.name}</Text>
//         <Text style={[styles.modalSubTitle, { color: colors.mutedForeground }]}>
//           {part.partNumber} • {part.supplierName}
//         </Text>
//         <TouchableOpacity 
//           onPress={onView} 
//           style={[styles.actionModalBtn, { borderBottomColor: colors.border }]}
//           activeOpacity={0.7}
//         >
//           <Eye size={16} color={colors.primary} style={{ marginRight: 12 }} />
//           <Text style={[styles.actionBtnText, { color: colors.foreground }]}>View Details</Text>
//         </TouchableOpacity>
//         {part.status === 'active'
//           ? (<>
//               <TouchableOpacity 
//                 onPress={onEdit} 
//                 style={[styles.actionModalBtn, { borderBottomColor: colors.border }]}
//                 activeOpacity={0.7}
//               >
//                 <Edit size={16} color={colors.primary} style={{ marginRight: 12 }} />
//                 <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Edit Part</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 onPress={onDelete} 
//                 style={[styles.actionModalBtn, { borderBottomColor: colors.border }]}
//                 activeOpacity={0.7}
//               >
//                 <Trash2 size={16} color={colors.destructive} style={{ marginRight: 12 }} />
//                 <Text style={[styles.actionBtnText, { color: colors.destructive, fontWeight: "600" }]}>Delete Part</Text>
//               </TouchableOpacity>
//             </>)
//           : (
//             <TouchableOpacity 
//               onPress={onRestore} 
//               style={[styles.actionModalBtn, { borderBottomColor: colors.border }]}
//               activeOpacity={0.7}
//             >
//               <ArchiveRestore size={16} color={colors.primary} style={{ marginRight: 12 }} />
//               <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Restore Part</Text>
//             </TouchableOpacity>
//           )}
//         <TouchableOpacity onPress={onClose} style={styles.cancelActionBtn} activeOpacity={0.7}>
//           <Text style={[styles.cancelActionBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   )
// }

// function DeleteConfirmationDialog({ 
//   colors, onConfirm, onCancel, itemName 
// }: { 
//   colors: any; onConfirm: () => void; onCancel: () => void; itemName: string 
// }) {
//   return (
//     <View style={styles.modalOverlay}>
//       <View style={[styles.deleteModalCard, { backgroundColor: colors.card }]}>
//         <Text style={[styles.deleteModalTitle, { color: colors.foreground }]}>Are you absolutely sure?</Text>
//         <Text style={[styles.deleteModalSubTitle, { color: colors.mutedForeground }]}>
//           This will delete the part "{itemName}" and remove it from active inventory.
//           You can restore it later from the Deleted Items list.
//         </Text>
//         <View style={styles.deleteModalActions}>
//           <TouchableOpacity 
//             onPress={onCancel} 
//             style={[styles.cancelDeleteBtn, { backgroundColor: colors.muted }]}
//             activeOpacity={0.7}
//           >
//             <Text style={[styles.cancelDeleteBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             onPress={onConfirm} 
//             style={[styles.deleteSureBtn, { backgroundColor: colors.destructive }]}
//             activeOpacity={0.7}
//           >
//             <Text style={[styles.deleteSureBtnText, { color: colors.destructiveForeground }]}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     paddingRight: 4,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: '700',
//   },
//   addStockBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   addStockText: {
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   tabRow: {
//     flexDirection: 'row',
//     marginBottom: 20,
//     gap: 8,
//   },
//   tabBtn: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//   },
//   tabText: {
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   searchContainer: {
//     marginBottom: 16,
//   },
//   searchRow: {
//     position: 'relative',
//   },
//   searchIcon: {
//     position: 'absolute',
//     left: 12,
//     top: 13,
//     zIndex: 1,
//   },
//   searchInput: {
//     height: 44,
//     borderRadius: 10,
//     borderWidth: 1,
//     paddingLeft: 40,
//     paddingRight: 16,
//     fontSize: 16,
//     width: '100%',
//   },
//   filtersContainer: {
//     marginBottom: 20,
//   },
//   stockFilterWrap: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     flexWrap: 'wrap',
//   },
//   filterBadge: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     borderWidth: 1,
//   },
//   filterText: {
//     fontWeight: '600',
//     fontSize: 12,
//   },
//   tableHeaderRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     paddingBottom: 8,
//     marginBottom: 8,
//     paddingHorizontal: 4,
//   },
//   headerPart: { flex: 2 },
//   headerSupplier: { flex: 1.5 },
//   headerQty: { width: 60, alignItems: 'center' },
//   headerPrice: { width: 80, alignItems: 'flex-end' },
//   sortHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontWeight: '600',
//     fontSize: 13,
//   },
//   headerArrow: {
//     marginLeft: 4,
//     fontSize: 12,
//     fontWeight: "700",
//   },
//   listContainer: {
//     flex: 1,
//   },
//   listContent: {
//     paddingBottom: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   emptyListRoot: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//     paddingHorizontal: 20,
//   },
//   emptyListTitle: {
//     fontSize: 18,
//     marginTop: 16,
//     fontWeight: '600',
//   },
//   emptyListSub: {
//     marginTop: 8,
//     textAlign: 'center',
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   pagingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 16,
//     paddingHorizontal: 8,
//   },
//   pagingBtn: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     minWidth: 80,
//     alignItems: 'center',
//   },
//   pagingBtnText: {
//     fontWeight: '500',
//     fontSize: 14,
//   },
//   pagingStat: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   // Part Row Styles
//   partRow: {
//     borderRadius: 12,
//     marginBottom: 12,
//     padding: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   partRowHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   partInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   partName: {
//     fontWeight: '600',
//     fontSize: 16,
//     marginBottom: 4,
//   },
//   partNumber: {
//     fontSize: 13,
//     marginBottom: 2,
//   },
//   partSupplier: {
//     fontSize: 13,
//   },
//   partRowFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   priceSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   partPrice: {
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   qtyBadge: {
//     fontSize: 11,
//     fontWeight: '600',
//     borderWidth: 1,
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   stockBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     borderWidth: 1,
//   },
//   stockBadgeText: {
//     fontWeight: "600",
//     fontSize: 10,
//     textAlign: 'center',
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   actionModalCard: {
//     borderRadius: 16,
//     width: '100%',
//     maxWidth: 400,
//     padding: 20,
//   },
//   modalTitle: {
//     fontWeight: '600',
//     fontSize: 18,
//     marginBottom: 4,
//   },
//   modalSubTitle: {
//     marginBottom: 20,
//     fontSize: 14,
//     lineHeight: 18,
//   },
//   actionModalBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 14,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   actionBtnText: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   cancelActionBtn: {
//     alignSelf: 'stretch',
//     paddingVertical: 16,
//     marginTop: 8,
//   },
//   cancelActionBtnText: {
//     fontWeight: "600",
//     textAlign: "center",
//     fontSize: 16,
//   },
//   deleteModalCard: {
//     borderRadius: 16,
//     width: '100%',
//     maxWidth: 400,
//     padding: 24,
//   },
//   deleteModalTitle: {
//     fontWeight: '600',
//     fontSize: 18,
//     marginBottom: 8,
//   },
//   deleteModalSubTitle: {
//     fontSize: 14,
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   deleteModalActions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     gap: 12,
//   },
//   cancelDeleteBtn: {
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   cancelDeleteBtnText: {
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   deleteSureBtn: {
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   deleteSureBtnText: {
//     fontWeight: '600',
//     fontSize: 14,
//   },
// })
