// src/services/transaction-service.ts
import { BaseService } from './base-service';
import { executeQuery } from '../lib/database/connection';
import type { Transaction } from '../types/database';

class TransactionService extends BaseService<Transaction> {
  protected tableName = 'transactions';

  protected mapFromDb(row: any): Transaction {
    return {
      id: row.id,
      reference_id: row.reference_id || undefined,
      reference_type: row.reference_type || undefined,
      amount: parseFloat(row.amount) || 0,
      transaction_type: row.transaction_type || 'expense',
      category: row.category || '',
      description: row.description || '',
      transaction_date: row.transaction_date,
      payment_method: row.payment_method || 'cash',
      recorded_by: row.recorded_by || '',
      status: row.status || 'completed',
      created_at: row.created_at,
      updated_at: row.updated_at,
      version: row.version || 1
    };
  }

  protected mapToDb(entity: Partial<Transaction>): Record<string, any> {
    return {
      id: entity.id,
      reference_id: entity.reference_id || null,
      reference_type: entity.reference_type || null,
      amount: entity.amount || 0,
      transaction_type: entity.transaction_type || 'expense',
      category: entity.category || '',
      description: entity.description || '',
      transaction_date: entity.transaction_date,
      payment_method: entity.payment_method || 'cash',
      recorded_by: entity.recorded_by || '',
      status: entity.status || 'completed',
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      version: entity.version
    };
  }

  async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<Transaction> {
    this.validateRequired(data, ['amount', 'transaction_type', 'category', 'description', 'transaction_date', 'payment_method', 'recorded_by']);
    
    if (data.amount === 0) {
      throw new Error('Transaction amount cannot be zero');
    }

    return super.create(data);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const sql = `
        SELECT * FROM transactions 
        WHERE transaction_date BETWEEN ? AND ?
        ORDER BY transaction_date DESC, created_at DESC
      `;
      
      const rows = await executeQuery<any>(sql, [startDate, endDate]);
      return rows.map(row => this.mapFromDb(row));
    } catch (error) {
      console.error('Error finding transactions by date range:', error);
      throw error;
    }
  }

  async findByType(transactionType: Transaction['transaction_type']): Promise<Transaction[]> {
    return this.findAll({
      where: { transaction_type: transactionType },
      orderBy: 'transaction_date',
      orderDirection: 'DESC'
    });
  }

  async findByCategory(category: string): Promise<Transaction[]> {
    return this.findAll({
      where: { category },
      orderBy: 'transaction_date',
      orderDirection: 'DESC'
    });
  }

  async findByStatus(status: Transaction['status']): Promise<Transaction[]> {
    return this.findAll({
      where: { status },
      orderBy: 'transaction_date',
      orderDirection: 'DESC'
    });
  }

  async findByReference(referenceType: Transaction['reference_type'], referenceId: string): Promise<Transaction[]> {
    return this.findAll({
      where: { reference_type: referenceType, reference_id: referenceId },
      orderBy: 'transaction_date',
      orderDirection: 'DESC'
    });
  }

  async getTransactionSummary(startDate?: string, endDate?: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    transactionCount: number;
    avgTransactionAmount: number;
  }> {
    let whereClause = '';
    const params: any[] = [];

    if (startDate && endDate) {
      whereClause = 'WHERE transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      whereClause = 'WHERE transaction_date >= ?';
      params.push(startDate);
    } else if (endDate) {
      whereClause = 'WHERE transaction_date <= ?';
      params.push(endDate);
    }

    const sql = `
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN ABS(amount) ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN ABS(amount) ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN ABS(amount) ELSE -ABS(amount) END), 0) as net_cash_flow,
        COUNT(*) as transaction_count,
        COALESCE(AVG(ABS(amount)), 0) as avg_transaction_amount
      FROM transactions
      ${whereClause}
    `;

    const result = await executeQuery<any>(sql, params);
    const row = result[0] || {};

    return {
      totalIncome: row.total_income || 0,
      totalExpenses: row.total_expenses || 0,
      netCashFlow: row.net_cash_flow || 0,
      transactionCount: row.transaction_count || 0,
      avgTransactionAmount: row.avg_transaction_amount || 0
    };
  }

  async getCategoryTotals(startDate?: string, endDate?: string): Promise<Array<{
    category: string;
    total: number;
    count: number;
    transaction_type: string;
  }>> {
    let whereClause = '';
    const params: any[] = [];

    if (startDate && endDate) {
      whereClause = 'WHERE transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      whereClause = 'WHERE transaction_date >= ?';
      params.push(startDate);
    } else if (endDate) {
      whereClause = 'WHERE transaction_date <= ?';
      params.push(endDate);
    }

    const sql = `
      SELECT 
        category,
        transaction_type,
        SUM(ABS(amount)) as total,
        COUNT(*) as count
      FROM transactions
      ${whereClause}
      GROUP BY category, transaction_type
      ORDER BY total DESC
    `;

    return executeQuery<{
      category: string;
      total: number;
      count: number;
      transaction_type: string;
    }>(sql, params);
  }

  async getPaymentMethodTotals(startDate?: string, endDate?: string): Promise<Array<{
    payment_method: string;
    total: number;
    count: number;
  }>> {
    let whereClause = '';
    const params: any[] = [];

    if (startDate && endDate) {
      whereClause = 'WHERE transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      whereClause = 'WHERE transaction_date >= ?';
      params.push(startDate);
    } else if (endDate) {
      whereClause = 'WHERE transaction_date <= ?';
      params.push(endDate);
    }

    const sql = `
      SELECT 
        payment_method,
        SUM(ABS(amount)) as total,
        COUNT(*) as count
      FROM transactions
      ${whereClause}
      GROUP BY payment_method
      ORDER BY total DESC
    `;

    return executeQuery<{
      payment_method: string;
      total: number;
      count: number;
    }>(sql, params);
  }

  async searchTransactions(searchTerm: string): Promise<Transaction[]> {
    return this.search(searchTerm, ['description', 'category']);
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    return this.findAll({
      limit,
      orderBy: 'transaction_date',
      orderDirection: 'DESC'
    });
  }

  // Helper method to create transaction from invoice payment
  async createFromInvoicePayment(
    invoiceId: string,
    amount: number,
    paymentMethod: Transaction['payment_method'],
    recordedBy: string,
    paymentDate?: string
  ): Promise<Transaction> {
    return this.create({
      reference_id: invoiceId,
      reference_type: 'invoice',
      amount: Math.abs(amount),
      transaction_type: 'income',
      category: 'Sales',
      description: `Payment received for invoice`,
      transaction_date: paymentDate || new Date().toISOString().split('T')[0],
      payment_method: paymentMethod,
      recorded_by: recordedBy,
      status: 'completed'
    });
  }

  // Helper method to create transaction from stock purchase
  async createFromStockPurchase(
    purchaseId: string,
    amount: number,
    paymentMethod: Transaction['payment_method'],
    recordedBy: string,
    paymentDate?: string
  ): Promise<Transaction> {
    return this.create({
      reference_id: purchaseId,
      reference_type: 'purchase',
      amount: -Math.abs(amount), // Negative for expense
      transaction_type: 'expense',
      category: 'Stock Purchase',
      description: `Payment for stock purchase`,
      transaction_date: paymentDate || new Date().toISOString().split('T')[0],
      payment_method: paymentMethod,
      recorded_by: recordedBy,
      status: 'completed'
    });
  }
}

export const transactionService = new TransactionService();

// Export individual methods for backward compatibility
export const {
  create: createTransaction,
  update: updateTransaction,
  delete: deleteTransaction,
  findById: getTransactionById,
  findAll: getTransactions,
  findByDateRange: getTransactionsByDateRange,
  findByType: getTransactionsByType,
  findByCategory: getTransactionsByCategory,
  findByStatus: getTransactionsByStatus,
  findByReference: getTransactionsByReference,
  getTransactionSummary,
  getCategoryTotals,
  getPaymentMethodTotals,
  searchTransactions,
  getRecentTransactions,
  createFromInvoicePayment,
  createFromStockPurchase
} = transactionService;





// import { dbPromise, handleSqlError } from '../lib/localDb';
// // ✅ FIXED: Import types from localDb instead of redefining locally
// import type { SQLTransaction, SQLResultSet } from '../lib/localDb';
// import uuid from 'react-native-uuid';
// import type { Transaction } from '../types';
// import { validateDate } from '../screens/CashFlow/utils/helpers';

// // ✅ REMOVED: Local interface definitions that conflicted with localDb types

// interface TransactionRow {
//   id: string;
//   date: string;
//   amount: number;
//   paymentMethod: string;
//   description: string;
//   category: string;
//   recordedBy: string;
//   paidBy: string;
//   status: string;
//   sourceId: string;
//   sourceType: string;
//   lastModified: number;
// }

// class TransactionService {
//   private static async execSql<T>(sql: string, params: any[] = []): Promise<T[]> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             sql,
//             params,
//             (tx: SQLTransaction, results: SQLResultSet) => { // ✅ FIXED: Use imported types
//               const items: T[] = [];
//               for (let i = 0; i < results.rows.length; i++) {
//                 items.push(results.rows.item(i));
//               }
//               resolve(items);
//             },
//             (tx: SQLTransaction, err: any) => {
//               handleSqlError(tx, err);
//               reject(err);
//               return true;
//             }
//           );
//         },
//         (error: any) => reject(error)
//       );
//     });
//   }

//   private static async execSqlSingle<T>(sql: string, params: any[] = []): Promise<T | null> {
//     const results = await this.execSql<T>(sql, params);
//     return results.length > 0 ? results[0] : null;
//   }

//   private static fromRow(row: TransactionRow): Transaction {
//     return {
//       id: row.id,
//       date: validateDate(row.date, 'transaction-service', row.id),
//       amount: row.amount,
//       paymentMethod: row.paymentMethod as Transaction['paymentMethod'],
//       description: row.description,
//       category: row.category as Transaction['category'],
//       recordedBy: row.recordedBy,
//       paidBy: row.paidBy || '',
//       status: row.status as Transaction['status'],
//       sourceId: row.sourceId || '',
//       sourceType: row.sourceType as Transaction['sourceType'],
//       lastModified: row.lastModified,
//     };
//   }

//   private static async saveTransaction(txn: Transaction): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             `INSERT OR REPLACE INTO transactions
//              (id, date, amount, paymentMethod, description, category, recordedBy, paidBy, status, sourceId, sourceType, lastModified)
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//               txn.id,
//               txn.date,
//               txn.amount,
//               txn.paymentMethod,
//               txn.description,
//               txn.category,
//               txn.recordedBy,
//               txn.paidBy || '',
//               txn.status,
//               txn.sourceId || '',
//               txn.sourceType || '',
//               txn.lastModified,
//             ],
//             (_: SQLTransaction, __: SQLResultSet) => resolve(), // ✅ FIXED: Use imported types
//             (tx: SQLTransaction, error: any) => {
//               handleSqlError(tx, error);
//               reject(error);
//               return true;
//             }
//           );
//         },
//         (error: any) => reject(error)
//       );
//     });
//   }

//   static async getTransactions(): Promise<Transaction[]> {
//     const rows = await this.execSql<TransactionRow>('SELECT * FROM transactions ORDER BY date DESC');
//     return rows.map(this.fromRow);
//   }

//   static async getTransactionById(id: string): Promise<Transaction | null> {
//     const row = await this.execSqlSingle<TransactionRow>('SELECT * FROM transactions WHERE id = ?', [id]);
//     return row ? this.fromRow(row) : null;
//   }

//   static async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
//     const rows = await this.execSql<TransactionRow>(
//       'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
//       [startDate, endDate]
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getTransactionsByCategory(category: string): Promise<Transaction[]> {
//     const rows = await this.execSql<TransactionRow>(
//       'SELECT * FROM transactions WHERE category = ? ORDER BY date DESC',
//       [category]
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getTransactionsByStatus(status: 'Paid' | 'Pending'): Promise<Transaction[]> {
//     const rows = await this.execSql<TransactionRow>(
//       'SELECT * FROM transactions WHERE status = ? ORDER BY date DESC',
//       [status]
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getIncomeTransactions(): Promise<Transaction[]> {
//     const rows = await this.execSql<TransactionRow>(
//       'SELECT * FROM transactions WHERE amount > 0 ORDER BY date DESC'
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getExpenseTransactions(): Promise<Transaction[]> {
//     const rows = await this.execSql<TransactionRow>(
//       'SELECT * FROM transactions WHERE amount < 0 ORDER BY date DESC'
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
//     const rows = await this.execSql<TransactionRow>(
//       'SELECT * FROM transactions ORDER BY date DESC, lastModified DESC LIMIT ?',
//       [limit]
//     );
//     return rows.map(this.fromRow);
//   }

//   static async searchTransactions(query: string): Promise<Transaction[]> {
//     const searchTerm = `%${query}%`;
//     const rows = await this.execSql<TransactionRow>(
//       'SELECT * FROM transactions WHERE description LIKE ? OR category LIKE ? ORDER BY date DESC',
//       [searchTerm, searchTerm]
//     );
//     return rows.map(this.fromRow);
//   }

//   static async addTransaction(data: Omit<Transaction, 'id' | 'lastModified'>): Promise<Transaction> {
//     const id = uuid.v4() as string;
//     const now = Date.now();
//     const transaction: Transaction = {
//       id,
//       ...data,
//       date: validateDate(data.date, 'addTransaction', id),
//       lastModified: now,
//     };
//     await this.saveTransaction(transaction);
//     return transaction;
//   }

//   static async updateTransaction(
//     id: string,
//     data: Omit<Transaction, 'id' | 'lastModified'>
//   ): Promise<Transaction> {
//     const existing = await this.getTransactionById(id);
//     if (!existing) {
//       throw new Error(`Transaction ${id} not found`);
//     }
//     const updated: Transaction = {
//       ...existing,
//       ...data,
//       id, 
//       lastModified: Date.now(),
//     };
//     await this.saveTransaction(updated);
//     return updated;
//   }

//   static async deleteTransaction(id: string): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'DELETE FROM transactions WHERE id = ?',
//             [id],
//             (_: SQLTransaction, __: SQLResultSet) => resolve(), // ✅ FIXED: Use imported types
//             (tx: SQLTransaction, error: any) => {
//               handleSqlError(tx, error);
//               reject(error);
//               return true;
//             }
//           );
//         },
//         (error: any) => reject(error)
//       );
//     });
//   }

//   static async updateTransactionStatus(
//     transactionId: string,
//     status: 'Paid' | 'Pending',
//     paidBy: string,
//     paymentMethod: Transaction['paymentMethod']
//   ): Promise<Transaction | null> {
//     const db = await dbPromise;
//     const lastModified = Date.now();
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'UPDATE transactions SET status = ?, paidBy = ?, paymentMethod = ?, lastModified = ? WHERE id = ?',
//             [status, paidBy, paymentMethod, lastModified, transactionId],
//             async (_: SQLTransaction, __: SQLResultSet) => { // ✅ FIXED: Use imported types
//               const updated = await this.getTransactionById(transactionId);
//               resolve(updated);
//             },
//             (tx: SQLTransaction, error: any) => {
//               handleSqlError(tx, error);
//               reject(error);
//               return true;
//             }
//           );
//         },
//         (error: any) => reject(error)
//       );
//     });
//   }

//   static async getTransactionSummary(startDate?: string, endDate?: string): Promise<{
//     totalIncome: number;
//     totalExpenses: number;
//     netCashFlow: number;
//     transactionCount: number;
//     avgTransactionAmount: number;
//   }> {
//     let sql = `SELECT 
//       SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as totalIncome,
//       SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as totalExpenses,
//       SUM(amount) as netCashFlow,
//       COUNT(*) as transactionCount,
//       AVG(ABS(amount)) as avgTransactionAmount
//       FROM transactions`;
    
//     const params: string[] = [];
//     if (startDate && endDate) {
//       sql += ' WHERE date BETWEEN ? AND ?';
//       params.push(startDate, endDate);
//     } else if (startDate) {
//       sql += ' WHERE date >= ?';
//       params.push(startDate);
//     } else if (endDate) {
//       sql += ' WHERE date <= ?';
//       params.push(endDate);
//     }

//     const result = await this.execSqlSingle<any>(sql, params);
//     return {
//       totalIncome: result?.totalIncome || 0,
//       totalExpenses: result?.totalExpenses || 0,
//       netCashFlow: result?.netCashFlow || 0,
//       transactionCount: result?.transactionCount || 0,
//       avgTransactionAmount: result?.avgTransactionAmount || 0,
//     };
//   }

//   static async getCategoryTotals(startDate?: string, endDate?: string): Promise<Array<{
//     category: string;
//     total: number;
//     count: number;
//   }>> {
//     let sql = `SELECT category, SUM(ABS(amount)) as total, COUNT(*) as count FROM transactions`;
//     const params: string[] = [];
//     if (startDate && endDate) {
//       sql += ' WHERE date BETWEEN ? AND ?';
//       params.push(startDate, endDate);
//     } else if (startDate) {
//       sql += ' WHERE date >= ?';
//       params.push(startDate);
//     } else if (endDate) {
//       sql += ' WHERE date <= ?';
//       params.push(endDate);
//     }
//     sql += ' GROUP BY category ORDER BY total DESC';
//     return this.execSql<{ category: string; total: number; count: number }>(sql, params);
//   }

//   static async getTransactionsByPaymentMethod(paymentMethod: Transaction['paymentMethod']): Promise<Transaction[]> {
//     const rows = await this.execSql<TransactionRow>(
//       'SELECT * FROM transactions WHERE paymentMethod = ? ORDER BY date DESC',
//       [paymentMethod]
//     );
//     return rows.map(this.fromRow);
//   }
// }

// export const {
//   getTransactions,
//   getTransactionById,
//   getTransactionsByDateRange,
//   getTransactionsByCategory,
//   getTransactionsByStatus,
//   getIncomeTransactions,
//   getExpenseTransactions,
//   getRecentTransactions,
//   searchTransactions,
//   addTransaction,
//   updateTransaction,
//   deleteTransaction,
//   updateTransactionStatus,
//   getTransactionSummary,
//   getCategoryTotals,
//   getTransactionsByPaymentMethod
// } = TransactionService;

// console.log('✅ [TransactionService] Local-only transaction management ready');


// // import { dbPromise, handleSqlError } from '../lib/localDb';
// // import uuid from 'react-native-uuid';
// // import type { Transaction } from '../types';
// // import { validateDate } from '../screens/CashFlow/utils/helpers';

// // interface SQLTransaction {
// //   executeSql(
// //     sql: string,
// //     params?: any[],
// //     success?: (tx: SQLTransaction, results: SQLResultSet) => void,
// //     error?: (tx: SQLTransaction, err: any) => boolean
// //   ): void;
// // }

// // interface SQLResultSet {
// //   rows: {
// //     length: number;
// //     item(index: number): any;
// //   };
// // }

// // interface TransactionRow {
// //   id: string;
// //   date: string;
// //   amount: number;
// //   paymentMethod: string;
// //   description: string;
// //   category: string;
// //   recordedBy: string;
// //   paidBy: string;
// //   status: string;
// //   sourceId: string;
// //   sourceType: string;
// //   lastModified: number;
// // }

// // class TransactionService {
// //   private static async execSql<T>(sql: string, params: any[] = []): Promise<T[]> {
// //     const db = await dbPromise;
// //     return new Promise((resolve, reject) => {
// //       db.transaction(
// //         (tx: SQLTransaction) => {
// //           tx.executeSql(
// //             sql,
// //             params,
// //             (tx: SQLTransaction, results: SQLResultSet) => {
// //               const items: T[] = [];
// //               for (let i = 0; i < results.rows.length; i++) {
// //                 items.push(results.rows.item(i));
// //               }
// //               resolve(items);
// //             },
// //             (tx: SQLTransaction, err: any) => {
// //               handleSqlError(tx, err);
// //               reject(err);
// //               return true;
// //             }
// //           );
// //         },
// //         (error: any) => reject(error)
// //       );
// //     });
// //   }

// //   private static async execSqlSingle<T>(sql: string, params: any[] = []): Promise<T | null> {
// //     const results = await this.execSql<T>(sql, params);
// //     return results.length > 0 ? results[0] : null;
// //   }

// //   private static fromRow(row: TransactionRow): Transaction {
// //     return {
// //       id: row.id,
// //       date: validateDate(row.date, 'transaction-service', row.id),
// //       amount: row.amount,
// //       paymentMethod: row.paymentMethod as Transaction['paymentMethod'],
// //       description: row.description,
// //       category: row.category as Transaction['category'],
// //       recordedBy: row.recordedBy,
// //       paidBy: row.paidBy || '',
// //       status: row.status as Transaction['status'],
// //       sourceId: row.sourceId || '',
// //       sourceType: row.sourceType as Transaction['sourceType'],
// //       lastModified: row.lastModified,
// //     };
// //   }

// //   private static async saveTransaction(txn: Transaction): Promise<void> {
// //     const db = await dbPromise;
// //     return new Promise((resolve, reject) => {
// //       db.transaction(
// //         (tx: SQLTransaction) => {
// //           tx.executeSql(
// //             `INSERT OR REPLACE INTO transactions
// //              (id, date, amount, paymentMethod, description, category, recordedBy, paidBy, status, sourceId, sourceType, lastModified)
// //              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
// //             [
// //               txn.id,
// //               txn.date,
// //               txn.amount,
// //               txn.paymentMethod,
// //               txn.description,
// //               txn.category,
// //               txn.recordedBy,
// //               txn.paidBy || '',
// //               txn.status,
// //               txn.sourceId || '',
// //               txn.sourceType || '',
// //               txn.lastModified,
// //             ],
// //             () => resolve(),
// //             (tx: SQLTransaction, error: any) => {
// //               handleSqlError(tx, error);
// //               reject(error);
// //               return true;
// //             }
// //           );
// //         },
// //         (error: any) => reject(error)
// //       );
// //     });
// //   }

// //   static async getTransactions(): Promise<Transaction[]> {
// //     const rows = await this.execSql<TransactionRow>('SELECT * FROM transactions ORDER BY date DESC');
// //     return rows.map(this.fromRow);
// //   }

// //   static async getTransactionById(id: string): Promise<Transaction | null> {
// //     const row = await this.execSqlSingle<TransactionRow>('SELECT * FROM transactions WHERE id = ?', [id]);
// //     return row ? this.fromRow(row) : null;
// //   }

// //   static async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
// //     const rows = await this.execSql<TransactionRow>(
// //       'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
// //       [startDate, endDate]
// //     );
// //     return rows.map(this.fromRow);
// //   }

// //   static async getTransactionsByCategory(category: string): Promise<Transaction[]> {
// //     const rows = await this.execSql<TransactionRow>(
// //       'SELECT * FROM transactions WHERE category = ? ORDER BY date DESC',
// //       [category]
// //     );
// //     return rows.map(this.fromRow);
// //   }

// //   static async getTransactionsByStatus(status: 'Paid' | 'Pending'): Promise<Transaction[]> {
// //     const rows = await this.execSql<TransactionRow>(
// //       'SELECT * FROM transactions WHERE status = ? ORDER BY date DESC',
// //       [status]
// //     );
// //     return rows.map(this.fromRow);
// //   }

// //   static async getIncomeTransactions(): Promise<Transaction[]> {
// //     const rows = await this.execSql<TransactionRow>(
// //       'SELECT * FROM transactions WHERE amount > 0 ORDER BY date DESC'
// //     );
// //     return rows.map(this.fromRow);
// //   }

// //   static async getExpenseTransactions(): Promise<Transaction[]> {
// //     const rows = await this.execSql<TransactionRow>(
// //       'SELECT * FROM transactions WHERE amount < 0 ORDER BY date DESC'
// //     );
// //     return rows.map(this.fromRow);
// //   }

// //   static async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
// //     const rows = await this.execSql<TransactionRow>(
// //       'SELECT * FROM transactions ORDER BY date DESC, lastModified DESC LIMIT ?',
// //       [limit]
// //     );
// //     return rows.map(this.fromRow);
// //   }

// //   static async searchTransactions(query: string): Promise<Transaction[]> {
// //     const searchTerm = `%${query}%`;
// //     const rows = await this.execSql<TransactionRow>(
// //       'SELECT * FROM transactions WHERE description LIKE ? OR category LIKE ? ORDER BY date DESC',
// //       [searchTerm, searchTerm]
// //     );
// //     return rows.map(this.fromRow);
// //   }

// //   static async addTransaction(data: Omit<Transaction, 'id' | 'lastModified'>): Promise<Transaction> {
// //     const id = uuid.v4() as string;
// //     const now = Date.now();

// //     const transaction: Transaction = {
// //       id,
// //       ...data,
// //       date: validateDate(data.date, 'addTransaction', id),
// //       lastModified: now,
// //     };

// //     await this.saveTransaction(transaction);
// //     return transaction;
// //   }

// //   static async updateTransaction(
// //     id: string,
// //     data: Omit<Transaction, 'id' | 'lastModified'>
// //   ): Promise<Transaction> {
// //     const existing = await this.getTransactionById(id);
// //     if (!existing) {
// //       throw new Error(`Transaction ${id} not found`);
// //     }

// //     const updated: Transaction = {
// //       ...existing,
// //       ...data,
// //       id, 
// //       lastModified: Date.now(),
// //     };

// //     await this.saveTransaction(updated);
// //     return updated;
// //   }

// //   static async deleteTransaction(id: string): Promise<void> {
// //     const db = await dbPromise;
// //     return new Promise((resolve, reject) => {
// //       db.transaction(
// //         (tx: SQLTransaction) => {
// //           tx.executeSql(
// //             'DELETE FROM transactions WHERE id = ?',
// //             [id],
// //             () => resolve(),
// //             (tx: SQLTransaction, error: any) => {
// //               handleSqlError(tx, error);
// //               reject(error);
// //               return true;
// //             }
// //           );
// //         },
// //         (error: any) => reject(error)
// //       );
// //     });
// //   }
// //   static async updateTransactionStatus(
// //     transactionId: string,
// //     status: 'Paid' | 'Pending',
// //     paidBy: string,
// //     paymentMethod: Transaction['paymentMethod']
// //   ): Promise<Transaction | null> {
// //     const db = await dbPromise;
// //     const lastModified = Date.now();

// //     return new Promise((resolve, reject) => {
// //       db.transaction(
// //         (tx: SQLTransaction) => {
// //           tx.executeSql(
// //             'UPDATE transactions SET status = ?, paidBy = ?, paymentMethod = ?, lastModified = ? WHERE id = ?',
// //             [status, paidBy, paymentMethod, lastModified, transactionId],
// //             async () => {
// //               const updated = await this.getTransactionById(transactionId);
// //               resolve(updated);
// //             },
// //             (tx: SQLTransaction, error: any) => {
// //               handleSqlError(tx, error);
// //               reject(error);
// //               return true;
// //             }
// //           );
// //         },
// //         (error: any) => reject(error)
// //       );
// //     });
// //   }

// //   static async getTransactionSummary(startDate?: string, endDate?: string): Promise<{
// //     totalIncome: number;
// //     totalExpenses: number;
// //     netCashFlow: number;
// //     transactionCount: number;
// //     avgTransactionAmount: number;
// //   }> {
// //     let sql = `SELECT 
// //       SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as totalIncome,
// //       SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as totalExpenses,
// //       SUM(amount) as netCashFlow,
// //       COUNT(*) as transactionCount,
// //       AVG(ABS(amount)) as avgTransactionAmount
// //       FROM transactions`;
    
// //     const params: string[] = [];
// //     if (startDate && endDate) {
// //       sql += ' WHERE date BETWEEN ? AND ?';
// //       params.push(startDate, endDate);
// //     } else if (startDate) {
// //       sql += ' WHERE date >= ?';
// //       params.push(startDate);
// //     } else if (endDate) {
// //       sql += ' WHERE date <= ?';
// //       params.push(endDate);
// //     }

// //     const result = await this.execSqlSingle<any>(sql, params);
// //     return {
// //       totalIncome: result?.totalIncome || 0,
// //       totalExpenses: result?.totalExpenses || 0,
// //       netCashFlow: result?.netCashFlow || 0,
// //       transactionCount: result?.transactionCount || 0,
// //       avgTransactionAmount: result?.avgTransactionAmount || 0,
// //     };
// //   }

// //   static async getCategoryTotals(startDate?: string, endDate?: string): Promise<Array<{
// //     category: string;
// //     total: number;
// //     count: number;
// //   }>> {
// //     let sql = `SELECT category, SUM(ABS(amount)) as total, COUNT(*) as count FROM transactions`;
// //     const params: string[] = [];

// //     if (startDate && endDate) {
// //       sql += ' WHERE date BETWEEN ? AND ?';
// //       params.push(startDate, endDate);
// //     } else if (startDate) {
// //       sql += ' WHERE date >= ?';
// //       params.push(startDate);
// //     } else if (endDate) {
// //       sql += ' WHERE date <= ?';
// //       params.push(endDate);
// //     }

// //     sql += ' GROUP BY category ORDER BY total DESC';
// //     return this.execSql<{ category: string; total: number; count: number }>(sql, params);
// //   }

// //   static async getTransactionsByPaymentMethod(paymentMethod: Transaction['paymentMethod']): Promise<Transaction[]> {
// //     const rows = await this.execSql<TransactionRow>(
// //       'SELECT * FROM transactions WHERE paymentMethod = ? ORDER BY date DESC',
// //       [paymentMethod]
// //     );
// //     return rows.map(this.fromRow);
// //   }
// // }
// // export const {
// //   getTransactions,
// //   getTransactionById,
// //   getTransactionsByDateRange,
// //   getTransactionsByCategory,
// //   getTransactionsByStatus,
// //   getIncomeTransactions,
// //   getExpenseTransactions,
// //   getRecentTransactions,
// //   searchTransactions,
// //   addTransaction,
// //   updateTransaction,
// //   deleteTransaction,
// //   updateTransactionStatus,
// //   getTransactionSummary,
// //   getCategoryTotals,
// //   getTransactionsByPaymentMethod
// // } = TransactionService;

// // console.log('✅ [TransactionService] Local-only transaction management ready');
