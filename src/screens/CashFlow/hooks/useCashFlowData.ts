// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { useToast } from '../../../hooks/use-toast';
// import { combineTransactions, type CombinedTransaction } from '../utils/helpers';
// import type { Transaction, Invoice, StockPurchase, SupplierEmbedded } from '../../../types/database';
// import { invoiceService } from '../../../services/invoice-service';
// import { stockPurchaseService } from '../../../services/stock-service';
// import { transactionService } from '../../../services/transaction-service';

// const dataCache = {
//   invoices: null as Invoice[] | null,
//   stockPurchases: null as StockPurchase[] | null,
//   transactions: null as Transaction[] | null,
//   lastFetch: 0,
//   CACHE_DURATION: 2 * 60 * 1000,
// };

// export function useCashFlowData() {
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [stockPurchases, setStockPurchases] = useState<StockPurchase[]>([]);
//   const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [lastFetch, setLastFetch] = useState(0);
//   const mountedRef = useRef(true);
//   const { toast } = useToast();

//   // ✅ CRITICAL FIX: Remove changing dependencies that cause infinite loop
//   const fetchData = useCallback(async (forceRefresh = false, showLoading = true) => {
//     const now = Date.now();
//     const isCacheValid = !forceRefresh && now - dataCache.lastFetch < dataCache.CACHE_DURATION;

//     if (isCacheValid && dataCache.invoices && dataCache.stockPurchases && dataCache.transactions) {
//       if (mountedRef.current) {
//         setInvoices(dataCache.invoices);
//         setStockPurchases(dataCache.stockPurchases);
//         setManualTransactions(dataCache.transactions.filter((t) => t.category !== 'Stock Purchase'));
//         setError(null);
//         setLastFetch(dataCache.lastFetch);
//         if (showLoading) setIsLoading(false); // ✅ CRITICAL FIX: Set loading to false
//       }
//       return;
//     }

//     if (showLoading) {
//       setIsLoading(true);
//       setError(null);
//     }

//     try {
//       console.log('📊 [CashFlowData] Fetching data...');
      
//       const [invRes, spRes, txRes] = await Promise.allSettled([
//         invoiceService.findAll(),
//         stockPurchaseService.findAll(),
//         transactionService.findAll(),
//       ]);

//       const fetchedInvoices: Invoice[] = invRes.status === 'fulfilled' ? invRes.value : [];
//       const fetchedStockPurchases: StockPurchase[] = spRes.status === 'fulfilled' ? spRes.value : [];
//       const fetchedTransactions: Transaction[] = txRes.status === 'fulfilled' ? txRes.value : [];

//       console.log('📊 [CashFlowData] Fetched counts:', {
//         invoices: fetchedInvoices.length,
//         stockPurchases: fetchedStockPurchases.length,
//         transactions: fetchedTransactions.length,
//       });

//       // Ensure supplier object is fully formed with correct typing
//       const validatedStockPurchases: StockPurchase[] = fetchedStockPurchases.map((sp) => {
//         if (!sp?.supplier || !sp.supplier?.name) {
//           const supplierObj: SupplierEmbedded = {
//             id: sp.supplier?.id || sp.supplier_id || 'unknown',
//             name: sp.supplier?.name || 'Unknown Supplier',
//             contact_person: sp.supplier?.contact_person,
//             address: sp.supplier?.address,
//             phone: sp.supplier?.phone,
//             email: sp.supplier?.email,
//             status: 'active',
//           };
//           return { ...sp, supplier: supplierObj };
//         }
//         return sp;
//       });

//       // update cache
//       dataCache.invoices = fetchedInvoices;
//       dataCache.stockPurchases = validatedStockPurchases;
//       dataCache.transactions = fetchedTransactions;
//       dataCache.lastFetch = now;

//       if (mountedRef.current) {
//         setInvoices(fetchedInvoices);
//         setStockPurchases(validatedStockPurchases);
//         setManualTransactions(fetchedTransactions.filter((t) => t.category !== 'Stock Purchase'));
//         setError(null);
//         setLastFetch(now);
//       }
//     } catch (err: any) {
//       console.error('[CashFlowData] Error:', err);
//       if (mountedRef.current) {
//         setError(err?.message || 'Failed to fetch financial data');
//         if (!invoices.length && !stockPurchases.length && !manualTransactions.length) {
//           toast({
//             title: 'Error',
//             description: err?.message || 'Failed to fetch financial data',
//             variant: 'destructive',
//           });
//         }
//       }
//     } finally {
//       // ✅ CRITICAL FIX: Always set loading to false when done
//       if (showLoading && mountedRef.current) {
//         setIsLoading(false);
//       }
//     }
//   }, [toast]); // ✅ CRITICAL FIX: Only depend on toast, not changing array lengths

//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     try {
//       dataCache.lastFetch = 0;
//       await fetchData(true, false);
//       toast({
//         title: 'Refreshed',
//         description: 'Financial data updated successfully.',
//         variant: 'default',
//       });
//     } finally {
//       setIsRefreshing(false);
//     }
//   }, [fetchData, toast]);

//   const invalidateCache = useCallback(() => {
//     dataCache.invoices = null;
//     dataCache.stockPurchases = null;
//     dataCache.transactions = null;
//     dataCache.lastFetch = 0;
//   }, []);

//   // ✅ CRITICAL FIX: Only run once on mount
//   useEffect(() => {
//     fetchData(true, true);
//     return () => {
//       mountedRef.current = false;
//     };
//   }, []); // ✅ CRITICAL FIX: Empty dependency array to run only once

//   const combinedTransactions = useMemo(
//     () => combineTransactions(invoices, stockPurchases, manualTransactions),
//     [invoices, stockPurchases, manualTransactions]
//   );

//   return {
//     invoices,
//     stockPurchases,
//     manualTransactions,
//     combinedTransactions,
//     isLoading,
//     isRefreshing,
//     error,
//     lastFetch,
//     onRefresh,
//     refetch: fetchData,
//     invalidateCache,
//   };
// }