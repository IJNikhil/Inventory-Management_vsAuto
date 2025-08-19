import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { format } from 'date-fns';
import { ensureWritePermission } from '../utils/permissions';
import type { Invoice, ShopSettings, InvoiceItem, InvoiceCustomer } from '../../../types/database'; // ✅ FIXED: Use database types

interface UseInvoicePDFParams {
  invoice: Invoice | null;
  customer: InvoiceCustomer | null;
  shopDetails: ShopSettings | null; // ✅ FIXED: Use ShopSettings
  getDisplayStatus?: (invoice: Invoice) => string | undefined;
  toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

export function useInvoicePDF({
  invoice,
  customer,
  shopDetails,
  getDisplayStatus,
  toast,
}: UseInvoicePDFParams) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDFHTML = useCallback((): string => {
    if (!invoice || !customer || !shopDetails) return '';

    const displayStatus = getDisplayStatus ? getDisplayStatus(invoice) : undefined;

    // ✅ FIXED: For now, we'll need to fetch invoice items separately in a real implementation
    // Since invoice items are now normalized, this would need to be passed as a separate parameter
    // For compatibility, assuming items are passed or fetched separately
    const invoiceItems: InvoiceItem[] = (invoice as any).items || []; // Temporary fix

    const itemsHTML = invoiceItems
      .map(
        (item: InvoiceItem, index: number) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600; text-align: center;">${index + 1}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">${item.description}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151; font-weight: 600;">${item.quantity}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">Rs. ${((item as any).mrp || 0).toFixed(2)}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669; font-weight: 600;">
          ${(item as any).isSpecialDiscount ? '⭐ ' : ''}${(item.discount_percentage || 0).toFixed(1)}%
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-weight: 600;">Rs. ${item.unit_price.toFixed(2)}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #111827; font-size: 15px;">Rs. ${(item.quantity * item.unit_price).toFixed(2)}</td>
      </tr>`
      )
      .join('');

    // Calculate total discount
    const totalDiscount = invoice.subtotal - invoice.total;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.5;
          color: #111827;
          background: #f9fafb;
          padding: 32px 16px;
        }
        
        .invoice-container {
          max-width: 896px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }
        
        /* Header Section */
        .invoice-header {
          padding: 32px 48px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .header-layout {
          display: flex;
          flex-direction: column-reverse;
          gap: 24px;
        }
        
        @media (min-width: 640px) {
          .header-layout {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
        }
        
        .header-left {
          display: grid;
          gap: 24px;
        }
        
        .bill-section {
          display: block;
        }
        
        .section-label {
          font-weight: 700;
          color: #374151;
          margin-bottom: 6px;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .company-name {
          font-weight: 800;
          font-size: 20px;
          color: #111827;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        
        .address-info {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 2px;
          font-weight: 400;
        }
        
        .customer-field {
          color: #111827;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 4px;
          font-weight: 400;
        }
        
        .field-label {
          font-weight: 600;
          color: #374151;
          display: inline-block;
          min-width: 120px;
        }
        
        .field-value {
          color: #111827;
          font-weight: 500;
        }
        
        .header-right {
          text-align: left;
          min-width: 280px;
        }
        
        @media (min-width: 640px) {
          .header-right {
            text-align: right;
          }
        }
        
        .invoice-title {
          font-weight: 900;
          font-size: 48px;
          color: #2563eb;
          margin-bottom: 8px;
          letter-spacing: -0.025em;
          text-shadow: 0 1px 2px rgba(37, 99, 235, 0.1);
        }
        
        .invoice-details {
          margin-bottom: 16px;
        }
        
        .detail-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 6px;
        }
        
        @media (min-width: 640px) {
          .detail-row {
            justify-content: flex-end;
          }
        }
        
        .detail-label {
          font-weight: 600;
          color: #6b7280;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .detail-value {
          font-size: 14px;
          color: #111827;
          font-weight: 500;
        }
        
        .invoice-id {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-weight: 700;
          font-size: 15px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 10px 16px;
          border-radius: 6px;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 14px;
          border: 2px solid;
          margin-top: 16px;
          letter-spacing: 0.5px;
        }
        
        .status-paid {
          color: #065f46;
          border-color: rgba(16, 185, 129, 0.5);
          background-color: rgba(16, 185, 129, 0.1);
        }
        
        .status-pending {
          color: #92400e;
          border-color: rgba(245, 158, 11, 0.5);
          background-color: rgba(245, 158, 11, 0.1);
        }
        
        .status-overdue {
          color: #991b1b;
          border-color: rgba(239, 68, 68, 0.5);
          background-color: rgba(239, 68, 68, 0.1);
        }
        
        /* Table Section */
        .table-container {
          padding: 32px 48px 0 48px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: auto;
        }
        
        .items-table th {
          background-color: #f3f4f6;
          padding: 14px 8px;
          text-align: left;
          font-weight: 700;
          color: #1f2937;
          font-size: 13px;
          border-bottom: 2px solid #d1d5db;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .items-table th:nth-child(1) { width: 8%; text-align: center; }
        .items-table th:nth-child(2) { width: 27%; }
        .items-table th:nth-child(3) { width: 10%; text-align: center; }
        .items-table th:nth-child(4) { width: 15%; text-align: right; }
        .items-table th:nth-child(5) { width: 15%; text-align: right; }
        .items-table th:nth-child(6) { width: 15%; text-align: right; }
        .items-table th:nth-child(7) { width: 15%; text-align: right; }
        
        .items-table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .items-table tbody tr:hover {
          background-color: #f3f4f6;
        }
        
        .items-table td {
          font-size: 14px;
          word-wrap: break-word;
        }
        
        /* Footer Section */
        .invoice-footer {
          padding: 32px 48px;
          background-color: rgba(156, 163, 175, 0.08);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        @media (min-width: 768px) {
          .invoice-footer {
            flex-direction: row;
            align-items: flex-start;
          }
        }
        
        .notes-section {
          flex: 1;
          font-size: 14px;
        }
        
        .notes-title {
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .notes-text {
          line-height: 1.6;
          color: #4b5563;
          font-weight: 400;
        }
        
        .totals-section {
          width: 100%;
          min-width: 280px;
          border-top: 1px solid #d1d5db;
          padding-top: 16px;
        }
        
        @media (min-width: 768px) {
          .totals-section {
            width: auto;
            border-top: none;
            padding-top: 0;
          }
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 15px;
        }
        
        .total-label {
          color: #6b7280;
          font-weight: 500;
        }
        
        .total-value {
          font-weight: 600;
          color: #1f2937;
        }
        
        .discount-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 15px;
          color: #059669;
          font-weight: 600;
        }
        
        .separator {
          height: 2px;
          background-color: #d1d5db;
          margin: 12px 0;
        }
        
        .final-total {
          display: flex;
          justify-content: space-between;
          font-weight: 800;
          font-size: 20px;
          color: #111827;
          padding-top: 4px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          body { padding: 16px 8px; }
          .invoice-header { padding: 24px; }
          .table-container { padding: 24px; }
          .invoice-footer { padding: 24px; }
          .invoice-title { font-size: 36px; }
          .company-name { font-size: 18px; }
        }
        
        /* Print styles */
        @media print {
          body { 
            background: white; 
            padding: 0; 
          }
          .invoice-container { 
            box-shadow: none; 
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
          <div class="header-layout">
            <div class="header-left">
              <div class="bill-section">
                <p class="section-label">Bill From</p>
                <p class="company-name">${shopDetails.shop_name}</p>
                <p class="address-info">${shopDetails.address}</p>
              </div>
              <div class="bill-section">
                <p class="section-label">Bill To</p>
                <div class="customer-field">
                  <span class="field-label">Customer name:</span>
                  <span class="field-value">${customer.name}</span>
                </div>
                <div class="customer-field">
                  <span class="field-label">Address:</span>
                  <span class="field-value">${customer.address ?? 'N/A'}</span>
                </div>
                <div class="customer-field">
                  <span class="field-label">Phone number:</span>
                  <span class="field-value">${customer.phone ?? 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div class="header-right">
              <h1 class="invoice-title">INVOICE</h1>
              <div class="invoice-details">
                <div class="detail-row">
                  <span class="detail-label">#</span>
                  <span class="detail-value invoice-id">${invoice.invoice_number}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date Issued:</span>
                  <span class="detail-value">${format(new Date(invoice.invoice_date), 'PPP')}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Payment Method:</span>
                  <span class="detail-value">${invoice.status === 'paid' ? invoice.payment_method : 'N/A'}</span>
                </div>
              </div>
              <div class="status-badge status-${displayStatus?.toLowerCase()}">
                ${displayStatus}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Table -->
        <div class="table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Item</th>
                <th>Qty</th>
                <th>MRP</th>
                <th>Discount(%)</th>
                <th>Selling Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>
        
        <!-- Footer -->
        <div class="invoice-footer">
          <div class="notes-section">
            <p class="notes-title">Notes</p>
            <p class="notes-text">
              ${invoice.notes || `Thank you for choosing ${shopDetails.shop_name}. We truly appreciate your trust and look forward to assisting you again.`}
            </p>
          </div>
          <div class="totals-section">
            <div class="total-row">
              <p class="total-label">Subtotal (from MRP)</p>
              <p class="total-value">Rs. ${invoice.subtotal.toFixed(2)}</p>
            </div>
            <div class="discount-row">
              <p>You Saved (Total Discount)</p>
              <p>- Rs. ${totalDiscount.toFixed(2)}</p>
            </div>
            <div class="separator"></div>
            <div class="final-total">
              <p>Total</p>
              <p>Rs. ${invoice.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }, [invoice, customer, shopDetails, getDisplayStatus]);

  const handleShare = useCallback(async () => {
    console.log('[Share] Share button pressed');

    if (!invoice || !customer || !shopDetails) {
      console.error('[Share] Invoice data not loaded');
      toast({ title: 'Error', description: 'Invoice data not loaded', variant: 'destructive' });
      return;
    }

    const permissionGranted = await ensureWritePermission();
    console.log('[Share] Write permission granted:', permissionGranted);
    
    if (!permissionGranted) {
      toast({ title: 'Permission Required', description: 'Unable to generate PDF', variant: 'destructive' });
      return;
    }

    setIsGeneratingPDF(true);
    console.log('[Share] Started generating PDF');

    try {
      const htmlContent = generatePDFHTML();
      console.log('[Share] Generated HTML content length:', htmlContent.length);

      const options = {
        html: htmlContent,
        fileName: `Invoice_${invoice.invoice_number}`,
        directory: Platform.OS === 'ios' ? 'Documents' : '',
        width: 595,
        height: 842,
        bgColor: '#FFFFFF',
      };

      console.log('[Share] Calling RNHTMLtoPDF.convert with options:', options);

      const pdf = await RNHTMLtoPDF.convert(options);
      console.log('[Share] PDF generated at:', pdf?.filePath);

      if (pdf?.filePath) {
        const shareOptions = {
          title: `Invoice ${invoice.invoice_number}`,
          message: `Invoice for ${customer.name} • ₹${invoice.total.toFixed(2)}`,
          url: Platform.OS === 'android' ? `file://${pdf.filePath}` : pdf.filePath,
          type: 'application/pdf',
          filename: `Invoice_${invoice.invoice_number}.pdf`,
        };

        console.log('[Share] Sharing with options:', shareOptions);
        
        await Share.open(shareOptions);
        console.log('[Share] PDF shared successfully');
        toast({ title: 'Success', description: 'Invoice shared successfully!' });
      } else {
        throw new Error('PDF generation failed: no file path returned');
      }
    } catch (err: any) {
      console.error('[Share] Error sharing invoice:', err);

      if (err?.message?.includes('User did not share') || err?.message?.includes('cancelled')) {
        console.log('[Share] User cancelled sharing');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to generate or share PDF. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsGeneratingPDF(false);
      console.log('[Share] PDF generation process finished');
    }
  }, [invoice, customer, shopDetails, generatePDFHTML, toast]);

  return { isGeneratingPDF, handleShare };
}


// import { useCallback, useState } from 'react';
// import { Platform } from 'react-native';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
// import Share from 'react-native-share';
// import { format } from 'date-fns';
// import { ensureWritePermission } from '../utils/permissions';
// import { Invoice, ShopDetails, InvoiceItem, InvoiceCustomer } from '../../../types';

// interface UseInvoicePDFParams {
//   invoice: Invoice | null;
//   customer: InvoiceCustomer | null;
//   shopDetails: ShopDetails | null;
//   getDisplayStatus?: (invoice: Invoice) => string | undefined;
//   toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
// }

// export function useInvoicePDF({
//   invoice,
//   customer,
//   shopDetails,
//   getDisplayStatus,
//   toast,
// }: UseInvoicePDFParams) {
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

// // Only showing the modified Bill To section - rest of the code remains the same

// const generatePDFHTML = useCallback((): string => {
//   if (!invoice || !customer || !shopDetails) return '';

//   const displayStatus = getDisplayStatus ? getDisplayStatus(invoice) : undefined;

//   const itemsHTML = invoice.items
//     .map(
//       (item: InvoiceItem, index: number) => `
//     <tr>
//       <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600; text-align: center;">${index + 1}</td>
//       <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">${item.description}</td>
//       <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151; font-weight: 600;">${item.quantity}</td>
//       <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">Rs. ${item.mrp?.toFixed(2) ?? 'N/A'}</td>
//       <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669; font-weight: 600;">
//         ${item.isSpecialDiscount ? '⭐ ' : ''}${(item.discount ?? 0).toFixed(1)}%
//       </td>
//       <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-weight: 600;">Rs. ${item.price.toFixed(2)}</td>
//       <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #111827; font-size: 15px;">Rs. ${(item.quantity * item.price).toFixed(2)}</td>
//     </tr>`
//     )
//     .join('');

//   // Calculate total discount
//   const totalDiscount = invoice.subtotal - invoice.total;

//   return `
//   <!DOCTYPE html>
//   <html>
//   <head>
//     <meta charset="utf-8" />
//     <title>Invoice ${invoice.id}</title>
//     <style>
//       * { margin: 0; padding: 0; box-sizing: border-box; }
//       body {
//         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
//         line-height: 1.5;
//         color: #111827;
//         background: #f9fafb;
//         padding: 32px 16px;
//       }
      
//       .invoice-container {
//         max-width: 896px;
//         margin: 0 auto;
//         background: white;
//         border-radius: 8px;
//         box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
//         overflow: hidden;
//       }
      
//       /* Header Section */
//       .invoice-header {
//         padding: 32px 48px;
//         border-bottom: 1px solid #e5e7eb;
//       }
      
//       .header-layout {
//         display: flex;
//         flex-direction: column-reverse;
//         gap: 24px;
//       }
      
//       @media (min-width: 640px) {
//         .header-layout {
//           flex-direction: row;
//           justify-content: space-between;
//           align-items: flex-start;
//         }
//       }
      
//       .header-left {
//         display: grid;
//         gap: 24px;
//       }
      
//       .bill-section {
//         display: block;
//       }
      
//       .section-label {
//         font-weight: 700;
//         color: #374151;
//         margin-bottom: 6px;
//         font-size: 14px;
//         text-transform: uppercase;
//         letter-spacing: 0.5px;
//       }
      
//       .company-name {
//         font-weight: 800;
//         font-size: 20px;
//         color: #111827;
//         margin-bottom: 4px;
//         line-height: 1.2;
//       }
      
//       .address-info {
//         color: #6b7280;
//         font-size: 14px;
//         line-height: 1.5;
//         margin-bottom: 2px;
//         font-weight: 400;
//       }
      
//       .customer-field {
//         color: #111827;
//         font-size: 14px;
//         line-height: 1.5;
//         margin-bottom: 4px;
//         font-weight: 400;
//       }
      
//       .field-label {
//         font-weight: 600;
//         color: #374151;
//         display: inline-block;
//         min-width: 120px;
//       }
      
//       .field-value {
//         color: #111827;
//         font-weight: 500;
//       }
      
//       .header-right {
//         text-align: left;
//         min-width: 280px;
//       }
      
//       @media (min-width: 640px) {
//         .header-right {
//           text-align: right;
//         }
//       }
      
//       .invoice-title {
//         font-weight: 900;
//         font-size: 48px;
//         color: #2563eb;
//         margin-bottom: 8px;
//         letter-spacing: -0.025em;
//         text-shadow: 0 1px 2px rgba(37, 99, 235, 0.1);
//       }
      
//       .invoice-details {
//         margin-bottom: 16px;
//       }
      
//       .detail-row {
//         display: flex;
//         align-items: baseline;
//         gap: 8px;
//         margin-bottom: 6px;
//       }
      
//       @media (min-width: 640px) {
//         .detail-row {
//           justify-content: flex-end;
//         }
//       }
      
//       .detail-label {
//         font-weight: 600;
//         color: #6b7280;
//         font-size: 13px;
//         text-transform: uppercase;
//         letter-spacing: 0.3px;
//       }
      
//       .detail-value {
//         font-size: 14px;
//         color: #111827;
//         font-weight: 500;
//       }
      
//       .invoice-id {
//         font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
//         font-weight: 700;
//         font-size: 15px;
//       }
      
//       .status-badge {
//         display: inline-block;
//         padding: 10px 16px;
//         border-radius: 6px;
//         font-weight: 800;
//         text-transform: uppercase;
//         font-size: 14px;
//         border: 2px solid;
//         margin-top: 16px;
//         letter-spacing: 0.5px;
//       }
      
//       .status-paid {
//         color: #065f46;
//         border-color: rgba(16, 185, 129, 0.5);
//         background-color: rgba(16, 185, 129, 0.1);
//       }
      
//       .status-pending {
//         color: #92400e;
//         border-color: rgba(245, 158, 11, 0.5);
//         background-color: rgba(245, 158, 11, 0.1);
//       }
      
//       .status-overdue {
//         color: #991b1b;
//         border-color: rgba(239, 68, 68, 0.5);
//         background-color: rgba(239, 68, 68, 0.1);
//       }
      
//       /* Table Section */
//       .table-container {
//         padding: 32px 48px 0 48px;
//       }
      
//       .items-table {
//         width: 100%;
//         border-collapse: collapse;
//         table-layout: auto;
//       }
      
//       .items-table th {
//         background-color: #f3f4f6;
//         padding: 14px 8px;
//         text-align: left;
//         font-weight: 700;
//         color: #1f2937;
//         font-size: 13px;
//         border-bottom: 2px solid #d1d5db;
//         text-transform: uppercase;
//         letter-spacing: 0.5px;
//       }
      
//       .items-table th:nth-child(1) { width: 8%; text-align: center; }
//       .items-table th:nth-child(2) { width: 27%; }
//       .items-table th:nth-child(3) { width: 10%; text-align: center; }
//       .items-table th:nth-child(4) { width: 15%; text-align: right; }
//       .items-table th:nth-child(5) { width: 15%; text-align: right; }
//       .items-table th:nth-child(6) { width: 15%; text-align: right; }
//       .items-table th:nth-child(7) { width: 15%; text-align: right; }
      
//       .items-table tbody tr:nth-child(even) {
//         background-color: #f9fafb;
//       }
      
//       .items-table tbody tr:hover {
//         background-color: #f3f4f6;
//       }
      
//       .items-table td {
//         font-size: 14px;
//         word-wrap: break-word;
//       }
      
//       /* Footer Section */
//       .invoice-footer {
//         padding: 32px 48px;
//         background-color: rgba(156, 163, 175, 0.08);
//         display: flex;
//         flex-direction: column;
//         gap: 24px;
//       }
      
//       @media (min-width: 768px) {
//         .invoice-footer {
//           flex-direction: row;
//           align-items: flex-start;
//         }
//       }
      
//       .notes-section {
//         flex: 1;
//         font-size: 14px;
//       }
      
//       .notes-title {
//         font-weight: 700;
//         color: #111827;
//         margin-bottom: 8px;
//         font-size: 16px;
//         text-transform: uppercase;
//         letter-spacing: 0.3px;
//       }
      
//       .notes-text {
//         line-height: 1.6;
//         color: #4b5563;
//         font-weight: 400;
//       }
      
//       .totals-section {
//         width: 100%;
//         min-width: 280px;
//         border-top: 1px solid #d1d5db;
//         padding-top: 16px;
//       }
      
//       @media (min-width: 768px) {
//         .totals-section {
//           width: auto;
//           border-top: none;
//           padding-top: 0;
//         }
//       }
      
//       .total-row {
//         display: flex;
//         justify-content: space-between;
//         margin-bottom: 10px;
//         font-size: 15px;
//       }
      
//       .total-label {
//         color: #6b7280;
//         font-weight: 500;
//       }
      
//       .total-value {
//         font-weight: 600;
//         color: #1f2937;
//       }
      
//       .discount-row {
//         display: flex;
//         justify-content: space-between;
//         margin-bottom: 10px;
//         font-size: 15px;
//         color: #059669;
//         font-weight: 600;
//       }
      
//       .separator {
//         height: 2px;
//         background-color: #d1d5db;
//         margin: 12px 0;
//       }
      
//       .final-total {
//         display: flex;
//         justify-content: space-between;
//         font-weight: 800;
//         font-size: 20px;
//         color: #111827;
//         padding-top: 4px;
//       }
      
//       /* Responsive adjustments */
//       @media (max-width: 768px) {
//         body { padding: 16px 8px; }
//         .invoice-header { padding: 24px; }
//         .table-container { padding: 24px; }
//         .invoice-footer { padding: 24px; }
//         .invoice-title { font-size: 36px; }
//         .company-name { font-size: 18px; }
//       }
      
//       /* Print styles */
//       @media print {
//         body { 
//           background: white; 
//           padding: 0; 
//         }
//         .invoice-container { 
//           box-shadow: none; 
//           border-radius: 0;
//         }
//       }
//     </style>
//   </head>
//   <body>
//     <div class="invoice-container">
//       <!-- Header -->
//       <div class="invoice-header">
//         <div class="header-layout">
//           <div class="header-left">
//             <div class="bill-section">
//               <p class="section-label">Bill From</p>
//               <p class="company-name">${shopDetails.name}</p>
//               <p class="address-info">${shopDetails.address}</p>
//             </div>
//             <div class="bill-section">
//               <p class="section-label">Bill To</p>
//               <div class="customer-field">
//                 <span class="field-label">Customer name:</span>
//                 <span class="field-value">${customer.name}</span>
//               </div>
//               <div class="customer-field">
//                 <span class="field-label">Address:</span>
//                 <span class="field-value">${customer.address ?? 'N/A'}</span>
//               </div>
//               <div class="customer-field">
//                 <span class="field-label">Phone number:</span>
//                 <span class="field-value">${customer.phone ?? 'N/A'}</span>
//               </div>
//             </div>
//           </div>
          
//           <div class="header-right">
//             <h1 class="invoice-title">INVOICE</h1>
//             <div class="invoice-details">
//               <div class="detail-row">
//                 <span class="detail-label">#</span>
//                 <span class="detail-value invoice-id">${invoice.id}</span>
//               </div>
//               <div class="detail-row">
//                 <span class="detail-label">Date Issued:</span>
//                 <span class="detail-value">${format(new Date(invoice.date), 'PPP')}</span>
//               </div>
//               <div class="detail-row">
//                 <span class="detail-label">Payment Method:</span>
//                 <span class="detail-value">${invoice.status === 'Paid' ? invoice.paymentMethod : 'N/A'}</span>
//               </div>
//             </div>
//             <div class="status-badge status-${displayStatus?.toLowerCase()}">
//               ${displayStatus}
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <!-- Table -->
//       <div class="table-container">
//         <table class="items-table">
//           <thead>
//             <tr>
//               <th>Sr. No.</th>
//               <th>Item</th>
//               <th>Qty</th>
//               <th>MRP</th>
//               <th>Discount(%)</th>
//               <th>Selling Price</th>
//               <th>Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${itemsHTML}
//           </tbody>
//         </table>
//       </div>
      
//       <!-- Footer -->
//       <div class="invoice-footer">
//         <div class="notes-section">
//           <p class="notes-title">Notes</p>
//           <p class="notes-text">
//             ${invoice.notes || `Thank you for choosing ${shopDetails.name}. We truly appreciate your trust and look forward to assisting you again.`}
//           </p>
//         </div>
//         <div class="totals-section">
//           <div class="total-row">
//             <p class="total-label">Subtotal (from MRP)</p>
//             <p class="total-value">Rs. ${invoice.subtotal.toFixed(2)}</p>
//           </div>
//           <div class="discount-row">
//             <p>You Saved (Total Discount)</p>
//             <p>- Rs. ${totalDiscount.toFixed(2)}</p>
//           </div>
//           <div class="separator"></div>
//           <div class="final-total">
//             <p>Total</p>
//             <p>Rs. ${invoice.total.toFixed(2)}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   </body>
//   </html>
//   `;
// }, [invoice, customer, shopDetails, getDisplayStatus]);

// // Rest of the handleShare function remains the same...


//   const handleShare = useCallback(async () => {
//     console.log('[Share] Share button pressed');

//     if (!invoice || !customer || !shopDetails) {
//       console.error('[Share] Invoice data not loaded');
//       toast({ title: 'Error', description: 'Invoice data not loaded', variant: 'destructive' });
//       return;
//     }

//     const permissionGranted = await ensureWritePermission();
//     console.log('[Share] Write permission granted:', permissionGranted);
    
//     if (!permissionGranted) {
//       toast({ title: 'Permission Required', description: 'Unable to generate PDF', variant: 'destructive' });
//       return;
//     }

//     setIsGeneratingPDF(true);
//     console.log('[Share] Started generating PDF');

//     try {
//       const htmlContent = generatePDFHTML();
//       console.log('[Share] Generated HTML content length:', htmlContent.length);

//       const options = {
//         html: htmlContent,
//         fileName: `Invoice_${invoice.id}`,
//         directory: Platform.OS === 'ios' ? 'Documents' : '',
//         width: 595,
//         height: 842,
//         bgColor: '#FFFFFF',
//       };

//       console.log('[Share] Calling RNHTMLtoPDF.convert with options:', options);

//       const pdf = await RNHTMLtoPDF.convert(options);
//       console.log('[Share] PDF generated at:', pdf?.filePath);

//       if (pdf?.filePath) {
//         const shareOptions = {
//           title: `Invoice ${invoice.id}`,
//           message: `Invoice for ${customer.name} • ₹${invoice.total.toFixed(2)}`,
//           url: Platform.OS === 'android' ? `file://${pdf.filePath}` : pdf.filePath,
//           type: 'application/pdf',
//           filename: `Invoice_${invoice.id}.pdf`,
//         };

//         console.log('[Share] Sharing with options:', shareOptions);
        
//         await Share.open(shareOptions);
//         console.log('[Share] PDF shared successfully');
//         toast({ title: 'Success', description: 'Invoice shared successfully!' });
//       } else {
//         throw new Error('PDF generation failed: no file path returned');
//       }
//     } catch (err: any) {
//       console.error('[Share] Error sharing invoice:', err);

//       if (err?.message?.includes('User did not share') || err?.message?.includes('cancelled')) {
//         console.log('[Share] User cancelled sharing');
//       } else {
//         toast({
//           title: 'Error',
//           description: 'Failed to generate or share PDF. Please try again.',
//           variant: 'destructive',
//         });
//       }
//     } finally {
//       setIsGeneratingPDF(false);
//       console.log('[Share] PDF generation process finished');
//     }
//   }, [invoice, customer, shopDetails, generatePDFHTML, toast]);

//   return { isGeneratingPDF, handleShare };
// }
