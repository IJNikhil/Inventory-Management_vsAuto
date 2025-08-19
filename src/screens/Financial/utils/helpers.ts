// src/screens/CashFlow/utils/helpers.ts
import { differenceInDays, startOfMonth, isValid, parseISO } from 'date-fns';
import type { Transaction, Invoice, StockPurchase } from '../../../types/database';
import type { FilterType } from '../CashFlowScreen';

export type CombinedTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  status: 'Paid' | 'Pending' | 'Overdue';
  source: 'Invoice' | 'Manual' | 'Stock Purchase';
  sourceId?: string;
};

export type CashFlowStats = {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  totalReceivables: number;
};

/**
 * Validates date string format (ISO yyyy-MM-dd) and returns a safe fallback if invalid.
 */
export function validateDate(date: unknown, context: string, recordId: string): string {
  const defaultDate = new Date().toISOString().slice(0, 10); // yyyy-MM-dd
  
  if (typeof date !== 'string' || !date) {
    console.warn(`[${context}] Missing date for record ${recordId}, using default: ${defaultDate}`);
    return defaultDate;
  }
  
  try {
    const parsed = parseISO(date);
    if (!isValid(parsed)) {
      console.warn(`[${context}] Invalid date format for record ${recordId}: ${date}, using default: ${defaultDate}`);
      return defaultDate;
    }
    return date;
  } catch {
    console.warn(`[${context}] Failed to parse date for record ${recordId}: ${date}, using default: ${defaultDate}`);
    return defaultDate;
  }
}

/**
 * Combines invoices, stock purchases, and manual transactions into a unified array sorted by date descending.
 */
export function combineTransactions(
  invoices: Invoice[],
  stockPurchases: StockPurchase[],
  manualTransactions: Transaction[],
): CombinedTransaction[] {
  console.log('[combineTransactions] Input counts:', {
    invoices: invoices.length,
    stockPurchases: stockPurchases.length,
    manualTransactions: manualTransactions.length,
  });

  // Map invoices into CombinedTransaction
  const incomeFromInvoices: CombinedTransaction[] = invoices
    .filter(inv => inv && typeof inv.total === 'number' && inv.id)
    .map(inv => {
      const validatedDate = validateDate(inv.invoice_date, 'combineTransactions:invoice', inv.id);
      
      // ✅ CRITICAL FIX: Use === for ALL comparisons
      let status: CombinedTransaction['status'] = 'Pending';
      if (inv.status === 'paid') {
        status = 'Paid';
      } else if (inv.status === 'overdue') {
        status = 'Overdue';
      } else if (inv.status === 'draft' || inv.status === 'sent' || inv.status === 'cancelled') { // ✅ FIXED: Use === everywhere
        status = 'Pending';
      }

      // Mark overdue if not paid and older than 15 days
      if (status === 'Pending' && differenceInDays(new Date(), new Date(validatedDate)) > 15) {
        status = 'Overdue';
      }

      return {
        id: inv.id,
        date: validatedDate,
        description: `Invoice to ${inv.customer?.name || 'Unknown Customer'}`,
        amount: Math.abs(inv.total),
        type: 'Income',
        status,
        source: 'Invoice',
        sourceId: inv.id,
      };
    });

  // Map stock purchases as expenses
  const expensesFromStock: CombinedTransaction[] = stockPurchases
    .filter(sp => sp && typeof sp.total === 'number' && sp.id)
    .map(sp => {
      // ✅ FIXED: Map database status to UI status (use actual database values)
      let status: CombinedTransaction['status'] = 'Pending';
      
      // Use the actual database status values from StockPurchase type
      if (sp.status === 'received') {
        status = 'Paid';
      } else if (sp.status === 'cancelled') {
        status = 'Pending'; // Treat cancelled as pending for UI
      } else if (sp.status === 'pending') {
        status = 'Pending';
      }

      return {
        id: `sp-${sp.id}`,
        date: validateDate(sp.purchase_date, 'combineTransactions:stockPurchase', sp.id),
        description: `Stock Purchase from ${sp.supplier?.name || 'Unknown Supplier'}`,
        amount: Math.abs(sp.total),
        type: 'Expense',
        status,
        source: 'Stock Purchase',
        sourceId: sp.id,
      };
    });

  // Map manual transactions
  const manualEntries: CombinedTransaction[] = manualTransactions
    .filter(t => t && typeof t.amount === 'number' && t.id)
    .map(t => {
      // ✅ FIXED: Use transaction_type instead of amount sign
      const type = t.transaction_type === 'income' ? 'Income' : 'Expense';
      
      // ✅ FIXED: Map database status to UI status
      let status: CombinedTransaction['status'] = 'Pending';
      if (t.status === 'completed') {
        status = 'Paid';
      } else if (t.status === 'cancelled') {
        status = 'Pending'; // Treat cancelled as pending for UI
      } else if (t.status === 'pending') {
        status = 'Pending';
      }

      return {
        id: t.id,
        date: validateDate(t.transaction_date, 'combineTransactions:manualTransaction', t.id),
        description: t.description || 'Manual Transaction',
        amount: Math.abs(t.amount),
        type,
        status,
        source: 'Manual',
      };
    });

  // Combine all and sort descending by date
  const combined = [...incomeFromInvoices, ...expensesFromStock, ...manualEntries]
    .filter(item => item.id && item.date && !isNaN(item.amount))
    .sort((a, b) => {
      if (a.date === b.date) return 0;
      return a.date < b.date ? 1 : -1;
    });

  console.log('[combineTransactions] Result count:', combined.length);
  console.log('[combineTransactions] Sample results:', combined.slice(0, 3));
  return combined;
}

/**
 * Filters combined transactions based on filter and search term.
 */
export function filterTransactions(
  transactions: CombinedTransaction[],
  filters: FilterType,
  searchTerm: string
): CombinedTransaction[] {
  if (!Array.isArray(transactions)) {
    console.warn('[filterTransactions] Invalid transactions input');
    return [];
  }

  const filtered = transactions.filter(t => {
    if (!t) return false;
    
    // ✅ CRITICAL FIX: Use === for ALL comparisons (was using = which is assignment!)
    const typeMatch = filters.type === 'all' || t.type.toLowerCase() === filters.type.toLowerCase();
    const statusMatch = filters.status === 'all' || t.status.toLowerCase() === filters.status.toLowerCase();
    
    const searchMatch = searchTerm.trim() === '' || 
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.type && t.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.status && t.status.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return typeMatch && statusMatch && searchMatch;
  });

  console.log('[filterTransactions] Filtered counts:', {
    original: transactions.length,
    filtered: filtered.length,
    filters,
    searchTerm,
  });

  return filtered;
}

/**
 * Calculates aggregate cash flow stats from a list of combined transactions.
 */
export function calculateStats(transactions: CombinedTransaction[]): CashFlowStats {
  if (!Array.isArray(transactions)) {
    console.warn('[calculateStats] Invalid transactions input');
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netFlow: 0,
      totalReceivables: 0,
    };
  }

  const monthStart = startOfMonth(new Date());

  // Consider transactions this month only
  const monthlyTransactions = transactions.filter(t => {
    if (!t.date) return false;
    const d = parseISO(t.date);
    return isValid(d) && d >= monthStart;
  });

  // ✅ CRITICAL FIX: Use === for ALL comparisons (was using = which is assignment!)
  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'Income' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'Expense' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  // Net income (income - expenses)
  const netFlow = totalIncome - totalExpenses;

  // Total amount receivable (pending or overdue invoice income)
  const totalReceivables = transactions
    .filter(t => t.type === 'Income' && (t.status === 'Pending' || t.status === 'Overdue'))
    .reduce((sum, t) => sum + t.amount, 0);

  const stats: CashFlowStats = {
    totalIncome,
    totalExpenses,
    netFlow,
    totalReceivables,
  };

  console.log('[calculateStats] Computed stats:', stats);
  return stats;
}



// // src/screens/CashFlow/utils/helpers.ts
// import { differenceInDays, startOfMonth, isValid, parseISO } from 'date-fns';
// import type { Transaction, Invoice, StockPurchase } from '../../../types/database'; // ✅ FIXED: Use database types
// import type { FilterType } from '../CashFlowScreen';

// export type CombinedTransaction = {
//   id: string;
//   date: string;
//   description: string;
//   amount: number;
//   type: 'Income' | 'Expense';
//   status: 'Paid' | 'Pending' | 'Overdue';
//   source: 'Invoice' | 'Manual' | 'Stock Purchase';
//   sourceId?: string;
// };

// export type CashFlowStats = {
//   totalIncome: number;
//   totalExpenses: number;
//   netFlow: number;
//   totalReceivables: number;
// };

// /**
//  * Validates date string format (ISO yyyy-MM-dd) and returns a safe fallback if invalid.
//  */
// export function validateDate(date: unknown, context: string, recordId: string): string {
//   const defaultDate = new Date().toISOString().slice(0, 10); // yyyy-MM-dd
//   if (typeof date !== 'string' || !date) {
//     console.warn(`[${context}] Missing date for record ${recordId}, using default: ${defaultDate}`);
//     return defaultDate;
//   }
//   try {
//     const parsed = parseISO(date);
//     if (!isValid(parsed)) {
//       console.warn(`[${context}] Invalid date format for record ${recordId}: ${date}, using default: ${defaultDate}`);
//       return defaultDate;
//     }
//     return date;
//   } catch {
//     console.warn(`[${context}] Failed to parse date for record ${recordId}: ${date}, using default: ${defaultDate}`);
//     return defaultDate;
//   }
// }

// /**
//  * Combines invoices, stock purchases, and manual transactions into a unified array sorted by date descending.
//  */
// export function combineTransactions(
//   invoices: Invoice[],
//   stockPurchases: StockPurchase[],
//   manualTransactions: Transaction[],
// ): CombinedTransaction[] {
//   console.log('[combineTransactions] Input counts:', {
//     invoices: invoices.length,
//     stockPurchases: stockPurchases.length,
//     manualTransactions: manualTransactions.length,
//   });

//   // Map invoices into CombinedTransaction
//   const incomeFromInvoices: CombinedTransaction[] = invoices
//     .filter(inv => inv && typeof inv.total === 'number' && inv.id)
//     .map(inv => {
//       const validatedDate = validateDate(inv.invoice_date, 'combineTransactions:invoice', inv.id); // ✅ FIXED: invoice_date
      
//       // ✅ FIXED: Map database status to UI status
//       let status: CombinedTransaction['status'] = 'Pending';
//       if (inv.status === 'paid') {
//         status = 'Paid';
//       } else if (inv.status === 'overdue') {
//         status = 'Overdue';
//       } else if (inv.status === 'draft' || inv.status === 'sent' || inv.status === 'cancelled') {
//         status = 'Pending';
//       }

//       // Mark overdue if not paid and older than 15 days
//       if (status === 'Pending' && differenceInDays(new Date(), new Date(validatedDate)) > 15) {
//         status = 'Overdue';
//       }

//       return {
//         id: inv.id,
//         date: validatedDate,
//         description: `Invoice to ${inv.customer?.name || 'Unknown Customer'}`, // ✅ FIXED: Only use customer.name
//         amount: Math.abs(inv.total),
//         type: 'Income',
//         status,
//         source: 'Invoice',
//         sourceId: inv.id,
//       };
//     });

//   // Map stock purchases as expenses
//   const expensesFromStock: CombinedTransaction[] = stockPurchases
//     .filter(sp => sp && typeof sp.total === 'number' && sp.id)
//     .map(sp => {
//       // ✅ FIXED: Map database status to UI status
//       let status: CombinedTransaction['status'] = 'Pending';
//       if (sp.status === 'Paid') {
//         status = 'Paid';
//       } else if (sp.status === 'Cancelled') {
//         status = 'Pending'; // Treat cancelled as pending for UI
//       }

//       return {
//         id: `sp-${sp.id}`,
//         date: validateDate(sp.purchase_date, 'combineTransactions:stockPurchase', sp.id), // ✅ FIXED: purchase_date
//         description: `Stock Purchase from ${sp.supplier?.name || 'Unknown Supplier'}`,
//         amount: Math.abs(sp.total),
//         type: 'Expense',
//         status,
//         source: 'Stock Purchase',
//         sourceId: sp.id,
//       };
//     });

//   // Map manual transactions
//   const manualEntries: CombinedTransaction[] = manualTransactions
//     .filter(t => t && typeof t.amount === 'number' && t.id)
//     .map(t => {
//       // ✅ FIXED: Use transaction_type instead of amount sign
//       const type = t.transaction_type === 'income' ? 'Income' : 'Expense';
      
//       // ✅ FIXED: Map database status to UI status
//       let status: CombinedTransaction['status'] = 'Pending';
//       if (t.status === 'completed') {
//         status = 'Paid';
//       } else if (t.status === 'cancelled') {
//         status = 'Pending'; // Treat cancelled as pending for UI
//       }

//       return {
//         id: t.id,
//         date: validateDate(t.transaction_date, 'combineTransactions:manualTransaction', t.id), // ✅ FIXED: transaction_date
//         description: t.description || 'Manual Transaction',
//         amount: Math.abs(t.amount),
//         type,
//         status,
//         source: 'Manual',
//       };
//     });

//   // Combine all and sort descending by date
//   const combined = [...incomeFromInvoices, ...expensesFromStock, ...manualEntries]
//     .filter(item => item.id && item.date && !isNaN(item.amount))
//     .sort((a, b) => {
//       if (a.date === b.date) return 0;
//       return a.date < b.date ? 1 : -1;
//     });

//   console.log('[combineTransactions] Result count:', combined.length);
//   return combined;
// }

// /**
//  * Filters combined transactions based on filter and search term.
//  */
// export function filterTransactions(
//   transactions: CombinedTransaction[],
//   filters: FilterType,
//   searchTerm: string
// ): CombinedTransaction[] {
//   if (!Array.isArray(transactions)) {
//     console.warn('[filterTransactions] Invalid transactions input');
//     return [];
//   }

//   const filtered = transactions.filter(t => {
//     if (!t) return false;

//     const typeMatch = filters.type === 'all' || t.type.toLowerCase() === filters.type.toLowerCase();
//     const statusMatch = filters.status === 'all' || t.status.toLowerCase() === filters.status.toLowerCase();
//     const searchMatch = searchTerm.trim() === '' || 
//       (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (t.type && t.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (t.status && t.status.toLowerCase().includes(searchTerm.toLowerCase()));

//     return typeMatch && statusMatch && searchMatch;
//   });

//   console.log('[filterTransactions] Filtered counts:', {
//     original: transactions.length,
//     filtered: filtered.length,
//     filters,
//     searchTerm,
//   });

//   return filtered;
// }

// /**
//  * Calculates aggregate cash flow stats from a list of combined transactions.
//  */
// export function calculateStats(transactions: CombinedTransaction[]): CashFlowStats {
//   if (!Array.isArray(transactions)) {
//     console.warn('[calculateStats] Invalid transactions input');
//     return {
//       totalIncome: 0,
//       totalExpenses: 0,
//       netFlow: 0,
//       totalReceivables: 0,
//     };
//   }

//   const monthStart = startOfMonth(new Date());

//   // Consider transactions this month only
//   const monthlyTransactions = transactions.filter(t => {
//     if (!t.date) return false;
//     const d = parseISO(t.date);
//     return isValid(d) && d >= monthStart;
//   });

//   const totalIncome = monthlyTransactions
//     .filter(t => t.type === 'Income' && t.status === 'Paid')
//     .reduce((sum, t) => sum + t.amount, 0);

//   const totalExpenses = monthlyTransactions
//     .filter(t => t.type === 'Expense' && t.status === 'Paid')
//     .reduce((sum, t) => sum + t.amount, 0);

//   // Net income (income - expenses)
//   const netFlow = totalIncome - totalExpenses;

//   // Total amount receivable (pending or overdue invoice income)
//   const totalReceivables = transactions
//     .filter(t => t.type === 'Income' && (t.status === 'Pending' || t.status === 'Overdue'))
//     .reduce((sum, t) => sum + t.amount, 0);

//   const stats: CashFlowStats = {
//     totalIncome,
//     totalExpenses,
//     netFlow,
//     totalReceivables,
//   };

//   console.log('[calculateStats] Computed stats:', stats);
//   return stats;
// }
