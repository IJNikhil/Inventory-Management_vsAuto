import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useColors } from "../context/ThemeContext";

type StatCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  helperText?: string;
  variant?: "default" | "destructive" | "warning";
  cardStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  valueStyle?: TextStyle;
  helperTextStyle?: TextStyle;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  helperText,
  variant = "default",
  cardStyle,
  headerStyle,
  titleStyle,
  valueStyle,
  helperTextStyle,
}) => {
  const colors = useColors();

  // Map variant → color from theme
  const iconColor =
    variant === "destructive"
      ? colors.destructive
      : variant === "warning"
      ? colors.accent
      : colors.primary;

  return (
    <View style={[
      styles.card, 
      { backgroundColor: colors.card },
      cardStyle
    ]}>
      {/* CardHeader */}
      <View style={[styles.header, headerStyle]}>
        <Text style={[
          styles.title, 
          { color: colors.mutedForeground },
          titleStyle
        ]} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <Icon size={22} color={iconColor} />
      </View>
      {/* CardContent */}
      <View style={styles.valueContainer}>
        <Text style={[
          styles.value, 
          { color: colors.cardForeground },
          valueStyle
        ]} numberOfLines={1} ellipsizeMode="tail">
          {value}
        </Text>
        {helperText ? (
          <Text style={[
            styles.helperText, 
            { color: colors.mutedForeground },
            helperTextStyle
          ]}>
            {helperText}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    width: "100%",
    shadowColor: "#00000013",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  valueContainer: {
    // Encapsulate value and helper for vertical layout
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  helperText: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default StatCard;
