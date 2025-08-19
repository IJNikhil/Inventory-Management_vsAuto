import React from 'react'
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native'

export interface SidebarTriggerProps extends TouchableOpacityProps {
  variant?: 'default' | 'ghost'
  size?: 'default' | 'icon'
  children?: React.ReactNode
  style?: ViewStyle | ViewStyle[]
  textStyle?: TextStyle | TextStyle[]
}

export const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  SidebarTriggerProps
>(
  (
    {
      variant = 'default',
      size = 'default',
      style,
      textStyle,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.base,
          variant === 'ghost' ? styles.ghost : styles.default,
          size === 'icon' ? styles.sizeIcon : styles.sizeDefault,
          style,
        ]}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    )
  }
)

SidebarTrigger.displayName = 'SidebarTrigger'

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  default: {
    backgroundColor: '#e5e7eb',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  sizeDefault: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  sizeIcon: {
    width: 32,
    height: 32,
    padding: 4,
  },
})

export default SidebarTrigger
