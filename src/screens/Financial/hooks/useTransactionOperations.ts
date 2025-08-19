import { useCallback, useState } from 'react';
import { useToast } from '../../../hooks/use-toast';
import type { Transaction } from '../../../types/database';
import { transactionService } from '../../../services/transaction-service';

// Map UI status to DB enum
const mapStatus = (uiStatus: 'Paid' | 'Pending'): Transaction['status'] => {
  switch (uiStatus) {
    case 'Paid':
      return 'completed';
    case 'Pending':
      return 'pending';
    default:
      return 'pending';
  }
};

export function useTransactionOperations() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateTransactionData = useCallback((
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'version'>
  ): string[] => {
    const errors: string[] = [];
    
    if (!data.description?.trim()) errors.push('Description is required');
    if (!data.amount || data.amount === 0) errors.push('Amount cannot be zero');
    if (!data.transaction_date) errors.push('Transaction date is required'); // ✅ FIXED: Remove backslashes
    if (!data.recorded_by?.trim()) errors.push('Recorded by is required'); // ✅ FIXED: Remove backslashes
    if (!data.category) errors.push('Category is required');
    if (!data.payment_method) errors.push('Payment method is required'); // ✅ FIXED: Remove backslashes
    
    return errors;
  }, []);

  const handleAddTransaction = useCallback(async (
    transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'version'>
  ) => {
    const errors = validateTransactionData(transactionData);
    if (errors.length > 0) {
      toast({ title: 'Validation Error', description: errors.join(', '), variant: 'destructive' });
      return false;
    }

    setIsProcessing(true);
    try {
      const addedTransaction = await transactionService.create({
        ...transactionData,
        amount: Number(transactionData.amount),
        description: transactionData.description.trim(),
        recorded_by: transactionData.recorded_by.trim(), // ✅ FIXED: Remove backslashes
      });

      if (addedTransaction) {
        toast({
          title: 'Success',
          description: `Transaction "${addedTransaction.description}" added successfully`,
          variant: 'default',
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add transaction',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [toast, validateTransactionData]);

  const handleUpdateTransactionStatus = useCallback(async (
    transactionId: string,
    uiStatus: 'Paid' | 'Pending',
    paidBy: string,
    paymentMethod: Transaction['payment_method']
  ) => {
    if (!paidBy.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Paid by field is required',
        variant: 'destructive',
      });
      return false;
    }

    setIsProcessing(true);
    try {
      const updatedTransaction = await transactionService.update(transactionId, {
        status: mapStatus(uiStatus),
        recorded_by: paidBy.trim(), // ✅ FIXED: Remove backslashes
        payment_method: paymentMethod, // ✅ FIXED: Remove backslashes
        payment_date: uiStatus === 'Paid' ? new Date().toISOString().slice(0, 10) : undefined // ✅ FIXED: Remove backslashes
      });

      if (updatedTransaction) {
        toast({
          title: 'Success',
          description: `Transaction status updated to ${uiStatus}`,
          variant: 'default',
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update transaction status',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  return {
    handleAddTransaction,
    handleUpdateTransactionStatus,
    isProcessing,
  };
}



// import { useCallback, useState } from 'react';
// import { useToast } from '../../../hooks/use-toast';
// import type { Transaction } from '../../../types/database';
// import { transactionService } from '../../../services/transaction-service';

// // Map UI status to DB enum
// const mapStatus = (uiStatus: 'Paid' | 'Pending'): Transaction['status'] => {
//   switch (uiStatus) {
//     case 'Paid':
//       return 'completed';
//     case 'Pending':
//       return 'pending';
//     default:
//       return 'pending';
//   }
// };

// export function useTransactionOperations() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const { toast } = useToast();

//   const validateTransactionData = useCallback((
//     data: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'version'>
//   ): string[] => {
//     const errors: string[] = [];
//     if (!data.description?.trim()) errors.push('Description is required');
//     if (!data.amount || data.amount === 0) errors.push('Amount cannot be zero');
//     if (!data.transaction_date) errors.push('Transaction date is required');
//     if (!data.recorded_by?.trim()) errors.push('Recorded by is required');
//     if (!data.category) errors.push('Category is required');
//     if (!data.payment_method) errors.push('Payment method is required');
//     return errors;
//   }, []);

//   const handleAddTransaction = useCallback(async (
//     transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'version'>
//   ) => {
//     const errors = validateTransactionData(transactionData);
//     if (errors.length > 0) {
//       toast({ title: 'Validation Error', description: errors.join(', '), variant: 'destructive' });
//       return false;
//     }
//     setIsProcessing(true);
//     try {
//       const addedTransaction = await transactionService.create({
//         ...transactionData,
//         amount: Number(transactionData.amount),
//         description: transactionData.description.trim(),
//         recorded_by: transactionData.recorded_by.trim(),
//       });
//       if (addedTransaction) {
//         toast({
//           title: 'Success',
//           description: `Transaction "${addedTransaction.description}" added successfully`,
//           variant: 'default',
//         });
//         return true;
//       }
//       return false;
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to add transaction',
//         variant: 'destructive',
//       });
//       return false;
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [toast, validateTransactionData]);

//   const handleUpdateTransactionStatus = useCallback(async (
//     transactionId: string,
//     uiStatus: 'Paid' | 'Pending',
//     paidBy: string,
//     paymentMethod: Transaction['payment_method']
//   ) => {
//     if (!paidBy.trim()) {
//       toast({
//         title: 'Validation Error',
//         description: 'Paid by field is required',
//         variant: 'destructive',
//       });
//       return false;
//     }
//     setIsProcessing(true);
//     try {
//       const updatedTransaction = await transactionService.update(transactionId, {
//         status: mapStatus(uiStatus),
//         recorded_by: paidBy.trim(),
//         payment_method: paymentMethod,
//         payment_date: uiStatus === 'Paid' ? new Date().toISOString().slice(0, 10) : undefined
//       });
//       if (updatedTransaction) {
//         toast({
//           title: 'Success',
//           description: `Transaction status updated to ${uiStatus}`,
//           variant: 'default',
//         });
//         return true;
//       }
//       return false;
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to update transaction status',
//         variant: 'destructive',
//       });
//       return false;
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [toast]);

//   return {
//     handleAddTransaction,
//     handleUpdateTransactionStatus,
//     isProcessing,
//   };
// }



// // import { useCallback, useState } from 'react';
// // import { useToast } from '../../../hooks/use-toast';
// // import type { Transaction } from '../../../types';
// // import { addTransaction, updateTransactionStatus } from '../../../services/transaction-service';

// // export function useTransactionOperations() {
// //   const [isProcessing, setIsProcessing] = useState(false);
// //   const { toast } = useToast();

// //   const validateTransactionData = useCallback((data: Omit<Transaction, 'id' | 'lastModified'>): string[] => {
// //     const errors: string[] = [];
// //     if (!data.description?.trim()) errors.push('Description is required');
// //     if (!data.amount || data.amount === 0) errors.push('Amount cannot be zero');
// //     if (!data.date) errors.push('Date is required');
// //     if (!data.recordedBy?.trim()) errors.push('Recorded by is required');
// //     if (!data.category) errors.push('Category is required');
// //     if (!data.paymentMethod) errors.push('Payment method is required');
// //     return errors;
// //   }, []);

// //   const handleAddTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'lastModified'>): Promise<boolean> => {
// //     const errors = validateTransactionData(transactionData);
// //     if (errors.length > 0) {
// //       toast({
// //         title: 'Validation Error',
// //         description: errors.join(', '),
// //         variant: 'destructive',
// //       });
// //       return false;
// //     }

// //     setIsProcessing(true);

// //     try {
// //       const addedTransaction = await addTransaction({
// //         ...transactionData,
// //         amount: Number(transactionData.amount),
// //         description: transactionData.description.trim(),
// //         recordedBy: transactionData.recordedBy.trim(),
// //       });

// //       if (addedTransaction) {
// //         toast({
// //           title: 'Success',
// //           description: `Transaction "${addedTransaction.description}" added successfully`,
// //           variant: 'default',
// //         });
// //         return true;
// //       }
// //       return false;
// //     } catch (error: any) {
// //       toast({
// //         title: 'Error',
// //         description: error.message || 'Failed to add transaction',
// //         variant: 'destructive',
// //       });
// //       return false;
// //     } finally {
// //       setIsProcessing(false);
// //     }
// //   }, [toast, validateTransactionData]);

// //   const handleUpdateTransactionStatus = useCallback(async (
// //     transactionId: string,
// //     status: 'Paid' | 'Pending',
// //     paidBy: string,
// //     paymentMethod: Transaction['paymentMethod']
// //   ): Promise<boolean> => {
// //     if (!paidBy.trim()) {
// //       toast({
// //         title: 'Validation Error',
// //         description: 'Paid by field is required',
// //         variant: 'destructive',
// //       });
// //       return false;
// //     }

// //     setIsProcessing(true);

// //     try {
// //       const updatedTransaction = await updateTransactionStatus(transactionId, status, paidBy.trim(), paymentMethod);

// //       if (updatedTransaction) {
// //         toast({
// //           title: 'Success',
// //           description: `Transaction status updated to ${status}`,
// //           variant: 'default',
// //         });
// //         return true;
// //       }

// //       return false;
// //     } catch (error: any) {
// //       toast({
// //         title: 'Error',
// //         description: error.message || 'Failed to update transaction status',
// //         variant: 'destructive',
// //       });
// //       return false;
// //     } finally {
// //       setIsProcessing(false);
// //     }
// //   }, [toast]);

// //   return {
// //     handleAddTransaction,
// //     handleUpdateTransactionStatus,
// //     isProcessing,
// //   };
// // }
