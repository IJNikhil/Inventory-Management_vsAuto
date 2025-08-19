import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import CustomDrawerContent from '../components/layout/CustomDrawerContent';
import LoginScreen from '../screens/Login/LoginPage';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import ShopScreen from '../screens/ShopScreen';
import InventoryScreen from '../screens/Inventory/InventoryScreen';
import PartDetailScreenId from '../screens/PartDetail/PartDetailScreenId';
import AddStockScreen from '../screens/AddStock/AddStockScreen';
import InvoiceListScreen from '../screens/invoices/InvoiceListScreen';
import InvoiceDetailScreenId from '../screens/InvoiceDetailScreen/InvoiceDetailScreenId';
import ExpenseDetailScreenId from '../screens/ExpenseDetail/ExpenseDetailScreenId';
import ManualExpenseDetailScreenId from '../screens/ManualExpenceDetails/ManualExpenseDetailScreenId';
import SupplierListScreen from '../screens/SupplierListScreen';
import SupplierDetailScreen from '../screens/SupplierDetailScreen';
import InvoiceNewScreen from '../screens/InvoiceNew/InvoiceNewScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { useAppSelector } from '../lib/redux/hooks';
import { selectAuth } from '../lib/redux/slices/auth-slice';
import { useColors } from '../context/ThemeContext';
import FinancialManagementScreen from '../screens/Financial/FinancialManagementScreen';

export type RootStackParamList = {
  Login: undefined;
  MainApp: undefined;
  PartDetailScreenId: { partId: string };
  InvoiceDetailScreenId: { invoiceId: string };
  InvoiceNewScreen: undefined;
  ExpenseDetailScreenId: { expenseId: string };
  ManualExpenseDetailScreenId: { expenseId: string };
  SupplierDetail: { supplierId: string };
};

// ✅ FIXED: Updated DrawerParamList to include 'Financial' and remove old 'CashFlow' and 'Reports'
export type DrawerParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  AddStock: undefined;
  Invoices: undefined;
  Financial: undefined;  // ✅ NEW: Combined Financial Management screen
  Suppliers: undefined;
  Shop: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// ✅ FIXED: Updated drawerScreenConfigs to match DrawerParamList
const drawerScreenConfigs = [
  { name: 'Dashboard' as const, component: DashboardScreen },
  { name: 'Inventory' as const, component: InventoryScreen },
  { name: 'AddStock' as const, component: AddStockScreen },
  { name: 'Invoices' as const, component: InvoiceListScreen },
  { name: 'Financial' as const, component: FinancialManagementScreen },  // ✅ FIXED: Use proper key
  { name: 'Suppliers' as const, component: SupplierListScreen },
  { name: 'Shop' as const, component: ShopScreen },
  { name: 'Profile' as const, component: ProfileScreen },
];

const createProtectedScreen = (ScreenComponent: React.ComponentType<any>) => {
  return (props: any) => (
    <ProtectedLayout>
      <ScreenComponent {...props} />
    </ProtectedLayout>
  );
};

function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerPosition: 'left',
        swipeEnabled: true,
        drawerStyle: {
          width: '80%',
          maxWidth: 280,
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
      initialRouteName="Dashboard"
    >
      {drawerScreenConfigs.map(({ name, component }) => (
        <Drawer.Screen
          key={name}
          name={name}
          component={createProtectedScreen(component)}
        />
      ))}
    </Drawer.Navigator>
  );
}

function AuthStackNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function MainStackNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="MainApp"
    >
      <Stack.Screen name="MainApp" component={MainDrawerNavigator} />
      
      <Stack.Screen 
        name="PartDetailScreenId" 
        component={createProtectedScreen(PartDetailScreenId)}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen 
        name="InvoiceDetailScreenId" 
        component={createProtectedScreen(InvoiceDetailScreenId)}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen 
        name="InvoiceNewScreen" 
        component={createProtectedScreen(InvoiceNewScreen)}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen 
        name="ExpenseDetailScreenId" 
        component={createProtectedScreen(ExpenseDetailScreenId)}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen 
        name="ManualExpenseDetailScreenId" 
        component={createProtectedScreen(ManualExpenseDetailScreenId)}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen 
        name="SupplierDetail" 
        component={createProtectedScreen(SupplierDetailScreen)}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}

function LoadingScreen() {
  const colors = useColors();
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: colors.background 
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAppSelector(selectAuth);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <MainStackNavigator /> : <AuthStackNavigator />;
}

export type NavigationScreenProps<T extends keyof RootStackParamList> = {
  route: { params: RootStackParamList[T] };
  navigation: any;
};

export type DrawerScreenProps<T extends keyof DrawerParamList> = {
  route: { params: DrawerParamList[T] };
  navigation: any;
};

console.log('✅ [AppNavigator] Financial Management navigation ready');
