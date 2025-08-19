import React from 'react';
import { View, Text } from 'react-native';
import { Building, Tag, IndianRupee, Percent } from 'lucide-react-native';
import { useColors } from '../../context/ThemeContext';
import type { Part, Supplier } from '../../types/database'; // ✅ FIXED: Use database types
import { styles } from './part-detail-styles';
import { InfoItem } from './InfoItem';

interface PartDetailsSectionProps {
  part: Part;
  supplier: Supplier | null;
}

export function PartDetailsSection({ part, supplier }: PartDetailsSectionProps) {
  const colors = useColors();
  
  return (
    <View style={styles.detailsSection}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Details</Text>
      <View style={styles.detailsGrid}>
        <View style={styles.detailColumn}>
          <InfoItem 
            icon={Building} 
            label="Supplier" 
            value={supplier?.name || 'N/A'} 
          />
        </View>
        <View style={styles.detailColumn}>
          <InfoItem 
            icon={Tag} 
            label="Part Number" 
            value={part.part_number} // ✅ FIXED: part_number
          />
        </View>
        <View style={styles.detailColumn}>
          <InfoItem 
            icon={IndianRupee} 
            label="Purchase Price" 
            value={`₹${part.purchase_price.toFixed(2)}`} // ✅ FIXED: purchase_price
          />
        </View>
        <View style={styles.detailColumn}>
          <InfoItem 
            icon={IndianRupee} 
            label="MRP" 
            value={`₹${part.mrp.toFixed(2)}`} 
          />
        </View>
        <View style={styles.detailColumn}>
          <InfoItem 
            icon={IndianRupee} 
            label="Selling Price" 
            value={`₹${part.selling_price.toFixed(2)}`} // ✅ FIXED: selling_price
            isHighlight={true}
          />
        </View>
        <View style={styles.detailColumn}>
          <InfoItem 
            icon={Percent} 
            label="Discount on MRP" 
            value={part.mrp > 0
              ? `${(((part.mrp - part.selling_price) / part.mrp) * 100).toFixed(1)}%` // ✅ FIXED: selling_price
              : `0%`
            } 
          />
        </View>
      </View>
    </View>
  );
}


// import React from 'react';
// import { View, Text } from 'react-native';
// import { Building, Tag, IndianRupee, Percent } from 'lucide-react-native';
// import { useColors } from '../../context/ThemeContext';

// import type { Part, Supplier } from '../../types';
// import { styles } from './part-detail-styles';
// import { InfoItem } from './InfoItem';

// interface PartDetailsSectionProps {
//   part: Part;
//   supplier: Supplier | null;
// }

// export function PartDetailsSection({ part, supplier }: PartDetailsSectionProps) {
//   const colors = useColors();

//   return (
//     <View style={styles.detailsSection}>
//       <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Details</Text>
//       <View style={styles.detailsGrid}>
//         <View style={styles.detailColumn}>
//           <InfoItem 
//             icon={Building} 
//             label="Supplier" 
//             value={supplier?.name || 'N/A'} 
//           />
//         </View>
//         <View style={styles.detailColumn}>
//           <InfoItem 
//             icon={Tag} 
//             label="Part Number" 
//             value={part.partNumber} 
//           />
//         </View>
//         <View style={styles.detailColumn}>
//           <InfoItem 
//             icon={IndianRupee} 
//             label="Purchase Price" 
//             value={`₹${part.purchasePrice.toFixed(2)}`} 
//           />
//         </View>
//         <View style={styles.detailColumn}>
//           <InfoItem 
//             icon={IndianRupee} 
//             label="MRP" 
//             value={`₹${part.mrp.toFixed(2)}`} 
//           />
//         </View>
//         <View style={styles.detailColumn}>
//           <InfoItem 
//             icon={IndianRupee} 
//             label="Selling Price" 
//             value={`₹${part.sellingPrice.toFixed(2)}`} 
//             isHighlight={true}
//           />
//         </View>
//         <View style={styles.detailColumn}>
//           <InfoItem 
//             icon={Percent} 
//             label="Discount on MRP" 
//             value={part.mrp > 0
//               ? `${(((part.mrp - part.sellingPrice) / part.mrp) * 100).toFixed(1)}%`
//               : `0%`
//             } 
//           />
//         </View>
//       </View>
//     </View>
//   );
// }
