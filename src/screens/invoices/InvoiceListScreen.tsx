import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native'

import { useInvoices } from './hooks/useInvoices'
import InvoiceTabs from './components/InvoiceTabs'
import SearchBar from './components/SearchBar'
import EmptyState from './components/EmptyState'
import InvoiceTable from './components/InvoiceTable'

import {
  FileText,
  CheckCircle,
  Send, // ✅ CHANGED: More appropriate icon for 'sent' status
  AlertCircle,
  PlusCircle,
} from 'lucide-react-native'

import { useColors } from '../../context/ThemeContext'
import { useToast } from '../../hooks/use-toast'
import { useAppSelector } from '../../lib/redux/hooks'
import { selectAuth } from '../../lib/redux/slices/auth-slice'
import invoiceListStyles from './invoiceListStyles'

// ✅ FIXED: Constants for tabs using database status values
export const TABS = [
  { key: 'all', label: 'All', icon: FileText },
  { key: 'paid', label: 'Paid', icon: CheckCircle },
  { key: 'sent', label: 'Sent', icon: Send }, // ✅ FIXED: 'sent' instead of 'pending'
  { key: 'overdue', label: 'Overdue', icon: AlertCircle },
] as const

export type TabKey = typeof TABS[number]['key']

export default function InvoiceListScreen({ navigation }: any) {
  const { toast } = useToast()
  const { user } = useAppSelector(selectAuth)
  const colors = useColors()

  const {
    paginatedInvoices,
    isLoading,
    isRefreshing,
    onRefresh,
    loadMore,
    hasMore,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    tabCounts,
    handleUpdateStatus,
  } = useInvoices({ toast, user })

  // Header with title and "New" button
  const renderHeader = () => (
    <View
      style={[
        invoiceListStyles.headerContainer,
        { backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}
    >
      <View style={invoiceListStyles.headerRow}>
        <Text style={[invoiceListStyles.headerTitle, { color: colors.foreground }]}>Invoices</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('InvoiceNewScreen')}
          style={[invoiceListStyles.newButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <PlusCircle size={20} color={colors.primaryForeground} />
          <Text style={[invoiceListStyles.newButtonText, { color: colors.primaryForeground }]}>New</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={[invoiceListStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            tintColor={colors.primary}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={invoiceListStyles.listContainer}
      >
        {renderHeader()}

        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val)
            setActiveTab('all')
          }}
          onClear={() => setSearchTerm('')}
          colors={colors}
        />

        <InvoiceTabs
          tabs={TABS}
          activeTab={activeTab}
          tabCounts={tabCounts}
          onChange={(key) => setActiveTab(key)}
          colors={colors}
        />

        {isLoading ? (
          <View style={[invoiceListStyles.loadingOverlay, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : paginatedInvoices.length === 0 ? (
          <EmptyState
            searchTerm={searchTerm}
            onNew={() => navigation.navigate('InvoiceNewScreen')}
            colors={colors}
          />
        ) : (
          <InvoiceTable
            invoices={paginatedInvoices}
            onUpdateStatus={handleUpdateStatus}
            navigation={navigation}
            colors={colors}
          />
        )}

        {/* ✅ ADDED: Load More functionality for pagination */}
        {!isLoading && paginatedInvoices.length > 0 && hasMore && (
          <View style={styles.loadMoreContainer}>
            <TouchableOpacity
              onPress={loadMore}
              style={[styles.loadMoreButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.loadMoreText, { color: colors.foreground }]}>Load More</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

// Additional styles for the header button and header row
const extraStyles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  newButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
})

// ✅ ADDED: Additional styles for load more functionality
const styles = StyleSheet.create({
  loadMoreContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
})

// Merge extraStyles into invoiceListStyles if you want
Object.assign(invoiceListStyles, extraStyles)


// import React from 'react'
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   RefreshControl,
//   StyleSheet,
// } from 'react-native'

// import { useInvoices } from './hooks/useInvoices'
// import InvoiceTabs from './components/InvoiceTabs'
// import SearchBar from './components/SearchBar'
// import EmptyState from './components/EmptyState'
// import InvoiceTable from './components/InvoiceTable'

// import {
//   FileText,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   PlusCircle,
// } from 'lucide-react-native'

// import { useColors } from '../../context/ThemeContext'
// import { useToast } from '../../hooks/use-toast'
// import { useAppSelector } from '../../lib/redux/hooks'
// import { selectAuth } from '../../lib/redux/slices/auth-slice'
// import invoiceListStyles from './invoiceListStyles'

// // Constants for tabs
// export const TABS = [
//   { key: 'all', label: 'All', icon: FileText },
//   { key: 'paid', label: 'Paid', icon: CheckCircle },
//   { key: 'pending', label: 'Pending', icon: Clock },
//   { key: 'overdue', label: 'Overdue', icon: AlertCircle },
// ] as const

// export type TabKey = typeof TABS[number]['key']

// export default function InvoiceListScreen({ navigation }: any) {
//   const { toast } = useToast()
//   const { user } = useAppSelector(selectAuth)
//   const colors = useColors()

//   const {
//     paginatedInvoices,
//     isLoading,
//     isRefreshing,
//     onRefresh,
//     loadMore,
//     hasMore,
//     searchTerm,
//     setSearchTerm,
//     activeTab,
//     setActiveTab,
//     tabCounts,
//     handleUpdateStatus,
//   } = useInvoices({ toast, user })

//   // Header with title and "New" button
//   const renderHeader = () => (
//     <View
//       style={[
//         invoiceListStyles.headerContainer,
//         { backgroundColor: colors.card, borderBottomColor: colors.border },
//       ]}
//     >
//       <View style={invoiceListStyles.headerRow}>
//         <Text style={[invoiceListStyles.headerTitle, { color: colors.foreground }]}>Invoices</Text>
//         <TouchableOpacity
//           onPress={() => navigation.navigate('InvoiceNewScreen')}
//           style={[invoiceListStyles.newButton, { backgroundColor: colors.primary }]}
//           activeOpacity={0.8}
//         >
//           <PlusCircle size={20} color={colors.primaryForeground} />
//           <Text style={[invoiceListStyles.newButtonText, { color: colors.primaryForeground }]}>New</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   )

//   return (
//     <View style={[invoiceListStyles.container, { backgroundColor: colors.background }]}>
//       <ScrollView
//         refreshControl={
//           <RefreshControl
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//             refreshing={isRefreshing}
//             onRefresh={onRefresh}
//           />
//         }
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={invoiceListStyles.listContainer}
//       >
//         {renderHeader()}

//         <SearchBar
//           value={searchTerm}
//           onChange={(val) => {
//             setSearchTerm(val)
//             setActiveTab('all')
//           }}
//           onClear={() => setSearchTerm('')}
//           colors={colors}
//         />

//         <InvoiceTabs
//           tabs={TABS}
//           activeTab={activeTab}
//           tabCounts={tabCounts}
//           onChange={(key) => setActiveTab(key)}
//           colors={colors}
//         />

//         {isLoading ? (
//           <View style={[invoiceListStyles.loadingOverlay, { backgroundColor: colors.background }]}>
//             <ActivityIndicator size="large" color={colors.primary} />
//           </View>
//         ) : paginatedInvoices.length === 0 ? (
//           <EmptyState
//             searchTerm={searchTerm}
//             onNew={() => navigation.navigate('InvoiceNewScreen')}
//             colors={colors}
//           />
//         ) : (
//           <InvoiceTable
//             invoices={paginatedInvoices}
//             onUpdateStatus={handleUpdateStatus}
//             navigation={navigation}
//             colors={colors}
//           />
//         )}
//       </ScrollView>
//     </View>
//   )
// }

// // Additional styles for the header button and header row
// const extraStyles = StyleSheet.create({
//   headerContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   newButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     gap: 6,
//   },
//   newButtonText: {
//     fontWeight: '600',
//     fontSize: 14,
//   },
// })

// // Merge extraStyles into invoiceListStyles if you want
// Object.assign(invoiceListStyles, extraStyles)
