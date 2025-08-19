// src/screens/AddStock/hooks/useStockData.ts
import { useState, useEffect, useCallback } from 'react';
import type { Part, Supplier } from '../../../types/database';
import { partService } from '../../../services/part-service';
import { supplierService } from '../../../services/supplier-service';

export function useStockData() {
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [availableSuppliers, setAvailableSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState(0);

  const loadData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && now - lastFetch < 2000) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // ✅ FIXED: Use service instances correctly
      const [parts, suppliers] = await Promise.all([
        partService.findAll(), 
        supplierService.findAll()
      ]);
      
      setAvailableParts(parts);
      setAvailableSuppliers(suppliers);
      setLastFetch(now);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load stock data';
      setError(msg);
      console.error('Stock data load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [lastFetch]);

  useEffect(() => {
    loadData();
  }, []);

  const refresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  return {
    availableParts,
    availableSuppliers,
    filteredParts: availableParts,
    isLoading,
    error,
    refresh,
    lastFetch,
  };
}



// import { useState, useEffect, useCallback } from 'react'
// import type { Part, Supplier } from '../../../types'
// import { getSuppliers } from '../../../services/supplier-service'
// import { getParts } from '../../../services/part-service'

// // ❌ REMOVED: useNetworkState, scheduleSyncWithDebounce, complex caching

// export function useStockData() {
//   const [availableParts, setAvailableParts] = useState<Part[]>([])
//   const [availableSuppliers, setAvailableSuppliers] = useState<Supplier[]>([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [lastFetch, setLastFetch] = useState(0)

//   // ✅ SIMPLIFIED: Direct local data loading
//   const loadData = useCallback(async (forceRefresh = false) => {
//     // Simple rate limiting for local operations
//     const now = Date.now()
//     if (!forceRefresh && now - lastFetch < 2000) return

//     setIsLoading(true)
//     setError(null)
    
//     try {
//       // ✅ LOCAL-ONLY: Direct database calls
//       const [parts, suppliers] = await Promise.all([
//         getParts(), 
//         getSuppliers()
//       ])

//       setAvailableParts(parts)
//       setAvailableSuppliers(suppliers)
//       setLastFetch(now)
//       setError(null)

//       // ❌ REMOVED: Network sync calls

//     } catch (err) {
//       const msg = err instanceof Error ? err.message : 'Failed to load stock data'
//       setError(msg)
      
//       // ✅ SIMPLIFIED: Don't clear data on error (local-only)
//       console.error('Stock data load error:', err)
//     } finally {
//       setIsLoading(false)
//     }
//   }, [lastFetch])

//   // ✅ SIMPLIFIED: Load data on mount
//   useEffect(() => {
//     loadData()
//   }, [])

//   // ✅ SIMPLIFIED: Manual refresh function
//   const refresh = useCallback(() => {
//     loadData(true)
//   }, [loadData])

//   return {
//     availableParts,
//     availableSuppliers,
//     filteredParts: availableParts, // ✅ SIMPLIFIED: No complex filtering needed
//     isLoading,
//     error,
//     refresh,
//     lastFetch,
//     // ❌ REMOVED: invalidateCache, isOnline - Not needed for local-only
//   }
// }
