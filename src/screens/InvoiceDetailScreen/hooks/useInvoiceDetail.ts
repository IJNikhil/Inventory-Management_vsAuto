import { useState, useCallback } from 'react';
import { differenceInDays } from 'date-fns';
import type { Invoice, InvoiceCustomer, ShopSettings, InvoiceItem } from '../../../types/database';
import { invoiceService } from '../../../services/invoice-service';
import { shopSettingsService } from '../../../services/shop-service';

const OVERDUE_DAYS = 15;

export function getDisplayStatus(invoice: Invoice): Invoice['status'] | 'overdue' {
  if (invoice.status === 'sent' || invoice.status === 'draft') {
    const daysDiff = differenceInDays(new Date(), new Date(invoice.invoice_date));
    if (daysDiff > OVERDUE_DAYS) {
      return 'overdue';
    }
  }
  return invoice.status;
}

export function useInvoiceDetail(invoiceId: string | null, toast: (opts: any) => void, navigation: any) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [shopDetails, setShopDetails] = useState<ShopSettings | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]); // ✅ ADDED: State for invoice items
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadInvoiceData = useCallback(async (showLoading = true): Promise<void> => {
    if (!invoiceId) {
      console.warn('[useInvoiceDetail] No invoice ID provided');
      if (showLoading) setIsLoading(false);
      return;
    }
    
    if (showLoading) setIsLoading(true);

    try {
      console.log('[useInvoiceDetail] Loading invoice data for ID:', invoiceId);

      const [fetchedInvoiceWithItems, fetchedShopSettings] = await Promise.all([
        invoiceService.findWithItems(invoiceId), // ✅ CHANGED: Use findWithItems instead of findById
        shopSettingsService.getOrCreateDefault(),
      ]);

      console.log('[useInvoiceDetail] Fetched invoice with items:', fetchedInvoiceWithItems);
      console.log('[useInvoiceDetail] Fetched shop settings:', fetchedShopSettings);

      if (fetchedInvoiceWithItems?.invoice) {
        const fetchedInvoice = fetchedInvoiceWithItems.invoice;
        const fetchedItems = fetchedInvoiceWithItems.items || [];

        // ✅ ENHANCED: Ensure customer data is properly formatted
        const processedInvoice: Invoice = {
          ...fetchedInvoice,
          customer: {
            name: fetchedInvoice.customer?.name || 'Unknown Customer',
            phone: fetchedInvoice.customer?.phone || '',
            email: fetchedInvoice.customer?.email || '',
            address: fetchedInvoice.customer?.address || ''
          }
        };

        setInvoice(processedInvoice);
        setInvoiceItems(fetchedItems); // ✅ ADDED: Set invoice items
        
        // ✅ ENHANCED: Ensure shop settings have default values
        const safeShopSettings: ShopSettings = {
          id: fetchedShopSettings?.id || 'main',
          shop_name: fetchedShopSettings?.shop_name || 'VS Auto',
          address: fetchedShopSettings?.address || 'Auto Parts Store',
          phone: fetchedShopSettings?.phone || '',
          email: fetchedShopSettings?.email || '',
          logo: fetchedShopSettings?.logo || '',
          tax_number: fetchedShopSettings?.tax_number || '',
          currency: fetchedShopSettings?.currency || 'INR',
          created_at: fetchedShopSettings?.created_at || new Date().toISOString(),
          updated_at: fetchedShopSettings?.updated_at || new Date().toISOString(),
          version: fetchedShopSettings?.version || 1
        };
        
        setShopDetails(safeShopSettings);

        console.log('📋 Items loaded:', fetchedItems.length);
      } else {
        console.error('[useInvoiceDetail] Invoice not found for ID:', invoiceId);
        toast({ 
          title: 'Invoice Not Found', 
          description: 'The requested invoice could not be found.', 
          variant: 'destructive' 
        });
        
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('MainApp', { screen: 'Invoices' });
        }
      }
    } catch (error) {
      console.error('[useInvoiceDetail] Error loading invoice data:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch invoice details.', 
        variant: 'destructive' 
      });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [invoiceId, navigation, toast]);

  const onRefresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      await loadInvoiceData(false);
      toast({ 
        title: 'Refreshed', 
        description: 'Invoice data updated successfully.' 
      });
    } catch (error) {
      console.error('[useInvoiceDetail] Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadInvoiceData, toast]);

  return {
    invoice,
    shopDetails,
    invoiceItems, // ✅ ADDED: Return invoice items
    isLoading,
    isRefreshing,
    loadInvoiceData,
    onRefresh,
  };
}



// import { useState, useCallback } from 'react';
// import { differenceInDays } from 'date-fns';
// import { Invoice, InvoiceCustomer, ShopDetails } from '../../../types';
// import { getInvoiceById } from '../../../services/invoice-service';
// import { getShopDetails } from '../../../services/shop-service';

// const OVERDUE_DAYS = 15;

// export function getDisplayStatus(invoice: Invoice): Invoice['status'] | 'Overdue' {
//   if (invoice.status === 'Pending') {
//     const daysDiff = differenceInDays(new Date(), new Date(invoice.date));
//     if (daysDiff > OVERDUE_DAYS) {
//       return 'Overdue';
//     }
//   }
//   return invoice.status;
// }

// export function useInvoiceDetail(invoiceId: string | null, toast: (opts: any) => void, navigation: any) {
//   const [invoice, setInvoice] = useState<Invoice | null>(null);
//   const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const loadInvoiceData = useCallback(async (showLoading = true): Promise<void> => {
//     if (!invoiceId) {
//       console.warn('[useInvoiceDetail] No invoice ID provided');
//       if (showLoading) setIsLoading(false);
//       return;
//     }
    
//     if (showLoading) setIsLoading(true);

//     try {
//       console.log('[useInvoiceDetail] Loading invoice data for ID:', invoiceId);

//       const [fetchedInvoice, fetchedShopDetails] = await Promise.all([
//         getInvoiceById(invoiceId),
//         getShopDetails(),
//       ]);

//       console.log('[useInvoiceDetail] Fetched invoice:', fetchedInvoice);
//       console.log('[useInvoiceDetail] Fetched shop details:', fetchedShopDetails);

//       if (fetchedInvoice) {
//         let processedInvoice = fetchedInvoice;
        
//         // Handle backward compatibility - convert old structure to new
//         if ((fetchedInvoice as any).customerId && !fetchedInvoice.customer) {
//           console.log('[useInvoiceDetail] Converting old invoice structure to new format');
          
//           const embeddedCustomer: InvoiceCustomer = {
//             name: fetchedInvoice.customerName || 'Unknown Customer',
//             phone: undefined,
//             address: undefined,
//           };
          
//           processedInvoice = {
//             ...fetchedInvoice,
//             customer: embeddedCustomer,
//           } as Invoice;
          
//           console.log('[useInvoiceDetail] Converted invoice to new format');
//         } else if (!fetchedInvoice.customer) {
//           console.warn('[useInvoiceDetail] Invoice missing customer data, creating fallback');
          
//           const fallbackCustomer: InvoiceCustomer = {
//             name: fetchedInvoice.customerName || 'Unknown Customer',
//             phone: undefined,
//             address: undefined,
//           };
          
//           processedInvoice = {
//             ...fetchedInvoice,
//             customer: fallbackCustomer,
//           } as Invoice;
//         }

//         setInvoice(processedInvoice);
//         setShopDetails(fetchedShopDetails);
//       } else {
//         console.error('[useInvoiceDetail] Invoice not found for ID:', invoiceId);
//         toast({ 
//           title: 'Invoice Not Found', 
//           description: 'The requested invoice could not be found.', 
//           variant: 'destructive' 
//         });
        
//         if (navigation.canGoBack()) {
//           navigation.goBack();
//         } else {
//           navigation.navigate('MainApp', { screen: 'Invoices' });
//         }
//       }
//     } catch (error) {
//       console.error('[useInvoiceDetail] Error loading invoice data:', error);
//       toast({ 
//         title: 'Error', 
//         description: 'Failed to fetch invoice details.', 
//         variant: 'destructive' 
//       });
//     } finally {
//       if (showLoading) setIsLoading(false);
//     }
//   }, [invoiceId, navigation, toast]);

//   const onRefresh = useCallback(async (): Promise<void> => {
//     setIsRefreshing(true);
//     try {
//       await loadInvoiceData(false);
//       toast({ 
//         title: 'Refreshed', 
//         description: 'Invoice data updated successfully.' 
//       });
//     } catch (error) {
//       console.error('[useInvoiceDetail] Error refreshing:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   }, [loadInvoiceData, toast]);

//   return {
//     invoice,
//     shopDetails,
//     isLoading,
//     isRefreshing,
//     loadInvoiceData,
//     onRefresh,
//   };
// }
