import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react-native';
import { useColors } from '../../context/ThemeContext';
import type { Part } from '../../types/database'; // ✅ FIXED: Use database types
import { StockBadgeInfo } from './part';
import { styles } from './part-detail-styles';

interface PartStockBadgeProps {
  part: Part;
}

export function PartStockBadge({ part }: PartStockBadgeProps) {
  const colors = useColors();
  
  const getStockBadge = (): StockBadgeInfo | null => {
    if (part.status === 'inactive') { // ✅ FIXED: 'inactive' instead of 'deleted'
      return {
        text: 'Inactive',
        icon: XCircle,
        backgroundColor: colors.muted,
        borderColor: colors.border,
        iconColor: colors.mutedForeground,
        textColor: colors.mutedForeground,
      };
    }
    
    if (part.quantity === 0) {
      return {
        text: 'Out of Stock',
        icon: XCircle,
        backgroundColor: colors.destructive + '20',
        borderColor: colors.destructive,
        iconColor: colors.destructive,
        textColor: colors.destructive,
      };
    }
    
    // ✅ FIXED: Calculate low stock using min_stock_level instead of isLowStock
    const isLowStock = part.quantity <= (part.min_stock_level || 10);
    if (isLowStock) {
      return {
        text: 'Low Stock',
        icon: AlertTriangle,
        backgroundColor: colors.accent + '20',
        borderColor: colors.accent,
        iconColor: colors.accent,
        textColor: colors.accent,
      };
    }
    
    return {
      text: 'In Stock',
      icon: CheckCircle,
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
      iconColor: colors.primary,
      textColor: colors.primary,
    };
  };

  const stockInfo = getStockBadge();
  if (!stockInfo) return null;

  return (
    <View style={[styles.stockBadge, {
      backgroundColor: stockInfo.backgroundColor,
      borderColor: stockInfo.borderColor,
    }]}>
      <stockInfo.icon size={20} color={stockInfo.iconColor} style={{ marginRight: 8 }} />
      <Text style={[styles.stockText, { color: stockInfo.textColor }]}>
        {part.quantity} units - {stockInfo.text}
      </Text>
    </View>
  );
}


// import React from 'react';
// import { View, Text } from 'react-native';
// import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react-native';
// import { useColors } from '../../context/ThemeContext';
// import type { Part } from '../../types';
// import { StockBadgeInfo } from './part';
// import { styles } from './part-detail-styles';


// interface PartStockBadgeProps {
//   part: Part;
// }

// export function PartStockBadge({ part }: PartStockBadgeProps) {
//   const colors = useColors();

//   const getStockBadge = (): StockBadgeInfo | null => {
//     if (part.status === 'deleted') {
//       return {
//         text: 'Deleted',
//         icon: XCircle,
//         backgroundColor: colors.muted,
//         borderColor: colors.border,
//         iconColor: colors.mutedForeground,
//         textColor: colors.mutedForeground,
//       };
//     }
//     if (part.quantity === 0) {
//       return {
//         text: 'Out of Stock',
//         icon: XCircle,
//         backgroundColor: colors.destructive + '20',
//         borderColor: colors.destructive,
//         iconColor: colors.destructive,
//         textColor: colors.destructive,
//       };
//     }
//     if (part.isLowStock) {
//       return {
//         text: 'Low Stock',
//         icon: AlertTriangle,
//         backgroundColor: colors.accent + '20',
//         borderColor: colors.accent,
//         iconColor: colors.accent,
//         textColor: colors.accent,
//       };
//     }
//     return {
//       text: 'In Stock',
//       icon: CheckCircle,
//       backgroundColor: colors.primary + '20',
//       borderColor: colors.primary,
//       iconColor: colors.primary,
//       textColor: colors.primary,
//     };
//   };

//   const stockInfo = getStockBadge();

//   if (!stockInfo) return null;

//   return (
//     <View style={[styles.stockBadge, {
//       backgroundColor: stockInfo.backgroundColor,
//       borderColor: stockInfo.borderColor,
//     }]}>
//       <stockInfo.icon size={20} color={stockInfo.iconColor} style={{ marginRight: 8 }} />
//       <Text style={[styles.stockText, { color: stockInfo.textColor }]}>
//         {part.quantity} units - {stockInfo.text}
//       </Text>
//     </View>
//   );
// }
