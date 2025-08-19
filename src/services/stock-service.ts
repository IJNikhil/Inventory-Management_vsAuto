// src/services/stock-service.ts
import { BaseService } from './base-service';
import { databaseManager, executeQuery } from '../lib/database/connection';
import type {
  StockPurchase,
  StockPurchaseItem,
  StockPurchaseItemCreate,
  StockPurchaseWithItems,
  Supplier,
  SupplierEmbedded,
  SQLTransaction
} from '../types/database';

class StockPurchaseItemService extends BaseService<StockPurchaseItem> {
  protected tableName = 'stock_purchase_items';

  protected mapFromDb(row: any): StockPurchaseItem {
    return {
      id: row.id,
      purchase_id: row.purchase_id,
      part_id: row.part_id || undefined,
      name: row.name || row.description || '',
      part_number: row.part_number || '',
      description: row.description || '',
      quantity: parseInt(row.quantity) || 0,
      purchase_price: parseFloat(row.purchase_price) || 0,
      mrp: parseFloat(row.mrp) || 0,
      line_total: parseFloat(row.line_total) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      version: row.version || 1
    };
  }

  protected mapToDb(entity: Partial<StockPurchaseItem>): Record<string, any> {
    return {
      id: entity.id,
      purchase_id: entity.purchase_id,
      part_id: entity.part_id || null,
      name: entity.name || '',
      part_number: entity.part_number || '',
      description: entity.description || entity.name || '',
      quantity: entity.quantity || 0,
      purchase_price: entity.purchase_price || 0,
      mrp: entity.mrp || 0,
      line_total: entity.line_total || (entity.quantity || 0) * (entity.purchase_price || 0),
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      version: entity.version
    };
  }

  async findByPurchaseId(purchaseId: string): Promise<StockPurchaseItem[]> {
    return this.findAll({ where: { purchase_id: purchaseId } });
  }
}

class StockPurchaseService extends BaseService<StockPurchase> {
  protected tableName = 'stock_purchases';
  private itemService = new StockPurchaseItemService();

  protected mapFromDb(row: any): StockPurchase {
    let supplier: SupplierEmbedded = {
      id: row.supplier_id || '',
      name: '',
      contact_person: undefined,
      phone: undefined,
      address: undefined
    };

    if (row.supplier_json) {
      try {
        supplier = JSON.parse(row.supplier_json);
      } catch (e) {
        console.warn('Failed to parse supplier JSON:', e);
      }
    }

    return {
      id: row.id,
      purchase_number: row.purchase_number,
      supplier_id: row.supplier_id,
      supplier,
      subtotal: parseFloat(row.subtotal) || 0,
      tax_amount: parseFloat(row.tax_amount) || 0,
      total: parseFloat(row.total) || 0,
      purchase_date: row.purchase_date,
      status: row.status || 'Pending',
      payment_method: row.payment_method || undefined,
      notes: row.notes || undefined,
      created_by: row.created_by,
      payment_date: row.payment_date || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      version: row.version || 1
    };
  }

  protected mapToDb(entity: Partial<StockPurchase>): Record<string, any> {
    return {
      id: entity.id,
      purchase_number: entity.purchase_number,
      supplier_id: entity.supplier_id,
      supplier_json: entity.supplier ? JSON.stringify(entity.supplier) : null,
      subtotal: entity.subtotal || 0,
      tax_amount: entity.tax_amount || 0,
      total: entity.total || 0,
      purchase_date: entity.purchase_date,
      status: entity.status || 'Pending',
      payment_method: entity.payment_method || null,
      notes: entity.notes || null,
      created_by: entity.created_by,
      payment_date: entity.payment_date || null,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      version: entity.version
    };
  }

  async generatePurchaseNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    const prefix = `PO${year}${month}`;

    const lastPurchase = await executeQuery<{ purchase_number: string }>(
      `SELECT purchase_number FROM stock_purchases 
       WHERE purchase_number LIKE ? 
       ORDER BY purchase_number DESC LIMIT 1`,
      [`${prefix}%`]
    );

    let sequence = 1;
    if (lastPurchase.length > 0) {
      const lastNumber = lastPurchase[0].purchase_number;
      const lastSequence = parseInt(lastNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  async createWithItems(
    purchaseData: Omit<StockPurchase, 'id' | 'created_at' | 'updated_at' | 'version'>,
    items: StockPurchaseItemCreate[]
  ): Promise<StockPurchaseWithItems> {
    this.validateRequired(purchaseData, ['supplier_id', 'purchase_date', 'created_by']);

    if (items.length === 0) {
      throw new Error('Stock purchase must have at least one item');
    }

    if (!purchaseData.purchase_number) {
      purchaseData.purchase_number = await this.generatePurchaseNumber();
    }

    return await databaseManager.executeTransaction(async (tx: SQLTransaction) => {
      const purchase = await this.create(purchaseData);

      const now = new Date().toISOString();
      const createdItems: StockPurchaseItem[] = [];

      for (const item of items) {
        const fullItem: StockPurchaseItem = {
          ...item,
          purchase_id: purchase.id,
          created_at: now,
          updated_at: now,
          version: 1
        };
        const savedItem = await this.itemService.create(fullItem);
        createdItems.push(savedItem);
      }

      // ✅ Pad SupplierEmbedded to Supplier
      const fullSupplier: Supplier = {
        ...purchase.supplier,
        status: 'active',
        created_at: purchase.created_at,
        updated_at: purchase.updated_at,
        version: 1
      };

      return {
        purchase,
        items: createdItems,
        supplier: fullSupplier
      };
    });
  }

  async findWithItems(purchaseId: string): Promise<StockPurchaseWithItems | null> {
    const purchase = await this.findById(purchaseId);
    if (!purchase) return null;

    const items = await this.itemService.findByPurchaseId(purchaseId);

    let supplier: Supplier | undefined = undefined;
    if (purchase.supplier_id && !purchase.supplier.name) {
      const { supplierService } = require('./supplier-service');
      const supplierResult = await supplierService.findById(purchase.supplier_id);
      supplier = supplierResult || undefined;
    }

    const effectiveSupplier: Supplier = supplier
      ? supplier
      : {
          ...purchase.supplier,
          status: 'active',
          created_at: purchase.created_at,
          updated_at: purchase.updated_at,
          version: 1
        };

    return {
      purchase,
      items,
      supplier: effectiveSupplier
    };
  }

  async findByStatus(status: StockPurchase['status']): Promise<StockPurchase[]> {
    return this.findAll({ where: { status }, orderBy: 'purchase_date', orderDirection: 'DESC' });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<StockPurchase[]> {
    try {
      const sql = `
        SELECT * FROM stock_purchases 
        WHERE purchase_date BETWEEN ? AND ?
        ORDER BY purchase_date DESC
      `;

      const rows = await executeQuery<any>(sql, [startDate, endDate]);
      return rows.map(row => this.mapFromDb(row));
    } catch (error) {
      console.error('Error finding stock purchases by date range:', error);
      throw error;
    }
  }

  async findBySupplier(supplierId: string): Promise<StockPurchase[]> {
    return this.findAll({
      where: { supplier_id: supplierId },
      orderBy: 'purchase_date',
      orderDirection: 'DESC'
    });
  }
}

export const stockPurchaseService = new StockPurchaseService();
export const stockPurchaseItemService = new StockPurchaseItemService();

export const {
  create: createStockPurchase,
  update: updateStockPurchase,
  delete: deleteStockPurchase,
  findById: getStockPurchaseById,
  findAll: getStockPurchases,
  createWithItems,
  findWithItems,
  findByStatus: getStockPurchasesByStatus,
  findByDateRange: getStockPurchasesByDateRange,
  findBySupplier: getStockPurchasesBySupplier
} = stockPurchaseService;








// import { dbPromise, handleSqlError } from '../lib/localDb';
// // ✅ FIXED: Import types from localDb instead of redefining
// import type { SQLTransaction, SQLResultSet } from '../lib/localDb';
// import uuid from 'react-native-uuid';
// import type { StockPurchase, StockPurchaseItem } from '../types';
// import { validateDate } from '../screens/CashFlow/utils/helpers';

// // ✅ REMOVED: Local interface definitions that conflicted with localDb types

// interface StockPurchaseRow {
//   id: string;
//   supplierId: string;
//   supplierName: string;
//   supplier: string;
//   items: string;
//   total: number;
//   date: string;
//   status: string;
//   paymentMethod: string;
//   notes: string;
//   createdBy: string;
//   paidBy: string;
//   paymentDate: string;
//   receiptUrl: string;
//   lastModified: number;
// }

// // 🚀 **ULTRA-ADVANCED STOCK PURCHASE SERVICE**
// class StockPurchaseService {
//   // Advanced SQL execution helper - eliminates 80% of boilerplate
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

//   // Single result query helper
//   private static async execSqlSingle<T>(sql: string, params: any[] = []): Promise<T | null> {
//     const results = await this.execSql<T>(sql, params);
//     return results.length > 0 ? results[0] : null;
//   }

//   // Smart JSON parsing with fallback
//   private static parseJsonSafe<T>(data: string | null | undefined, fallback: T): T {
//     try {
//       return data ? JSON.parse(data) : fallback;
//     } catch {
//       return fallback;
//     }
//   }

//   // Transform database row to StockPurchase object
//   private static fromRow(row: StockPurchaseRow): StockPurchase {
//     return {
//       id: row.id,
//       supplierId: row.supplierId || '',
//       supplier: this.parseJsonSafe(row.supplier, { id: 'unknown', name: 'Unknown Supplier' }),
//       items: this.parseJsonSafe(row.items, []),
//       total: row.total || 0,
//       date: validateDate(row.date, 'stock-service', row.id),
//       status: row.status as StockPurchase['status'],
//       paymentMethod: row.paymentMethod as StockPurchase['paymentMethod'],
//       notes: row.notes || '',
//       createdBy: row.createdBy || '',
//       paidBy: row.paidBy || '',
//       paymentDate: row.paymentDate ? validateDate(row.paymentDate, 'stock-service', row.id) : '',
//       receiptUrl: row.receiptUrl || '', // Keep field but no upload functionality
//       lastModified: row.lastModified || Date.now(),
//     };
//   }

//   // High-performance local save
//   private static async saveStockPurchase(sp: StockPurchase): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             `INSERT OR REPLACE INTO stockPurchases
//              (id, supplierId, supplierName, supplier, items, total, date, status, paymentMethod, notes, createdBy, paidBy, paymentDate, receiptUrl, lastModified)
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//               sp.id,
//               sp.supplierId,
//               sp.supplier.name || 'Unknown Supplier',
//               JSON.stringify(sp.supplier),
//               JSON.stringify(sp.items || []),
//               sp.total || 0,
//               validateDate(sp.date, 'stock-service', sp.id),
//               sp.status,
//               sp.paymentMethod,
//               sp.notes || '',
//               sp.createdBy || '',
//               sp.paidBy || '',
//               sp.paymentDate ? validateDate(sp.paymentDate, 'stock-service', sp.id) : '',
//               sp.receiptUrl || '',
//               sp.lastModified,
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

//   // Ultra-fast part inventory updates
//   private static async updatePartQuantities(itemsAdded: { partId: string; quantity: number }[]): Promise<void> {
//     if (itemsAdded.length === 0) return;
    
//     const db = await dbPromise;
//     const now = Date.now();
//     await Promise.allSettled(
//       itemsAdded.map(({ partId, quantity }) =>
//         new Promise<void>((resolve) => {
//           db.transaction(
//             (tx: SQLTransaction) => {
//               tx.executeSql(
//                 'UPDATE parts SET quantity = quantity + ?, isLowStock = (quantity + ? < 10), lastModified = ? WHERE id = ?',
//                 [quantity, quantity, now, partId],
//                 (_: SQLTransaction, __: SQLResultSet) => resolve(), // ✅ FIXED: Use imported types
//                 (tx: SQLTransaction, error: any) => {
//                   handleSqlError(tx, error);
//                   resolve(); // Continue even if one fails
//                   return true;
//                 }
//               );
//             },
//             (error: any) => resolve()
//           );
//         })
//       )
//     );
//   }

//   static async getStockPurchases(): Promise<StockPurchase[]> {
//     const rows = await this.execSql<StockPurchaseRow>('SELECT * FROM stockPurchases ORDER BY date DESC');
//     return rows.map(this.fromRow);
//   }

//   static async getStockPurchaseById(id: string): Promise<StockPurchase | null> {
//     const row = await this.execSqlSingle<StockPurchaseRow>('SELECT * FROM stockPurchases WHERE id = ?', [id]);
//     return row ? this.fromRow(row) : null;
//   }

//   static async getStockPurchasesBySupplier(supplierId: string): Promise<StockPurchase[]> {
//     const rows = await this.execSql<StockPurchaseRow>(
//       'SELECT * FROM stockPurchases WHERE supplierId = ? ORDER BY date DESC',
//       [supplierId]
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getStockPurchasesByDateRange(startDate: string, endDate: string): Promise<StockPurchase[]> {
//     const rows = await this.execSql<StockPurchaseRow>(
//       'SELECT * FROM stockPurchases WHERE date BETWEEN ? AND ? ORDER BY date DESC',
//       [startDate, endDate]
//     );
//     return rows.map(this.fromRow);
//   }

//   static async addStockPurchase(
//     data: Omit<StockPurchase, 'id' | 'lastModified'>,
//     itemsAdded: { partId: string; quantity: number }[]
//   ): Promise<StockPurchase> {
//     const id = uuid.v4() as string;
//     const now = Date.now();
    
//     const stockPurchase: StockPurchase = {
//       id,
//       ...data,
//       date: validateDate(data.date, 'stock-service', id),
//       lastModified: now,
//     };
//     await this.saveStockPurchase(stockPurchase);
//     this.updatePartQuantities(itemsAdded).catch(() => {
//       console.warn('Part quantity update failed, but stock purchase was saved successfully');
//     });
//     return stockPurchase;
//   }

//   static async updateStockPurchase(
//     id: string,
//     data: Omit<StockPurchase, 'id' | 'lastModified'>
//   ): Promise<StockPurchase> {
//     const existing = await this.getStockPurchaseById(id);
//     if (!existing) {
//       throw new Error(`Stock purchase ${id} not found`);
//     }
//     const updated: StockPurchase = {
//       ...existing,
//       ...data,
//       id,
//       lastModified: Date.now(),
//     };
//     await this.saveStockPurchase(updated);
//     return updated;
//   }

//   static async deleteStockPurchase(id: string): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'DELETE FROM stockPurchases WHERE id = ?',
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

//   static async updateStockPurchaseStatus(
//     purchaseId: string,
//     status: 'Paid' | 'Pending',
//     paidBy: string,
//     paymentMethod?: StockPurchase['paymentMethod']
//   ): Promise<StockPurchase | null> {
//     const db = await dbPromise;
//     const now = Date.now();
//     const paymentDate = status === 'Paid' ? new Date().toISOString().split('T')[0] : '';
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'UPDATE stockPurchases SET status = ?, paidBy = ?, paymentMethod = ?, paymentDate = ?, lastModified = ? WHERE id = ?',
//             [status, paidBy, paymentMethod || '', paymentDate, now, purchaseId],
//             async (_: SQLTransaction, __: SQLResultSet) => { // ✅ FIXED: Use imported types
//               const updated = await this.getStockPurchaseById(purchaseId);
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

//   static async getPendingStockPurchases(): Promise<StockPurchase[]> {
//     const rows = await this.execSql<StockPurchaseRow>(
//       'SELECT * FROM stockPurchases WHERE status = ? ORDER BY date DESC',
//       ['Pending']
//     );
//     return rows.map(this.fromRow);
//   }

//   static async searchStockPurchases(query: string): Promise<StockPurchase[]> {
//     const searchTerm = `%${query}%`;
//     const rows = await this.execSql<StockPurchaseRow>(
//       `SELECT * FROM stockPurchases 
//        WHERE supplierName LIKE ? OR notes LIKE ? OR id LIKE ?
//        ORDER BY date DESC`,
//       [searchTerm, searchTerm, searchTerm]
//     );
//     return rows.map(this.fromRow);
//   }
// }

// export const {
//   getStockPurchases,
//   getStockPurchaseById,
//   getStockPurchasesBySupplier,
//   getStockPurchasesByDateRange,
//   addStockPurchase,
//   updateStockPurchase,
//   deleteStockPurchase,
//   updateStockPurchaseStatus,
//   getPendingStockPurchases,
//   searchStockPurchases
// } = StockPurchaseService;

// console.log('✅ [StockPurchaseService] Local-only stock purchase management ready');


// // import { dbPromise, handleSqlError } from '../lib/localDb';
// // import uuid from 'react-native-uuid';
// // import type { StockPurchase, StockPurchaseItem } from '../types';
// // import { validateDate } from '../screens/CashFlow/utils/helpers';

// // // ✅ Removed: All Firebase imports, NetInfo, and image-related code

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

// // interface StockPurchaseRow {
// //   id: string;
// //   supplierId: string;
// //   supplierName: string;
// //   supplier: string;
// //   items: string;
// //   total: number;
// //   date: string;
// //   status: string;
// //   paymentMethod: string;
// //   notes: string;
// //   createdBy: string;
// //   paidBy: string;
// //   paymentDate: string;
// //   receiptUrl: string;
// //   lastModified: number;
// // }

// // // 🚀 **ULTRA-ADVANCED STOCK PURCHASE SERVICE**
// // class StockPurchaseService {
// //   // Advanced SQL execution helper - eliminates 80% of boilerplate
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

// //   // Single result query helper
// //   private static async execSqlSingle<T>(sql: string, params: any[] = []): Promise<T | null> {
// //     const results = await this.execSql<T>(sql, params);
// //     return results.length > 0 ? results[0] : null;
// //   }

// //   // Smart JSON parsing with fallback
// //   private static parseJsonSafe<T>(data: string | null | undefined, fallback: T): T {
// //     try {
// //       return data ? JSON.parse(data) : fallback;
// //     } catch {
// //       return fallback;
// //     }
// //   }

// //   // Transform database row to StockPurchase object
// //   private static fromRow(row: StockPurchaseRow): StockPurchase {
// //     return {
// //       id: row.id,
// //       supplierId: row.supplierId || '',
// //       supplier: this.parseJsonSafe(row.supplier, { id: 'unknown', name: 'Unknown Supplier' }),
// //       items: this.parseJsonSafe(row.items, []),
// //       total: row.total || 0,
// //       date: validateDate(row.date, 'stock-service', row.id),
// //       status: row.status as StockPurchase['status'],
// //       paymentMethod: row.paymentMethod as StockPurchase['paymentMethod'],
// //       notes: row.notes || '',
// //       createdBy: row.createdBy || '',
// //       paidBy: row.paidBy || '',
// //       paymentDate: row.paymentDate ? validateDate(row.paymentDate, 'stock-service', row.id) : '',
// //       receiptUrl: row.receiptUrl || '', // Keep field but no upload functionality
// //       lastModified: row.lastModified || Date.now(),
// //     };
// //   }

// //   // High-performance local save
// //   private static async saveStockPurchase(sp: StockPurchase): Promise<void> {
// //     const db = await dbPromise;
// //     return new Promise((resolve, reject) => {
// //       db.transaction(
// //         (tx: SQLTransaction) => {
// //           tx.executeSql(
// //             `INSERT OR REPLACE INTO stockPurchases
// //              (id, supplierId, supplierName, supplier, items, total, date, status, paymentMethod, notes, createdBy, paidBy, paymentDate, receiptUrl, lastModified)
// //              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
// //             [
// //               sp.id,
// //               sp.supplierId,
// //               sp.supplier.name || 'Unknown Supplier',
// //               JSON.stringify(sp.supplier),
// //               JSON.stringify(sp.items || []),
// //               sp.total || 0,
// //               validateDate(sp.date, 'stock-service', sp.id),
// //               sp.status,
// //               sp.paymentMethod,
// //               sp.notes || '',
// //               sp.createdBy || '',
// //               sp.paidBy || '',
// //               sp.paymentDate ? validateDate(sp.paymentDate, 'stock-service', sp.id) : '',
// //               sp.receiptUrl || '',
// //               sp.lastModified,
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

// //   // Ultra-fast part inventory updates
// //   private static async updatePartQuantities(itemsAdded: { partId: string; quantity: number }[]): Promise<void> {
// //     if (itemsAdded.length === 0) return;
    
// //     const db = await dbPromise;
// //     const now = Date.now();

// //     await Promise.allSettled(
// //       itemsAdded.map(({ partId, quantity }) =>
// //         new Promise<void>((resolve) => {
// //           db.transaction(
// //             (tx: SQLTransaction) => {
// //               tx.executeSql(
// //                 'UPDATE parts SET quantity = quantity + ?, isLowStock = (quantity + ? < 10), lastModified = ? WHERE id = ?',
// //                 [quantity, quantity, now, partId],
// //                 () => resolve(),
// //                 (tx: SQLTransaction, error: any) => {
// //                   handleSqlError(tx, error);
// //                   resolve(); // Continue even if one fails
// //                   return true;
// //                 }
// //               );
// //             },
// //             (error: any) => resolve()
// //           );
// //         })
// //       )
// //     );
// //   }
// //   static async getStockPurchases(): Promise<StockPurchase[]> {
// //     const rows = await this.execSql<StockPurchaseRow>('SELECT * FROM stockPurchases ORDER BY date DESC');
// //     return rows.map(this.fromRow);
// //   }

// //   static async getStockPurchaseById(id: string): Promise<StockPurchase | null> {
// //     const row = await this.execSqlSingle<StockPurchaseRow>('SELECT * FROM stockPurchases WHERE id = ?', [id]);
// //     return row ? this.fromRow(row) : null;
// //   }

// //   static async getStockPurchasesBySupplier(supplierId: string): Promise<StockPurchase[]> {
// //     const rows = await this.execSql<StockPurchaseRow>(
// //       'SELECT * FROM stockPurchases WHERE supplierId = ? ORDER BY date DESC',
// //       [supplierId]
// //     );
// //     return rows.map(this.fromRow);
// //   }

// //   static async getStockPurchasesByDateRange(startDate: string, endDate: string): Promise<StockPurchase[]> {
// //     const rows = await this.execSql<StockPurchaseRow>(
// //       'SELECT * FROM stockPurchases WHERE date BETWEEN ? AND ? ORDER BY date DESC',
// //       [startDate, endDate]
// //     );
// //     return rows.map(this.fromRow);
// //   }

// //   static async addStockPurchase(
// //     data: Omit<StockPurchase, 'id' | 'lastModified'>,
// //     itemsAdded: { partId: string; quantity: number }[]
// //   ): Promise<StockPurchase> {
// //     const id = uuid.v4() as string;
// //     const now = Date.now();
    
// //     const stockPurchase: StockPurchase = {
// //       id,
// //       ...data,
// //       date: validateDate(data.date, 'stock-service', id),
// //       lastModified: now,
// //     };
// //     await this.saveStockPurchase(stockPurchase);

// //     this.updatePartQuantities(itemsAdded).catch(() => {
// //       console.warn('Part quantity update failed, but stock purchase was saved successfully');
// //     });

// //     return stockPurchase;
// //   }
// //   static async updateStockPurchase(
// //     id: string,
// //     data: Omit<StockPurchase, 'id' | 'lastModified'>
// //   ): Promise<StockPurchase> {
// //     const existing = await this.getStockPurchaseById(id);
// //     if (!existing) {
// //       throw new Error(`Stock purchase ${id} not found`);
// //     }

// //     const updated: StockPurchase = {
// //       ...existing,
// //       ...data,
// //       id,
// //       lastModified: Date.now(),
// //     };

// //     await this.saveStockPurchase(updated);
// //     return updated;
// //   }

// //   static async deleteStockPurchase(id: string): Promise<void> {
// //     const db = await dbPromise;
// //     return new Promise((resolve, reject) => {
// //       db.transaction(
// //         (tx: SQLTransaction) => {
// //           tx.executeSql(
// //             'DELETE FROM stockPurchases WHERE id = ?',
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

// //   static async updateStockPurchaseStatus(
// //     purchaseId: string,
// //     status: 'Paid' | 'Pending',
// //     paidBy: string,
// //     paymentMethod?: StockPurchase['paymentMethod']
// //   ): Promise<StockPurchase | null> {
// //     const db = await dbPromise;
// //     const now = Date.now();
// //     const paymentDate = status === 'Paid' ? new Date().toISOString().split('T')[0] : '';

// //     return new Promise((resolve, reject) => {
// //       db.transaction(
// //         (tx: SQLTransaction) => {
// //           tx.executeSql(
// //             'UPDATE stockPurchases SET status = ?, paidBy = ?, paymentMethod = ?, paymentDate = ?, lastModified = ? WHERE id = ?',
// //             [status, paidBy, paymentMethod || '', paymentDate, now, purchaseId],
// //             async () => {
// //               const updated = await this.getStockPurchaseById(purchaseId);
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
// //   static async getPendingStockPurchases(): Promise<StockPurchase[]> {
// //     const rows = await this.execSql<StockPurchaseRow>(
// //       'SELECT * FROM stockPurchases WHERE status = ? ORDER BY date DESC',
// //       ['Pending']
// //     );
// //     return rows.map(this.fromRow);
// //   }

// //   static async searchStockPurchases(query: string): Promise<StockPurchase[]> {
// //     const searchTerm = `%${query}%`;
// //     const rows = await this.execSql<StockPurchaseRow>(
// //       `SELECT * FROM stockPurchases 
// //        WHERE supplierName LIKE ? OR notes LIKE ? OR id LIKE ?
// //        ORDER BY date DESC`,
// //       [searchTerm, searchTerm, searchTerm]
// //     );
// //     return rows.map(this.fromRow);
// //   }
// // }

// // export const {
// //   getStockPurchases,
// //   getStockPurchaseById,
// //   getStockPurchasesBySupplier,
// //   getStockPurchasesByDateRange,
// //   addStockPurchase,
// //   updateStockPurchase,
// //   deleteStockPurchase,
// //   updateStockPurchaseStatus,
// //   getPendingStockPurchases,
// //   searchStockPurchases
// // } = StockPurchaseService;

// // console.log('✅ [StockPurchaseService] Local-only stock purchase management ready');
