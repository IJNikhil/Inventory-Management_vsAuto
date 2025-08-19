import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
  colors: {
    primary: string;
    accent: string;
    destructive: string;
    success?: string;
    warning?: string;
    muted: string;
    border: string;
    mutedForeground: string;
    foreground: string;
  };
}

export default function StatusBadge({ status, colors }: StatusBadgeProps) {
  const getStatusColors = () => {
    const normalizedStatus = status?.toLowerCase() || '';
    
    switch (normalizedStatus) {
      case 'paid':
        return { 
          bg: (colors.success || colors.primary) + '20', 
          border: colors.success || colors.primary, 
          text: colors.success || colors.primary 
        };
      case 'pending':
        return { 
          bg: (colors.warning || colors.accent) + '20', 
          border: colors.warning || colors.accent, 
          text: colors.warning || colors.accent 
        };
      case 'overdue':
        return { 
          bg: colors.destructive + '20', 
          border: colors.destructive, 
          text: colors.destructive 
        };
      default:
        return { 
          bg: colors.muted, 
          border: colors.border, 
          text: colors.mutedForeground 
        };
    }
  };

  const statusColors = getStatusColors();

  // Handle empty or null status
  const displayStatus = status || 'Unknown';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusColors.bg,
          borderColor: statusColors.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: statusColors.text }]}>
        {displayStatus}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
