import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StockBadge({ color, text, colors }: any) {
  let bg, fg
  if (color === 'gray') {
    bg = { backgroundColor: colors.muted, borderColor: colors.muted }
    fg = { color: colors.mutedForeground }
  } else if (color === 'red') {
    bg = { backgroundColor: colors.destructive + '20', borderColor: colors.destructive }
    fg = { color: colors.destructive }
  } else if (color === 'amber') {
    bg = { backgroundColor: colors.accent + '20', borderColor: colors.accent }
    fg = { color: colors.accent }
  } else {
    bg = { backgroundColor: colors.primary + '20', borderColor: colors.primary }
    fg = { color: colors.primary }
  }
  return (
    <View style={[styles.stockBadge, bg]}>
      <Text style={[styles.stockBadgeText, fg]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  stockBadgeText: {
    fontWeight: '600',
    fontSize: 10,
    textAlign: 'center',
  },
})
