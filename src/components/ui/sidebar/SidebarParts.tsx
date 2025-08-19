import React from 'react'
import { View, TextInput, StyleSheet, ViewProps, TextInputProps } from 'react-native'

// SidebarHeader
export const SidebarHeader = React.forwardRef<View, ViewProps & { children?: React.ReactNode }>(
  ({ style, children, ...props }, ref) => (
    <View
      style={[styles.headerFooter, style]}
      ref={ref}
      {...props}
    >
      {children}
    </View>
  )
)
SidebarHeader.displayName = 'SidebarHeader'

// SidebarFooter
export const SidebarFooter = React.forwardRef<View, ViewProps & { children?: React.ReactNode }>(
  ({ style, children, ...props }, ref) => (
    <View
      style={[styles.headerFooter, style]}
      ref={ref}
      {...props}
    >
      {children}
    </View>
  )
)
SidebarFooter.displayName = 'SidebarFooter'

// SidebarSeparator
export const SidebarSeparator = React.forwardRef<View, ViewProps>(
  ({ style, ...props }, ref) => (
    <View
      style={[styles.separator, style]}
      ref={ref}
      {...props}
    />
  )
)
SidebarSeparator.displayName = 'SidebarSeparator'

// SidebarInput
export const SidebarInput = React.forwardRef<TextInput, TextInputProps>(
  ({ style, ...props }, ref) => (
    <TextInput
      ref={ref}
      style={[styles.input, style]}
      placeholderTextColor="#94a3b8" // optional, matches muted foreground
      {...props}
    />
  )
)
SidebarInput.displayName = 'SidebarInput'

// ---------------- Styles -----------------
const styles = StyleSheet.create({
  headerFooter: {
    flexDirection: 'column',
    gap: 8,
    padding: 8,
  },
  separator: {
    height: 1,
    width: '96%',
    alignSelf: 'center',
    backgroundColor: '#e5e7eb', // "sidebar-border"
    marginVertical: 4,
  },
  input: {
    height: 32,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 10,
    fontSize: 15,
    marginVertical: 2,
    color: '#18181b',
    shadowColor: 'transparent',
  },
})
