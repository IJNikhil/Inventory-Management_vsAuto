import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewProps,
  TextProps,
  TouchableOpacityProps
} from 'react-native'

// SidebarGroup
export const SidebarGroup = React.forwardRef<View, ViewProps & { children?: React.ReactNode }>(
  ({ style, children, ...props }, ref) => (
    <View ref={ref} style={[styles.group, style]} {...props}>
      {children}
    </View>
  )
)

// SidebarGroupLabel
export const SidebarGroupLabel = React.forwardRef<View, ViewProps & { children?: React.ReactNode }>(
  ({ style, children, ...props }, ref) => (
    <View ref={ref} style={[styles.label, style]} {...props}>
      <Text style={styles.labelText}>{children}</Text>
    </View>
  )
)

// SidebarGroupContent
export const SidebarGroupContent = React.forwardRef<View, ViewProps & { children?: React.ReactNode }>(
  ({ style, children, ...props }, ref) => (
    <View ref={ref} style={[styles.content, style]} {...props}>
      {children}
    </View>
  )
)

// SidebarGroupAction
export const SidebarGroupAction = React.forwardRef<View, TouchableOpacityProps & { children?: React.ReactNode }>(
  ({ style, children, ...props }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.action, style]}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </TouchableOpacity>
  )
)

const styles = StyleSheet.create({
  group: {
    position: 'relative',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
    padding: 8,
  },
  label: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 7,
    paddingHorizontal: 8,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(55,65,81,0.7)',
  },
  content: {
    width: '100%',
  },
  action: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
})
