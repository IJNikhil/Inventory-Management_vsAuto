// src/screens/AddStock/hooks/useStockPurchase.ts
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { useToast } from '../../../hooks/use-toast';
import { stockPurchaseService } from '../../../services/stock-service';
import type { StockPurchase, StockPurchaseItemCreate, SupplierEmbedded } from '../../../types/database';

type StockPurchaseForm = {
  supplier: SupplierEmbedded;
  items: StockPurchaseItemCreate[];
  total: number;
  formData: {
    date: Date;
    status: 'Pending' | 'Paid';
    payment_method: 'Cash' | 'UPI' | 'Bank Transfer';
    notes?: string;
  };
  user: string;
};

export function useStockPurchase() {
  const [isSaving, setIsSaving] = useState(false);
  const { show } = useToast();

  const validateForm = useCallback((data: StockPurchaseForm): string[] => {
    const errors: string[] = [];
    
    if (!data.supplier?.id) errors.push('Supplier is required');
    if (!data.items.length) errors.push('At least one item is required');
    
    data.items.forEach(({ name, quantity, purchase_price }, i) => {
      if (!name?.trim()) errors.push(`Item ${i + 1}: Name required`);
      if (quantity <= 0) errors.push(`Item ${i + 1}: Quantity must be greater than 0`);
      if (purchase_price <= 0) errors.push(`Item ${i + 1}: Price must be greater than 0`);
    });
    
    if (data.total <= 0) errors.push('Total must be greater than 0');
    if (!data.user.trim()) errors.push('User is required');
    
    return errors;
  }, []);

  const handleSubmit = useCallback(
    async (data: StockPurchaseForm): Promise<boolean> => {
      const errors = validateForm(data);
      if (errors.length) {
        show({ 
          title: 'Validation Error', 
          description: errors.join(', '), 
          variant: 'destructive' 
        });
        return false;
      }

      setIsSaving(true);
      try {
        // ✅ FIXED: Use createWithItems method
        const result = await stockPurchaseService.createWithItems({
          purchase_number: `PUR-${Date.now()}`,
          supplier_id: data.supplier.id,
          supplier: data.supplier,
          subtotal: data.total,
          tax_amount: 0,
          total: Math.round(data.total * 100) / 100,
          purchase_date: format(data.formData.date, 'yyyy-MM-dd'),
          status: data.formData.status,
          payment_method: data.formData.payment_method,
          notes: data.formData.notes?.trim() || '',
          created_by: data.user.trim(),
          ...(data.formData.status === 'Paid' && {
            payment_date: format(new Date(), 'yyyy-MM-dd'),
          }),
        }, data.items);
        
        if (result) {
          show({ 
            title: 'Stock Purchase Saved', 
            description: `Purchase saved successfully`, 
            variant: 'default' 
          });
          return true;
        }
        return false;
      } catch (err) {
        console.error('Stock purchase save error:', err);
        show({ 
          title: 'Save Failed', 
          description: 'Failed to save stock purchase', 
          variant: 'destructive' 
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [show, validateForm]
  );

  return { 
    handleSubmit, 
    isSaving,
  };
}



// import { useState, useCallback } from 'react'
// import { format } from 'date-fns'
// import { useToast } from '../../../hooks/use-toast'
// import { Alert } from 'react-native'
// import { addStockPurchase } from '../../../services/stock-service'
// import type { StockPurchase, StockPurchaseItem } from '../../../types'

// // ❌ REMOVED: useNetworkState, uploadReceipt, complex upload logic

// type StockPurchaseForm = {
//   supplier: StockPurchase['supplier']
//   items: StockPurchaseItem[]
//   total: number
//   formData: {
//     date: Date
//     status: 'Paid' | 'Pending'
//     paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer'
//     notes?: string
//   }
//   // ❌ REMOVED: receiptData - No image upload for local-only
//   user: string
// }

// export function useStockPurchase() {
//   const [isSaving, setIsSaving] = useState(false)
//   const { show } = useToast()

//   // ❌ REMOVED: uploadProgress, upload retry logic, network checks

//   // ✅ SIMPLIFIED: Basic form validation
//   const validateForm = useCallback((data: StockPurchaseForm): string[] => {
//     const errors: string[] = []
    
//     if (!data.supplier?.id) errors.push('Supplier is required')
//     if (!data.items.length) errors.push('At least one item is required')
    
//     data.items.forEach(({ name, quantity, purchasePrice }, i) => {
//       if (!name?.trim()) errors.push(`Item ${i + 1}: Name required`)
//       if (quantity <= 0) errors.push(`Item ${i + 1}: Quantity must be greater than 0`)
//       if (purchasePrice <= 0) errors.push(`Item ${i + 1}: Price must be greater than 0`)
//     })
    
//     if (data.total <= 0) errors.push('Total must be greater than 0')
//     if (!data.user.trim()) errors.push('User is required')
    
//     return errors
//   }, [])

//   // ✅ SIMPLIFIED: Local-only submission
//   const handleSubmit = useCallback(
//     async (data: StockPurchaseForm): Promise<boolean> => {
//       const errors = validateForm(data)
//       if (errors.length) {
//         show({ 
//           title: 'Validation Error', 
//           description: errors.join(', '), 
//           variant: 'destructive' 
//         })
//         return false
//       }

//       setIsSaving(true)

//       try {
//         // ✅ SIMPLIFIED: Create purchase object without receipt upload
//         const newPurchase: Omit<StockPurchase, 'id' | 'lastModified'> = {
//           supplier: {
//             id: data.supplier.id,
//             name: data.supplier.name,
//             address: data.supplier.address,
//             phone: data.supplier.phone,
//           },
//           supplierId: data.supplier.id,
//           items: data.items.map(i => ({ 
//             ...i, 
//             id: i.id || `item-${Date.now()}` 
//           })),
//           total: Math.round(data.total * 100) / 100,
//           date: format(data.formData.date, 'yyyy-MM-dd'),
//           status: data.formData.status,
//           paymentMethod: data.formData.paymentMethod,
//           notes: data.formData.notes?.trim() || '',
//           createdBy: data.user.trim(),
//           ...(data.formData.status === 'Paid' && {
//             paidBy: data.user.trim(),
//             paymentDate: format(new Date(), 'yyyy-MM-dd'),
//           }),
//           // ❌ REMOVED: receiptUrl - No image upload
//         }

//         // ✅ SIMPLIFIED: Direct local database save
//         const itemsAdded = data.items.map(i => ({ 
//           partId: i.partId || i.id, 
//           quantity: i.quantity 
//         }))

//         const savedPurchase = await addStockPurchase(newPurchase, itemsAdded)
        
//         if (savedPurchase) {
//           show({ 
//             title: 'Stock Purchase Saved', 
//             description: `Purchase saved successfully`, 
//             variant: 'default' 
//           })
//           return true
//         }
//         return false

//       } catch (err) {
//         console.error('Stock purchase save error:', err)
//         show({ 
//           title: 'Save Failed', 
//           description: 'Failed to save stock purchase', 
//           variant: 'destructive' 
//         })
//         return false
//       } finally {
//         setIsSaving(false)
//       }
//     },
//     [show, validateForm]
//   )

//   return { 
//     handleSubmit, 
//     isSaving,
//     // ❌ REMOVED: uploadProgress, isOnline - Not needed for local-only
//   }
// }
