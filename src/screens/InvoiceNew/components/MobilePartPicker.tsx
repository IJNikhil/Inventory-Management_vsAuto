import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import type { Part } from '../../../types/database'; // ✅ FIXED: Use database types

const { height: screenHeight } = Dimensions.get('window');

interface MobilePartPickerProps {
  parts: Part[];
  selectedPartId: string | undefined;
  onSelect: (part: Part) => void;
  disabled?: boolean;
  colors: any;
}

export default function MobilePartPicker({
  parts,
  selectedPartId,
  onSelect,
  disabled,
  colors,
}: MobilePartPickerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const filtered = parts.filter(
    p =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.part_number.toLowerCase().includes(filter.toLowerCase()) // ✅ FIXED: part_number
  );

  const selectedPart = parts.find(p => p.id === selectedPartId);
  const styles = createStyles(colors);

  return (
    <>
      <TouchableOpacity
        style={[styles.selectButton, { opacity: disabled ? 0.5 : 1 }]}
        onPress={() => !disabled && setModalOpen(true)}
        disabled={!!disabled}
        activeOpacity={0.7}
      >
        <View style={styles.selectContent}>
          <Text style={[
            styles.selectText,
            { color: selectedPart ? colors.foreground : colors.mutedForeground }
          ]}>
            {selectedPart
              ? `${selectedPart.name} (${selectedPart.part_number})` // ✅ FIXED: part_number
              : 'Tap to select part...'}
          </Text>
          {selectedPart && (
            <Text style={styles.selectSubtext}>
              Stock: {selectedPart.quantity} | Price: ₹{selectedPart.selling_price} {/* ✅ FIXED: selling_price */}
            </Text>
          )}
        </View>
        <FeatherIcon name="chevron-down" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
      
      {/* IMPROVED: Full screen modal with better UX */}
      <Modal
        visible={modalOpen}
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Part</Text>
            <TouchableOpacity
              onPress={() => setModalOpen(false)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <FeatherIcon name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <FeatherIcon name="search" size={20} color={colors.mutedForeground} style={styles.searchIcon} />
            <TextInput
              placeholder="Search by name or part number..."
              placeholderTextColor={colors.mutedForeground}
              value={filter}
              onChangeText={setFilter}
              style={styles.searchInput}
              autoFocus
            />
            {filter.length > 0 && (
              <TouchableOpacity onPress={() => setFilter('')} style={styles.clearButton}>
                <FeatherIcon name="x-circle" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Parts List */}
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            style={styles.partsList}
            contentContainerStyle={styles.partsListContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.partItem,
                  { 
                    opacity: item.quantity <= 0 ? 0.5 : 1,
                    backgroundColor: selectedPartId === item.id ? colors.muted : colors.card
                  }
                ]}
                onPress={() => { 
                  if (item.quantity > 0) { 
                    onSelect(item); 
                    setModalOpen(false);
                    setFilter(''); // Clear search when selected
                  } 
                }}
                disabled={item.quantity <= 0}
                activeOpacity={0.7}
              >
                <View style={styles.partItemLeft}>
                  <Text style={styles.partName}>
                    {item.name}
                  </Text>
                  <Text style={styles.partNumber}>
                    Part #{item.part_number} {/* ✅ FIXED: part_number */}
                  </Text>
                  <View style={styles.partDetails}>
                    <Text style={styles.partStock}>
                      Stock: {item.quantity}
                    </Text>
                    <Text style={styles.partPrice}>
                      ₹{item.selling_price} {/* ✅ FIXED: selling_price */}
                    </Text>
                  </View>
                </View>
                
                {item.quantity <= 0 && (
                  <View style={styles.outOfStockBadge}>
                    <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                  </View>
                )}
                
                {selectedPartId === item.id && (
                  <FeatherIcon name="check-circle" size={20} color={colors.foreground} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FeatherIcon name="package" size={48} color={colors.mutedForeground} />
                <Text style={styles.emptyTitle}>No Parts Found</Text>
                <Text style={styles.emptyDescription}>
                  {filter ? `No parts match "${filter}"` : 'No parts available'}
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: colors.background,
    minHeight: 56,
  },
  selectContent: {
    flex: 1,
    marginRight: 8,
  },
  selectText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectSubtext: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 50, // Account for status bar
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.foreground,
  },
  closeButton: {
    padding: 8,
  },
  // Search styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.foreground,
  },
  clearButton: {
    padding: 4,
  },
  // Parts list styles
  partsList: {
    flex: 1,
  },
  partsListContent: {
    paddingHorizontal: 20,
  },
  partItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  partItemLeft: {
    flex: 1,
  },
  partName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  partNumber: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 6,
  },
  partDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  partStock: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  partPrice: {
    fontSize: 12,
    color: colors.foreground,
    fontWeight: '600',
  },
  outOfStockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.destructive,
    borderRadius: 4,
    marginRight: 8,
  },
  outOfStockText: {
    fontSize: 10,
    color: colors.background,
    fontWeight: '600',
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});



// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Modal,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import FeatherIcon from 'react-native-vector-icons/Feather';
// import type { Part } from '../../../types';

// const { height: screenHeight } = Dimensions.get('window');

// interface MobilePartPickerProps {
//   parts: Part[];
//   selectedPartId: string | undefined;
//   onSelect: (part: Part) => void;
//   disabled?: boolean;
//   colors: any;
// }

// export default function MobilePartPicker({
//   parts,
//   selectedPartId,
//   onSelect,
//   disabled,
//   colors,
// }: MobilePartPickerProps) {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [filter, setFilter] = useState('');
  
//   const filtered = parts.filter(
//     p =>
//       p.name.toLowerCase().includes(filter.toLowerCase()) ||
//       p.partNumber.toLowerCase().includes(filter.toLowerCase())
//   );
  
//   const selectedPart = parts.find(p => p.id === selectedPartId);

//   const styles = createStyles(colors);

//   return (
//     <>
//       <TouchableOpacity
//         style={[styles.selectButton, { opacity: disabled ? 0.5 : 1 }]}
//         onPress={() => !disabled && setModalOpen(true)}
//         disabled={!!disabled}
//         activeOpacity={0.7}
//       >
//         <View style={styles.selectContent}>
//           <Text style={[
//             styles.selectText,
//             { color: selectedPart ? colors.foreground : colors.mutedForeground }
//           ]}>
//             {selectedPart
//               ? `${selectedPart.name} (${selectedPart.partNumber})`
//               : 'Tap to select part...'}
//           </Text>
//           {selectedPart && (
//             <Text style={styles.selectSubtext}>
//               Stock: {selectedPart.quantity} | Price: ₹{selectedPart.sellingPrice}
//             </Text>
//           )}
//         </View>
//         <FeatherIcon name="chevron-down" size={20} color={colors.mutedForeground} />
//       </TouchableOpacity>
      
//       {/* IMPROVED: Full screen modal with better UX */}
//       <Modal
//         visible={modalOpen}
//         animationType="slide"
//         onRequestClose={() => setModalOpen(false)}
//       >
//         <View style={styles.modalContainer}>
//           {/* Modal Header */}
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Select Part</Text>
//             <TouchableOpacity
//               onPress={() => setModalOpen(false)}
//               style={styles.closeButton}
//               activeOpacity={0.7}
//             >
//               <FeatherIcon name="x" size={24} color={colors.foreground} />
//             </TouchableOpacity>
//           </View>
          
//           {/* Search Input */}
//           <View style={styles.searchContainer}>
//             <FeatherIcon name="search" size={20} color={colors.mutedForeground} style={styles.searchIcon} />
//             <TextInput
//               placeholder="Search by name or part number..."
//               placeholderTextColor={colors.mutedForeground}
//               value={filter}
//               onChangeText={setFilter}
//               style={styles.searchInput}
//               autoFocus
//             />
//             {filter.length > 0 && (
//               <TouchableOpacity onPress={() => setFilter('')} style={styles.clearButton}>
//                 <FeatherIcon name="x-circle" size={20} color={colors.mutedForeground} />
//               </TouchableOpacity>
//             )}
//           </View>
          
//           {/* Parts List */}
//           <FlatList
//             data={filtered}
//             keyExtractor={item => item.id}
//             style={styles.partsList}
//             contentContainerStyle={styles.partsListContent}
//             showsVerticalScrollIndicator={false}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={[
//                   styles.partItem,
//                   { 
//                     opacity: item.quantity <= 0 ? 0.5 : 1,
//                     backgroundColor: selectedPartId === item.id ? colors.muted : colors.card
//                   }
//                 ]}
//                 onPress={() => { 
//                   if (item.quantity > 0) { 
//                     onSelect(item); 
//                     setModalOpen(false);
//                     setFilter(''); // Clear search when selected
//                   } 
//                 }}
//                 disabled={item.quantity <= 0}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.partItemLeft}>
//                   <Text style={styles.partName}>
//                     {item.name}
//                   </Text>
//                   <Text style={styles.partNumber}>
//                     Part #{item.partNumber}
//                   </Text>
//                   <View style={styles.partDetails}>
//                     <Text style={styles.partStock}>
//                       Stock: {item.quantity}
//                     </Text>
//                     <Text style={styles.partPrice}>
//                       ₹{item.sellingPrice}
//                     </Text>
//                   </View>
//                 </View>
                
//                 {item.quantity <= 0 && (
//                   <View style={styles.outOfStockBadge}>
//                     <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
//                   </View>
//                 )}
                
//                 {selectedPartId === item.id && (
//                   <FeatherIcon name="check-circle" size={20} color={colors.foreground} />
//                 )}
//               </TouchableOpacity>
//             )}
//             ListEmptyComponent={
//               <View style={styles.emptyContainer}>
//                 <FeatherIcon name="package" size={48} color={colors.mutedForeground} />
//                 <Text style={styles.emptyTitle}>No Parts Found</Text>
//                 <Text style={styles.emptyDescription}>
//                   {filter ? `No parts match "${filter}"` : 'No parts available'}
//                 </Text>
//               </View>
//             }
//           />
//         </View>
//       </Modal>
//     </>
//   );
// }

// const createStyles = (colors: any) => StyleSheet.create({
//   selectButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 14,
//     backgroundColor: colors.background,
//     minHeight: 56,
//   },
//   selectContent: {
//     flex: 1,
//     marginRight: 8,
//   },
//   selectText: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   selectSubtext: {
//     fontSize: 12,
//     color: colors.mutedForeground,
//     marginTop: 4,
//   },
  
//   // Modal styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: colors.card,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     paddingTop: 50, // Account for status bar
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: colors.foreground,
//   },
//   closeButton: {
//     padding: 8,
//   },
  
//   // Search styles
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 20,
//     marginVertical: 16,
//     paddingHorizontal: 12,
//     backgroundColor: colors.card,
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 8,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 12,
//     fontSize: 16,
//     color: colors.foreground,
//   },
//   clearButton: {
//     padding: 4,
//   },
  
//   // Parts list styles
//   partsList: {
//     flex: 1,
//   },
//   partsListContent: {
//     paddingHorizontal: 20,
//   },
//   partItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: colors.border,
//     marginBottom: 8,
//   },
//   partItemLeft: {
//     flex: 1,
//   },
//   partName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.foreground,
//     marginBottom: 4,
//   },
//   partNumber: {
//     fontSize: 14,
//     color: colors.mutedForeground,
//     marginBottom: 6,
//   },
//   partDetails: {
//     flexDirection: 'row',
//     gap: 16,
//   },
//   partStock: {
//     fontSize: 12,
//     color: colors.mutedForeground,
//     fontWeight: '500',
//   },
//   partPrice: {
//     fontSize: 12,
//     color: colors.foreground,
//     fontWeight: '600',
//   },
//   outOfStockBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     backgroundColor: colors.destructive,
//     borderRadius: 4,
//     marginRight: 8,
//   },
//   outOfStockText: {
//     fontSize: 10,
//     color: colors.background,
//     fontWeight: '600',
//   },
  
//   // Empty state
//   emptyContainer: {
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: colors.foreground,
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyDescription: {
//     fontSize: 14,
//     color: colors.mutedForeground,
//     textAlign: 'center',
//   },
// });
