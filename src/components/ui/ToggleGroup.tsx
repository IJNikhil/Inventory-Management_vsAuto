import React, { createContext, useContext, ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native'

// Context for group state and styling
type ToggleContext = {
  type: 'single' | 'multiple'
  value: string | string[]
  onChange: (val: string) => void
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

const ToggleGroupContext = createContext<ToggleContext | null>(null)

interface ToggleGroupProps {
  type?: 'single' | 'multiple'
  value: string | string[]
  onValueChange: (val: string | string[]) => void
  style?: StyleProp<ViewStyle>
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  children: ReactNode
}

export const ToggleGroup = ({
  type = 'single',
  value,
  onValueChange,
  style,
  children,
  variant = 'default',
  size = 'default',
}: ToggleGroupProps) => {
  const handleChange = (val: string) => {
    if (type === 'single') {
      onValueChange(val)
    } else {
      const current = value as string[]
      if (current.includes(val)) {
        onValueChange(current.filter((v) => v !== val))
      } else {
        onValueChange([...current, val])
      }
    }
  }

  return (
    <ToggleGroupContext.Provider
      value={{
        type,
        value,
        onChange: handleChange,
        variant,
        size,
      }}
    >
      <View style={[styles.groupRow, style]}>{children}</View>
    </ToggleGroupContext.Provider>
  )
}

interface ToggleGroupItemProps {
  value: string
  children: ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  disabled?: boolean
}

export const ToggleGroupItem = ({
  value,
  children,
  style,
  textStyle,
  disabled = false,
}: ToggleGroupItemProps) => {
  const context = useContext(ToggleGroupContext)
  if (!context) {
    throw new Error('ToggleGroupItem must be used within a ToggleGroup')
  }

  const isSelected =
    context.type === 'single'
      ? context.value === value
      : Array.isArray(context.value) && context.value.includes(value)

  // Styles
  let variantStyle = context.variant === 'outline' ? styles.outline : styles.default
  let selectedStyle = isSelected
    ? context.variant === 'outline'
      ? styles.selectedOutline
      : styles.selected
    : context.variant === 'outline'
      ? styles.unselectedOutline
      : styles.unselected

  let sizeStyle = styles.sizeMd
  let textSizeStyle = styles.textMd
  if (context.size === 'sm') {
    sizeStyle = styles.sizeSm
    textSizeStyle = styles.textSm
  } else if (context.size === 'lg') {
    sizeStyle = styles.sizeLg
    textSizeStyle = styles.textLg
  }

  return (
    <Pressable
      onPress={() => !disabled && context.onChange(value)}
      disabled={disabled}
      style={[
        styles.base,
        variantStyle,
        sizeStyle,
        selectedStyle,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.textBase,
          textSizeStyle,
          isSelected && styles.textSelected,
          disabled && styles.textDisabled,
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  groupRow: {
    flexDirection: 'row',
    gap: 5,
  },
  base: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    // For active:scale, use Animated for real animation if needed
  },
  default: {
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  outline: {
    borderColor: '#94a3b8',
    backgroundColor: 'transparent',
  },
  selected: {
    backgroundColor: '#0d9488',    // primary
    borderColor: '#0d9488',
  },
  selectedOutline: {
    backgroundColor: '#f3f4f6',    // muted
    borderColor: '#64748b',
  },
  unselected: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
  },
  unselectedOutline: {
    backgroundColor: 'transparent',
    borderColor: '#94a3b8',
  },
  sizeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 32,
  },
  sizeMd: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 38,
  },
  sizeLg: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  textBase: {
    textAlign: 'center',
    fontWeight: '500',
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 15,
  },
  textLg: {
    fontSize: 17,
  },
  textSelected: {
    color: '#fff',     // white text on selected primary
  },
  textDisabled: {
    opacity: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
})
