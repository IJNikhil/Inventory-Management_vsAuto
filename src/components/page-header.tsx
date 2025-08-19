// page-header.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import type { ReactNode } from 'react';
import { useColors } from '../context/ThemeContext';

type PageHeaderProps = {
  title: string;
  actions?: ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
};

export function PageHeader({ 
  title, 
  actions, 
  style, 
  titleStyle 
}: PageHeaderProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.foreground,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });

  return (
    <View style={[styles.header, style]}>
      <Text style={[styles.title, titleStyle]}>
        {title}
      </Text>
      {actions && (
        <View style={styles.actions}>
          {actions}
        </View>
      )}
    </View>
  );
}
