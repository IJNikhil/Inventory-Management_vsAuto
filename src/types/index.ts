// export interface BaseEntity {
//   id: string;
//   lastModified: number;
// }

// export type Part = BaseEntity & {
//   name: string;
//   partNumber: string;
//   purchasePrice: number;
//   sellingPrice: number;
//   mrp: number;
//   quantity: number;
//   supplierId: string;
//   supplierName?: string;
//   isLowStock: boolean;
//   status: 'active' | 'deleted';
// };

// export type Supplier = BaseEntity & {
//   name: string;
//   contactPerson?: string;
//   phone?: string;
//   email?: string;
//   address?: string;
//   status: 'active' | 'inactive';
// };

// export type Customer = BaseEntity & {
//   name: string;
//   phone?: string;
//   address?: string;
// };

// export type InvoiceCustomer = {
//   name: string;
//   phone?: string;
//   address?: string;
// };

// export type InvoiceItem = {
//   id: string;
//   description: string;
//   quantity: number;
//   price: number;
//   mrp: number;
//   discount: number;
//   partId?: string;
//   isSpecialDiscount?: boolean;
// };

// export type Invoice = BaseEntity & {
//   customer: InvoiceCustomer;
//   customerName: string; // Backward compatibility
//   items: InvoiceItem[];
//   subtotal: number;
//   total: number;
//   date: string;
//   status: 'Paid' | 'Pending' | 'Overdue';
//   paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
//   notes: string;
//   generatedBy: string;
//   collectedBy?: string;
//   paymentDate?: string;
// };

// export type StockPurchaseItem = {
//   id: string;
//   partId?: string;
//   name: string;
//   partNumber?: string;
//   quantity: number;
//   purchasePrice: number;
//   mrp: number;
// };

// export type StockPurchase = BaseEntity & {
//   supplierId: string;
//   supplier: {
//     id: string;
//     name: string;
//     address?: string;
//     phone?: string;
//   };
//   items: StockPurchaseItem[];
//   total: number;
//   date: string;
//   status: 'Paid' | 'Pending';
//   paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
//   notes?: string;
//   createdBy: string;
//   paidBy?: string;
//   paymentDate?: string;
//   receiptUrl?: string;
// };

// export type Transaction = BaseEntity & {
//   date: string;
//   amount: number;
//   paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
//   description: string;
//   category:
//     | 'Rent' | 'Salaries'
//     | 'Utilities' | 'Office Supplies'
//     | 'Marketing' | 'Repairs'
//     | 'Miscellaneous' | 'Stock Purchase';
//   recordedBy: string;
//   paidBy?: string;
//   status: 'Paid' | 'Pending';
//   sourceId?: string;
//   sourceType?: 'Invoice' | 'Stock Purchase';
// };

// export type Activity = {
//   id: number;
//   user: { name: string; email: string };
//   action: string;
//   badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
//   details: string;
//   timestamp: string;
// };

// export type ActivityLog = {
//   id: string;
//   action: string;
//   user: string;
//   timestamp: string;
//   details: string;
// };

// export type ShopDetails = BaseEntity & {
//   name: string;
//   address: string;
//   phone: string;
//   email: string;
//   logo?: string;
// };
