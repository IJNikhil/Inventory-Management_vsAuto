// src/types/database.ts
export interface SQLTransaction {
  executeSql(
    sql: string,
    params?: any[],
    success?: (tx: SQLTransaction, results: SQLResultSet) => void,
    error?: (tx: SQLTransaction, err: any) => boolean
  ): void;
}

export interface SQLResultSet {
  rows: {
    length: number;
    item: (index: number) => any;
    _array?: any[];
  };
  rowsAffected: number;
  insertId?: number;
}

export interface DatabaseConnection {
  transaction: (
    fn: (tx: SQLTransaction) => void,
    errorCallback?: (error: any) => void,
    successCallback?: () => void
  ) => void;
  executeSql: (
    sql: string,
    params?: any[],
    success?: (results: SQLResultSet) => void,
    error?: (error: any) => void
  ) => void;
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface Supplier extends BaseEntity {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  parent_id?: string;
}

export interface Part extends BaseEntity {
  name: string;
  part_number: string;
  category_id?: string;
  purchase_price: number;
  selling_price: number;
  mrp: number;
  quantity: number;
  min_stock_level: number;
  supplier_id?: string;
  status: 'active' | 'inactive';
}

export interface InvoiceCustomer {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Invoice extends BaseEntity {
  invoice_number: string;
  customer: InvoiceCustomer;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  invoice_date: string;
  due_date?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: 'cash' | 'upi' | 'bank_transfer';
  notes?: string;
  generated_by: string;
  payment_date?: string;
}

export interface InvoiceItem extends BaseEntity {
  invoice_id: string;
  part_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  tax_percentage: number;
  line_total: number;
}

export interface StockPurchaseItemCreate {
  id: string;
  part_id?: string;
  name: string;
  part_number?: string;
  description?: string;
  quantity: number;
  purchase_price: number;
  mrp: number;
  line_total?: number;
}

export interface SupplierEmbedded {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: 'active' | 'inactive';
}

export interface StockPurchaseItem extends BaseEntity {
  purchase_id: string;
  part_id?: string;
  name?: string;
  part_number?: string;
  description: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
}

export interface StockPurchase extends BaseEntity {
  purchase_number: string;
  supplier_id: string;
  supplier?: SupplierEmbedded;
  subtotal: number;
  tax_amount: number;
  total: number;
  purchase_date: string;
  status: 'pending' | 'received' | 'cancelled';
  payment_method?: 'cash' | 'upi' | 'bank_transfer';
  notes?: string;
  created_by: string;
  payment_date?: string;
}

export interface Transaction extends BaseEntity {
  reference_id?: string;
  reference_type?: 'invoice' | 'purchase' | 'expense';
  amount: number;
  transaction_type: 'income' | 'expense';
  category: string;
  description: string;
  transaction_date: string;
  payment_method: 'cash' | 'upi' | 'bank_transfer';
  recorded_by: string;
  status: 'completed' | 'pending' | 'cancelled';
  payment_date?: string;
}

export interface User extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff';
  avatar?: string;
  status: 'active' | 'inactive';
  last_login?: string;
}

export interface ShopSettings extends BaseEntity {
  shop_name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  tax_number?: string;
  currency: string;
}

export interface InvoiceWithItems {
  invoice: Invoice;
  items: InvoiceItem[];
}

export interface StockPurchaseWithItems {
  purchase: StockPurchase;
  items: StockPurchaseItem[];
  supplier?: Supplier;
}

export interface PartWithSupplier {
  part: Part;
  supplier?: Supplier;
  category?: Category;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  where?: Record<string, any>;
}

export interface DatabaseStats {
  total_suppliers: number;
  total_parts: number;
  low_stock_parts: number;
  pending_invoices: number;
  overdue_invoices: number;
  pending_purchases: number;
  total_revenue: number;
  total_expenses: number;
}