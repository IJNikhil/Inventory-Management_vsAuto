// src/services/invoice-service.ts
import { BaseService } from './base-service';
import { databaseManager, executeQuery, executeUpdate } from '../lib/database/connection';
import type { Invoice, InvoiceItem, InvoiceWithItems, InvoiceCustomer, SQLTransaction } from '../types/database';

class InvoiceItemService extends BaseService<InvoiceItem> {
  protected tableName = 'invoice_items';

  protected mapFromDb(row: any): InvoiceItem {
    return {
      id: row.id,
      invoice_id: row.invoice_id,
      part_id: row.part_id || undefined,
      description: row.description || '',
      quantity: parseInt(row.quantity) || 0,
      unit_price: parseFloat(row.unit_price) || 0,
      discount_percentage: parseFloat(row.discount_percentage) || 0,
      tax_percentage: parseFloat(row.tax_percentage) || 0,
      line_total: parseFloat(row.line_total) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      version: row.version || 1
    };
  }

  protected mapToDb(entity: Partial<InvoiceItem>): Record<string, any> {
    return {
      id: entity.id,
      invoice_id: entity.invoice_id,
      part_id: entity.part_id || null,
      description: entity.description || '',
      quantity: entity.quantity || 0,
      unit_price: entity.unit_price || 0,
      discount_percentage: entity.discount_percentage || 0,
      tax_percentage: entity.tax_percentage || 0,
      line_total: entity.line_total || 0,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      version: entity.version
    };
  }

  async findByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
    return this.findAll({ where: { invoice_id: invoiceId } });
  }
}

class InvoiceService extends BaseService<Invoice> {
  protected tableName = 'invoices';
  private itemService = new InvoiceItemService();

  protected mapFromDb(row: any): Invoice {
    let customer: InvoiceCustomer;
    
    try {
      // ✅ FIXED: Handle both JSON and legacy formats
      if (row.customer) {
        customer = typeof row.customer === 'string' ? JSON.parse(row.customer) : row.customer;
      } else {
        // Fallback for legacy data
        customer = {
          name: row.customer_name || '',
          phone: row.customer_phone || '',
          email: row.customer_email || '',
          address: row.customer_address || ''
        };
      }
    } catch {
      customer = { 
        name: row.customer_name || row.customer || 'Unknown Customer',
        phone: '',
        email: '',
        address: ''
      };
    }

    return {
      id: row.id,
      invoice_number: row.invoice_number,
      customer,
      subtotal: parseFloat(row.subtotal) || 0,
      tax_amount: parseFloat(row.tax_amount) || 0,
      discount_amount: parseFloat(row.discount_amount) || 0,
      total: parseFloat(row.total) || 0,
      invoice_date: row.invoice_date,
      due_date: row.due_date || undefined,
      status: row.status || 'draft',
      payment_method: row.payment_method || undefined,
      notes: row.notes || undefined,
      generated_by: row.generated_by,
      payment_date: row.payment_date || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      version: row.version || 1
    };
  }

  protected mapToDb(entity: Partial<Invoice>): Record<string, any> {
    return {
      id: entity.id,
      invoice_number: entity.invoice_number,
      customer: JSON.stringify(entity.customer || {}), // ✅ FIXED: This now matches schema
      subtotal: entity.subtotal || 0,
      tax_amount: entity.tax_amount || 0,
      discount_amount: entity.discount_amount || 0,
      total: entity.total || 0,
      invoice_date: entity.invoice_date,
      due_date: entity.due_date || null,
      status: entity.status || 'draft',
      payment_method: entity.payment_method || null,
      notes: entity.notes || null,
      generated_by: entity.generated_by,
      payment_date: entity.payment_date || null,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      version: entity.version
    };
  }

  async generateInvoiceNumber(): Promise<string> {
    try {
      // ✅ FIXED: Generate sequential numbers like INV_0001, INV_0002
      const lastInvoice = await executeQuery<{ invoice_number: string }>(
        `SELECT invoice_number FROM invoices 
         WHERE invoice_number LIKE 'INV_%' 
         ORDER BY CAST(SUBSTR(invoice_number, 5) AS INTEGER) DESC LIMIT 1`
      );

      let sequence = 1;
      if (lastInvoice.length > 0) {
        const lastNumber = lastInvoice[0].invoice_number;
        const lastSequence = parseInt(lastNumber.replace('INV_', ''));
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }

      const invoiceNumber = `INV_${sequence.toString().padStart(4, '0')}`;
      console.log(`🔢 Generated invoice number: ${invoiceNumber}`);
      return invoiceNumber;
    } catch (error) {
      console.error('❌ Error generating invoice number:', error);
      // Fallback to timestamp-based if there's an error
      return `INV_${Date.now()}`;
    }
  }

  async createWithItems(
    invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'version'>,
    items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at' | 'version'>[]
  ): Promise<InvoiceWithItems> {
    this.validateRequired(invoiceData, ['invoice_date', 'generated_by']);
    
    if (items.length === 0) {
      throw new Error('Invoice must have at least one item');
    }

    // Generate invoice number if not provided
    if (!invoiceData.invoice_number) {
      invoiceData.invoice_number = await this.generateInvoiceNumber();
    }

    return await databaseManager.executeTransaction(async (tx: SQLTransaction) => {
      // Create the invoice
      const invoice = await this.create(invoiceData);
      
      // Create invoice items
      const createdItems = await this.itemService.createBatch(
        items.map(item => ({
          ...item,
          invoice_id: invoice.id
        }))
      );

      return {
        invoice,
        items: createdItems
      };
    });
  }

  async findWithItems(invoiceId: string): Promise<InvoiceWithItems | null> {
    const invoice = await this.findById(invoiceId);
    if (!invoice) return null;

    const items = await this.itemService.findByInvoiceId(invoiceId);
    return {
      invoice,
      items
    };
  }

  async findByStatus(status: Invoice['status']): Promise<Invoice[]> {
    return this.findAll({ where: { status }, orderBy: 'invoice_date', orderDirection: 'DESC' });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Invoice[]> {
    try {
      const sql = `
        SELECT * FROM invoices 
        WHERE invoice_date BETWEEN ? AND ?
        ORDER BY invoice_date DESC
      `;
      
      const rows = await executeQuery<any>(sql, [startDate, endDate]);
      return rows.map(row => this.mapFromDb(row));
    } catch (error) {
      console.error('Error finding invoices by date range:', error);
      throw error;
    }
  }

  async findOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const sql = `
        SELECT * FROM invoices 
        WHERE status IN ('sent', 'overdue') 
        AND due_date < ?
        ORDER BY due_date ASC
      `;
      
      const rows = await executeQuery<any>(sql, [today]);
      return rows.map(row => this.mapFromDb(row));
    } catch (error) {
      console.error('Error finding overdue invoices:', error);
      throw error;
    }
  }

  async markAsPaid(
    invoiceId: string, 
    paymentDate: string, 
    paymentMethod: Invoice['payment_method']
  ): Promise<Invoice | null> {
    return this.update(invoiceId, {
      status: 'paid',
      payment_date: paymentDate,
      payment_method: paymentMethod
    });
  }

  async updateStatus(invoiceId: string, status: Invoice['status']): Promise<Invoice | null> {
    const updates: Partial<Invoice> = { status };
    
    if (status === 'paid' && !updates.payment_date) {
      updates.payment_date = new Date().toISOString().split('T')[0];
    }
    return this.update(invoiceId, updates);
  }

  async getInvoiceStats(startDate?: string, endDate?: string): Promise<{
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    averageAmount: number;
  }> {
    let whereClause = '';
    const params: any[] = [];
    
    if (startDate && endDate) {
      whereClause = 'WHERE invoice_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      whereClause = 'WHERE invoice_date >= ?';
      params.push(startDate);
    } else if (endDate) {
      whereClause = 'WHERE invoice_date <= ?';
      params.push(endDate);
    }

    const sql = `
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(total), 0) as total_amount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN status IN ('draft', 'sent') THEN total ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN total ELSE 0 END), 0) as overdue_amount,
        COALESCE(AVG(total), 0) as average_amount
      FROM invoices
      ${whereClause}
    `;

    const result = await executeQuery<any>(sql, params);
    const row = result[0] || {};

    return {
      totalInvoices: row.total_invoices || 0,
      totalAmount: row.total_amount || 0,
      paidAmount: row.paid_amount || 0,
      pendingAmount: row.pending_amount || 0,
      overdueAmount: row.overdue_amount || 0,
      averageAmount: row.average_amount || 0
    };
  }

  async searchInvoices(searchTerm: string): Promise<Invoice[]> {
    try {
      const sql = `
        SELECT * FROM invoices 
        WHERE invoice_number LIKE ? 
        OR customer LIKE ? 
        OR notes LIKE ?
        ORDER BY invoice_date DESC
      `;
      
      const searchPattern = `%${searchTerm}%`;
      const rows = await executeQuery<any>(sql, [searchPattern, searchPattern, searchPattern]);
      return rows.map(row => this.mapFromDb(row));
    } catch (error) {
      console.error('Error searching invoices:', error);
      throw error;
    }
  }

  async getRecentInvoices(limit: number = 10): Promise<Invoice[]> {
    return this.findAll({
      limit,
      orderBy: 'created_at',
      orderDirection: 'DESC'
    });
  }
}

export const invoiceService = new InvoiceService();
export const invoiceItemService = new InvoiceItemService();

// Export individual methods for backward compatibility
export const {
  create: createInvoice,
  update: updateInvoice,
  delete: deleteInvoice,
  findById: getInvoiceById,
  findAll: getInvoices,
  createWithItems,
  findWithItems,
  findByStatus: getInvoicesByStatus,
  findByDateRange: getInvoicesByDateRange,
  findOverdueInvoices,
  markAsPaid,
  updateStatus: updateInvoiceStatus,
  getInvoiceStats,
  searchInvoices,
  getRecentInvoices
} = invoiceService;


// // src/services/invoice-service.ts

// import { dbPromise, handleSqlError } from '../lib/localDb';
// import { validateDate } from '../screens/CashFlow/utils/helpers';
// import type { Invoice, InvoiceItem, InvoiceCustomer } from '../types';

// // Explicit SQLite interfaces
// interface SQLTransaction {
//   executeSql(
//     sql: string,
//     params?: any[],
//     success?: (tx: SQLTransaction, results: SQLResultSet) => void,
//     error?: (tx: SQLTransaction, err: any) => boolean
//   ): void;
// }

// interface SQLResultSet {
//   rows: {
//     length: number;
//     item(index: number): any;
//   };
//   rowsAffected: number;
// }

// interface InvoiceRow {
//   id: string;
//   customer: string;
//   customerName: string;
//   items: string;
//   subtotal: number;
//   total: number;
//   date: string;
//   status: string;
//   paymentMethod: string;
//   notes: string;
//   generatedBy: string;
//   collectedBy?: string;
//   paymentDate?: string;
//   lastModified: number;
// }

// class InvoiceService {
//   private static async execSql<T>(
//     sql: string,
//     params: any[] = []
//   ): Promise<T[]> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             sql,
//             params,
//             (tx: SQLTransaction, results: SQLResultSet) => {
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

//   private static async execSqlSingle<T>(
//     sql: string,
//     params: any[] = []
//   ): Promise<T | null> {
//     const results = await this.execSql<T>(sql, params);
//     return results.length > 0 ? results[0] : null;
//   }

//   private static async generateInvoiceId(): Promise<string> {
//     const lastInvoice = await this.execSqlSingle<{ id: string }>(
//       "SELECT id FROM invoices WHERE id LIKE 'INV_%' ORDER BY id DESC LIMIT 1"
//     );

//     let num = 1;
//     if (lastInvoice) {
//       const match = lastInvoice.id.match(/^INV_(\d+)$/);
//       if (match) num = parseInt(match[1], 10) + 1;
//     }
//     return `INV_${num.toString().padStart(6, '0')}`;
//   }

//   private static fromRow(row: InvoiceRow): Invoice {
//     return {
//       id: row.id,
//       customer: JSON.parse(row.customer) as InvoiceCustomer,
//       customerName: row.customerName,
//       items: JSON.parse(row.items) as InvoiceItem[],
//       subtotal: row.subtotal,
//       total: row.total,
//       date: validateDate(row.date, 'invoice-service', row.id),
//       status: row.status as Invoice['status'],
//       paymentMethod: row.paymentMethod as Invoice['paymentMethod'],
//       notes: row.notes,
//       generatedBy: row.generatedBy,
//       collectedBy: row.collectedBy || undefined,
//       paymentDate: row.paymentDate || undefined,
//       lastModified: row.lastModified,
//     };
//   }

//   private static async updatePartQuantities(items: InvoiceItem[]): Promise<void> {
//     if (items.length === 0) return;
//     const db = await dbPromise;
//     const now = Date.now();
//     const partUpdates = new Map<string, number>();

//     for (const item of items) {
//       if (item.partId) {
//         partUpdates.set(item.partId, (partUpdates.get(item.partId) || 0) + item.quantity);
//       }
//     }

//     await Promise.allSettled(
//       Array.from(partUpdates.entries()).map(([partId, quantity]) =>
//         new Promise<void>((resolve) => {
//           db.transaction(
//             (tx: SQLTransaction) => {
//               tx.executeSql(
//                 'SELECT quantity FROM parts WHERE id = ?',
//                 [partId],
//                 (tx, results) => {
//                   if (results.rows.length > 0) {
//                     const currentQty = results.rows.item(0).quantity;
//                     const newQty = Math.max(currentQty - quantity, 0);
//                     const isLowStock = newQty < 10 ? 1 : 0;
//                     tx.executeSql(
//                       'UPDATE parts SET quantity = ?, isLowStock = ?, lastModified = ? WHERE id = ?',
//                       [newQty, isLowStock, now, partId],
//                       () => resolve(),
//                       (tx, err) => {
//                         handleSqlError(tx, err);
//                         resolve();
//                         return true;
//                       }
//                     );
//                   } else resolve();
//                 },
//                 (tx, err) => {
//                   handleSqlError(tx, err);
//                   resolve();
//                   return true;
//                 }
//               );
//             },
//             () => resolve()
//           );
//         })
//       )
//     );
//   }

//   private static async save(invoice: Invoice): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             `INSERT OR REPLACE INTO invoices
//             (id, customer, customerName, items, subtotal, total, date, status, paymentMethod, notes, generatedBy, collectedBy, paymentDate, lastModified)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//               invoice.id,
//               JSON.stringify(invoice.customer),
//               invoice.customerName,
//               JSON.stringify(invoice.items),
//               invoice.subtotal,
//               invoice.total,
//               invoice.date,
//               invoice.status,
//               invoice.paymentMethod,
//               invoice.notes,
//               invoice.generatedBy,
//               invoice.collectedBy ?? null,
//               invoice.paymentDate ?? null,
//               invoice.lastModified,
//             ],
//             () => resolve(),
//             (tx, err) => {
//               handleSqlError(tx, err);
//               reject(err);
//               return true;
//             }
//           );
//         },
//         (err: any): void => reject(err)
//       );
//     });
//   }

//   // Public API

//   static async getInvoices(): Promise<Invoice[]> {
//     const rows = await this.execSql<InvoiceRow>('SELECT * FROM invoices ORDER BY date DESC');
//     return rows.map(this.fromRow);
//   }

//   static async getInvoiceById(id: string): Promise<Invoice | null> {
//     const row = await this.execSqlSingle<InvoiceRow>('SELECT * FROM invoices WHERE id = ?', [id]);
//     return row ? this.fromRow(row) : null;
//   }

//   static async addInvoice(data: Omit<Invoice, 'id' | 'lastModified'>): Promise<Invoice> {
//     const id = await this.generateInvoiceId();
//     const now = Date.now();

//     const invoice: Invoice = {
//       id,
//       ...data,
//       customer: data.customer ?? { name: data.customerName ?? '', phone: '', address: '' },
//       customerName: data.customerName ?? (data.customer?.name ?? ''),
//       date: validateDate(data.date, 'addInvoice', id),
//       lastModified: now,
//     };

//     await this.save(invoice);

//     this.updatePartQuantities(invoice.items).catch(() => {
//       console.warn('Failed to update part quantities after invoice save');
//     });

//     return invoice;
//   }

//   static async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
//     const existing = await this.getInvoiceById(id);
//     if (!existing) throw new Error(`Invoice ${id} not found`);

//     const updated: Invoice = {
//       ...existing,
//       ...updates,
//       id,
//       lastModified: Date.now(),
//     };

//     await this.save(updated);
//     return updated;
//   }

//   static async deleteInvoice(id: string): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'DELETE FROM invoices WHERE id = ?',
//             [id],
//             () => resolve(),
//             (tx, err) => {
//               handleSqlError(tx, err);
//               reject(err);
//               return true;
//             }
//           );
//         },
//         (err: any): void => reject(err)
//       );
//     });
//   }

//   static async getInvoicesByDateRange(start: string, end: string): Promise<Invoice[]> {
//     const rows = await this.execSql<InvoiceRow>(
//       'SELECT * FROM invoices WHERE date BETWEEN ? AND ? ORDER BY date DESC',
//       [start, end]
//     );
//     return rows.map(this.fromRow);
//   }

//   static async searchInvoices(query: string): Promise<Invoice[]> {
//     const q = `%${query}%`;
//     const rows = await this.execSql<InvoiceRow>(
//       `SELECT * FROM invoices WHERE customerName LIKE ? OR notes LIKE ? OR id LIKE ? ORDER BY date DESC`,
//       [q, q, q]
//     );
//     return rows.map(this.fromRow);
//   }
// }

// // Bind static methods for safe direct usage
// export const getInvoices = InvoiceService.getInvoices.bind(InvoiceService);
// export const getInvoiceById = InvoiceService.getInvoiceById.bind(InvoiceService);
// export const addInvoice = InvoiceService.addInvoice.bind(InvoiceService);
// export const updateInvoice = InvoiceService.updateInvoice.bind(InvoiceService);
// export const deleteInvoice = InvoiceService.deleteInvoice.bind(InvoiceService);
// export const getInvoicesByDateRange = InvoiceService.getInvoicesByDateRange.bind(InvoiceService);
// export const searchInvoices = InvoiceService.searchInvoices.bind(InvoiceService);
