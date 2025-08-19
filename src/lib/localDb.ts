// // src/lib/localDb.ts
// import SQLite from 'react-native-sqlite-storage';

// SQLite.enablePromise(true);

// // ✅ ENHANCED: Better type definitions
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
//     item: (index: number) => any;
//   };
//   rowsAffected: number;
//   insertId?: number;
// }

// export const dbPromise = SQLite.openDatabase({
//   name: 'vs_auto.db',
//   location: 'default',
//   createFromLocation: undefined,
// }) as Promise<any>;

// const SCHEMA_VERSION = 12;

// // ✅ ENHANCED: Much better error logging with detailed information
// export const handleSqlError = (tx: SQLTransaction, error: any): boolean => {
//   const errorDetails = {
//     message: error?.message || 'Unknown SQL error',
//     code: error?.code || 'NO_CODE',
//     details: error?.details || 'No details available',
//     type: typeof error,
//     constructor: error?.constructor?.name || 'Unknown',
//     // Try to extract more details from the error object
//     ...(error && typeof error === 'object' ? {
//       domain: error.domain,
//       userInfo: error.userInfo,
//       nativeStackIOS: error.nativeStackIOS,
//       nativeStackAndroid: error.nativeStackAndroid,
//     } : {}),
//   };

//   console.error("🔴 SQLite ERROR Details:", errorDetails);
  
//   // Log the full error object for debugging
//   if (error) {
//     console.error("🔴 Full Error Object:", error);
//     console.error("🔴 Error Keys:", Object.keys(error));
//   }
  
//   return true;
// };

// class UltraDB {
//   private static cache = new Map<string, { data: any; expiry: number }>();
//   private static readonly TTL = 5 * 60 * 1000; // 5 minutes
//   private static isInitialized = false;

//   // ✅ ADD: Database initialization check
//   private static async ensureInitialized(): Promise<void> {
//     if (!this.isInitialized) {
//       try {
//         await initializeDatabase();
//         this.isInitialized = true;
//         console.log("✅ Database initialization confirmed");
//       } catch (error) {
//         console.error("❌ Database initialization failed:", error);
//         throw error;
//       }
//     }
//   }

//   private static clean(data: any, table: string): any {
//     const defaultId = `${table}_${Date.now()}_${Math.random().toString(36).slice(2,11)}`;
//     const clean = {
//       ...data,
//       id: data?.id ?? defaultId,
//       lastModified: data?.lastModified ?? Date.now(),
//     };
    
//     switch (table) {
//       case 'invoices':
//         return {
//           ...clean,
//           customerId: clean.customerId || 'embedded',
//           customerName: clean.customerName || '',
//           customer: JSON.stringify(clean.customer ?? {}),
//           items: JSON.stringify(clean.items ?? []),
//           subtotal: Number(clean.subtotal) || 0,
//           total: Number(clean.total) || 0,
//           date: clean.date || new Date().toISOString().split('T')[0],
//           status: clean.status ?? 'pending',
//           paymentMethod: clean.paymentMethod || 'Cash',
//           notes: clean.notes || '',
//           generatedBy: clean.generatedBy || '',
//           collectedBy: clean.collectedBy || '',
//           paymentDate: clean.paymentDate || '',
//         };
//       case 'parts':
//         return {
//           ...clean,
//           name: clean.name ?? '',
//           partNumber: clean.partNumber ?? '',
//           purchasePrice: Number(clean.purchasePrice) || 0,
//           sellingPrice: Number(clean.sellingPrice) || 0,
//           mrp: Number(clean.mrp) || Number(clean.sellingPrice) || 0,
//           quantity: Number(clean.quantity) || 0,
//           supplierId: clean.supplierId ?? '',
//           supplierName: clean.supplierName ?? '',
//           status: clean.status ?? 'active',
//           isLowStock: Number(clean.quantity) < 10 ? 1 : 0,
//           images: JSON.stringify(clean.images ?? []),
//         };
//       case 'suppliers':
//         return {
//           ...clean,
//           name: clean.name ?? '',
//           contactPerson: clean.contactPerson ?? '',
//           phone: clean.phone ?? '',
//           email: clean.email ?? '',
//           address: clean.address ?? '',
//           status: clean.status ?? 'active',
//         };
//       case 'transactions':
//         return {
//           ...clean,
//           date: clean.date || new Date().toISOString().split('T')[0],
//           amount: Number(clean.amount) || 0,
//           paymentMethod: clean.paymentMethod ?? 'Cash',
//           description: clean.description || '',
//           category: clean.category || 'Miscellaneous',
//           recordedBy: clean.recordedBy || '',
//           paidBy: clean.paidBy || '',
//           status: clean.status ?? 'Pending',
//           sourceId: clean.sourceId || '',
//           sourceType: clean.sourceType || '',
//         };
//       case 'stockPurchases':
//         return {
//           ...clean,
//           supplierId: clean.supplierId || '',
//           supplierName: clean.supplierName || '',
//           supplier: JSON.stringify(clean.supplier ?? {}),
//           items: JSON.stringify(clean.items ?? []),
//           total: Number(clean.total) || 0,
//           date: clean.date || new Date().toISOString().split('T')[0],
//           status: clean.status ?? 'Pending',
//           paymentMethod: clean.paymentMethod || 'Cash',
//           notes: clean.notes || '',
//           createdBy: clean.createdBy || '',
//           paidBy: clean.paidBy || '',
//           paymentDate: clean.paymentDate || '',
//           receiptUrl: clean.receiptUrl || '',
//         };
//       case 'customers':
//         return {
//           ...clean,
//           name: clean.name ?? '',
//           phone: clean.phone ?? '',
//           address: clean.address ?? '',
//         };
//       case 'users':
//         return {
//           ...clean,
//           name: clean.name ?? '',
//           email: clean.email ?? '',
//           role: clean.role ?? 'Shopkeeper',
//           avatar: clean.avatar || '',
//           status: clean.status ?? 'active',
//           createdAt: clean.createdAt || new Date().toISOString(),
//           updatedAt: clean.updatedAt || new Date().toISOString(),
//           authAccountCreated: clean.authAccountCreated ? 1 : 0,
//           deletedAt: clean.deletedAt || '',
//           deletedBy: clean.deletedBy || '',
//           restoredAt: clean.restoredAt || '',
//           passwordChangeRequested: clean.passwordChangeRequested ? 1 : 0,
//           pendingPassword: clean.pendingPassword || '',
//         };
//       case 'shop':
//         return {
//           ...clean,
//           name: clean.name ?? '',
//           address: clean.address ?? '',
//           phone: clean.phone ?? '',
//           email: clean.email ?? '',
//           logo: clean.logo || '',
//         };
//       case 'change_log':
//         return {
//           collection: clean.collection || '',
//           documentId: clean.documentId || '',
//           operation: clean.operation || '',
//           data: clean.data || '{}',
//           timestamp: clean.timestamp || Date.now(),
//         };
//       default:
//         return clean;
//     }
//   }

//   // ✅ ENHANCED: Better error handling and retry logic
//   static async exec<T>(table: string, sql: string, params: any[] = [], retries = 3): Promise<T> {
//     await this.ensureInitialized();
    
//     const cacheKey = `${table}|${sql}|${JSON.stringify(params)}`;
//     const cached = this.cache.get(cacheKey);
//     if (cached && cached.expiry > Date.now()) {
//       return cached.data;
//     }

//     for (let attempt = 1; attempt <= retries; attempt++) {
//       try {
//         const db = await dbPromise;
//         return await new Promise<T>((resolve, reject) => {
//           db.transaction((tx: SQLTransaction) => {
//             tx.executeSql(sql, params,
//               (_: SQLTransaction, res: SQLResultSet) => {
//                 let items: any[] = [];
//                 if (res.rows) {
//                   items = [];
//                   for (let i = 0; i < res.rows.length; i++) {
//                     items.push(res.rows.item(i));
//                   }
//                 } else {
//                   items = res as any;
//                 }
//                 this.cache.set(cacheKey, { data: items, expiry: Date.now() + this.TTL });
//                 resolve(items as any);
//               },
//               (tx: SQLTransaction, err: any) => {
//                 console.error(`❌ SQL execution failed (attempt ${attempt}/${retries}):`, {
//                   sql,
//                   params,
//                   error: err
//                 });
//                 reject(err);
//                 return handleSqlError(tx, err);
//               }
//             );
//           }, (error: any) => {
//             console.error(`❌ Transaction failed (attempt ${attempt}/${retries}):`, error);
//             reject(error);
//           });
//         });
//       } catch (error) {
//         if (attempt === retries) {
//           console.error(`❌ All ${retries} attempts failed for SQL:`, sql);
//           throw error;
//         }
//         console.warn(`⚠️ Attempt ${attempt} failed, retrying...`);
//         await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Progressive delay
//       }
//     }
    
//     throw new Error('Should not reach here');
//   }

//   // ✅ ENHANCED: Better insert with validation
//   static async insert<T>(table: string, data: T): Promise<string> {
//     await this.ensureInitialized();
    
//     const cleanData = this.clean(data, table);
    
//     try {
//       // Get table schema
//       const schema = await this.exec<any[]>(table, `PRAGMA table_info(${table})`);
//       const validCols = new Set(schema.map(c => c.name));
//       const filtered: any = {};

//       for (const col of Object.keys(cleanData)) {
//         if (validCols.has(col)) {
//           filtered[col] = cleanData[col];
//         }
//       }

//       const cols = Object.keys(filtered).join(',');
//       const placeholders = Object.keys(filtered).map(() => '?').join(',');
//       const values = Object.values(filtered);

//       console.log(`📝 Inserting into '${table}':`, { cols, values: values.slice(0, 3) }); // Log first 3 values only

//       const db = await dbPromise;
//       await new Promise<void>((resolve, reject) => {
//         db.transaction((tx: SQLTransaction) => {
//           tx.executeSql(
//             `INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${placeholders})`,
//             values,
//             (_: SQLTransaction, __: SQLResultSet) => resolve(),
//             (tx: SQLTransaction, err: any) => {
//               console.error('❌ Insert error details:', {
//                 table,
//                 sql: `INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${placeholders})`,
//                 values,
//                 error: err
//               });
//               reject(err);
//               return handleSqlError(tx, err);
//             }
//           );
//         }, (error: any) => reject(error));
//       });
      
//       this.cache.forEach((_, key: string) => {
//         if (key.startsWith(table)) this.cache.delete(key);
//       });
      
//       return filtered.id;
//     } catch (error) {
//       console.error(`❌ Insert operation failed for table '${table}':`, error);
//       throw error;
//     }
//   }

//   private static clearCache(pattern: string) {
//     for (const key of this.cache.keys()) {
//       if (key.includes(pattern)) this.cache.delete(key);
//     }
//   }
// }

// // ✅ ENHANCED: Better update function
// export async function update<T>(table: string, id: string, updates: Partial<T>): Promise<void> {
//   const db = await dbPromise;
//   return new Promise<void>((resolve, reject) => {
//     db.transaction((tx: SQLTransaction) => {
//       const keys = Object.keys(updates);
//       if (!keys.length) return resolve();
      
//       const clause = keys.map(k => `${k} = ?`).join(', ');
//       const params = keys.map(k => (updates as any)[k]);
//       params.push(id);

//       console.log(`📝 Updating ${table} id=${id}:`, Object.keys(updates));

//       tx.executeSql(
//         `UPDATE ${table} SET ${clause} WHERE id = ?`,
//         params,
//         (_: SQLTransaction, __: SQLResultSet) => resolve(),
//         (tx: SQLTransaction, err: any) => {
//           console.error('❌ Update error:', { table, id, updates, error: err });
//           reject(err);
//           return handleSqlError(tx, err);
//         }
//       );
//     }, (error: any) => reject(error));
//   });
// }

// export const getAll = <T>(table: string) =>
//   UltraDB.exec<T>(table, `SELECT * FROM ${table} ORDER BY lastModified DESC`);

// export const getById = <T>(table: string, id: string) =>
//   UltraDB.exec<T[]>(table, `SELECT * FROM ${table} WHERE id = ?`, [id])
//     .then(res => res?.[0] ?? null);

// export const insert = UltraDB.insert;
// export const deleteById = (table: string, id: string) =>
//   UltraDB.exec(table, `DELETE FROM ${table} WHERE id = ?`, [id]).then(() =>
//     UltraDB['clearCache'](table)
//   );
// export const search = <T>(table: string, field: string, query: string) =>
//   UltraDB.exec<T>(table, `SELECT * FROM ${table} WHERE ${field} LIKE ?`, [`%${query}%`]);
// export const count = (table: string) =>
//   UltraDB.exec<any>(table, `SELECT COUNT(*) AS count FROM ${table}`).then(res => res?.[0]?.count ?? 0);

// // ✅ ENHANCED: Much better database initialization with comprehensive error handling
// export async function initializeDatabase(): Promise<void> {
//   console.log("🔄 Starting database initialization...");
  
//   try {
//     const db = await dbPromise;
//     console.log("✅ Database connection established");

//     // Apply optimizations first
//     const optimizations = [
//       'PRAGMA journal_mode=WAL',
//       'PRAGMA synchronous=NORMAL', 
//       'PRAGMA cache_size=-20000',
//       'PRAGMA temp_store=MEMORY',
//     ];

//     for (const pragma of optimizations) {
//       try {
//         // ✅ FIXED: Add explicit type for error parameter
// await Promise.all(optimizations.map(p => 
//   new Promise<void>((resolve, reject) => 
//     db.executeSql(p, [], 
//       () => resolve(), 
//       (error: any) => resolve() // ✅ FIXED: Explicit type
//     )
//   )
// ));

//       } catch (error) {
//         console.warn(`⚠️ PRAGMA failed: ${pragma}`, error);
//       }
//     }

//     return new Promise<void>((resolve, reject) => {
//       db.transaction((tx: SQLTransaction) => {
//         // Create schema version table first
//         tx.executeSql(
//           'CREATE TABLE IF NOT EXISTS schema_version (id INTEGER PRIMARY KEY, version INTEGER)',
//           [],
//           () => {
//             console.log("✅ Schema version table created");
            
//             // Check current version
//             tx.executeSql(
//               'SELECT version FROM schema_version WHERE id=1',
//               [],
//               (_: SQLTransaction, res: SQLResultSet) => {
//                 const currentVersion = res.rows.length ? res.rows.item(0).version : 0;
//                 console.log(`📊 Current schema version: ${currentVersion}, target: ${SCHEMA_VERSION}`);
                
//                 if (currentVersion < SCHEMA_VERSION) {
//                   console.log("🔄 Updating database schema...");
                  
//                   const tables: Record<string, string> = {
//                     invoices: "id TEXT PRIMARY KEY, customerId TEXT DEFAULT 'embedded', customerName TEXT DEFAULT '', customer TEXT DEFAULT '{}', items TEXT DEFAULT '[]', subtotal REAL DEFAULT 0, total REAL DEFAULT 0, date TEXT NOT NULL, status TEXT DEFAULT 'pending', paymentMethod TEXT, notes TEXT, generatedBy TEXT, collectedBy TEXT, paymentDate TEXT, lastModified INTEGER DEFAULT 0",
//                     parts: "id TEXT PRIMARY KEY, name TEXT NOT NULL, partNumber TEXT, purchasePrice REAL DEFAULT 0, sellingPrice REAL DEFAULT 0, mrp REAL DEFAULT 0, quantity INTEGER DEFAULT 0, supplierId TEXT DEFAULT '', supplierName TEXT DEFAULT '', isLowStock INTEGER DEFAULT 0, status TEXT DEFAULT 'active', images TEXT DEFAULT '[]', lastModified INTEGER DEFAULT 0",
//                     suppliers: "id TEXT PRIMARY KEY, name TEXT NOT NULL, contactPerson TEXT, phone TEXT, email TEXT, address TEXT, status TEXT DEFAULT 'active', lastModified INTEGER DEFAULT 0",
//                     transactions: "id TEXT PRIMARY KEY, date TEXT NOT NULL, amount REAL NOT NULL, paymentMethod TEXT DEFAULT 'Cash', description TEXT, category TEXT DEFAULT 'Miscellaneous', recordedBy TEXT, paidBy TEXT, status TEXT DEFAULT 'Pending', sourceId TEXT, sourceType TEXT, lastModified INTEGER DEFAULT 0",
//                     stockPurchases: "id TEXT PRIMARY KEY, supplierId TEXT NOT NULL, supplierName TEXT DEFAULT '', supplier TEXT DEFAULT '{}', items TEXT DEFAULT '[]', total REAL DEFAULT 0, date TEXT NOT NULL, status TEXT DEFAULT 'Pending', paymentMethod TEXT, notes TEXT, createdBy TEXT, paidBy TEXT, paymentDate TEXT, receiptUrl TEXT, lastModified INTEGER DEFAULT 0",
//                     customers: "id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT, address TEXT, lastModified INTEGER DEFAULT 0",
//                     users: "id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, role TEXT DEFAULT 'Shopkeeper', avatar TEXT, status TEXT DEFAULT 'active', createdAt TEXT, updatedAt TEXT, authAccountCreated INTEGER DEFAULT 0, deletedAt TEXT, deletedBy TEXT, restoredAt TEXT, passwordChangeRequested INTEGER DEFAULT 0, pendingPassword TEXT, lastModified INTEGER DEFAULT 0",
//                     shop: "id TEXT PRIMARY KEY DEFAULT 'main', name TEXT DEFAULT '', address TEXT DEFAULT '', phone TEXT DEFAULT '', email TEXT DEFAULT '', logo TEXT, lastModified INTEGER DEFAULT 0",
//                     change_log: "id INTEGER PRIMARY KEY AUTOINCREMENT, collection TEXT NOT NULL, documentId TEXT NOT NULL, operation TEXT NOT NULL, data TEXT NOT NULL, timestamp INTEGER NOT NULL"
//                   };

//                   // Create tables
//                   for (const [tableName, schema] of Object.entries(tables)) {
//                     tx.executeSql(
//                       `CREATE TABLE IF NOT EXISTS ${tableName} (${schema});`,
//                       [],
//                       () => console.log(`✅ Table '${tableName}' created/verified`),
//                       (tx, error) => {
//                         console.error(`❌ Failed to create table '${tableName}':`, error);
//                         return handleSqlError(tx, error);
//                       }
//                     );
//                   }

//                   // Create indexes
//                   const indexes = [
//                     "CREATE INDEX IF NOT EXISTS idx_invoices_lastModified ON invoices (lastModified DESC);",
//                     "CREATE INDEX IF NOT EXISTS idx_parts_lastModified ON parts (lastModified DESC);",
//                     "CREATE INDEX IF NOT EXISTS idx_suppliers_lastModified ON suppliers (lastModified DESC);",
//                     "CREATE INDEX IF NOT EXISTS idx_transactions_lastModified ON transactions (lastModified DESC);",
//                     "CREATE INDEX IF NOT EXISTS idx_stockPurchases_lastModified ON stockPurchases (lastModified DESC);",
//                     "CREATE INDEX IF NOT EXISTS idx_customers_lastModified ON customers (lastModified DESC);",
//                     "CREATE INDEX IF NOT EXISTS idx_users_lastModified ON users (lastModified DESC);",
//                     "CREATE INDEX IF NOT EXISTS idx_shop_lastModified ON shop (lastModified DESC);",
//                     "CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(name COLLATE NOCASE);",
//                     "CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name COLLATE NOCASE);",
//                     "CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);",
//                     "CREATE INDEX IF NOT EXISTS idx_change_log_timestamp ON change_log(timestamp DESC);"
//                   ];

//                   indexes.forEach(indexSql => {
//                     tx.executeSql(indexSql, [], () => {}, handleSqlError);
//                   });

//                   // Update schema version
//                   tx.executeSql(
//                     `INSERT OR REPLACE INTO schema_version (id, version) VALUES (1, ?);`,
//                     [SCHEMA_VERSION],
//                     () => {
//                       console.log(`✅ Database schema updated to version ${SCHEMA_VERSION}`);
//                       resolve();
//                     },
//                     (tx, error) => {
//                       console.error("❌ Failed to update schema version:", error);
//                       handleSqlError(tx, error);
//                       reject(error);
//                       return true;
//                     }
//                   );
//                 } else {
//                   console.log("✅ Database schema is up to date");
//                   resolve();
//                 }
//               },
//               (tx, error) => {
//                 console.error("❌ Failed to check schema version:", error);
//                 handleSqlError(tx, error);
//                 reject(error);
//                 return true;
//               }
//             );
//           },
//           (tx, error) => {
//             console.error("❌ Failed to create schema version table:", error);
//             handleSqlError(tx, error);
//             reject(error);
//             return true;
//           }
//         );
//       }, (error: any) => {
//         console.error("❌ Database transaction failed:", error);
//         reject(error);
//       });
//     });
//   } catch (error) {
//     console.error("❌ Database initialization failed:", error);
//     throw error;
//   }
// }

// export async function optimizeDatabase(): Promise<void> {
//   const db = await dbPromise;
//   await Promise.all([
//     new Promise<void>((resolve) => db.executeSql("ANALYZE;", [], () => resolve(), () => resolve())),
//     new Promise<void>((resolve) => db.executeSql("VACUUM;", [], () => resolve(), () => resolve())),
//     new Promise<void>((resolve) => db.executeSql("PRAGMA optimize;", [], () => resolve(), () => resolve())),
//   ]);
//   console.log("✅ Database optimized");
// }

// // ✅ ADD: Enhanced export functionality with better error handling
// export async function exportDatabase(): Promise<{ success: boolean; data?: any; error?: string }> {
//   try {
//     const tables = ['invoices', 'parts', 'suppliers', 'transactions', 'stockPurchases', 'customers', 'users', 'shop'];
//     const dataSets = await Promise.all(tables.map(t => getAll<any>(t)));
    
//     const exportData: Record<string, any> = {};
//     tables.forEach((table, index) => {
//       exportData[table] = dataSets[index];
//     });
    
//     return {
//       success: true,
//       data: {
//         ...exportData,
//         version: SCHEMA_VERSION,
//         timestamp: new Date().toISOString(),
//       },
//     };
//   } catch(e) {
//     return { 
//       success: false, 
//       error: e instanceof Error ? e.message : String(e) 
//     };
//   }
// }

// // ✅ ADD: Sync-related helper functions
// export async function getLastSyncTime(): Promise<number> {
//   try {
//     const result = await getById<{ lastSyncTime: number }>('shop', 'sync_metadata');
//     return result?.lastSyncTime || 0;
//   } catch {
//     return 0;
//   }
// }

// export async function setLastSyncTime(timestamp: number): Promise<void> {
//   try {
//     await insert('shop', {
//       id: 'sync_metadata',
//       name: 'sync_metadata',
//       lastSyncTime: timestamp,
//       lastModified: Date.now(),
//     });
//   } catch (error) {
//     console.error('Failed to set last sync time:', error);
//   }
// }

// export async function getChangeLog(): Promise<Array<{
//   collection: string;
//   documentId: string;
//   operation: string;
//   data: string;
//   timestamp: number;
// }>> {
//   try {
//     return await UltraDB.exec<any>('change_log', 'SELECT * FROM change_log ORDER BY timestamp ASC');
//   } catch {
//     return [];
//   }
// }

// export async function clearChangeLog(): Promise<void> {
//   try {
//     await UltraDB.exec('change_log', 'DELETE FROM change_log');
//   } catch (error) {
//     console.error('Failed to clear change log:', error);
//   }
// }

// console.log("🚀 UltraDB initialized and ready");

// // ✅ ADD: Export types for use in other files
// export type { SQLTransaction, SQLResultSet };





































// // // src/lib/localDb.ts
// // import SQLite from 'react-native-sqlite-storage';

// // SQLite.enablePromise(true);

// // interface SQLTransaction {
// //   executeSql(
// //     sql: string,
// //     params?: any[],
// //     success?: (tx: SQLTransaction, results: any) => void,
// //     error?: (tx: SQLTransaction, err: any) => boolean
// //   ): void;
// // }

// // export const dbPromise = SQLite.openDatabase({
// //   name: 'vs_auto_local.db',
// //   location: 'default',
// // }) as Promise<any>;

// // const SCHEMA_VERSION = 12;

// // export const handleSqlError = (tx: SQLTransaction, error: any): boolean => {
// //   console.error("🔴 [SQLite ERROR]", {
// //     message: error?.message || '(no message)',
// //     code: error?.code,
// //     raw: error,
// //     stringified: (() => {
// //       try { return JSON.stringify(error); } catch { return null; }
// //     })(),
// //   });
// //   return true;
// // };

// // // 🚀 Ultra-Advanced Database class
// // class UltraDB {
// //   private static cache = new Map<string, { data: any; expiry: number }>();
// //   private static readonly TTL = 5 * 60 * 1000; // 5 min cache

// //   // Table-specific cleaning
// //   private static clean = (data: any, table: string): any => {
// //     const clean = {
// //       ...data,
// //       id: data.id || `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
// //       lastModified: Date.now(),
// //     };

// //     switch (table) {
// //       case 'invoices':
// //         return {
// //           ...clean,
// //           items: JSON.stringify(clean.items || []),
// //           customer: JSON.stringify(clean.customer || {}),
// //           total: Number(clean.total) || 0,
// //           status: clean.status || 'pending',
// //         };
// //       case 'parts':
// //         return {
// //           ...clean,
// //           name: clean.name || "",
// //           partNumber: clean.partNumber || "",
// //           purchasePrice: Number(clean.purchasePrice) || 0,
// //           sellingPrice: Number(clean.sellingPrice) || 0,
// //           mrp: Number(clean.mrp) || Number(clean.sellingPrice) || 0,
// //           quantity: Number(clean.quantity) || 0,
// //           supplierId: clean.supplierId || "",
// //           supplierName: clean.supplierName || "",
// //           status: clean.status || "active",
// //           isLowStock: Number(clean.quantity) < 10 ? 1 : 0,
// //         };
// //       case 'suppliers':
// //         return {
// //           ...clean,
// //           name: clean.name || '',
// //           contactPerson: clean.contactPerson || '',
// //           phone: clean.phone || '',
// //           email: clean.email || '',
// //           address: clean.address || '',
// //           status: clean.status || 'active',
// //         };
// //       case 'transactions':
// //         return {
// //           ...clean,
// //           amount: Number(clean.amount) || 0,
// //           paymentMethod: clean.paymentMethod || 'cash',
// //           status: clean.status || 'completed',
// //         };
// //       case 'shop':
// //         return {
// //           ...clean,
// //           name: clean.name || '',
// //           address: clean.address || '',
// //           phone: clean.phone || '',
// //           email: clean.email || '',
// //         };
// //       default:
// //         return clean;
// //     }
// //   };

// //   // Cached exec
// //   static async exec<T>(table: string, operation: string, params: any[] = []): Promise<T> {
// //     const cacheKey = `${table}:${operation}:${JSON.stringify(params)}`;
// //     const cached = this.cache.get(cacheKey);
// //     if (cached && Date.now() < cached.expiry) return cached.data;

// //     const db = await dbPromise;
// //     return new Promise((resolve, reject) => {
// //       db.transaction((tx: SQLTransaction) => {
// //         tx.executeSql(
// //           operation,
// //           params,
// //           (_, results) => {
// //             const data = results.rows
// //               ? Array.from({ length: results.rows.length }, (_, i) => results.rows.item(i))
// //               : results;
// //             this.cache.set(cacheKey, { data, expiry: Date.now() + this.TTL });
// //             resolve(data);
// //           },
// //           (tx: SQLTransaction, err: any) => {
// //             console.error(`❌ SQL Exec Failed: ${operation} -- Params: ${JSON.stringify(params)}`);
// //             reject(err);
// //             return handleSqlError(tx, err);
// //           }
// //         );
// //       }, reject);
// //     });
// //   }

// //   static async insert<T>(table: string, data: T): Promise<string> {
// //     const clean = this.clean(data, table);
// //     const schema = await this.exec<any[]>(table, `PRAGMA table_info(${table})`);
// //     const validCols = new Set(schema.map(col => col.name));
// //     const filtered = Object.fromEntries(Object.entries(clean).filter(([key]) => validCols.has(key)));

// //     const cols = Object.keys(filtered);
// //     const vals = Object.values(filtered);

// //     console.log(`💾 Inserting into ${table}:`, { cols, vals });

// //     await this.exec(
// //       table,
// //       `INSERT OR REPLACE INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
// //       vals
// //     );
// //     this.clearCache(table);

// //     return String(filtered.id || '');
// //   }

// //   private static clearCache(pattern: string) {
// //     Array.from(this.cache.keys())
// //       .filter(key => key.includes(pattern))
// //       .forEach(key => this.cache.delete(key));
// //   }
// // }

// // // --- extra helpers ---
// // export const update = async <T>(table: string, id: string, updates: Partial<T>) => {
// //   const db = await dbPromise;
// //   return new Promise<void>((resolve, reject) => {
// //     db.transaction(
// //       (tx: SQLTransaction) => {
// //         const fields = Object.keys(updates);
// //         if (fields.length === 0) return resolve();

// //         const setClause = fields.map(f => `${f} = ?`).join(', ');
// //         const values = [...Object.values(updates), id];

// //         console.log(`✏️ Updating ${table} id=${id} with:`, updates);

// //         tx.executeSql(
// //           `UPDATE ${table} SET ${setClause} WHERE id = ?`,
// //           values,
// //           () => resolve(),
// //           (tx: SQLTransaction, err: any) => {
// //             handleSqlError(tx, err);
// //             reject(err);
// //             return true;
// //           }
// //         );
// //       },
// //       (err: any) => reject(err)
// //     );
// //   });
// // };

// // // Minimal API exports
// // export const getAll = <T>(table: string) =>
// //   UltraDB.exec<T[]>(table, `SELECT * FROM ${table} ORDER BY lastModified DESC`);
// // export const getById = <T>(table: string, id: string) =>
// //   UltraDB.exec<T[]>(table, `SELECT * FROM ${table} WHERE id = ?`, [id]).then(
// //     (r) => r[0] || null
// //   );
// // export const insert = UltraDB.insert;
// // export const deleteById = (table: string, id: string) =>
// //   UltraDB.exec(table, `DELETE FROM ${table} WHERE id = ?`, [id]).then(() =>
// //     UltraDB['clearCache'](table)
// //   );
// // export const search = <T>(table: string, field: string, query: string) =>
// //   UltraDB.exec<T[]>(
// //     table,
// //     `SELECT * FROM ${table} WHERE ${field} LIKE ?`,
// //     [`%${query}%`]
// //   );
// // export const count = (table: string) =>
// //   UltraDB.exec<any>(table, `SELECT COUNT(*) as count FROM ${table}`).then(
// //     (r) => r[0]?.count || 0
// //   );

// // // Legacy compatibility
// // export const safeUpsert = insert;
// // export const upsert = insert;

// // // --- DB init ---
// // export async function initializeDatabase(): Promise<void> {
// //   const db = await dbPromise;
// //   const optimizations = [
// //     'PRAGMA journal_mode = WAL',
// //     'PRAGMA synchronous = NORMAL',
// //     'PRAGMA cache_size = -20000',
// //     'PRAGMA temp_store = MEMORY',
// //     'PRAGMA optimize',
// //   ];
// //   await Promise.all(
// //     optimizations.map((pragma) =>
// //       new Promise((resolve) => db.executeSql(pragma, [], resolve, resolve))
// //     )
// //   );

// //   return new Promise((resolve, reject) => {
// //     db.transaction((tx: SQLTransaction) => {
// //       tx.executeSql(
// //         'CREATE TABLE IF NOT EXISTS schema_version (id INTEGER PRIMARY KEY, version INTEGER)',
// //         [],
// //         () => {
// //           tx.executeSql(
// //             'SELECT version FROM schema_version WHERE id = 1',
// //             [],
// //             (_, results) => {
// //               const currentVersion =
// //                 results.rows.length > 0 ? results.rows.item(0).version : 0;
// //               if (currentVersion < SCHEMA_VERSION) {
// //                 const tables = {
// //                   invoices:
// //                     "id TEXT PRIMARY KEY, customerId TEXT, customer TEXT DEFAULT '{}', items TEXT DEFAULT '[]', total REAL DEFAULT 0, date TEXT NOT NULL, status TEXT DEFAULT 'pending', paymentMethod TEXT, notes TEXT, lastModified INTEGER DEFAULT 0",
// //                   parts:
// //                     "id TEXT PRIMARY KEY, name TEXT NOT NULL, partNumber TEXT, purchasePrice REAL DEFAULT 0, sellingPrice REAL DEFAULT 0, mrp REAL DEFAULT 0, quantity INTEGER DEFAULT 0, supplierId TEXT, supplierName TEXT, isLowStock INTEGER DEFAULT 0, status TEXT DEFAULT 'active', lastModified INTEGER DEFAULT 0",
// //                   suppliers:
// //                     "id TEXT PRIMARY KEY, name TEXT NOT NULL, contactPerson TEXT, phone TEXT, email TEXT, address TEXT, status TEXT DEFAULT 'active', lastModified INTEGER DEFAULT 0",
// //                   transactions:
// //                     "id TEXT PRIMARY KEY, date TEXT NOT NULL, amount REAL NOT NULL, paymentMethod TEXT DEFAULT 'cash', description TEXT, category TEXT, status TEXT DEFAULT 'completed', sourceId TEXT, sourceType TEXT, lastModified INTEGER DEFAULT 0",
// //                   shop:
// //                     "id TEXT PRIMARY KEY DEFAULT 'main', name TEXT DEFAULT '', address TEXT DEFAULT '', phone TEXT DEFAULT '', email TEXT DEFAULT '', lastModified INTEGER DEFAULT 0",
// //                 };

// //                 Object.entries(tables).forEach(([table, schema]) => {
// //                   tx.executeSql(
// //                     `CREATE TABLE IF NOT EXISTS ${table} (${schema})`,
// //                     [],
// //                     () => {},
// //                     handleSqlError
// //                   );
// //                   tx.executeSql(
// //                     `CREATE INDEX IF NOT EXISTS idx_${table}_lastModified ON ${table}(lastModified DESC)`,
// //                     [],
// //                     () => {},
// //                     handleSqlError
// //                   );
// //                 });

// //                 [
// //                   'CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(name COLLATE NOCASE)',
// //                   'CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name COLLATE NOCASE)',
// //                   'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC)',
// //                 ].forEach((sql) =>
// //                   tx.executeSql(sql, [], () => {}, handleSqlError)
// //                 );

// //                 tx.executeSql(
// //                   'INSERT OR REPLACE INTO schema_version (id, version) VALUES (1, ?)',
// //                   [SCHEMA_VERSION],
// //                   () =>
// //                     console.log(
// //                       `✅ [DB v${SCHEMA_VERSION}] Ultra-fast initialization complete`
// //                     ),
// //                   handleSqlError
// //                 );
// //               }
// //             },
// //             handleSqlError
// //           );
// //         },
// //         handleSqlError
// //       );
// //     }, reject, resolve);
// //   });
// // }

// // // Maintenance
// // export const optimizeDatabase = async (): Promise<void> => {
// //   const db = await dbPromise;
// //   const ops = ['ANALYZE', 'VACUUM', 'PRAGMA optimize'];
// //   await Promise.all(
// //     ops.map((op) => new Promise((resolve) => db.executeSql(op, [], resolve, resolve)))
// //   );
// //   console.log('✅ [DB] Optimized');
// // };

// // // Export function
// // export const exportDatabase = async () => {
// //   try {
// //     const tables = ['invoices', 'parts', 'suppliers', 'transactions', 'shop'];
// //     const data = await Promise.all(
// //       tables.map(async (table) => ({ [table]: await getAll(table) }))
// //     );
// //     return {
// //       success: true,
// //       data: Object.assign({}, ...data, {
// //         version: SCHEMA_VERSION,
// //         timestamp: new Date().toISOString(),
// //       }),
// //     };
// //   } catch (error) {
// //     return {
// //       success: false,
// //       error: error instanceof Error ? error.message : 'Export failed',
// //     };
// //   }
// // };

// // console.log('🚀 [UltraDB] Advanced local database ready');
