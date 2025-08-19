import SQLite from 'react-native-sqlite-storage';
import type { DatabaseConnection, SQLTransaction, SQLResultSet } from '../../types/database';

// Enable promises for SQLite
SQLite.enablePromise(true);

// ✅ ADDED: handleSqlError function for compatibility
export const handleSqlError = (tx: SQLTransaction, error: any): boolean => {
  const errorDetails = {
    message: error?.message || 'Unknown SQL error',
    code: error?.code || 'NO_CODE',
    details: error?.details || 'No details available',
    type: typeof error,
    constructor: error?.constructor?.name || 'Unknown',
    // Try to extract more details from the error object
    ...(error && typeof error === 'object' ? {
      domain: error.domain,
      userInfo: error.userInfo,
      nativeStackIOS: error.nativeStackIOS,
      nativeStackAndroid: error.nativeStackAndroid,
    } : {}),
  };
  console.error("🔴 SQLite ERROR Details:", errorDetails);
  
  // Log the full error object for debugging
  if (error) {
    console.error("🔴 Full Error Object:", error);
    console.error("🔴 Error Keys:", Object.keys(error));
  }
  return true;
};

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: DatabaseConnection | null = null;
  private connectionPromise: Promise<DatabaseConnection> | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async getConnection(): Promise<DatabaseConnection> {
    if (this.db && this.isInitialized) {
      return this.db;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.createConnection();
    return this.connectionPromise;
  }

  private async createConnection(): Promise<DatabaseConnection> {
    try {
      console.log('🔄 Creating database connection...');
      
      const db = await SQLite.openDatabase({
        name: 'vs_auto_production.db',
        location: 'default',
        createFromLocation: undefined,
      });

      // Apply performance optimizations
      await this.applyOptimizations(db);
      
      this.db = db;
      console.log('✅ Database connection established');
      
      return db;
    } catch (error) {
      console.error('❌ Failed to create database connection:', error);
      throw new Error('Database connection failed');
    }
  }

  private async applyOptimizations(db: DatabaseConnection): Promise<void> {
    const optimizations = [
      'PRAGMA journal_mode=WAL;',           // Write-Ahead Logging
      'PRAGMA synchronous=NORMAL;',         // Balanced durability/performance  
      'PRAGMA cache_size=-64000;',          // 64MB cache
      'PRAGMA temp_store=MEMORY;',          // Store temp data in memory
      'PRAGMA mmap_size=268435456;',        // 256MB memory-mapped I/O
      'PRAGMA page_size=4096;',             // 4KB page size
      'PRAGMA auto_vacuum=INCREMENTAL;',    // Incremental vacuuming
    ];

    for (const pragma of optimizations) {
      try {
        await this.executeSql(db, pragma);
        console.log(`✅ Applied: ${pragma.split('=')[0]}`);
      } catch (error) {
        console.warn(`⚠️ Failed to apply optimization: ${pragma}`, error);
      }
    }
  }

  async initializeSchema(): Promise<void> {
    const db = await this.getConnection();
    
    try {
      await this.createTables(db);
      await this.migrateTables(db); // ✅ ADDED: Run migration
      await this.createIndexes(db);
      await this.createTriggers(db);
      
      this.isInitialized = true;
      console.log('✅ Database schema initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database schema:', error);
      throw error;
    }
  }

  private async createTables(db: DatabaseConnection): Promise<void> {
    const tables = {
      suppliers: `
        CREATE TABLE IF NOT EXISTS suppliers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          contact_person TEXT,
          phone TEXT,
          email TEXT,
          address TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          version INTEGER DEFAULT 1
        )
      `,

      categories: `
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          parent_id TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          version INTEGER DEFAULT 1,
          FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
        )
      `,

      parts: `
        CREATE TABLE IF NOT EXISTS parts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          part_number TEXT UNIQUE,
          category_id TEXT,
          purchase_price REAL DEFAULT 0 CHECK (purchase_price >= 0),
          selling_price REAL DEFAULT 0 CHECK (selling_price >= 0),
          mrp REAL DEFAULT 0 CHECK (mrp >= 0),
          quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
          min_stock_level INTEGER DEFAULT 5 CHECK (min_stock_level >= 0),
          supplier_id TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          version INTEGER DEFAULT 1,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
          FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
        )
      `,

      invoices: `
        CREATE TABLE IF NOT EXISTS invoices (
          id TEXT PRIMARY KEY,
          invoice_number TEXT NOT NULL UNIQUE,
          customer TEXT NOT NULL DEFAULT '{}',
          subtotal REAL DEFAULT 0 CHECK (subtotal >= 0),
          tax_amount REAL DEFAULT 0 CHECK (tax_amount >= 0),
          discount_amount REAL DEFAULT 0 CHECK (discount_amount >= 0),
          total REAL DEFAULT 0 CHECK (total >= 0),
          invoice_date TEXT NOT NULL,
          due_date TEXT,
          status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
          payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'bank_transfer')),
          notes TEXT,
          generated_by TEXT NOT NULL,
          payment_date TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          version INTEGER DEFAULT 1
        )
      `,

      invoice_items: `
        CREATE TABLE IF NOT EXISTS invoice_items (
          id TEXT PRIMARY KEY,
          invoice_id TEXT NOT NULL,
          part_id TEXT,
          description TEXT NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          unit_price REAL NOT NULL CHECK (unit_price >= 0),
          discount_percentage REAL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
          tax_percentage REAL DEFAULT 0 CHECK (tax_percentage >= 0 AND tax_percentage <= 100),
          line_total REAL NOT NULL CHECK (line_total >= 0),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          version INTEGER DEFAULT 1,
          FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
          FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE SET NULL
        )
      `,

      stock_purchases: `
        CREATE TABLE IF NOT EXISTS stock_purchases (
          id TEXT PRIMARY KEY,
          purchase_number TEXT NOT NULL UNIQUE,
          supplier_id TEXT NOT NULL,
          subtotal REAL DEFAULT 0 CHECK (subtotal >= 0),
          tax_amount REAL DEFAULT 0 CHECK (tax_amount >= 0),
          total REAL DEFAULT 0 CHECK (total >= 0),
          purchase_date TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
          payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'bank_transfer')),
          notes TEXT,
          created_by TEXT NOT NULL,
          payment_date TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          version INTEGER DEFAULT 1,
          FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
        )
      `,

      stock_purchase_items: `
        CREATE TABLE IF NOT EXISTS stock_purchase_items (
          id TEXT PRIMARY KEY,
          purchase_id TEXT NOT NULL,
          part_id TEXT,
          description TEXT NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          unit_cost REAL NOT NULL CHECK (unit_cost >= 0),
          line_total REAL NOT NULL CHECK (line_total >= 0),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          version INTEGER DEFAULT 1,
          FOREIGN KEY (purchase_id) REFERENCES stock_purchases(id) ON DELETE CASCADE,
          FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE SET NULL
        )
      `,

      transactions: `
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          reference_id TEXT,
          reference_type TEXT CHECK (reference_type IN ('invoice', 'purchase', 'expense')),
          amount REAL NOT NULL CHECK (amount != 0),
          transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          transaction_date TEXT NOT NULL,
          payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'bank_transfer')),
          recorded_by TEXT NOT NULL,
          status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          version INTEGER DEFAULT 1
        )
      `,

      users: `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          phone TEXT,
          role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
          avatar TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          last_login TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          version INTEGER DEFAULT 1
        )
      `,

      shop_settings: `
        CREATE TABLE IF NOT EXISTS shop_settings (
          id TEXT PRIMARY KEY DEFAULT 'main',
          shop_name TEXT NOT NULL DEFAULT '',
          address TEXT,
          phone TEXT,
          email TEXT,
          logo TEXT,
          tax_number TEXT,
          currency TEXT DEFAULT 'INR',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          version INTEGER DEFAULT 1
        )
      `,

      audit_log: `
        CREATE TABLE IF NOT EXISTS audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_name TEXT NOT NULL,
          record_id TEXT NOT NULL,
          operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
          old_values TEXT,
          new_values TEXT,
          user_id TEXT,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `
    };

    for (const [tableName, sql] of Object.entries(tables)) {
      try {
        await this.executeSql(db, sql);
        console.log(`✅ Table '${tableName}' created/verified`);
      } catch (error) {
        console.error(`❌ Failed to create table '${tableName}':`, error);
        throw error;
      }
    }
  }

  // ✅ FIXED: Proper SQLResultSet handling in migration
  private async migrateTables(db: DatabaseConnection): Promise<void> {
    try {
      // Check if invoices table has old schema
      const tableInfo = await this.executeSql(db, "PRAGMA table_info(invoices)");
      
      // ✅ FIXED: Properly access SQLResultSet rows
      let hasCustomerNameField = false;
      
      if (tableInfo.rows) {
        // Method 1: Use _array if available (Expo SQLite)
        if ('_array' in tableInfo.rows && Array.isArray(tableInfo.rows._array)) {
          hasCustomerNameField = tableInfo.rows._array.some((row: any) => row.name === 'customer_name');
        } 
        // Method 2: Iterate using item() method and length (React Native SQLite)
        else if (typeof tableInfo.rows.length === 'number') {
          for (let i = 0; i < tableInfo.rows.length; i++) {
            const row = tableInfo.rows.item(i);
            if (row.name === 'customer_name') {
              hasCustomerNameField = true;
              break;
            }
          }
        }
      }
      
      if (hasCustomerNameField) {
        console.log('🔄 Migrating invoices table schema...');
        
        // Create new table with correct schema
        await this.executeSql(db, `
          CREATE TABLE IF NOT EXISTS invoices_new (
            id TEXT PRIMARY KEY,
            invoice_number TEXT NOT NULL UNIQUE,
            customer TEXT NOT NULL DEFAULT '{}',
            subtotal REAL DEFAULT 0 CHECK (subtotal >= 0),
            tax_amount REAL DEFAULT 0 CHECK (tax_amount >= 0),
            discount_amount REAL DEFAULT 0 CHECK (discount_amount >= 0),
            total REAL DEFAULT 0 CHECK (total >= 0),
            invoice_date TEXT NOT NULL,
            due_date TEXT,
            status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
            payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'bank_transfer')),
            notes TEXT,
            generated_by TEXT NOT NULL,
            payment_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            version INTEGER DEFAULT 1
          )
        `);
        
        // Migrate existing data
        await this.executeSql(db, `
          INSERT INTO invoices_new (
            id, invoice_number, customer, subtotal, tax_amount, discount_amount, 
            total, invoice_date, due_date, status, payment_method, notes, 
            generated_by, payment_date, created_at, updated_at, version
          )
          SELECT 
            id, invoice_number, 
            json_object('name', COALESCE(customer_name, ''), 'phone', COALESCE(customer_phone, ''), 'address', COALESCE(customer_address, ''), 'email', '') as customer,
            subtotal, tax_amount, discount_amount, total, invoice_date, due_date, 
            status, payment_method, notes, generated_by, payment_date, 
            created_at, updated_at, version
          FROM invoices
        `);
        
        // Replace old table
        await this.executeSql(db, 'DROP TABLE invoices');
        await this.executeSql(db, 'ALTER TABLE invoices_new RENAME TO invoices');
        
        console.log('✅ Invoices table migration completed');
      }
    } catch (error) {
      console.error('❌ Failed to migrate invoices table:', error);
      // Continue without throwing - let the app work with existing schema
    }
  }
  
  private async createIndexes(db: DatabaseConnection): Promise<void> {
    const indexes = [
      // Primary lookup indexes
      'CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name COLLATE NOCASE)',
      'CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(name COLLATE NOCASE)',
      'CREATE INDEX IF NOT EXISTS idx_parts_number ON parts(part_number)',
      'CREATE INDEX IF NOT EXISTS idx_parts_supplier ON parts(supplier_id)',
      
      // Business logic indexes
      'CREATE INDEX IF NOT EXISTS idx_parts_low_stock ON parts(quantity, min_stock_level)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC)',
      'CREATE INDEX IF NOT EXISTS idx_purchases_date ON stock_purchases(purchase_date DESC)',
      'CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON stock_purchases(supplier_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type)',
      
      // Composite indexes for common queries
      'CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id)',
      'CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON stock_purchase_items(purchase_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_ref ON transactions(reference_type, reference_id)',
      
      // Performance indexes
      'CREATE INDEX IF NOT EXISTS idx_updated_at ON parts(updated_at DESC)'
    ];

    for (const indexSql of indexes) {
      try {
        await this.executeSql(db, indexSql);
      } catch (error) {
        console.warn(`⚠️ Failed to create index: ${indexSql}`, error);
      }
    }
    
    console.log(`✅ Created ${indexes.length} database indexes`);
  }

  private async createTriggers(db: DatabaseConnection): Promise<void> {
    const triggers = [
      // Auto-update timestamp triggers
      `CREATE TRIGGER IF NOT EXISTS tr_suppliers_updated_at 
       AFTER UPDATE ON suppliers
       BEGIN
         UPDATE suppliers SET updated_at = CURRENT_TIMESTAMP, version = version + 1 WHERE id = NEW.id;
       END`,
      
      `CREATE TRIGGER IF NOT EXISTS tr_parts_updated_at 
       AFTER UPDATE ON parts
       BEGIN
         UPDATE parts SET updated_at = CURRENT_TIMESTAMP, version = version + 1 WHERE id = NEW.id;
       END`,

      // Stock level triggers
      `CREATE TRIGGER IF NOT EXISTS tr_invoice_items_stock_decrease
       AFTER INSERT ON invoice_items
       WHEN NEW.part_id IS NOT NULL
       BEGIN
         UPDATE parts 
         SET quantity = quantity - NEW.quantity,
             updated_at = CURRENT_TIMESTAMP,
             version = version + 1
         WHERE id = NEW.part_id;
       END`,

      `CREATE TRIGGER IF NOT EXISTS tr_purchase_items_stock_increase
       AFTER INSERT ON stock_purchase_items
       WHEN NEW.part_id IS NOT NULL
       BEGIN
         UPDATE parts 
         SET quantity = quantity + NEW.quantity,
             updated_at = CURRENT_TIMESTAMP,
             version = version + 1
         WHERE id = NEW.part_id;
       END`
    ];

    for (const triggerSql of triggers) {
      try {
        await this.executeSql(db, triggerSql);
      } catch (error) {
        console.warn(`⚠️ Failed to create trigger: ${triggerSql.slice(0, 50)}...`, error);
      }
    }
    
    console.log(`✅ Created ${triggers.length} database triggers`);
  }

  private async executeSql(db: DatabaseConnection, sql: string, params: any[] = []): Promise<SQLResultSet> {
    return new Promise((resolve, reject) => {
      db.executeSql(
        sql,
        params,
        resolve,
        reject
      );
    });
  }

  async executeTransaction<T>(
    callback: (tx: SQLTransaction) => Promise<T>
  ): Promise<T> {
    const db = await this.getConnection();
    
    return new Promise((resolve, reject) => {
      db.transaction(
        async (tx: SQLTransaction) => {
          try {
            const result = await callback(tx);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        reject
      );
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      // SQLite will handle connection cleanup
      this.db = null;
      this.isInitialized = false;
      this.connectionPromise = null;
      console.log('✅ Database connection closed');
    }
  }
}

// Singleton instance
export const databaseManager = DatabaseManager.getInstance();

// ✅ ENHANCED: Helper functions for common operations with better error handling
export async function executeQuery<T = any>(
  sql: string, 
  params: any[] = []
): Promise<T[]> {
  const db = await databaseManager.getConnection();
  
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        sql,
        params,
        (_, results: SQLResultSet) => {
          const rows: T[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            rows.push(results.rows.item(i));
          }
          resolve(rows);
        },
        (tx: SQLTransaction, error: any) => {
          console.error('SQL Query Error:', { sql, params, error });
          handleSqlError(tx, error); // ✅ ADDED: Use handleSqlError
          reject(error);
          return true;
        }
      );
    }, (error: any) => {
      console.error('Transaction Error:', error);
      reject(error);
    });
  });
}

export async function executeUpdate(
  sql: string, 
  params: any[] = []
): Promise<{ rowsAffected: number; insertId?: number }> {
  const db = await databaseManager.getConnection();
  
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        sql,
        params,
        (_, results: SQLResultSet) => {
          resolve({
            rowsAffected: results.rowsAffected,
            insertId: results.insertId
          });
        },
        (tx: SQLTransaction, error: any) => {
          console.error('SQL Update Error:', { sql, params, error });
          handleSqlError(tx, error); // ✅ ADDED: Use handleSqlError
          reject(error);
          return true;
        }
      );
    }, (error: any) => {
      console.error('Transaction Error:', error);
      reject(error);
    });
  });
}

export async function initializeDatabase(): Promise<void> {
  await databaseManager.initializeSchema();
}

// ✅ ADDED: Export types for compatibility
export type { SQLTransaction, SQLResultSet };

export default databaseManager;
