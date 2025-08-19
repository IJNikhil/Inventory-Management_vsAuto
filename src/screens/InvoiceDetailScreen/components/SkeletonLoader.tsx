import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SkeletonLoaderProps {
  style?: any;
  colors: any;
}

export default function SkeletonLoader({ style, colors }: SkeletonLoaderProps) {
  return <View style={[styles.skeleton, { backgroundColor: colors.muted }, style]} />;
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 8,
  },
});
