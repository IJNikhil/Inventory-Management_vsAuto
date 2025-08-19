// src/services/part-service.ts
import { BaseService } from './base-service';
import { executeQuery } from '../lib/database/connection';
import type { Part } from '../types/database';

class PartService extends BaseService<Part> {
  protected tableName = 'parts';

  // ✅ FIXED: Critical syntax error - use === instead of =
  private safeParseFloat(value: any, defaultValue: number = 0): number {
    if (value === null || value === undefined || value === '') { // ✅ FIXED: === instead of =
      return defaultValue;
    }
    const parsed = parseFloat(value);
    return !isNaN(parsed) && isFinite(parsed) ? parsed : defaultValue;
  }

  private safeParseInt(value: any, defaultValue: number = 0): number {
    if (value === null || value === undefined || value === '') { // ✅ FIXED: === instead of =
      return defaultValue;
    }
    const parsed = parseInt(value);
    return !isNaN(parsed) && isFinite(parsed) ? parsed : defaultValue;
  }

  protected mapFromDb(row: any): Part {
    return {
      id: row.id,
      name: row.name || '',
      part_number: row.part_number || '',
      category_id: row.category_id || undefined,
      purchase_price: this.safeParseFloat(row.purchase_price, 0),
      selling_price: this.safeParseFloat(row.selling_price, 0),
      mrp: this.safeParseFloat(row.mrp, 0),
      quantity: this.safeParseInt(row.quantity, 0),
      min_stock_level: this.safeParseInt(row.min_stock_level, 10),
      supplier_id: row.supplier_id || undefined,
      status: row.status || 'active',
      created_at: row.created_at,
      updated_at: row.updated_at,
      version: row.version || 1
    };
  }

  protected mapToDb(entity: Partial<Part>): Record<string, any> {
    return {
      id: entity.id,
      name: entity.name ? this.sanitizeString(entity.name) : '',
      part_number: entity.part_number || '',
      category_id: entity.category_id || null,
      purchase_price: this.safeParseFloat(entity.purchase_price, 0),
      selling_price: this.safeParseFloat(entity.selling_price, 0),
      mrp: this.safeParseFloat(entity.mrp, 0),
      quantity: this.safeParseInt(entity.quantity, 0),
      min_stock_level: this.safeParseInt(entity.min_stock_level, 10),
      supplier_id: entity.supplier_id || null,
      status: entity.status || 'active',
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      version: entity.version
    };
  }

  async create(data: Omit<Part, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<Part> {
    this.validateRequired(data, ['name']);
    
    // ✅ ADDED: Safe validation with proper number checking
    const purchasePrice = this.safeParseFloat(data.purchase_price, 0);
    const sellingPrice = this.safeParseFloat(data.selling_price, 0);
    const mrp = this.safeParseFloat(data.mrp, 0);
    
    if (purchasePrice < 0 || sellingPrice < 0 || mrp < 0) {
      throw new Error('Prices cannot be negative');
    }
    
    if (mrp > 0 && sellingPrice > mrp) {
      throw new Error('Selling price cannot be greater than MRP');
    }
    
    return super.create({
      ...data,
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
      mrp: mrp || sellingPrice // Default MRP to selling price if not provided
    });
  }

  // ... rest of the methods remain the same
  async findByPartNumber(partNumber: string): Promise<Part | null> {
    return this.findFirst({ part_number: partNumber.trim() });
  }

  async findBySupplier(supplierId: string): Promise<Part[]> {
    return this.findAll({ 
      where: { supplier_id: supplierId, status: 'active' }, 
      orderBy: 'name' 
    });
  }

  async findLowStock(): Promise<Part[]> {
    const sql = `
      SELECT * FROM parts 
      WHERE quantity <= min_stock_level AND status = 'active'
      ORDER BY quantity ASC, name ASC
    `;
    
    const rows = await executeQuery<any>(sql);
    return rows.map(row => this.mapFromDb(row));
  }

  async updateStock(partId: string, quantityChange: number): Promise<Part | null> {
    const part = await this.findById(partId);
    if (!part) return null;

    const newQuantity = Math.max(0, part.quantity + quantityChange);
    
    return this.update(partId, { quantity: newQuantity });
  }

  async searchParts(searchTerm: string): Promise<Part[]> {
    return this.search(searchTerm, ['name', 'part_number']);
  }

  async getPartsCount(): Promise<{
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
  }> {
    const [total, active, lowStock, outOfStock] = await Promise.all([
      this.count(),
      this.count({ status: 'active' }),
      executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM parts WHERE quantity <= min_stock_level AND status = ?', ['active']),
      executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM parts WHERE quantity = 0 AND status = ?', ['active'])
    ]);

    return {
      total,
      active,
      lowStock: lowStock[0]?.count || 0,
      outOfStock: outOfStock[0]?.count || 0
    };
  }
}

export const partService = new PartService();

// Export individual methods for backward compatibility
export const {
  create: createPart,
  update: updatePart,
  delete: deletePart,
  findById: getPartById,
  findAll: getParts,
  findByPartNumber,
  findBySupplier: getPartsBySupplier,
  findLowStock: getLowStockParts,
  updateStock: updatePartStock,
  searchParts,
  getPartsCount
} = partService;


// // src/services/part-service.ts
// import { BaseService } from './base-service';
// import { executeQuery } from '../lib/database/connection';
// import type { Part } from '../types/database';

// class PartService extends BaseService<Part> {
//   protected tableName = 'parts';

//   protected mapFromDb(row: any): Part {
//     return {
//       id: row.id,
//       name: row.name || '',
//       part_number: row.part_number || '',
//       category_id: row.category_id || undefined,
//       purchase_price: parseFloat(row.purchase_price) || 0,
//       selling_price: parseFloat(row.selling_price) || 0,
//       mrp: parseFloat(row.mrp) || 0,
//       quantity: parseInt(row.quantity) || 0,
//       min_stock_level: parseInt(row.min_stock_level) || 10,
//       supplier_id: row.supplier_id || undefined,
//       status: row.status || 'active',
//       created_at: row.created_at,
//       updated_at: row.updated_at,
//       version: row.version || 1
//     };
//   }

//   protected mapToDb(entity: Partial<Part>): Record<string, any> {
//     return {
//       id: entity.id,
//       name: entity.name ? this.sanitizeString(entity.name) : '',
//       part_number: entity.part_number || '',
//       category_id: entity.category_id || null,
//       purchase_price: entity.purchase_price || 0,
//       selling_price: entity.selling_price || 0,
//       mrp: entity.mrp || 0,
//       quantity: entity.quantity || 0,
//       min_stock_level: entity.min_stock_level || 10,
//       supplier_id: entity.supplier_id || null,
//       status: entity.status || 'active',
//       created_at: entity.created_at,
//       updated_at: entity.updated_at,
//       version: entity.version
//     };
//   }

//   async create(data: Omit<Part, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<Part> {
//     this.validateRequired(data, ['name']);
    
//     if (data.purchase_price < 0 || data.selling_price < 0 || data.mrp < 0) {
//       throw new Error('Prices cannot be negative');
//     }
    
//     if (data.selling_price > data.mrp) {
//       throw new Error('Selling price cannot be greater than MRP');
//     }

//     return super.create(data);
//   }

//   async findByPartNumber(partNumber: string): Promise<Part | null> {
//     return this.findFirst({ part_number: partNumber.trim() });
//   }

//   async findBySupplier(supplierId: string): Promise<Part[]> {
//     return this.findAll({ 
//       where: { supplier_id: supplierId, status: 'active' }, 
//       orderBy: 'name' 
//     });
//   }

//   async findLowStock(): Promise<Part[]> {
//     const sql = `
//       SELECT * FROM parts 
//       WHERE quantity <= min_stock_level AND status = 'active'
//       ORDER BY quantity ASC, name ASC
//     `;
    
//     const rows = await executeQuery<any>(sql);
//     return rows.map(row => this.mapFromDb(row));
//   }

//   async updateStock(partId: string, quantityChange: number): Promise<Part | null> {
//     const part = await this.findById(partId);
//     if (!part) return null;

//     const newQuantity = Math.max(0, part.quantity + quantityChange);
    
//     return this.update(partId, { quantity: newQuantity });
//   }

//   async searchParts(searchTerm: string): Promise<Part[]> {
//     return this.search(searchTerm, ['name', 'part_number']);
//   }

//   async getPartsCount(): Promise<{
//     total: number;
//     active: number;
//     lowStock: number;
//     outOfStock: number;
//   }> {
//     const [total, active, lowStock, outOfStock] = await Promise.all([
//       this.count(),
//       this.count({ status: 'active' }),
//       executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM parts WHERE quantity <= min_stock_level AND status = ?', ['active']),
//       executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM parts WHERE quantity = 0 AND status = ?', ['active'])
//     ]);

//     return {
//       total,
//       active,
//       lowStock: lowStock[0]?.count || 0,
//       outOfStock: outOfStock[0]?.count || 0
//     };
//   }
// }

// export const partService = new PartService();

// // Export individual methods for backward compatibility
// export const {
//   create: createPart,
//   update: updatePart,
//   delete: deletePart,
//   findById: getPartById,
//   findAll: getParts,
//   findByPartNumber,
//   findBySupplier: getPartsBySupplier,
//   findLowStock: getLowStockParts,
//   updateStock: updatePartStock,
//   searchParts,
//   getPartsCount
// } = partService;



















// import { dbPromise, handleSqlError } from '../lib/localDb';
// // ✅ FIXED: Import types from localDb instead of redefining
// import type { SQLTransaction, SQLResultSet } from '../lib/localDb';
// import uuid from 'react-native-uuid';
// import type { Part } from '../types';

// interface PartRow {
//   id: string;
//   name: string;
//   partNumber: string;
//   purchasePrice: number;
//   sellingPrice: number;
//   mrp: number;
//   quantity: number;
//   supplierId: string;
//   supplierName: string;
//   isLowStock: number;
//   status: string;
//   lastModified: number;
// }

// // ✅ REMOVED: Local interface definitions that conflicted with localDb types

// class PartsService {
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
//             (_tx: SQLTransaction, results: SQLResultSet) => { // ✅ FIXED: Use imported types
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

//   private static fromRow(row: PartRow): Part {
//     return {
//       id: row.id,
//       name: row.name,
//       partNumber: row.partNumber,
//       purchasePrice: row.purchasePrice,
//       sellingPrice: row.sellingPrice,
//       mrp: row.mrp,
//       quantity: row.quantity,
//       supplierId: row.supplierId,
//       supplierName: row.supplierName,
//       isLowStock: !!row.isLowStock,
//       status: row.status as Part['status'],
//       lastModified: row.lastModified,
//     };
//   }

//   private static async savePart(part: Part): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             `INSERT OR REPLACE INTO parts
//              (id, name, partNumber, purchasePrice, sellingPrice, mrp, quantity, supplierId, supplierName, isLowStock, status, lastModified)
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//               part.id,
//               part.name || '', // NOT NULL
//               part.partNumber || '',
//               Number(part.purchasePrice) || 0,
//               Number(part.sellingPrice) || 0,
//               Number(part.mrp) || Number(part.sellingPrice) || 0,
//               Number(part.quantity) || 0,
//               part.supplierId || '',
//               part.supplierName || '',
//               part.isLowStock ? 1 : 0,
//               part.status || 'active',
//               part.lastModified || Date.now(),
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

//   static async getParts(): Promise<Part[]> {
//     const rows = await this.execSql<PartRow>('SELECT * FROM parts ORDER BY name');
//     return rows.map(this.fromRow);
//   }

//   static async getPartById(id: string): Promise<Part | null> {
//     const row = await this.execSqlSingle<PartRow>('SELECT * FROM parts WHERE id = ?', [id]);
//     return row ? this.fromRow(row) : null;
//   }

//   static async getPartsByIds(ids: string[]): Promise<Map<string, Part>> {
//     const partsMap = new Map<string, Part>();
//     if (ids.length === 0) return partsMap;
//     const placeholders = ids.map(() => '?').join(',');
//     const rows = await this.execSql<PartRow>(
//       `SELECT * FROM parts WHERE id IN (${placeholders})`,
//       ids
//     );
//     rows.forEach(row => partsMap.set(row.id, this.fromRow(row)));
//     return partsMap;
//   }

//   static async addPart(data: Omit<Part, 'id' | 'lastModified'>): Promise<Part> {
//     const id = uuid.v4() as string;
//     const now = Date.now();
//     const part: Part = {
//       id,
//       name: data.name || "",
//       partNumber: data.partNumber || "",
//       purchasePrice: data.purchasePrice ?? 0,
//       sellingPrice: data.sellingPrice ?? 0,
//       mrp: data.mrp ?? data.sellingPrice ?? 0,
//       quantity: data.quantity ?? 0,
//       supplierId: data.supplierId || "",
//       supplierName: data.supplierName || "",
//       isLowStock: (data.quantity ?? 0) <= 5,
//       status: "active",
//       lastModified: now,
//     };
//     await this.savePart(part);
//     return part;
//   }

//   static async updatePart(id: string, data: Partial<Omit<Part, 'id' | 'lastModified'>>): Promise<Part> {
//     const existing = await this.getPartById(id);
//     if (!existing) throw new Error(`Part ${id} not found`);
//     const updated: Part = {
//       ...existing,
//       ...data,
//       id,
//       lastModified: Date.now(),
//     };
//     await this.savePart(updated);
//     return updated;
//   }

//   static async deletePart(id: string): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'DELETE FROM parts WHERE id = ?',
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

//   static async updatePartQuantity(id: string, newQuantity: number): Promise<void> {
//     const db = await dbPromise;
//     const now = Date.now();
//     const isLowStock = newQuantity < 10;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'UPDATE parts SET quantity = ?, isLowStock = ?, lastModified = ? WHERE id = ?',
//             [newQuantity, isLowStock ? 1 : 0, now, id],
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

//   static async getLowStockParts(): Promise<Part[]> {
//     const rows = await this.execSql<PartRow>(
//       'SELECT * FROM parts WHERE isLowStock = 1 AND status = ? ORDER BY quantity ASC',
//       ['active']
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getOutOfStockParts(): Promise<Part[]> {
//     const rows = await this.execSql<PartRow>(
//       'SELECT * FROM parts WHERE quantity = 0 AND status = ? ORDER BY name',
//       ['active']
//     );
//     return rows.map(this.fromRow);
//   }

//   static async searchParts(query: string): Promise<Part[]> {
//     const searchTerm = `%${query}%`;
//     const rows = await this.execSql<PartRow>(
//       `SELECT * FROM parts WHERE (name LIKE ? OR partNumber LIKE ?) AND status = ? ORDER BY name`,
//       [searchTerm, searchTerm, 'active']
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getPartsBySupplier(supplierId: string): Promise<Part[]> {
//     const rows = await this.execSql<PartRow>(
//       'SELECT * FROM parts WHERE supplierId = ? AND status = ? ORDER BY name',
//       [supplierId, 'active']
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getPartsCount(): Promise<number> {
//     const result = await this.execSqlSingle<{ count: number }>(
//       'SELECT COUNT(*) as count FROM parts WHERE status = ?',
//       ['active']
//     );
//     return result?.count || 0;
//   }

//   static async restorePart(id: string): Promise<void> {
//     const db = await dbPromise;
//     const now = Date.now();
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'UPDATE parts SET status = ?, lastModified = ? WHERE id = ?',
//             ['active', now, id],
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
// }

// // Bound exports
// export const getParts = PartsService.getParts.bind(PartsService);
// export const getPartById = PartsService.getPartById.bind(PartsService);
// export const getPartsByIds = PartsService.getPartsByIds.bind(PartsService);
// export const addPart = PartsService.addPart.bind(PartsService);
// export const updatePart = PartsService.updatePart.bind(PartsService);
// export const deletePart = PartsService.deletePart.bind(PartsService);
// export const updatePartQuantity = PartsService.updatePartQuantity.bind(PartsService);
// export const getLowStockParts = PartsService.getLowStockParts.bind(PartsService);
// export const getOutOfStockParts = PartsService.getOutOfStockParts.bind(PartsService);
// export const searchParts = PartsService.searchParts.bind(PartsService);
// export const getPartsBySupplier = PartsService.getPartsBySupplier.bind(PartsService);
// export const getPartsCount = PartsService.getPartsCount.bind(PartsService);
// export const restorePart = PartsService.restorePart.bind(PartsService);




// import { dbPromise, handleSqlError } from '../lib/localDb';
// import uuid from 'react-native-uuid';
// import type { Part } from '../types';

// interface PartRow {
//   id: string;
//   name: string;
//   partNumber: string;
//   purchasePrice: number;
//   sellingPrice: number;
//   mrp: number;
//   quantity: number;
//   supplierId: string;
//   supplierName: string;
//   isLowStock: number;
//   status: string;
//   lastModified: number;
// }

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
// }

// class PartsService {
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
//             (_tx, results: SQLResultSet) => {
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

//   private static fromRow(row: PartRow): Part {
//     return {
//       id: row.id,
//       name: row.name,
//       partNumber: row.partNumber,
//       purchasePrice: row.purchasePrice,
//       sellingPrice: row.sellingPrice,
//       mrp: row.mrp,
//       quantity: row.quantity,
//       supplierId: row.supplierId,
//       supplierName: row.supplierName,
//       isLowStock: !!row.isLowStock,
//       status: row.status as Part['status'],
//       lastModified: row.lastModified,
//     };
//   }

//   private static async savePart(part: Part): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             `INSERT OR REPLACE INTO parts
//              (id, name, partNumber, purchasePrice, sellingPrice, mrp, quantity, supplierId, supplierName, isLowStock, status, lastModified)
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//               part.id,
//               part.name || '', // NOT NULL
//               part.partNumber || '',
//               Number(part.purchasePrice) || 0,
//               Number(part.sellingPrice) || 0,
//               Number(part.mrp) || Number(part.sellingPrice) || 0,
//               Number(part.quantity) || 0,
//               part.supplierId || '',
//               part.supplierName || '',
//               part.isLowStock ? 1 : 0,
//               part.status || 'active',
//               part.lastModified || Date.now(),
//             ],
//             () => resolve(),
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

//   static async getParts(): Promise<Part[]> {
//     const rows = await this.execSql<PartRow>('SELECT * FROM parts ORDER BY name');
//     return rows.map(this.fromRow);
//   }

//   static async getPartById(id: string): Promise<Part | null> {
//     const row = await this.execSqlSingle<PartRow>('SELECT * FROM parts WHERE id = ?', [id]);
//     return row ? this.fromRow(row) : null;
//   }

//   static async getPartsByIds(ids: string[]): Promise<Map<string, Part>> {
//     const partsMap = new Map<string, Part>();
//     if (ids.length === 0) return partsMap;
//     const placeholders = ids.map(() => '?').join(',');
//     const rows = await this.execSql<PartRow>(
//       `SELECT * FROM parts WHERE id IN (${placeholders})`,
//       ids
//     );
//     rows.forEach(row => partsMap.set(row.id, this.fromRow(row)));
//     return partsMap;
//   }

// static async addPart(data: Omit<Part, 'id' | 'lastModified'>): Promise<Part> {
//   const id = uuid.v4() as string;
//   const now = Date.now();
//   const part: Part = {
//     id,
//     name: data.name || "",          // <-- ensure non-empty string
//     partNumber: data.partNumber || "",
//     purchasePrice: data.purchasePrice ?? 0,
//     sellingPrice: data.sellingPrice ?? 0,
//     mrp: data.mrp ?? data.sellingPrice ?? 0,
//     quantity: data.quantity ?? 0,
//     supplierId: data.supplierId || "",  // <-- ensure non-empty string
//     supplierName: data.supplierName || "",
//     isLowStock: (data.quantity ?? 0) <= 5,
//     status: "active",
//     lastModified: now,
//   };
//   await this.savePart(part);
//   return part;
// }


//   static async updatePart(id: string, data: Partial<Omit<Part, 'id' | 'lastModified'>>): Promise<Part> {
//     const existing = await this.getPartById(id);
//     if (!existing) throw new Error(`Part ${id} not found`);
//     const updated: Part = {
//       ...existing,
//       ...data,
//       id,
//       lastModified: Date.now(),
//     };
//     await this.savePart(updated);
//     return updated;
//   }

//   static async deletePart(id: string): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'DELETE FROM parts WHERE id = ?',
//             [id],
//             () => resolve(),
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

//   static async updatePartQuantity(id: string, newQuantity: number): Promise<void> {
//     const db = await dbPromise;
//     const now = Date.now();
//     const isLowStock = newQuantity < 10;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'UPDATE parts SET quantity = ?, isLowStock = ?, lastModified = ? WHERE id = ?',
//             [newQuantity, isLowStock ? 1 : 0, now, id],
//             () => resolve(),
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

//   static async getLowStockParts(): Promise<Part[]> {
//     const rows = await this.execSql<PartRow>(
//       'SELECT * FROM parts WHERE isLowStock = 1 AND status = ? ORDER BY quantity ASC',
//       ['active']
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getOutOfStockParts(): Promise<Part[]> {
//     const rows = await this.execSql<PartRow>(
//       'SELECT * FROM parts WHERE quantity = 0 AND status = ? ORDER BY name',
//       ['active']
//     );
//     return rows.map(this.fromRow);
//   }

//   static async searchParts(query: string): Promise<Part[]> {
//     const searchTerm = `%${query}%`;
//     const rows = await this.execSql<PartRow>(
//       `SELECT * FROM parts WHERE (name LIKE ? OR partNumber LIKE ?) AND status = ? ORDER BY name`,
//       [searchTerm, searchTerm, 'active']
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getPartsBySupplier(supplierId: string): Promise<Part[]> {
//     const rows = await this.execSql<PartRow>(
//       'SELECT * FROM parts WHERE supplierId = ? AND status = ? ORDER BY name',
//       [supplierId, 'active']
//     );
//     return rows.map(this.fromRow);
//   }

//   static async getPartsCount(): Promise<number> {
//     const result = await this.execSqlSingle<{ count: number }>(
//       'SELECT COUNT(*) as count FROM parts WHERE status = ?',
//       ['active']
//     );
//     return result?.count || 0;
//   }

//   static async restorePart(id: string): Promise<void> {
//     const db = await dbPromise;
//     const now = Date.now();
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'UPDATE parts SET status = ?, lastModified = ? WHERE id = ?',
//             ['active', now, id],
//             () => resolve(),
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
// }

// // Bound exports
// export const getParts = PartsService.getParts.bind(PartsService);
// export const getPartById = PartsService.getPartById.bind(PartsService);
// export const getPartsByIds = PartsService.getPartsByIds.bind(PartsService);
// export const addPart = PartsService.addPart.bind(PartsService);
// export const updatePart = PartsService.updatePart.bind(PartsService);
// export const deletePart = PartsService.deletePart.bind(PartsService);
// export const updatePartQuantity = PartsService.updatePartQuantity.bind(PartsService);
// export const getLowStockParts = PartsService.getLowStockParts.bind(PartsService);
// export const getOutOfStockParts = PartsService.getOutOfStockParts.bind(PartsService);
// export const searchParts = PartsService.searchParts.bind(PartsService);
// export const getPartsBySupplier = PartsService.getPartsBySupplier.bind(PartsService);
// export const getPartsCount = PartsService.getPartsCount.bind(PartsService);
// export const restorePart = PartsService.restorePart.bind(PartsService);
