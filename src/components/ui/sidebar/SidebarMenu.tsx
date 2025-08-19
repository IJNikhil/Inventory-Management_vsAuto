import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewProps,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native'

// SidebarMenu: UL -> RN View
export const SidebarMenu = React.forwardRef<View, ViewProps & { children?: React.ReactNode }>(
  ({ style, children, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.menu, style]}
      {...props}
    >
      {children}
    </View>
  )
)
SidebarMenu.displayName = 'SidebarMenu'

// SidebarMenuItem: LI -> RN View
export const SidebarMenuItem = React.forwardRef<View, ViewProps & { children?: React.ReactNode }>(
  ({ style, children, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.menuItem, style]}
      {...props}
    >
      {children}
    </View>
  )
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

// SidebarMenuButton: button
export interface SidebarMenuButtonProps extends TouchableOpacityProps {
  isActive?: boolean
  children?: React.ReactNode
  style?: ViewStyle | ViewStyle[]
}
export const SidebarMenuButton = React.forwardRef<View, SidebarMenuButtonProps>(
  ({ isActive, style, children, ...props }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[
        styles.menuButton,
        isActive && styles.menuButtonActive,
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </TouchableOpacity>
  )
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

// SidebarMenuAction: icon button
export interface SidebarMenuActionProps extends TouchableOpacityProps {
  children?: React.ReactNode
  style?: ViewStyle | ViewStyle[]
}
export const SidebarMenuAction = React.forwardRef<View, SidebarMenuActionProps>(
  ({ style, children, ...props }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.menuAction, style]}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </TouchableOpacity>
  )
)
SidebarMenuAction.displayName = 'SidebarMenuAction'

// SidebarMenuBadge: badge dot/div
export interface SidebarMenuBadgeProps extends ViewProps {
  children?: React.ReactNode
  style?: ViewStyle | ViewStyle[]
}
export const SidebarMenuBadge = React.forwardRef<View, SidebarMenuBadgeProps>(
  ({ style, children, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.menuBadge, style]}
      {...props}
    >
      <Text style={styles.menuBadgeText}>{children}</Text>
    </View>
  )
)
SidebarMenuBadge.displayName = 'SidebarMenuBadge'

// ------------------- Styles -------------------
const styles = StyleSheet.create({
  menu: {
    flexDirection: 'column',
    gap: 5,
    width: '100%',
    minWidth: 0,
  },
  menuItem: {
    position: 'relative',
    width: '100%',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: 'transparent',
  },
  menuButtonActive: {
    backgroundColor: '#e2e8f0',
    color: '#374151',
    fontWeight: '500',
  },
  menuAction: {
    position: 'absolute',
    right: 4,
    top: 6,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  menuBadge: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 8,
    minHeight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none' as any,
  },
  menuBadgeText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
  },
})
