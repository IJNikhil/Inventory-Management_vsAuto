// src/hooks/useDashboardData.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import type { Invoice, InvoiceItem, Part, Transaction } from '../../../types/database';
import { executeQuery } from '../../../lib/database/connection';
import { format, startOfMonth, startOfWeek } from 'date-fns';

export type TopSellingItem = { part: Part; quantity: number };

export interface DashboardData {
  todayRevenue: number;
  todayProfit: number;
  todayInvoiceCount: number;
  weekRevenue: number;
  weekProfit: number;
  monthRevenue: number;
  monthProfit: number;
  monthInvoiceCount: number;
  totalItems: number;
  overdueInvoices: Invoice[];
  outStock: Part[];
  lowStock: Part[];
  topSellingWeekly: TopSellingItem[];
  recentSales: Invoice[];
  recentExpenses: Transaction[];
  pendingPayables: Transaction[];
  todayGrowth: number;
  monthGrowth: number;
  totalItemsGrowth: number;
}

// Helper functions
const safeNum = (n: unknown): number => (typeof n === 'number' && !isNaN(n) ? n : 0);
const safeJsonParse = <T>(input: unknown, fallback: T): T => {
  if (!input) return fallback;
  if (typeof input === 'object') return input as T;
  if (typeof input !== 'string') return fallback;
  try { return JSON.parse(input) ?? fallback; } catch { return fallback; }
};

// ✅ ENHANCED: Better profit calculation with debugging
const calculateProfit = (invoiceItems: InvoiceItem[], parts: Part[]): number => {
  console.log('🧮 Calculating profit:', { 
    invoiceItemsCount: invoiceItems.length, 
    partsCount: parts.length,
    sampleItems: invoiceItems.slice(0, 2),
    sampleParts: parts.slice(0, 2)
  });

  const partMap = new Map(parts.map(p => [p.id, p]));
  
  const totalProfit = invoiceItems.reduce((profit, item) => {
    const part = partMap.get(item.part_id || '');
    
    if (!part) {
      console.log('⚠️ Part not found for item:', item.part_id);
      return profit;
    }
    
    const sale = safeNum(item.unit_price);
    const cost = safeNum(part.purchase_price);
    const qty = safeNum(item.quantity);
    
    const itemProfit = sale > 0 && qty > 0 ? (sale - cost) * qty : 0;
    
    if (itemProfit > 0) {
      console.log('💰 Profit item:', {
        partName: part.name,
        sale,
        cost,
        qty,
        itemProfit
      });
    }
    
    return profit + itemProfit;
  }, 0);
  
  console.log('💰 Total profit calculated:', totalProfit);
  return totalProfit;
};

// ✅ UPDATED: Process invoices for normalized schema
const processInvoices = (raw: any[]): Invoice[] =>
  raw.map(inv => ({
    ...inv,
    customer_name: inv.customer || inv.customer_name || 'Unknown',
    customer_phone: inv.customer_phone || '',
    customer_address: inv.customer_address || '',
    subtotal: safeNum(inv.subtotal),
    total: safeNum(inv.total),
    invoice_date: inv.invoice_date || format(new Date(), 'yyyy-MM-dd'),
    created_at: inv.created_at || new Date().toISOString(),
    updated_at: inv.updated_at || new Date().toISOString(),
    version: inv.version || 1,
    invoice_number: inv.invoice_number || `INV-${Date.now()}`,
    generated_by: inv.generated_by || 'system'
  }));

// ✅ ENHANCED: Better invoice items processing with debugging
const processInvoiceItems = (raw: any[]): InvoiceItem[] => {
  console.log('📋 Processing invoice items:', { count: raw.length, sample: raw.slice(0, 2) });
  
  return raw.map(item => ({
    ...item,
    part_id: item.part_id,
    unit_price: safeNum(item.unit_price),
    quantity: safeNum(item.quantity),
    invoice_id: item.invoice_id,
    description: item.description || '',
    discount_percentage: safeNum(item.discount_percentage),
    tax_percentage: safeNum(item.tax_percentage),
    line_total: safeNum(item.line_total || (safeNum(item.unit_price) * safeNum(item.quantity))),
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    version: item.version || 1
  }));
};

const processParts = (raw: any[]): Part[] =>
  raw.map(part => ({
    ...part,
    part_number: part.part_number || '',
    purchase_price: safeNum(part.purchase_price),
    selling_price: safeNum(part.selling_price),
    mrp: safeNum(part.mrp),
    quantity: safeNum(part.quantity),
    min_stock_level: safeNum(part.min_stock_level || 5),
    supplier_id: part.supplier_id,
    category_id: part.category_id,
    status: part.status || 'active',
    created_at: part.created_at || new Date().toISOString(),
    updated_at: part.updated_at || new Date().toISOString(),
    version: part.version || 1
  }));

const calcGrowth = (current: number, previous: number): number =>
  previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

const withinDateRange = (dateStr: string, fromDate: Date): boolean => {
  try { return new Date(dateStr) >= fromDate; } catch { return false; }
};

export default function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState(0);
  const lastFetchRef = useRef(0);
  const fetchingRef = useRef(false);
  const MIN_FETCH_INTERVAL = 3000;

  // ✅ SIMPLIFIED: Use executeQuery from your database connection
  const query = useCallback(async <T>(sql: string, params: any[] = []): Promise<T[]> => {
    try {
      return await executeQuery<T>(sql, params);
    } catch (error) {
      console.error('Dashboard query error:', { sql, params, error });
      throw error;
    }
  }, []);

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now();
    if (fetchingRef.current || (!force && now - lastFetchRef.current < MIN_FETCH_INTERVAL)) return;
    
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching dashboard data...');
      
      // ✅ FIXED: Query the normalized schema tables
      const [invoicesRaw, invoiceItemsRaw, transactionsRaw, partsRaw] = await Promise.all([
        query<any>('SELECT * FROM invoices ORDER BY invoice_date DESC'),
        query<any>('SELECT * FROM invoice_items ORDER BY created_at DESC'),
        query<any>('SELECT * FROM transactions ORDER BY transaction_date DESC'),
        query<any>("SELECT * FROM parts WHERE status = 'active' ORDER BY name")
      ]);

      console.log('📈 Raw data counts:', {
        invoices: invoicesRaw.length,
        invoiceItems: invoiceItemsRaw.length,
        transactions: transactionsRaw.length,
        parts: partsRaw.length
      });

      if (!invoicesRaw.length && !partsRaw.length) {
        console.warn('No data available for dashboard - this might be expected for a new database');
      }

      // Process data
      const invoices = processInvoices(invoicesRaw);
      const invoiceItems = processInvoiceItems(invoiceItemsRaw);
      const parts = processParts(partsRaw);
      const transactions = transactionsRaw.map((txn: any) => ({
        ...txn,
        amount: safeNum(txn.amount),
        transaction_date: txn.transaction_date,
        payment_method: txn.payment_method,
        recorded_by: txn.recorded_by,
        created_at: txn.created_at || new Date().toISOString(),
        updated_at: txn.updated_at || new Date().toISOString(),
        version: txn.version || 1
      }));

      // Date filters & invoice categorization
      const paidInvoices = invoices.filter(i => ['paid', 'completed', 'success'].includes((i.status || '').toLowerCase()));
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const monthStart = startOfMonth(new Date());
      
      const todayInvoices = paidInvoices.filter(i => i.invoice_date === todayStr);
      const weekInvoices = paidInvoices.filter(i => withinDateRange(i.invoice_date, weekStart));
      const monthInvoices = paidInvoices.filter(i => withinDateRange(i.invoice_date, monthStart));

      console.log('📅 Invoice filtering:', {
        total: invoices.length,
        paid: paidInvoices.length,
        today: todayInvoices.length,
        week: weekInvoices.length,
        month: monthInvoices.length
      });

      // Revenue calculations
      const sumRevenue = (invs: Invoice[]) => invs.reduce((sum, i) => sum + safeNum(i.total), 0);
      const todayRevenue = sumRevenue(todayInvoices);
      const weekRevenue = sumRevenue(weekInvoices);
      const monthRevenue = sumRevenue(monthInvoices);

      // ✅ FIXED: Profit calculations using separate invoice items
      const getInvoiceItems = (invoiceIds: string[]) => {
        const items = invoiceItems.filter(item => invoiceIds.includes(item.invoice_id));
        console.log(`🔍 Found ${items.length} items for ${invoiceIds.length} invoices`);
        return items;
      };

      const todayProfit = calculateProfit(getInvoiceItems(todayInvoices.map(i => i.id)), parts);
      const weekProfit = calculateProfit(getInvoiceItems(weekInvoices.map(i => i.id)), parts);
      const monthProfit = calculateProfit(getInvoiceItems(monthInvoices.map(i => i.id)), parts);

      console.log('💰 Profit calculations:', { todayProfit, weekProfit, monthProfit });

      // Growth calculations
      const yesterdayStr = format(new Date(now - 86400000), 'yyyy-MM-dd');
      const yesterdayRevenue = sumRevenue(paidInvoices.filter(i => i.invoice_date === yesterdayStr));
      const todayGrowth = calcGrowth(todayRevenue, yesterdayRevenue);

      const lastMonthStart = new Date(monthStart);
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      const lastMonthInvoices = paidInvoices.filter(i => {
        try {
          const dt = new Date(i.invoice_date);
          return dt >= lastMonthStart && dt < monthStart;
        } catch { return false; }
      });
      const lastMonthRevenue = sumRevenue(lastMonthInvoices);
      const monthGrowth = calcGrowth(monthRevenue, lastMonthRevenue);

      const lowStock = parts.filter(p => p.quantity > 0 && p.quantity <= (p.min_stock_level || 5));

      const dashboardData: DashboardData = {
        todayRevenue,
        todayProfit,
        todayInvoiceCount: todayInvoices.length,
        weekRevenue,
        weekProfit,
        monthRevenue,
        monthProfit,
        monthInvoiceCount: monthInvoices.length,
        totalItems: parts.length,
        overdueInvoices: invoices.filter(i => (i.status || '').toLowerCase() === 'overdue'),
        outStock: parts.filter(p => p.quantity === 0),
        lowStock,
        topSellingWeekly: [], // TODO: Implement if needed
        recentSales: paidInvoices.slice(0, 5),
        recentExpenses: transactions.filter(t => t.transaction_type === 'expense').slice(0, 5),
        // ✅ FIXED: Use === instead of = for comparison
        pendingPayables: transactions.filter(t => t.transaction_type === 'expense' && t.status === 'pending'),
        todayGrowth,
        monthGrowth,
        totalItemsGrowth: 0, // TODO: Implement if needed
      };

      setData(dashboardData);
      setLastFetch(now);
      lastFetchRef.current = now;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard data';
      console.error('Dashboard fetch error:', err);
      setError(errorMsg);
      
      // Set fallback data instead of leaving null
      if (!data) {
        setData({
          todayRevenue: 0, todayProfit: 0, todayInvoiceCount: 0,
          weekRevenue: 0, weekProfit: 0, monthRevenue: 0, monthProfit: 0, monthInvoiceCount: 0,
          totalItems: 0, 
          overdueInvoices: [], outStock: [], lowStock: [],
          topSellingWeekly: [], recentSales: [], recentExpenses: [], pendingPayables: [],
          todayGrowth: 0, monthGrowth: 0, totalItemsGrowth: 0
        });
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [query]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  return { 
    data, 
    loading, 
    error, 
    lastFetch, 
    refresh: () => fetchData(true) 
  };
}


// import { useEffect, useState, useCallback, useRef } from 'react';
// import { Invoice, InvoiceItem, Part, Transaction } from '../../../types/database';
// import { dbPromise, handleSqlError } from '../../../lib/localDb';
// // ✅ FIXED: Import types from localDb instead of redefining
// import type { SQLTransaction, SQLResultSet } from '../../../lib/localDb';
// import { format, startOfMonth, startOfWeek } from 'date-fns';

// // ✅ REMOVED: Local interface definitions that conflicted with localDb types

// // ❌ REMOVED: SalesByShopkeeperItem - Not needed for single user
// export type TopSellingItem = { part: Part; quantity: number };

// // ✅ UPDATED: Removed salesByShopkeeper from DashboardData
// export interface DashboardData {
//   todayRevenue: number;
//   todayProfit: number;
//   todayInvoiceCount: number;
//   weekRevenue: number;
//   weekProfit: number;
//   monthRevenue: number;
//   monthProfit: number;
//   monthInvoiceCount: number;
//   totalItems: number;
//   // ❌ REMOVED: salesByShopkeeper: SalesByShopkeeperItem[];
//   overdueInvoices: Invoice[];
//   outStock: Part[];
//   lowStock: Part[];
//   topSellingWeekly: TopSellingItem[];
//   recentSales: Invoice[];
//   recentExpenses: Transaction[];
//   pendingPayables: Transaction[];
//   todayGrowth: number;
//   monthGrowth: number;
//   totalItemsGrowth: number;
// }

// // 🚀 **ULTRA-ADVANCED HELPER FUNCTIONS**
// const safeNum = (n: unknown): number => (typeof n === 'number' && !isNaN(n) ? n : 0);

// const safeJsonParse = <T>(input: unknown, fallback: T): T => {
//   if (!input) return fallback;
//   if (typeof input === 'object') return input as T;
//   if (typeof input !== 'string') return fallback;
//   try { return JSON.parse(input) ?? fallback; } catch { return fallback; }
// };

// const calculateProfit = (items: InvoiceItem[], parts: Part[]): number => {
//   const partMap = new Map(parts.map(p => [p.id, p]));
//   return items.reduce((profit, item) => {
//     const part = partMap.get(item.partId || '');
//     if (!part) return profit;
//     const sale = safeNum(item.price), cost = safeNum(part.purchasePrice), qty = safeNum(item.quantity);
//     return sale > 0 && qty > 0 ? profit + (sale - cost) * qty : profit;
//   }, 0);
// };

// const processInvoices = (raw: any[]): Invoice[] =>
//   raw.map(inv => ({
//     ...inv,
//     customer: safeJsonParse(inv.customer, { name: inv.customerName || 'Unknown' }),
//     items: safeJsonParse(inv.items, []).filter((item: any) => 
//       item?.partId && safeNum(item.price) > 0 && safeNum(item.quantity) > 0
//     ),
//     customerName: inv.customerName || 'Unknown Customer',
//     subtotal: safeNum(inv.subtotal),
//     total: safeNum(inv.total),
//     date: inv.date || format(new Date(), 'yyyy-MM-dd')
//   }));

// const processParts = (raw: any[]): Part[] =>
//   raw.map(part => ({
//     ...part,
//     images: safeJsonParse(part.images, []),
//     purchasePrice: safeNum(part.purchasePrice),
//     sellingPrice: safeNum(part.sellingPrice),
//     mrp: safeNum(part.mrp),
//     quantity: safeNum(part.quantity),
//     isLowStock: Boolean(part.isLowStock),
//     status: part.status || 'active',
//     lastModified: safeNum(part.lastModified) || Date.now()
//   }));

// const calcGrowth = (current: number, previous: number): number =>
//   previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

// const withinDateRange = (dateStr: string, fromDate: Date): boolean => {
//   try { return new Date(dateStr) >= fromDate; } catch { return false; }
// };

// export default function useDashboardData() {
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [lastFetch, setLastFetch] = useState(0);
  
//   const lastFetchRef = useRef(0);
//   const fetchingRef = useRef(false);
//   const MIN_FETCH_INTERVAL = 3000;

//   // ✅ FIXED: Advanced SQL query helper with proper imported typing
//   const query = useCallback(async <T>(sql: string, params: any[] = []): Promise<T[]> => {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             sql, 
//             params,
//             (_: SQLTransaction, results: SQLResultSet) => { // ✅ FIXED: Use imported types
//               const items: T[] = [];
//               for (let i = 0; i < results.rows.length; i++) {
//                 items.push(results.rows.item(i));
//               }
//               resolve(items);
//             },
//             (_: SQLTransaction, err: any) => { // ✅ FIXED: Use imported types
//               handleSqlError(_, err);
//               reject(err);
//               return true;
//             }
//           );
//         },
//         (error: any) => reject(error)
//       );
//     });
//   }, []);

//   // 🚀 **ULTRA-OPTIMIZED DATA FETCHING & PROCESSING**
//   const fetchData = useCallback(async (force = false) => {
//     const now = Date.now();
//     if (fetchingRef.current || (!force && now - lastFetchRef.current < MIN_FETCH_INTERVAL)) return;
    
//     fetchingRef.current = true;
//     setLoading(true);
//     setError(null);

//     try {
//       // Parallel data fetching
//       const [invoicesRaw, transactionsRaw, partsRaw] = await Promise.all([
//         query<any>('SELECT * FROM invoices ORDER BY date DESC'),
//         query<any>('SELECT * FROM transactions ORDER BY date DESC'),
//         query<any>("SELECT * FROM parts WHERE status = 'active' ORDER BY name")
//       ]);

//       if (!invoicesRaw.length && !partsRaw.length) {
//         throw new Error('No data available for dashboard');
//       }

//       // Advanced data processing
//       const invoices = processInvoices(invoicesRaw);
//       const parts = processParts(partsRaw);
//       const transactions = transactionsRaw.map((txn: any) => ({
//         ...txn,
//         amount: safeNum(txn.amount),
//         lastModified: safeNum(txn.lastModified) || now
//       }));

//       // Date filters & invoice categorization
//       const paidInvoices = invoices.filter(i => ['paid', 'completed', 'success'].includes((i.status || '').toLowerCase()));
//       const todayStr = format(new Date(), 'yyyy-MM-dd');
//       const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
//       const monthStart = startOfMonth(new Date());

//       const todayInvoices = paidInvoices.filter(i => i.date === todayStr);
//       const weekInvoices = paidInvoices.filter(i => withinDateRange(i.date, weekStart));
//       const monthInvoices = paidInvoices.filter(i => withinDateRange(i.date, monthStart));

//       // Revenue & profit calculations
//       const sumRevenue = (invs: Invoice[]) => invs.reduce((sum, i) => sum + safeNum(i.total), 0);
//       const todayRevenue = sumRevenue(todayInvoices);
//       const weekRevenue = sumRevenue(weekInvoices);
//       const monthRevenue = sumRevenue(monthInvoices);

//       const todayProfit = calculateProfit(todayInvoices.flatMap(i => i.items || []), parts);
//       const weekProfit = calculateProfit(weekInvoices.flatMap(i => i.items || []), parts);
//       const monthProfit = calculateProfit(monthInvoices.flatMap(i => i.items || []), parts);

//       // Growth calculations
//       const yesterdayStr = format(new Date(now - 86400000), 'yyyy-MM-dd');
//       const yesterdayRevenue = sumRevenue(paidInvoices.filter(i => i.date === yesterdayStr));
//       const todayGrowth = calcGrowth(todayRevenue, yesterdayRevenue);

//       const lastMonthStart = new Date(monthStart);
//       lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
//       const lastMonthInvoices = paidInvoices.filter(i => {
//         try {
//           const dt = new Date(i.date);
//           return dt >= lastMonthStart && dt < monthStart;
//         } catch { return false; }
//       });
//       const lastMonthRevenue = sumRevenue(lastMonthInvoices);
//       const monthGrowth = calcGrowth(monthRevenue, lastMonthRevenue);

//       // ❌ REMOVED: Sales by shopkeeper aggregation - Not needed for single user
//       // ❌ REMOVED: salesMap, salesByShopkeeper calculation

//       // ✅ UPDATED: Dashboard data without salesByShopkeeper
//       const dashboardData: DashboardData = {
//         todayRevenue,
//         todayProfit,
//         todayInvoiceCount: todayInvoices.length,
//         weekRevenue,
//         weekProfit,
//         monthRevenue,
//         monthProfit,
//         monthInvoiceCount: monthInvoices.length,
//         totalItems: parts.length,
//         // ❌ REMOVED: salesByShopkeeper,
//         overdueInvoices: invoices.filter(i => (i.status || '').toLowerCase() === 'overdue'),
//         outStock: parts.filter(p => p.quantity === 0),
//         lowStock: parts.filter(p => p.isLowStock && p.quantity > 0),
//         topSellingWeekly: [], // TODO: Implement if needed
//         recentSales: paidInvoices.slice(0, 5),
//         recentExpenses: transactions.filter(t => t.amount < 0).slice(0, 5),
//         pendingPayables: transactions.filter(t => t.amount < 0 && t.status === 'Pending'),
//         todayGrowth,
//         monthGrowth,
//         totalItemsGrowth: 0, // TODO: Implement if needed
//       };

//       setData(dashboardData);
//       setLastFetch(now);
//       lastFetchRef.current = now;

//     } catch (err) {
//       const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard data';
//       setError(errorMsg);
      
//       // ✅ UPDATED: Fallback empty data without salesByShopkeeper
//       if (!data) {
//         setData({
//           todayRevenue: 0, todayProfit: 0, todayInvoiceCount: 0,
//           weekRevenue: 0, weekProfit: 0, monthRevenue: 0, monthProfit: 0, monthInvoiceCount: 0,
//           totalItems: 0, 
//           // ❌ REMOVED: salesByShopkeeper: []
//           overdueInvoices: [], outStock: [], lowStock: [],
//           topSellingWeekly: [], recentSales: [], recentExpenses: [], pendingPayables: [],
//           todayGrowth: 0, monthGrowth: 0, totalItemsGrowth: 0
//         });
//       }
//     } finally {
//       setLoading(false);
//       fetchingRef.current = false;
//     }
//   }, [query]);

//   // Auto-fetch on mount
//   useEffect(() => {
//     fetchData(true);
//   }, [fetchData]);

//   return { 
//     data, 
//     loading, 
//     error, 
//     lastFetch, 
//     refresh: () => fetchData(true) 
//   };
// }
