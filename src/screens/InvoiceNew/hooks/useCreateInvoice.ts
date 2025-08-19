import { useState, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import type { Invoice, InvoiceItem, Part, InvoiceCustomer, ShopSettings } from '../../../types/database';
import { useToast } from '../../../hooks/use-toast';
import { useAppSelector } from '../../../lib/redux/hooks';
import { selectAuth } from '../../../lib/redux/slices/auth-slice';
import { invoiceService } from '../../../services/invoice-service';
import { partService } from '../../../services/part-service';
import { shopSettingsService } from '../../../services/shop-service';

export const STATUS_OPTIONS = ['draft', 'sent', 'paid'] as const;
type StatusOption = typeof STATUS_OPTIONS[number];
type PaymentMethod = 'cash' | 'upi' | 'bank_transfer';
type ItemError = { itemId: string; message: string };

// ✅ UPDATED: Extended item type for UI with database compatibility
type UIInvoiceItem = InvoiceItem & {
  part_id?: string;
  purchase_price: number;
  isSpecialDiscount: boolean;
  mrp: number;
};

export default function useCreateInvoice() {
  const { user } = useAppSelector(selectAuth);
  const { toast } = useToast();
  const mounted = useRef(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [shopDetails, setShopDetails] = useState<ShopSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [customerData, setCustomerData] = useState<InvoiceCustomer>({
    name: '', 
    phone: '', 
    email: '',
    address: ''
  });

  const [items, setItems] = useState<UIInvoiceItem[]>([{
    id: `item-${Date.now()}`,
    invoice_id: '',
    part_id: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    discount_percentage: 0,
    tax_percentage: 0,
    line_total: 0,
    purchase_price: 0,
    mrp: 0,
    isSpecialDiscount: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1
  }]);

  const [date, setDate] = useState<Date>(new Date());
  const [status, setStatus] = useState<StatusOption>('draft');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<ItemError[]>([]);

  const subtotal = items.reduce((a, i) => a + (i.mrp || 0) * (i.quantity || 0), 0);
  const total = items.reduce((a, i) => a + (i.unit_price || 0) * (i.quantity || 0), 0);
  const isSaveDisabled = isSaving || isLoading || errors.length > 0 || !customerData.name.trim();

  // ✅ ENHANCED: Better data loading with shop settings creation
  const loadInitialData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setLoadError(null);
    
    try {
      console.log('🔄 Loading initial data...');
      
      const [parts, settingsArray] = await Promise.all([
        partService.findAll(),
        shopSettingsService.findAll()
      ]);
      
      let details = settingsArray[0] || null;
      
      // ✅ ADDED: Create default shop settings if none exist
      if (!details) {
        console.log('🏪 No shop settings found, creating default...');
        try {
          details = await shopSettingsService.create({
            shop_name: 'VS Auto',
            address: 'Auto Parts Store',
            phone: '',
            email: '',
            logo: '',
            tax_number: '',
            currency: 'INR'
          });
          console.log('✅ Created default shop settings:', details);
        } catch (error) {
          console.error('❌ Failed to create shop settings:', error);
        }
      }
      
      if (!mounted.current) return;
      
      console.log('📦 Raw parts loaded:', parts.length);
      console.log('📋 Sample parts:', parts.slice(0, 3).map(p => ({ 
        id: p.id, 
        name: p.name, 
        status: p.status, 
        quantity: p.quantity 
      })));
      
      const activeParts = parts.filter(p => p.status === 'active' && p.quantity > 0);
      console.log('✅ Active parts with stock:', activeParts.length);
      
      setAvailableParts(activeParts);
      setShopDetails(details);
      setNotes(`Thank you for choosing ${details?.shop_name || 'VS Auto'}.`);
      
      console.log('✅ Initial data loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      setLoadError(errorMessage);
      
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadInitialData();
    return () => { mounted.current = false; };
  }, [loadInitialData]);

  // ✅ ADD: Debug effect to monitor parts changes
  useEffect(() => {
    console.log('📊 Available Parts Updated:', {
      count: availableParts.length,
      sample: availableParts.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        part_number: p.part_number,
        quantity: p.quantity,
        selling_price: p.selling_price
      }))
    });
  }, [availableParts]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadInitialData(false);
    setIsRefreshing(false);
    
    if (!loadError) {
      toast({ title: 'Refreshed', description: 'Invoice data updated.' });
    }
  }, [loadInitialData, toast, loadError]);

  const validateItems = useCallback((): ItemError[] => {
    const errs: ItemError[] = [];
    items.forEach(item => {
      if (item.part_id && item.mrp > 0) {
        const min = item.purchase_price + item.mrp * (item.isSpecialDiscount ? 0.05 : 0.1);
        if (item.unit_price < min) {
          errs.push({ 
            itemId: item.id, 
            message: `Min price: ₹${min.toFixed(2)}` 
          });
        }
      }
    });
    setErrors(errs);
    return errs;
  }, [items]);

  const updateItem = useCallback((id: string, patch: Partial<UIInvoiceItem>) => {
    setItems(list => list.map(i => (i.id === id ? { 
      ...i, 
      ...patch, 
      updated_at: new Date().toISOString(),
      line_total: patch.unit_price && patch.quantity ? patch.unit_price * patch.quantity : i.line_total
    } : i)));
  }, []);

  const handleDiscountChange = useCallback((itemId: string, discount: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.mrp <= 0) return;
    
    const d = Math.max(0, Math.min(100, discount));
    const unit_price = item.mrp * (1 - d / 100);
    updateItem(itemId, { 
      discount_percentage: d,
      unit_price: Number(unit_price.toFixed(2))
    });
  }, [items, updateItem]);

  const handlePriceChange = useCallback((itemId: string, price: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.mrp <= 0) return updateItem(itemId, { unit_price: price });
    
    let d = 0;
    if (price < item.mrp) d = ((item.mrp - price) / item.mrp) * 100;
    updateItem(itemId, { 
      unit_price: Number(price.toFixed(2)),
      discount_percentage: Number(d.toFixed(2))
    });
  }, [items, updateItem]);

  // ✅ FIXED: Corrected syntax error in description
  const onSelectPart = useCallback((itemId: string, part: Part) => {
    console.log('🎯 Part selected:', {
      itemId,
      partId: part.id,
      partName: part.name,
      part_number: part.part_number,
      mrp: part.mrp,
      selling_price: part.selling_price,
      purchase_price: part.purchase_price
    });

    const discount = part.mrp > 0 && part.selling_price > 0
      ? Number((((part.mrp - part.selling_price) / part.mrp) * 100).toFixed(2))
      : 0;

    const updatedItem = {
      description: `${part.name}${part.part_number ? ` (${part.part_number})` : ''}`,
      unit_price: part.selling_price,
      purchase_price: part.purchase_price,
      part_id: part.id,
      mrp: part.mrp,
      discount_percentage: discount,
      quantity: 1,
      isSpecialDiscount: false,
    };

    console.log('📝 Updating item with:', updatedItem);
    updateItem(itemId, updatedItem);
  }, [updateItem]);

  const addItem = useCallback(() => {
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
        invoice_id: '',
        part_id: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        discount_percentage: 0,
        tax_percentage: 0,
        line_total: 0,
        purchase_price: 0,
        mrp: 0,
        isSpecialDiscount: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1
      }
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(list => (list.length > 1 ? list.filter(item => item.id !== id) : list));
  }, []);

  // ✅ MAJOR FIX: Save invoice WITH items and use sequential numbering
  const handleSave = useCallback(async () => {
    if (!customerData.name.trim()) {
      toast({ 
        title: 'Validation Error', 
        description: 'Enter customer name', 
        variant: 'destructive' 
      });
      return false;
    }

    const validItems = items.filter(i => i.part_id && i.description);
    if (!validItems.length) {
      toast({ 
        title: 'Validation Error', 
        description: 'Add at least one item', 
        variant: 'destructive' 
      });
      return false;
    }

    if (validateItems().length) {
      toast({ 
        title: 'Price Validation Error', 
        description: 'Check item prices', 
        variant: 'destructive' 
      });
      return false;
    }

    setIsSaving(true);
    try {
      const currentUser = user?.name ?? 'Owner';
      
      // ✅ FIXED: Create invoice with sequential numbering
      const invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'version'> = {
        invoice_number: '', // Will be generated by service
        customer: customerData,
        subtotal,
        tax_amount: 0,
        discount_amount: subtotal - total,
        total,
        invoice_date: format(date, 'yyyy-MM-dd'),
        due_date: undefined,
        status,
        payment_method: status === 'paid' ? paymentMethod : undefined,
        notes,
        generated_by: currentUser,
        payment_date: status === 'paid' ? format(new Date(), 'yyyy-MM-dd') : undefined
      };

      // ✅ FIXED: Convert UI items to database items format
      const invoiceItems = validItems.map(item => ({
        part_id: item.part_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage,
        tax_percentage: item.tax_percentage,
        line_total: (item.unit_price || 0) * (item.quantity || 0)
      }));

      console.log('💾 Creating invoice with items:', { invoiceData, itemsCount: invoiceItems.length });

      // ✅ MAJOR FIX: Use createWithItems instead of just create
      const result = await invoiceService.createWithItems(invoiceData, invoiceItems);
      
      console.log('✅ Invoice created successfully:', result.invoice.invoice_number);
      console.log('📦 Invoice items created:', result.items.length);

      // ✅ ENHANCED: Update local parts inventory to reflect changes immediately
      setAvailableParts(prev =>
        prev.map(p => {
          const sold = validItems.find(i => i.part_id === p.id);
          if (sold) {
            const newQuantity = Math.max(0, p.quantity - sold.quantity);
            console.log(`📉 Updated part ${p.name}: ${p.quantity} → ${newQuantity}`);
            return { ...p, quantity: newQuantity };
          }
          return p;
        })
      );

      toast({ 
        title: 'Success', 
        description: `Invoice ${result.invoice.invoice_number} generated successfully!`,
        variant: 'default'
      });
      return true;
      
    } catch (e) {
      console.error('❌ Save invoice error:', e);
      toast({ 
        title: 'Error', 
        description: `Failed to save invoice: ${String((e as any).message || e)}`, 
        variant: 'destructive' 
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [customerData, items, subtotal, total, date, status, paymentMethod, notes, user, validateItems, toast]);

  return {
    isLoading,
    isRefreshing,
    isSaving,
    availableParts,
    shopDetails,
    loadError,
    customerData,
    setCustomerData,
    items,
    date,
    setDate,
    status,
    setStatus,
    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes,
    errors,
    subtotal,
    total,
    isSaveDisabled,
    loadInitialData,
    onRefresh,
    updateItem,
    handleDiscountChange,
    handlePriceChange,
    onSelectPart,
    addItem,
    removeItem,
    handleSave,
    validateItems,
    STATUS_OPTIONS
  };
}





// import { useState, useCallback, useEffect, useRef } from 'react';
// import { format } from 'date-fns';
// import { Invoice, InvoiceItem, Part, InvoiceCustomer } from '../../../types';
// import { useToast } from '../../../hooks/use-toast';
// import { useAppSelector } from '../../../lib/redux/hooks';
// import { selectAuth } from '../../../lib/redux/slices/auth-slice';
// import { addInvoice } from '../../../services/invoice-service';
// import { getParts } from '../../../services/part-service';
// import { getShopDetails } from '../../../services/shop-service';

// export const STATUS_OPTIONS = ['Pending', 'Paid'] as const;
// type StatusOption = typeof STATUS_OPTIONS[number];
// type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer';
// type ItemError = { itemId: string; message: string };

// export default function useCreateInvoice() {
//   const { user } = useAppSelector(selectAuth);
//   const { toast } = useToast();
//   const mounted = useRef(true);
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [availableParts, setAvailableParts] = useState<Part[]>([]);
//   const [shopDetails, setShopDetails] = useState<any>(null);
//   const [loadError, setLoadError] = useState<string | null>(null); // ✅ ADD: Track loading errors
  
//   const [customerData, setCustomerData] = useState<InvoiceCustomer>({
//     name: '', phone: '', address: ''
//   });
  
//   const [items, setItems] = useState<(InvoiceItem & {
//     partId?: string;
//     purchasePrice: number;
//     isSpecialDiscount: boolean;
//   })[]>([{
//     id: `item-${Date.now()}`,
//     description: '',
//     quantity: 1,
//     price: 0,
//     partId: '',
//     purchasePrice: 0,
//     mrp: 0,
//     discount: 0,
//     isSpecialDiscount: false
//   }]);
  
//   const [date, setDate] = useState<Date>(new Date());
//   const [status, setStatus] = useState<StatusOption>('Pending');
//   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
//   const [notes, setNotes] = useState('');
//   const [errors, setErrors] = useState<ItemError[]>([]);

//   const subtotal = items.reduce((a, i) => a + (i.mrp || 0) * (i.quantity || 0), 0);
//   const total = items.reduce((a, i) => a + (i.price || 0) * (i.quantity || 0), 0);
//   const isSaveDisabled = isSaving || isLoading || errors.length > 0 || !customerData.name.trim();

//   // ✅ ENHANCED: Better data loading with detailed logging
//   const loadInitialData = useCallback(async (showLoading = true) => {
//     if (showLoading) setIsLoading(true);
//     setLoadError(null);
    
//     try {
//       console.log('🔄 Loading initial data...');
      
//       const [parts, details] = await Promise.all([
//         getParts(),
//         getShopDetails()
//       ]);
      
//       if (!mounted.current) return;

//       console.log('📦 Raw parts loaded:', parts.length);
//       console.log('📋 Sample parts:', parts.slice(0, 3).map(p => ({ 
//         id: p.id, 
//         name: p.name, 
//         status: p.status, 
//         quantity: p.quantity 
//       })));

//       const activeParts = parts.filter(p => p.status === 'active' && p.quantity > 0);
//       console.log('✅ Active parts with stock:', activeParts.length);

//       setAvailableParts(activeParts);
//       setShopDetails(details);
//       setNotes(`Thank you for choosing ${details?.name || 'VS Auto'}.`);
      
//       console.log('✅ Initial data loaded successfully');
      
//     } catch (error) {
//       console.error('❌ Failed to load initial data:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
//       setLoadError(errorMessage);
      
//       toast({ 
//         title: 'Error', 
//         description: errorMessage, 
//         variant: 'destructive' 
//       });
//     } finally {
//       if (showLoading) setIsLoading(false);
//     }
//   }, [toast]);

//   useEffect(() => {
//     loadInitialData();
//     return () => { mounted.current = false; };
//   }, [loadInitialData]);

//   // ✅ ADD: Debug effect to monitor parts changes
//   useEffect(() => {
//     console.log('📊 Available Parts Updated:', {
//       count: availableParts.length,
//       sample: availableParts.slice(0, 3).map(p => ({
//         id: p.id,
//         name: p.name,
//         partNumber: p.partNumber,
//         quantity: p.quantity,
//         sellingPrice: p.sellingPrice
//       }))
//     });
//   }, [availableParts]);

//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     await loadInitialData(false);
//     setIsRefreshing(false);
    
//     if (!loadError) {
//       toast({ title: 'Refreshed', description: 'Invoice data updated.' });
//     }
//   }, [loadInitialData, toast, loadError]);

//   const validateItems = useCallback((): ItemError[] => {
//     const errs: ItemError[] = [];
//     items.forEach(item => {
//       if (item.partId && item.mrp > 0) {
//         const min = item.purchasePrice + item.mrp * (item.isSpecialDiscount ? 0.05 : 0.1);
//         if (item.price < min) {
//           errs.push({ 
//             itemId: item.id, 
//             message: `Min price: ₹${min.toFixed(2)}` 
//           });
//         }
//       }
//     });
//     setErrors(errs);
//     return errs;
//   }, [items]);

//   const updateItem = useCallback((id: string, patch: Partial<typeof items[0]>) => {
//     setItems(list => list.map(i => (i.id === id ? { ...i, ...patch } : i)));
//   }, []);

//   const handleDiscountChange = useCallback((itemId: string, discount: number) => {
//     const item = items.find(i => i.id === itemId);
//     if (!item || item.mrp <= 0) return;
    
//     const d = Math.max(0, Math.min(100, discount));
//     const price = item.mrp * (1 - d / 100);
//     updateItem(itemId, { discount: d, price: Number(price.toFixed(2)) });
//   }, [items, updateItem]);

//   const handlePriceChange = useCallback((itemId: string, price: number) => {
//     const item = items.find(i => i.id === itemId);
//     if (!item || item.mrp <= 0) return updateItem(itemId, { price });
    
//     let d = 0;
//     if (price < item.mrp) d = ((item.mrp - price) / item.mrp) * 100;
//     updateItem(itemId, { 
//       price: Number(price.toFixed(2)), 
//       discount: Number(d.toFixed(2)) 
//     });
//   }, [items, updateItem]);

//   // ✅ ENHANCED: Better part selection with detailed logging
//   const onSelectPart = useCallback((itemId: string, part: Part) => {
//     console.log('🎯 Part selected:', {
//       itemId,
//       partId: part.id,
//       partName: part.name,
//       partNumber: part.partNumber,
//       mrp: part.mrp,
//       sellingPrice: part.sellingPrice,
//       purchasePrice: part.purchasePrice
//     });

//     const discount = part.mrp > 0 && part.sellingPrice > 0
//       ? Number((((part.mrp - part.sellingPrice) / part.mrp) * 100).toFixed(2))
//       : 0;

//     const updatedItem = {
//       description: `${part.name}${part.partNumber ? ` (${part.partNumber})` : ''}`,
//       price: part.sellingPrice,
//       purchasePrice: part.purchasePrice,
//       partId: part.id,
//       mrp: part.mrp,
//       discount,
//       quantity: 1,
//       isSpecialDiscount: false,
//     };

//     console.log('📝 Updating item with:', updatedItem);
//     updateItem(itemId, updatedItem);
//   }, [updateItem]);

//   const addItem = useCallback(() => {
//     setItems(prev => [
//       ...prev,
//       {
//         id: `item-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
//         description: '',
//         partId: '',
//         price: 0,
//         purchasePrice: 0,
//         mrp: 0,
//         discount: 0,
//         isSpecialDiscount: false,
//         quantity: 1,
//       }
//     ]);
//   }, []);

//   const removeItem = useCallback((id: string) => {
//     setItems(list => (list.length > 1 ? list.filter(item => item.id !== id) : list));
//   }, []);

//   const handleSave = useCallback(async () => {
//     if (!customerData.name.trim()) {
//       toast({ 
//         title: 'Validation Error', 
//         description: 'Enter customer name', 
//         variant: 'destructive' 
//       });
//       return false;
//     }

//     const validItems = items.filter(i => i.partId && i.description);
//     if (!validItems.length) {
//       toast({ 
//         title: 'Validation Error', 
//         description: 'Add at least one item', 
//         variant: 'destructive' 
//       });
//       return false;
//     }

//     if (validateItems().length) {
//       toast({ 
//         title: 'Price Validation Error', 
//         description: 'Check item prices', 
//         variant: 'destructive' 
//       });
//       return false;
//     }

//     setIsSaving(true);
//     try {
//       const currentUser = user?.name ?? 'Owner';
//       const invoice: Omit<Invoice, 'id' | 'lastModified'> = {
//         customer: customerData,
//         customerName: customerData.name,
//         items: validItems.map(({ id, partId, description, quantity, price, mrp, discount }) =>
//           ({ id, partId, description, quantity, price, mrp, discount })),
//         subtotal,
//         total,
//         date: format(date, 'yyyy-MM-dd'),
//         status,
//         paymentMethod,
//         notes,
//         generatedBy: currentUser,
//         ...(status === 'Paid'
//           ? { collectedBy: currentUser, paymentDate: format(new Date(), 'yyyy-MM-dd') }
//           : {})
//       };

//       const saved = await addInvoice(invoice);

//       // Update parts inventory
//       setAvailableParts(prev =>
//         prev.map(p => {
//           const sold = validItems.find(i => i.partId === p.id);
//           if (sold) {
//             const q = p.quantity - sold.quantity;
//             return { ...p, quantity: q, isLowStock: q < 10 };
//           }
//           return p;
//         })
//       );

//       toast({ title: 'Success', description: `Invoice ${saved.id} generated` });
//       return true;
      
//     } catch (e) {
//       console.error('❌ Save invoice error:', e);
//       toast({ 
//         title: 'Error', 
//         description: `Failed to save invoice: ${String((e as any).message || e)}`, 
//         variant: 'destructive' 
//       });
//       return false;
//     } finally {
//       setIsSaving(false);
//     }
//   }, [customerData, items, subtotal, total, date, status, paymentMethod, notes, user, validateItems, toast]);

//   return {
//     isLoading,
//     isRefreshing,
//     isSaving,
//     availableParts,
//     shopDetails,
//     loadError, // ✅ ADD: Expose load error
//     customerData,
//     setCustomerData,
//     items,
//     date,
//     setDate,
//     status,
//     setStatus,
//     paymentMethod,
//     setPaymentMethod,
//     notes,
//     setNotes,
//     errors,
//     subtotal,
//     total,
//     isSaveDisabled,
//     loadInitialData,
//     onRefresh,
//     updateItem,
//     handleDiscountChange,
//     handlePriceChange,
//     onSelectPart,
//     addItem,
//     removeItem,
//     handleSave,
//     validateItems,
//     STATUS_OPTIONS
//   };
// }








// // import { useState, useCallback, useEffect, useRef } from 'react';
// // import { format } from 'date-fns';
// // import { Invoice, InvoiceItem, Part, InvoiceCustomer } from '../../../types';
// // import { useToast } from '../../../hooks/use-toast';
// // import { useAppSelector } from '../../../lib/redux/hooks';
// // import { selectAuth } from '../../../lib/redux/slices/auth-slice';
// // import { addInvoice } from '../../../services/invoice-service';
// // import { getParts } from '../../../services/part-service';
// // import { getShopDetails } from '../../../services/shop-service';

// // export const STATUS_OPTIONS = ['Pending', 'Paid'] as const;
// // type StatusOption = typeof STATUS_OPTIONS[number];
// // type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer';
// // type ItemError = { itemId: string; message: string };

// // export default function useCreateInvoice() {
// //   const { user } = useAppSelector(selectAuth);
// //   const { toast } = useToast();
// //   const mounted = useRef(true);

// //   const [isLoading, setIsLoading] = useState(true);
// //   const [isRefreshing, setIsRefreshing] = useState(false);
// //   const [isSaving, setIsSaving] = useState(false);

// //   const [availableParts, setAvailableParts] = useState<Part[]>([]);
// //   const [shopDetails, setShopDetails] = useState<any>(null);

// //   const [customerData, setCustomerData] = useState<InvoiceCustomer>({
// //     name: '', phone: '', address: ''
// //   });

// //   const [items, setItems] = useState<(InvoiceItem & {
// //     partId?: string;
// //     purchasePrice: number;
// //     isSpecialDiscount: boolean;
// //   })[]>([{
// //     id: `item-${Date.now()}`,
// //     description: '',
// //     quantity: 1,
// //     price: 0,
// //     partId: '',
// //     purchasePrice: 0,
// //     mrp: 0,
// //     discount: 0,
// //     isSpecialDiscount: false
// //   }]);

// //   const [date, setDate] = useState<Date>(new Date());
// //   const [status, setStatus] = useState<StatusOption>('Pending');
// //   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
// //   const [notes, setNotes] = useState('');
// //   const [errors, setErrors] = useState<ItemError[]>([]);

// //   const subtotal = items.reduce((a, i) => a + (i.mrp || 0) * (i.quantity || 0), 0);
// //   const total = items.reduce((a, i) => a + (i.price || 0) * (i.quantity || 0), 0);
// //   const isSaveDisabled = isSaving || isLoading || errors.length > 0 || !customerData.name.trim();

// //   const loadInitialData = useCallback(async (showLoading = true) => {
// //     if (showLoading) setIsLoading(true);
// //     try {
// //       const [parts, details] = await Promise.all([getParts(), getShopDetails()]);
// //       if (!mounted.current) return;
// //       setAvailableParts(parts.filter(p => p.status === 'active' && p.quantity > 0));
// //       setShopDetails(details);
// //       setNotes(`Thank you for choosing ${details?.name || 'VS Auto'}.`);
// //     } catch {
// //       toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
// //     } finally {
// //       if (showLoading) setIsLoading(false);
// //     }
// //   }, [toast]);

// //   useEffect(() => {
// //     loadInitialData();
// //     return () => { mounted.current = false; };
// //   }, [loadInitialData]);

// //   const onRefresh = useCallback(async () => {
// //     setIsRefreshing(true);
// //     await loadInitialData(false);
// //     setIsRefreshing(false);
// //     toast({ title: 'Refreshed', description: 'Invoice data updated.' });
// //   }, [loadInitialData, toast]);

// //   const validateItems = useCallback((): ItemError[] => {
// //     const errs: ItemError[] = [];
// //     items.forEach(item => {
// //       if (item.partId && item.mrp > 0) {
// //         const min = item.purchasePrice + item.mrp * (item.isSpecialDiscount ? 0.05 : 0.1);
// //         if (item.price < min) errs.push({ itemId: item.id, message: `Min price: ₹${min.toFixed(2)}` });
// //       }
// //     });
// //     setErrors(errs);
// //     return errs;
// //   }, [items]);

// //   const updateItem = useCallback((id: string, patch: Partial<typeof items[0]>) => {
// //     setItems(list => list.map(i => (i.id === id ? { ...i, ...patch } : i)));
// //   }, []);

// //   const handleDiscountChange = useCallback((itemId: string, discount: number) => {
// //     const item = items.find(i => i.id === itemId);
// //     if (!item || item.mrp <= 0) return;
// //     const d = Math.max(0, Math.min(100, discount));
// //     const price = item.mrp * (1 - d / 100);
// //     updateItem(itemId, { discount: d, price: Number(price.toFixed(2)) });
// //   }, [items, updateItem]);

// //   const handlePriceChange = useCallback((itemId: string, price: number) => {
// //     const item = items.find(i => i.id === itemId);
// //     if (!item || item.mrp <= 0) return updateItem(itemId, { price });
// //     let d = 0;
// //     if (price < item.mrp) d = ((item.mrp - price) / item.mrp) * 100;
// //     updateItem(itemId, { price: Number(price.toFixed(2)), discount: Number(d.toFixed(2)) });
// //   }, [items, updateItem]);

// //   const onSelectPart = useCallback((itemId: string, part: Part) => {
// //     const discount =
// //       part.mrp > 0 && part.sellingPrice > 0
// //         ? Number((((part.mrp - part.sellingPrice) / part.mrp) * 100).toFixed(2))
// //         : 0;
// //     updateItem(itemId, {
// //       description: `${part.name} (${part.partNumber})`,
// //       price: part.sellingPrice,
// //       purchasePrice: part.purchasePrice,
// //       partId: part.id,
// //       mrp: part.mrp,
// //       discount,
// //       quantity: 1,
// //       isSpecialDiscount: false,
// //     });
// //   }, [updateItem]);

// //   const addItem = useCallback(() => {
// //     setItems(prev => [
// //       ...prev,
// //       {
// //         ...prev[0],
// //         id: `item-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
// //         description: '',
// //         partId: '',
// //         price: 0,
// //         purchasePrice: 0,
// //         mrp: 0,
// //         discount: 0,
// //         isSpecialDiscount: false,
// //         quantity: 1,
// //       }
// //     ]);
// //   }, []);

// //   const removeItem = useCallback((id: string) => {
// //     setItems(list => (list.length > 1 ? list.filter(item => item.id !== id) : list));
// //   }, []);

// //   const handleSave = useCallback(async () => {
// //     if (!customerData.name.trim()) {
// //       toast({ title: 'Validation Error', description: 'Enter customer name', variant: 'destructive' });
// //       return false;
// //     }
// //     const validItems = items.filter(i => i.partId && i.description);
// //     if (!validItems.length) {
// //       toast({ title: 'Validation Error', description: 'Add at least one item', variant: 'destructive' });
// //       return false;
// //     }
// //     if (validateItems().length) {
// //       toast({ title: 'Price Validation Error', description: 'Check item prices', variant: 'destructive' });
// //       return false;
// //     }
// //     setIsSaving(true);
// //     try {
// //       const currentUser = user?.name ?? 'Owner';
// //       const invoice: Omit<Invoice, 'id' | 'lastModified'> = {
// //         customer: customerData,
// //         customerName: customerData.name,
// //         items: validItems.map(({ id, partId, description, quantity, price, mrp, discount }) =>
// //           ({ id, partId, description, quantity, price, mrp, discount })),
// //         subtotal,
// //         total,
// //         date: format(date, 'yyyy-MM-dd'),
// //         status,
// //         paymentMethod,
// //         notes,
// //         generatedBy: currentUser,
// //         ...(status === 'Paid'
// //           ? { collectedBy: currentUser, paymentDate: format(new Date(), 'yyyy-MM-dd') }
// //           : {})
// //       };
// //       const saved = await addInvoice(invoice);
// //       setAvailableParts(prev =>
// //         prev.map(p => {
// //           const sold = validItems.find(i => i.partId === p.id);
// //           if (sold) {
// //             const q = p.quantity - sold.quantity;
// //             return { ...p, quantity: q, isLowStock: q < 10 };
// //           }
// //           return p;
// //         })
// //       );
// //       toast({ title: 'Success', description: `Invoice ${saved.id} generated` });
// //       return true;
// //     } catch (e) {
// //       toast({ title: 'Error', description: `Failed to save invoice: ${String((e as any).message || e)}`, variant: 'destructive' });
// //       return false;
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   }, [customerData, items, subtotal, total, date, status, paymentMethod, notes, user, validateItems, toast]);

// //   return {
// //     isLoading,
// //     isRefreshing,
// //     isSaving,
// //     availableParts,
// //     shopDetails,
// //     customerData,
// //     setCustomerData,
// //     items,
// //     date,
// //     setDate,
// //     status,
// //     setStatus, // now correctly typed for "Pending" | "Paid"
// //     paymentMethod,
// //     setPaymentMethod,
// //     notes,
// //     setNotes,
// //     errors,
// //     subtotal,
// //     total,
// //     isSaveDisabled,
// //     loadInitialData,
// //     onRefresh,
// //     updateItem,
// //     handleDiscountChange,
// //     handlePriceChange,
// //     onSelectPart,
// //     addItem,
// //     removeItem,
// //     handleSave,
// //     validateItems,
// //     STATUS_OPTIONS
// //   };
// // }
