// src/components/ui/Button.tsx

import React from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useColors } from "../../context/ThemeContext";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends TouchableOpacityProps {
  label?: string; // Use label OR children
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "default",
  label,
  children,
  style,
  textStyle,
  disabled,
  ...props
}) => {
  const colors = useColors();

  const buttonContainerVariants: Record<ButtonVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.primary,
      borderColor: "transparent",
    },
    destructive: {
      backgroundColor: colors.destructive,
      borderColor: "transparent",
    },
    outline: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: 1,
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderColor: "transparent",
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
    link: {
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
  };

  const buttonTextVariants: Record<ButtonVariant, TextStyle> = {
    default: {
      color: colors.primaryForeground,
    },
    destructive: {
      color: colors.destructiveForeground,
    },
    outline: {
      color: colors.foreground,
    },
    secondary: {
      color: colors.secondaryForeground,
    },
    ghost: {
      color: colors.accentForeground,
    },
    link: {
      color: colors.primary,
      textDecorationLine: "underline",
    },
  };

  const buttonSizeStyles: Record<ButtonSize, ViewStyle> = {
    default: {
      height: 40,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    sm: {
      height: 36,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    lg: {
      height: 44,
      paddingHorizontal: 32,
      borderRadius: 16,
    },
    icon: {
      height: 40,
      width: 40,
      padding: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
    },
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseContainer,
        buttonContainerVariants[variant],
        buttonSizeStyles[size],
        disabled && { opacity: 0.5 },
        style,
      ]}
      activeOpacity={variant === "link" ? 1 : 0.85}
      disabled={disabled}
      {...props}
    >
      {label ? (
        <Text
          style={[
            styles.baseText,
            buttonTextVariants[variant],
            textStyle,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  baseText: {
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
});

export default Button;
