import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, Phone, Mail, FileText } from 'lucide-react-native';
import { useColors } from '../../../context/ThemeContext';
import type { InvoiceCustomer, ShopSettings } from '../../../types/database';

interface BillFromToProps {
  shopDetails: ShopSettings | null; // ✅ ENHANCED: Allow null for safety
  customer: InvoiceCustomer | null;   // ✅ ENHANCED: Allow null for safety
}

export default function BillFromTo({ shopDetails, customer }: BillFromToProps) {
  const colors = useColors();

  // ✅ ADDED: Safety checks to prevent rendering errors
  if (!shopDetails || !customer) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Loading billing information...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Bill From */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Bill From</Text>
        <View style={styles.infoBlock}>
          <Text style={[styles.companyName, { color: colors.foreground }]}>
            {shopDetails.shop_name || 'VS Auto'} {/* ✅ FIXED: shop_name without backslashes */}
          </Text>
          
          {shopDetails.address && (
            <View style={styles.infoRow}>
              <MapPin size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                {shopDetails.address}
              </Text>
            </View>
          )}
          
          {shopDetails.phone && (
            <View style={styles.infoRow}>
              <Phone size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                {shopDetails.phone}
              </Text>
            </View>
          )}
          
          {shopDetails.email && (
            <View style={styles.infoRow}>
              <Mail size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                {shopDetails.email}
              </Text>
            </View>
          )}
          
          {shopDetails.tax_number && ( // ✅ FIXED: tax_number without backslashes
            <View style={styles.infoRow}>
              <FileText size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground, fontWeight: '600' }]}>
                Tax ID: {shopDetails.tax_number}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Bill To */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Bill To</Text>
        <View style={styles.infoBlock}>
          <Text style={[styles.customerName, { color: colors.foreground }]}>
            {customer.name || 'Unknown Customer'} {/* ✅ ENHANCED: Fallback for customer name */}
          </Text>
          
          {customer.address && (
            <View style={styles.infoRow}>
              <MapPin size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                {customer.address}
              </Text>
            </View>
          )}
          
          {customer.phone && (
            <View style={styles.infoRow}>
              <Phone size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                {customer.phone}
              </Text>
            </View>
          )}
          
          {customer.email && (
            <View style={styles.infoRow}>
              <Mail size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                {customer.email}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  infoBlock: {
    gap: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 20, // ✅ ADDED: Ensure consistent row height
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12, // ✅ ENHANCED: Better spacing
    opacity: 0.5,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});
 

// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { MapPin, Phone } from 'lucide-react-native';
// import { useColors } from '../../../context/ThemeContext';
// import { InvoiceCustomer, ShopDetails } from '../../../types';

// interface BillFromToProps {
//   shopDetails: ShopDetails;
//   customer: InvoiceCustomer; // Changed from Customer to InvoiceCustomer
// }

// export default function BillFromTo({ shopDetails, customer }: BillFromToProps) {
//   const colors = useColors();

//   return (
//     <View style={styles.container}>
//       {/* Bill From */}
//       <View style={styles.section}>
//         <Text style={[styles.sectionTitle, { color: colors.primary }]}>Bill From</Text>
//         <View style={styles.infoBlock}>
//           <Text style={[styles.companyName, { color: colors.foreground }]}>{shopDetails.name}</Text>
//           <View style={styles.infoRow}>
//             <MapPin size={14} color={colors.mutedForeground} />
//             <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{shopDetails.address}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Phone size={14} color={colors.mutedForeground} />
//             <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{shopDetails.phone}</Text>
//           </View>
//           {shopDetails.email && (
//             <View style={styles.infoRow}>
//               <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{shopDetails.email}</Text>
//             </View>
//           )}
//         </View>
//       </View>

//       {/* Divider */}
//       <View style={[styles.divider, { backgroundColor: colors.border }]} />

//       {/* Bill To */}
//       <View style={styles.section}>
//         <Text style={[styles.sectionTitle, { color: colors.primary }]}>Bill To</Text>
//         <View style={styles.infoBlock}>
//           <Text style={[styles.customerName, { color: colors.foreground }]}>{customer.name}</Text>
//           {customer.address && (
//             <View style={styles.infoRow}>
//               <MapPin size={14} color={colors.mutedForeground} />
//               <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{customer.address}</Text>
//             </View>
//           )}
//           {customer.phone && (
//             <View style={styles.infoRow}>
//               <Phone size={14} color={colors.mutedForeground} />
//               <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{customer.phone}</Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginHorizontal: 16,
//     marginBottom: 8,
//     borderRadius: 16,
//     padding: 20,
//     // Shadow and elevation can be added in parent container
//   },
//   section: {
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//     marginBottom: 12,
//     letterSpacing: 0.5,
//   },
//   infoBlock: {
//     gap: 8,
//   },
//   companyName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
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
// });
