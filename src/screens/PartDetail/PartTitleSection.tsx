import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import type { Part, Supplier } from '../../types/database'; // ✅ FIXED: Use database types
import { styles } from './part-detail-styles';
import { Badge } from '../../components/ui/Badge';

interface PartTitleSectionProps {
  part: Part;
  supplier: Supplier | null;
}

export function PartTitleSection({ part, supplier }: PartTitleSectionProps) {
  const colors = useColors();
  
  return (
    <View style={styles.titleSection}>
      <Text style={[styles.partTitle, { color: colors.foreground }]}>{part.name}</Text>
      <View style={styles.partMeta}>
        <Badge label={part.part_number || 'N/A'} /> {/* ✅ FIXED: part_number */}
        <Text style={[styles.byLabel, { color: colors.mutedForeground }]}>by</Text>
        <Text style={[styles.supplierName, { color: colors.primary }]}>
          {supplier?.name || 'N/A'}
        </Text>
      </View>
    </View>
  );
}


// import React from 'react';
// import { View, Text } from 'react-native';
// import { useColors } from '../../context/ThemeContext';

// import type { Part, Supplier } from '../../types';
// import { styles } from './part-detail-styles';
// import { Badge } from '../../components/ui/Badge';

// interface PartTitleSectionProps {
//   part: Part;
//   supplier: Supplier | null;
// }

// export function PartTitleSection({ part, supplier }: PartTitleSectionProps) {
//   const colors = useColors();

//   return (
//     <View style={styles.titleSection}>
//       <Text style={[styles.partTitle, { color: colors.foreground }]}>{part.name}</Text>
//       <View style={styles.partMeta}>
//         <Badge label={part.partNumber || 'N/A'} />
//         <Text style={[styles.byLabel, { color: colors.mutedForeground }]}>by</Text>
//         <Text style={[styles.supplierName, { color: colors.primary }]}>
//           {supplier?.name || 'N/A'}
//         </Text>
//       </View>
//     </View>
//   );
// }
