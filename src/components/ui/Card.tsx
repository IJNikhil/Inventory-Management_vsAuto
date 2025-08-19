import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewProps,
  TextProps,
  ViewStyle,
  TextStyle,
} from 'react-native';

export const Card = ({
  style,
  children,
  ...props
}: ViewProps & { children?: React.ReactNode }) => (
  <View style={[styles.card, style]} {...props}>
    {children}
  </View>
);

export const CardHeader = ({
  style,
  children,
  ...props
}: ViewProps & { children?: React.ReactNode }) => (
  <View style={[styles.cardHeader, style]} {...props}>
    {children}
  </View>
);

export const CardTitle = ({
  style,
  children,
  ...props
}: TextProps & { children?: React.ReactNode }) => (
  <Text style={[styles.cardTitle, style]} {...props}>
    {children}
  </Text>
);

export const CardDescription = ({
  style,
  children,
  ...props
}: TextProps & { children?: React.ReactNode }) => (
  <Text style={[styles.cardDescription, style]} {...props}>
    {children}
  </Text>
);

export const CardContent = ({
  style,
  children,
  ...props
}: ViewProps & { children?: React.ReactNode }) => (
  <View style={[styles.cardContent, style]} {...props}>
    {children}
  </View>
);

export const CardFooter = ({
  style,
  children,
  ...props
}: ViewProps & { children?: React.ReactNode }) => (
  <View style={[styles.cardFooter, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb', // border
    backgroundColor: '#f1f5f9', // card
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'column',
    gap: 6,
    padding: 24,
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    color: '#1e293b', // cardForeground
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b', // muted-foreground
  },
  cardContent: {
    padding: 24,
    paddingTop: 0,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 0,
  },
});
