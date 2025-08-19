import { useEffect, useState, useCallback } from 'react';
import type { StockPurchase, ShopSettings } from '../../../types/database';
import type { ToastInput } from '../../../hooks/use-toast';
import { stockPurchaseService } from '../../../services/stock-service';
import { shopSettingsService } from '../../../services/shop-service';

type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer';

interface UseExpenseDetailParams {
  expenseId: string;
  navigation: any;
  toast: (props: ToastInput) => void;
  user: { name?: string } | null;
}

export default function useExpenseDetail({ expenseId, navigation, toast, user }: UseExpenseDetailParams) {
  const [expense, setExpense] = useState<StockPurchase | null>(null);
  const [shopDetails, setShopDetails] = useState<ShopSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaidDialog, setIsPaidDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Cash');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const loadExpenseData = useCallback(async (showLoading = true) => {
    if (!expenseId) return;
    if (showLoading) setIsLoading(true);
    try {
      const [fetchedExpense, shop] = await Promise.all([
        stockPurchaseService.findById(expenseId),
        shopSettingsService.findAll().then(settings => settings[0] || null),
      ]);
      if (!fetchedExpense) {
        toast({ title: 'Error', description: 'Expense not found.', variant: 'destructive' });
        navigation.navigate('CashFlow');
        return;
      }
      setExpense(fetchedExpense);
      setShopDetails(shop);
    } catch (error) {
      console.error('Error loading expense data:', error);
      toast({ title: 'Error', description: 'Could not fetch required data.', variant: 'destructive' });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [expenseId, navigation, toast]);

  useEffect(() => {
    loadExpenseData(true);
  }, [loadExpenseData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadExpenseData(false);
      toast({ title: 'Refreshed', description: 'Expense data updated successfully.' });
    } catch (error) {
      console.error('Error refreshing expense:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadExpenseData, toast]);

  const handleUpdateStatus = async () => {
    if (!expense) return;
    setIsSavingStatus(true);
    try {
      // ✅ FIXED: Use correct enum values that match the StockPurchase interface
      const updatedExpense = await stockPurchaseService.update(expense.id, {
        status: 'Paid',
        created_by: user?.name ?? 'System',
        payment_method: selectedPaymentMethod, // ✅ FIXED: Direct assignment since types match
        payment_date: new Date().toISOString().slice(0, 10),
      });
      
      if (updatedExpense) {
        setExpense(updatedExpense);
        setIsPaidDialog(false);
        toast({ title: 'Success', description: `Expense ${expense.id} marked as Paid.` });
      } else {
        toast({ title: 'Error', description: 'Failed to update expense status.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error updating expense status:', error);
      toast({ title: 'Error', description: 'Failed to update expense status.', variant: 'destructive' });
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleOpenReceipt = () => {
    // ✅ FIXED: Since receiptUrl doesn't exist in StockPurchase interface, 
    // we'll handle this differently or add the property if needed
    toast({ title: 'Receipt', description: 'Receipt functionality not available for stock purchases.' });
    // Alternative: If you want to add receipt functionality, add receiptUrl? to StockPurchase interface
  };

  const handlePrint = () => {
    toast({ title: 'Print', description: 'Printing not supported in mobile app.' });
  };

  return {
    expense,
    shopDetails,
    isLoading,
    isRefreshing,
    isPaidDialog,
    selectedPaymentMethod,
    isSavingStatus,
    setSelectedPaymentMethod,
    setIsPaidDialog,
    onRefresh,
    handleUpdateStatus,
    handleOpenReceipt,
    handlePrint,
    loadExpenseData,
  };
}


// // src/screens/ExpenseDetail/hooks/useExpenseDetail.ts


// import { useEffect, useState, useCallback } from 'react';
// import type { StockPurchase, ShopDetails } from '../../../types';
// import type { ToastInput } from '../../../hooks/use-toast';
// import { getStockPurchaseById, updateStockPurchaseStatus } from '../../../services/stock-service'; // Added missing import
// import { getShopDetails } from '../../../services/shop-service';

// type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer';

// interface UseExpenseDetailParams {
//   expenseId: string;
//   navigation: any;
//   toast: (props: ToastInput) => void;
//   user: { name?: string } | null;
// }

// export default function useExpenseDetail({ expenseId, navigation, toast, user }: UseExpenseDetailParams) {
//   const [expense, setExpense] = useState<StockPurchase | null>(null);
//   const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isPaidDialog, setIsPaidDialog] = useState(false);

//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Cash');
//   const [isSavingStatus, setIsSavingStatus] = useState(false);

//   const loadExpenseData = useCallback(async (showLoading = true) => {
//     if (!expenseId) return;
//     if (showLoading) setIsLoading(true);

//     try {
//       const [fetchedExpense, shop] = await Promise.all([
//         getStockPurchaseById(expenseId),
//         getShopDetails(),
//       ]);

//       if (!fetchedExpense) {
//         toast({ title: 'Error', description: 'Expense not found.', variant: 'destructive' });
//         navigation.navigate('CashFlow');
//         return;
//       }

//       setExpense(fetchedExpense);
//       setShopDetails(shop);
//     } catch (error) {
//       console.error('Error loading expense data:', error);
//       toast({ title: 'Error', description: 'Could not fetch required data.', variant: 'destructive' });
//     } finally {
//       if (showLoading) setIsLoading(false);
//     }
//   }, [expenseId, navigation, toast]);

//   useEffect(() => {
//     loadExpenseData(true);
//   }, [loadExpenseData]);

//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     try {
//       await loadExpenseData(false);
//       toast({ title: 'Refreshed', description: 'Expense data updated successfully.' });
//     } catch (error) {
//       console.error('Error refreshing expense:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   }, [loadExpenseData, toast]);

//   const handleUpdateStatus = async () => {
//     if (!expense) return;
//     setIsSavingStatus(true);

//     try {
//       // Fixed: Use correct function name and parameters
//       const updatedExpense = await updateStockPurchaseStatus(
//         expense.id,
//         'Paid',
//         user?.name ?? 'System',
//         selectedPaymentMethod as StockPurchase['paymentMethod']
//       );

//       if (updatedExpense) {
//         setExpense(updatedExpense);
//         setIsPaidDialog(false);
//         toast({ title: 'Success', description: `Expense ${expense.id} marked as Paid.` });
//       } else {
//         toast({ title: 'Error', description: 'Failed to update expense status.', variant: 'destructive' });
//       }
//     } catch (error) {
//       console.error('Error updating expense status:', error);
//       toast({ title: 'Error', description: 'Failed to update expense status.', variant: 'destructive' });
//     } finally {
//       setIsSavingStatus(false);
//     }
//   };

//   const handleOpenReceipt = () => {
//     if (expense?.receiptUrl) {
//       toast({ title: 'External Link', description: 'Open attachment in browser.' });
//       // You could add: Linking.openURL(expense.receiptUrl)
//     }
//   };

//   const handlePrint = () => {
//     toast({ title: 'Print', description: 'Printing not supported in mobile app.' });
//   };

//   return {
//     expense,
//     shopDetails,
//     isLoading,
//     isRefreshing,
//     isPaidDialog,
//     selectedPaymentMethod,
//     isSavingStatus,
//     setSelectedPaymentMethod,
//     setIsPaidDialog,
//     onRefresh,
//     handleUpdateStatus,
//     handleOpenReceipt,
//     handlePrint,
//     loadExpenseData,
//   };
// }
