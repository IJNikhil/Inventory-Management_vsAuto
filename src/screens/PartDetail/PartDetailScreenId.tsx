import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useToast } from '../../hooks/use-toast';
import { useColors } from '../../context/ThemeContext';
import type { Part, Supplier } from '../../types/database'; // ✅ FIXED: Use database types
import { styles } from './part-detail-styles';
import { PartDetailHeader } from './PartDetailHeader';
import { PartDetailSkeleton } from './PartDetailSkeleton';
import { PartDetailsSection } from './PartDetailsSection';
import { PartNotFound } from './PartNotFound';
import { PartStockBadge } from './PartStockBadge';
import { PartTitleSection } from './PartTitleSection';
import { partService } from '../../services/part-service'; // ✅ FIXED: Use correct service
import { supplierService } from '../../services/supplier-service'; // ✅ FIXED: Use correct service

export default function PartDetailScreenId({ route, navigation }: any) {
  const partId = route?.params?.id as string;
  const { toast } = useToast();
  const colors = useColors();
  
  const [part, setPart] = useState<Part | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPartData = useCallback(async (showLoading = true) => {
    if (!partId) return;
    if (showLoading) setIsLoading(true);
    
    try {
      const fetchedPart = await partService.findById(partId); // ✅ FIXED: Use correct service method
      if (fetchedPart) {
        setPart(fetchedPart);
        if (fetchedPart.supplier_id) { // ✅ FIXED: supplier_id
          const partSupplier = await supplierService.findById(fetchedPart.supplier_id); // ✅ FIXED: Use correct service method
          setSupplier(partSupplier || null);
        }
      } else {
        toast({ title: 'Error', description: 'Part not found', variant: 'destructive' });
        navigation.navigate('Inventory');
      }
    } catch (error) {
      console.error('Error loading part data:', error);
      toast({ title: 'Error', description: 'Failed to fetch part details', variant: 'destructive' });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [partId, navigation, toast]);

  useEffect(() => {
    loadPartData(true);
  }, [loadPartData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadPartData(false);
      toast({ title: 'Refreshed', description: 'Part data updated successfully.' });
    } catch (error) {
      console.error('Error refreshing part:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadPartData, toast]);

  if (isLoading) {
    return <PartDetailSkeleton />;
  }

  if (!part) {
    return <PartNotFound onBackPress={() => navigation.navigate('Inventory')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PartDetailHeader onBackPress={() => navigation.goBack()} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
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
          <View style={styles.contentSection}>
            <PartTitleSection part={part} supplier={supplier} />
            <PartDetailsSection part={part} supplier={supplier} />
            <PartStockBadge part={part} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


// import React, { useEffect, useState, useCallback } from 'react';
// import { View, ScrollView, RefreshControl } from 'react-native';
// import { useToast } from '../../hooks/use-toast';
// import { useColors } from '../../context/ThemeContext';
// import { Part, Supplier } from '../../types';
// import { styles } from './part-detail-styles';
// import { PartDetailHeader } from './PartDetailHeader';
// import { PartDetailSkeleton } from './PartDetailSkeleton';
// import { PartDetailsSection } from './PartDetailsSection';
// import { PartNotFound } from './PartNotFound';
// import { PartStockBadge } from './PartStockBadge';
// import { PartTitleSection } from './PartTitleSection';
// import { getPartById } from '../../services/part-service';
// import { getSupplierById } from '../../services/supplier-service';

// export default function PartDetailScreenId({ route, navigation }: any) {
//   const partId = route?.params?.id as string;
//   const { toast } = useToast();
//   const colors = useColors();

//   const [part, setPart] = useState<Part | null>(null);
//   const [supplier, setSupplier] = useState<Supplier | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const loadPartData = useCallback(async (showLoading = true) => {
//     if (!partId) return;
//     if (showLoading) setIsLoading(true);

//     try {
//       const fetchedPart = await getPartById(partId);
//       if (fetchedPart) {
//         setPart(fetchedPart);
//         if (fetchedPart.supplierId) {
//           const partSupplier = await getSupplierById(fetchedPart.supplierId);
//           setSupplier(partSupplier || null);
//         }
//       } else {
//         toast({ title: 'Error', description: 'Part not found', variant: 'destructive' });
//         navigation.navigate('Inventory');
//       }
//     } catch {
//       toast({ title: 'Error', description: 'Failed to fetch part details', variant: 'destructive' });
//     } finally {
//       if (showLoading) setIsLoading(false);
//     }
//   }, [partId, navigation, toast]);

//   useEffect(() => {
//     loadPartData(true);
//   }, [loadPartData]);

//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     try {
//       await loadPartData(false);
//       toast({ title: 'Refreshed', description: 'Part data updated successfully.' });
//     } catch (error) {
//       console.error('Error refreshing part:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   }, [loadPartData, toast]);

//   if (isLoading) {
//     return <PartDetailSkeleton />;
//   }

//   if (!part) {
//     return <PartNotFound onBackPress={() => navigation.navigate('Inventory')} />;
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <PartDetailHeader onBackPress={() => navigation.goBack()} />

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{ padding: 16 }}
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
//           <View style={styles.contentSection}>
//             <PartTitleSection part={part} supplier={supplier} />
//             <PartDetailsSection part={part} supplier={supplier} />
//             <PartStockBadge part={part} />
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }
