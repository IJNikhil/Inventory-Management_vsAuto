import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../lib/redux/hooks';
import { selectAuth } from '../../lib/redux/slices/auth-slice';
import DrawerHeader from './DrawerHeader';
import { useColors } from '../../context/ThemeContext';

const UNPROTECTED_ROUTES = ['Login'];

const MODAL_ROUTES = [
  'PartDetailScreenId',
  'InvoiceDetailScreenId',
  'InvoiceNewScreen',
  'ExpenseDetailScreenId',
  'ManualExpenseDetailScreenId',
  'SupplierDetail',
];

// ✅ UPDATED: Updated DRAWER_ROUTES to include 'Financial' and remove old entries
const DRAWER_ROUTES = [
  'Dashboard',
  'Inventory',
  'AddStock',
  'Invoices',
  'Financial',  // ✅ NEW: Combined Financial Management screen
  'Suppliers',
  'Shop',
  'Profile',
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAppSelector(selectAuth);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const colors = useColors();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading || showSplash) return;

    const currentRoute = route.name;

    if (isAuthenticated && currentRoute === 'Login') {
      navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
    } else if (!isAuthenticated && !UNPROTECTED_ROUTES.includes(currentRoute)) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [isLoading, showSplash, isAuthenticated, route.name, navigation]);

  if (isLoading || showSplash) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Unprotected routes (Login) or Modal routes
  if (
    UNPROTECTED_ROUTES.includes(route.name) ||
    MODAL_ROUTES.includes(route.name)
  ) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {children}
      </View>
    );
  }

  // If user is not authenticated, show loading
  if (!isAuthenticated) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  // Drawer routes (main app screens)
  if (DRAWER_ROUTES.includes(route.name)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <DrawerHeader />
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {children}
        </View>
      </View>
    );
  }

  // Fallback for other routes
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
