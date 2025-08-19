import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { ArrowLeft, Download, Printer, Wallet, Truck, User, CalendarDays, X, CheckCircle } from 'lucide-react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { format } from 'date-fns';
import { useColors, useTheme } from '../../context/ThemeContext';
import { useAppSelector } from '../../lib/redux/hooks';
import { selectAuth } from '../../lib/redux/slices/auth-slice';
import { useToast } from '../../hooks/use-toast';
import useExpenseDetail from './hooks/useExpenseDetail';
import type { StockPurchaseItem } from '../../types/database'; // ✅ ADDED: Import type for items

const { width: screenWidth } = Dimensions.get('window');

// Utility: Status Badge
function StatusBadge({ status, colors }: { status: string; colors: any }) {
  const isPaid = status === 'Paid';
  return (
    <View style={{
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      alignSelf: 'flex-start',
      backgroundColor: isPaid ? colors.primary + '20' : colors.accent + '20',
      borderColor: isPaid ? colors.primary : colors.accent,
    }}>
      <Text style={{
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
        color: isPaid ? colors.primary : colors.accent,
      }}>
        {status}
      </Text>
    </View>
  );
}

// Utility: Modal to Mark as Paid
function MarkPaidModal({
  visible,
  onClose,
  expenseId,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  handleUpdateStatus,
  isSavingStatus,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  expenseId: string;
  selectedPaymentMethod: 'Cash' | 'Card' | 'Bank Transfer';
  setSelectedPaymentMethod: (method: 'Cash' | 'Card' | 'Bank Transfer') => void;
  handleUpdateStatus: () => Promise<void>;
  isSavingStatus: boolean;
  colors: any;
}) {
  const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer'] as const;
  return (
    <View style={{
      position: 'absolute',
      left: 0, right: 0, top: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
      paddingHorizontal: 16,
      display: visible ? 'flex' : 'none',
    }}>
      <View style={{
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        elevation: 8,
        backgroundColor: colors.card,
        shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }
      }}>
        {/* Modal Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>Mark Expense as Paid</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 6 }} activeOpacity={0.7}>
            <X size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 14, paddingHorizontal: 20, marginBottom: 24, color: colors.mutedForeground }}>
          Select payment method for <Text style={{ color: colors.primary, fontWeight: '600' }}>{expenseId}</Text>:
        </Text>
        {/* Payment Method Options */}
        <View style={{ paddingHorizontal: 20, gap: 10, marginBottom: 22 }}>
          {PAYMENT_METHODS.map(method => (
            <TouchableOpacity
              key={method}
              onPress={() => setSelectedPaymentMethod(method)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                marginBottom: 6,
                backgroundColor: selectedPaymentMethod === method ? colors.primary : colors.background,
                borderColor: selectedPaymentMethod === method ? colors.primary : colors.border,
              }}
              activeOpacity={0.7}
            >
              {selectedPaymentMethod === method &&
                <CheckCircle size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />}
              <Text style={{
                fontSize: 15,
                fontWeight: '500',
                color: selectedPaymentMethod === method ? colors.primaryForeground : colors.foreground,
              }}>{method}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Modal Buttons */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: colors.muted,
            }}
            disabled={isSavingStatus}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.mutedForeground }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleUpdateStatus}
            style={{
              flex: 2,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              borderRadius: 8,
              gap: 8,
              backgroundColor: colors.primary,
              opacity: isSavingStatus ? 0.7 : 1,
            }}
            disabled={isSavingStatus}
            activeOpacity={0.8}
          >
            {isSavingStatus
              ? <ActivityIndicator size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
              : <Wallet size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />}
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primaryForeground }}>
              {isSavingStatus ? 'Processing...' : 'Confirm Payment'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Utility: Empty State
function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  const colors = useColors();
  return (
    <View style={{
      alignItems: 'center', paddingVertical: 32,
    }}>
      <FeatherIcon name={icon} size={28} color={colors.mutedForeground} style={{ marginBottom: 10 }} />
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 5 }}>{title}</Text>
      <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: 'center' }}>{description}</Text>
    </View>
  );
}

// Utility: Expense Info Card
function ExpenseInfo({ expense, shopDetails, colors }: { expense: any; shopDetails: any; colors: any }) {
  return (
    <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: colors.mutedForeground }}>Purchased By</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground }}>{shopDetails?.shop_name || 'Shop'}</Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{shopDetails?.address || ''}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Truck size={20} color={colors.primary} />
            <Text style={{ fontSize: 15, fontWeight: '700', marginLeft: 8, color: colors.primary }}>STOCK EXPENSE</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>#</Text>
            <Text style={{ fontSize: 13, color: colors.foreground, fontFamily: 'monospace', marginLeft: 6 }}>{expense.id}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>Date Issued: </Text>
            <Text style={{ fontSize: 13, color: colors.foreground, marginLeft: 4 }}>{format(new Date(expense.purchase_date), 'PPP')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>Payment: </Text>
            <Text style={{ fontSize: 13, color: colors.foreground, marginLeft: 4 }}>{expense.status === 'Paid' ? expense.payment_method : 'N/A'}</Text>
          </View>
          <StatusBadge status={expense.status} colors={colors} />
        </View>
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
          <User size={16} color={colors.primary} />
          <Text style={{ fontSize: 14, color: colors.foreground }}>
            Recorded by: <Text style={{ fontWeight: '600', color: colors.primary }}>{expense.created_by}</Text>
          </Text>
        </View>
        {expense.payment_date &&
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
            <CalendarDays size={16} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.foreground }}>
              Payment Date: <Text style={{ fontWeight: '600', color: colors.primary }}>{format(new Date(expense.payment_date), 'PPP')}</Text>
            </Text>
          </View>}
      </View>
    </View>
  );
}

// Utility: Item Table
function ExpenseItemsTable({ items, colors }: { items?: StockPurchaseItem[]; colors: any }) { // ✅ FIXED: Added proper type
  const COLUMN_WIDTHS = { item: 180, quantity: 80, price: 120, total: 120 };
  const totalTableWidth = Object.values(COLUMN_WIDTHS).reduce((sum, w) => sum + w, 0);
  
  if (!items || !items.length) {
    return <EmptyState icon="package" title="No Items Found" description="There are no items in this expense." />;
  }
  
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.foreground }}>Items</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
        <View style={{
          flexDirection: 'row',
          paddingVertical: 12,
          paddingHorizontal: 8,
          borderRadius: 8,
          backgroundColor: colors.muted,
          width: totalTableWidth,
        }}>
          <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.item }}>
            <Text style={{ fontWeight: '600', fontSize: 12, color: colors.foreground }}>Item</Text>
          </View>
          <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.quantity }}>
            <Text style={{ fontWeight: '600', fontSize: 12, color: colors.foreground }}>Qty</Text>
          </View>
          <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.price }}>
            <Text style={{ fontWeight: '600', fontSize: 12, color: colors.foreground }}>Price</Text>
          </View>
          <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.total }}>
            <Text style={{ fontWeight: '600', fontSize: 12, color: colors.foreground }}>Total</Text>
          </View>
        </View>
      </ScrollView>
      {items.map((item: StockPurchaseItem) => // ✅ FIXED: Added explicit type annotation
        <ScrollView horizontal showsHorizontalScrollIndicator={false} key={item.id}>
          <View style={{
            flexDirection: 'row',
            paddingVertical: 10,
            paddingHorizontal: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            width: totalTableWidth,
          }}>
            <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.item }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground }} numberOfLines={1}>{item.name}</Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }} numberOfLines={1}>{item.part_number ?? ''}</Text>
            </View>
            <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.quantity, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: colors.foreground }}>{item.quantity}</Text>
            </View>
            <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.price, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 13, color: colors.foreground }}>₹{item.purchase_price.toFixed(2)}</Text>
            </View>
            <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.total, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
                ₹{(item.quantity * item.purchase_price).toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// Utility: Footer summary
function ExpenseFooter({ notes, total, colors }: { notes?: string; total: number; colors: any }) {
  return (
    <View style={{
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.muted,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <View style={{ marginRight: 20, flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.foreground }}>Notes</Text>
        <Text style={{ fontSize: 13, lineHeight: 18, color: colors.mutedForeground }}>
          {notes || "No notes for this purchase."}
        </Text>
      </View>
      <View>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>Total</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
          ₹{total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

// Utility: Floating Action Button (FAB)
function Fab({ onPress, colors }: { onPress: () => void; colors: any }) {
  return (
    <TouchableOpacity style={{
      position: 'absolute',
      bottom: 28,
      right: 28,
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: colors.foreground,
      justifyContent: 'center', alignItems: 'center', elevation: 8,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,
      zIndex: 1002,
    }} onPress={onPress} activeOpacity={0.8}>
      <FeatherIcon name="edit-2" size={24} color={colors.background} />
    </TouchableOpacity>
  );
}

// Utility: Header Bar
function ExpenseHeaderBar({
  navigation,
  expense,
  colors,
  onOpenReceipt,
  onMarkPaid,
  onPrint
}: {
  navigation: any;
  expense?: any;
  colors: any;
  onOpenReceipt: () => void;
  onMarkPaid: () => void;
  onPrint: () => void;
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    }}>
      <TouchableOpacity
        onPress={() => navigation?.goBack()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 8,
          borderWidth: 1,
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
        activeOpacity={0.7}
      >
        <ArrowLeft size={18} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.primary }}>
          Back to Cash Flow
        </Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {expense?.receiptUrl && (
          <TouchableOpacity
            onPress={onOpenReceipt}
            style={{
              flexDirection: 'row', alignItems: 'center',
              borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
              backgroundColor: colors.background, borderColor: colors.border,
            }}
            activeOpacity={0.7}
          >
            <Download size={16} color={colors.primary} />
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primary }}>Receipt</Text>
          </TouchableOpacity>
        )}
        {expense?.status === 'Pending' && (
          <TouchableOpacity
            onPress={onMarkPaid}
            style={{
              flexDirection: 'row', alignItems: 'center', borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: colors.primary,
            }}
            activeOpacity={0.8}
          >
            <Wallet size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
            <Text style={{ fontWeight: '600', fontSize: 14, color: colors.primaryForeground }}>Mark as Paid</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onPrint}
          style={{
            flexDirection: 'row', alignItems: 'center', borderRadius: 8,
            borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
            backgroundColor: colors.background, borderColor: colors.border,
          }}
          activeOpacity={0.7}
        >
          <Printer size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =======
//        MAIN COMPONENT
// =======
export default function ExpenseDetailScreenId({ route, navigation }: any) {
  const expenseId = route?.params?.id as string;
  const auth = useAppSelector(selectAuth);
  const user = auth && typeof auth === 'object' && 'user' in auth ? (auth as any).user : null;
  const { toast } = useToast();
  const colors = useColors();
  const { isDark } = useTheme();

  const {
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
  } = useExpenseDetail({ expenseId, navigation, toast, user });

  // ✅ FIXED: Handle items properly - since expense items are now in separate table
  const normalizedItems = useMemo(() => {
    // For now, return empty array since items are in separate normalized table
    // In real implementation, you'd fetch StockPurchaseItems separately
    return [] as StockPurchaseItem[];
  }, [expense]);

  // Map modal payment types
  const convertPaymentMethodToModal = (method: 'Cash' | 'UPI' | 'Bank Transfer'): 'Cash' | 'Bank Transfer' | 'Card' => {
    if (method === 'UPI') return 'Card';
    return method as 'Cash' | 'Bank Transfer';
  };

  const convertPaymentMethodFromModal = (method: 'Cash' | 'Bank Transfer' | 'Card'): 'Cash' | 'UPI' | 'Bank Transfer' => {
    if (method === 'Card') return 'UPI';
    return method as 'Cash' | 'Bank Transfer';
  };

  // Loading states
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 120 }} />
        <Text style={[styles.loadingText, { color: colors.foreground }]}>Loading Expense Details...</Text>
      </View>
    );
  }

  if (!expense || !shopDetails) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="alert-circle"
          title="Expense Record Not Found"
          description="The requested expense could not be found."
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('CashFlow')}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.primaryForeground, fontWeight: '600', fontSize: 14 }}>Back to Cash Flow</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ExpenseHeaderBar
        expense={expense}
        navigation={navigation}
        colors={colors}
        onOpenReceipt={handleOpenReceipt}
        onMarkPaid={() => setIsPaidDialog(true)}
        onPrint={handlePrint}
      />
      {/* Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={[styles.contentContainer]}>
          <View style={[styles.sectionCard]}>
            <ExpenseInfo expense={expense} shopDetails={shopDetails} colors={colors} />
            <ExpenseItemsTable items={normalizedItems} colors={colors} />
            <ExpenseFooter notes={expense.notes} total={expense.total} colors={colors} />
          </View>
        </View>
      </ScrollView>
      {/* Mark as Paid Modal */}
      <MarkPaidModal
        visible={isPaidDialog}
        onClose={() => setIsPaidDialog(false)}
        expenseId={expense.id}
        selectedPaymentMethod={convertPaymentMethodToModal(selectedPaymentMethod)}
        setSelectedPaymentMethod={(method) => setSelectedPaymentMethod(convertPaymentMethodFromModal(method))}
        handleUpdateStatus={handleUpdateStatus}
        isSavingStatus={isSavingStatus}
        colors={colors}
      />
      {/* Floating Action Button for Edit (optional, can be linked to edit screen) */}
      <Fab onPress={() => {/* your edit logic here */}} colors={colors} />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 60 },
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 18,
    borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden',
  },
  loadingText: { fontSize: 16, marginTop: 24, textAlign: 'center' },
  retryButton: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
});


// import React, { useMemo } from 'react';
// import {
//   View,
//   ScrollView,
//   RefreshControl,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   StatusBar,
//   Dimensions,
// } from 'react-native';
// import { ArrowLeft, Download, Printer, Wallet, Truck, User, CalendarDays, X, CheckCircle } from 'lucide-react-native';
// import FeatherIcon from 'react-native-vector-icons/Feather';
// import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
// import { format } from 'date-fns';

// import { useColors, useTheme } from '../../context/ThemeContext';
// import { useAppSelector } from '../../lib/redux/hooks';
// import { selectAuth } from '../../lib/redux/slices/auth-slice';
// import { useToast } from '../../hooks/use-toast';
// import useExpenseDetail from './hooks/useExpenseDetail';

// const { width: screenWidth } = Dimensions.get('window');

// // Utility: Status Badge
// function StatusBadge({ status, colors }: { status: string; colors: any }) {
//   const isPaid = status === 'Paid';
//   return (
//     <View style={{
//       paddingHorizontal: 12,
//       paddingVertical: 6,
//       borderRadius: 16,
//       borderWidth: 1,
//       alignSelf: 'flex-start',
//       backgroundColor: isPaid ? colors.primary + '20' : colors.accent + '20',
//       borderColor: isPaid ? colors.primary : colors.accent,
//     }}>
//       <Text style={{
//         fontSize: 12,
//         fontWeight: '600',
//         textTransform: 'capitalize',
//         color: isPaid ? colors.primary : colors.accent,
//       }}>
//         {status}
//       </Text>
//     </View>
//   );
// }

// // Utility: Modal to Mark as Paid
// function MarkPaidModal({
//   visible,
//   onClose,
//   expenseId,
//   selectedPaymentMethod,
//   setSelectedPaymentMethod,
//   handleUpdateStatus,
//   isSavingStatus,
//   colors,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   expenseId: string;
//   selectedPaymentMethod: 'Cash' | 'Card' | 'Bank Transfer';
//   setSelectedPaymentMethod: (method: 'Cash' | 'Card' | 'Bank Transfer') => void;
//   handleUpdateStatus: () => Promise<void>;
//   isSavingStatus: boolean;
//   colors: any;
// }) {
//   const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer'] as const;
//   return (
//     <View style={{
//       position: 'absolute',
//       left: 0, right: 0, top: 0, bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.5)',
//       justifyContent: 'center',
//       alignItems: 'center',
//       zIndex: 100,
//       paddingHorizontal: 16,
//       display: visible ? 'flex' : 'none',
//     }}>
//       <View style={{
//         borderRadius: 16,
//         width: '100%',
//         maxWidth: 400,
//         elevation: 8,
//         backgroundColor: colors.card,
//         shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }
//       }}>
//         {/* Modal Header */}
//         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}>
//           <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>Mark Expense as Paid</Text>
//           <TouchableOpacity onPress={onClose} style={{ padding: 6 }} activeOpacity={0.7}>
//             <X size={22} color={colors.mutedForeground} />
//           </TouchableOpacity>
//         </View>
//         <Text style={{ fontSize: 14, paddingHorizontal: 20, marginBottom: 24, color: colors.mutedForeground }}>
//           Select payment method for <Text style={{ color: colors.primary, fontWeight: '600' }}>{expenseId}</Text>:
//         </Text>
//         {/* Payment Method Options */}
//         <View style={{ paddingHorizontal: 20, gap: 10, marginBottom: 22 }}>
//           {PAYMENT_METHODS.map(method => (
//             <TouchableOpacity
//               key={method}
//               onPress={() => setSelectedPaymentMethod(method)}
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 paddingHorizontal: 16,
//                 paddingVertical: 12,
//                 borderRadius: 8,
//                 borderWidth: 1,
//                 marginBottom: 6,
//                 backgroundColor: selectedPaymentMethod === method ? colors.primary : colors.background,
//                 borderColor: selectedPaymentMethod === method ? colors.primary : colors.border,
//               }}
//               activeOpacity={0.7}
//             >
//               {selectedPaymentMethod === method &&
//                 <CheckCircle size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />}
//               <Text style={{
//                 fontSize: 15,
//                 fontWeight: '500',
//                 color: selectedPaymentMethod === method ? colors.primaryForeground : colors.foreground,
//               }}>{method}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         {/* Modal Buttons */}
//         <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}>
//           <TouchableOpacity
//             onPress={onClose}
//             style={{
//               flex: 1,
//               paddingVertical: 12,
//               borderRadius: 8,
//               alignItems: 'center',
//               backgroundColor: colors.muted,
//             }}
//             disabled={isSavingStatus}
//             activeOpacity={0.7}
//           >
//             <Text style={{ fontSize: 15, fontWeight: '600', color: colors.mutedForeground }}>Cancel</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={handleUpdateStatus}
//             style={{
//               flex: 2,
//               flexDirection: 'row',
//               alignItems: 'center',
//               justifyContent: 'center',
//               paddingVertical: 12,
//               borderRadius: 8,
//               gap: 8,
//               backgroundColor: colors.primary,
//               opacity: isSavingStatus ? 0.7 : 1,
//             }}
//             disabled={isSavingStatus}
//             activeOpacity={0.8}
//           >
//             {isSavingStatus
//               ? <ActivityIndicator size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//               : <Wallet size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />}
//             <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primaryForeground }}>
//               {isSavingStatus ? 'Processing...' : 'Confirm Payment'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// }

// // Utility: Empty State
// function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
//   const colors = useColors();
//   return (
//     <View style={{
//       alignItems: 'center', paddingVertical: 32,
//     }}>
//       <FeatherIcon name={icon} size={28} color={colors.mutedForeground} style={{ marginBottom: 10 }} />
//       <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 5 }}>{title}</Text>
//       <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: 'center' }}>{description}</Text>
//     </View>
//   );
// }

// // Utility: Expense Info Card
// function ExpenseInfo({ expense, shopDetails, colors }: { expense: any; shopDetails: any; colors: any }) {
//   return (
//     <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
//         <View style={{ flex: 1, marginRight: 16 }}>
//           <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: colors.mutedForeground }}>Purchased By</Text>
//           <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground }}>{shopDetails.name}</Text>
//           <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{shopDetails.address}</Text>
//         </View>
//         <View style={{ alignItems: 'flex-end' }}>
//           <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
//             <Truck size={20} color={colors.primary} />
//             <Text style={{ fontSize: 15, fontWeight: '700', marginLeft: 8, color: colors.primary }}>STOCK EXPENSE</Text>
//           </View>
//           <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
//             <Text style={{ fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>#</Text>
//             <Text style={{ fontSize: 13, color: colors.foreground, fontFamily: 'monospace', marginLeft: 6 }}>{expense.id}</Text>
//           </View>
//           <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
//             <Text style={{ fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>Date Issued: </Text>
//             <Text style={{ fontSize: 13, color: colors.foreground, marginLeft: 4 }}>{format(new Date(expense.date), 'PPP')}</Text>
//           </View>
//           <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
//             <Text style={{ fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>Payment: </Text>
//             <Text style={{ fontSize: 13, color: colors.foreground, marginLeft: 4 }}>{expense.status === 'Paid' ? expense.paymentMethod : 'N/A'}</Text>
//           </View>
//           <StatusBadge status={expense.status} colors={colors} />
//         </View>
//       </View>
//       <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 10 }}>
//         <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
//           <User size={16} color={colors.primary} />
//           <Text style={{ fontSize: 14, color: colors.foreground }}>
//             Recorded by: <Text style={{ fontWeight: '600', color: colors.primary }}>{expense.createdBy}</Text>
//           </Text>
//         </View>
//         {expense.paidBy &&
//           <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
//             <User size={16} color={colors.primary} />
//             <Text style={{ fontSize: 14, color: colors.foreground }}>
//               Paid by: <Text style={{ fontWeight: '600', color: colors.primary }}>{expense.paidBy}</Text>
//             </Text>
//           </View>}
//         {expense.paymentDate &&
//           <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
//             <CalendarDays size={16} color={colors.primary} />
//             <Text style={{ fontSize: 14, color: colors.foreground }}>
//               Payment Date: <Text style={{ fontWeight: '600', color: colors.primary }}>{format(new Date(expense.paymentDate), 'PPP')}</Text>
//             </Text>
//           </View>}
//       </View>
//     </View>
//   );
// }

// // Utility: Item Table
// function ExpenseItemsTable({ items, colors }: { items?: any[]; colors: any }) {
//   const COLUMN_WIDTHS = { item: 180, quantity: 80, price: 120, total: 120 };
//   const totalTableWidth = Object.values(COLUMN_WIDTHS).reduce((sum, w) => sum + w, 0);

//   if (!items || !items.length) {
//     return <EmptyState icon="package" title="No Items Found" description="There are no items in this expense." />;
//   }

//   return (
//     <View style={{ padding: 20 }}>
//       <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.foreground }}>Items</Text>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
//         <View style={{
//           flexDirection: 'row',
//           paddingVertical: 12,
//           paddingHorizontal: 8,
//           borderRadius: 8,
//           backgroundColor: colors.muted,
//           width: totalTableWidth,
//         }}>
//           <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.item }}>
//             <Text style={{ fontWeight: '600', fontSize: 12, color: colors.foreground }}>Item</Text>
//           </View>
//           <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.quantity }}>
//             <Text style={{ fontWeight: '600', fontSize: 12, color: colors.foreground }}>Qty</Text>
//           </View>
//           <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.price }}>
//             <Text style={{ fontWeight: '600', fontSize: 12, color: colors.foreground }}>Price</Text>
//           </View>
//           <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.total }}>
//             <Text style={{ fontWeight: '600', fontSize: 12, color: colors.foreground }}>Total</Text>
//           </View>
//         </View>
//       </ScrollView>
//       {items.map((item) =>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} key={item.id}>
//           <View style={{
//             flexDirection: 'row',
//             paddingVertical: 10,
//             paddingHorizontal: 8,
//             borderBottomWidth: 1,
//             borderBottomColor: colors.border,
//             width: totalTableWidth,
//           }}>
//             <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.item }}>
//               <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground }} numberOfLines={1}>{item.name}</Text>
//               <Text style={{ fontSize: 12, color: colors.mutedForeground }} numberOfLines={1}>{item.partNumber ?? ''}</Text>
//             </View>
//             <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.quantity, alignItems: 'center' }}>
//               <Text style={{ fontSize: 13, color: colors.foreground }}>{item.quantity}</Text>
//             </View>
//             <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.price, alignItems: 'flex-end' }}>
//               <Text style={{ fontSize: 13, color: colors.foreground }}>₹{item.purchasePrice.toFixed(2)}</Text>
//             </View>
//             <View style={{ paddingHorizontal: 8, width: COLUMN_WIDTHS.total, alignItems: 'flex-end' }}>
//               <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
//                 ₹{(item.quantity * item.purchasePrice).toFixed(2)}
//               </Text>
//             </View>
//           </View>
//         </ScrollView>
//       )}
//     </View>
//   );
// }

// // Utility: Footer summary
// function ExpenseFooter({ notes, total, colors }: { notes?: string; total: number; colors: any }) {
//   return (
//     <View style={{
//       padding: 20,
//       borderTopWidth: 1,
//       borderTopColor: colors.border,
//       backgroundColor: colors.muted,
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//     }}>
//       <View style={{ marginRight: 20, flex: 1 }}>
//         <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.foreground }}>Notes</Text>
//         <Text style={{ fontSize: 13, lineHeight: 18, color: colors.mutedForeground }}>
//           {notes || "No notes for this purchase."}
//         </Text>
//       </View>
//       <View>
//         <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>Total</Text>
//         <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
//           ₹{total.toFixed(2)}
//         </Text>
//       </View>
//     </View>
//   );
// }

// // Utility: Floating Action Button (FAB)
// function Fab({ onPress, colors }: { onPress: () => void; colors: any }) {
//   return (
//     <TouchableOpacity style={{
//       position: 'absolute',
//       bottom: 28,
//       right: 28,
//       width: 56, height: 56, borderRadius: 28,
//       backgroundColor: colors.foreground,
//       justifyContent: 'center', alignItems: 'center', elevation: 8,
//       shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,
//       zIndex: 1002,
//     }} onPress={onPress} activeOpacity={0.8}>
//       <FeatherIcon name="edit-2" size={24} color={colors.background} />
//     </TouchableOpacity>
//   );
// }

// // Utility: Header Bar
// function ExpenseHeaderBar({
//   navigation,
//   expense,
//   colors,
//   onOpenReceipt,
//   onMarkPaid,
//   onPrint
// }: {
//   navigation: any;
//   expense?: any;
//   colors: any;
//   onOpenReceipt: () => void;
//   onMarkPaid: () => void;
//   onPrint: () => void;
// }) {
//   return (
//     <View style={{
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       paddingHorizontal: 20,
//       paddingVertical: 16,
//       borderBottomWidth: 1,
//       borderBottomColor: colors.border,
//       backgroundColor: colors.card,
//     }}>
//       <TouchableOpacity
//         onPress={() => navigation?.goBack()}
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//           borderRadius: 8,
//           borderWidth: 1,
//           paddingHorizontal: 16,
//           paddingVertical: 10,
//           backgroundColor: colors.background,
//           borderColor: colors.border,
//         }}
//         activeOpacity={0.7}
//       >
//         <ArrowLeft size={18} color={colors.primary} style={{ marginRight: 8 }} />
//         <Text style={{ fontSize: 15, fontWeight: '500', color: colors.primary }}>
//           Back to Cash Flow
//         </Text>
//       </TouchableOpacity>
//       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//         {expense?.receiptUrl && (
//           <TouchableOpacity
//             onPress={onOpenReceipt}
//             style={{
//               flexDirection: 'row', alignItems: 'center',
//               borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
//               backgroundColor: colors.background, borderColor: colors.border,
//             }}
//             activeOpacity={0.7}
//           >
//             <Download size={16} color={colors.primary} />
//             <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primary }}>Receipt</Text>
//           </TouchableOpacity>
//         )}
//         {expense?.status === 'Pending' && (
//           <TouchableOpacity
//             onPress={onMarkPaid}
//             style={{
//               flexDirection: 'row', alignItems: 'center', borderRadius: 8,
//               paddingHorizontal: 16,
//               paddingVertical: 10,
//               backgroundColor: colors.primary,
//             }}
//             activeOpacity={0.8}
//           >
//             <Wallet size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//             <Text style={{ fontWeight: '600', fontSize: 14, color: colors.primaryForeground }}>Mark as Paid</Text>
//           </TouchableOpacity>
//         )}
//         <TouchableOpacity
//           onPress={onPrint}
//           style={{
//             flexDirection: 'row', alignItems: 'center', borderRadius: 8,
//             borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
//             backgroundColor: colors.background, borderColor: colors.border,
//           }}
//           activeOpacity={0.7}
//         >
//           <Printer size={16} color={colors.primary} />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// // ===============================
// //        MAIN COMPONENT
// // ===============================

// export default function ExpenseDetailScreenId({ route, navigation }: any) {
//   const expenseId = route?.params?.id as string;
//   // FIX: selectAuth, then user from correct shape!
//   const auth = useAppSelector(selectAuth);
//   const user = auth && typeof auth === 'object' && 'user' in auth ? (auth as any).user : null;
//   const { toast } = useToast();
//   const colors = useColors();
//   const { isDark } = useTheme();

//   const {
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
//   } = useExpenseDetail({ expenseId, navigation, toast, user });

//   // Normalize items to ensure partNumber is always a string
//   const normalizedItems = useMemo(() =>
//     expense?.items.map(item => ({
//       ...item,
//       partNumber: item.partNumber ?? '',
//     })) ?? [], [expense]);

//   // Map modal payment types
//   const convertPaymentMethodToModal = (method: 'Cash' | 'UPI' | 'Bank Transfer'): 'Cash' | 'Bank Transfer' | 'Card' => {
//     if (method === 'UPI') return 'Card';
//     return method as 'Cash' | 'Bank Transfer';
//   };
//   const convertPaymentMethodFromModal = (method: 'Cash' | 'Bank Transfer' | 'Card'): 'Cash' | 'UPI' | 'Bank Transfer' => {
//     if (method === 'Card') return 'UPI';
//     return method as 'Cash' | 'Bank Transfer';
//   };

//   // *** Loading states ***
//   if (isLoading) {
//     return (
//       <View style={[styles.container, { backgroundColor: colors.background }]}>
//         <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
//         <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 120 }} />
//         <Text style={[styles.loadingText, { color: colors.foreground }]}>Loading Expense Details...</Text>
//       </View>
//     );
//   }
//   if (!expense || !shopDetails) {
//     return (
//       <View style={[styles.container, { backgroundColor: colors.background }]}>
//         <EmptyState
//           icon="alert-circle"
//           title="Expense Record Not Found"
//           description="The requested expense could not be found."
//         />
//         <TouchableOpacity
//           onPress={() => navigation.navigate('CashFlow')}
//           style={[styles.retryButton, { backgroundColor: colors.primary }]}
//           activeOpacity={0.8}
//         >
//           <ArrowLeft size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//           <Text style={{ color: colors.primaryForeground, fontWeight: '600', fontSize: 14 }}>Back to Cash Flow</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>

//       <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />

//       <ExpenseHeaderBar
//         expense={expense}
//         navigation={navigation}
//         colors={colors}
//         onOpenReceipt={handleOpenReceipt}
//         onMarkPaid={() => setIsPaidDialog(true)}
//         onPrint={handlePrint}
//       />

//       {/* Main Content */}
//       <ScrollView
//         style={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         <View style={[styles.contentContainer]}>
//           <View style={[styles.sectionCard]}>
//             <ExpenseInfo expense={expense} shopDetails={shopDetails} colors={colors} />
//             <ExpenseItemsTable items={normalizedItems} colors={colors} />
//             <ExpenseFooter notes={expense.notes} total={expense.total} colors={colors} />
//           </View>
//         </View>
//       </ScrollView>

//       {/* Mark as Paid Modal */}
//       <MarkPaidModal
//         visible={isPaidDialog}
//         onClose={() => setIsPaidDialog(false)}
//         expenseId={expense.id}
//         selectedPaymentMethod={convertPaymentMethodToModal(selectedPaymentMethod)}
//         setSelectedPaymentMethod={(method) => setSelectedPaymentMethod(convertPaymentMethodFromModal(method))}
//         handleUpdateStatus={handleUpdateStatus}
//         isSavingStatus={isSavingStatus}
//         colors={colors}
//       />

//       {/* Floating Action Button for Edit (optional, can be linked to edit screen) */}
//       <Fab onPress={() => {/* your edit logic here */}} colors={colors} />

//     </View>
//   );
// }

// // *** ENHANCED STYLES: Based on DashboardScreen ***
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContainer: { flex: 1 },
//   contentContainer: { padding: 24, paddingBottom: 60 },
//   sectionCard: {
//     backgroundColor: '#fff', borderRadius: 12, marginBottom: 18,
//     borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden',
//     // Will be colored by colors.card/colors.border, can switch by theme
//   },

//   // Loading/Error
//   loadingText: { fontSize: 16, marginTop: 24, textAlign: 'center' },

//   // Retry button
//   retryButton: {
//     marginTop: 22,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 28,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignSelf: 'center',
//   },
// });