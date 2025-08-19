// src/components/ui/Badge.tsx

import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle, ViewProps } from "react-native";
import { useColors } from "../../context/ThemeContext";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  label: string;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export function Badge({
  variant = "default",
  label,
  style,
  textStyle,
  ...props
}: BadgeProps) {
  const colors = useColors();

  const containerVariants: Record<BadgeVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.primary,
      borderColor: "transparent",
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderColor: "transparent",
    },
    destructive: {
      backgroundColor: colors.destructive,
      borderColor: "transparent",
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: colors.border,
      borderWidth: 1,
    },
  };

  const textVariants: Record<BadgeVariant, TextStyle> = {
    default: { color: colors.primaryForeground },
    secondary: { color: colors.secondaryForeground },
    destructive: { color: colors.destructiveForeground },
    outline: { color: colors.foreground },
  };

  return (
    <View
      style={[styles.base, containerVariants[variant], style]}
      {...props}
    >
      <Text
        style={[styles.text, textVariants[variant], textStyle]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    justifyContent: "center",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 22,
    minWidth: 30,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
