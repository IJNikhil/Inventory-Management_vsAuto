import React from 'react'
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import Slider from '@react-native-community/slider'

type SliderProps = {
  value: number
  onValueChange: (val: number) => void
  minimumValue?: number
  maximumValue?: number
  step?: number
  showValue?: boolean
  style?: StyleProp<ViewStyle>
}

export const NativeSlider = ({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  showValue = false,
  style,
}: SliderProps) => {
  return (
    <View style={[styles.container, style]}>
      <Slider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor="#0ea5e9"    // sky-500
        maximumTrackTintColor="#e5e7eb"    // border/input
        thumbTintColor="#ffffff"
      />
      {showValue && (
        <Text style={styles.valueLabel}>{value}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  valueLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b', // muted-foreground
  },
})
