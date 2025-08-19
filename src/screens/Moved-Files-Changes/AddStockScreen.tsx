// import React, { useEffect, useMemo, useState } from 'react'
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   Modal,
//   FlatList,
//   Alert,
//   StyleSheet,
//   ActivityIndicator,
//   StatusBar,
// } from 'react-native'
// import DocumentScanner from 'react-native-document-scanner-plugin'
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { format } from 'date-fns'
// import {
//   ArrowLeft,
//   Plus,
//   Save,
//   Trash2,
//   X,
//   Loader2,
//   Calendar as CalendarIcon,
//   ChevronDown,
//   Camera,
//   CheckCircle,
// } from 'lucide-react-native'

// import { useToast } from '../hooks/use-toast'
// import { useAppSelector } from '../lib/redux/hooks'
// import { selectAuth } from '../lib/redux/slices/auth-slice'
// import { useColors, useTheme } from '../context/ThemeContext'
// import type { StockPurchase, StockPurchaseItem, Part, Supplier } from '../types'
// import { getSuppliers } from '../services/supplier-service'
// import { getParts, addPart } from '../services/part-service'
// import { addStockPurchase, uploadReceipt } from '../services/stock-service'

// const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer'] as const
// type PaymentMethod = typeof PAYMENT_METHODS[number]
// const STATUS_OPTIONS = ['Pending', 'Paid'] as const
// type StatusOption = typeof STATUS_OPTIONS[number]

// export default function AddStockScreen({ navigation }: any) {
//   const { user } = useAppSelector(selectAuth)
//   const { toast } = useToast()
  
//   // Theme hooks
//   const colors = useColors()
//   const { isDark } = useTheme()

//   const [availableParts, setAvailableParts] = useState<Part[]>([])
//   const [availableSuppliers, setAvailableSuppliers] = useState<Supplier[]>([])
//   const [filteredParts, setFilteredParts] = useState<Part[]>([])
//   const [supplier, setSupplier] = useState<Supplier | null>(null)
//   const [items, setItems] = useState<StockPurchaseItem[]>([
//     { id: `item-${Date.now()}`, name: '', quantity: 1, purchasePrice: 0, mrp: 0 },
//   ])
//   const [date, setDate] = useState<Date>(new Date())
//   const [status, setStatus] = useState<StatusOption>('Pending')
//   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash')
//   const [notes, setNotes] = useState('')
//   const [receiptFile, setReceiptFile] = useState<any>(null)
//   const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
//   const [isSaving, setIsSaving] = useState(false)
//   const [isScanning, setIsScanning] = useState(false)
//   const [partModalItemId, setPartModalItemId] = useState<string | null>(null)
//   const [addNewPartModal, setAddNewPartModal] = useState(false)
//   const [supplierModalOpen, setSupplierModalOpen] = useState(false)
//   const [newPartValues, setNewPartValues] = useState<Omit<Part, 'id' | 'status' | 'isLowStock'>>({
//     name: '',
//     partNumber: '',
//     purchasePrice: 0,
//     sellingPrice: 0,
//     mrp: 0,
//     quantity: 1,
//     supplierId: '',
//   })
  
//   useEffect(() => {
//     const loadInitialData = async () => {
//       try {
//         const [parts, suppliers] = await Promise.all([getParts(), getSuppliers()])
//         setAvailableParts(parts)
//         setAvailableSuppliers(suppliers)
//       } catch {
//         toast({ title: 'Error', description: 'Failed to load initial data.', variant: 'destructive' })
//       }
//     }
//     loadInitialData()
//   }, [toast])

//   useEffect(() => {
//     if (supplier) {
//       setFilteredParts(availableParts.filter((p) => p.supplierId === supplier.id))
//     } else {
//       setFilteredParts([])
//     }
//   }, [supplier, availableParts])

//   // ---- Item management ----
//   const handleSupplierSelection = (selectedSupplier: Supplier) => {
//     setSupplier(selectedSupplier)
//     setItems([{ id: `item-${Date.now()}`, name: '', quantity: 1, purchasePrice: 0, mrp: 0 }])
//     setSupplierModalOpen(false)
//   }

//   const updateItem = (id: string, newValues: Partial<StockPurchaseItem>) => {
//     setItems((prevItems) =>
//       prevItems.map((item) => (item.id === id ? { ...item, ...newValues } : item))
//     )
//   }

//   const handlePartSelection = (itemId: string, part: Part) => {
//     updateItem(itemId, {
//       partId: part.id,
//       name: part.name,
//       partNumber: part.partNumber,
//       purchasePrice: part.purchasePrice,
//       mrp: part.mrp,
//       quantity: 1,
//     })
//   }

//   const addItem = () => {
//     setItems((prev) => [
//       ...prev,
//       { id: `item-${Date.now()}`, name: '', quantity: 1, purchasePrice: 0, mrp: 0 },
//     ])
//   }

//   const removeItem = (id: string) => {
//     if (items.length > 1) {
//       setItems((prev) => prev.filter((item) => item.id !== id))
//     }
//   }

//   // ---- Add new part dialog ----
//   const handleAddNewPart = async () => {
//     if (!supplier || !newPartValues.name || newPartValues.purchasePrice <= 0) {
//       toast({
//         title: 'Missing Information',
//         description: 'Fill all required fields for new part.',
//         variant: 'destructive',
//       })
//       return false
//     }
//     try {
//       const newPart = await addPart({
//         ...newPartValues,
//         supplierId: supplier.id,
//         supplierName: supplier.name,
//         status: 'active',
//         isLowStock: (newPartValues.quantity ?? 0) < 10,
//       })
//       setAvailableParts((prev) => [...prev, newPart])
//       toast({
//         title: 'Part Added',
//         description: `${newPart.name} added successfully.`,
//       })
//       if (partModalItemId) {
//         handlePartSelection(partModalItemId, newPart)
//       }
//       setAddNewPartModal(false)
//       setNewPartValues({
//         name: '',
//         partNumber: '',
//         purchasePrice: 0,
//         sellingPrice: 0,
//         mrp: 0,
//         quantity: 1,
//         supplierId: '',
//       })
//       return true
//     } catch {
//       toast({ title: 'Error', description: 'Could not add new part.', variant: 'destructive' })
//       return false
//     }
//   }

//   // ---- Document Scanner Integration ----
//   const handleReceiptScan = async () => {
//     setIsScanning(true)
//     try {
//       const { scannedImages } = await DocumentScanner.scanDocument({
//         maxNumDocuments: 1,
//         croppedImageQuality: 100,
//       })

//       if (scannedImages && scannedImages.length > 0) {
//         const scannedImage = scannedImages[0]
//         setReceiptFile({
//           uri: scannedImage,
//           name: `receipt_${Date.now()}.jpg`,
//           type: 'image/jpeg',
//         })
//         setReceiptPreview(scannedImage)
//         toast({
//           title: 'Receipt Scanned',
//           description: 'Receipt has been successfully scanned and attached.',
//         })
//       }
//     } catch (error: any) {
//       if (error.message === 'User cancelled document scan') {
//         return
//       }
//       toast({
//         title: 'Scan Error',
//         description: 'Failed to scan receipt. Please try again.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsScanning(false)
//     }
//   }

//   const showReceiptOptions = () => {
//     Alert.alert(
//       'Add Receipt',
//       'Choose how you want to add the receipt',
//       [
//         {
//           text: 'Scan Document',
//           onPress: handleReceiptScan,
//           style: 'default',
//         },
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//       ],
//       { cancelable: true }
//     )
//   }

//   const total = useMemo(
//     () => items.reduce((acc, item) => acc + (item.purchasePrice || 0) * item.quantity, 0),
//     [items]
//   )

//   // --- Form submit ---
//   const handleSubmit = async () => {
//     if (!supplier) {
//       toast({
//         title: 'Supplier Required',
//         description: 'Please select a supplier.',
//         variant: 'destructive',
//       })
//       return
//     }

//     if (items.some((i) => !i.name || i.quantity <= 0 || i.purchasePrice <= 0)) {
//       toast({
//         title: 'Invalid Items',
//         description: 'Please fill all item details correctly.',
//         variant: 'destructive',
//       })
//       return
//     }

//     setIsSaving(true)

//     let receiptUrl
//     if (receiptFile && receiptFile.uri) {
//       try {
//         receiptUrl = await uploadReceipt(receiptFile, `receipts/${Date.now()}-receipt`)
//       } catch {
//         toast({
//           title: 'Receipt Upload Failed',
//           description: 'Could not upload receipt image.',
//           variant: 'destructive',
//         })
//         setIsSaving(false)
//         return
//       }
//     }

//     const currentUser = user?.name ?? 'System'
//     const newPurchaseData: Omit<StockPurchase, 'id'> = {
//       supplier,
//       supplierId: supplier.id,
//       items,
//       total,
//       date: format(date, 'yyyy-MM-dd'),
//       status,
//       paymentMethod,
//       notes,
//       createdBy: currentUser,
//       ...(status === 'Paid' && {
//         paidBy: currentUser,
//         paymentDate: format(new Date(), 'yyyy-MM-dd'),
//       }),
//       ...(receiptUrl ? { receiptUrl } : {}),
//     }

//     try {
//       const savedPurchase = await addStockPurchase(newPurchaseData, items)
//       if (savedPurchase) {
//         toast({
//           title: 'Stock Purchase Recorded',
//           description: `Purchase ${savedPurchase.id} has been created successfully.`,
//         })
//         navigation.navigate('Inventory')
//       }
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to save the stock purchase. Please try again.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
//       <View style={[styles.container, { backgroundColor: colors.background }]}>
//         <StatusBar 
//           barStyle={isDark ? 'light-content' : 'dark-content'}
//           backgroundColor={colors.background}
//         />
        
//         {/* Header */}
//         <View style={[styles.header, { 
//           backgroundColor: colors.background,
//           borderBottomColor: colors.border 
//         }]}>
//           <TouchableOpacity
//             style={[styles.backButton, { backgroundColor: colors.primaryBackground }]}
//             onPress={() => navigation.goBack()}
//             activeOpacity={0.7}
//           >
//             <ArrowLeft size={20} color={colors.primary} />
//           </TouchableOpacity>
          
//           <View style={styles.headerTitleContainer}>
//             <Text style={[styles.headerTitle, { color: colors.foreground }]}>Add Stock Purchase</Text>
//             <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
//               Record new inventory purchase
//             </Text>
//           </View>
          
//           <TouchableOpacity
//             style={[styles.saveButton, { 
//               backgroundColor: colors.primary,
//               opacity: isSaving ? 0.7 : 1 
//             }]}
//             onPress={handleSubmit}
//             disabled={isSaving}
//             activeOpacity={0.8}
//           >
//             {isSaving ? (
//               <ActivityIndicator size={18} color={colors.primaryForeground} />
//             ) : (
//               <Save size={18} color={colors.primaryForeground} />
//             )}
//             <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>
//               {isSaving ? 'Saving...' : 'Save'}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <ScrollView 
//           style={styles.scrollView}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.scrollContent}
//         >
//           {/* Supplier Selection */}
//           <View style={styles.section}>
//             <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Supplier</Text>
//             <TouchableOpacity
//               style={[styles.selector, {
//                 backgroundColor: colors.card,
//                 borderColor: supplier ? colors.primary : colors.border,
//               }]}
//               onPress={() => setSupplierModalOpen(true)}
//               activeOpacity={0.7}
//             >
//               <View style={styles.selectorContent}>
//                 {supplier ? (
//                   <>
//                     <Text style={[styles.selectorTitle, { color: colors.foreground }]}>
//                       {supplier.name}
//                     </Text>
//                     <Text style={[styles.selectorSubtitle, { color: colors.mutedForeground }]}>
//                       {supplier.contactPerson} • {supplier.phone}
//                     </Text>
//                   </>
//                 ) : (
//                   <Text style={[styles.selectorPlaceholder, { color: colors.mutedForeground }]}>
//                     Select a supplier
//                   </Text>
//                 )}
//               </View>
//               <ChevronDown size={20} color={colors.mutedForeground} />
//             </TouchableOpacity>
//           </View>

//           {/* Purchase Details */}
//           <View style={styles.section}>
//             <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Purchase Details</Text>
            
//             <View style={styles.formGroup}>
//               <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Purchase Date</Text>
//               <TouchableOpacity
//                 style={[styles.dateSelector, {
//                   backgroundColor: colors.card,
//                   borderColor: colors.border,
//                 }]}
//                 onPress={() => setDate(new Date())}
//                 activeOpacity={0.7}
//               >
//                 <CalendarIcon size={16} color={colors.primary} />
//                 <Text style={[styles.dateText, { color: colors.foreground }]}>
//                   {format(date, 'dd MMM yyyy')}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Payment Status</Text>
//               <View style={styles.statusButtons}>
//                 {STATUS_OPTIONS.map((opt) => (
//                   <TouchableOpacity
//                     key={opt}
//                     style={[
//                       styles.statusButton,
//                       {
//                         backgroundColor: status === opt ? colors.primary : colors.card,
//                         borderColor: status === opt ? colors.primary : colors.border,
//                       }
//                     ]}
//                     onPress={() => setStatus(opt)}
//                     activeOpacity={0.7}
//                   >
//                     <Text style={[
//                       styles.statusButtonText,
//                       { color: status === opt ? colors.primaryForeground : colors.foreground }
//                     ]}>
//                       {opt}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {status === 'Paid' && (
//               <View style={styles.formGroup}>
//                 <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Payment Method</Text>
//                 <View style={styles.paymentButtons}>
//                   {PAYMENT_METHODS.map((method) => (
//                     <TouchableOpacity
//                       key={method}
//                       style={[
//                         styles.paymentButton,
//                         {
//                           backgroundColor: paymentMethod === method ? colors.accent + '20' : colors.card,
//                           borderColor: paymentMethod === method ? colors.accent : colors.border,
//                         }
//                       ]}
//                       onPress={() => setPaymentMethod(method)}
//                       activeOpacity={0.7}
//                     >
//                       <Text style={[
//                         styles.paymentButtonText,
//                         { color: paymentMethod === method ? colors.accent : colors.foreground }
//                       ]}>
//                         {method}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>
//             )}
//           </View>

//           {/* Items */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Items</Text>
//               <TouchableOpacity
//                 onPress={addItem}
//                 disabled={!supplier}
//                 style={[styles.addButton, {
//                   backgroundColor: supplier ? colors.primaryBackground : colors.muted,
//                   opacity: supplier ? 1 : 0.5,
//                 }]}
//                 activeOpacity={0.7}
//               >
//                 <Plus size={16} color={supplier ? colors.primary : colors.mutedForeground} />
//                 <Text style={[styles.addButtonText, {
//                   color: supplier ? colors.primary : colors.mutedForeground
//                 }]}>
//                   Add Item
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.itemsList}>
//               {items.map((item, index) => (
//                 <ItemCard
//                   key={item.id}
//                   item={item}
//                   index={index}
//                   colors={colors}
//                   supplier={supplier}
//                   filteredParts={filteredParts}
//                   canRemove={items.length > 1}
//                   onUpdate={(newValues) => updateItem(item.id, newValues)}
//                   onRemove={() => removeItem(item.id)}
//                   onPartSelect={(part) => handlePartSelection(item.id, part)}
//                   onAddNewPart={() => {
//                     setPartModalItemId(item.id)
//                     setAddNewPartModal(true)
//                   }}
//                 />
//               ))}
//             </View>

//             {/* Total */}
//             <View style={[styles.totalContainer, { borderTopColor: colors.border }]}>
//               <View style={styles.totalRow}>
//                 <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Amount</Text>
//                 <Text style={[styles.totalValue, { color: colors.primary }]}>
//                   ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Notes */}
//           <View style={styles.section}>
//             <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Notes (Optional)</Text>
//             <TextInput
//               value={notes}
//               onChangeText={setNotes}
//               placeholder="Add any additional notes about this purchase..."
//               placeholderTextColor={colors.mutedForeground}
//               style={[styles.notesInput, {
//                 backgroundColor: colors.card,
//                 borderColor: colors.border,
//                 color: colors.foreground,
//               }]}
//               multiline
//               numberOfLines={3}
//               textAlignVertical="top"
//             />
//           </View>

//           {/* Receipt */}
//           <View style={styles.section}>
//             <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Receipt</Text>
//             {receiptPreview && receiptFile ? (
//               <View style={[styles.receiptPreview, {
//                 backgroundColor: colors.primaryBackground,
//                 borderColor: colors.primary,
//               }]}>
//                 <CheckCircle size={24} color={colors.primary} />
//                 <View style={styles.receiptInfo}>
//                   <Text style={[styles.receiptFileName, { color: colors.foreground }]}>
//                     {receiptFile.name || 'Scanned Receipt'}
//                   </Text>
//                   <Text style={[styles.receiptStatus, { color: colors.mutedForeground }]}>
//                     Receipt attached successfully
//                   </Text>
//                 </View>
//                 <TouchableOpacity
//                   onPress={() => {
//                     setReceiptFile(null)
//                     setReceiptPreview(null)
//                   }}
//                   style={styles.removeReceiptButton}
//                   activeOpacity={0.7}
//                 >
//                   <X size={20} color={colors.mutedForeground} />
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <TouchableOpacity
//                 style={[styles.receiptScanButton, {
//                   backgroundColor: colors.card,
//                   borderColor: colors.border,
//                 }]}
//                 onPress={showReceiptOptions}
//                 disabled={isScanning}
//                 activeOpacity={0.7}
//               >
//                 {isScanning ? (
//                   <View style={styles.scanningState}>
//                     <Loader2 size={32} color={colors.primary} />
//                     <Text style={[styles.scanningText, { color: colors.primary }]}>Scanning...</Text>
//                   </View>
//                 ) : (
//                   <View style={styles.scanPrompt}>
//                     <Camera size={32} color={colors.mutedForeground} />
//                     <Text style={[styles.scanPromptTitle, { color: colors.foreground }]}>
//                       Scan Receipt
//                     </Text>
//                     <Text style={[styles.scanPromptSubtitle, { color: colors.mutedForeground }]}>
//                       Tap to scan receipt using camera
//                     </Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             )}
//           </View>
//         </ScrollView>

//         {/* Modals */}
//         <Modal
//           visible={supplierModalOpen}
//           transparent
//           animationType="slide"
//           onRequestClose={() => setSupplierModalOpen(false)}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={[styles.modal, { backgroundColor: colors.card }]}>
//               <View style={styles.modalHeader}>
//                 <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Supplier</Text>
//                 <TouchableOpacity
//                   onPress={() => setSupplierModalOpen(false)}
//                   style={styles.modalCloseButton}
//                   activeOpacity={0.7}
//                 >
//                   <X size={24} color={colors.mutedForeground} />
//                 </TouchableOpacity>
//               </View>
              
//               <FlatList
//                 data={availableSuppliers}
//                 keyExtractor={(item) => item.id}
//                 style={styles.modalList}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={[styles.modalListItem, { borderBottomColor: colors.border }]}
//                     onPress={() => handleSupplierSelection(item)}
//                     activeOpacity={0.7}
//                   >
//                     <View>
//                       <Text style={[styles.modalItemName, { color: colors.foreground }]}>
//                         {item.name}
//                       </Text>
//                       <Text style={[styles.modalItemDetails, { color: colors.mutedForeground }]}>
//                         {item.contactPerson}
//                       </Text>
//                       <Text style={[styles.modalItemAddress, { color: colors.mutedForeground }]}>
//                         {item.address}
//                       </Text>
//                     </View>
//                   </TouchableOpacity>
//                 )}
//               />
//             </View>
//           </View>
//         </Modal>

//         <Modal
//           visible={addNewPartModal}
//           transparent
//           animationType="slide"
//           onRequestClose={() => setAddNewPartModal(false)}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={[styles.modal, { backgroundColor: colors.card }]}>
//               <View style={styles.modalHeader}>
//                 <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add New Part</Text>
//                 <TouchableOpacity
//                   onPress={() => setAddNewPartModal(false)}
//                   style={styles.modalCloseButton}
//                   activeOpacity={0.7}
//                 >
//                   <X size={24} color={colors.mutedForeground} />
//                 </TouchableOpacity>
//               </View>
              
//               <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
//                 <View style={styles.formGroup}>
//                   <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Part Name *</Text>
//                   <TextInput
//                     placeholder="Enter part name"
//                     placeholderTextColor={colors.mutedForeground}
//                     value={newPartValues.name}
//                     onChangeText={(v) => setNewPartValues((np) => ({ ...np, name: v }))}
//                     style={[styles.input, {
//                       backgroundColor: colors.background,
//                       borderColor: colors.border,
//                       color: colors.foreground,
//                     }]}
//                   />
//                 </View>
                
//                 <View style={styles.formGroup}>
//                   <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Part Number</Text>
//                   <TextInput
//                     placeholder="Enter part number"
//                     placeholderTextColor={colors.mutedForeground}
//                     value={newPartValues.partNumber}
//                     onChangeText={(v) => setNewPartValues((np) => ({ ...np, partNumber: v }))}
//                     style={[styles.input, {
//                       backgroundColor: colors.background,
//                       borderColor: colors.border,
//                       color: colors.foreground,
//                     }]}
//                   />
//                 </View>
                
//                 <View style={styles.formRow}>
//                   <View style={styles.formHalf}>
//                     <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Purchase Price *</Text>
//                     <TextInput
//                       placeholder="0.00"
//                       placeholderTextColor={colors.mutedForeground}
//                       keyboardType="decimal-pad"
//                       value={newPartValues.purchasePrice?.toString()}
//                       onChangeText={(v) =>
//                         setNewPartValues((np) => ({ ...np, purchasePrice: Number(v) || 0 }))
//                       }
//                       style={[styles.input, {
//                         backgroundColor: colors.background,
//                         borderColor: colors.border,
//                         color: colors.foreground,
//                       }]}
//                     />
//                   </View>
                  
//                   <View style={styles.formHalf}>
//                     <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Selling Price</Text>
//                     <TextInput
//                       placeholder="0.00"
//                       placeholderTextColor={colors.mutedForeground}
//                       keyboardType="decimal-pad"
//                       value={newPartValues.sellingPrice?.toString()}
//                       onChangeText={(v) =>
//                         setNewPartValues((np) => ({ ...np, sellingPrice: Number(v) || 0 }))
//                       }
//                       style={[styles.input, {
//                         backgroundColor: colors.background,
//                         borderColor: colors.border,
//                         color: colors.foreground,
//                       }]}
//                     />
//                   </View>
//                 </View>
                
//                 <View style={styles.formRow}>
//                   <View style={styles.formHalf}>
//                     <Text style={[styles.fieldLabel, { color: colors.foreground }]}>MRP</Text>
//                     <TextInput
//                       placeholder="0.00"
//                       placeholderTextColor={colors.mutedForeground}
//                       keyboardType="decimal-pad"
//                       value={newPartValues.mrp?.toString()}
//                       onChangeText={(v) => setNewPartValues((np) => ({ ...np, mrp: Number(v) || 0 }))}
//                       style={[styles.input, {
//                         backgroundColor: colors.background,
//                         borderColor: colors.border,
//                         color: colors.foreground,
//                       }]}
//                     />
//                   </View>
                  
//                   <View style={styles.formHalf}>
//                     <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Initial Quantity</Text>
//                     <TextInput
//                       placeholder="1"
//                       placeholderTextColor={colors.mutedForeground}
//                       keyboardType="number-pad"
//                       value={newPartValues.quantity?.toString()}
//                       onChangeText={(v) =>
//                         setNewPartValues((np) => ({ ...np, quantity: Number(v) || 1 }))
//                       }
//                       style={[styles.input, {
//                         backgroundColor: colors.background,
//                         borderColor: colors.border,
//                         color: colors.foreground,
//                       }]}
//                     />
//                   </View>
//                 </View>
//               </ScrollView>
              
//               <View style={styles.modalActions}>
//                 <TouchableOpacity
//                   onPress={() => setAddNewPartModal(false)}
//                   style={[styles.modalCancelButton, { backgroundColor: colors.muted }]}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={handleAddNewPart}
//                   style={[styles.modalConfirmButton, { backgroundColor: colors.primary }]}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={[styles.modalConfirmText, { color: colors.primaryForeground }]}>Add Part</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </SafeAreaView>
//   )
// }

// // Simple Item Card Component
// function ItemCard({
//   item,
//   index,
//   colors,
//   supplier,
//   filteredParts,
//   canRemove,
//   onUpdate,
//   onRemove,
//   onPartSelect,
//   onAddNewPart,
// }: {
//   item: StockPurchaseItem
//   index: number
//   colors: any
//   supplier: Supplier | null
//   filteredParts: Part[]
//   canRemove: boolean
//   onUpdate: (values: Partial<StockPurchaseItem>) => void
//   onRemove: () => void
//   onPartSelect: (part: Part) => void
//   onAddNewPart: () => void
// }) {
//   const [partModalOpen, setPartModalOpen] = useState(false)
//   const selectedPart = filteredParts.find(p => p.id === item.partId)

//   return (
//     <View style={[styles.itemContainer, { 
//       backgroundColor: colors.card,
//       borderColor: colors.border 
//     }]}>
//       <View style={styles.itemHeader}>
//         <Text style={[styles.itemTitle, { color: colors.foreground }]}>
//           Item #{index + 1}
//         </Text>
//         {canRemove && (
//           <TouchableOpacity
//             onPress={onRemove}
//             style={styles.removeButton}
//             activeOpacity={0.7}
//           >
//             <Trash2 size={16} color={colors.destructive} />
//           </TouchableOpacity>
//         )}
//       </View>

//       <View style={styles.formGroup}>
//         <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Select Part</Text>
//         <TouchableOpacity
//           style={[styles.selector, {
//             backgroundColor: colors.background,
//             borderColor: selectedPart ? colors.primary : colors.border,
//           }]}
//           onPress={() => supplier && setPartModalOpen(true)}
//           disabled={!supplier}
//           activeOpacity={0.7}
//         >
//           <View style={styles.selectorContent}>
//             {selectedPart ? (
//               <>
//                 <Text style={[styles.selectorTitle, { color: colors.foreground }]}>
//                   {selectedPart.name}
//                 </Text>
//                 <Text style={[styles.selectorSubtitle, { color: colors.mutedForeground }]}>
//                   {selectedPart.partNumber}
//                 </Text>
//               </>
//             ) : (
//               <Text style={[styles.selectorPlaceholder, { color: colors.mutedForeground }]}>
//                 {supplier ? 'Select a part' : 'Select supplier first'}
//               </Text>
//             )}
//           </View>
//           <ChevronDown size={16} color={colors.mutedForeground} />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.formRow}>
//         <View style={styles.formHalf}>
//           <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Part Number</Text>
//           <TextInput
//             value={item.partNumber || ''}
//             onChangeText={(txt) => onUpdate({ partNumber: txt })}
//             placeholder="Enter part number"
//             placeholderTextColor={colors.mutedForeground}
//             style={[styles.input, {
//               backgroundColor: colors.background,
//               borderColor: colors.border,
//               color: colors.foreground,
//             }]}
//           />
//         </View>
//         <View style={styles.formHalf}>
//           <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Quantity</Text>
//           <TextInput
//             keyboardType="numeric"
//             value={item.quantity.toString()}
//             onChangeText={(value) => onUpdate({ quantity: Number(value) || 1 })}
//             style={[styles.input, {
//               backgroundColor: colors.background,
//               borderColor: colors.border,
//               color: colors.foreground,
//             }]}
//           />
//         </View>
//       </View>

//       <View style={styles.formRow}>
//         <View style={styles.formHalf}>
//           <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Purchase Price</Text>
//           <TextInput
//             keyboardType="numeric"
//             value={item.purchasePrice.toString()}
//             onChangeText={(value) => onUpdate({ purchasePrice: Number(value) || 0 })}
//             style={[styles.input, {
//               backgroundColor: colors.background,
//               borderColor: colors.border,
//               color: colors.foreground,
//             }]}
//           />
//         </View>
//         <View style={styles.formHalf}>
//           <Text style={[styles.fieldLabel, { color: colors.foreground }]}>MRP</Text>
//           <TextInput
//             keyboardType="numeric"
//             value={item.mrp.toString()}
//             onChangeText={(value) => onUpdate({ mrp: Number(value) || 0 })}
//             style={[styles.input, {
//               backgroundColor: colors.background,
//               borderColor: colors.border,
//               color: colors.foreground,
//             }]}
//           />
//         </View>
//       </View>

//       <View style={[styles.itemTotal, { borderTopColor: colors.border }]}>
//         <Text style={[styles.itemTotalLabel, { color: colors.foreground }]}>Item Total</Text>
//         <Text style={[styles.itemTotalValue, { color: colors.primary }]}>
//           ₹{(item.quantity * item.purchasePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//         </Text>
//       </View>

//       {/* Part Selection Modal */}
//       <Modal
//         visible={partModalOpen}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setPartModalOpen(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modal, { backgroundColor: colors.card }]}>
//             <View style={styles.modalHeader}>
//               <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Part</Text>
//               <TouchableOpacity
//                 onPress={() => setPartModalOpen(false)}
//                 style={styles.modalCloseButton}
//                 activeOpacity={0.7}
//               >
//                 <X size={24} color={colors.mutedForeground} />
//               </TouchableOpacity>
//             </View>
            
//             <FlatList
//               data={filteredParts}
//               keyExtractor={(item) => item.id}
//               style={styles.modalList}
//               renderItem={({ item: part }) => (
//                 <TouchableOpacity
//                   style={[styles.modalListItem, { borderBottomColor: colors.border }]}
//                   onPress={() => {
//                     onPartSelect(part)
//                     setPartModalOpen(false)
//                   }}
//                   activeOpacity={0.7}
//                 >
//                   <View>
//                     <Text style={[styles.modalItemName, { color: colors.foreground }]}>
//                       {part.name}
//                     </Text>
//                     <Text style={[styles.modalItemDetails, { color: colors.mutedForeground }]}>
//                       {part.partNumber}
//                     </Text>
//                     <Text style={[styles.modalItemAddress, { color: colors.mutedForeground }]}>
//                       Stock: {part.quantity}
//                     </Text>
//                   </View>
//                 </TouchableOpacity>
//               )}
//               ListEmptyComponent={
//                 <View style={styles.emptyList}>
//                   <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
//                     No parts found for this supplier
//                   </Text>
//                   <TouchableOpacity
//                     onPress={() => {
//                       setPartModalOpen(false)
//                       onAddNewPart()
//                     }}
//                     style={[styles.addButton, { backgroundColor: colors.primaryBackground }]}
//                     activeOpacity={0.7}
//                   >
//                     <Plus size={16} color={colors.primary} />
//                     <Text style={[styles.addButtonText, { color: colors.primary }]}>
//                       Add New Part
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               }
//             />
            
//             <TouchableOpacity
//               onPress={() => {
//                 setPartModalOpen(false)
//                 onAddNewPart()
//               }}
//               style={[styles.modalFooterButton, { backgroundColor: colors.primaryBackground }]}
//               activeOpacity={0.7}
//             >
//               <Plus size={16} color={colors.primary} />
//               <Text style={[styles.addButtonText, { color: colors.primary }]}>
//                 Add New Part
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 16,
//   },
//   headerTitleContainer: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 2,
//   },
//   headerSubtitle: {
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 12,
//     gap: 6,
//   },
//   saveButtonText: {
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 16,
//   },
//   selector: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   selectorContent: {
//     flex: 1,
//   },
//   selectorTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   selectorSubtitle: {
//     fontSize: 14,
//   },
//   selectorPlaceholder: {
//     fontSize: 16,
//   },
//   formGroup: {
//     marginBottom: 16,
//   },
//   formRow: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 16,
//   },
//   formHalf: {
//     flex: 1,
//   },
//   fieldLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   input: {
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     fontSize: 15,
//     minHeight: 44,
//   },
//   dateSelector: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     gap: 8,
//   },
//   dateText: {
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   statusButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   statusButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     alignItems: 'center',
//   },
//   statusButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   paymentButtons: {
//     flexDirection: 'row',
//     gap: 8,
//     flexWrap: 'wrap',
//   },
//   paymentButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   paymentButtonText: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     gap: 4,
//   },
//   addButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   itemsList: {
//     gap: 16,
//   },
//   itemContainer: {
//     padding: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   itemHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   itemTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   removeButton: {
//     padding: 4,
//   },
//   itemTotal: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: 16,
//     paddingTop: 16,
//     borderTopWidth: 1,
//   },
//   itemTotalLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   itemTotalValue: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   totalContainer: {
//     marginTop: 20,
//     paddingTop: 20,
//     borderTopWidth: 1,
//   },
//   totalRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   totalLabel: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   totalValue: {
//     fontSize: 24,
//     fontWeight: '700',
//   },
//   notesInput: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     fontSize: 15,
//     minHeight: 80,
//     textAlignVertical: 'top',
//   },
//   receiptPreview: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     gap: 12,
//   },
//   receiptInfo: {
//     flex: 1,
//   },
//   receiptFileName: {
//     fontSize: 15,
//     fontWeight: '500',
//     marginBottom: 4,
//   },
//   receiptStatus: {
//     fontSize: 13,
//   },
//   removeReceiptButton: {
//     padding: 4,
//   },
//   receiptScanButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 32,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   scanningState: {
//     alignItems: 'center',
//     gap: 12,
//   },
//   scanningText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   scanPrompt: {
//     alignItems: 'center',
//     gap: 8,
//   },
//   scanPromptTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   scanPromptSubtitle: {
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   modal: {
//     borderRadius: 16,
//     width: '100%',
//     maxWidth: 400,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   modalList: {
//     maxHeight: 400,
//   },
//   modalListItem: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//   },
//   modalItemName: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 4,
//   },
//   modalItemDetails: {
//     fontSize: 14,
//     marginBottom: 2,
//   },
//   modalItemAddress: {
//     fontSize: 13,
//   },
//   modalForm: {
//     paddingHorizontal: 20,
//     maxHeight: 400,
//   },
//   modalActions: {
//     flexDirection: 'row',
//     gap: 12,
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#e5e7eb',
//   },
//   modalCancelButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   modalConfirmButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   modalCancelText: {
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   modalConfirmText: {
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   modalFooterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     marginHorizontal: 20,
//     marginVertical: 16,
//     borderRadius: 8,
//     gap: 6,
//   },
//   emptyList: {
//     alignItems: 'center',
//     paddingVertical: 40,
//     gap: 16,
//   },
//   emptyText: {
//     fontSize: 15,
//     textAlign: 'center',
//   },
// })
