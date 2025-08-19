import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './part-detail-styles';

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  isHighlight?: boolean;
}

export function InfoItem({ 
  icon: Icon, 
  label, 
  value, 
  isHighlight = false 
}: InfoItemProps) {
  const colors = useColors();

  return (
    <View style={styles.infoItem}>
      <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
        <Icon size={18} color={colors.mutedForeground} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[
          styles.infoValue, 
          { color: isHighlight ? colors.primary : colors.foreground },
          isHighlight && styles.infoValueHighlight
        ]}>
          {value}
        </Text>
      </View>
    </View>
  );
}
