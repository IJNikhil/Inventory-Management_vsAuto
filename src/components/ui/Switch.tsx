import React from 'react'
import { View, Switch as RNSwitch, SwitchProps as RNSwitchProps, StyleSheet, StyleProp, ViewStyle } from 'react-native'

interface SwitchProps extends RNSwitchProps {
  style?: StyleProp<ViewStyle>
  trackColorOn?: string
  trackColorOff?: string
  thumbColorOn?: string
  thumbColorOff?: string
}

export const Switch = ({
  style,
  trackColorOn = '#0ea5e9',      // Tailwind primary color
  trackColorOff = '#e5e7eb',      // Tailwind input color
  thumbColorOn = '#ffffff',
  thumbColorOff = '#ffffff',
  value,
  onValueChange,
  ...props
}: SwitchProps) => {
  return (
    <View style={[styles.container, style]}>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: trackColorOff, true: trackColorOn }}
        thumbColor={value ? thumbColorOn : thumbColorOff}
        ios_backgroundColor={trackColorOff}
        style={{ transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }] }}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 44,   // w-11 (11 * 4)
    height: 24,  // h-6 (6 * 4)
    justifyContent: 'center',
  },
})

