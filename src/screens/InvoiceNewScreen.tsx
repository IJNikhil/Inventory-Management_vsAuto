// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Modal,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//    StyleSheet,
//   RefreshControl,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import {
//   ArrowLeft,
//   Calendar as CalendarIcon,
//   ChevronsUpDown,
//   PlusCircle,
//   Save,
//   Trash2,
//   X,
// } from 'lucide-react-native';
// import { format } from 'date-fns';

// // ---- Theme ----
// import { useColors, useTheme } from '../context/ThemeContext';

// // ---- Services and Types ----
// import type { Invoice, InvoiceItem, Part, ShopDetails, InvoiceCustomer } from '../types'; // Added InvoiceCustomer import
// import { useToast } from '../hooks/use-toast';
// import { useAppSelector } from '../lib/redux/hooks';
// import { selectAuth } from '../lib/redux/slices/auth-slice';
// import { addInvoice } from '../services/invoice-service';
// import { updatePart, getParts } from '../services/part-service'; // Added getParts import
// import { getShopDetails } from '../services/shop-service'; // Added getShopDetails import

// const STATUS_OPTIONS = ['Pending', 'Paid'] as const;
// type StatusOption = typeof STATUS_OPTIONS[number];
// type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer'; // Added PaymentMethod type

// type InvoiceLineItem = InvoiceItem & {
//   partId?: string;
//   purchasePrice: number;
//   isSpecialDiscount: boolean;
// };
// type ItemError = { itemId: string; message: string };

// export default function InvoiceNewScreen({ navigation }: any) {
//   const { user } = useAppSelector(selectAuth);
//   const { toast } = useToast();
  
//   // Theme hooks
//   const colors = useColors();
//   const { isDark } = useTheme();

//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [availableParts, setAvailableParts] = useState<Part[]>([]);
//   const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);

//   // Customer data - now embedded directly instead of separate collection
//   const [customerData, setCustomerData] = useState<InvoiceCustomer>({
//     name: '',
//     phone: '',
//     address: ''
//   });

//   const [items, setItems] = useState<InvoiceLineItem[]>([
//     {
//       id: `item-${Date.now()}`,
//       description: '',
//       quantity: 1,
//       price: 0,
//       partId: '',
//       purchasePrice: 0,
//       mrp: 0,
//       discount: 0,
//       isSpecialDiscount: false,
//     },
//   ]);
//   const [date, setDate] = useState<Date>(new Date());
//   const [status, setStatus] = useState<StatusOption>('Pending');
//   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
//   const [notes, setNotes] = useState('');
//   const [isSaving, setIsSaving] = useState(false);
//   const [errors, setErrors] = useState<ItemError[]>([]);

//   // Load initial data function - removed customer loading
//   const loadInitialData = useCallback(async (showLoading = true) => {
//     if (showLoading) setIsLoading(true);
//     try {
//       console.log('[InvoiceNewScreen] Loading initial data...');
      
//       const [parts, details] = await Promise.all([
//         getParts(),
//         getShopDetails(),
//       ]);
      
//       console.log('[InvoiceNewScreen] Loaded parts:', parts.length);
//       console.log('[InvoiceNewScreen] Loaded shop details:', details);
      
//       setAvailableParts(parts.filter((p: Part) => p.status === 'active' && p.quantity > 0)); // Fixed implicit any type
//       setShopDetails(details);
//       setNotes(`Thank you for choosing ${details?.name || 'VS Auto'}.`);
//     } catch (error) {
//       console.error('Error loading initial data:', error);
//       toast({ 
//         title: 'Error', 
//         description: 'Failed to load data. Please try again.', 
//         variant: 'destructive' 
//       });
//     } finally {
//       if (showLoading) setIsLoading(false);
//     }
//   }, [toast]);

//   // Refresh function for pull-to-refresh
//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     try {
//       await loadInitialData(false);
//       toast({ 
//         title: 'Data Refreshed', 
//         description: 'Invoice data has been updated successfully.' 
//       });
//     } catch (error) {
//       console.error('Error refreshing data:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   }, [loadInitialData, toast]);

//   // Load data only once on mount
//   useEffect(() => {
//     loadInitialData(true);
//   }, [loadInitialData]);

//   // Add focus listener to refresh parts when screen comes into focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       console.log('[InvoiceNewScreen] Screen focused, refreshing parts');
//       loadInitialData(false); // Refresh without showing loading
//     });

//     return unsubscribe;
//   }, [navigation, loadInitialData]);

//   useEffect(() => {
//     // Validate all items on every change
//     const list: ItemError[] = [];
//     items.forEach(item => {
//       if (item.partId && item.mrp > 0) {
//         const minPrice = item.purchasePrice + item.mrp * (item.isSpecialDiscount ? 0.05 : 0.1);
//         if (item.price < minPrice) {
//           list.push({ itemId: item.id, message: `Min price: ₹${minPrice.toFixed(2)}` });
//         }
//       }
//     });
//     setErrors(list);
//   }, [items]);

//   const subtotal = useMemo(
//     () => items.reduce((acc, item) => acc + (item.mrp || 0) * item.quantity, 0),
//     [items]
//   );
//   const total = useMemo(
//     () => items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0),
//     [items]
//   );

//   const updateItem = (id: string, patch: Partial<InvoiceLineItem>) =>
//     setItems((prev: InvoiceLineItem[]) => prev.map(i => (i.id === id ? { ...i, ...patch } : i))); // Fixed implicit any type

//   const handleDiscountChange = (itemId: string, discount: number) => {
//     const item = items.find(i => i.id === itemId);
//     if (!item || item.mrp <= 0) return;
//     const d = Math.max(0, Math.min(100, discount));
//     const price = item.mrp * (1 - d / 100);
//     updateItem(itemId, { discount: d, price: Number(price.toFixed(2)) });
//   };

//   const handlePriceChange = (itemId: string, price: number) => {
//     const item = items.find(i => i.id === itemId);
//     if (!item || item.mrp <= 0) return updateItem(itemId, { price });
//     let d = 0;
//     if (price < item.mrp) d = ((item.mrp - price) / item.mrp) * 100;
//     updateItem(itemId, { price: Number(price.toFixed(2)), discount: Number(d.toFixed(2)) });
//   };

//   const onSelectPart = (itemId: string, part: Part) => {
//     const discount =
//       part.mrp > 0 && part.sellingPrice > 0
//         ? Number((((part.mrp - part.sellingPrice) / part.mrp) * 100).toFixed(2))
//         : 0;
//     updateItem(itemId, {
//       description: `${part.name} (${part.partNumber})`,
//       price: part.sellingPrice,
//       purchasePrice: part.purchasePrice,
//       partId: part.id,
//       mrp: part.mrp,
//       discount,
//       quantity: 1,
//       isSpecialDiscount: false,
//     });
//   };

//   const addItem = () => {
//     setItems([...items, {
//       id: `item-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
//       description: '',
//       quantity: 1,
//       price: 0,
//       partId: '',
//       purchasePrice: 0,
//       mrp: 0,
//       discount: 0,
//       isSpecialDiscount: false,
//     }]);
//   };

//   const removeItem = (id: string) => {
//     if (items.length === 1) return;
//     setItems((prev: InvoiceLineItem[]) => prev.filter(item => item.id !== id)); // Fixed implicit any type
//   };

//   const isSaveDisabled = isSaving || isLoading || errors.length > 0;

//   const handleSave = async () => {
//     // Validation - simplified customer validation
//     if (!customerData.name.trim()) {
//       toast({ title: 'Customer name required', description: 'Please enter customer name.' }); 
//       return;
//     }
//     if (items.some(i => !i.description)) {
//       toast({ title: 'Missing item', description: 'Please select all parts.' }); 
//       return;
//     }
//     if (errors.length > 0) {
//       toast({ title: 'Check item prices', description: errors.map(e => e.message).join(', ') }); 
//       return;
//     }
    
//     setIsSaving(true);
    
//     try {
//       const currentUser = user?.name ?? 'System';
      
//       // Create invoice with embedded customer data
//          const invoice: Omit<Invoice, 'id' | 'lastModified'> = {
//            customer: customerData,
//            customerName: customerData.name,
//            items: items.map(({ purchasePrice: _p, partId: _id, ...rest }) => rest),
//            subtotal,
//            total,
//            date: format(date, 'yyyy-MM-dd'),
//            status,
//            paymentMethod,
//            notes,
//            generatedBy: currentUser,
//            ...(status === 'Paid'
//              ? { collectedBy: currentUser, paymentDate: format(new Date(), 'yyyy-MM-dd') }
//              : {}),
//            customerId: 'enbedded'
//          };

//       console.log('[InvoiceNewScreen] Creating invoice:', invoice);

//       // Prepare items sold data for part quantity updates
//     const itemsSold = items
//       .filter(item => item.partId)
//       .map(item => ({ partId: item.partId!, quantity: item.quantity }));

//       // Create the invoice with itemsSold parameter
//     const savedInvoice = await addInvoice(invoice, itemsSold);
      
//       // Update local state to reflect the changes
//       const soldItems = items.filter(i => i.partId);
//     console.log('[InvoiceNewScreen] Updating part quantities for:', soldItems.length, 'items');
    
//     setAvailableParts((prev: Part[]) => prev.map((p: Part) => {
//       const soldItem = soldItems.find(item => item.partId === p.id);
//       if (soldItem) {
//         const newQuantity = p.quantity - soldItem.quantity;
//         return { ...p, quantity: newQuantity, isLowStock: newQuantity < 10 };
//       }
//       return p;
//     }));

//        toast({ 
//       title: 'Invoice Generated', 
//       description: `Invoice ${savedInvoice.id} created successfully.` // Show the generated ID
//     });
//     navigation.goBack();
//   } catch (error) {
//     console.error('Error saving invoice:', error);
//     toast({ title: 'Error saving invoice', variant: 'destructive' });
//   } finally {
//     setIsSaving(false);
//   }
// };

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
//       <View style={[styles.container, { backgroundColor: colors.background }]}>
//         {/* Sub Header for New Invoice */}
//         <View style={[styles.subHeader, { 
//           backgroundColor: colors.card,
//           borderBottomColor: colors.border 
//         }]}>
//           <View style={styles.headerLeft}>
//             <TouchableOpacity
//               onPress={() => navigation.goBack()}
//               style={[styles.backButton, { backgroundColor: colors.primaryBackground }]}
//               activeOpacity={0.7}
//             >
//               <ArrowLeft size={20} color={colors.primary} />
//             </TouchableOpacity>
//             <View style={styles.headerTitleContainer}>
//               <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Invoice</Text>
//               <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
//                 Create customer invoice
//               </Text>
//             </View>
//           </View>
//         </View>

//         <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//           {isLoading ? (
//             <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
//               <ActivityIndicator size="large" color={colors.primary} />
//               <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
//                 Loading invoice data...
//               </Text>
//             </View>
//           ) : (
//             <ScrollView 
//               style={[styles.scrollView, { backgroundColor: colors.background }]}
//               contentContainerStyle={styles.scrollContent} 
//               keyboardShouldPersistTaps="handled"
//               showsVerticalScrollIndicator={false}
//               refreshControl={
//                 <RefreshControl
//                   refreshing={isRefreshing}
//                   onRefresh={onRefresh}
//                   colors={[colors.primary]}
//                   tintColor={colors.primary}
//                   title="Pull to refresh"
//                   titleColor={colors.mutedForeground}
//                 />
//               }
//             >
//               {/* Bill From Section */}
//               <View style={styles.section}>
//                 <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Bill From</Text>
//                 <Text style={[styles.shopName, { color: colors.foreground }]}>{shopDetails?.name}</Text>
//                 <Text style={[styles.shopAddress, { color: colors.mutedForeground }]}>{shopDetails?.address}</Text>
//               </View>

//               {/* Customer Details Section - Direct input instead of selection */}
//               <View style={styles.section}>
//                 <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Customer Details</Text>
                
//                 <TextInput 
//                   style={[styles.input, {
//                     backgroundColor: colors.card,
//                     borderColor: colors.border,
//                     color: colors.foreground
//                   }]} 
//                   placeholder="Customer Name *" 
//                   placeholderTextColor={colors.mutedForeground}
//                   value={customerData.name} 
//                   onChangeText={(name) => setCustomerData((prev: InvoiceCustomer) => ({ ...prev, name }))} // Fixed implicit any type
//                 />
                
//                 <TextInput 
//                   style={[styles.input, {
//                     backgroundColor: colors.card,
//                     borderColor: colors.border,
//                     color: colors.foreground
//                   }]} 
//                   placeholder="Phone" 
//                   placeholderTextColor={colors.mutedForeground}
//                   keyboardType="phone-pad" 
//                   value={customerData.phone} 
//                   onChangeText={(phone) => setCustomerData((prev: InvoiceCustomer) => ({ ...prev, phone }))} // Fixed implicit any type
//                 />
                
//                 <TextInput 
//                   style={[styles.textAreaInput, {
//                     backgroundColor: colors.card,
//                     borderColor: colors.border,
//                     color: colors.foreground
//                   }]} 
//                   placeholder="Address" 
//                   placeholderTextColor={colors.mutedForeground}
//                   value={customerData.address} 
//                   onChangeText={(address) => setCustomerData((prev: InvoiceCustomer) => ({ ...prev, address }))} // Fixed implicit any type
//                   multiline 
//                   numberOfLines={2}
//                 />
//               </View>

//               {/* Date Section */}
//               <View style={styles.section}>
//                 <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Invoice Date</Text>
//                 <TouchableOpacity 
//                   style={[styles.dateSelector, {
//                     backgroundColor: colors.card,
//                     borderColor: colors.border
//                   }]} 
//                   onPress={() => {/* TODO: add datepicker */}}
//                   activeOpacity={0.7}
//                 >
//                   <CalendarIcon color={colors.primary} size={16} />
//                   <Text style={[styles.dateText, { color: colors.foreground }]}>{format(date, 'PPP')}</Text>
//                 </TouchableOpacity>
//               </View>

//               {/* Status Section */}
//               <View style={styles.section}>
//                 <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Payment Status</Text>
//                 <View style={styles.statusContainer}>
//                   {STATUS_OPTIONS.map(opt => (
//                     <TouchableOpacity
//                       key={opt}
//                       style={[
//                         styles.statusChip,
//                         {
//                           backgroundColor: status === opt ? colors.primary : colors.card,
//                           borderColor: status === opt ? colors.primary : colors.border,
//                         }
//                       ]}
//                       onPress={() => setStatus(opt)}
//                       activeOpacity={0.7}
//                     >
//                       <Text style={[
//                         styles.statusChipText,
//                         { color: status === opt ? colors.primaryForeground : colors.foreground }
//                       ]}>
//                         {opt}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
                
//                 {status === "Paid" && (
//                   <View style={styles.paymentMethodSection}>
//                     <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Payment Method</Text>
//                     <View style={styles.paymentContainer}>
//                       {(['Cash', 'UPI', 'Bank Transfer'] as PaymentMethod[]).map(method => (
//                         <TouchableOpacity
//                           key={method}
//                           style={[
//                             styles.paymentChip,
//                             {
//                               backgroundColor: paymentMethod === method ? colors.accent + '20' : colors.card,
//                               borderColor: paymentMethod === method ? colors.accent : colors.border,
//                             }
//                           ]}
//                           onPress={() => setPaymentMethod(method)}
//                           activeOpacity={0.7}
//                         >
//                           <Text style={[
//                             styles.paymentChipText,
//                             { color: paymentMethod === method ? colors.accent : colors.foreground }
//                           ]}>
//                             {method}
//                           </Text>
//                         </TouchableOpacity>
//                       ))}
//                     </View>
//                   </View>
//                 )}
//               </View>

//               {/* Items Section */}
//               <View style={styles.section}>
//                 <View style={styles.itemsSectionHeader}>
//                   <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Invoice Items</Text>
//                   <TouchableOpacity
//                     onPress={addItem}
//                     style={[styles.addItemButton, { backgroundColor: colors.primaryBackground }]}
//                     activeOpacity={0.7}
//                   >
//                     <PlusCircle size={16} color={colors.primary} />
//                     <Text style={[styles.addItemText, { color: colors.primary }]}>Add Item</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {items.map((item, idx) => {
//                   const error = errors.find(e => e.itemId === item.id);
//                   return (
//                     <View style={[styles.itemContainer, { 
//                       backgroundColor: colors.card,
//                       borderColor: colors.border 
//                     }]} key={item.id}>
//                       <View style={styles.itemHeader}>
//                         <Text style={[styles.itemNumber, { color: colors.foreground }]}>
//                           Item #{idx + 1}
//                         </Text>
//                         {items.length > 1 && (
//                           <TouchableOpacity 
//                             onPress={() => removeItem(item.id)}
//                             style={styles.removeItemButton}
//                             activeOpacity={0.7}
//                           >
//                             <X size={16} color={colors.destructive} />
//                           </TouchableOpacity>
//                         )}
//                       </View>

//                       <MobilePartPicker
//                         parts={availableParts}
//                         selectedPartId={item.partId}
//                         onSelect={part => onSelectPart(item.id, part)}
//                         disabled={isLoading}
//                         colors={colors}
//                       />

//                       <View style={styles.itemFieldsContainer}>
//                         <View style={styles.itemFieldRow}>
//                           <View style={styles.itemFieldHalf}>
//                             <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Qty</Text>
//                             <TextInput
//                               style={[styles.itemInput, {
//                                 backgroundColor: colors.background,
//                                 borderColor: colors.border,
//                                 color: colors.foreground
//                               }]}
//                               keyboardType="numeric"
//                               value={item.quantity?.toString() || ""}
//                               onChangeText={v => updateItem(item.id, { quantity: Number(v) || 1 })}
//                               placeholder="1"
//                               placeholderTextColor={colors.mutedForeground}
//                             />
//                           </View>
//                           <View style={styles.itemFieldHalf}>
//                             <Text style={[styles.fieldLabel, { color: colors.foreground }]}>MRP</Text>
//                             <TextInput
//                               style={[styles.itemInput, {
//                                 backgroundColor: colors.muted,
//                                 borderColor: colors.border,
//                                 color: colors.mutedForeground
//                               }]}
//                               value={item.mrp?.toString() || ""}
//                               editable={false}
//                               placeholder="0.00"
//                               placeholderTextColor={colors.mutedForeground}
//                             />
//                           </View>
//                         </View>

//                         <View style={styles.itemFieldRow}>
//                           <View style={styles.itemFieldHalf}>
//                             <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Discount %</Text>
//                             <TextInput
//                               style={[styles.itemInput, {
//                                 backgroundColor: colors.background,
//                                 borderColor: colors.border,
//                                 color: colors.foreground
//                               }]}
//                               keyboardType="numeric"
//                               value={item.discount?.toString() || ""}
//                               onChangeText={v => handleDiscountChange(item.id, Number(v))}
//                               placeholder="0"
//                               placeholderTextColor={colors.mutedForeground}
//                             />
//                           </View>
//                           <View style={styles.itemFieldHalf}>
//                             <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Price</Text>
//                             <TextInput
//                               style={[styles.itemInput, {
//                                 backgroundColor: colors.background,
//                                 borderColor: error ? colors.destructive : colors.border,
//                                 color: colors.foreground
//                               }]}
//                               keyboardType="numeric"
//                               value={item.price?.toString() || ""}
//                               onChangeText={v => handlePriceChange(item.id, Number(v))}
//                               placeholder="0.00"
//                               placeholderTextColor={colors.mutedForeground}
//                             />
//                           </View>
//                         </View>
//                       </View>

//                       {error && (
//                         <Text style={[styles.errorMessage, { color: colors.destructive }]}>
//                           {error.message}
//                         </Text>
//                       )}
//                     </View>
//                   );
//                 })}
//               </View>

//               {/* Totals Section */}
//               <View style={styles.section}>
//                 <View style={[styles.totalRow, { backgroundColor: colors.card }]}>
//                   <Text style={[styles.totalLabel, { color: colors.foreground }]}>Subtotal (MRP)</Text>
//                   <Text style={[styles.totalValue, { color: colors.foreground }]}>
//                     ₹{subtotal.toFixed(2)}
//                   </Text>
//                 </View>
//                 <View style={[styles.totalRow, { backgroundColor: colors.card }]}>
//                   <Text style={[styles.grandTotalLabel, { color: colors.foreground }]}>Grand Total</Text>
//                   <Text style={[styles.grandTotalValue, { color: colors.primary }]}>
//                     ₹{total.toFixed(2)}
//                   </Text>
//                 </View>
//               </View>

//               {/* Notes Section */}
//               <View style={styles.section}>
//                 <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Notes (Optional)</Text>
//                 <TextInput
//                   multiline 
//                   numberOfLines={3}
//                   value={notes}
//                   onChangeText={setNotes}
//                   style={[styles.notesInput, {
//                     backgroundColor: colors.card,
//                     borderColor: colors.border,
//                     color: colors.foreground
//                   }]}
//                   placeholder="Invoice notes (e.g., warranty, terms)..."
//                   placeholderTextColor={colors.mutedForeground}
//                   textAlignVertical="top"
//                 />
//               </View>
//             </ScrollView>
//           )}

//           {/* Generate Invoice Button - Fixed at bottom */}
//           <View style={[styles.bottomButtonContainer, { 
//             backgroundColor: colors.background,
//             borderTopColor: colors.border 
//           }]}>
//             <TouchableOpacity
//               onPress={handleSave}
//               disabled={isSaveDisabled}
//               style={[styles.generateButton, { 
//                 backgroundColor: colors.primary,
//                 opacity: isSaveDisabled ? 0.5 : 1 
//               }]}
//               activeOpacity={0.8}
//             >
//               {isSaving && (
//                 <ActivityIndicator size={20} color={colors.primaryForeground} style={{ marginRight: 10 }} />
//               )}
//               <Save size={19} color={colors.primaryForeground} style={{ marginRight: 6 }} />
//               <Text style={[styles.generateButtonText, { color: colors.primaryForeground }]}>
//                 {isSaving ? "Saving..." : "Generate Invoice"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       </View>
//     </SafeAreaView>
//   );
// }

// // Mobile part picker component
// function MobilePartPicker({
//   parts,
//   selectedPartId,
//   onSelect,
//   disabled,
//   colors,
// }: {
//   parts: Part[];
//   selectedPartId: string | undefined;
//   onSelect: (part: Part) => void;
//   disabled?: boolean;
//   colors: any;
// }) {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [filter, setFilter] = useState('');
//   const filtered = parts.filter(
//     p =>
//       p.name.toLowerCase().includes(filter.toLowerCase()) ||
//       p.partNumber.toLowerCase().includes(filter.toLowerCase())
//   );
//   const selectedPart = parts.find(p => p.id === selectedPartId);

//   return (
//     <>
//       <TouchableOpacity
//         style={[styles.selectButton, {
//           backgroundColor: colors.card,
//           borderColor: colors.border,
//           opacity: disabled ? 0.5 : 1
//         }]}
//         onPress={() => !disabled && setModalOpen(true)}
//         disabled={!!disabled}
//         activeOpacity={0.7}
//       >
//         <Text style={[styles.selectButtonText, { 
//           color: selectedPart ? colors.foreground : colors.mutedForeground 
//         }]}>
//           {selectedPart
//             ? `${selectedPart.name} (${selectedPart.partNumber}) - Qty: ${selectedPart.quantity}`
//             : 'Select part...'}
//         </Text>
//         <ChevronsUpDown size={17} color={colors.mutedForeground} />
//       </TouchableOpacity>
      
//       <Modal
//         transparent
//         visible={modalOpen}
//         animationType="slide"
//         onRequestClose={() => setModalOpen(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
//             <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
//               <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Part</Text>
//               <TouchableOpacity
//                 onPress={() => setModalOpen(false)}
//                 style={styles.modalCloseButton}
//                 activeOpacity={0.7}
//               >
//                 <X size={24} color={colors.mutedForeground} />
//               </TouchableOpacity>
//             </View>
            
//             <TextInput
//               placeholder="Search by name or number"
//               placeholderTextColor={colors.mutedForeground}
//               value={filter}
//               onChangeText={setFilter}
//               style={[styles.searchInput, {
//                 backgroundColor: colors.background,
//                 borderColor: colors.border,
//                 color: colors.foreground
//               }]}
//               autoFocus
//             />
            
//             <FlatList
//               data={filtered}
//               keyExtractor={item => item.id}
//               style={styles.modalList}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[styles.modalListItem, { 
//                     borderBottomColor: colors.border,
//                     opacity: item.quantity <= 0 ? 0.5 : 1
//                   }]}
//                   onPress={() => { 
//                     if (item.quantity > 0) { 
//                       onSelect(item); 
//                       setModalOpen(false); 
//                     } 
//                   }}
//                   disabled={item.quantity <= 0}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={[styles.modalListItemText, { color: colors.foreground }]}>
//                     {item.name} ({item.partNumber})
//                   </Text>
//                   <Text style={[styles.modalListItemSmall, { color: colors.mutedForeground }]}>
//                     Qty: {item.quantity} | Price: ₹{item.sellingPrice}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//               ListEmptyComponent={
//                 <Text style={[styles.emptyListText, { color: colors.mutedForeground }]}>
//                   No matching parts available
//                 </Text>
//               }
//             />
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// }

















// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//   },
//   subHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
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
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   headerSubtitle: {
//     fontSize: 13,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 16,
//     paddingBottom: 20,
//   },
//   section: {
//     marginBottom: 20,
//   },
//   sectionLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   shopName: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   shopAddress: {
//     fontSize: 14,
//   },
//   newCustomerForm: {
//     gap: 12,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 15,
//     minHeight: 44,
//   },
//   textAreaInput: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 15,
//     minHeight: 60,
//     textAlignVertical: 'top',
//   },
//   link: {
//     textDecorationLine: 'underline',
//     textAlign: 'center',
//     marginTop: 8,
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   dateSelector: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     gap: 8,
//   },
//   dateText: {
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   statusChip: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     alignItems: 'center',
//   },
//   statusChipText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   paymentMethodSection: {
//     marginTop: 16,
//   },
//   fieldLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom: 8,
//   },
//   paymentContainer: {
//     flexDirection: 'row',
//     gap: 8,
//     flexWrap: 'wrap',
//   },
//   paymentChip: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     borderWidth: 1,
//   },
//   paymentChipText: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   itemsSectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   addItemButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     gap: 4,
//   },
//   addItemText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   itemContainer: {
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//   },
//   itemHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   itemNumber: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   removeItemButton: {
//     padding: 4,
//   },
//   itemFieldsContainer: {
//     marginTop: 12,
//     gap: 12,
//   },
//   itemFieldRow: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   itemFieldHalf: {
//     flex: 1,
//   },
//   itemInput: {
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     borderRadius: 6,
//     borderWidth: 1,
//     fontSize: 14,
//     minHeight: 36,
//   },
//   errorMessage: {
//     fontSize: 12,
//     marginTop: 8,
//     textAlign: 'right',
//     fontWeight: '500',
//   },
//   totalRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   totalValue: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   grandTotalLabel: {
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   grandTotalValue: {
//     fontSize: 20,
//     fontWeight: '700',
//   },
//   notesInput: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 15,
//     minHeight: 80,
//     textAlignVertical: 'top',
//   },
//   bottomButtonContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     borderTopWidth: StyleSheet.hairlineWidth,
//   },
//   generateButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 12,
//     paddingVertical: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   generateButtonText: {
//     fontWeight: '700',
//     fontSize: 17,
//   },
//   selectButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     marginBottom: 8,
//   },
//   selectButtonText: {
//     flex: 1,
//     fontSize: 15,
//   },
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
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   searchInput: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 15,
//     marginHorizontal: 20,
//     marginVertical: 16,
//     minHeight: 44,
//   },
//   modalList: {
//     maxHeight: 300,
//   },
//   modalListItem: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   modalListItemText: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 4,
//   },
//   modalListItemSmall: {
//     fontSize: 13,
//   },
//   emptyListText: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 15,
//   },
//   modalAddButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     marginHorizontal: 20,
//     marginVertical: 16,
//     borderRadius: 8,
//     gap: 8,
//   },
//   modalAddButtonText: {
//     fontSize: 15,
//     fontWeight: '600',  
//   },
// });
