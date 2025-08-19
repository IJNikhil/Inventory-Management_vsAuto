import React from 'react';
import { View, Text, ViewProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type AlertVariant = 'default' | 'destructive';

type AlertProps = ViewProps & {
  variant?: AlertVariant;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

export const Alert = ({
  variant = 'default',
  style,
  children,
  ...props
}: AlertProps) => {
  return (
    <View
      style={[
        styles.base,
        variant === 'destructive' && styles.destructive,
        style,
      ]}
      accessibilityRole="alert"
      {...props}
    >
      {children}
    </View>
  );
};

export const AlertTitle = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}) => (
  <Text style={[styles.title, style]}>
    {children}
  </Text>
);

export const AlertDescription = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}) => (
  <Text style={[styles.description, style]}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',                // border (gray-200)
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  destructive: {
    borderColor: '#ef4444',                // red-500
    backgroundColor: '#fef2f2',            // red-50
  },
  title: {
    marginBottom: 4,
    fontWeight: '500',
    fontSize: 16,
    color: '#18181b',                      // foreground
  },
  description: {
    fontSize: 14,
    color: '#64748b',                      // muted-foreground
    lineHeight: 20,
  },
});

export default Alert;
