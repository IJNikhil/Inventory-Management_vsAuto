import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './part-detail-styles';

interface PartNotFoundProps {
  onBackPress: () => void;
}

export function PartNotFound({ onBackPress }: PartNotFoundProps) {
  const colors = useColors();

  return (
    <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>Part Not Found</Text>
      <Text style={[styles.notFoundSubtitle, { color: colors.mutedForeground }]}>
        The requested part could not be found.
      </Text>
      <TouchableOpacity
        onPress={onBackPress}
        style={[styles.backPrimaryBtn, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
      >
        <ArrowLeft size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
        <Text style={[styles.backPrimaryBtnText, { color: colors.primaryForeground }]}>
          Back to Inventory
        </Text>
      </TouchableOpacity>
    </View>
  );
}
