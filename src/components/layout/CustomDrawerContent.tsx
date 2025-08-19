import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BarChart3,  // ✅ UPDATED: Better icon for Financial Management
  Boxes,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Store,
  Sun,
  Truck,
  User,
  Monitor,
  Plus,
} from "lucide-react-native";
import { useAppDispatch, useAppSelector } from "../../lib/redux/hooks";
import { selectAuth, authActions } from "../../lib/redux/slices/auth-slice";
import { useTheme, useColors } from "../../context/ThemeContext";

// ✅ UPDATED: Updated navItems to use 'Financial' instead of separate CashFlow and Reports
const navItems = [
  { route: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { route: "Inventory", label: "Inventory", icon: Boxes },
  { route: "AddStock", label: "Add Stock", icon: Plus },
  { route: "Invoices", label: "Invoices", icon: FileText },
  { route: "Financial", label: "Financial", icon: BarChart3 },  // ✅ NEW: Combined Financial Management
  { route: "Suppliers", label: "Suppliers", icon: Truck },
  { route: "Shop", label: "Shop", icon: Store },
  { route: "Profile", label: "Profile", icon: User },
];

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { navigation, state } = props;
  const { isAuthenticated } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const { mode, isDark, toggleTheme } = useTheme();
  const colors = useColors();

  const currentRoute = state.routeNames[state.index];

  const handleLogout = async () => {
    try {
      await dispatch(authActions.logout());
      const rootNavigation = navigation.getParent() || navigation;
      rootNavigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigation = (routeName: string) => {
    try {
      navigation.navigate(routeName);
      navigation.closeDrawer();
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const getThemeIcon = () => {
    if (mode === 'system') return Monitor;
    return isDark ? Sun : Moon;
  };

  const getThemeLabel = () => {
    if (mode === 'light') return 'Dark Theme';
    if (mode === 'dark') return 'System Theme';
    return 'Light Theme';
  };

  const ThemeIcon = getThemeIcon();

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'bottom']}
    >
      {/* Navigation Content */}
      <DrawerContentScrollView 
        {...props}
        contentContainerStyle={styles.navContainer}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
      >
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => handleNavigation(item.route)}
              style={[
                styles.navItem,
                {
                  backgroundColor: isActive ? colors.primary + '15' : 'transparent',
                }
              ]}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: isActive ? colors.primary + '20' : colors.muted + '30' }
              ]}>
                <item.icon
                  size={20}
                  color={isActive ? colors.primary : colors.mutedForeground}
                />
              </View>
              <Text style={[
                styles.navLabel,
                {
                  color: isActive ? colors.primary : colors.foreground,
                  fontWeight: isActive ? '600' : '500',
                }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomSection, { 
        borderTopColor: colors.border,
        backgroundColor: colors.card 
      }]}>
        {/* Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.actionButton, { backgroundColor: colors.muted + '30' }]}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.accent + '20' }]}>
            <ThemeIcon size={18} color={colors.accent} />
          </View>
          <Text style={[styles.actionLabel, { color: colors.foreground }]}>
            {getThemeLabel()}
          </Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.actionButton, { backgroundColor: colors.destructive + '15' }]}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.destructive + '20' }]}>
            <LogOut size={18} color={colors.destructive} />
          </View>
          <Text style={[styles.actionLabel, { color: colors.destructive }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navContainer: {
    paddingTop: 16,
    paddingHorizontal: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 2,
    marginHorizontal: 8,
    borderRadius: 12,
    minHeight: 52,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    minHeight: 50,
    marginBottom: 8,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
});
