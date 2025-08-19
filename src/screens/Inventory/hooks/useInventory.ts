// src/hooks/useInventory.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ToastInput } from '../../../hooks/use-toast';
import type { Part } from '../../../types/database';
import { partService } from '../../../services/part-service';

export type SortKey = keyof Part;
export type SortDirection = 'ascending' | 'descending';

const ITEMS_PER_PAGE = 8;
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

const dataCache = {
  parts: null as Part[] | null,
  lastFetch: 0,
};

export default function useInventory(toast: (p: ToastInput) => void) {
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'active' | 'inactive'>('active');
  const [activeStockFilter, setActiveStockFilter] = useState<'all' | 'in-stock' | 'low' | 'out-of-stock'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({
    key: 'name',
    direction: 'ascending',
  });

  const loadParts = useCallback(
    async (showLoading = true) => {
      const now = Date.now();
      const isCacheValid = now - dataCache.lastFetch < CACHE_DURATION;

      if (isCacheValid && dataCache.parts) {
        setParts(dataCache.parts);
        if (showLoading) setIsLoading(false);
        return;
      }

      if (showLoading) setIsLoading(true);
      try {
        const fetched = await partService.findAll();
        dataCache.parts = fetched;
        dataCache.lastFetch = now;
        setParts(fetched);
      } catch (err: any) {
        const error = err as { message: string; stack?: string };
        console.error('[useInventory] Error loading parts:', {
          message: error.message || 'Unknown error',
          stack: error.stack,
          details: JSON.stringify(error, null, 2),
        });
        toast({ title: 'Error', description: 'Could not fetch inventory.', variant: 'destructive' });
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    let stale = false;
    loadParts(true);
    return () => {
      stale = true;
    };
  }, [loadParts]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    try {
      dataCache.lastFetch = 0; // Invalidate cache
      await loadParts(false);
      toast({
        title: 'Refreshed',
        description: 'Inventory data updated successfully.',
        variant: 'default',
      });
    } catch (err: any) {
      const error = err as { message: string; stack?: string };
      console.error('[useInventory] Error refreshing parts:', {
        message: error.message || 'Unknown error',
        stack: error.stack,
        details: JSON.stringify(error, null, 2),
      });
      toast({
        title: 'Error',
        description: 'Failed to refresh inventory.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [loadParts, toast]);

  const sortedAndFilteredParts = useMemo(() => {
    let filtered = parts.filter((p) => p.status === activeView);

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.part_number.toLowerCase().includes(lower)
      );
    }

    if (activeView === 'active') {
      if (activeStockFilter === 'low') 
        filtered = filtered.filter((p) => p.quantity > 0 && p.quantity <= (p.min_stock_level || 10));
      else if (activeStockFilter === 'in-stock') 
        filtered = filtered.filter((p) => p.quantity > (p.min_stock_level || 10));
      else if (activeStockFilter === 'out-of-stock') 
        filtered = filtered.filter((p) => p.quantity === 0);
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key] as any;
        const bVal = b[sortConfig.key] as any;
        
        // ✅ FIXED: Use === instead of = for comparison
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
        }
        
        // ✅ FIXED: Use === instead of = for comparison
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'ascending' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        
        return 0;
      });
    }

    return filtered;
  }, [parts, searchTerm, activeView, activeStockFilter, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredParts.length / ITEMS_PER_PAGE);
  const paginatedParts = sortedAndFilteredParts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeletePart = useCallback(
    async (id: string) => {
      try {
        await partService.update(id, { status: 'inactive' });
        setParts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'inactive' } : p)));
        toast({ title: 'Part Deactivated', description: 'Moved to inactive items list.', variant: 'destructive' });
      } catch (err: any) {
        const error = err as { message: string; stack?: string };
        console.error('[useInventory] Error deactivating part:', {
          message: error.message || 'Unknown error',
          stack: error.stack,
          details: JSON.stringify(error, null, 2),
        });
        toast({ title: 'Error', description: 'Failed to deactivate part.', variant: 'destructive' });
      }
    },
    [toast]
  );

  const handleRestorePart = useCallback(
    async (id: string) => {
      try {
        await partService.update(id, { status: 'active' });
        setParts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'active' } : p)));
        toast({ title: 'Part Restored', description: 'Restored to active inventory.', variant: 'default' });
      } catch (err: any) {
        const error = err as { message: string; stack?: string };
        console.error('[useInventory] Error restoring part:', {
          message: error.message || 'Unknown error',
          stack: error.stack,
          details: JSON.stringify(error, null, 2),
        });
        toast({ title: 'Error', description: 'Failed to restore part.', variant: 'destructive' });
      }
    },
    [toast]
  );

  return {
    parts: paginatedParts,
    isLoading,
    isRefreshing,
    onRefresh,
    searchTerm,
    setSearchTerm,
    activeView,
    setActiveView: setActiveView as (view: 'active' | 'inactive') => void,
    activeStockFilter,
    setActiveStockFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    sortConfig,
    setSortConfig,
    handleDeletePart,
    handleRestorePart,
  };
}













// import { useState, useEffect, useMemo, useCallback } from 'react';
// import type { ToastInput } from '../../../hooks/use-toast';
// import type { Part } from '../../../types';
// import { deletePart, getParts, restorePart } from '../../../services/part-service';

// export type SortKey = keyof Part;
// export type SortDirection = 'ascending' | 'descending';

// const ITEMS_PER_PAGE = 8;
// const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// const dataCache = {
//   parts: null as Part[] | null,
//   lastFetch: 0,
// };

// export default function useInventory(toast: (p: ToastInput) => void) {
//   const [parts, setParts] = useState<Part[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeView, setActiveView] = useState<'active' | 'deleted'>('active');
//   const [activeStockFilter, setActiveStockFilter] = useState<'all' | 'in-stock' | 'low' | 'out-of-stock'>('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({
//     key: 'name',
//     direction: 'ascending',
//   });

//   const loadParts = useCallback(
//     async (showLoading = true) => {
//       const now = Date.now();
//       const isCacheValid = now - dataCache.lastFetch < CACHE_DURATION;

//       if (isCacheValid && dataCache.parts) {
//         setParts(dataCache.parts);
//         if (showLoading) setIsLoading(false);
//         return;
//       }

//       if (showLoading) setIsLoading(true);
//       try {
//         const fetched = await getParts();
//         dataCache.parts = fetched;
//         dataCache.lastFetch = now;
//         setParts(fetched);
//       } catch (err: any) {
//         const error = err as { message: string; stack?: string };
//         console.error('[useInventory] Error loading parts:', {
//           message: error.message || 'Unknown error',
//           stack: error.stack,
//           details: JSON.stringify(error, null, 2),
//         });
//         toast({ title: 'Error', description: 'Could not fetch inventory.', variant: 'destructive' });
//       } finally {
//         if (showLoading) setIsLoading(false);
//       }
//     },
//     [toast]
//   );

//   useEffect(() => {
//     let stale = false;
//     loadParts(true);
//     return () => {
//       stale = true;
//     };
//   }, [loadParts]);

//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     setCurrentPage(1);
//     try {
//       dataCache.lastFetch = 0; // Invalidate cache
//       await loadParts(false);
//       toast({
//         title: 'Refreshed',
//         description: 'Inventory data updated successfully.',
//         variant: 'default',
//       });
//     } catch (err: any) {
//       const error = err as { message: string; stack?: string };
//       console.error('[useInventory] Error refreshing parts:', {
//         message: error.message || 'Unknown error',
//         stack: error.stack,
//         details: JSON.stringify(error, null, 2),
//       });
//       toast({
//         title: 'Error',
//         description: 'Failed to refresh inventory.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsRefreshing(false);
//     }
//   }, [loadParts, toast]);

//   const sortedAndFilteredParts = useMemo(() => {
//     let filtered = parts.filter((p) => p.status === activeView);

//     if (searchTerm.trim()) {
//       const lower = searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (p) =>
//           p.name.toLowerCase().includes(lower) ||
//           p.partNumber.toLowerCase().includes(lower) ||
//           (p.supplierName?.toLowerCase().includes(lower) ?? false)
//       );
//     }

//     if (activeView === 'active') {
//       if (activeStockFilter === 'low') filtered = filtered.filter((p) => p.isLowStock && p.quantity > 0);
//       else if (activeStockFilter === 'in-stock') filtered = filtered.filter((p) => !p.isLowStock && p.quantity > 0);
//       else if (activeStockFilter === 'out-of-stock') filtered = filtered.filter((p) => p.quantity === 0);
//     }

//     if (sortConfig) {
//       filtered.sort((a, b) => {
//         const aVal = a[sortConfig.key] as any;
//         const bVal = b[sortConfig.key] as any;
//         if (typeof aVal === 'number' && typeof bVal === 'number')
//           return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
//         if (typeof aVal === 'string' && typeof bVal === 'string')
//           return sortConfig.direction === 'ascending' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
//         return 0;
//       });
//     }
//     return filtered;
//   }, [parts, searchTerm, activeView, activeStockFilter, sortConfig]);

//   const totalPages = Math.ceil(sortedAndFilteredParts.length / ITEMS_PER_PAGE);
//   const paginatedParts = sortedAndFilteredParts.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE
//   );

//   const handleDeletePart = useCallback(
//     async (id: string) => {
//       try {
//         await deletePart(id);
//         setParts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'deleted' } : p)));
//         toast({ title: 'Part Deleted', description: 'Moved to deleted items list.', variant: 'destructive' });
//       } catch (err: any) {
//         const error = err as { message: string; stack?: string };
//         console.error('[useInventory] Error deleting part:', {
//           message: error.message || 'Unknown error',
//           stack: error.stack,
//           details: JSON.stringify(error, null, 2),
//         });
//         toast({ title: 'Error', description: 'Failed to delete part.', variant: 'destructive' });
//       }
//     },
//     [toast]
//   );

//   const handleRestorePart = useCallback(
//     async (id: string) => {
//       try {
//         await restorePart(id);
//         setParts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'active' } : p)));
//         toast({ title: 'Part Restored', description: 'Restored to active inventory.', variant: 'default' });
//       } catch (err: any) {
//         const error = err as { message: string; stack?: string };
//         console.error('[useInventory] Error restoring part:', {
//           message: error.message || 'Unknown error',
//           stack: error.stack,
//           details: JSON.stringify(error, null, 2),
//         });
//         toast({ title: 'Error', description: 'Failed to restore part.', variant: 'destructive' });
//       }
//     },
//     [toast]
//   );

//   return {
//     parts: paginatedParts,
//     isLoading,
//     isRefreshing,
//     onRefresh,
//     searchTerm,
//     setSearchTerm,
//     activeView,
//     setActiveView,
//     activeStockFilter,
//     setActiveStockFilter,
//     currentPage,
//     setCurrentPage,
//     totalPages,
//     sortConfig,
//     setSortConfig,
//     handleDeletePart,
//     handleRestorePart,
//   };
// }