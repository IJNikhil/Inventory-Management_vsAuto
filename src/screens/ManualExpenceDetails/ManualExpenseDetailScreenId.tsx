import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { useAppSelector } from '../../lib/redux/hooks';
import { selectAuth } from '../../lib/redux/slices/auth-slice';
import { useColors } from '../../context/ThemeContext';
import { useToast } from '../../hooks/use-toast';
import type { ShopSettings, StockPurchase, Supplier } from '../../types/database';
import { ExpenseDetailSkeleton } from './ExpenseDetailSkeleton';
import { ExpenseNotFound } from './ExpenseNotFound';
import { ExpenseDetailHeader } from './ExpenseDetailHeader';
import { styles } from './ExpenseDetailStyles';
import { ExpenseInfoSection } from './ExpenseInfoSection';
import { ExpenseItemsTable } from './ExpenseItemsTable';
import { ExpenseFooter } from './ExpenseFooter';
import { MarkAsPaidModal } from './MarkAsPaidModal';
import { stockPurchaseService } from '../../services/stock-service';
import { shopSettingsService } from '../../services/shop-service';
import { supplierService } from '../../services/supplier-service';

// ✅ FIXED: Define PaymentMethod type to match database enum (title case)
type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer';

export default function ManualExpenseDetailScreenId({ route, navigation }: any) {
  const expenseId = route?.params?.id as string;
  const { user } = useAppSelector(selectAuth);
  const { toast } = useToast();
  const colors = useColors();
  
  const [expense, setExpense] = useState<StockPurchase | null>(null);
  const [shopDetails, setShopDetails] = useState<ShopSettings | null>(null);
  const [supplier, setSupplier] = useState<Supplier | undefined>(undefined); // ✅ FIXED: Use undefined instead of null
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPaidDialog, setIsPaidDialog] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Cash'); // ✅ FIXED: Title case default
  const [isSavingStatus, setIsSavingStatus] = useState<boolean>(false);

  const loadExpenseData = useCallback(async (showLoading = true) => {
    if (!expenseId) return;
    if (showLoading) setIsLoading(true);
    
    try {
      const [fetchedExpense, shopSettingsArray] = await Promise.all([
        stockPurchaseService.findById(expenseId),
        shopSettingsService.findAll()
      ]);
      
      const shop = shopSettingsArray[0] || null;
      
      if (fetchedExpense) {
        setExpense(fetchedExpense);
        setShopDetails(shop);
        
        // Fetch supplier data separately since it's normalized
        if (fetchedExpense.supplier_id) {
          try {
            const supplierData = await supplierService.findById(fetchedExpense.supplier_id);
            setSupplier(supplierData || undefined); // ✅ FIXED: Convert null to undefined
          } catch (error) {
            console.warn('Could not fetch supplier data:', error);
            setSupplier(undefined);
          }
        }
      } else {
        toast({ title: 'Error', description: 'Expense not found.', variant: 'destructive' });
        navigation.navigate('CashFlow');
      }
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

  const handlePrint = () => {
    toast({ title: 'Print', description: 'Printing not supported in mobile app.' });
  };

  const handleUpdateStatus = async () => {
    if (!expense) return;
    setIsSavingStatus(true);
    
    try {
      // ✅ FIXED: Use title case status and payment method to match database schema
      const updatedExpense = await stockPurchaseService.update(expense.id, {
        status: 'Paid', // ✅ FIXED: Use title case 'Paid'
        payment_method: selectedPaymentMethod, // ✅ FIXED: Already title case
        payment_date: new Date().toISOString().slice(0, 10),
      });

      if (updatedExpense) {
        setExpense(updatedExpense);
        setIsPaidDialog(false);
        toast({ 
          title: 'Success', 
          description: `Expense ${expense.id} marked as Paid.` 
        });
      } else {
        throw new Error('Failed to update expense status');
      }
    } catch (error) {
      console.error('Error updating expense status:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update expense status.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleOpenReceipt = () => {
    toast({ title: 'Receipt', description: 'Receipt functionality not available.' });
  };

  // Loading state
  if (isLoading) {
    return <ExpenseDetailSkeleton />;
  }

  // Not found state
  if (!expense || !shopDetails) {
    return <ExpenseNotFound onBackPress={() => navigation.navigate('CashFlow')} />;
  }

  // Transform items to match the expected interface
  const transformedItems = (expense as any).items?.map((item: any) => ({
    ...item,
    part_number: item.part_number || item.partNumber || '',
  })) || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ExpenseDetailHeader
        onBackPress={() => navigation.goBack()}
        onReceiptPress={handleOpenReceipt}
        onMarkPaidPress={() => setIsPaidDialog(true)}
        onPrintPress={handlePrint}
        hasReceipt={false}
        isPending={expense.status === 'Pending'} // ✅ FIXED: Use title case 'Pending'
      />
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <ExpenseInfoSection 
            expense={expense} 
            shopDetails={shopDetails} 
            supplier={supplier} // ✅ FIXED: Now properly typed as Supplier | undefined
          />
          <ExpenseItemsTable items={transformedItems} />
          <ExpenseFooter notes={expense.notes} total={expense.total} />
        </View>
      </ScrollView>

      <MarkAsPaidModal
        visible={isPaidDialog}
        expenseId={expense.id}
        selectedPaymentMethod={selectedPaymentMethod} // ✅ FIXED: Now matches expected type
        isSaving={isSavingStatus}
        onClose={() => setIsPaidDialog(false)}
        onPaymentMethodSelect={setSelectedPaymentMethod} // ✅ FIXED: Type now matches
        onConfirm={handleUpdateStatus}
      />
    </View>
  );
}


// import React, { useEffect, useState, useCallback } from 'react';
// import { ScrollView, View, RefreshControl } from 'react-native';
// import { useAppSelector } from '../../lib/redux/hooks';
// import { selectAuth } from '../../lib/redux/slices/auth-slice';
// import { useColors } from '../../context/ThemeContext';
// import { useToast } from '../../hooks/use-toast';
// import { ShopDetails, StockPurchase } from '../../types';
// import { ExpenseDetailSkeleton } from './ExpenseDetailSkeleton';
// import { ExpenseNotFound } from './ExpenseNotFound';
// import { ExpenseDetailHeader } from './ExpenseDetailHeader';
// import { styles } from './ExpenseDetailStyles';
// import { ExpenseInfoSection } from './ExpenseInfoSection';
// import { ExpenseItemsTable } from './ExpenseItemsTable';
// import { ExpenseFooter } from './ExpenseFooter';
// import { MarkAsPaidModal } from './MarkAsPaidModal';
// import { getStockPurchaseById, updateStockPurchaseStatus } from '../../services/stock-service'; // Added updateStockPurchaseStatus import
// import { getShopDetails } from '../../services/shop-service';

// // Define PaymentMethod type
// type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer';

// export default function ManualExpenseDetailScreenId({ route, navigation }: any) {
//   const expenseId = route?.params?.id as string;
//   const { user } = useAppSelector(selectAuth);
//   const { toast } = useToast();
//   const colors = useColors();

//   const [expense, setExpense] = useState<StockPurchase | null>(null);
//   const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
//   const [isPaidDialog, setIsPaidDialog] = useState<boolean>(false);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Cash');
//   const [isSavingStatus, setIsSavingStatus] = useState<boolean>(false);

//   const loadExpenseData = useCallback(async (showLoading = true) => {
//     if (!expenseId) return;
//     if (showLoading) setIsLoading(true);
    
//     try {
//       const [fetchedExpense, shop] = await Promise.all([
//         getStockPurchaseById(expenseId), 
//         getShopDetails()
//       ]);
      
//       if (fetchedExpense) {
//         setExpense(fetchedExpense);
//         setShopDetails(shop);
//       } else {
//         toast({ title: 'Error', description: 'Expense not found.', variant: 'destructive' });
//         navigation.navigate('CashFlow');
//       }
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

//   const handlePrint = () => {
//     toast({ title: 'Print', description: 'Printing not supported in mobile app.' });
//   };

//   const handleUpdateStatus = async () => {
//     if (!expense) return;
//     setIsSavingStatus(true);
    
//     try {
//       // Use the existing updateStockPurchaseStatus function
//       const updatedExpense = await updateStockPurchaseStatus(
//         expense.id,
//         'Paid',
//         user?.name ?? 'System',
//         selectedPaymentMethod as StockPurchase['paymentMethod']
//       );

//       if (updatedExpense) {
//         setExpense(updatedExpense);
//         setIsPaidDialog(false);
//         toast({ 
//           title: 'Success', 
//           description: `Expense ${expense.id} marked as Paid.` 
//         });
//       } else {
//         throw new Error('Failed to update expense status');
//       }
//     } catch (error) {
//       console.error('Error updating expense status:', error);
//       toast({ 
//         title: 'Error', 
//         description: 'Failed to update expense status.', 
//         variant: 'destructive' 
//       });
//     } finally {
//       setIsSavingStatus(false);
//     }
//   };

//   const handleOpenReceipt = () => {
//     if (expense?.receiptUrl) {
//       toast({ title: 'External Link', description: 'Open attachment in browser.' });
//       // You could implement actual URL opening here using Linking from React Native
//       // Linking.openURL(expense.receiptUrl);
//     }
//   };

//   // Loading state
//   if (isLoading) {
//     return <ExpenseDetailSkeleton />;
//   }

//   // Not found state
//   if (!expense || !shopDetails) {
//     return <ExpenseNotFound onBackPress={() => navigation.navigate('CashFlow')} />;
//   }

//   // Transform items to match ExpenseItem interface
//   const transformedItems = expense.items.map(item => ({
//     ...item,
//     partNumber: item.partNumber || '', // Handle undefined partNumber
//   }));

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <ExpenseDetailHeader
//         onBackPress={() => navigation.goBack()}
//         onReceiptPress={handleOpenReceipt}
//         onMarkPaidPress={() => setIsPaidDialog(true)}
//         onPrintPress={handlePrint}
//         hasReceipt={!!expense.receiptUrl}
//         isPending={expense.status === 'Pending'}
//       />

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
//       >
//         <View style={[styles.card, { backgroundColor: colors.card }]}>
//           <ExpenseInfoSection expense={expense} shopDetails={shopDetails} />
//           <ExpenseItemsTable items={transformedItems} />
//           <ExpenseFooter notes={expense.notes} total={expense.total} />
//         </View>
//       </ScrollView>

//       <MarkAsPaidModal
//         visible={isPaidDialog}
//         expenseId={expense.id}
//         selectedPaymentMethod={selectedPaymentMethod}
//         isSaving={isSavingStatus}
//         onClose={() => setIsPaidDialog(false)}
//         onPaymentMethodSelect={setSelectedPaymentMethod}
//         onConfirm={handleUpdateStatus}
//       />
//     </View>
//   );
// }
