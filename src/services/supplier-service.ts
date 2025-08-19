// src/services/supplier-service.ts
import { BaseService } from './base-service';
import { executeQuery } from '../lib/database/connection';
import type { Supplier } from '../types/database';

class SupplierService extends BaseService<Supplier> {
  protected tableName = 'suppliers';

  protected mapFromDb(row: any): Supplier {
    return {
      id: row.id,
      name: row.name || '',
      contact_person: row.contact_person || undefined,
      phone: row.phone || undefined,
      email: row.email || undefined,
      address: row.address || undefined,
      status: row.status || 'active',
      created_at: row.created_at,
      updated_at: row.updated_at,
      version: row.version || 1
    };
  }

  protected mapToDb(entity: Partial<Supplier>): Record<string, any> {
    return {
      id: entity.id,
      name: entity.name ? this.sanitizeString(entity.name) : '',
      contact_person: entity.contact_person || null,
      phone: entity.phone || null,
      email: entity.email || null,
      address: entity.address || null,
      status: entity.status || 'active',
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      version: entity.version
    };
  }

  // ✅ ADDED: Phone validation method (10 digits, flexible input)
  protected validateSupplierPhone(phone: string): boolean {
    if (!phone || phone.trim() === '') {
      return true; // Phone is optional for suppliers
    }
    
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it's exactly 10 digits
    return digitsOnly.length === 10;
  }

  // ✅ ADDED: Email validation method
  protected validateSupplierEmail(email: string): boolean {
    if (!email || email.trim() === '') {
      return true; // Email is optional for suppliers
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ✅ ADDED: Format phone number to store only digits
  private formatPhone(phone: string): string {
    if (!phone || phone.trim() === '') {
      return '';
    }
    
    // Return only digits
    return phone.replace(/\D/g, '');
  }

  async create(data: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<Supplier> {
    this.validateRequired(data, ['name']);
    
    // ✅ ENHANCED: Validate and format phone
    if (data.phone && !this.validateSupplierPhone(data.phone)) {
      throw new Error('Invalid phone format - must be 10 digits');
    }

    // ✅ ENHANCED: Validate email
    if (data.email && !this.validateSupplierEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // ✅ ENHANCED: Validate supplier name
    if (!data.name || data.name.trim() === '') {
      throw new Error('Supplier name is required');
    }

    // Format phone number (remove non-digits)
    const formattedData = {
      ...data,
      phone: data.phone ? this.formatPhone(data.phone) : undefined,
      name: data.name.trim(),
      contact_person: data.contact_person ? data.contact_person.trim() : undefined,
      email: data.email ? data.email.trim().toLowerCase() : undefined,
      address: data.address ? data.address.trim() : undefined
    };

    console.log('✅ Creating supplier with formatted data:', formattedData);
    return super.create(formattedData);
  }

  async update(id: string, data: Partial<Supplier>): Promise<Supplier | null> {
    // ✅ ENHANCED: Validate phone if being updated
    if (data.phone !== undefined && data.phone && !this.validateSupplierPhone(data.phone)) {
      throw new Error('Invalid phone format - must be 10 digits');
    }

    // ✅ ENHANCED: Validate email if being updated
    if (data.email !== undefined && data.email && !this.validateSupplierEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // ✅ ENHANCED: Validate name if being updated
    if (data.name !== undefined && (!data.name || data.name.trim() === '')) {
      throw new Error('Supplier name cannot be empty');
    }

    // Format data
    const formattedData = {
      ...data
    };

    // Format phone if provided
    if (data.phone !== undefined) {
      formattedData.phone = data.phone ? this.formatPhone(data.phone) : undefined;
    }

    // Trim strings
    if (data.name !== undefined) {
      formattedData.name = data.name.trim();
    }
    if (data.contact_person !== undefined) {
      formattedData.contact_person = data.contact_person ? data.contact_person.trim() : undefined;  
    }
    if (data.email !== undefined) {
      formattedData.email = data.email ? data.email.trim().toLowerCase() : undefined;
    }
    if (data.address !== undefined) {
      formattedData.address = data.address ? data.address.trim() : undefined;
    }

    console.log('✅ Updating supplier with formatted data:', formattedData);
    return super.update(id, formattedData);
  }

  async findByName(name: string): Promise<Supplier | null> {
    return this.findFirst({ name: name.trim() });
  }

  async searchSuppliers(searchTerm: string): Promise<Supplier[]> {
    return this.search(searchTerm, ['name', 'contact_person', 'email', 'phone']);
  }

  async findActiveSuppliers(): Promise<Supplier[]> {
    return this.findAll({ 
      where: { status: 'active' }, 
      orderBy: 'name' 
    });
  }

  async findInactiveSuppliers(): Promise<Supplier[]> {
    return this.findAll({ 
      where: { status: 'inactive' }, 
      orderBy: 'name' 
    });
  }

  async getSuppliersCount(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active, inactive] = await Promise.all([
      this.count(),
      this.count({ status: 'active' }),
      this.count({ status: 'inactive' })
    ]);

    return {
      total,
      active,
      inactive
    };
  }

  // ✅ ADDED: Method to validate supplier data before saving
  async validateSupplierData(data: Partial<Supplier>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (data.name !== undefined && (!data.name || data.name.trim() === '')) {
      errors.push('Supplier name is required');
    }

    if (data.phone && !this.validateSupplierPhone(data.phone)) {
      errors.push('Invalid phone format - must be 10 digits');
    }

    if (data.email && !this.validateSupplierEmail(data.email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const supplierService = new SupplierService();

// Export individual methods for backward compatibility
export const {
  create: createSupplier,
  update: updateSupplier,
  delete: deleteSupplier,
  findById: getSupplierById,
  findAll: getSuppliers,
  findByName,
  searchSuppliers,
  findActiveSuppliers,
  findInactiveSuppliers,
  getSuppliersCount,
  validateSupplierData
} = supplierService;



// import { dbPromise, handleSqlError } from '../lib/localDb';
// // ✅ FIXED: Import types from localDb instead of redefining locally
// import type { SQLTransaction, SQLResultSet } from '../lib/localDb';
// import uuid from 'react-native-uuid';
// import type { Supplier, Part } from '../types';

// // ✅ REMOVED: Local interface definitions that conflicted with localDb types

// interface SupplierRow {
//   id: string;
//   name: string;
//   contactPerson: string;
//   phone: string;
//   email: string;
//   address: string;
//   status: string;
//   lastModified: number;
// }

// class SupplierService {
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

//   private static fromRow(row: SupplierRow): Supplier {
//     return {
//       id: row.id,
//       name: row.name || 'Unknown Supplier',
//       contactPerson: row.contactPerson || '',
//       phone: row.phone || '',
//       email: row.email || '',
//       address: row.address || '',
//       status: (row.status as Supplier['status']) || 'active',
//       lastModified: row.lastModified || Date.now(),
//     };
//   }

//   private static async saveSupplier(supplier: Supplier): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             `INSERT OR REPLACE INTO suppliers
//              (id, name, contactPerson, phone, email, address, status, lastModified)
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//               supplier.id,
//               supplier.name,
//               supplier.contactPerson || '',
//               supplier.phone || '',
//               supplier.email || '',
//               supplier.address || '',
//               supplier.status,
//               supplier.lastModified,
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

//   static async getSuppliers(): Promise<Supplier[]> {
//     const rows = await this.execSql<SupplierRow>('SELECT * FROM suppliers WHERE status = ? ORDER BY name', ['active']);
//     return rows.map(this.fromRow);
//   }

//   static async getAllSuppliers(): Promise<Supplier[]> {
//     const rows = await this.execSql<SupplierRow>('SELECT * FROM suppliers ORDER BY name');
//     return rows.map(this.fromRow);
//   }

//   static async getSupplierById(id: string): Promise<Supplier | null> {
//     const row = await this.execSqlSingle<SupplierRow>('SELECT * FROM suppliers WHERE id = ?', [id]);
//     return row ? this.fromRow(row) : null;
//   }

//   static async getSuppliersByStatus(status: 'active' | 'inactive'): Promise<Supplier[]> {
//     const rows = await this.execSql<SupplierRow>('SELECT * FROM suppliers WHERE status = ? ORDER BY name', [status]);
//     return rows.map(this.fromRow);
//   }

//   static async searchSuppliers(query: string): Promise<Supplier[]> {
//     const searchTerm = `%${query}%`;
//     const rows = await this.execSql<SupplierRow>(
//       `SELECT * FROM suppliers 
//        WHERE (name LIKE ? OR contactPerson LIKE ? OR phone LIKE ?) AND status = 'active' 
//        ORDER BY name`,
//       [searchTerm, searchTerm, searchTerm]
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getSupplierParts(supplierId: string): Promise<Part[]> {
//     return this.execSql<Part>(
//       'SELECT * FROM parts WHERE supplierId = ? AND status = ? ORDER BY name',
//       [supplierId, 'active']
//     );
//   }

//   static async addSupplier(data: Omit<Supplier, 'id' | 'lastModified'>): Promise<Supplier> {
//     const id = uuid.v4() as string;
//     const supplier: Supplier = {
//       id,
//       ...data,
//       status: data.status || 'active',
//       lastModified: Date.now(),
//     };
//     await this.saveSupplier(supplier);
//     return supplier;
//   }

//   static async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
//     const fields: string[] = [];
//     const values: any[] = [];
//     const lastModified = Date.now();

//     Object.entries(updates).forEach(([key, value]) => {
//       if (value !== undefined) {
//         fields.push(`${key} = ?`);
//         values.push(value);
//       }
//     });

//     if (fields.length === 0) return null;

//     fields.push('lastModified = ?');
//     values.push(lastModified, id);

//     const db = await dbPromise;
//     await new Promise<void>((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             `UPDATE suppliers SET ${fields.join(', ')} WHERE id = ?`,
//             values,
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

//     return this.getSupplierById(id);
//   }

//   static async deleteSupplier(id: string): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'DELETE FROM suppliers WHERE id = ?',
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

//   static async deactivateSupplier(id: string): Promise<void> {
//     await this.updateSupplier(id, { status: 'inactive' });
//   }

//   static async restoreSupplier(id: string): Promise<void> {
//     await this.updateSupplier(id, { status: 'active' });
//   }

//   static async getSupplierStats(supplierId: string): Promise<{
//     totalPurchases: number;
//     totalAmount: number;
//     pendingAmount: number;
//     partsCount: number;
//   }> {
//     const [purchaseStats, pendingStats, partsStats] = await Promise.all([
//       this.execSqlSingle<{ totalPurchases: number; totalAmount: number }>(
//         'SELECT COUNT(*) as totalPurchases, SUM(total) as totalAmount FROM stockPurchases WHERE supplierId = ?',
//         [supplierId]
//       ),
//       this.execSqlSingle<{ pendingAmount: number }>(
//         'SELECT SUM(total) as pendingAmount FROM stockPurchases WHERE supplierId = ? AND status = ?',
//         [supplierId, 'Pending']
//       ),
//       this.execSqlSingle<{ partsCount: number }>(
//         'SELECT COUNT(*) as partsCount FROM parts WHERE supplierId = ? AND status = ?',
//         [supplierId, 'active']
//       ),
//     ]);

//     return {
//       totalPurchases: purchaseStats?.totalPurchases || 0,
//       totalAmount: purchaseStats?.totalAmount || 0,
//       pendingAmount: pendingStats?.pendingAmount || 0,
//       partsCount: partsStats?.partsCount || 0,
//     };
//   }

//   static async getSuppliersWithPartsCount(): Promise<Array<{ supplier: Supplier; partsCount: number }>> {
//     const suppliers = await this.getSuppliers();
//     const results = await Promise.all(
//       suppliers.map(async supplier => {
//         const parts = await this.execSql<{ count: number }>(
//           'SELECT COUNT(*) as count FROM parts WHERE supplierId = ? AND status = ?',
//           [supplier.id, 'active']
//         );
//         return {
//           supplier,
//           partsCount: parts[0]?.count || 0
//         };
//       })
//     );
//     return results;
//   }
// }

// // Bind all static methods on export for safety
// export const getSuppliers = SupplierService.getSuppliers.bind(SupplierService);
// export const getAllSuppliers = SupplierService.getAllSuppliers.bind(SupplierService);
// export const getSupplierById = SupplierService.getSupplierById.bind(SupplierService);
// export const getSuppliersByStatus = SupplierService.getSuppliersByStatus.bind(SupplierService);
// export const searchSuppliers = SupplierService.searchSuppliers.bind(SupplierService);
// export const getSupplierParts = SupplierService.getSupplierParts.bind(SupplierService);
// export const addSupplier = SupplierService.addSupplier.bind(SupplierService);
// export const updateSupplier = SupplierService.updateSupplier.bind(SupplierService);
// export const deleteSupplier = SupplierService.deleteSupplier.bind(SupplierService);
// export const deactivateSupplier = SupplierService.deactivateSupplier.bind(SupplierService);
// export const restoreSupplier = SupplierService.restoreSupplier.bind(SupplierService);
// export const getSupplierStats = SupplierService.getSupplierStats.bind(SupplierService);
// export const getSuppliersWithPartsCount = SupplierService.getSuppliersWithPartsCount.bind(SupplierService);

// console.log('✅ [SupplierService] Local-only supplier management ready');




















// // import { dbPromise, handleSqlError } from '../lib/localDb';
// // import uuid from 'react-native-uuid';
// // import type { Supplier, Part } from '../types';

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

// // interface SupplierRow {
// //   id: string;
// //   name: string;
// //   contactPerson: string;
// //   phone: string;
// //   email: string;
// //   address: string;
// //   status: string;
// //   lastModified: number;
// // }

// // class SupplierService {
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

// //   private static fromRow(row: SupplierRow): Supplier {
// //     return {
// //       id: row.id,
// //       name: row.name || 'Unknown Supplier',
// //       contactPerson: row.contactPerson || '',
// //       phone: row.phone || '',
// //       email: row.email || '',
// //       address: row.address || '',
// //       status: (row.status as Supplier['status']) || 'active',
// //       lastModified: row.lastModified || Date.now(),
// //     };
// //   }

// //   private static async saveSupplier(supplier: Supplier): Promise<void> {
// //     const db = await dbPromise;
// //     return new Promise((resolve, reject) => {
// //       db.transaction(
// //         (tx: SQLTransaction) => {
// //           tx.executeSql(
// //             `INSERT OR REPLACE INTO suppliers
// //              (id, name, contactPerson, phone, email, address, status, lastModified)
// //              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
// //             [
// //               supplier.id,
// //               supplier.name,
// //               supplier.contactPerson || '',
// //               supplier.phone || '',
// //               supplier.email || '',
// //               supplier.address || '',
// //               supplier.status,
// //               supplier.lastModified,
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

// //   static async getSuppliers(): Promise<Supplier[]> {
// //     const rows = await this.execSql<SupplierRow>('SELECT * FROM suppliers WHERE status = ? ORDER BY name', ['active']);
// //     return rows.map(this.fromRow);
// //   }

// //   static async getAllSuppliers(): Promise<Supplier[]> {
// //     const rows = await this.execSql<SupplierRow>('SELECT * FROM suppliers ORDER BY name');
// //     return rows.map(this.fromRow);
// //   }

// //   static async getSupplierById(id: string): Promise<Supplier | null> {
// //     const row = await this.execSqlSingle<SupplierRow>('SELECT * FROM suppliers WHERE id = ?', [id]);
// //     return row ? this.fromRow(row) : null;
// //   }

// //   static async getSuppliersByStatus(status: 'active' | 'inactive'): Promise<Supplier[]> {
// //     const rows = await this.execSql<SupplierRow>('SELECT * FROM suppliers WHERE status = ? ORDER BY name', [status]);
// //     return rows.map(this.fromRow);
// //   }

// //   static async searchSuppliers(query: string): Promise<Supplier[]> {
// //     const searchTerm = `%${query}%`;
// //     const rows = await this.execSql<SupplierRow>(
// //       `SELECT * FROM suppliers 
// //        WHERE (name LIKE ? OR contactPerson LIKE ? OR phone LIKE ?) AND status = 'active' 
// //        ORDER BY name`,
// //       [searchTerm, searchTerm, searchTerm]
// //     );
// //     return rows.map(this.fromRow);
// //   }

// //   static async getSupplierParts(supplierId: string): Promise<Part[]> {
// //     return this.execSql<Part>(
// //       'SELECT * FROM parts WHERE supplierId = ? AND status = ? ORDER BY name',
// //       [supplierId, 'active']
// //     );
// //   }

// //   static async addSupplier(data: Omit<Supplier, 'id' | 'lastModified'>): Promise<Supplier> {
// //     const id = uuid.v4() as string;
// //     const supplier: Supplier = {
// //       id,
// //       ...data,
// //       status: data.status || 'active',
// //       lastModified: Date.now(),
// //     };
// //     await this.saveSupplier(supplier);
// //     return supplier;
// //   }

// //   static async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
// //     const fields: string[] = [];
// //     const values: any[] = [];
// //     const lastModified = Date.now();

// //     Object.entries(updates).forEach(([key, value]) => {
// //       if (value !== undefined) {
// //         fields.push(`${key} = ?`);
// //         values.push(value);
// //       }
// //     });

// //     if (fields.length === 0) return null;

// //     fields.push('lastModified = ?');
// //     values.push(lastModified, id);

// //     const db = await dbPromise;
// //     await new Promise<void>((resolve, reject) => {
// //       db.transaction(
// //         (tx: SQLTransaction) => {
// //           tx.executeSql(
// //             `UPDATE suppliers SET ${fields.join(', ')} WHERE id = ?`,
// //             values,
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

// //     return this.getSupplierById(id);
// //   }

// //   static async deleteSupplier(id: string): Promise<void> {
// //     const db = await dbPromise;
// //     return new Promise((resolve, reject) => {
// //       db.transaction(
// //         (tx: SQLTransaction) => {
// //           tx.executeSql(
// //             'DELETE FROM suppliers WHERE id = ?',
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

// //   static async deactivateSupplier(id: string): Promise<void> {
// //     await this.updateSupplier(id, { status: 'inactive' });
// //   }

// //   static async restoreSupplier(id: string): Promise<void> {
// //     await this.updateSupplier(id, { status: 'active' });
// //   }

// //   static async getSupplierStats(supplierId: string): Promise<{
// //     totalPurchases: number;
// //     totalAmount: number;
// //     pendingAmount: number;
// //     partsCount: number;
// //   }> {
// //     const [purchaseStats, pendingStats, partsStats] = await Promise.all([
// //       this.execSqlSingle<{ totalPurchases: number; totalAmount: number }>(
// //         'SELECT COUNT(*) as totalPurchases, SUM(total) as totalAmount FROM stockPurchases WHERE supplierId = ?',
// //         [supplierId]
// //       ),
// //       this.execSqlSingle<{ pendingAmount: number }>(
// //         'SELECT SUM(total) as pendingAmount FROM stockPurchases WHERE supplierId = ? AND status = ?',
// //         [supplierId, 'Pending']
// //       ),
// //       this.execSqlSingle<{ partsCount: number }>(
// //         'SELECT COUNT(*) as partsCount FROM parts WHERE supplierId = ? AND status = ?',
// //         [supplierId, 'active']
// //       ),
// //     ]);

// //     return {
// //       totalPurchases: purchaseStats?.totalPurchases || 0,
// //       totalAmount: purchaseStats?.totalAmount || 0,
// //       pendingAmount: pendingStats?.pendingAmount || 0,
// //       partsCount: partsStats?.partsCount || 0,
// //     };
// //   }

// //   static async getSuppliersWithPartsCount(): Promise<Array<{ supplier: Supplier; partsCount: number }>> {
// //     const suppliers = await this.getSuppliers();
// //     const results = await Promise.all(
// //       suppliers.map(async supplier => {
// //         const parts = await this.execSql<{ count: number }>(
// //           'SELECT COUNT(*) as count FROM parts WHERE supplierId = ? AND status = ?',
// //           [supplier.id, 'active']
// //         );
// //         return {
// //           supplier,
// //           partsCount: parts[0]?.count || 0
// //         };
// //       })
// //     );
// //     return results;
// //   }
// // }

// // // Bind all static methods on export for safety (just like part-service/invoice-service)
// // export const getSuppliers = SupplierService.getSuppliers.bind(SupplierService);
// // export const getAllSuppliers = SupplierService.getAllSuppliers.bind(SupplierService);
// // export const getSupplierById = SupplierService.getSupplierById.bind(SupplierService);
// // export const getSuppliersByStatus = SupplierService.getSuppliersByStatus.bind(SupplierService);
// // export const searchSuppliers = SupplierService.searchSuppliers.bind(SupplierService);
// // export const getSupplierParts = SupplierService.getSupplierParts.bind(SupplierService);
// // export const addSupplier = SupplierService.addSupplier.bind(SupplierService);
// // export const updateSupplier = SupplierService.updateSupplier.bind(SupplierService);
// // export const deleteSupplier = SupplierService.deleteSupplier.bind(SupplierService);
// // export const deactivateSupplier = SupplierService.deactivateSupplier.bind(SupplierService);
// // export const restoreSupplier = SupplierService.restoreSupplier.bind(SupplierService);
// // export const getSupplierStats = SupplierService.getSupplierStats.bind(SupplierService);
// // export const getSuppliersWithPartsCount = SupplierService.getSuppliersWithPartsCount.bind(SupplierService);

// // console.log('✅ [SupplierService] Local-only supplier management ready');
