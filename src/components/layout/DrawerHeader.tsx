// DrawerHeader.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Menu,
  LayoutDashboard,
  Boxes,
  FileText,
  BarChart3,  // ✅ UPDATED: Financial icon
  Truck,
  Store,
  User,
  Plus,
} from 'lucide-react-native';
import { useNavigation, DrawerActions, useRoute } from '@react-navigation/native';
import { useColors } from '../../context/ThemeContext';

// ✅ UPDATED: Updated SCREEN_CONFIG to include 'Financial' and remove old entries
const SCREEN_CONFIG = {
  Dashboard: { title: 'Dashboard', icon: LayoutDashboard },
  Inventory: { title: 'Inventory', icon: Boxes },
  AddStock: { title: 'Add Stock', icon: Plus },
  Invoices: { title: 'Invoices', icon: FileText },
  Financial: { title: 'Financial Management', icon: BarChart3 },  // ✅ NEW: Combined Financial screen
  Suppliers: { title: 'Suppliers', icon: Truck },
  Shop: { title: 'Shop', icon: Store },
  Profile: { title: 'Profile', icon: User },
};

export default function DrawerHeader() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const colors = useColors();

  const currentScreen = SCREEN_CONFIG[route.name as keyof typeof SCREEN_CONFIG];
  const ScreenIcon = currentScreen?.icon || LayoutDashboard;
  const screenTitle = currentScreen?.title || 'Dashboard';

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={[styles.menuButton]}
          activeOpacity={0.7}
        >
          <Menu size={24} color={colors.foreground} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <ScreenIcon size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.foreground }]}>
            {screenTitle}
          </Text>
        </View>
        
        <View style={styles.rightSection} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  rightSection: {
    width: 40,
  },
});
