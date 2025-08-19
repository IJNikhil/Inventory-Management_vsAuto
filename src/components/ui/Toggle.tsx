import React, { useState, forwardRef } from 'react'
import {
  Pressable,
  Text,
  StyleSheet,
  PressableProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native'

type ToggleVariant = 'default' | 'outline'
type ToggleSize = 'sm' | 'default' | 'lg'

type ToggleProps = {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  disabled?: boolean
  children?: React.ReactNode
  variant?: ToggleVariant
  size?: ToggleSize
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
} & Omit<PressableProps, 'onPress'>

export const Toggle = forwardRef<any, ToggleProps>(
  (
    {
      pressed: controlled,
      onPressedChange,
      disabled,
      children,
      variant = 'default',
      size = 'default',
      style,
      textStyle,
      ...props
    },
    ref
  ) => {
    const [uncontrolled, setUncontrolled] = useState(false)
    const isControlled = controlled !== undefined
    const pressed = isControlled ? controlled : uncontrolled

    const onToggle = () => {
      if (disabled) return
      const next = !pressed
      if (!isControlled) setUncontrolled(next)
      onPressedChange?.(next)
    }

    return (
      <Pressable
        ref={ref}
        onPress={onToggle}
        disabled={disabled}
        style={[
          styles.base,
          styles[variant],
          styles[size],
          pressed && styles.pressed,
          !pressed && !disabled && styles.unpressed,
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      >
        <Text
          style={[
            styles.text,
            pressed && styles.textPressed,
            disabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {children}
        </Text>
      </Pressable>
    )
  }
)

Toggle.displayName = 'Toggle'

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    fontSize: 15,
    fontWeight: '500',
    // This mimics "transition-colors active:scale-[0.97]"
    transform: [{ scale: 1 }],
  },
  default: {
    backgroundColor: 'transparent',
  },
  outline: {
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-input
    backgroundColor: 'transparent',
    color: '#18181b', // text-foreground
  },
  sm: {
    height: 36,
    paddingHorizontal: 10,
  },
  defaultSize: {
    height: 40,
    paddingHorizontal: 12,
  },
  lg: {
    height: 44,
    paddingHorizontal: 20,
  },
  pressed: {
    backgroundColor: '#facc15', // accent
    // You could also add scale using Animated for more effect
  },
  unpressed: {
    // For hover, in RN this would require libraries or special logic
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    color: '#18181b',
  },
  textPressed: {
    color: '#1e293b', // accent-foreground
    fontWeight: '600',
  },
  textDisabled: {
    opacity: 0.5,
  },
})

