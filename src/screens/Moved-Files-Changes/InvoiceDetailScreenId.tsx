// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   ScrollView,
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   ActivityIndicator,
//   Platform,
//   RefreshControl,
//   Alert,
//   Dimensions,
//   PermissionsAndroid,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import {
//   ArrowLeft,
//   Share2,
//   User,
//   CalendarDays,
//   Star,
//   Receipt,
//   FileText,
//   Phone,
//   MapPin,
//   Download,
// } from 'lucide-react-native';
// import { format, differenceInDays } from 'date-fns';

// import { useToast } from '../hooks/use-toast';
// import { getInvoiceById } from '../services/invoice-service';
// import { getCustomerById } from '../services/customer-service';
// import { getShopDetails } from '../services/shop-service';
// import { useColors, useTheme } from '../context/ThemeContext';
// import type { Invoice, Customer, ShopDetails } from '../types';

// // Simple module declaration without exports
// declare module 'react-native-html-to-pdf' {
//   interface Options {
//     html: string;
//     fileName: string;
//     directory: string;
//     width?: number;
//     height?: number;
//     padding?: number;
//     bgColor?: string;
//   }

//   interface Result {
//     filePath?: string;
//   }

//   function convert(options: Options): Promise<Result>;
// }

// // Type interfaces for better type safety
// interface PDFOptions {
//   html: string;
//   fileName: string;
//   directory: string;
//   width?: number;
//   height?: number;
//   padding?: number;
//   bgColor?: string;
// }

// interface PDFResult {
//   filePath?: string;
// }

// interface ShareOptions {
//   title?: string;
//   message?: string;
//   url?: string;
//   type?: string;
//   filename?: string;
// }

// // Import with proper typing
// const RNHTMLtoPDF = require('react-native-html-to-pdf') as {
//   convert: (options: PDFOptions) => Promise<PDFResult>;
// };

// const Share = require('react-native-share') as {
//   open: (options: ShareOptions) => Promise<void>;
// };

// // Permission helper for Android
// const ensureWritePermission = async (): Promise<boolean> => {
//   if (Platform.OS !== 'android') return true;
  
//   try {
//     const granted = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//       {
//         title: 'Storage Permission',
//         message: 'App needs access to storage to save PDF files',
//         buttonNeutral: 'Ask Me Later',
//         buttonNegative: 'Cancel',
//         buttonPositive: 'OK',
//       }
//     );
//     return granted === PermissionsAndroid.RESULTS.GRANTED;
//   } catch (err) {
//     console.warn('Permission request failed:', err);
//     return false;
//   }
// };

// const { width: screenWidth } = Dimensions.get('window');
// const OVERDUE_DAYS = 15;

// function getDisplayStatus(invoice: Invoice): Invoice['status'] | 'Overdue' {
//   if (invoice.status === 'Pending') {
//     const daysDiff = differenceInDays(new Date(), new Date(invoice.date));
//     if (daysDiff > OVERDUE_DAYS) {
//       return 'Overdue';
//     }
//   }
//   return invoice.status;
// }

// export default function InvoiceDetailScreen({ route, navigation }: any) {
//   const invoiceId = route?.params?.id as string;
//   const { toast } = useToast();

//   // Theme hooks
//   const colors = useColors();
//   const { isDark } = useTheme();

//   const [invoice, setInvoice] = useState<Invoice | null>(null);
//   const [customer, setCustomer] = useState<Customer | null>(null);
//   const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

//   const displayStatus = invoice ? getDisplayStatus(invoice) : undefined;

//   const loadInvoiceData = useCallback(async (showLoading = true): Promise<void> => {
//     if (!invoiceId) return;
//     if (showLoading) setIsLoading(true);
    
//     try {
//       const [fetchedInvoice, fetchedShopDetails] = await Promise.all([
//         getInvoiceById(invoiceId),
//         getShopDetails(),
//       ]);

//       if (fetchedInvoice) {
//         setInvoice(fetchedInvoice);
//         setShopDetails(fetchedShopDetails);
//         if (fetchedInvoice.customerId) {
//           const fetchedCustomer = await getCustomerById(fetchedInvoice.customerId);
//           setCustomer(fetchedCustomer);
//         }
//       } else {
//         toast({ title: 'Error', description: 'Invoice not found.', variant: 'destructive' });
//         navigation.navigate('Invoices');
//       }
//     } catch (error) {
//       toast({ title: 'Error', description: 'Failed to fetch invoice details.', variant: 'destructive' });
//     } finally {
//       if (showLoading) setIsLoading(false);
//     }
//   }, [invoiceId, navigation, toast]);

//   useEffect(() => {
//     loadInvoiceData(true);
//   }, [loadInvoiceData]);

//   // Refresh function
//   const onRefresh = useCallback(async (): Promise<void> => {
//     setIsRefreshing(true);
//     try {
//       await loadInvoiceData(false);
//       toast({ title: 'Refreshed', description: 'Invoice data updated successfully.' });
//     } catch (error) {
//       console.error('Error refreshing invoice:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   }, [loadInvoiceData, toast]);

//   // Generate PDF HTML Template
//   const generatePDFHTML = useCallback((): string => {
//     if (!invoice || !customer || !shopDetails) return '';

//     const itemsHTML = invoice.items.map(item => `
//       <tr>
//         <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
//           ${item.description}
//         </td>
//         <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 14px;">
//           ${item.quantity}
//         </td>
//         <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px;">
//           ₹${item.mrp?.toFixed(2) || 'N/A'}
//         </td>
//         <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px;">
//           ${item.discount?.toFixed(1) || '0'}%
//           ${item.isSpecialDiscount ? ' ⭐' : ''}
//         </td>
//         <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px;">
//           ₹${item.price.toFixed(2)}
//         </td>
//         <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; font-size: 14px;">
//           ₹${(item.quantity * item.price).toFixed(2)}
//         </td>
//       </tr>
//     `).join('');

//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="utf-8">
//         <title>Invoice ${invoice.id}</title>
//         <style>
//             * { margin: 0; padding: 0; box-sizing: border-box; }
//             body { 
//                 font-family: 'Helvetica Neue', Arial, sans-serif; 
//                 line-height: 1.6; 
//                 color: #333; 
//                 background: #fff;
//                 padding: 40px;
//             }
//             .invoice-container { 
//                 max-width: 800px; 
//                 margin: 0 auto; 
//                 background: white; 
//                 border-radius: 8px;
//                 box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//                 overflow: hidden;
//             }
//             .invoice-header { 
//                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                 color: white; 
//                 padding: 40px; 
//                 text-align: center; 
//             }
//             .invoice-title { 
//                 font-size: 36px; 
//                 font-weight: bold; 
//                 margin-bottom: 8px; 
//                 letter-spacing: 2px;
//             }
//             .invoice-id { 
//                 font-size: 18px; 
//                 opacity: 0.9; 
//                 font-family: 'Courier New', monospace;
//             }
//             .invoice-body { padding: 40px; }
//             .bill-section { 
//                 display: flex; 
//                 justify-content: space-between; 
//                 margin-bottom: 40px; 
//                 gap: 40px;
//             }
//             .bill-from, .bill-to { flex: 1; }
//             .section-title { 
//                 font-size: 14px; 
//                 font-weight: bold; 
//                 color: #6b7280; 
//                 text-transform: uppercase; 
//                 letter-spacing: 1px; 
//                 margin-bottom: 12px; 
//             }
//             .company-name { 
//                 font-size: 20px; 
//                 font-weight: bold; 
//                 color: #1f2937; 
//                 margin-bottom: 8px; 
//             }
//             .customer-name { 
//                 font-size: 18px; 
//                 font-weight: 600; 
//                 color: #1f2937; 
//                 margin-bottom: 8px; 
//             }
//             .address-line { 
//                 font-size: 14px; 
//                 color: #6b7280; 
//                 margin-bottom: 4px; 
//             }
//             .invoice-details { 
//                 background: #f9fafb; 
//                 padding: 24px; 
//                 border-radius: 8px; 
//                 margin-bottom: 32px; 
//             }
//             .detail-row { 
//                 display: flex; 
//                 justify-content: space-between; 
//                 margin-bottom: 8px; 
//             }
//             .detail-label { 
//                 font-weight: 600; 
//                 color: #374151; 
//             }
//             .detail-value { 
//                 color: #6b7280; 
//             }
//             .status-badge { 
//                 display: inline-block; 
//                 padding: 6px 16px; 
//                 border-radius: 20px; 
//                 font-size: 12px; 
//                 font-weight: bold; 
//                 text-transform: uppercase; 
//                 letter-spacing: 1px;
//                 margin-top: 8px;
//             }
//             .status-paid { background: #d1fae5; color: #065f46; }
//             .status-pending { background: #fef3c7; color: #92400e; }
//             .status-overdue { background: #fee2e2; color: #991b1b; }
//             .items-table { 
//                 width: 100%; 
//                 border-collapse: collapse; 
//                 margin-bottom: 32px;
//                 box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//                 border-radius: 8px;
//                 overflow: hidden;
//             }
//             .table-header { 
//                 background: #374151; 
//                 color: white; 
//             }
//             .table-header th { 
//                 padding: 16px 12px; 
//                 text-align: left; 
//                 font-weight: 600; 
//                 font-size: 14px;
//                 text-transform: uppercase;
//                 letter-spacing: 0.5px;
//             }
//             .table-header th:nth-child(2),
//             .table-header th:nth-child(3),
//             .table-header th:nth-child(4),
//             .table-header th:nth-child(5),
//             .table-header th:nth-child(6) { text-align: right; }
//             .items-table tbody tr:nth-child(even) { background: #f9fafb; }
//             .total-section { 
//                 background: #f3f4f6; 
//                 padding: 24px; 
//                 border-radius: 8px; 
//                 border-left: 4px solid #667eea;
//             }
//             .total-row { 
//                 display: flex; 
//                 justify-content: space-between; 
//                 margin-bottom: 12px; 
//             }
//             .total-row:last-child { 
//                 margin-bottom: 0; 
//                 padding-top: 12px; 
//                 border-top: 2px solid #d1d5db; 
//                 font-size: 20px; 
//                 font-weight: bold; 
//             }
//             .notes-section { 
//                 margin-top: 32px; 
//                 padding: 20px; 
//                 background: #f8fafc; 
//                 border-radius: 8px; 
//                 border-left: 4px solid #10b981;
//             }
//             .notes-title { 
//                 font-weight: bold; 
//                 margin-bottom: 8px; 
//                 color: #1f2937;
//             }
//             .footer { 
//                 text-align: center; 
//                 margin-top: 40px; 
//                 padding-top: 20px; 
//                 border-top: 1px solid #e5e7eb; 
//                 color: #6b7280; 
//                 font-size: 14px;
//             }
//         </style>
//     </head>
//     <body>
//         <div class="invoice-container">
//             <div class="invoice-header">
//                 <div class="invoice-title">INVOICE</div>
//                 <div class="invoice-id">#${invoice.id}</div>
//             </div>
            
//             <div class="invoice-body">
//                 <div class="bill-section">
//                     <div class="bill-from">
//                         <div class="section-title">Bill From</div>
//                         <div class="company-name">${shopDetails.name}</div>
//                         <div class="address-line">${shopDetails.address}</div>
//                         <div class="address-line">📧 ${shopDetails.email}</div>
//                         <div class="address-line">📞 ${shopDetails.phone}</div>
//                     </div>
                    
//                     <div class="bill-to">
//                         <div class="section-title">Bill To</div>
//                         <div class="customer-name">${customer.name}</div>
//                         <div class="address-line">${customer.address || 'N/A'}</div>
//                         <div class="address-line">📞 ${customer.phone || 'N/A'}</div>
//                     </div>
//                 </div>
                
//                 <div class="invoice-details">
//                     <div class="detail-row">
//                         <span class="detail-label">Date Issued:</span>
//                         <span class="detail-value">${format(new Date(invoice.date), 'PPPP')}</span>
//                     </div>
//                     <div class="detail-row">
//                         <span class="detail-label">Payment Method:</span>
//                         <span class="detail-value">${invoice.status === 'Paid' ? invoice.paymentMethod : 'Pending'}</span>
//                     </div>
//                     <div class="detail-row">
//                         <span class="detail-label">Generated by:</span>
//                         <span class="detail-value">${invoice.generatedBy}</span>
//                     </div>
//                     ${invoice.collectedBy ? `
//                     <div class="detail-row">
//                         <span class="detail-label">Collected by:</span>
//                         <span class="detail-value">${invoice.collectedBy}</span>
//                     </div>
//                     ` : ''}
//                     <div style="margin-top: 12px;">
//                         <span class="status-badge status-${displayStatus?.toLowerCase()}">${displayStatus}</span>
//                     </div>
//                 </div>
                
//                 <table class="items-table">
//                     <thead class="table-header">
//                         <tr>
//                             <th>Item Description</th>
//                             <th>Qty</th>
//                             <th>MRP</th>
//                             <th>Discount</th>
//                             <th>Price</th>
//                             <th>Total</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${itemsHTML}
//                     </tbody>
//                 </table>
                
//                 <div class="total-section">
//                     <div class="total-row">
//                         <span>Subtotal (from MRP):</span>
//                         <span>₹${invoice.subtotal.toFixed(2)}</span>
//                     </div>
//                     <div class="total-row">
//                         <span>Total Amount:</span>
//                         <span>₹${invoice.total.toFixed(2)}</span>
//                     </div>
//                 </div>
                
//                 <div class="notes-section">
//                     <div class="notes-title">Notes</div>
//                     <div>${invoice.notes || `Thank you for choosing ${shopDetails.name}. We truly appreciate your trust and look forward to assisting you again.`}</div>
//                 </div>
                
//                 <div class="footer">
//                     Generated on ${format(new Date(), 'PPPp')}
//                 </div>
//             </div>
//         </div>
//     </body>
//     </html>
//     `;
//   }, [invoice, customer, shopDetails, displayStatus]);

//   // Share Invoice as PDF
//   const handleShare = useCallback(async (): Promise<void> => {
//     if (!invoice || !customer || !shopDetails) {
//       toast({ title: 'Error', description: 'Invoice data not loaded', variant: 'destructive' });
//       return;
//     }

//     if (!(await ensureWritePermission())) {
//       toast({ title: 'Permission Required', description: 'Storage permission is required to save PDF', variant: 'destructive' });
//       return;
//     }

//     setIsGeneratingPDF(true);
    
//     try {
//       const htmlContent = generatePDFHTML();
      
//       const options: PDFOptions = {
//         html: htmlContent,
//         fileName: `Invoice_${invoice.id}`,
//         directory: Platform.select({ ios: 'Documents', android: 'Download' })!,
//         width: 595,
//         height: 842,
//         bgColor: '#FFFFFF',
//       };

//       const pdf: PDFResult = await RNHTMLtoPDF.convert(options);
      
//       if (pdf.filePath) {
//         const shareOptions: ShareOptions = {
//           title: `Invoice ${invoice.id}`,
//           message: `Invoice for ${customer.name} • ₹${invoice.total.toFixed(2)}`,
//           url: `file://${pdf.filePath}`,
//           type: 'application/pdf',
//           filename: `Invoice_${invoice.id}.pdf`,
//         };

//         await Share.open(shareOptions);
//         toast({ title: 'Success', description: 'Invoice shared successfully!' });
//       } else {
//         throw new Error('PDF generation failed - no file path returned');
//       }
//     } catch (err: any) {
//       console.error('Error sharing invoice:', err);
      
//       if (err?.message?.includes('ActivityNotFoundException')) {
//         toast({ 
//           title: 'Share unavailable', 
//           description: 'PDF saved to Downloads folder. Please open manually.', 
//           variant: 'default' 
//         });
//       } else if (err?.message?.includes('Permission')) {
//         toast({ 
//           title: 'Permission Denied', 
//           description: 'Please grant storage permission to save PDF', 
//           variant: 'destructive' 
//         });
//       } else {
//         toast({ 
//           title: 'Error', 
//           description: 'Failed to generate or share PDF. Please try again.', 
//           variant: 'destructive' 
//         });
//       }
//     } finally {
//       setIsGeneratingPDF(false);
//     }
//   }, [invoice, customer, shopDetails, generatePDFHTML, toast]);

//   // Alternative share function using native sharing (fallback)
//   const handleAlternativeShare = useCallback(async (): Promise<void> => {
//     if (!invoice || !customer) {
//       return;
//     }

//     try {
//       const message = `Invoice #${invoice.id}\nCustomer: ${customer.name}\nAmount: ₹${invoice.total.toFixed(2)}\nDate: ${format(new Date(invoice.date), 'PPP')}`;
      
//       Alert.alert(
//         'Share Invoice',
//         'PDF sharing is not available. Would you like to share invoice details as text?',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { 
//             text: 'Share Text', 
//             onPress: async () => {
//               try {
//                 await Share.open({
//                   title: `Invoice ${invoice.id}`,
//                   message: message,
//                 });
//               } catch (error) {
//                 console.log('Text sharing cancelled or failed:', error);
//               }
//             }
//           }
//         ]
//       );
//     } catch (error) {
//       console.error('Error in alternative share:', error);
//     }
//   }, [invoice, customer]);

//   // Loading state
//   if (isLoading) {
//     return (
//       <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
//         <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
//           <Skeleton style={{ height: 36, width: 144 }} colors={colors} />
//           <Skeleton style={{ height: 36, width: 96 }} colors={colors} />
//         </View>
//         <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
//           <View style={[styles.card, { backgroundColor: colors.card }]}>
//             <Skeleton style={{ height: 32, width: '50%', marginBottom: 16 }} colors={colors} />
//             <Skeleton style={{ height: 160, width: '100%' }} colors={colors} />
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     );
//   }

//   // Not found state
//   if (!invoice || !displayStatus || !customer || !shopDetails) {
//     return (
//       <SafeAreaView style={[styles.notFoundContainer, { backgroundColor: colors.background }]} edges={['top']}>
//         <Receipt size={56} color={colors.mutedForeground} />
//         <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>Invoice Not Found</Text>
//         <Text style={[styles.notFoundSubtitle, { color: colors.mutedForeground }]}>
//           The requested invoice or customer could not be found.
//         </Text>
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Invoices')}
//           style={[styles.backPrimaryBtn, { backgroundColor: colors.primary }]}
//           activeOpacity={0.8}
//         >
//           <ArrowLeft size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//           <Text style={[styles.backPrimaryBtnText, { color: colors.primaryForeground }]}>
//             Back to Invoices
//           </Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
//       {/* Header */}
//       <View style={[styles.header, { 
//         backgroundColor: colors.card,
//         borderBottomColor: colors.border 
//       }]}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={[styles.backBtn, {
//             backgroundColor: colors.background,
//             borderColor: colors.border
//           }]}
//           activeOpacity={0.7}
//         >
//           <ArrowLeft size={20} color={colors.primary} />
//         </TouchableOpacity>
        
//         <View style={styles.headerActions}>
//           <TouchableOpacity
//             onPress={handleShare}
//             style={[styles.shareBtn, { backgroundColor: colors.primary }]}
//             activeOpacity={0.8}
//             disabled={isGeneratingPDF}
//           >
//             {isGeneratingPDF ? (
//               <ActivityIndicator size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//             ) : (
//               <Share2 size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//             )}
//             <Text style={[styles.shareBtnText, { color: colors.primaryForeground }]}>
//               {isGeneratingPDF ? 'Generating...' : 'Share'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView 
//         style={{ flex: 1 }}
//         contentContainerStyle={{ paddingBottom: 24 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Invoice Header Card */}
//         <View style={[styles.headerCard, { backgroundColor: colors.card, shadowColor: colors.foreground }]}>
//           <View style={styles.invoiceHeader}>
//             <View style={styles.invoiceHeaderLeft}>
//               <Text style={[styles.invoiceTitle, { color: colors.primary }]}>INVOICE</Text>
//               <Text style={[styles.invoiceId, { color: colors.foreground }]}>#{invoice.id}</Text>
//               <StatusBadge status={displayStatus} colors={colors} />
//             </View>
//             <View style={styles.invoiceHeaderRight}>
//               <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total Amount</Text>
//               <Text style={[styles.totalAmount, { color: colors.foreground }]}>
//                 ₹{invoice.total.toLocaleString('en-IN')}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Company & Customer Info */}
//         <View style={[styles.infoCard, { backgroundColor: colors.card, shadowColor: colors.foreground }]}>
//           <View style={styles.infoSection}>
//             <Text style={[styles.sectionTitle, { color: colors.primary }]}>Bill From</Text>
//             <View style={styles.companyInfo}>
//               <Text style={[styles.companyName, { color: colors.foreground }]}>
//                 {shopDetails.name}
//               </Text>
//               <View style={styles.infoRow}>
//                 <MapPin size={14} color={colors.mutedForeground} />
//                 <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
//                   {shopDetails.address}
//                 </Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Phone size={14} color={colors.mutedForeground} />
//                 <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
//                   {shopDetails.phone}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           <View style={[styles.divider, { backgroundColor: colors.border }]} />

//           <View style={styles.infoSection}>
//             <Text style={[styles.sectionTitle, { color: colors.primary }]}>Bill To</Text>
//             <View style={styles.customerInfo}>
//               <Text style={[styles.customerName, { color: colors.foreground }]}>
//                 {customer.name}
//               </Text>
//               {customer.address && (
//                 <View style={styles.infoRow}>
//                   <MapPin size={14} color={colors.mutedForeground} />
//                   <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
//                     {customer.address}
//                   </Text>
//                 </View>
//               )}
//               {customer.phone && (
//                 <View style={styles.infoRow}>
//                   <Phone size={14} color={colors.mutedForeground} />
//                   <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
//                     {customer.phone}
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </View>
//         </View>

//         {/* Invoice Details */}
//         <View style={[styles.detailsCard, { backgroundColor: colors.card, shadowColor: colors.foreground }]}>
//           <Text style={[styles.cardTitle, { color: colors.foreground }]}>Invoice Details</Text>
          
//           <View style={styles.detailsGrid}>
//             <View style={styles.detailItem}>
//               <CalendarDays size={16} color={colors.primary} />
//               <View style={styles.detailContent}>
//                 <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Date Issued</Text>
//                 <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                   {format(new Date(invoice.date), 'PPP')}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.detailItem}>
//               <User size={16} color={colors.primary} />
//               <View style={styles.detailContent}>
//                 <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Generated by</Text>
//                 <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                   {invoice.generatedBy}
//                 </Text>
//               </View>
//             </View>

//             {invoice.collectedBy && (
//               <View style={styles.detailItem}>
//                 <User size={16} color={colors.primary} />
//                 <View style={styles.detailContent}>
//                   <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Collected by</Text>
//                   <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                     {invoice.collectedBy}
//                   </Text>
//                 </View>
//               </View>
//             )}

//             {invoice.paymentMethod && (
//               <View style={styles.detailItem}>
//                 <FileText size={16} color={colors.primary} />
//                 <View style={styles.detailContent}>
//                   <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Payment Method</Text>
//                   <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                     {invoice.paymentMethod}
//                   </Text>
//                 </View>
//               </View>
//             )}
//           </View>
//         </View>

//         {/* Items Card */}
//         <View style={[styles.itemsCard, { backgroundColor: colors.card, shadowColor: colors.foreground }]}>
//           <Text style={[styles.cardTitle, { color: colors.foreground }]}>Items ({invoice.items.length})</Text>
          
//           <FlatList
//             data={invoice.items}
//             keyExtractor={item => item.id}
//             renderItem={({ item, index }) => (
//               <View style={[
//                 styles.itemRow, 
//                 { borderBottomColor: colors.border },
//                 index === invoice.items.length - 1 && { borderBottomWidth: 0 }
//               ]}>
//                 <View style={styles.itemInfo}>
//                   <Text style={[styles.itemDescription, { color: colors.foreground }]} numberOfLines={2}>
//                     {item.description}
//                   </Text>
//                   <View style={styles.itemDetails}>
//                     <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>
//                       Qty: {item.quantity} × ₹{item.price.toFixed(2)}
//                     </Text>
//                     {item.discount > 0 && (
//                       <View style={styles.discountInfo}>
//                         <Star size={12} color={colors.accent} />
//                         <Text style={[styles.discountText, { color: colors.accent }]}>
//                           {item.discount.toFixed(1)}% off
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                 </View>
//                 <View style={styles.itemAmount}>
//                   {item.mrp && item.mrp > item.price && (
//                     <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
//                       ₹{item.mrp.toFixed(2)}
//                     </Text>
//                   )}
//                   <Text style={[styles.itemTotal, { color: colors.foreground }]}>
//                     ₹{(item.quantity * item.price).toFixed(2)}
//                   </Text>
//                 </View>
//               </View>
//             )}
//             scrollEnabled={false}
//           />
//         </View>

//         {/* Summary Card */}
//         <View style={[styles.summaryCard, { backgroundColor: colors.card, shadowColor: colors.foreground }]}>
//           <View style={styles.summaryRow}>
//             <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
//               Subtotal (from MRP)
//             </Text>
//             <Text style={[styles.summaryValue, { color: colors.foreground }]}>
//               ₹{invoice.subtotal.toFixed(2)}
//             </Text>
//           </View>
//           <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
//           <View style={styles.summaryRow}>
//             <Text style={[styles.summaryTotalLabel, { color: colors.foreground }]}>Total</Text>
//             <Text style={[styles.summaryTotalValue, { color: colors.foreground }]}>
//               ₹{invoice.total.toFixed(2)}
//             </Text>
//           </View>
//         </View>

//         {/* Notes Card */}
//         {invoice.notes && (
//           <View style={[styles.notesCard, { backgroundColor: colors.card, shadowColor: colors.foreground }]}>
//             <Text style={[styles.cardTitle, { color: colors.foreground }]}>Notes</Text>
//             <Text style={[styles.notesText, { color: colors.mutedForeground }]}>
//               {invoice.notes}
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // Status Badge Component
// function StatusBadge({ status, colors }: { status: string; colors: any }) {
//   const getStatusColors = () => {
//     switch (status) {
//       case 'Paid':
//         return { bg: colors.primary + '20', border: colors.primary, text: colors.primary };
//       case 'Pending':
//         return { bg: colors.accent + '20', border: colors.accent, text: colors.accent };
//       case 'Overdue':
//         return { bg: colors.destructive + '20', border: colors.destructive, text: colors.destructive };
//       default:
//         return { bg: colors.muted, border: colors.border, text: colors.mutedForeground };
//     }
//   };

//   const statusColors = getStatusColors();
  
//   return (
//     <View style={[
//       styles.statusBadge,
//       {
//         backgroundColor: statusColors.bg,
//         borderColor: statusColors.border,
//       }
//     ]}>
//       <Text style={[
//         styles.statusBadgeText,
//         { color: statusColors.text }
//       ]}>
//         {status}
//       </Text>
//     </View>
//   );
// }

// // Skeleton Component
// function Skeleton({ style, colors }: { style?: any; colors: any }) {
//   return <View style={[styles.skeletonBase, { backgroundColor: colors.muted }, style]} />
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   backBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   shareBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//   },
//   shareBtnText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   // Card Styles
//   card: {
//     borderRadius: 12,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//     padding: 16,
//   },
//   headerCard: {
//     margin: 16,
//     marginBottom: 8,
//     borderRadius: 16,
//     padding: 20,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   invoiceHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   invoiceHeaderLeft: {
//     flex: 1,
//   },
//   invoiceTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 4,
//     letterSpacing: 1,
//   },
//   invoiceId: {
//     fontSize: 16,
//     fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
//     marginBottom: 12,
//   },
//   invoiceHeaderRight: {
//     alignItems: 'flex-end',
//   },
//   totalLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     marginBottom: 4,
//   },
//   totalAmount: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },

//   // Info Card
//   infoCard: {
//     marginHorizontal: 16,
//     marginBottom: 8,
//     borderRadius: 16,
//     padding: 20,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   infoSection: {
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//     marginBottom: 12,
//     letterSpacing: 0.5,
//   },
//   companyInfo: {
//     gap: 8,
//   },
//   companyName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   customerInfo: {
//     gap: 8,
//   },
//   customerName: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   infoText: {
//     fontSize: 14,
//     flex: 1,
//   },
//   divider: {
//     height: 1,
//     marginVertical: 8,
//   },

//   // Details Card
//   detailsCard: {
//     marginHorizontal: 16,
//     marginBottom: 8,
//     borderRadius: 16,
//     padding: 20,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   detailsGrid: {
//     gap: 16,
//   },
//   detailItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: 12,
//   },
//   detailContent: {
//     flex: 1,
//   },
//   detailLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     marginBottom: 2,
//   },
//   detailValue: {
//     fontSize: 15,
//     fontWeight: '500',
//   },

//   // Items Card
//   itemsCard: {
//     marginHorizontal: 16,
//     marginBottom: 8,
//     borderRadius: 16,
//     padding: 20,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     paddingVertical: 16,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   itemInfo: {
//     flex: 1,
//     marginRight: 16,
//   },
//   itemDescription: {
//     fontSize: 15,
//     fontWeight: '500',
//     marginBottom: 8,
//     lineHeight: 20,
//   },
//   itemDetails: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   itemMeta: {
//     fontSize: 13,
//   },
//   discountInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   discountText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   itemAmount: {
//     alignItems: 'flex-end',
//   },
//   originalPrice: {
//     fontSize: 12,
//     textDecorationLine: 'line-through',
//     marginBottom: 2,
//   },
//   itemTotal: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },

//   // Summary Card
//   summaryCard: {
//     marginHorizontal: 16,
//     marginBottom: 8,
//     borderRadius: 16,
//     padding: 20,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   summaryLabel: {
//     fontSize: 14,
//   },
//   summaryValue: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   summaryDivider: {
//     height: 2,
//     marginVertical: 8,
//   },
//   summaryTotalLabel: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   summaryTotalValue: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },

//   // Notes Card
//   notesCard: {
//     marginHorizontal: 16,
//     marginBottom: 8,
//     borderRadius: 16,
//     padding: 20,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   notesText: {
//     fontSize: 14,
//     lineHeight: 20,
//   },

//   // Status Badge
//   statusBadge: {
//     alignSelf: 'flex-start',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//   },
//   statusBadgeText: {
//     fontSize: 11,
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },

//   // Not Found Styles
//   notFoundContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//   },
//   notFoundTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginTop: 16,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   notFoundSubtitle: {
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 24,
//     lineHeight: 20,
//   },
//   backPrimaryBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 12,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//   },
//   backPrimaryBtnText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },

//   // Skeleton
//   skeletonBase: {
//     borderRadius: 8,
//   },
// });
