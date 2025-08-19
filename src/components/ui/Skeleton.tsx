import React from 'react'
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native'

interface SkeletonProps extends ViewProps {
  style?: StyleProp<ViewStyle>
}

export const Skeleton = ({ style, ...props }: SkeletonProps) => {
  return (
    <View
      style={[styles.skeleton, style]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#f3f4f6', // muted
    borderRadius: 8,
    // mimic a "pulse" shimmer with reduced opacity
    opacity: 0.7,
    // For fade effect, you can use Animated if you want, or a simple static style
  },
})
