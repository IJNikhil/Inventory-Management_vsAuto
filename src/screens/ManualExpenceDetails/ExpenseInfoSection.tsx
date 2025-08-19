import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Truck, User, CalendarDays } from 'lucide-react-native';
import { format } from 'date-fns';
import { useColors } from '../../context/ThemeContext';
import { styles } from './ExpenseDetailStyles';
import type { StockPurchase, ShopSettings, Supplier } from '../../types/database';
import { StatusBadge } from './StatusBadge';

interface ExpenseInfoSectionProps {
  expense: StockPurchase;
  shopDetails: ShopSettings;
  supplier?: Supplier; // ✅ FIXED: Made optional (undefined instead of null)
}

export function ExpenseInfoSection({ expense, shopDetails, supplier }: ExpenseInfoSectionProps) {
  const colors = useColors();
  
  return (
    <View style={[styles.cardSection, { borderBottomColor: colors.border }]}>
      <View style={styles.headerInfo}>
        <View style={styles.companyInfo}>
          <View style={styles.infoBlock}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Purchased By</Text>
            <Text style={[styles.companyName, { color: colors.foreground }]}>
              {shopDetails.shop_name}
            </Text>
            <Text style={[styles.address, { color: colors.mutedForeground }]}>
              {shopDetails.address}
            </Text>
          </View>
          
          <View style={styles.infoBlock}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Supplier</Text>
            <Text style={[styles.supplierName, { color: colors.foreground }]}>
              {supplier?.name || 'Unknown Supplier'}
            </Text>
            {supplier?.address && (
              <Text style={[styles.address, { color: colors.mutedForeground }]}>
                {supplier.address}
              </Text>
            )}
            {supplier?.phone && (
              <Text style={[styles.address, { color: colors.mutedForeground }]}>
                {supplier.phone}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.expenseInfo}>
          <View style={styles.expenseHeader}>
            <Truck size={24} color={colors.primary} />
            <Text style={[styles.expenseTitle, { color: colors.primary }]}>
              STOCK EXPENSE
            </Text>
          </View>
          
          <View style={styles.expenseDetails}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>#</Text>
              <Text style={[styles.detailValue, { 
                color: colors.foreground,
                fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' 
              }]}>
                {expense.id}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                Date Issued:
              </Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>
                {format(new Date(expense.purchase_date), 'PPP')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                Payment Method:
              </Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>
                {expense.status === 'Paid' ? expense.payment_method || 'N/A' : 'N/A'} {/* ✅ FIXED: Use title case 'Paid' */}
              </Text>
            </View>
          </View>
          
          <StatusBadge status={expense.status} />
        </View>
      </View>
      {/* People & Payment Info */}
      <View style={[styles.peopleSection, { borderTopColor: colors.border }]}>
        <View style={styles.peopleInfo}>
          <User size={16} color={colors.primary} />
          <Text style={[styles.peopleText, { color: colors.foreground }]}>
            Recorded by: <Text style={[styles.highlight, { color: colors.primary }]}>
              {expense.created_by}
            </Text>
          </Text>
        </View>
        
        {expense.payment_date && (
          <View style={styles.peopleInfo}>
            <User size={16} color={colors.primary} />
            <Text style={[styles.peopleText, { color: colors.foreground }]}>
              Paid by: <Text style={[styles.highlight, { color: colors.primary }]}>
                {expense.created_by}
              </Text>
            </Text>
          </View>
        )}
        
        {expense.payment_date && (
          <View style={styles.peopleInfo}>
            <CalendarDays size={16} color={colors.primary} />
            <Text style={[styles.peopleText, { color: colors.foreground }]}>
              Payment Date: <Text style={[styles.highlight, { color: colors.primary }]}>
                {format(new Date(expense.payment_date), 'PPP')}
              </Text>
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}


// import React from 'react';
// import { View, Text, Platform } from 'react-native';
// import { Truck, User, CalendarDays } from 'lucide-react-native';
// import { format } from 'date-fns';
// import { useColors } from '../../context/ThemeContext';
// import { styles } from './ExpenseDetailStyles';
// import { StockPurchase, ShopDetails } from '../../types';
// import { StatusBadge } from './StatusBadge';


// interface ExpenseInfoSectionProps {
//   expense: StockPurchase;
//   shopDetails: ShopDetails;
// }

// export function ExpenseInfoSection({ expense, shopDetails }: ExpenseInfoSectionProps) {
//   const colors = useColors();

//   return (
//     <View style={[styles.cardSection, { borderBottomColor: colors.border }]}>
//       <View style={styles.headerInfo}>
//         <View style={styles.companyInfo}>
//           <View style={styles.infoBlock}>
//             <Text style={[styles.label, { color: colors.mutedForeground }]}>Purchased By</Text>
//             <Text style={[styles.companyName, { color: colors.foreground }]}>
//               {shopDetails.name}
//             </Text>
//             <Text style={[styles.address, { color: colors.mutedForeground }]}>
//               {shopDetails.address}
//             </Text>
//           </View>
          
//           <View style={styles.infoBlock}>
//             <Text style={[styles.label, { color: colors.mutedForeground }]}>Supplier</Text>
//             <Text style={[styles.supplierName, { color: colors.foreground }]}>
//               {expense.supplier.name}
//             </Text>
//             <Text style={[styles.address, { color: colors.mutedForeground }]}>
//               {expense.supplier.address}
//             </Text>
//             <Text style={[styles.address, { color: colors.mutedForeground }]}>
//               {expense.supplier.phone}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.expenseInfo}>
//           <View style={styles.expenseHeader}>
//             <Truck size={24} color={colors.primary} />
//             <Text style={[styles.expenseTitle, { color: colors.primary }]}>
//               STOCK EXPENSE
//             </Text>
//           </View>
          
//           <View style={styles.expenseDetails}>
//             <View style={styles.detailRow}>
//               <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>#</Text>
//               <Text style={[styles.detailValue, { 
//                 color: colors.foreground,
//                 fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' 
//               }]}>
//                 {expense.id}
//               </Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
//                 Date Issued:
//               </Text>
//               <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                 {format(new Date(expense.date), 'PPP')}
//               </Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
//                 Payment Method:
//               </Text>
//               <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                 {expense.status === 'Paid' ? expense.paymentMethod : 'N/A'}
//               </Text>
//             </View>
//           </View>
          
//           <StatusBadge status={expense.status} />
//         </View>
//       </View>

//       {/* People & Payment Info */}
//       <View style={[styles.peopleSection, { borderTopColor: colors.border }]}>
//         <View style={styles.peopleInfo}>
//           <User size={16} color={colors.primary} />
//           <Text style={[styles.peopleText, { color: colors.foreground }]}>
//             Recorded by: <Text style={[styles.highlight, { color: colors.primary }]}>
//               {expense.createdBy}
//             </Text>
//           </Text>
//         </View>
        
//         {expense.paidBy && (
//           <View style={styles.peopleInfo}>
//             <User size={16} color={colors.primary} />
//             <Text style={[styles.peopleText, { color: colors.foreground }]}>
//               Paid by: <Text style={[styles.highlight, { color: colors.primary }]}>
//                 {expense.paidBy}
//               </Text>
//             </Text>
//           </View>
//         )}
        
//         {expense.paymentDate && (
//           <View style={styles.peopleInfo}>
//             <CalendarDays size={16} color={colors.primary} />
//             <Text style={[styles.peopleText, { color: colors.foreground }]}>
//               Payment Date: <Text style={[styles.highlight, { color: colors.primary }]}>
//                 {format(new Date(expense.paymentDate), 'PPP')}
//               </Text>
//             </Text>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// }
