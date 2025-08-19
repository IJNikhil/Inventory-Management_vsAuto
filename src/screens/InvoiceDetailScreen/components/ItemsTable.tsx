import React from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { useColors } from '../../../context/ThemeContext';
import type { InvoiceItem } from '../../../types/database';

interface ItemsTableProps {
  items: InvoiceItem[];
}

// Fixed column widths (adjust as per your UI needs)
const COLUMN_WIDTHS = {
  description: 200,
  quantity: 70,
  mrp: 70,
  discount: 80,
  price: 80,
  total: 90,
};

const totalTableWidth = Object.values(COLUMN_WIDTHS).reduce((a, b) => a + b, 0);

export default function ItemsTable({ items }: ItemsTableProps) {
  const colors = useColors();

  // ✅ DEBUG: Log items received
  console.log('📋 ItemsTable received items:', {
    count: items.length,
    items: items.slice(0, 2) // Show first 2 for debugging
  });

  const renderHeader = () => (
    <View style={[styles.tableHeader, { width: totalTableWidth, backgroundColor: colors.card }]}>
      <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.description }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Description</Text>
      </View>
      <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.quantity }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Qty</Text>
      </View>
      <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.mrp }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>MRP</Text>
      </View>
      <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.discount }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Discount</Text>
      </View>
      <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.price }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Price</Text>
      </View>
      <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.total }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Total</Text>
      </View>
    </View>
  );

  const renderRow = ({ item, index }: { item: InvoiceItem; index: number }) => (
    <View
      style={[
        styles.tableRow,
        { width: totalTableWidth, borderBottomColor: colors.border },
        index === items.length - 1 && { borderBottomWidth: 0 },
        { backgroundColor: index % 2 === 0 ? colors.card : colors.background },
      ]}
    >
      <View style={[styles.tableCell, { width: COLUMN_WIDTHS.description }]}>
        <Text style={[styles.cellText, { color: colors.foreground }]} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={[styles.tableCell, { width: COLUMN_WIDTHS.quantity }]}>
        <Text style={[styles.cellText, { color: colors.foreground }]}>
          {item.quantity}
        </Text>
      </View>
      <View style={[styles.tableCell, { width: COLUMN_WIDTHS.mrp }]}>
        <Text style={[styles.cellText, { color: colors.mutedForeground }]}>
          {/* ✅ FIXED: Calculate MRP from unit_price and discount */}
          ₹{(item.unit_price / (1 - item.discount_percentage / 100)).toFixed(2)}
        </Text>
      </View>
      <View style={[styles.tableCell, { width: COLUMN_WIDTHS.discount, flexDirection: 'row', alignItems: 'center' }]}>
        {item.discount_percentage > 0 ? ( // ✅ FIXED: discount_percentage without backslash
          <>
            <Star size={14} color={colors.accent} />
            <Text style={[styles.discountText, { color: colors.accent, marginLeft: 4 }]}>
              {item.discount_percentage.toFixed(1)}%
            </Text>
          </>
        ) : (
          <Text style={[styles.cellText, { color: colors.mutedForeground }]}>-</Text>
        )}
      </View>
      <View style={[styles.tableCell, { width: COLUMN_WIDTHS.price }]}>
        <Text style={[styles.cellText, { color: colors.foreground }]}>
          ₹{item.unit_price.toFixed(2)} {/* ✅ FIXED: unit_price without backslash */}
        </Text>
      </View>
      <View style={[styles.tableCell, { width: COLUMN_WIDTHS.total }]}>
        <Text style={[styles.cellText, { fontWeight: 'bold', color: colors.foreground }]}>
          ₹{item.line_total.toFixed(2)} {/* ✅ FIXED: line_total without backslash */}
        </Text>
      </View>
    </View>
  );

  // ✅ ADDED: Show empty state if no items
  if (!items || items.length === 0) {
    return (
      <View>
        <Text style={[styles.title, { color: colors.foreground }]}>Items (0)</Text>
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No items found for this invoice
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={[styles.title, { color: colors.foreground }]}>Items ({items.length})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {renderHeader()}
          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={renderRow}
            scrollEnabled={false} // let parent ScrollView handle scrolling if needed
            style={{ width: totalTableWidth }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  tableHeaderCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 13,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableCell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cellText: {
    fontSize: 15,
  },
  discountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // ✅ ADDED: Empty state styles
  emptyState: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 18,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});


// import React from 'react';
// import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
// import { Star } from 'lucide-react-native';
// import { useColors } from '../../../context/ThemeContext';
// import { InvoiceItem } from '../../../types';

// interface ItemsTableProps {
//   items: InvoiceItem[];
// }

// // Fixed column widths (adjust as per your UI needs)
// const COLUMN_WIDTHS = {
//   description: 200,
//   quantity: 70,
//   mrp: 70,
//   discount: 80,
//   price: 80,
//   total: 90,
// };

// const totalTableWidth = Object.values(COLUMN_WIDTHS).reduce((a, b) => a + b, 0);

// export default function ItemsTable({ items }: ItemsTableProps) {
//   const colors = useColors();

//   const renderHeader = () => (
//     <View style={[styles.tableHeader, { width: totalTableWidth, backgroundColor: colors.card }]}>
//       <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.description }]}>
//         <Text style={[styles.headerText, { color: colors.foreground }]}>Description</Text>
//       </View>
//       <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.quantity }]}>
//         <Text style={[styles.headerText, { color: colors.foreground }]}>Qty</Text>
//       </View>
//       <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.mrp }]}>
//         <Text style={[styles.headerText, { color: colors.foreground }]}>MRP</Text>
//       </View>
//       <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.discount }]}>
//         <Text style={[styles.headerText, { color: colors.foreground }]}>Discount</Text>
//       </View>
//       <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.price }]}>
//         <Text style={[styles.headerText, { color: colors.foreground }]}>Price</Text>
//       </View>
//       <View style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.total }]}>
//         <Text style={[styles.headerText, { color: colors.foreground }]}>Total</Text>
//       </View>
//     </View>
//   );

//   const renderRow = ({ item, index }: { item: InvoiceItem; index: number }) => (
//     <View
//       style={[
//         styles.tableRow,
//         { width: totalTableWidth, borderBottomColor: colors.border },
//         index === items.length - 1 && { borderBottomWidth: 0 },
//         { backgroundColor: index % 2 === 0 ? colors.card : colors.background },
//       ]}
//     >
//       <View style={[styles.tableCell, { width: COLUMN_WIDTHS.description }]}>
//         <Text style={[styles.cellText, { color: colors.foreground }]} numberOfLines={2}>{item.description}</Text>
//       </View>
//       <View style={[styles.tableCell, { width: COLUMN_WIDTHS.quantity }]}>
//         <Text style={[styles.cellText, { color: colors.foreground }]}>{item.quantity}</Text>
//       </View>
//       <View style={[styles.tableCell, { width: COLUMN_WIDTHS.mrp }]}>
//         <Text style={[styles.cellText, { color: colors.mutedForeground }]}>
//           {item.mrp != null ? `₹${item.mrp.toFixed(2)}` : '-'}
//         </Text>
//       </View>
//       <View style={[styles.tableCell, { width: COLUMN_WIDTHS.discount, flexDirection: 'row', alignItems: 'center' }]}>
//         {item.discount > 0 ? (
//           <>
//             <Star size={14} color={colors.accent} />
//             <Text style={[styles.discountText, { color: colors.accent, marginLeft: 4 }]}>
//               {item.discount.toFixed(1)}%
//               {item.isSpecialDiscount ? ' ⭐' : ''}
//             </Text>
//           </>
//         ) : (
//           <Text style={[styles.cellText, { color: colors.mutedForeground }]}>-</Text>
//         )}
//       </View>
//       <View style={[styles.tableCell, { width: COLUMN_WIDTHS.price }]}>
//         <Text style={[styles.cellText, { color: colors.foreground }]}>₹{item.price.toFixed(2)}</Text>
//       </View>
//       <View style={[styles.tableCell, { width: COLUMN_WIDTHS.total }]}>
//         <Text style={[styles.cellText, { fontWeight: 'bold', color: colors.foreground }]}>
//           ₹{(item.quantity * item.price).toFixed(2)}
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <View>
//       <Text style={[styles.title, { color: colors.foreground }]}>Items ({items.length})</Text>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//         <View>
//           {renderHeader()}
//           <FlatList
//             data={items}
//             keyExtractor={item => item.id}
//             renderItem={renderRow}
//             scrollEnabled={false} // let parent ScrollView handle scrolling if needed
//             style={{ width: totalTableWidth }}
//           />
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     marginLeft:18,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderBottomColor: '#ccc',
//   },
//   tableHeaderCell: {
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     justifyContent: 'center',
//   },
//   headerText: {
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     fontSize: 13,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//   },
//   tableCell: {
//     justifyContent: 'center',
//     paddingHorizontal: 8,
//   },
//   cellText: {
//     fontSize: 15,
//   },
//   discountText: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
// });
