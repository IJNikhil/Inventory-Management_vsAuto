import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  colors: any;
  isDark: boolean;
}

export default function EmptyState({ icon, title, description, colors, isDark }: EmptyStateProps) {
  const styles = createStyles(colors, isDark);
  
  return (
    <View style={styles.emptyState}>
      <FeatherIcon name={icon} size={24} color={colors.mutedForeground} style={styles.emptyStateIcon} />
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDescription}>{description}</Text>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  emptyState: { 
    alignItems: 'center', 
    paddingVertical: 32 
  },
  emptyStateIcon: { 
    marginBottom: 12 
  },
  emptyStateTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: colors.foreground, 
    marginBottom: 8 
  },
  emptyStateDescription: { 
    fontSize: 14, 
    color: colors.mutedForeground, 
    textAlign: 'center' 
  },
});
