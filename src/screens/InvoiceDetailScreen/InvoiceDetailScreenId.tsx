import React, { useEffect } from 'react';
import {
  ScrollView,
  View,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '../../hooks/use-toast';
import { useColors, useTheme } from '../../context/ThemeContext';
import { useInvoiceDetail, getDisplayStatus } from './hooks/useInvoiceDetail';
import BackButton from './components/BackButton';
import HeaderActions from './components/HeaderActions';
import InvoiceHeader from './components/InvoiceHeader';
import BillFromTo from './components/BillFromTo';
import InvoiceDetails from './components/InvoiceDetails';
import ItemsTable from './components/ItemsTable';
import Summary from './components/Summary';
import Notes from './components/Notes';
import SkeletonLoader from './components/SkeletonLoader';
import NotFound from './components/NotFound';
import styles from './styles';
import { useInvoicePDF } from './hooks/useInvoicePDF';
import type { Invoice, ShopSettings, InvoiceItem } from '../../types/database';

interface InvoiceDetailScreenIdProps {
  route: { params: { id: string } };
  navigation: any;
}

export default function InvoiceDetailScreenId({ route, navigation }: InvoiceDetailScreenIdProps) {
  const invoiceId = route?.params?.id;
  const { toast } = useToast();
  const colors = useColors();
  const { isDark } = useTheme();

  const {
    invoice,
    shopDetails,
    invoiceItems, // ✅ ADDED: Get invoice items from hook
    isLoading,
    isRefreshing,
    loadInvoiceData,
    onRefresh,
  } = useInvoiceDetail(invoiceId, toast, navigation);

  const displayStatus = invoice ? getDisplayStatus(invoice) : undefined;

  // ✅ ENHANCED: Safer customer extraction with null checks
  const customer = React.useMemo(() => {
    if (!invoice?.customer) return null;
    
    return {
      name: invoice.customer.name || 'Unknown Customer',
      phone: invoice.customer.phone || '',
      email: invoice.customer.email || '',
      address: invoice.customer.address || ''
    };
  }, [invoice]);

  const { isGeneratingPDF, handleShare } = useInvoicePDF({
    invoice,
    customer,
    shopDetails,
    getDisplayStatus,
    toast,
  });

  useEffect(() => {
    loadInvoiceData(true);
  }, [loadInvoiceData]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainApp', { screen: 'Invoices' });
    }
  };

  // ✅ DEBUG: Log invoice items
  console.log('📋 Invoice items for table:', {
    itemsCount: invoiceItems?.length || 0,
    items: invoiceItems?.slice(0, 2) // Show first 2 items for debugging
  });

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <SkeletonLoader style={{ height: 36, width: 144 }} colors={colors} />
          <SkeletonLoader style={{ height: 36, width: 96 }} colors={colors} />
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <SkeletonLoader style={{ height: 32, width: '50%', marginBottom: 16 }} colors={colors} />
            <SkeletonLoader style={{ height: 160, width: '100%' }} colors={colors} />
          </View>
        </ScrollView>
        {isGeneratingPDF && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
            }}
            pointerEvents="auto"
          >
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: '#fff', marginTop: 16, fontSize: 18 }}>Generating PDF…</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ✅ ENHANCED: Better error handling with specific checks
  if (!invoice) {
    console.warn('[InvoiceDetail] No invoice data');
    return <NotFound onBack={handleBack} />;
  }

  if (!displayStatus) {
    console.warn('[InvoiceDetail] No display status');
    return <NotFound onBack={handleBack} />;
  }

  if (!shopDetails) {
    console.warn('[InvoiceDetail] No shop details');
    return <NotFound onBack={handleBack} />;
  }

  if (!customer) {
    console.warn('[InvoiceDetail] No customer data');
    return <NotFound onBack={handleBack} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <BackButton onPress={handleBack} />
        <View style={styles.headerActions}>
          <HeaderActions onShare={handleShare} isGenerating={isGeneratingPDF} />
        </View>
      </View>

      {/* Main content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerCard, { backgroundColor: colors.card, shadowColor: colors.foreground }]}>
          <InvoiceHeader invoiceId={invoice.id} status={displayStatus} totalAmount={invoice.total} />
        </View>

        {/* ✅ ENHANCED: Safer component calls with explicit null checks */}
        {shopDetails && customer && (
          <BillFromTo shopDetails={shopDetails} customer={customer} />
        )}

        <InvoiceDetails invoice={invoice} />

        <View style={{ marginHorizontal: 16, marginBottom: 8, borderRadius: 16, padding: 0 }}>
          {/* ✅ FIXED: Use invoiceItems from hook and add debug info */}
          <ItemsTable items={invoiceItems || []} />
          {/* ✅ DEBUG: Show items count */}
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
            Debug: {invoiceItems?.length || 0} items loaded
          </Text>
        </View>

        <Summary subtotal={invoice.subtotal} total={invoice.total} />

        {invoice.notes && <Notes notes={invoice.notes} />}
      </ScrollView>

      {/* PDF generation overlay */}
      {isGeneratingPDF && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
          pointerEvents="auto"
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 18 }}>Generating PDF…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}





// import React, { useEffect } from 'react';
// import {
//   ScrollView,
//   View,
//   RefreshControl,
//   ActivityIndicator,
//   Text,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useToast } from '../../hooks/use-toast';
// import { useColors, useTheme } from '../../context/ThemeContext';
// import { useInvoiceDetail, getDisplayStatus } from './hooks/useInvoiceDetail';

// import BackButton from './components/BackButton';
// import HeaderActions from './components/HeaderActions';
// import InvoiceHeader from './components/InvoiceHeader';
// import BillFromTo from './components/BillFromTo';
// import InvoiceDetails from './components/InvoiceDetails';
// import ItemsTable from './components/ItemsTable';
// import Summary from './components/Summary';
// import Notes from './components/Notes';
// import SkeletonLoader from './components/SkeletonLoader';
// import NotFound from './components/NotFound';

// import styles from './styles';
// import { useInvoicePDF } from './hooks/useInvoicePDF';
// import type { Invoice, ShopDetails } from '../../types';

// interface InvoiceDetailScreenIdProps {
//   route: { params: { id: string } };
//   navigation: any;
// }

// export default function InvoiceDetailScreenId({ route, navigation }: InvoiceDetailScreenIdProps) {
//   const invoiceId = route?.params?.id;
//   const { toast } = useToast();
//   const colors = useColors();
//   const { isDark } = useTheme();

//   const {
//     invoice,
//     shopDetails,
//     isLoading,
//     isRefreshing,
//     loadInvoiceData,
//     onRefresh,
//   } = useInvoiceDetail(invoiceId, toast, navigation);

//   const displayStatus = invoice ? getDisplayStatus(invoice) : undefined;

//   // Extract customer from embedded invoice data
//   const customer = invoice?.customer || null;

//   const { isGeneratingPDF, handleShare } = useInvoicePDF({
//     invoice,
//     customer,
//     shopDetails,
//     getDisplayStatus,
//     toast,
//   });

//   useEffect(() => {
//     loadInvoiceData(true);
//   }, [loadInvoiceData]);

//   // Fixed navigation handler - use goBack instead of navigate
//   const handleBack = () => {
//     if (navigation.canGoBack()) {
//       navigation.goBack();
//     } else {
//       // If can't go back, reset to main app
//       navigation.navigate('MainApp', { screen: 'Invoices' });
//     }
//   };

//   // Loading skeleton screen + overlay if loading & PDF generating simultaneously
//   if (isLoading) {
//     return (
//       <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
//         <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
//           <SkeletonLoader style={{ height: 36, width: 144 }} colors={colors} />
//           <SkeletonLoader style={{ height: 36, width: 96 }} colors={colors} />
//         </View>
//         <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
//           <View style={[styles.card, { backgroundColor: colors.card }]}>
//             <SkeletonLoader style={{ height: 32, width: '50%', marginBottom: 16 }} colors={colors} />
//             <SkeletonLoader style={{ height: 160, width: '100%' }} colors={colors} />
//           </View>
//         </ScrollView>
//         {isGeneratingPDF && (
//           <View
//             style={{
//               position: 'absolute',
//               left: 0,
//               top: 0,
//               width: '100%',
//               height: '100%',
//               backgroundColor: 'rgba(0,0,0,0.4)',
//               alignItems: 'center',
//               justifyContent: 'center',
//               zIndex: 999,
//             }}
//             pointerEvents="auto"
//           >
//             <ActivityIndicator size="large" color="#fff" />
//             <Text style={{ color: '#fff', marginTop: 16, fontSize: 18 }}>Generating PDF…</Text>
//           </View>
//         )}
//       </SafeAreaView>
//     );
//   }

//   // Handle not found or missing data - Fixed navigation
//   if (!invoice || !displayStatus || !shopDetails) {
//     return <NotFound onBack={handleBack} />;
//   }

//   // Handle missing customer from embedded data
//   if (!invoice.customer) {
//     console.warn('[InvoiceDetail] Invoice missing embedded customer data:', invoice);
//     return <NotFound onBack={handleBack} />;
//   }

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
//       {/* Header */}
//       <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
//         <BackButton onPress={handleBack} />
//         <View style={styles.headerActions}>
//           <HeaderActions onShare={handleShare} isGenerating={isGeneratingPDF} />
//         </View>
//       </View>

//       {/* Main content */}
//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{ paddingBottom: 24 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={[styles.headerCard, { backgroundColor: colors.card, shadowColor: colors.foreground }]}>
//           <InvoiceHeader invoiceId={invoice.id} status={displayStatus} totalAmount={invoice.total} />
//         </View>

//         <BillFromTo shopDetails={shopDetails} customer={invoice.customer} />
//         <InvoiceDetails invoice={invoice} />
//         <View style={{ marginHorizontal: 16, marginBottom: 8, borderRadius: 16, padding: 0 }}>
//           <ItemsTable items={invoice.items} />
//         </View>
//         <Summary subtotal={invoice.subtotal} total={invoice.total} />
//         {invoice.notes && <Notes notes={invoice.notes} />}
//       </ScrollView>

//       {/* Overlay while PDF is generating */}
//       {isGeneratingPDF && (
//         <View
//           style={{
//             position: 'absolute',
//             left: 0,
//             top: 0,
//             width: '100%',
//             height: '100%',
//             backgroundColor: 'rgba(0,0,0,0.4)',
//             alignItems: 'center',
//             justifyContent: 'center',
//             zIndex: 999,
//           }}
//           pointerEvents="auto"
//         >
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={{ color: '#fff', marginTop: 16, fontSize: 18 }}>Generating PDF…</Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }
