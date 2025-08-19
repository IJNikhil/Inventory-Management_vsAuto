import { useState, useEffect, useMemo, useCallback } from 'react';
import { differenceInDays } from 'date-fns';
import type { Invoice, InvoiceCustomer } from '../../../types/database';
import type { ToastInput, ToastVariant } from '../../../hooks/use-toast';
import { invoiceService } from '../../../services/invoice-service';

const ITEMS_PER_PAGE = 20;
const OVERDUE_DAYS = 15;

type Params = {
  toast: (opts: ToastInput) => {
    id: string;
    dismiss: () => void;
    update: (updateProps: Partial<any>) => void;
  };
  user: { name?: string } | null;
};

export function useInvoices({ toast, user }: Params) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'sent' | 'overdue'>('all');

  const variantDestructive: ToastVariant = 'destructive';
  const variantDefault: ToastVariant = 'default';

  const loadInvoices = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const data = await invoiceService.findAll();
        console.log('[useInvoices] Loaded invoices:', data.length);
        
        // Process invoices to handle backward compatibility
        const processedInvoices = data.map((invoice) => {
          // ✅ FIXED: Validate invoice_date field (removed backslashes)
          let validatedDate = invoice.invoice_date;
          try {
            if (!invoice.invoice_date || isNaN(new Date(invoice.invoice_date).getTime())) {
              console.warn(`[useInvoices] Invalid date for invoice ${invoice.id}:`, invoice.invoice_date);
              validatedDate = new Date().toISOString().split('T')[0]; // Fallback to today
            }
          } catch (err: any) {
            console.warn(`[useInvoices] Error validating date for invoice ${invoice.id}:`, err);
            validatedDate = new Date().toISOString().split('T')[0];
          }

          // Handle old invoice structure (has customerId but no embedded customer)
          if ((invoice as any).customerId && !invoice.customer) {
            console.log('[useInvoices] Converting old invoice structure:', invoice.id);
            const embeddedCustomer: InvoiceCustomer = {
              name: (invoice as any).customerName || 'Unknown Customer',
              phone: undefined,
              email: undefined,
              address: undefined,
            };
            return {
              ...invoice,
              customer: embeddedCustomer,
              invoice_date: validatedDate, // ✅ FIXED: Remove backslashes
            } as Invoice;
          }

          // Handle missing customer data entirely
          if (!invoice.customer) {
            console.warn('[useInvoices] Invoice missing customer data:', invoice.id);
            const fallbackCustomer: InvoiceCustomer = {
              name: (invoice as any).customerName || 'Unknown Customer',
              phone: undefined,
              email: undefined,
              address: undefined,
            };
            return {
              ...invoice,
              customer: fallbackCustomer,
              invoice_date: validatedDate, // ✅ FIXED: Remove backslashes
            } as Invoice;
          }

          // Invoice already has proper embedded customer data
          return {
            ...invoice,
            invoice_date: validatedDate, // ✅ FIXED: Remove backslashes
          };
        });

        setInvoices(processedInvoices);
      } catch (err: any) {
        const error = err as { message: string; stack?: string };
        console.error('[useInvoices] Error loading invoices:', {
          message: error.message || 'Unknown error',
          stack: error.stack,
          details: JSON.stringify(error, null, 2),
        });
        toast({
          title: 'Error',
          description: 'Failed to fetch invoices.',
          variant: variantDestructive,
        });
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadInvoices(true);
  }, [loadInvoices]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    try {
      await loadInvoices(false);
      toast({
        title: 'Refreshed',
        description: 'Invoice data updated successfully.',
        variant: variantDefault,
      });
    } catch (err: any) {
      const error = err as { message: string; stack?: string };
      console.error('Error refreshing invoices:', {
        message: error.message || 'Unknown error',
        stack: error.stack,
        details: JSON.stringify(error, null, 2),
      });
      toast({
        title: 'Error',
        description: 'Failed to refresh invoices.',
        variant: variantDestructive,
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [loadInvoices, toast]);

  // ✅ CRITICAL FIX: Fixed syntax errors - use === instead of =
  const processedInvoices = useMemo(() => {
    return invoices.map((inv) => {
      let displayStatus: Invoice['status'] | 'overdue' = inv.status;
      
      // ✅ CRITICAL FIX: Use === for comparison, not =
      if (inv.status === 'sent' || inv.status === 'draft') {
        try {
          const date = new Date(inv.invoice_date); // ✅ FIXED: Remove backslashes
          if (isNaN(date.getTime())) {
            console.warn(`[useInvoices] Skipping overdue check for invalid date in invoice ${inv.id}:`, inv.invoice_date);
            return { ...inv, displayStatus };
          }
          const daysPassed = differenceInDays(new Date(), date);
          if (daysPassed > OVERDUE_DAYS) {
            displayStatus = 'overdue';
          }
        } catch (err: any) {
          console.warn(`[useInvoices] Error processing date for invoice ${inv.id}:`, err);
        }
      }
      return { ...inv, displayStatus };
    });
  }, [invoices]);

  // Helper function to safely get string value for searching
  const getSearchableString = (value: any): string => {
    // ✅ CRITICAL FIX: Use === instead of =
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  const filteredInvoices = useMemo(() => {
    const safeSearchTerm = getSearchableString(searchTerm).toLowerCase();
    let filtered = processedInvoices.filter((inv) => {
      const customerName = inv.customer?.name || (inv as any).customerName || '';
      const invoiceNumber = getSearchableString(inv.invoice_number); // ✅ ADDED: Search by invoice_number too
      const invoiceId = getSearchableString(inv.id);
      
      const customerNameMatch = getSearchableString(customerName).toLowerCase().includes(safeSearchTerm);
      const invoiceNumberMatch = invoiceNumber.toLowerCase().includes(safeSearchTerm); // ✅ ADDED: Search invoice number
      const idMatch = invoiceId.toLowerCase().includes(safeSearchTerm);
      
      return customerNameMatch || invoiceNumberMatch || idMatch;
    });

    if (activeTab !== 'all') {
      filtered = filtered.filter((inv) => {
        const displayStatus = (inv as any).displayStatus || inv.status || '';
        return displayStatus.toLowerCase() === activeTab;
      });
    }

    return filtered.sort((a, b) => {
      try {
        return new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime(); // ✅ FIXED: Remove backslashes
      } catch (err: any) {
        console.warn(`[useInvoices] Error sorting invoices by date:`, err);
        return 0;
      }
    });
  }, [processedInvoices, searchTerm, activeTab]);

  const paginatedInvoices = useMemo(() => {
    return filteredInvoices.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  const hasMore = paginatedInvoices.length < filteredInvoices.length;

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, hasMore]);

  const handleUpdateStatus = useCallback(
    async (invoiceId: string, status: Invoice['status'], paymentMethod?: Invoice['payment_method']) => {
      try {
        const currentInvoice = await invoiceService.findById(invoiceId);
        if (!currentInvoice) {
          throw new Error('Invoice not found');
        }

        const updateData: Partial<Invoice> = {
          status,
          ...(paymentMethod && { payment_method: paymentMethod }), // ✅ FIXED: Remove backslashes
          ...(status === 'paid' && {
            generated_by: user?.name ?? 'System', // ✅ FIXED: Remove backslashes
            payment_date: new Date().toISOString().split('T')[0], // ✅ FIXED: Remove backslashes
          }),
        };

        await invoiceService.update(invoiceId, updateData);
        const updatedInvoice = await invoiceService.findById(invoiceId);
        
        if (updatedInvoice) {
          setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? updatedInvoice : inv)));
          toast({
            title: 'Status Updated',
            description: `Invoice ${updatedInvoice.invoice_number || invoiceId} marked as ${status}.`, // ✅ IMPROVED: Show invoice_number
            variant: variantDefault,
          });
          return true;
        }
        return false;
      } catch (err: any) {
        const error = err as { message: string; stack?: string };
        console.error('Error updating invoice status:', {
          message: error.message || 'Unknown error',
          stack: error.stack,
          details: JSON.stringify(error, null, 2),
        });
        toast({
          title: 'Error',
          description: 'Failed to update invoice status',
          variant: variantDestructive,
        });
        return false;
      }
    },
    [toast, user]
  );

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0, paid: 0, sent: 0, overdue: 0 };
    processedInvoices.forEach((inv) => {
      counts.all++;
      const statusKey = ((inv as any).displayStatus || inv.status || '').toLowerCase();
      if (statusKey && counts.hasOwnProperty(statusKey)) {
        counts[statusKey] = (counts[statusKey] ?? 0) + 1;
      }
    });
    return counts;
  }, [processedInvoices]);

  return {
    invoices,
    isLoading,
    isRefreshing,
    isLoadingMore,
    searchTerm,
    setSearchTerm,
    currentPage,
    activeTab,
    setActiveTab,
    paginatedInvoices,
    hasMore,
    loadMore,
    onRefresh,
    handleUpdateStatus,
    tabCounts,
  };
}
